import type { IntentPattern } from '../types';

export const invoiceIntents: IntentPattern[] = [
  {
    id: 'invoice_list',
    module: 'invoices',
    action: 'list',
    patterns: [
      /show\s*(me\s*)?(all\s*)?invoices/i,
      /list\s*(all\s*)?invoices/i,
      /what\s+invoices/i,
      /pending\s+invoices/i,
      /overdue\s+invoices/i,
      /recent\s+invoices/i,
    ],
    keywords: ['invoice', 'invoices', 'show', 'list', 'pending', 'overdue'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/pending/i.test(query)) params.status = 'extracted';
      if (/overdue/i.test(query)) params.status = 'overdue';
      if (/approved/i.test(query)) params.status = 'approved';
      if (/rejected/i.test(query)) params.status = 'rejected';
      if (/flagged/i.test(query)) params.status = 'flagged_for_review';
      if (/paid/i.test(query)) params.status = 'paid';
      return params;
    },
    description: 'List invoices with optional status filter',
  },
  {
    id: 'invoice_filter_status',
    module: 'invoices',
    action: 'filter',
    patterns: [
      /invoices?\s+(with\s+)?status\s+(\w+)/i,
      /(\w+)\s+invoices?/i,
      /invoices?\s+that\s+are\s+(\w+)/i,
    ],
    keywords: ['invoice', 'status', 'approved', 'rejected', 'pending', 'paid', 'flagged'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      const statusMatch = query.match(/(?:status\s+|that\s+are\s+|^)(approved|rejected|pending|paid|flagged|extracted|matched|classified)/i);
      if (statusMatch) params.status = statusMatch[1].toLowerCase();
      return params;
    },
    description: 'Filter invoices by status',
  },
  {
    id: 'invoice_filter_vendor',
    module: 'invoices',
    action: 'filter',
    patterns: [
      /invoices?\s+(from|by|for)\s+(.+)/i,
      /invoices?\s+from\s+/i,
    ],
    keywords: ['invoice', 'from', 'vendor', 'supplier'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      const vendorMatch = query.match(/(?:from|by|for)\s+(.+?)(?:\s*$)/i);
      if (vendorMatch) params.vendor = vendorMatch[1].trim();
      return params;
    },
    description: 'Filter invoices by vendor',
  },
  {
    id: 'invoice_filter_amount',
    module: 'invoices',
    action: 'filter',
    patterns: [
      /invoices?\s+(over|above|greater\s+than|more\s+than)\s+\$?([\d,]+)/i,
      /invoices?\s+(under|below|less\s+than)\s+\$?([\d,]+)/i,
      /large\s+invoices?/i,
    ],
    keywords: ['invoice', 'over', 'above', 'under', 'below', 'amount', 'large'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      const overMatch = query.match(/(?:over|above|greater\s+than|more\s+than)\s+\$?([\d,]+)/i);
      if (overMatch) params.minAmount = overMatch[1].replace(/,/g, '');
      const underMatch = query.match(/(?:under|below|less\s+than)\s+\$?([\d,]+)/i);
      if (underMatch) params.maxAmount = underMatch[1].replace(/,/g, '');
      if (/large/i.test(query)) params.minAmount = '10000';
      return params;
    },
    description: 'Filter invoices by amount',
  },
  {
    id: 'invoice_count',
    module: 'invoices',
    action: 'count',
    patterns: [
      /how\s+many\s+invoices?/i,
      /count\s+(of\s+)?invoices?/i,
      /number\s+of\s+invoices?/i,
      /total\s+invoices?/i,
    ],
    keywords: ['how many', 'count', 'number', 'total', 'invoice'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/pending/i.test(query)) params.status = 'extracted';
      if (/approved/i.test(query)) params.status = 'approved';
      if (/rejected/i.test(query)) params.status = 'rejected';
      if (/today/i.test(query)) params.period = 'today';
      if (/this\s+week/i.test(query)) params.period = 'week';
      if (/this\s+month/i.test(query)) params.period = 'month';
      if (/processed/i.test(query)) params.status = 'approved';
      return params;
    },
    description: 'Count invoices with optional filters',
  },
  {
    id: 'invoice_summarize',
    module: 'invoices',
    action: 'summarize',
    patterns: [
      /summarize\s+invoices?/i,
      /invoice\s+summary/i,
      /invoices?\s+(by\s+)?status\s+breakdown/i,
      /overview\s+of\s+invoices?/i,
      /invoice\s+overview/i,
    ],
    keywords: ['summarize', 'summary', 'breakdown', 'overview', 'invoice'],
    description: 'Summarize invoices by status',
  },
  {
    id: 'invoice_find',
    module: 'invoices',
    action: 'find',
    patterns: [
      /find\s+invoice\s+#?\s*([\w-]+)/i,
      /invoice\s+#?\s*(INV[\w-]+)/i,
      /look\s+up\s+invoice\s+#?\s*([\w-]+)/i,
    ],
    keywords: ['find', 'invoice', 'look up', 'search'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      const numMatch = query.match(/(?:invoice|find|look\s+up)\s+#?\s*([\w-]+)/i);
      if (numMatch) params.invoiceNumber = numMatch[1];
      return params;
    },
    description: 'Find a specific invoice by number',
  },
];
