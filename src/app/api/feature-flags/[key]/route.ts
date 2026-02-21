import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "medius-dev-secret-change-in-production"
);

interface RouteParams {
  params: Promise<{ key: string }>;
}

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
 * GET /api/feature-flags/[key]
 *
 * Check if a specific feature flag is enabled for the current tenant.
 * Considers: global enable state, tenant-specific overrides, and plan requirements.
 *
 * Returns: { enabled: boolean, flag: { ... } }
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { key } = await params;

    const flag = await prisma.featureFlag.findUnique({
      where: { key },
    });

    if (!flag) {
      return NextResponse.json(
        { success: false, error: "Feature flag not found" },
        { status: 404 }
      );
    }

    // ── Determine if enabled for this tenant ─────────────────────

    // 1. Check tenant-specific restriction first (highest priority)
    const tenantIds: string[] = flag.tenantIds
      ? JSON.parse(flag.tenantIds)
      : [];

    if (tenantIds.length > 0) {
      const tenantHasAccess = tenantIds.includes(user.tenantId);
      if (!tenantHasAccess) {
        return NextResponse.json({
          success: true,
          data: {
            key: flag.key,
            name: flag.name,
            enabled: false,
            reason: "tenant_not_included",
          },
        });
      }
    }

    // 2. Check plan requirement
    const plans: string[] = flag.plans
      ? JSON.parse(flag.plans)
      : [];

    if (plans.length > 0) {
      // Fetch tenant plan
      const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { plan: true },
      });

      const tenantPlan = tenant?.plan || "FREE";

      if (!plans.includes(tenantPlan)) {
        return NextResponse.json({
          success: true,
          data: {
            key: flag.key,
            name: flag.name,
            enabled: false,
            reason: "plan_not_included",
            allowedPlans: plans,
            currentPlan: tenantPlan,
          },
        });
      }
    }

    // 3. Fall back to global enable state
    return NextResponse.json({
      success: true,
      data: {
        key: flag.key,
        name: flag.name,
        enabled: flag.isEnabled,
        reason: "global",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] GET /api/feature-flags/[key] error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to check feature flag" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/feature-flags/[key]
 *
 * Update a feature flag. Admin only.
 *
 * Body (all optional): {
 *   name?: string,
 *   description?: string,
 *   isEnabled?: boolean,
 *   plans?: string[] | null,
 *   tenantIds?: string[] | null
 * }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { key } = await params;

    const existing = await prisma.featureFlag.findUnique({
      where: { key },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Feature flag not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.isEnabled !== undefined) {
      updateData.isEnabled = Boolean(body.isEnabled);
    }

    if (body.plans !== undefined) {
      if (body.plans === null) {
        updateData.plans = null;
      } else if (Array.isArray(body.plans)) {
        const validPlans = ["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"];
        const invalidPlans = body.plans.filter((p: string) => !validPlans.includes(p));
        if (invalidPlans.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid plans: ${invalidPlans.join(", ")}. Must be one of: ${validPlans.join(", ")}`,
            },
            { status: 400 }
          );
        }
        updateData.plans = body.plans.length > 0
          ? JSON.stringify(body.plans)
          : null;
      }
    }

    if (body.tenantIds !== undefined) {
      if (body.tenantIds === null) {
        updateData.tenantIds = null;
      } else if (Array.isArray(body.tenantIds)) {
        updateData.tenantIds = body.tenantIds.length > 0
          ? JSON.stringify(body.tenantIds)
          : null;
      }
    }

    const flag = await prisma.featureFlag.update({
      where: { key },
      data: updateData,
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] PUT /api/feature-flags/[key] error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to update feature flag" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/feature-flags/[key]
 *
 * Permanently remove a feature flag by its key.
 * Only ADMIN users are authorized to delete flags.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { key } = await params;

    const existing = await prisma.featureFlag.findUnique({
      where: { key },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Feature flag not found" },
        { status: 404 }
      );
    }

    await prisma.featureFlag.delete({ where: { key } });

    return NextResponse.json({
      success: true,
      data: { message: `Feature flag '${key}' deleted successfully` },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] DELETE /api/feature-flags/[key] error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to delete feature flag" },
      { status: 500 }
    );
  }
}
