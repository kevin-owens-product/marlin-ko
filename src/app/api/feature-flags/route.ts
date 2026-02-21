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
      tenantOverrides: flag.tenantOverrides
        ? JSON.parse(flag.tenantOverrides)
        : {},
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
 *   planRequirement?: string,
 *   tenantOverrides?: Record<string, boolean>
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
    const { key, name, description, isEnabled, planRequirement, tenantOverrides } =
      body as {
        key?: string;
        name?: string;
        description?: string;
        isEnabled?: boolean;
        planRequirement?: string;
        tenantOverrides?: Record<string, boolean>;
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

    // Validate plan requirement if provided
    const validPlans = ["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"];
    if (planRequirement && !validPlans.includes(planRequirement)) {
      return NextResponse.json(
        {
          success: false,
          error: `planRequirement must be one of: ${validPlans.join(", ")}`,
        },
        { status: 400 }
      );
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
        planRequirement: planRequirement || null,
        tenantOverrides: tenantOverrides
          ? JSON.stringify(tenantOverrides)
          : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...flag,
          tenantOverrides: flag.tenantOverrides
            ? JSON.parse(flag.tenantOverrides)
            : {},
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
