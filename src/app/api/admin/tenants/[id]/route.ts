import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "medius-dev-secret-change-in-production"
);

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

// ─── Valid plan values ────────────────────────────────────────
const VALID_PLANS = ["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"];

// NOTE: Some Tenant fields (domain, deletedAt, logoUrl, brandColor,
// tenantBranding) are defined in the Prisma schema but the generated Prisma
// client may not yet include them. We use `as any` in strategic places to
// avoid build errors until `prisma generate` is re-run against the updated
// schema. Remove the `as any` casts once the client has been regenerated.

/**
 * GET /api/admin/tenants/[id]
 *
 * Retrieve full details for a specific tenant, including aggregate
 * counts for users, invoices, expenses, and recent activity.
 *
 * Only accessible by ADMIN role users.
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

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions. Admin role required." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const tenant: any = await (prisma.tenant as any).findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            invoices: true,
            expenses: true,
            purchaseOrders: true,
            contracts: true,
            paymentBatches: true,
            webhooks: true,
            auditLogs: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        tenantBranding: true,
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Tenant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        isActive: tenant.isActive,
        domain: tenant.domain ?? null,
        logoUrl: tenant.logoUrl ?? null,
        brandColor: tenant.brandColor ?? null,
        settings: tenant.settings ? JSON.parse(tenant.settings) : null,
        branding: tenant.branding ? JSON.parse(tenant.branding) : null,
        deletedAt: tenant.deletedAt ?? null,
        createdAt: tenant.createdAt,
        tenantBranding: tenant.tenantBranding ?? null,
        counts: tenant._count,
        users: tenant.users,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] GET /api/admin/tenants/[id] error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tenant" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/tenants/[id]
 *
 * Update a tenant's properties: name, plan, settings, active status, etc.
 * Only accessible by ADMIN role users.
 *
 * Body (all optional): {
 *   name?: string,
 *   plan?: string,
 *   isActive?: boolean,
 *   settings?: object,
 *   domain?: string,
 *   logoUrl?: string,
 *   brandColor?: string
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

    const { id } = await params;

    const existing: any = await prisma.tenant.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Tenant not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // ── Name ──────────────────────────────────────────────────
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "Name must be a non-empty string" },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    // ── Plan ──────────────────────────────────────────────────
    if (body.plan !== undefined) {
      if (!VALID_PLANS.includes(body.plan)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid plan. Must be one of: ${VALID_PLANS.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updateData.plan = body.plan;
    }

    // ── Active status ─────────────────────────────────────────
    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    // ── Settings (JSON) ───────────────────────────────────────
    if (body.settings !== undefined) {
      if (body.settings === null) {
        updateData.settings = null;
      } else if (typeof body.settings === "object") {
        // Merge with existing settings
        const currentSettings = existing.settings
          ? JSON.parse(existing.settings)
          : {};
        updateData.settings = JSON.stringify({
          ...currentSettings,
          ...body.settings,
        });
      }
    }

    // ── Domain ────────────────────────────────────────────────
    if (body.domain !== undefined) {
      updateData.domain = body.domain || null;
    }

    // ── Logo URL ──────────────────────────────────────────────
    if (body.logoUrl !== undefined) {
      updateData.logoUrl = body.logoUrl || null;
    }

    // ── Brand color ───────────────────────────────────────────
    if (body.brandColor !== undefined) {
      updateData.brandColor = body.brandColor || null;
    }

    const tenant: any = await (prisma.tenant as any).update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            users: true,
            invoices: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        isActive: tenant.isActive,
        domain: tenant.domain ?? null,
        logoUrl: tenant.logoUrl ?? null,
        brandColor: tenant.brandColor ?? null,
        settings: tenant.settings ? JSON.parse(tenant.settings) : null,
        deletedAt: tenant.deletedAt ?? null,
        createdAt: tenant.createdAt,
        userCount: tenant._count.users,
        invoiceCount: tenant._count.invoices,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] PUT /api/admin/tenants/[id] error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to update tenant" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tenants/[id]
 *
 * Soft-delete a tenant by setting its `deletedAt` timestamp and
 * marking it as inactive. Does NOT permanently remove data.
 *
 * Only accessible by ADMIN role users.
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

    const { id } = await params;

    const existing: any = await prisma.tenant.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Tenant not found" },
        { status: 404 }
      );
    }

    if (existing.deletedAt) {
      return NextResponse.json(
        { success: false, error: "Tenant has already been deleted" },
        { status: 409 }
      );
    }

    // Prevent deleting the tenant the admin belongs to
    if (id === user.tenantId) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own tenant" },
        { status: 400 }
      );
    }

    // ── Soft-delete: set deletedAt and deactivate ─────────────
    const tenant: any = await (prisma.tenant as any).update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    // ── Deactivate all users in the tenant ────────────────────
    await prisma.user.updateMany({
      where: { tenantId: id },
      data: { isActive: false },
    });

    // ── Record in audit log ───────────────────────────────────
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: "DELETED",
          entityType: "Tenant",
          entityId: id,
          details: JSON.stringify({
            tenantName: existing.name,
            tenantSlug: existing.slug,
            softDelete: true,
          }),
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            null,
        },
      });
    } catch {
      // Audit logging failure should not block the operation
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Tenant '${existing.name}' has been soft-deleted`,
        id: tenant.id,
        deletedAt: tenant.deletedAt ?? new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] DELETE /api/admin/tenants/[id] error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to delete tenant" },
      { status: 500 }
    );
  }
}
