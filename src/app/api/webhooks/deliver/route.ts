import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidWebhookEvent } from "@/lib/webhook-events";

/**
 * Sign a payload string using HMAC-SHA256 with the given secret.
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
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * POST /api/webhooks/deliver (internal use only)
 *
 * Body: { event: string, payload: object, tenantId: string }
 *
 * Finds all active webhooks for the tenant that subscribe to the given
 * event type and delivers the payload to each one. Payloads are signed
 * with HMAC-SHA256 using each webhook's secret.
 *
 * This endpoint is intended for internal service-to-service calls.
 * In production, secure it with an internal API key or service token.
 */
export async function POST(request: NextRequest) {
  try {
    // ── Optional internal auth check ─────────────────────────────
    const internalKey = process.env.INTERNAL_API_KEY;
    if (internalKey) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${internalKey}`) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    const { event, payload, tenantId } = body as {
      event?: string;
      payload?: unknown;
      tenantId?: string;
    };

    // ── Validate inputs ──────────────────────────────────────────
    if (!event || !payload || !tenantId) {
      return NextResponse.json(
        {
          success: false,
          error: "event, payload, and tenantId are required",
        },
        { status: 400 }
      );
    }

    if (!isValidWebhookEvent(event)) {
      return NextResponse.json(
        { success: false, error: `Invalid event type: ${event}` },
        { status: 400 }
      );
    }

    // ── Find matching webhooks ───────────────────────────────────
    const webhooks = await prisma.webhook.findMany({
      where: {
        tenantId,
        isActive: true,
      },
    });

    // Filter to webhooks that subscribe to this event
    const matchingWebhooks = webhooks.filter((wh) => {
      const subscribedEvents = JSON.parse(wh.events) as string[];
      return subscribedEvents.includes(event);
    });

    if (matchingWebhooks.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          delivered: 0,
          message: "No webhooks matched the event",
        },
      });
    }

    // ── Deliver to each webhook ──────────────────────────────────
    const results: Array<{
      webhookId: string;
      deliveryId: string;
      success: boolean;
      statusCode: number | null;
    }> = [];

    for (const webhook of matchingWebhooks) {
      const deliveryId = crypto.randomUUID();

      const deliveryPayload = {
        event,
        deliveryId,
        timestamp: new Date().toISOString(),
        data: payload,
      };

      const payloadString = JSON.stringify(deliveryPayload);
      const signature = await signPayload(payloadString, webhook.secret);

      let statusCode: number | null = null;
      let responseBody: string | null = null;
      let deliverySuccess = false;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Medius-Event": event,
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
        deliverySuccess = response.ok;
      } catch (fetchError) {
        const fetchMessage =
          fetchError instanceof Error ? fetchError.message : "Delivery failed";
        responseBody = fetchMessage;
        deliverySuccess = false;
      }

      // ── Record delivery ──────────────────────────────────────
      await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event,
          payload: payloadString,
          statusCode,
          response: responseBody ? responseBody.slice(0, 4096) : null,
          success: deliverySuccess,
          attempt: 1,
        },
      });

      // ── Update webhook stats ─────────────────────────────────
      if (deliverySuccess) {
        await prisma.webhook.update({
          where: { id: webhook.id },
          data: {
            lastDeliveredAt: new Date(),
            failCount: 0, // Reset on success
          },
        });
      } else {
        await prisma.webhook.update({
          where: { id: webhook.id },
          data: {
            failCount: { increment: 1 },
          },
        });

        // Disable webhook after 10 consecutive failures
        const updatedWebhook = await prisma.webhook.findUnique({
          where: { id: webhook.id },
        });
        if (updatedWebhook && updatedWebhook.failCount >= 10) {
          await prisma.webhook.update({
            where: { id: webhook.id },
            data: { isActive: false },
          });
          console.warn(
            `[Webhooks] Disabled webhook ${webhook.id} after ${updatedWebhook.failCount} consecutive failures`
          );
        }
      }

      results.push({
        webhookId: webhook.id,
        deliveryId,
        success: deliverySuccess,
        statusCode,
      });
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      data: {
        delivered: results.length,
        successful: successCount,
        failed: results.length - successCount,
        results,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] POST /api/webhooks/deliver error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to deliver webhooks" },
      { status: 500 }
    );
  }
}
