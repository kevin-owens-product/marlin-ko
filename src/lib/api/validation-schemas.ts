/**
 * Zod Validation Schemas for all Medius Platform Entities
 *
 * Provides create, update, and query-parameter schemas for every entity
 * in the system. Update schemas are partial versions of create schemas
 * with a refinement ensuring at least one field is provided.
 *
 * All schemas are Zod v4 compatible.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

const uuid = z.string().uuid();
const nonEmptyString = z.string().min(1, 'Must not be empty');
const positiveNumber = z.number().positive('Must be a positive number');
const nonNegativeNumber = z.number().min(0, 'Must be zero or greater');
const isoDateString = z.string().datetime({ message: 'Must be a valid ISO 8601 date string' });
const currency = z.string().length(3, 'Must be a 3-letter currency code').toUpperCase().default('USD');
const email = z.string().email('Must be a valid email address');
const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
};

/** Helper: make all fields optional but require at least one. */
function partialWithAtLeastOne<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.partial().refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: 'At least one field must be provided for update' },
  );
}

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const LoginSchema = z.object({
  email: email,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional().default(false),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: email,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8),
  name: nonEmptyString,
  tenantId: z.string().optional(),
  role: z.enum(['ADMIN', 'APPROVER', 'AP_CLERK', 'VIEWER']).default('VIEWER'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

// ---------------------------------------------------------------------------
// Shared date range query (reusable across multiple entities)
// ---------------------------------------------------------------------------

export const DateRangeQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;

// ---------------------------------------------------------------------------
// Pagination query (standalone, composable)
// ---------------------------------------------------------------------------

export const PaginationQuerySchema = z.object({
  ...pagination,
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// ---------------------------------------------------------------------------
// Invoice
// ---------------------------------------------------------------------------

export const CreateInvoiceSchema = z.object({
  invoiceNumber: nonEmptyString,
  vendorName: nonEmptyString,
  totalAmount: positiveNumber,
  subtotalAmount: nonNegativeNumber.optional(),
  taxAmount: nonNegativeNumber.optional(),
  currency: currency.optional(),
  sourceType: z.enum(['email', 'upload', 'api', 'network']).default('upload'),
  dueDate: isoDateString.optional(),
  invoiceDate: isoDateString.optional(),
  poNumber: z.string().optional(),
  costCenter: z.string().optional(),
  glCode: z.string().optional(),
  description: z.string().optional(),
  rawFileRef: z.string().optional(),
  paymentMethod: z.enum(['ACH', 'WIRE', 'VIRTUAL_CARD', 'CHECK', 'SEPA', 'BACS']).optional(),
  lineItems: z.array(z.object({
    description: z.string().optional(),
    quantity: positiveNumber,
    unitPrice: positiveNumber,
    totalAmount: positiveNumber,
  })).optional(),
});
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

export const UpdateInvoiceSchema = partialWithAtLeastOne(
  CreateInvoiceSchema.extend({
    status: z.enum([
      'ingested', 'extracted', 'compliance_checked', 'classified',
      'matched', 'approved', 'paid', 'rejected', 'flagged_for_review',
    ]).optional(),
  }),
);
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;

export const InvoiceQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  vendor: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'totalAmount', 'dueDate', 'invoiceNumber', 'vendorName']).default('createdAt'),
  ...pagination,
});
export type InvoiceQuery = z.infer<typeof InvoiceQuerySchema>;

// ---------------------------------------------------------------------------
// Supplier (TradingPartner)
// ---------------------------------------------------------------------------

export const CreateSupplierSchema = z.object({
  name: nonEmptyString,
  taxId: z.string().optional(),
  email: email.optional(),
  category: z.enum(['IT_SERVICES', 'OFFICE_SUPPLIES', 'PROFESSIONAL_SERVICES', 'MANUFACTURING', 'LOGISTICS']).optional(),
  discountTerms: z.string().optional(),
  paymentTerms: z.enum(['NET_15', 'NET_30', 'NET_45', 'NET_60', 'NET_90', 'IMMEDIATE']).default('NET_30'),
  address: z.string().optional(),
  phone: z.string().optional(),
  complianceStatus: z.enum(['compliant', 'non_compliant', 'pending']).default('compliant'),
  isActive: z.boolean().default(true),
});
export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;

export const UpdateSupplierSchema = partialWithAtLeastOne(CreateSupplierSchema);
export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>;

export const SupplierQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  complianceStatus: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'riskScore']).default('createdAt'),
  ...pagination,
});
export type SupplierQuery = z.infer<typeof SupplierQuerySchema>;

