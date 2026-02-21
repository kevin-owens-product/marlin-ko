import crypto from "crypto";
import { prisma } from "@/lib/db";

/**
 * Webhook Event Dispatcher for the Medius AP Automation Platform.
 *
 * Responsible for delivering webhook events to all matching active
 * webhook endpoints registered by a tenant.
 */

// ─── Types ────────────────────────────────────────────────────

export interface WebhookEvent {
  /** Dot-notation event type, e.g. "invoice.created" */
  type: string;
  /** The tenant whose webhooks should be triggered */
  tenantId: string;
  /** Arbitrary event data payload */
  data: Record<string, unknown>;
  /** ISO 8601 timestamp of when the event occurred */
  timestamp: string;
}

interface DeliveryResult {
  webhookId: string;
  success: boolean;
  statusCode: number | null;
  response: string | null;
  error?: string;
}

// ─── Event Types ──────────────────────────────────────────────

/**
 * All webhook event types supported by the Medius platform.
 */
export const WEBHOOK_EVENTS = {
  INVOICE_CREATED: "invoice.created",
  INVOICE_APPROVED: "invoice.approved",
  INVOICE_REJECTED: "invoice.rejected",
  INVOICE_PAID: "invoice.paid",
  PAYMENT_CREATED: "payment.created",
  PAYMENT_COMPLETED: "payment.completed",
  PAYMENT_FAILED: "payment.failed",
  APPROVAL_REQUESTED: "approval.requested",
  APPROVAL_COMPLETED: "approval.completed",
  SUPPLIER_CREATED: "supplier.created",
  SUPPLIER_UPDATED: "supplier.updated",
  EXPENSE_SUBMITTED: "expense.submitted",
  EXPENSE_APPROVED: "expense.approved",
  RISK_ALERT: "risk.alert",
  WEBHOOK_TEST: "webhook.test",
} as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[keyof typeof WEBHOOK_EVENTS];

// ─── Signature Utilities ──────────────────────────────────────

/**
 * Generate an HMAC-SHA256 signature for a payload string.
 *
 * @param payload  - The stringified JSON payload to sign.
 * @param secret   - The webhook HMAC secret.
 * @returns The hex-encoded HMAC digest.
 */
export function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verify an HMAC-SHA256 signature for an incoming webhook payload.
 *
 * Uses `crypto.timingSafeEqual` to prevent timing-based side-channel attacks.
 *
 * @param payload   - The raw request body string.
 * @param signature - The signature value received in the request header.
 * @param secret    - The expected HMAC secret for this webhook.
 * @returns `true` if the signature is valid.
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = generateSignature(payload, secret);
  // Guard against different-length buffers (timingSafeEqual throws)
  if (expected.length !== signature.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// ─── Delivery ─────────────────────────────────────────────────

/** Timeout for individual webhook delivery requests (10 seconds). */
const DELIVERY_TIMEOUT_MS = 10_000;

/** Maximum response body size stored in the delivery log (4 KB). */
const MAX_RESPONSE_LENGTH = 4096;

/**
 * Deliver a single event to one webhook endpoint.
 *
 * @returns A `DeliveryResult` with status information.
 */
async function deliverToWebhook(
  webhook: { id: string; url: string; secret: string },
  event: WebhookEvent
): Promise<DeliveryResult> {
  const deliveryId = crypto.randomUUID();

  const payload = JSON.stringify({
    event: event.type,
    deliveryId,
    timestamp: event.timestamp,
    data: event.data,
  });

  const signature = generateSignature(payload, webhook.secret);

  let statusCode: number | null = null;
  let responseBody: string | null = null;
  let success = false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Medius-Event": event.type,
        "X-Medius-Signature": `sha256=${signature}`,
        "X-Medius-Delivery": deliveryId,
        "User-Agent": "Medius-Webhooks/1.0",
      },
      body: payload,
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

  // ── Record delivery in database ───────────────────────────
  try {
    await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event: event.type,
        payload,
        statusCode,
        response: responseBody
          ? responseBody.slice(0, MAX_RESPONSE_LENGTH)
          : null,
        success,
        attemptCount: 1,
      },
    });
  } catch (dbError) {
    console.error(
      `[WebhookDispatcher] Failed to record delivery for webhook ${webhook.id}:`,
      dbError
    );
  }

  // ── Update webhook metadata ─────────────────────────────
  try {
    const updateData: Record<string, unknown> = {
      lastTriggeredAt: new Date(),
    };

    if (!success) {
      // Increment failure count on delivery failure
      updateData.failureCount = { increment: 1 };
    }

    await prisma.webhook.update({
      where: { id: webhook.id },
      data: updateData,
    });
  } catch (dbError) {
    console.error(
      `[WebhookDispatcher] Failed to update webhook ${webhook.id}:`,
      dbError
    );
  }

  return {
    webhookId: webhook.id,
    success,
    statusCode,
    response: responseBody
      ? responseBody.slice(0, MAX_RESPONSE_LENGTH)
      : null,
    ...(success ? {} : { error: responseBody || "Delivery failed" }),
  };
}

// ─── Dispatcher ───────────────────────────────────────────────

/**
 * Dispatch a webhook event to all matching active webhooks for the given tenant.
 *
 * 1. Finds all active webhooks for the tenant that subscribe to the event type.
 * 2. Delivers the event payload to each webhook URL in parallel.
 * 3. Records each delivery attempt (success or failure) in WebhookDelivery.
 * 4. Increments failureCount on the Webhook record for failed deliveries.
 *
 * Uses `Promise.allSettled` so that individual delivery failures do not
 * prevent other webhooks from being notified.
 *
 * @param event - The webhook event to dispatch.
 * @returns An array of delivery results for each webhook.
 */
export async function dispatchWebhookEvent(
  event: WebhookEvent
): Promise<DeliveryResult[]> {
  // 1. Find all active webhooks for the tenant
  let webhooks;
  try {
    webhooks = await prisma.webhook.findMany({
      where: {
        tenantId: event.tenantId,
        isActive: true,
      },
      select: {
        id: true,
        url: true,
        secret: true,
        events: true,
      },
    });
  } catch (error) {
    console.error(
      "[WebhookDispatcher] Failed to query webhooks:",
      error
    );
    return [];
  }

  // 2. Filter to webhooks that subscribe to this event type
  const matchingWebhooks = webhooks.filter((wh) => {
    try {
      const events: string[] = JSON.parse(wh.events);
      return events.includes(event.type) || events.includes("*");
    } catch {
      return false;
    }
  });

  if (matchingWebhooks.length === 0) {
    return [];
  }

  // 3. Deliver in parallel with allSettled
  const results = await Promise.allSettled(
    matchingWebhooks.map((wh) => deliverToWebhook(wh, event))
  );

  // 4. Collect results
  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      webhookId: matchingWebhooks[index].id,
      success: false,
      statusCode: null,
      response: null,
      error:
        result.reason instanceof Error
          ? result.reason.message
          : "Unknown delivery error",
    };
  });
}
