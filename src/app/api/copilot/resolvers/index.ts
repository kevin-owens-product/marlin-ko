import type { CopilotModule, ResponseBlock, ParsedIntent } from '@/lib/copilot/types';
import { resolveInvoice } from './invoice-resolver';
import { resolvePurchaseOrder } from './purchase-order-resolver';
import { resolveContract } from './contract-resolver';
import { resolveExpense } from './expense-resolver';
import { resolveSupplier } from './supplier-resolver';
import { resolvePayment } from './payment-resolver';
import { resolveRisk } from './risk-resolver';
import { resolveCashflow } from './cashflow-resolver';
import { resolveAgent } from './agent-resolver';
import { resolveDashboard } from './dashboard-resolver';

export type ResolverFn = (intent: ParsedIntent) => Promise<{ blocks: ResponseBlock[] }>;

const RESOLVERS: Record<CopilotModule, ResolverFn> = {
  invoices: resolveInvoice,
  purchase_orders: resolvePurchaseOrder,
  contracts: resolveContract,
  expenses: resolveExpense,
  suppliers: resolveSupplier,
  payments: resolvePayment,
  risk: resolveRisk,
  cashflow: resolveCashflow,
  agents: resolveAgent,
  dashboard: resolveDashboard,
  general: resolveDashboard,
};

export function getResolver(module: CopilotModule): ResolverFn {
  return RESOLVERS[module] || resolveDashboard;
}

// ─── Shared Helpers ─────────────────────────────────────────────────────────

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
