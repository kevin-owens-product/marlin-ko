import type { IntentPattern } from '../types';

export const contractIntents: IntentPattern[] = [
  {
    id: 'contract_list',
    module: 'contracts',
    action: 'list',
    patterns: [
      /show\s*(me\s*)?(all\s*)?contracts?/i,
      /list\s*(all\s*)?contracts?/i,
      /what\s+contracts?/i,
      /active\s+contracts?/i,
    ],
    keywords: ['contract', 'contracts', 'show', 'list', 'active'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/active/i.test(query)) params.status = 'ACTIVE';
      if (/draft/i.test(query)) params.status = 'DRAFT';
      if (/expired/i.test(query)) params.status = 'EXPIRED';
      if (/terminated/i.test(query)) params.status = 'TERMINATED';
      return params;
    },
    description: 'List contracts with optional status filter',
  },
  {
    id: 'contract_expiring',
    module: 'contracts',
    action: 'filter',
    patterns: [
      /expiring\s+contracts?/i,
      /contracts?\s+(that\s+are\s+)?expiring/i,
      /contracts?\s+up\s+for\s+renewal/i,
      /contracts?\s+ending\s+soon/i,
    ],
    keywords: ['expiring', 'renewal', 'ending', 'contract', 'soon'],
    extractParams: () => ({ status: 'EXPIRING' }),
    description: 'Find expiring contracts',
  },
  {
    id: 'contract_count',
    module: 'contracts',
    action: 'count',
    patterns: [
      /how\s+many\s+contracts?/i,
      /count\s+(of\s+)?contracts?/i,
      /number\s+of\s+contracts?/i,
      /total\s+contracts?/i,
    ],
    keywords: ['how many', 'count', 'number', 'total', 'contract'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/expiring/i.test(query)) params.status = 'EXPIRING';
      if (/active/i.test(query)) params.status = 'ACTIVE';
      if (/expired/i.test(query)) params.status = 'EXPIRED';
      return params;
    },
    description: 'Count contracts',
  },
  {
    id: 'contract_summarize',
    module: 'contracts',
    action: 'summarize',
    patterns: [
      /summarize\s+contracts?/i,
      /contract\s+summary/i,
      /overview\s+of\s+contracts?/i,
    ],
    keywords: ['summarize', 'summary', 'overview', 'contract'],
    description: 'Summarize contracts by status',
  },
];
