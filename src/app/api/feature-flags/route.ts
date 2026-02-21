import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "medius-dev-secret-change-in-production"
);

/**
 * Extract and verify the current user from the session cookie.
 */
async function getSessionUser(request: NextRequest) {
  const token = request.cookies.get("medius_session")?.value;
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
 * GET /api/feature-flags
 *
 * List all feature flags. Admin only.
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

    const flags = await prisma.featureFlag.findMany({
      orderBy: { key: "asc" },
    });

    const data = flags.map((flag) => ({
      ...flag,
      tenantIds: flag.tenantIds
        ? JSON.parse(flag.tenantIds)
        : [],
      plans: flag.plans
        ? JSON.parse(flag.plans)
        : [],
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] GET /api/feature-flags error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feature flags" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feature-flags
 *
 * Create a new feature flag. Admin only.
 *
 * Body: {
 *   key: string,
 *   name: string,
 *   description?: string,
 *   isEnabled?: boolean,
 *   plans?: string[],
 *   tenantIds?: string[]
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
    const { key, name, description, isEnabled, plans, tenantIds } =
      body as {
        key?: string;
        name?: string;
        description?: string;
        isEnabled?: boolean;
        plans?: string[];
        tenantIds?: string[];
      };

    // ── Validate required fields ─────────────────────────────────
    if (!key || !name) {
      return NextResponse.json(
        { success: false, error: "key and name are required" },
        { status: 400 }
      );
    }

    // Validate key format (lowercase alphanumeric with dots/underscores/dashes)
    if (!/^[a-z0-9][a-z0-9._-]*[a-z0-9]$/.test(key) && key.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Key must be lowercase alphanumeric with dots, underscores, or dashes",
        },
        { status: 400 }
      );
    }

    // Validate plans if provided
    const validPlans = ["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"];
    if (plans && plans.length > 0) {
      const invalidPlans = plans.filter((p: string) => !validPlans.includes(p));
      if (invalidPlans.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid plans: ${invalidPlans.join(", ")}. Must be one of: ${validPlans.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    // Check for existing key
    const existing = await prisma.featureFlag.findUnique({
      where: { key },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A feature flag with this key already exists" },
        { status: 409 }
      );
    }

    const flag = await prisma.featureFlag.create({
      data: {
        key,
        name,
        description: description || null,
        isEnabled: isEnabled ?? false,
        plans: plans && plans.length > 0
          ? JSON.stringify(plans)
          : null,
        tenantIds: tenantIds && tenantIds.length > 0
          ? JSON.stringify(tenantIds)
          : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...flag,
          tenantIds: flag.tenantIds
            ? JSON.parse(flag.tenantIds)
            : [],
          plans: flag.plans
            ? JSON.parse(flag.plans)
            : [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] POST /api/feature-flags error:", message);

    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { success: false, error: "A feature flag with this key already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create feature flag" },
      { status: 500 }
    );
  }
}
