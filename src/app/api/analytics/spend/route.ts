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

/** Valid period values and their corresponding number of days. */
const PERIOD_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

/** Valid groupBy values. */
const VALID_GROUP_BY = ["category", "supplier", "month"] as const;
type GroupBy = (typeof VALID_GROUP_BY)[number];

interface BreakdownEntry {
  name: string;
  amount: number;
  count: number;
  percentage: number;
}

interface TrendEntry {
  date: string;
  amount: number;
  count: number;
}

/**
 * GET /api/analytics/spend
 *
 * Aggregate spend analysis derived from invoice data.
 *
 * Query params:
 * - tenantId: optional tenant override (admin only)
 * - period: "7d" | "30d" | "90d" | "1y" (default: "30d")
 * - groupBy: "category" | "supplier" | "month" (default: "supplier")
 * - status: filter by invoice status (default: includes all terminal statuses)
 * - currency: filter by currency (default: "USD")
 *
 * Returns: {
 *   period, totalSpend, invoiceCount,
 *   breakdown: [{ name, amount, count, percentage }],
 *   trend: [{ date, amount, count }],
 *   averageInvoiceAmount, currency
 * }
 *
 * Requires at least VIEWER role (any authenticated user).
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

    const searchParams = request.nextUrl.searchParams;

    // ── Parse and validate period ──────────────────────────────────
    const periodParam = searchParams.get("period") || "30d";
    if (!(periodParam in PERIOD_DAYS)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid period. Must be one of: ${Object.keys(PERIOD_DAYS).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const days = PERIOD_DAYS[periodParam];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // ── Parse and validate groupBy ─────────────────────────────────
    const groupByParam = (searchParams.get("groupBy") || "supplier") as string;
    if (!VALID_GROUP_BY.includes(groupByParam as GroupBy)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid groupBy. Must be one of: ${VALID_GROUP_BY.join(", ")}`,
        },
        { status: 400 }
      );
    }
    const groupBy = groupByParam as GroupBy;

    // ── Tenant scoping ─────────────────────────────────────────────
    const tenantIdParam = searchParams.get("tenantId");
    let tenantId = user.tenantId;

    // Allow admin users to query other tenants
    if (tenantIdParam && tenantIdParam !== user.tenantId) {
      if (user.role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: "Insufficient permissions to query other tenants",
          },
          { status: 403 }
        );
      }
      tenantId = tenantIdParam;
    }

    const currency = searchParams.get("currency") || "USD";

    // ── Build base where clause ────────────────────────────────────
    const statusFilter = searchParams.get("status");
    const where: Record<string, unknown> = {
      tenantId,
      createdAt: { gte: startDate },
      totalAmount: { not: null },
      currency,
    };

    if (statusFilter) {
      where.status = statusFilter;
    } else {
      // By default, include invoices that have been processed
      where.status = {
        in: [
          "approved",
          "paid",
          "matched",
          "compliance_checked",
          "classified",
          "extracted",
          "flagged_for_review",
        ],
      };
    }

    // ── Fetch invoices for aggregation ──────────────────────────────
    const invoices = await prisma.invoice.findMany({
      where,
      select: {
        id: true,
        totalAmount: true,
        vendorName: true,
        costCenter: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // ── Calculate total spend ──────────────────────────────────────
    const totalSpend = invoices.reduce(
      (sum, inv) => sum + (inv.totalAmount || 0),
      0
    );
    const invoiceCount = invoices.length;
    const averageInvoiceAmount =
      invoiceCount > 0 ? totalSpend / invoiceCount : 0;

    // ── Build breakdown based on groupBy ───────────────────────────
    const breakdown: BreakdownEntry[] = buildBreakdown(
      invoices,
      groupBy,
      totalSpend
    );

    // ── Build trend data ──────────────────────────────────────────
    const trend: TrendEntry[] = buildTrend(invoices, days);

    return NextResponse.json({
      success: true,
      data: {
        period: periodParam,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        currency,
        totalSpend: roundToTwo(totalSpend),
        invoiceCount,
        averageInvoiceAmount: roundToTwo(averageInvoiceAmount),
        groupBy,
        breakdown,
        trend,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] GET /api/analytics/spend error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch spend analytics" },
      { status: 500 }
    );
  }
}

/**
 * Build breakdown entries grouped by the specified dimension.
 */
function buildBreakdown(
  invoices: Array<{
    totalAmount: number | null;
    vendorName: string | null;
    costCenter: string | null;
    createdAt: Date;
  }>,
  groupBy: GroupBy,
  totalSpend: number
): BreakdownEntry[] {
  const groups = new Map<string, { amount: number; count: number }>();

  for (const inv of invoices) {
    let key: string;

    switch (groupBy) {
      case "supplier":
        key = inv.vendorName || "Unknown Supplier";
        break;
      case "category":
        key = inv.costCenter || "Uncategorized";
        break;
      case "month": {
        const date = new Date(inv.createdAt);
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      }
      default:
        key = "Other";
    }

    const existing = groups.get(key) || { amount: 0, count: 0 };
    existing.amount += inv.totalAmount || 0;
    existing.count += 1;
    groups.set(key, existing);
  }

  // Convert map to sorted array
  const entries: BreakdownEntry[] = Array.from(groups.entries())
    .map(([name, data]) => ({
      name,
      amount: roundToTwo(data.amount),
      count: data.count,
      percentage:
        totalSpend > 0 ? roundToTwo((data.amount / totalSpend) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // For month grouping, sort chronologically
  if (groupBy === "month") {
    entries.sort((a, b) => a.name.localeCompare(b.name));
  }

  return entries;
}

/**
 * Build daily or weekly trend data depending on the period length.
 */
function buildTrend(
  invoices: Array<{
    totalAmount: number | null;
    createdAt: Date;
  }>,
  days: number
): TrendEntry[] {
  // Use daily buckets for periods up to 90 days, weekly for longer
  const useWeekly = days > 90;

  const buckets = new Map<string, { amount: number; count: number }>();

  // Pre-fill all buckets so there are no gaps
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  if (useWeekly) {
    // Generate weekly buckets
    const current = new Date(startDate);
    // Align to Monday
    current.setDate(current.getDate() - ((current.getDay() + 6) % 7));
    while (current <= now) {
      const key = formatDate(current);
      buckets.set(key, { amount: 0, count: 0 });
      current.setDate(current.getDate() + 7);
    }
  } else {
    // Generate daily buckets
    const current = new Date(startDate);
    while (current <= now) {
      const key = formatDate(current);
      buckets.set(key, { amount: 0, count: 0 });
      current.setDate(current.getDate() + 1);
    }
  }

  // Fill buckets with invoice data
  for (const inv of invoices) {
    const invDate = new Date(inv.createdAt);
    let key: string;

    if (useWeekly) {
      // Align to Monday of the invoice's week
      const aligned = new Date(invDate);
      aligned.setDate(aligned.getDate() - ((aligned.getDay() + 6) % 7));
      key = formatDate(aligned);
    } else {
      key = formatDate(invDate);
    }

    const bucket = buckets.get(key);
    if (bucket) {
      bucket.amount += inv.totalAmount || 0;
      bucket.count += 1;
    }
  }

  // Convert to array
  return Array.from(buckets.entries())
    .map(([date, data]) => ({
      date,
      amount: roundToTwo(data.amount),
      count: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Format a Date as YYYY-MM-DD string.
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Round a number to two decimal places.
 */
function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}
