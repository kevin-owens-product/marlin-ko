import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";
import { isValidWebhookEvent, WEBHOOK_EVENTS } from "@/lib/webhook-events";
import type { WebhookEvent } from "@/lib/webhook-events";

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
 * Generate a cryptographically random HMAC secret.
 */
function generateWebhookSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * GET /api/webhooks
 *
 * List all webhooks for the current user's tenant.
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

    const webhooks = await prisma.webhook.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
    });

    // Parse events JSON for each webhook
    const data = webhooks.map((wh) => ({
      ...wh,
      events: JSON.parse(wh.events) as string[],
      // Never expose the raw secret in list responses
      secret: `${wh.secret.slice(0, 8)}${"*".repeat(24)}`,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] GET /api/webhooks error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/webhooks
 *
 * Create a new webhook for the current tenant.
 *
 * Body: { url: string, events: string[], secret?: string }
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

    // Only admins can manage webhooks
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { url, events, secret } = body as {
      url?: string;
      events?: string[];
      secret?: string;
    };

    // ── Validate URL ─────────────────────────────────────────────
    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json(
          { success: false, error: "URL must use HTTP or HTTPS protocol" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // ── Validate events ──────────────────────────────────────────
    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one event type is required" },
        { status: 400 }
      );
    }

    const validEvents = Object.keys(WEBHOOK_EVENTS);
    const invalidEvents = events.filter((e) => !isValidWebhookEvent(e));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid event types: ${invalidEvents.join(", ")}`,
          details: `Valid events: ${validEvents.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ── Create webhook ───────────────────────────────────────────
    const webhookSecret = secret || generateWebhookSecret();

    const webhook = await prisma.webhook.create({
      data: {
        tenantId: user.tenantId,
        url,
        events: JSON.stringify(events),
        secret: webhookSecret,
        isActive: true,
        failCount: 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...webhook,
          events: JSON.parse(webhook.events) as string[],
          // Show the full secret only on creation
          secret: webhookSecret,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] POST /api/webhooks error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to create webhook" },
      { status: 500 }
    );
  }
}
