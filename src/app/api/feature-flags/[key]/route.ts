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
 * Plan hierarchy for checking plan requirements.
 */
const PLAN_HIERARCHY: Record<string, number> = {
  FREE: 0,
  STARTER: 1,
  PROFESSIONAL: 2,
  ENTERPRISE: 3,
};

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

    // 1. Check tenant-specific override first (highest priority)
    const overrides: Record<string, boolean> = flag.tenantOverrides
      ? JSON.parse(flag.tenantOverrides)
      : {};

    if (user.tenantId in overrides) {
      return NextResponse.json({
        success: true,
        data: {
          key: flag.key,
          name: flag.name,
          enabled: overrides[user.tenantId],
          reason: "tenant_override",
        },
      });
    }

    // 2. Check plan requirement
    if (flag.planRequirement) {
      // Fetch tenant plan
      const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { plan: true },
      });

      const tenantPlanLevel = PLAN_HIERARCHY[tenant?.plan || "FREE"] ?? 0;
      const requiredPlanLevel = PLAN_HIERARCHY[flag.planRequirement] ?? 0;

      if (tenantPlanLevel < requiredPlanLevel) {
        return NextResponse.json({
          success: true,
          data: {
            key: flag.key,
            name: flag.name,
            enabled: false,
            reason: "plan_requirement_not_met",
            requiredPlan: flag.planRequirement,
            currentPlan: tenant?.plan || "FREE",
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
 *   planRequirement?: string | null,
 *   tenantOverrides?: Record<string, boolean>
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

    if (body.planRequirement !== undefined) {
      if (body.planRequirement === null) {
        updateData.planRequirement = null;
      } else {
        const validPlans = ["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"];
        if (!validPlans.includes(body.planRequirement)) {
          return NextResponse.json(
            {
              success: false,
              error: `planRequirement must be one of: ${validPlans.join(", ")} or null`,
            },
            { status: 400 }
          );
        }
        updateData.planRequirement = body.planRequirement;
      }
    }

    if (body.tenantOverrides !== undefined) {
      if (body.tenantOverrides === null) {
        updateData.tenantOverrides = null;
      } else if (typeof body.tenantOverrides === "object") {
        // Merge with existing overrides
        const currentOverrides: Record<string, boolean> = existing.tenantOverrides
          ? JSON.parse(existing.tenantOverrides)
          : {};
        const merged = { ...currentOverrides, ...body.tenantOverrides };

        // Remove entries set to null (allows deletion of overrides)
        for (const [k, v] of Object.entries(merged)) {
          if (v === null || v === undefined) {
            delete merged[k];
          }
        }

        updateData.tenantOverrides = JSON.stringify(merged);
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
        tenantOverrides: flag.tenantOverrides
          ? JSON.parse(flag.tenantOverrides)
          : {},
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
