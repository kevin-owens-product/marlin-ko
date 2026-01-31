import type { IntentPattern } from '../types';
import { invoiceIntents } from './invoice-intents';
import { purchaseOrderIntents } from './purchase-order-intents';
import { contractIntents } from './contract-intents';
import { expenseIntents } from './expense-intents';
import { supplierIntents } from './supplier-intents';
import { paymentIntents } from './payment-intents';
import { riskIntents } from './risk-intents';
import { cashflowIntents } from './cashflow-intents';
import { agentIntents } from './agent-intents';
import { dashboardIntents } from './dashboard-intents';

export function getAllIntents(): IntentPattern[] {
  return [
    ...invoiceIntents,
    ...purchaseOrderIntents,
    ...contractIntents,
    ...expenseIntents,
    ...supplierIntents,
    ...paymentIntents,
    ...riskIntents,
    ...cashflowIntents,
    ...agentIntents,
    ...dashboardIntents,
  ];
}
