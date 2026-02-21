import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";
import { isValidWebhookEvent, WEBHOOK_EVENTS } from "@/lib/webhook-events";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "medius-dev-secret-change-in-production"
);

interface RouteParams {
  params: Promise<{ id: string }>;
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
 * GET /api/webhooks/[id]
 *
 * Get webhook detail including recent delivery history.
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

    const { id } = await params;

    const webhook = await prisma.webhook.findUnique({
      where: { id },
      include: {
        deliveryLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!webhook || webhook.tenantId !== user.tenantId) {
      return NextResponse.json(
        { success: false, error: "Webhook not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...webhook,
        events: JSON.parse(webhook.events) as string[],
        secret: `${webhook.secret.slice(0, 8)}${"*".repeat(24)}`,
        deliveryLogs: webhook.deliveryLogs.map((d: { payload: string;[key: string]: unknown }) => ({
          ...d,
          payload: JSON.parse(d.payload),
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] GET /api/webhooks/[id] error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch webhook" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/webhooks/[id]
 *
 * Update an existing webhook.
 *
 * Body (all optional): { url?, events?, isActive?, secret? }
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
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.webhook.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== user.tenantId) {
      return NextResponse.json(
        { success: false, error: "Webhook not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // ── Validate and apply URL ───────────────────────────────────
    if (body.url !== undefined) {
      try {
        const parsed = new URL(body.url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return NextResponse.json(
            { success: false, error: "URL must use HTTP or HTTPS protocol" },
            { status: 400 }
          );
        }
        updateData.url = body.url;
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid URL format" },
          { status: 400 }
        );
      }
    }

    // ── Validate and apply events ────────────────────────────────
    if (body.events !== undefined) {
      if (!Array.isArray(body.events) || body.events.length === 0) {
        return NextResponse.json(
          { success: false, error: "At least one event type is required" },
          { status: 400 }
        );
      }

      const invalidEvents = (body.events as string[]).filter(
        (e) => !isValidWebhookEvent(e)
      );
      if (invalidEvents.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid event types: ${invalidEvents.join(", ")}`,
            details: `Valid events: ${Object.keys(WEBHOOK_EVENTS).join(", ")}`,
          },
          { status: 400 }
        );
      }

      updateData.events = JSON.stringify(body.events);
    }

    // ── Apply other fields ───────────────────────────────────────
    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    if (body.secret !== undefined) {
      updateData.secret = body.secret;
    }

    // Reset fail count if re-activating
    if (body.isActive === true && existing.failureCount > 0) {
      updateData.failureCount = 0;
    }

    const webhook = await prisma.webhook.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...webhook,
        events: JSON.parse(webhook.events) as string[],
        secret: `${webhook.secret.slice(0, 8)}${"*".repeat(24)}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] PUT /api/webhooks/[id] error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to update webhook" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/webhooks/[id]
 *
 * Delete a webhook and all its delivery records.
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
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.webhook.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== user.tenantId) {
      return NextResponse.json(
        { success: false, error: "Webhook not found" },
        { status: 404 }
      );
    }

    // Deliveries are cascaded via onDelete: Cascade
    await prisma.webhook.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: `Webhook ${id} deleted successfully` },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] DELETE /api/webhooks/[id] error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to delete webhook" },
      { status: 500 }
    );
  }
}
