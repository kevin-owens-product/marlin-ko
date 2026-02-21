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
 * GET /api/audit-logs
 *
 * List audit log entries for the current tenant. Requires ADMIN role.
 *
 * Query params:
 * - userId: filter by acting user
 * - action: filter by action type (CREATED, UPDATED, DELETED, etc.)
 * - entityType: filter by entity type (Invoice, Payment, etc.)
 * - entityId: filter by specific entity
 * - startDate: ISO date string, logs after this date
 * - endDate: ISO date string, logs before this date
 * - page: page number (default: 1)
 * - limit: items per page (default: 50, max: 100)
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

    // Only ADMIN can view audit logs
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions. Admin role required." },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10))
    );

    // ── Build where clause ───────────────────────────────────────
    const where: Record<string, unknown> = { tenantId: user.tenantId };

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (startDate || endDate) {
      const timestamp: Record<string, Date> = {};
      if (startDate) {
        timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        timestamp.lte = new Date(endDate);
      }
      where.timestamp = timestamp;
    }

    // ── Execute queries ──────────────────────────────────────────
    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Parse JSON details field
    const data = logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
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
    console.error("[API] GET /api/audit-logs error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit-logs
 *
 * Create an audit log entry. Auto-sets userId and tenantId from session.
 *
 * Body: {
 *   action: string,
 *   entityType: string,
 *   entityId: string,
 *   details?: object,
 *   ipAddress?: string
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

    const body = await request.json();
    const { action, entityType, entityId, details, ipAddress } = body as {
      action?: string;
      entityType?: string;
      entityId?: string;
      details?: unknown;
      ipAddress?: string;
    };

    // ── Validate required fields ─────────────────────────────────
    if (!action || !entityType || !entityId) {
      return NextResponse.json(
        {
          success: false,
          error: "action, entityType, and entityId are required",
        },
        { status: 400 }
      );
    }

    const validActions = [
      "CREATED",
      "UPDATED",
      "DELETED",
      "APPROVED",
      "REJECTED",
      "LOGIN",
      "EXPORT",
      "CONFIGURED",
    ];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid action. Must be one of: ${validActions.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ── Resolve IP address ───────────────────────────────────────
    const resolvedIp =
      ipAddress ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      null;

    // ── Create audit log ─────────────────────────────────────────
    const auditLog = await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action,
        entityType,
        entityId,
        details: details ? JSON.stringify(details) : null,
        ipAddress: resolvedIp,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...auditLog,
          details: auditLog.details ? JSON.parse(auditLog.details) : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] POST /api/audit-logs error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to create audit log" },
      { status: 500 }
    );
  }
}
