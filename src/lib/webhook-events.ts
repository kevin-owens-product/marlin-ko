/**
 * Webhook Event Definitions
 *
 * Central registry of all webhook event types supported by the Medius platform.
 * Each event key maps to a human-readable description.
 */

export const WEBHOOK_EVENTS = {
  'invoice.created': 'When a new invoice is created',
  'invoice.approved': 'When an invoice is approved',
  'invoice.rejected': 'When an invoice is rejected',
  'invoice.paid': 'When an invoice payment is completed',
  'payment.created': 'When a payment batch is created',
  'payment.completed': 'When a payment is successfully processed',
  'payment.failed': 'When a payment fails',
  'approval.requested': 'When approval is requested',
  'approval.completed': 'When approval chain is completed',
  'supplier.created': 'When a new supplier is registered',
  'supplier.updated': 'When supplier info is updated',
  'risk.alert_created': 'When a new risk alert is detected',
  'expense.submitted': 'When an expense report is submitted',
  'contract.expiring': 'When a contract is approaching expiry',
} as const;

export type WebhookEvent = keyof typeof WEBHOOK_EVENTS;

/**
 * Validate that a given string is a recognized webhook event type.
 */
export function isValidWebhookEvent(event: string): event is WebhookEvent {
  return event in WEBHOOK_EVENTS;
}

/**
 * Get all valid webhook event keys.
 */
export function getAllWebhookEvents(): WebhookEvent[] {
  return Object.keys(WEBHOOK_EVENTS) as WebhookEvent[];
}
