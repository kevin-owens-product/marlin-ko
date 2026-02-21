import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";
import type { UserRole } from "@/lib/auth";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "medius-dev-secret-change-in-production"
);

const ROLE_HIERARCHY: Record<string, number> = {
  ADMIN: 4,
  APPROVER: 3,
  AP_CLERK: 2,
  VIEWER: 1,
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
 * Check if user has at least the required role level.
 */
function hasRole(userRole: string, requiredRole: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}

/**
 * Convert an array of objects to CSV format.
 */
function toCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return "";
        const str = String(value);
        // Escape fields containing commas, quotes, or newlines
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

type EntityType =
  | "invoices"
  | "payments"
  | "suppliers"
  | "expenses"
  | "audit-logs"
  | "purchase-orders";

type ExportFormat = "csv" | "json";

interface ExportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
  userId?: string;
  action?: string;
  entityType?: string;
}

/**
 * POST /api/export
 *
 * Export data as CSV or JSON download.
 *
 * Body: {
 *   entityType: "invoices" | "payments" | "suppliers" | "expenses" | "audit-logs" | "purchase-orders",
 *   format: "csv" | "json",
 *   filters?: { startDate?, endDate?, status?, ... }
 * }
 *
 * Requires at least AP_CLERK role.
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

    // Require at least AP_CLERK role
    if (!hasRole(user.role, "AP_CLERK")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions. AP_CLERK role or higher required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { entityType, format, filters } = body as {
      entityType?: EntityType;
      format?: ExportFormat;
      filters?: ExportFilters;
    };

    // ── Validate inputs ──────────────────────────────────────────
    const validEntityTypes: EntityType[] = [
      "invoices",
      "payments",
      "suppliers",
      "expenses",
      "audit-logs",
      "purchase-orders",
    ];
    if (!entityType || !validEntityTypes.includes(entityType)) {
      return NextResponse.json(
        {
          success: false,
          error: `entityType is required and must be one of: ${validEntityTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const validFormats: ExportFormat[] = ["csv", "json"];
    if (!format || !validFormats.includes(format)) {
      return NextResponse.json(
        {
          success: false,
          error: `format is required and must be one of: ${validFormats.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ── Fetch data based on entity type ──────────────────────────
    let data: Record<string, unknown>[];

    switch (entityType) {
      case "invoices": {
        const where: Record<string, unknown> = {
          tenantId: user.tenantId,
        };
        if (filters?.status) where.status = filters.status;
        if (filters?.startDate || filters?.endDate) {
          const createdAt: Record<string, Date> = {};
          if (filters.startDate) createdAt.gte = new Date(filters.startDate);
          if (filters.endDate) createdAt.lte = new Date(filters.endDate);
          where.createdAt = createdAt;
        }

        const invoices = await prisma.invoice.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 10000, // Safety limit
        });
        data = invoices.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          vendorName: inv.vendorName,
          totalAmount: inv.totalAmount,
          currency: inv.currency,
          status: inv.status,
          sourceType: inv.sourceType,
          dueDate: inv.dueDate?.toISOString() || "",
          paymentMethod: inv.paymentMethod,
          createdAt: inv.createdAt.toISOString(),
          updatedAt: inv.updatedAt.toISOString(),
        }));
        break;
      }

      case "payments": {
        const where: Record<string, unknown> = {
          batch: { tenantId: user.tenantId },
        };
        if (filters?.status) where.status = filters.status;
        if (filters?.startDate || filters?.endDate) {
          const createdAt: Record<string, Date> = {};
          if (filters.startDate) createdAt.gte = new Date(filters.startDate);
          if (filters.endDate) createdAt.lte = new Date(filters.endDate);
          where.createdAt = createdAt;
        }

        const payments = await prisma.paymentTransaction.findMany({
          where,
          include: {
            batch: { select: { method: true, tenantId: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10000,
        });
        data = payments.map((pmt) => ({
          id: pmt.id,
          batchId: pmt.batchId,
          invoiceId: pmt.invoiceId,
          amount: pmt.amount,
          currency: pmt.currency,
          status: pmt.status,
          reference: pmt.reference,
          method: pmt.batch.method,
          processedAt: pmt.processedAt?.toISOString() || "",
          createdAt: pmt.createdAt.toISOString(),
        }));
        break;
      }

      case "suppliers": {
        const where: Record<string, unknown> = {};
        if (filters?.status) where.complianceStatus = filters.status;
        if (filters?.category) where.category = filters.category;

        const suppliers = await prisma.tradingPartner.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 10000,
        });
        data = suppliers.map((sup) => ({
          id: sup.id,
          name: sup.name,
          email: sup.email,
          taxId: sup.taxId,
          category: sup.category,
          riskScore: sup.riskScore,
          paymentTerms: sup.paymentTerms,
          complianceStatus: sup.complianceStatus,
          isActive: sup.isActive,
          createdAt: sup.createdAt.toISOString(),
        }));
        break;
      }

      case "expenses": {
        const where: Record<string, unknown> = {
          tenantId: user.tenantId,
        };
        if (filters?.status) where.status = filters.status;
        if (filters?.category) where.category = filters.category;
        if (filters?.userId) where.userId = filters.userId;
        if (filters?.startDate || filters?.endDate) {
          const expenseDate: Record<string, Date> = {};
          if (filters.startDate)
            expenseDate.gte = new Date(filters.startDate);
          if (filters.endDate) expenseDate.lte = new Date(filters.endDate);
          where.expenseDate = expenseDate;
        }

        const expenses = await prisma.expense.findMany({
          where,
          include: {
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10000,
        });
        data = expenses.map((exp) => ({
          id: exp.id,
          userName: exp.user.name,
          userEmail: exp.user.email,
          category: exp.category,
          amount: exp.amount,
          currency: exp.currency,
          merchant: exp.merchant,
          description: exp.description,
          status: exp.status,
          project: exp.project,
          costCenter: exp.costCenter,
          expenseDate: exp.expenseDate.toISOString(),
          createdAt: exp.createdAt.toISOString(),
        }));
        break;
      }

      case "audit-logs": {
        // Audit log export requires ADMIN role
        if (user.role !== "ADMIN") {
          return NextResponse.json(
            {
              success: false,
              error: "ADMIN role required to export audit logs",
            },
            { status: 403 }
          );
        }

        const where: Record<string, unknown> = {
          tenantId: user.tenantId,
        };
        if (filters?.userId) where.userId = filters.userId;
        if (filters?.action) where.action = filters.action;
        if (filters?.entityType) where.entityType = filters.entityType;
        if (filters?.startDate || filters?.endDate) {
          const timestamp: Record<string, Date> = {};
          if (filters.startDate)
            timestamp.gte = new Date(filters.startDate);
          if (filters.endDate) timestamp.lte = new Date(filters.endDate);
          where.timestamp = timestamp;
        }

        const logs = await prisma.auditLog.findMany({
          where,
          include: {
            user: { select: { name: true, email: true } },
          },
          orderBy: { timestamp: "desc" },
          take: 10000,
        });
        data = logs.map((log) => ({
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          userName: log.user?.name || "System",
          userEmail: log.user?.email || "",
          details: log.details || "",
          ipAddress: log.ipAddress || "",
          timestamp: log.timestamp.toISOString(),
        }));
        break;
      }

      case "purchase-orders": {
        const where: Record<string, unknown> = {
          tenantId: user.tenantId,
        };
        if (filters?.status) where.status = filters.status;
        if (filters?.startDate || filters?.endDate) {
          const createdAt: Record<string, Date> = {};
          if (filters.startDate) createdAt.gte = new Date(filters.startDate);
          if (filters.endDate) createdAt.lte = new Date(filters.endDate);
          where.createdAt = createdAt;
        }

        const pos = await prisma.purchaseOrder.findMany({
          where,
          include: {
            supplier: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10000,
        });
        data = pos.map((po) => ({
          id: po.id,
          poNumber: po.poNumber,
          supplierName: po.supplier.name,
          totalAmount: po.totalAmount,
          currency: po.currency,
          status: po.status,
          description: po.description,
          createdAt: po.createdAt.toISOString(),
          updatedAt: po.updatedAt.toISOString(),
        }));
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: "Unsupported entity type" },
          { status: 400 }
        );
    }

    // ── Create audit log entry for this export ───────────────────
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: "EXPORT",
          entityType: entityType,
          entityId: `export-${Date.now()}`,
          details: JSON.stringify({
            format,
            recordCount: data.length,
            filters: filters || {},
          }),
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            null,
        },
      });
    } catch (auditError) {
      // Audit logging failure should not block the export
      console.error("[API] Failed to create audit log for export:", auditError);
    }

    // ── Format and return response ───────────────────────────────
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${entityType}-export-${timestamp}`;

    if (format === "csv") {
      const csvContent = toCSV(data);
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    }

    // JSON format
    const jsonContent = JSON.stringify(
      { exportedAt: new Date().toISOString(), recordCount: data.length, data },
      null,
      2
    );
    return new NextResponse(jsonContent, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.json"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] POST /api/export error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to export data" },
      { status: 500 }
    );
  }
}
