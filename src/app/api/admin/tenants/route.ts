import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "medius-dev-secret-change-in-production"
);

/**
 * Extract and verify the current user from the session cookie or
 * Authorization header.
 */
async function getSessionUser(request: NextRequest) {
  let token = request.cookies.get("medius_session")?.value;

  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as {
      userId: string;
      email: string;
      name: string;
      role: string;
      tenantId: string;
    };
  } catch {
    return null;
  }
}

/**
 * Hash a password using Web Crypto API (PBKDF2 + SHA-256).
 * Identical to the implementation in the auth/register route.
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${saltHex}:${hashHex}`;
}

// ─── Valid plan values ────────────────────────────────────────
const VALID_PLANS = ["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"];

/**
 * GET /api/admin/tenants
 *
 * List all tenants with user counts, invoice counts, and plan info.
 * Only accessible by ADMIN role users.
 *
 * Query params:
 * - search: search by tenant name or slug
 * - plan: filter by plan (FREE, STARTER, PROFESSIONAL, ENTERPRISE)
 * - status: "active" or "inactive"
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions. Admin role required." },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const plan = searchParams.get("plan");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );

    // ── Build where clause ───────────────────────────────────
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (plan && VALID_PLANS.includes(plan)) {
      where.plan = plan;
    }

    if (status === "active") {
      where.isActive = true;
      where.deletedAt = null;
    } else if (status === "inactive") {
      where.OR = [
        { isActive: false },
        { deletedAt: { not: null } },
      ];
    }

    // ── Execute queries ──────────────────────────────────────
    const [tenants, totalCount] = await Promise.all([
      prisma.tenant.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
              invoices: true,
              webhooks: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tenant.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // NOTE: Some Tenant fields (domain, deletedAt, logoUrl, brandColor) are
    // defined in the Prisma schema but the generated client may not yet include
    // them. We cast to `any` to access these fields safely until `prisma generate`
    // is re-run against the updated schema.
    const data = tenants.map((tenant: any) => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      isActive: tenant.isActive,
      domain: tenant.domain ?? null,
      deletedAt: tenant.deletedAt ?? null,
      createdAt: tenant.createdAt,
      userCount: tenant._count.users,
      invoiceCount: tenant._count.invoices,
      webhookCount: tenant._count.webhooks,
      settings: tenant.settings ? JSON.parse(tenant.settings) : null,
    }));

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] GET /api/admin/tenants error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tenants
 *
 * Create a new tenant along with its first admin user.
 * Only accessible by ADMIN role users.
 *
 * Body: {
 *   name: string,
 *   slug: string,
 *   plan?: string,
 *   adminEmail: string,
 *   adminName: string,
 *   adminPassword?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions. Admin role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, slug, plan, adminEmail, adminName, adminPassword } = body as {
      name?: string;
      slug?: string;
      plan?: string;
      adminEmail?: string;
      adminName?: string;
      adminPassword?: string;
    };

    // ── Validate required fields ─────────────────────────────
    if (!name || !adminEmail || !adminName) {
      return NextResponse.json(
        {
          success: false,
          error: "name, adminEmail, and adminName are required",
        },
        { status: 400 }
      );
    }

    // ── Validate email format ────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // ── Validate plan ────────────────────────────────────────
    const tenantPlan = plan || "PROFESSIONAL";
    if (!VALID_PLANS.includes(tenantPlan)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid plan. Must be one of: ${VALID_PLANS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ── Generate slug if not provided ────────────────────────
    const tenantSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // ── Check slug uniqueness ────────────────────────────────
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (existingTenant) {
      return NextResponse.json(
        {
          success: false,
          error: `A tenant with slug '${tenantSlug}' already exists`,
        },
        { status: 409 }
      );
    }

    // ── Check admin email uniqueness ─────────────────────────
    const normalizedEmail = adminEmail.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this admin email already exists" },
        { status: 409 }
      );
    }

    // ── Hash admin password ──────────────────────────────────
    const password = adminPassword || crypto.randomUUID().slice(0, 16);
    const passwordHash = await hashPassword(password);

    // ── Create tenant and admin user in a transaction ────────
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug: tenantSlug,
          plan: tenantPlan,
          isActive: true,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: adminName,
          role: "ADMIN",
          tenantId: tenant.id,
          passwordHash,
          isActive: true,
        },
      });

      return { tenant, adminUser };
    });

    // ── Generate token for the new admin ─────────────────────
    const token = await new SignJWT({
      userId: result.adminUser.id,
      email: result.adminUser.email,
      name: result.adminUser.name,
      role: result.adminUser.role,
      tenantId: result.tenant.id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    return NextResponse.json(
      {
        success: true,
        data: {
          tenant: {
            id: result.tenant.id,
            name: result.tenant.name,
            slug: result.tenant.slug,
            plan: result.tenant.plan,
            isActive: result.tenant.isActive,
            createdAt: result.tenant.createdAt,
          },
          adminUser: {
            id: result.adminUser.id,
            email: result.adminUser.email,
            name: result.adminUser.name,
            role: result.adminUser.role,
          },
          // Include the generated password if one was auto-generated
          ...(adminPassword ? {} : { generatedPassword: password }),
          token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] POST /api/admin/tenants error:", message);

    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { success: false, error: "A tenant with this slug or admin email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create tenant" },
      { status: 500 }
    );
  }
}
