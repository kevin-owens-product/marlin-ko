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
 * Sign a payload using HMAC-SHA256.
 */
async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * POST /api/webhooks/[id]/test
 *
 * Send a test event to a webhook endpoint. Creates a delivery record
 * with the result of the HTTP request.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const webhook = await prisma.webhook.findUnique({ where: { id } });
    if (!webhook || webhook.tenantId !== user.tenantId) {
      return NextResponse.json(
        { success: false, error: "Webhook not found" },
        { status: 404 }
      );
    }

    // ── Build test payload ───────────────────────────────────────
    const deliveryId = crypto.randomUUID();
    const testPayload = {
      event: "webhook.test",
      deliveryId,
      timestamp: new Date().toISOString(),
      data: {
        message: "This is a test webhook delivery from Medius",
        webhookId: webhook.id,
        tenantId: user.tenantId,
      },
    };

    const payloadString = JSON.stringify(testPayload);
    const signature = await signPayload(payloadString, webhook.secret);

    // ── Deliver to webhook URL ───────────────────────────────────
    let statusCode: number | null = null;
    let responseBody: string | null = null;
    let success = false;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Medius-Event": "webhook.test",
          "X-Medius-Signature": `sha256=${signature}`,
          "X-Medius-Delivery": deliveryId,
          "User-Agent": "Medius-Webhooks/1.0",
        },
        body: payloadString,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      statusCode = response.status;
      responseBody = await response.text().catch(() => null);
      success = response.ok;
    } catch (fetchError) {
      const fetchMessage =
        fetchError instanceof Error ? fetchError.message : "Request failed";
      responseBody = fetchMessage;
      success = false;
    }

    // ── Record delivery ──────────────────────────────────────────
    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event: "webhook.test",
        payload: payloadString,
        statusCode,
        response: responseBody
          ? responseBody.slice(0, 4096) // Truncate response to 4KB
          : null,
        success,
        attemptCount: 1,
      },
    });

    // Update lastTriggeredAt
    await prisma.webhook.update({
      where: { id: webhook.id },
      data: { lastTriggeredAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: {
        deliveryId: delivery.id,
        event: "webhook.test",
        statusCode,
        webhookSuccess: success,
        responseBody: responseBody ? responseBody.slice(0, 1024) : null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] POST /api/webhooks/[id]/test error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to test webhook" },
      { status: 500 }
    );
  }
}