// ---------------------------------------------------------------------------
// Purchase Order
// ---------------------------------------------------------------------------

export const CreatePurchaseOrderSchema = z.object({
  poNumber: nonEmptyString,
  supplierId: uuid,
  totalAmount: positiveNumber,
  currency: currency.optional(),
  status: z.enum(['DRAFT', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED']).default('DRAFT'),
  description: z.string().optional(),
  lineItems: z.string().optional(), // JSON string
});
export type CreatePurchaseOrderInput = z.infer<typeof CreatePurchaseOrderSchema>;

export const UpdatePurchaseOrderSchema = partialWithAtLeastOne(CreatePurchaseOrderSchema);
export type UpdatePurchaseOrderInput = z.infer<typeof UpdatePurchaseOrderSchema>;

export const PurchaseOrderQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  supplierId: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'totalAmount', 'poNumber']).default('createdAt'),
  ...pagination,
});
export type PurchaseOrderQuery = z.infer<typeof PurchaseOrderQuerySchema>;

// ---------------------------------------------------------------------------
// Expense
// ---------------------------------------------------------------------------

export const CreateExpenseSchema = z.object({
  category: z.enum(['TRAVEL', 'MEALS', 'SOFTWARE', 'OFFICE', 'EQUIPMENT', 'OTHER']),
  amount: positiveNumber,
  currency: currency.optional(),
  receiptUrl: z.string().url().optional(),
  description: z.string().optional(),
  merchant: z.string().optional(),
  project: z.string().optional(),
  costCenter: z.string().optional(),
  expenseDate: isoDateString,
});
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;

export const UpdateExpenseSchema = partialWithAtLeastOne(
  CreateExpenseSchema.extend({
    status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REIMBURSED']).optional(),
  }),
);
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;

export const ExpenseQuerySchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  userId: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sortBy: z.enum(['createdAt', 'amount', 'expenseDate', 'category']).default('createdAt'),
  ...pagination,
});
export type ExpenseQuery = z.infer<typeof ExpenseQuerySchema>;

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

export const CreateContractSchema = z.object({
  supplierId: uuid,
  title: nonEmptyString,
  value: positiveNumber,
  currency: currency.optional(),
  startDate: isoDateString,
  endDate: isoDateString,
  autoRenew: z.boolean().default(false),
  terms: z.string().optional(), // JSON string
  documentUrl: z.string().url().optional(),
});
export type CreateContractInput = z.infer<typeof CreateContractSchema>;

export const UpdateContractSchema = partialWithAtLeastOne(
  CreateContractSchema.extend({
    status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRING', 'EXPIRED', 'TERMINATED']).optional(),
  }),
);
export type UpdateContractInput = z.infer<typeof UpdateContractSchema>;

export const ContractQuerySchema = z.object({
  supplierId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  minValue: z.coerce.number().optional(),
  maxValue: z.coerce.number().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'value', 'startDate', 'endDate', 'title']).default('createdAt'),
  ...pagination,
});
export type ContractQuery = z.infer<typeof ContractQuerySchema>;

// ---------------------------------------------------------------------------
// Payment Batch
// ---------------------------------------------------------------------------

export const CreatePaymentBatchSchema = z.object({
  totalAmount: positiveNumber,
  currency: currency.optional(),
  paymentCount: z.number().int().positive(),
  method: z.enum(['ACH', 'WIRE', 'VIRTUAL_CARD', 'SEPA', 'BACS', 'CHECK']),
  invoiceIds: z.array(uuid).min(1, 'At least one invoice is required'),
});
export type CreatePaymentBatchInput = z.infer<typeof CreatePaymentBatchSchema>;

export const UpdatePaymentBatchSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'At least one field must be provided for update' },
);
export type UpdatePaymentBatchInput = z.infer<typeof UpdatePaymentBatchSchema>;

