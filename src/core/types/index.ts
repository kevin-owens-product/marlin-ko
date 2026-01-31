// ─── Enums ────────────────────────────────────────────────────
export type CurrencyCode = "USD" | "EUR" | "GBP" | "SEK" | "NOK" | "DKK" | "PLN" | "CHF";

export type DocumentStatus =
  | "ingested"
  | "extracted"
  | "compliance_checked"
  | "classified"
  | "matched"
  | "approved"
  | "paid"
  | "rejected"
  | "flagged_for_review";

export type UserRole = "ADMIN" | "APPROVER" | "AP_CLERK" | "VIEWER";

export type TenantPlan = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "ESCALATED" | "SKIPPED";

export type POStatus = "DRAFT" | "APPROVED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CLOSED";

export type MatchType = "TWO_WAY" | "THREE_WAY";
export type MatchStatus = "MATCHED" | "PARTIAL" | "EXCEPTION";

export type ExpenseStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "REIMBURSED";
export type ExpenseCategory = "TRAVEL" | "MEALS" | "SOFTWARE" | "OFFICE" | "EQUIPMENT" | "OTHER";

export type ContractStatus = "DRAFT" | "ACTIVE" | "EXPIRING" | "EXPIRED" | "TERMINATED";

export type PaymentMethod = "ACH" | "WIRE" | "VIRTUAL_CARD" | "SEPA" | "BACS" | "CHECK";
export type PaymentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REVERSED";
export type BatchStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type ConversationStatus = "OPEN" | "PENDING_RESPONSE" | "RESOLVED" | "CLOSED";
export type SenderType = "AGENT" | "USER" | "SUPPLIER";

export type RiskType = "DUPLICATE" | "FRAUD" | "ANOMALY" | "COMPLIANCE";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";

export type ERPType = "SAP" | "ORACLE" | "DYNAMICS365" | "NETSUITE" | "SAGE" | "QUICKBOOKS" | "CUSTOM";
export type ConnectionStatus = "ACTIVE" | "INACTIVE" | "ERROR";

export type AuditAction = "CREATED" | "UPDATED" | "DELETED" | "APPROVED" | "REJECTED" | "LOGIN" | "EXPORT" | "CONFIGURED";

export type ReportType = "SPEND_ANALYSIS" | "AGING" | "CASH_FLOW" | "COMPLIANCE" | "FRAUD" | "PROCESSING" | "CUSTOM";

export type SupplierCategory = "IT_SERVICES" | "OFFICE_SUPPLIES" | "PROFESSIONAL_SERVICES" | "MANUFACTURING" | "LOGISTICS";

// ─── Core Interfaces ──────────────────────────────────────────
export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  avatarUrl?: string;
  preferences?: Record<string, unknown>;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  settings?: Record<string, unknown>;
  createdAt: string;
}

export interface FinancialDocument {
  id: string;
  tenantId: string;
  sourceType: "email" | "upload" | "api" | "network";
  rawFileRef: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  metadata: {
    senderEmail?: string;
    originalFileName?: string;
    pageCount?: number;
    [key: string]: unknown;
  };
  extractedData?: {
    header: {
      invoiceNumber?: string;
      invoiceDate?: string;
      dueDate?: string;
      vendorName?: string;
      vendorId?: string;
      totalAmount?: Money;
      taxAmount?: Money;
      subtotalAmount?: Money;
      poNumber?: string;
      costCenter?: string;
    };
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      totalAmount: number;
      glCode?: string;
      costCenter?: string;
      confidence?: number;
    }>;
  };
  aiConfidence?: number;
  processingTimeMs?: number;
}

export interface TradingPartner {
  id: string;
  name: string;
  taxId?: string;
  email?: string;
  category?: SupplierCategory;
  riskScore: number;
  discountTerms?: string;
  paymentTerms?: string;
  address?: string;
  phone?: string;
  complianceStatus: "compliant" | "non_compliant" | "pending";
  isActive: boolean;
  paymentPreferences: {
    method: PaymentMethod;
    terms?: string;
  };
  communicationHistory: Array<{
    id: string;
    date: string;
    type: "email" | "portal" | "call";
    summary: string;
  }>;
}

export interface FinancialTransaction {
  id: string;
  documentId: string;
  type: "payment" | "refund" | "adjustment";
  amount: Money;
  status: PaymentStatus;
  executionDate?: string;
  method: PaymentMethod;
  referenceId?: string;
}

export interface AgentDecision {
  id: string;
  agentId: string;
  documentId: string;
  timestamp: string;
  action: string;
  reasoning: string;
  confidenceScore: number;
  outcome: "executed" | "queued_for_review" | "blocked";
  metadata?: Record<string, unknown>;
  humanOverride?: {
    userId: string;
    timestamp: string;
    originalValue: unknown;
    newValue: unknown;
    reason: string;
  };
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: "approve" | "reject" | "flag" | "require_step_up";
  priority: number;
  isActive: boolean;
}

