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

/** Role hierarchy for permission checks. */
const ROLE_HIERARCHY: Record<string, number> = {
  ADMIN: 4,
  APPROVER: 3,
  AP_CLERK: 2,
  VIEWER: 1,
};

/** Valid bulk actions. */
type BulkAction = "approve" | "reject" | "pay" | "flag";

const VALID_ACTIONS: BulkAction[] = ["approve", "reject", "pay", "flag"];

/** Map of bulk actions to the resulting invoice status. */
const ACTION_STATUS_MAP: Record<BulkAction, string> = {
  approve: "approved",
  reject: "rejected",
  pay: "paid",
  flag: "flagged_for_review",
};

/** Minimum role required for each bulk action. */
const ACTION_ROLE_REQUIREMENTS: Record<BulkAction, string> = {
  approve: "APPROVER",
  reject: "APPROVER",
  pay: "ADMIN",
  flag: "AP_CLERK",
};

interface BulkResult {
  invoiceId: string;
  success: boolean;
  status?: string;
  error?: string;
}

/**
 * POST /api/invoices/bulk
 *
 * Perform a bulk operation on multiple invoices at once.
 *
 * Body: {
 *   action: "approve" | "reject" | "pay" | "flag",
 *   invoiceIds: string[],
 *   reason?: string
 * }
 *
 * Returns: {
 *   processed: number,
 *   failed: number,
 *   results: Array<{ invoiceId, success, status?, error? }>
 * }
 *
 * Requires at least AP_CLERK role. Specific actions require higher roles:
 * - approve/reject: APPROVER or ADMIN
 * - pay: ADMIN only
 * - flag: AP_CLERK or higher
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
    const { action, invoiceIds, reason } = body as {
      action?: string;
      invoiceIds?: string[];
      reason?: string;
    };

    // ── Validate action ───────────────────────────────────────────
    if (!action || !VALID_ACTIONS.includes(action as BulkAction)) {
      return NextResponse.json(
        {
          success: false,
          error: `action is required and must be one of: ${VALID_ACTIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const bulkAction = action as BulkAction;

    // ── Validate invoiceIds ───────────────────────────────────────
    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "invoiceIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (invoiceIds.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot process more than 500 invoices at once",
        },
        { status: 400 }
      );
    }

    // Ensure all IDs are strings
    const validIds = invoiceIds.filter(
      (id) => typeof id === "string" && id.trim().length > 0
    );
    if (validIds.length !== invoiceIds.length) {
      return NextResponse.json(
        { success: false, error: "All invoiceIds must be non-empty strings" },
        { status: 400 }
      );
    }

    // ── Check role permissions ─────────────────────────────────────
    const requiredRole = ACTION_ROLE_REQUIREMENTS[bulkAction];
    const userRoleLevel = ROLE_HIERARCHY[user.role] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient permissions. The '${bulkAction}' action requires at least the ${requiredRole} role.`,
        },
        { status: 403 }
      );
    }

    // ── Fetch all invoices ────────────────────────────────────────
    const invoices = await prisma.invoice.findMany({
      where: {
        id: { in: validIds },
        tenantId: user.tenantId,
      },
      select: {
        id: true,
        status: true,
        invoiceNumber: true,
        totalAmount: true,
      },
    });

    const invoiceMap = new Map(invoices.map((inv) => [inv.id, inv]));

    // ── Process each invoice ──────────────────────────────────────
    const results: BulkResult[] = [];
    const newStatus = ACTION_STATUS_MAP[bulkAction];

    for (const invoiceId of validIds) {
      const invoice = invoiceMap.get(invoiceId);

      if (!invoice) {
        results.push({
          invoiceId,
          success: false,
          error: "Invoice not found or not in your tenant",
        });
        continue;
      }

      // Validate state transitions
      const stateError = validateStateTransition(
        invoice.status,
        bulkAction
      );
      if (stateError) {
        results.push({
          invoiceId,
          success: false,
          error: stateError,
        });
        continue;
      }

      try {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: newStatus,
            updatedBy: user.userId,
          },
        });

        results.push({
          invoiceId,
          success: true,
          status: newStatus,
        });
      } catch (updateError) {
        const updateMessage =
          updateError instanceof Error
            ? updateError.message
            : "Update failed";
        results.push({
          invoiceId,
          success: false,
          error: updateMessage,
        });
      }
    }

    const processed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    // ── Create audit log entry ────────────────────────────────────
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: bulkAction === "approve"
            ? "APPROVED"
            : bulkAction === "reject"
            ? "REJECTED"
            : "UPDATED",
          entityType: "Invoice",
          entityId: `bulk-${Date.now()}`,
          details: JSON.stringify({
            bulkAction,
            reason: reason || null,
            totalRequested: validIds.length,
            processed,
            failed,
            invoiceIds: validIds,
          }),
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            null,
        },
      });
    } catch {
      // Audit logging failure should not block the operation
      console.error(
        "[API] POST /api/invoices/bulk: failed to create audit log"
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        action: bulkAction,
        processed,
        failed,
        total: validIds.length,
        results,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] POST /api/invoices/bulk error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to process bulk operation" },
      { status: 500 }
    );
  }
}

/**
 * Validate whether a state transition is allowed for the given action.
 * Returns an error message if the transition is invalid, or null if it is valid.
 */
function validateStateTransition(
  currentStatus: string,
  action: BulkAction
): string | null {
  switch (action) {
    case "approve": {
      const approvableStatuses = [
        "extracted",
        "compliance_checked",
        "classified",
        "matched",
        "flagged_for_review",
      ];
      if (!approvableStatuses.includes(currentStatus)) {
        return `Cannot approve invoice with status '${currentStatus}'. Must be one of: ${approvableStatuses.join(", ")}`;
      }
      return null;
    }

    case "reject": {
      const rejectableStatuses = [
        "extracted",
        "compliance_checked",
        "classified",
        "matched",
        "flagged_for_review",
        "approved",
      ];
      if (!rejectableStatuses.includes(currentStatus)) {
        return `Cannot reject invoice with status '${currentStatus}'. Must be one of: ${rejectableStatuses.join(", ")}`;
      }
      return null;
    }

    case "pay": {
      if (currentStatus !== "approved") {
        return `Cannot pay invoice with status '${currentStatus}'. Invoice must be approved first.`;
      }
      return null;
    }

    case "flag": {
      const flaggableStatuses = [
        "ingested",
        "extracted",
        "compliance_checked",
        "classified",
        "matched",
        "approved",
      ];
      if (!flaggableStatuses.includes(currentStatus)) {
        return `Cannot flag invoice with status '${currentStatus}'. Must be one of: ${flaggableStatuses.join(", ")}`;
      }
      return null;
    }

    default:
      return `Unknown action: ${action}`;
  }
}