export const PaymentBatchQuerySchema = z.object({
  status: z.string().optional(),
  method: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  sortBy: z.enum(['createdAt', 'totalAmount', 'paymentCount']).default('createdAt'),
  ...pagination,
});
export type PaymentBatchQuery = z.infer<typeof PaymentBatchQuerySchema>;

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export const CreateUserSchema = z.object({
  email: email,
  name: nonEmptyString,
  role: z.enum(['ADMIN', 'APPROVER', 'AP_CLERK', 'VIEWER']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  avatarUrl: z.string().url().optional().nullable(),
  preferences: z.string().optional(), // JSON string
  isActive: z.boolean().default(true),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = partialWithAtLeastOne(
  CreateUserSchema.omit({ password: true }).extend({
    password: z.string().min(8).optional(),
  }),
);
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const UserQuerySchema = z.object({
  role: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'email', 'lastLoginAt']).default('createdAt'),
  ...pagination,
});
export type UserQuery = z.infer<typeof UserQuerySchema>;

// ---------------------------------------------------------------------------
// Approval Workflow
// ---------------------------------------------------------------------------

export const CreateApprovalWorkflowSchema = z.object({
  name: nonEmptyString,
  description: z.string().optional(),
  rules: z.string().optional(), // JSON string with conditions and thresholds
  isActive: z.boolean().default(true),
});
export type CreateApprovalWorkflowInput = z.infer<typeof CreateApprovalWorkflowSchema>;

export const UpdateApprovalWorkflowSchema = partialWithAtLeastOne(CreateApprovalWorkflowSchema);
export type UpdateApprovalWorkflowInput = z.infer<typeof UpdateApprovalWorkflowSchema>;

export const ApprovalWorkflowQuerySchema = z.object({
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name']).default('createdAt'),
  ...pagination,
});
export type ApprovalWorkflowQuery = z.infer<typeof ApprovalWorkflowQuerySchema>;

// ---------------------------------------------------------------------------
// Virtual Card
// ---------------------------------------------------------------------------

export const CreateVirtualCardSchema = z.object({
  supplierId: uuid,
  amount: positiveNumber,
  currency: currency.optional(),
  expiresAt: isoDateString,
});
export type CreateVirtualCardInput = z.infer<typeof CreateVirtualCardSchema>;

export const UpdateVirtualCardSchema = z.object({
  status: z.enum(['ACTIVE', 'USED', 'CANCELLED', 'EXPIRED']),
  amount: positiveNumber.optional(),
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'At least one field must be provided for update' },
);
export type UpdateVirtualCardInput = z.infer<typeof UpdateVirtualCardSchema>;

export const VirtualCardQuerySchema = z.object({
  supplierId: z.string().optional(),
  status: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  sortBy: z.enum(['createdAt', 'amount', 'expiresAt']).default('createdAt'),
  ...pagination,
});
export type VirtualCardQuery = z.infer<typeof VirtualCardQuerySchema>;

// ---------------------------------------------------------------------------
// SCF Program
// ---------------------------------------------------------------------------

export const CreateSCFProgramSchema = z.object({
  funder: nonEmptyString,
  programSize: positiveNumber,
  utilization: nonNegativeNumber.default(0),
  rateRangeMin: nonNegativeNumber,
  rateRangeMax: positiveNumber,
  suppliers: z.number().int().min(0).default(0),
  status: z.enum(['ACTIVE', 'PAUSED', 'CLOSED']).default('ACTIVE'),
});
export type CreateSCFProgramInput = z.infer<typeof CreateSCFProgramSchema>;

export const UpdateSCFProgramSchema = partialWithAtLeastOne(CreateSCFProgramSchema);
export type UpdateSCFProgramInput = z.infer<typeof UpdateSCFProgramSchema>;

export const SCFProgramQuerySchema = z.object({
  status: z.string().optional(),
  funder: z.string().optional(),
  sortBy: z.enum(['createdAt', 'programSize', 'utilization', 'funder']).default('createdAt'),
  ...pagination,
});
export type SCFProgramQuery = z.infer<typeof SCFProgramQuerySchema>;

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

export const CreateReportSchema = z.object({
  name: nonEmptyString,
  type: z.enum(['SPEND_ANALYSIS', 'AGING', 'CASH_FLOW', 'COMPLIANCE', 'FRAUD', 'PROCESSING', 'CUSTOM']),
  config: z.string().optional(), // JSON string
  schedule: z.string().optional(), // JSON: { cron, enabled, recipients }
});
export type CreateReportInput = z.infer<typeof CreateReportSchema>;

export const UpdateReportSchema = partialWithAtLeastOne(CreateReportSchema);
export type UpdateReportInput = z.infer<typeof UpdateReportSchema>;

export const ReportQuerySchema = z.object({
  type: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name', 'type', 'lastRunAt']).default('createdAt'),
  ...pagination,
});
export type ReportQuery = z.infer<typeof ReportQuerySchema>;

// ---------------------------------------------------------------------------
// ERP Connection
// ---------------------------------------------------------------------------

export const CreateERPConnectionSchema = z.object({
  erpType: z.enum(['SAP', 'ORACLE', 'DYNAMICS365', 'NETSUITE', 'SAGE', 'QUICKBOOKS', 'CUSTOM']),
  name: z.string().optional(),
  config: z.string().optional(), // JSON (encrypted at rest)
  status: z.enum(['ACTIVE', 'INACTIVE', 'ERROR']).default('INACTIVE'),
});
export type CreateERPConnectionInput = z.infer<typeof CreateERPConnectionSchema>;

export const UpdateERPConnectionSchema = partialWithAtLeastOne(CreateERPConnectionSchema);
export type UpdateERPConnectionInput = z.infer<typeof UpdateERPConnectionSchema>;

export const ERPConnectionQuerySchema = z.object({
  erpType: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.enum(['createdAt', 'erpType', 'lastSyncAt']).default('createdAt'),
  ...pagination,
});
export type ERPConnectionQuery = z.infer<typeof ERPConnectionQuerySchema>;

// ---------------------------------------------------------------------------
// Webhook
// ---------------------------------------------------------------------------

export const CreateWebhookSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  events: z.array(z.string().min(1)).min(1, 'At least one event type is required'),
  secret: z.string().min(16, 'Webhook secret must be at least 16 characters').optional(),
  isActive: z.boolean().default(true),
});
export type CreateWebhookInput = z.infer<typeof CreateWebhookSchema>;