// ─── Approvals ────────────────────────────────────────────────
export interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  rules?: {
    conditions: Array<{
      field: string;
      operator: "gt" | "lt" | "eq" | "gte" | "lte" | "in";
      value: unknown;
    }>;
    thresholds?: Record<string, number>;
  };
  isActive: boolean;
  createdAt: string;
}

export interface ApprovalStep {
  id: string;
  workflowId: string;
  invoiceId: string;
  stepOrder: number;
  approverId?: string;
  status: ApprovalStatus;
  comments?: string;
  approvedAt?: string;
  createdAt: string;
}

// ─── Procurement ──────────────────────────────────────────────
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  tenantId: string;
  totalAmount: number;
  currency: CurrencyCode;
  status: POStatus;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }>;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface POMatchResult {
  id: string;
  invoiceId: string;
  purchaseOrderId: string;
  matchType: MatchType;
  status: MatchStatus;
  tolerance: number;
  varianceAmount: number;
  variancePercent: number;
  details?: Record<string, unknown>;
  matchedAt: string;
}

// ─── Expenses ─────────────────────────────────────────────────
export interface Expense {
  id: string;
  userId: string;
  tenantId: string;
  category: ExpenseCategory;
  amount: number;
  currency: CurrencyCode;
  receiptUrl?: string;
  status: ExpenseStatus;
  description?: string;
  merchant?: string;
  project?: string;
  costCenter?: string;
  expenseDate: string;
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface ExpensePolicy {
  id: string;
  tenantId: string;
  name: string;
  rules: Array<{
    category: ExpenseCategory;
    maxAmount: number;
    requiresReceipt: boolean;
    requiresApproval: boolean;
  }>;
  isActive: boolean;
  createdAt: string;
}

// ─── Contracts ────────────────────────────────────────────────
export interface Contract {
  id: string;
  tenantId: string;
  supplierId: string;
  title: string;
  value: number;
  currency: CurrencyCode;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  autoRenew: boolean;
  terms?: Record<string, unknown>;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Payments ─────────────────────────────────────────────────
export interface PaymentBatch {
  id: string;
  tenantId: string;
  totalAmount: number;
  currency: CurrencyCode;
  paymentCount: number;
  status: BatchStatus;
  method: PaymentMethod;
  processedAt?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  batchId: string;
  invoiceId: string;
  amount: number;
  currency: CurrencyCode;
  status: PaymentStatus;
  reference?: string;
  processedAt?: string;
  createdAt: string;
}

// ─── Supplier Communications ──────────────────────────────────
export interface SupplierConversation {
  id: string;
  supplierId: string;
  tenantId: string;
  subject: string;
  status: ConversationStatus;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  createdAt: string;
  resolvedAt?: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: SenderType;
  content: string;
  attachments?: Array<{ name: string; url: string; type: string }>;
  sentAt: string;
}

// ─── Risk ─────────────────────────────────────────────────────
export interface RiskAlert {
  id: string;
  tenantId: string;
  invoiceId?: string;
  riskType: RiskType;
  severity: Severity;
  description: string;
  status: AlertStatus;
  details?: Record<string, unknown>;
  detectedAt: string;
  resolvedAt?: string;
}

// ─── Treasury ─────────────────────────────────────────────────
export interface CashFlowForecast {
  id: string;
  tenantId: string;
  forecastDate: string;
  expectedInflow: number;
  expectedOutflow: number;
  netPosition: number;
  confidence: number;
  generatedAt: string;
}

// ─── Platform ─────────────────────────────────────────────────
export interface AuditLogEntry {
  id: string;
  tenantId: string;
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface ERPConnection {
  id: string;
  tenantId: string;
  erpType: ERPType;
  name?: string;
  status: ConnectionStatus;
  config?: Record<string, unknown>;
  lastSyncAt?: string;
  createdAt: string;
}

export interface SyncLog {
  id: string;
  erpConnectionId: string;
  direction: "INBOUND" | "OUTBOUND";
  entityType: string;
  recordCount: number;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  errors?: Record<string, unknown>;
  startedAt: string;
  completedAt?: string;
}

export interface ReportConfig {
  id: string;
  tenantId: string;
  name: string;
  type: ReportType;
  config?: Record<string, unknown>;
  schedule?: { cron: string; enabled: boolean; recipients: string[] };
  lastRunAt?: string;
  createdAt: string;
}

// ─── Agent Types ──────────────────────────────────────────────
export interface AgentStatus {
  id: string;
  name: string;
  status: "active" | "idle" | "error";
  currentTask?: string;
  queueDepth: number;
  processedToday: number;
  accuracyRate: number;
  avgProcessingTimeMs: number;
  lastActivity?: string;
}

export interface PipelineStage {
  name: string;
  agentId: string;
  count: number;
  status: "active" | "idle" | "error";
}
