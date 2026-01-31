import type { IntentPattern } from '../types';

export const purchaseOrderIntents: IntentPattern[] = [
  {
    id: 'po_list',
    module: 'purchase_orders',
    action: 'list',
    patterns: [
      /show\s*(me\s*)?(all\s*)?(purchase\s+orders?|pos?\b)/i,
      /list\s*(all\s*)?(purchase\s+orders?|pos?\b)/i,
      /what\s+(purchase\s+orders?|pos?)\b/i,
      /open\s+(purchase\s+orders?|pos?)\b/i,
    ],
    keywords: ['purchase order', 'PO', 'show', 'list', 'open'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/open/i.test(query)) params.status = 'APPROVED';
      if (/draft/i.test(query)) params.status = 'DRAFT';
      if (/closed/i.test(query)) params.status = 'CLOSED';
      if (/received/i.test(query)) params.status = 'RECEIVED';
      if (/partial/i.test(query)) params.status = 'PARTIALLY_RECEIVED';
      return params;
    },
    description: 'List purchase orders with optional status filter',
  },
  {
    id: 'po_filter_supplier',
    module: 'purchase_orders',
    action: 'filter',
    patterns: [
      /(purchase\s+orders?|pos?)\s+(from|for|by)\s+(.+)/i,
    ],
    keywords: ['purchase order', 'PO', 'from', 'supplier', 'for'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      const match = query.match(/(?:from|for|by)\s+(.+?)(?:\s*$)/i);
      if (match) params.supplier = match[1].trim();
      return params;
    },
    description: 'Filter POs by supplier',
  },
  {
    id: 'po_count',
    module: 'purchase_orders',
    action: 'count',
    patterns: [
      /how\s+many\s+(purchase\s+orders?|pos?)\b/i,
      /count\s+(of\s+)?(purchase\s+orders?|pos?)\b/i,
      /number\s+of\s+(purchase\s+orders?|pos?)\b/i,
      /total\s+(purchase\s+orders?|pos?)\b/i,
    ],
    keywords: ['how many', 'count', 'number', 'total', 'purchase order', 'PO'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/pending|approval/i.test(query)) params.status = 'DRAFT';
      if (/open/i.test(query)) params.status = 'APPROVED';
      return params;
    },
    description: 'Count purchase orders',
  },
  {
    id: 'po_summarize',
    module: 'purchase_orders',
    action: 'summarize',
    patterns: [
      /summarize\s+(purchase\s+orders?|pos?)\b/i,
      /(purchase\s+order|po)\s+summary/i,
      /overview\s+of\s+(purchase\s+orders?|pos?)\b/i,
    ],
    keywords: ['summarize', 'summary', 'overview', 'purchase order', 'PO'],
    description: 'Summarize purchase orders by status',
  },
];