export const UpdateWebhookSchema = partialWithAtLeastOne(
  CreateWebhookSchema.extend({
    isActive: z.boolean().optional(),
  }),
);
export type UpdateWebhookInput = z.infer<typeof UpdateWebhookSchema>;

export const WebhookQuerySchema = z.object({
  isActive: z.coerce.boolean().optional(),
  event: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'url']).default('createdAt'),
  ...pagination,
});
export type WebhookQuery = z.infer<typeof WebhookQuerySchema>;

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------

export const NotificationQuerySchema = z.object({
  type: z.string().optional(),
  isRead: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'type']).default('createdAt'),
  ...pagination,
});
export type NotificationQuery = z.infer<typeof NotificationQuerySchema>;

export const UpdateNotificationSchema = z.object({
  isRead: z.boolean(),
});
export type UpdateNotificationInput = z.infer<typeof UpdateNotificationSchema>;

// ---------------------------------------------------------------------------
// Audit Log (query only -- audit logs are created programmatically)
// ---------------------------------------------------------------------------

export const AuditLogQuerySchema = z.object({
  action: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  userId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sortBy: z.enum(['timestamp', 'action', 'entityType']).default('timestamp'),
  ...pagination,
});
export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;

// ---------------------------------------------------------------------------
// Expense Policy
// ---------------------------------------------------------------------------

export const CreateExpensePolicySchema = z.object({
  name: nonEmptyString,
  rules: z.string().optional(), // JSON string
  isActive: z.boolean().default(true),
});
export type CreateExpensePolicyInput = z.infer<typeof CreateExpensePolicySchema>;

export const UpdateExpensePolicySchema = partialWithAtLeastOne(CreateExpensePolicySchema);
export type UpdateExpensePolicyInput = z.infer<typeof UpdateExpensePolicySchema>;

export const ExpensePolicyQuerySchema = z.object({
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name']).default('createdAt'),
  ...pagination,
});
export type ExpensePolicyQuery = z.infer<typeof ExpensePolicyQuerySchema>;

// ---------------------------------------------------------------------------
// Risk Alert
// ---------------------------------------------------------------------------

export const RiskAlertQuerySchema = z.object({
  riskType: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  invoiceId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sortBy: z.enum(['detectedAt', 'severity', 'riskType', 'status']).default('detectedAt'),
  ...pagination,
});
export type RiskAlertQuery = z.infer<typeof RiskAlertQuerySchema>;

export const UpdateRiskAlertSchema = z.object({
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED']),
});
export type UpdateRiskAlertInput = z.infer<typeof UpdateRiskAlertSchema>;

// ---------------------------------------------------------------------------
// Feature Flag
// ---------------------------------------------------------------------------

export const CreateFeatureFlagSchema = z.object({
  key: nonEmptyString,
  name: nonEmptyString,
  description: z.string().optional(),
  isEnabled: z.boolean().default(false),
  tenantOverrides: z.string().optional(), // JSON: { tenantId: boolean }
  planRequirement: z.string().optional(),
});
export type CreateFeatureFlagInput = z.infer<typeof CreateFeatureFlagSchema>;

