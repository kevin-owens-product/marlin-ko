import type { CopilotModule } from './types';

const PATH_MODULE_MAP: Record<string, CopilotModule> = {
  '/invoices': 'invoices',
  '/approvals': 'invoices',
  '/matching': 'invoices',
  '/coding': 'invoices',
  '/purchase-orders': 'purchase_orders',
  '/contracts': 'contracts',
  '/expenses': 'expenses',
  '/suppliers': 'suppliers',
  '/supplier-portal': 'suppliers',
  '/payments': 'payments',
  '/discounting': 'payments',
  '/virtual-cards': 'payments',
  '/scf': 'payments',
  '/risk': 'risk',
  '/risk-dashboard': 'risk',
  '/compliance': 'risk',
  '/cashflow': 'cashflow',
  '/treasury': 'cashflow',
  '/agent-studio': 'agents',
  '/copilot': 'general',
  '/analytics': 'dashboard',
  '/benchmarks': 'dashboard',
  '/reports': 'dashboard',
  '/settings': 'general',
};

export function getModuleFromPath(pathname: string): CopilotModule {
  // Check exact match first
  if (PATH_MODULE_MAP[pathname]) return PATH_MODULE_MAP[pathname];

  // Check prefix match
  for (const [path, mod] of Object.entries(PATH_MODULE_MAP)) {
    if (pathname.startsWith(path + '/') || pathname.startsWith(path)) {
      return mod;
    }
  }

  // Dashboard root
  if (pathname === '/') return 'dashboard';

  return 'general';
}

const MODULE_SUGGESTIONS: Record<CopilotModule, string[]> = {
  invoices: [
    'Show me pending invoices',
    'How many invoices were processed today?',
    'Which invoices are overdue?',
    'Summarize invoices by status',
    'Find invoices over $10,000',
  ],
  purchase_orders: [
    'Show me open purchase orders',
    'How many POs are pending approval?',
    'Summarize PO values by status',
    'Which POs are partially received?',
  ],
  contracts: [
    'Show me expiring contracts',
    'How many active contracts do we have?',
    'Summarize contracts by status',
    'Which contracts are up for renewal?',
  ],
  expenses: [
    'Show me pending expenses',
    'Summarize expenses by category',
    'How many expenses need approval?',
    'What is total travel spend?',
  ],
  suppliers: [
    'Show me high-risk suppliers',
    'How many active suppliers do we have?',
    'Which suppliers are non-compliant?',
    'List suppliers by risk score',
  ],
  payments: [
    'Show me pending payments',
    'How many payment batches are processing?',
    'Summarize payments by method',
    'What is total paid this month?',
  ],
  risk: [
    'Show me critical risk alerts',
    'How many open risk alerts are there?',
    'Summarize alerts by severity',
    'What fraud alerts are active?',
  ],
  cashflow: [
    'What is our cash position?',
    'Show me the cash flow forecast',
    'What is the net cash position?',
    'Summarize inflows vs outflows',
  ],
  agents: [
    'What is the agent status?',
    'How many agents are active?',
    'Show agent processing stats',
    'Are all agents healthy?',
  ],
  dashboard: [
    'Give me an overview of operations',
    'What are the key metrics today?',
    'How many invoices are pending?',
    'Show me a summary across all modules',
  ],
  general: [
    'Show me pending invoices',
    'What is our cash position?',
    'How many open risk alerts are there?',
    'Summarize supplier risk scores',
  ],
};

export function getSuggestions(module: CopilotModule): string[] {
  return MODULE_SUGGESTIONS[module] || MODULE_SUGGESTIONS.general;
}
