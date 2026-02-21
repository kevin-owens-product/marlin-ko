import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";

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
 * GET /api/admin/stats
 *
 * Returns system-wide statistics for the admin dashboard.
 *
 * Response shape:
 * {
 *   tenants: { total, active, byPlan },
 *   users: { total, active, activeToday, byRole },
 *   invoices: { total, today, thisMonth, byStatus },
 *   payments: { totalAmount, thisMonth, pending },
 *   system: { activeSessionCount, uptimeSeconds }
 * }
 *
 * Only accessible by ADMIN role users.
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

    // ── Date boundaries ──────────────────────────────────────
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // ── Tenant statistics ────────────────────────────────────
    const [
      totalTenants,
      activeTenants,
      tenantsByPlan,
    ] = await Promise.all([
      prisma.tenant.count(),
      // NOTE: deletedAt is defined in the Prisma schema but the generated
      // client may not yet include it. Cast to any to avoid build errors
      // until `prisma generate` is re-run against the updated schema.
      prisma.tenant.count({
        where: { isActive: true, deletedAt: null } as any,
      }),
      prisma.tenant.groupBy({
        by: ["plan"],
        _count: { id: true },
      }),
    ]);

    const byPlan: Record<string, number> = {
      FREE: 0,
      STARTER: 0,
      PROFESSIONAL: 0,
      ENTERPRISE: 0,
    };
    for (const entry of tenantsByPlan) {
      byPlan[entry.plan] = entry._count.id;
    }

    // ── User statistics ──────────────────────────────────────
    const [
      totalUsers,
      activeUsers,
      activeTodayUsers,
      usersByRole,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          lastLoginAt: { gte: startOfToday },
        },
      }),
      prisma.user.groupBy({
        by: ["role"],
        _count: { id: true },
      }),
    ]);

    const byRole: Record<string, number> = {};
    for (const entry of usersByRole) {
      byRole[entry.role] = entry._count.id;
    }

    // ── Invoice statistics ───────────────────────────────────
    const [
      totalInvoices,
      invoicesToday,
      invoicesThisMonth,
      invoicesByStatus,
    ] = await Promise.all([
      prisma.invoice.count(),
      prisma.invoice.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      prisma.invoice.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.invoice.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    for (const entry of invoicesByStatus) {
      byStatus[entry.status] = entry._count.id;
    }

    // ── Payment statistics ───────────────────────────────────
    const [
      paymentTotals,
      paymentsThisMonth,
      pendingPayments,
    ] = await Promise.all([
      prisma.paymentTransaction.aggregate({
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.paymentTransaction.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.paymentTransaction.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: "PENDING" },
      }),
    ]);

    // ── System statistics ────────────────────────────────────
    const activeSessionCount = await prisma.session.count({
      where: { expiresAt: { gt: now } },
    });

    return NextResponse.json({
      success: true,
      data: {
        tenants: {
          total: totalTenants,
          active: activeTenants,
          byPlan,
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          activeToday: activeTodayUsers,
          byRole,
        },
        invoices: {
          total: totalInvoices,
          today: invoicesToday,
          thisMonth: invoicesThisMonth,
          byStatus,
        },
        payments: {
          totalAmount: paymentTotals._sum.amount || 0,
          totalCount: paymentTotals._count.id,
          thisMonth: {
            amount: paymentsThisMonth._sum.amount || 0,
            count: paymentsThisMonth._count.id,
          },
          pending: {
            amount: pendingPayments._sum.amount || 0,
            count: pendingPayments._count.id,
          },
        },
        system: {
          activeSessionCount,
          timestamp: now.toISOString(),
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] GET /api/admin/stats error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch system statistics" },
      { status: 500 }
    );
  }
}
