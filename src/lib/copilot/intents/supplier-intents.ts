import type { IntentPattern } from '../types';

export const supplierIntents: IntentPattern[] = [
  {
    id: 'supplier_list',
    module: 'suppliers',
    action: 'list',
    patterns: [
      /show\s*(me\s*)?(all\s*)?suppliers?/i,
      /list\s*(all\s*)?suppliers?/i,
      /what\s+suppliers?/i,
      /active\s+suppliers?/i,
    ],
    keywords: ['supplier', 'suppliers', 'show', 'list', 'active', 'vendor'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/active/i.test(query)) params.active = 'true';
      if (/inactive/i.test(query)) params.active = 'false';
      return params;
    },
    description: 'List suppliers',
  },
  {
    id: 'supplier_filter_risk',
    module: 'suppliers',
    action: 'filter',
    patterns: [
      /high[\s-]risk\s+suppliers?/i,
      /suppliers?\s+with\s+(high|medium|low)\s+risk/i,
      /risky\s+suppliers?/i,
      /suppliers?\s+by\s+risk/i,
    ],
    keywords: ['supplier', 'risk', 'high', 'risky', 'score'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/high/i.test(query)) params.riskLevel = 'high';
      if (/medium/i.test(query)) params.riskLevel = 'medium';
      if (/low/i.test(query)) params.riskLevel = 'low';
      return params;
    },
    description: 'Filter suppliers by risk level',
  },
  {
    id: 'supplier_filter_compliance',
    module: 'suppliers',
    action: 'filter',
    patterns: [
      /non[\s-]compliant\s+suppliers?/i,
      /suppliers?\s+(that\s+are\s+)?non[\s-]compliant/i,
      /suppliers?\s+compliance/i,
    ],
    keywords: ['supplier', 'non-compliant', 'compliance', 'compliant'],
    extractParams: () => ({ compliance: 'non_compliant' }),
    description: 'Filter suppliers by compliance status',
  },
  {
    id: 'supplier_count',
    module: 'suppliers',
    action: 'count',
    patterns: [
      /how\s+many\s+suppliers?/i,
      /count\s+(of\s+)?suppliers?/i,
      /number\s+of\s+suppliers?/i,
      /total\s+suppliers?/i,
    ],
    keywords: ['how many', 'count', 'number', 'total', 'supplier'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/active/i.test(query)) params.active = 'true';
      if (/high[\s-]risk/i.test(query)) params.riskLevel = 'high';
      return params;
    },
    description: 'Count suppliers',
  },
  {
    id: 'supplier_find',
    module: 'suppliers',
    action: 'find',
    patterns: [
      /find\s+supplier\s+(.+)/i,
      /search\s+(for\s+)?supplier\s+(.+)/i,
      /look\s+up\s+supplier\s+(.+)/i,
    ],
    keywords: ['find', 'supplier', 'search', 'look up'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      const match = query.match(/(?:find|search\s+for?|look\s+up)\s+supplier\s+(.+?)$/i);
      if (match) params.name = match[1].trim();
      return params;
    },
    description: 'Find a supplier by name',
  },
];