export const UpdateFeatureFlagSchema = partialWithAtLeastOne(CreateFeatureFlagSchema);
export type UpdateFeatureFlagInput = z.infer<typeof UpdateFeatureFlagSchema>;

export const FeatureFlagQuerySchema = z.object({
  isEnabled: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'key', 'name']).default('createdAt'),
  ...pagination,
});
export type FeatureFlagQuery = z.infer<typeof FeatureFlagQuerySchema>;

// ---------------------------------------------------------------------------
// API Key
// ---------------------------------------------------------------------------

export const CreateApiKeySchema = z.object({
  name: nonEmptyString,
  scopes: z.array(z.string()).optional(),
  expiresAt: isoDateString.optional(),
});
export type CreateApiKeyInput = z.infer<typeof CreateApiKeySchema>;

export const UpdateApiKeySchema = z.object({
  name: z.string().min(1).optional(),
  scopes: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'At least one field must be provided for update' },
);
export type UpdateApiKeyInput = z.infer<typeof UpdateApiKeySchema>;

export const ApiKeyQuerySchema = z.object({
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name', 'lastUsedAt']).default('createdAt'),
  ...pagination,
});
export type ApiKeyQuery = z.infer<typeof ApiKeyQuerySchema>;

// ---------------------------------------------------------------------------
// Supplier Conversation
// ---------------------------------------------------------------------------

export const CreateSupplierConversationSchema = z.object({
  supplierId: uuid,
  subject: nonEmptyString,
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  initialMessage: z.string().optional(),
});
export type CreateSupplierConversationInput = z.infer<typeof CreateSupplierConversationSchema>;

export const UpdateSupplierConversationSchema = z.object({
  status: z.enum(['OPEN', 'PENDING_RESPONSE', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'At least one field must be provided for update' },
);
export type UpdateSupplierConversationInput = z.infer<typeof UpdateSupplierConversationSchema>;

export const SupplierConversationQuerySchema = z.object({
  supplierId: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  sortBy: z.enum(['createdAt', 'resolvedAt', 'priority', 'status']).default('createdAt'),
  ...pagination,
});
export type SupplierConversationQuery = z.infer<typeof SupplierConversationQuerySchema>;

// ---------------------------------------------------------------------------
// Conversation Message
// ---------------------------------------------------------------------------

export const CreateConversationMessageSchema = z.object({
  conversationId: uuid,
  content: nonEmptyString,
  senderType: z.enum(['AGENT', 'USER', 'SUPPLIER']).default('USER'),
  attachments: z.string().optional(), // JSON
});
export type CreateConversationMessageInput = z.infer<typeof CreateConversationMessageSchema>;

// ---------------------------------------------------------------------------
// Cash Flow Forecast (query only -- forecasts are generated programmatically)
// ---------------------------------------------------------------------------

export const CashFlowForecastQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  sortBy: z.enum(['forecastDate', 'generatedAt', 'netPosition']).default('forecastDate'),
  ...pagination,
});
export type CashFlowForecastQuery = z.infer<typeof CashFlowForecastQuerySchema>;

// ---------------------------------------------------------------------------
// Supplier Portal -- Supplier User auth
// ---------------------------------------------------------------------------

export const SupplierLoginSchema = z.object({
  email: email,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type SupplierLoginInput = z.infer<typeof SupplierLoginSchema>;

export const SupplierMagicLinkSchema = z.object({
  email: email,
});
export type SupplierMagicLinkInput = z.infer<typeof SupplierMagicLinkSchema>;

// ---------------------------------------------------------------------------
// Tenant (admin only)
// ---------------------------------------------------------------------------

export const CreateTenantSchema = z.object({
  name: nonEmptyString,
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  plan: z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']).default('PROFESSIONAL'),
  settings: z.string().optional(), // JSON
  branding: z.string().optional(), // JSON: { logoUrl, primaryColor, companyName }
  isActive: z.boolean().default(true),
});
export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;

export const UpdateTenantSchema = partialWithAtLeastOne(CreateTenantSchema);
export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>;

export const TenantQuerySchema = z.object({
  plan: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name', 'slug', 'plan']).default('createdAt'),
  ...pagination,
});
export type TenantQuery = z.infer<typeof TenantQuerySchema>;

// ---------------------------------------------------------------------------
// ID parameter (shared for [id] routes)
// ---------------------------------------------------------------------------

export const IdParamSchema = z.object({
  id: uuid,
});
export type IdParam = z.infer<typeof IdParamSchema>;
