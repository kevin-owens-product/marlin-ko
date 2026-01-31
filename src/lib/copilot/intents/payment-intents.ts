import type { IntentPattern } from '../types';

export const paymentIntents: IntentPattern[] = [
  {
    id: 'payment_list',
    module: 'payments',
    action: 'list',
    patterns: [
      /show\s*(me\s*)?(all\s*)?payments?/i,
      /list\s*(all\s*)?payments?/i,
      /what\s+payments?/i,
      /pending\s+payments?/i,
      /payment\s+batches?/i,
    ],
    keywords: ['payment', 'payments', 'show', 'list', 'pending', 'batch'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/pending/i.test(query)) params.status = 'PENDING';
      if (/processing/i.test(query)) params.status = 'PROCESSING';
      if (/completed/i.test(query)) params.status = 'COMPLETED';
      if (/failed/i.test(query)) params.status = 'FAILED';
      return params;
    },
    description: 'List payments with optional status filter',
  },
  {
    id: 'payment_filter_method',
    module: 'payments',
    action: 'filter',
    patterns: [
      /payments?\s+by\s+(ach|wire|check|sepa|bacs|virtual\s+card)/i,
      /(ach|wire|check|sepa|bacs)\s+payments?/i,
    ],
    keywords: ['payment', 'method', 'ACH', 'wire', 'check', 'SEPA', 'BACS'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      const match = query.match(/(ach|wire|check|sepa|bacs|virtual\s+card)/i);
      if (match) params.method = match[1].toUpperCase().replace(/\s+/g, '_');
      return params;
    },
    description: 'Filter payments by method',
  },
  {
    id: 'payment_count',
    module: 'payments',
    action: 'count',
    patterns: [
      /how\s+many\s+payments?/i,
      /count\s+(of\s+)?payments?/i,
      /number\s+of\s+payments?/i,
      /total\s+payments?/i,
      /total\s+paid/i,
    ],
    keywords: ['how many', 'count', 'number', 'total', 'payment', 'paid'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/pending/i.test(query)) params.status = 'PENDING';
      if (/processing/i.test(query)) params.status = 'PROCESSING';
      if (/this\s+month/i.test(query)) params.period = 'month';
      return params;
    },
    description: 'Count payments',
  },
  {
    id: 'payment_summarize',
    module: 'payments',
    action: 'summarize',
    patterns: [
      /summarize\s+payments?/i,
      /payment\s+summary/i,
      /payments?\s+by\s+method/i,
      /overview\s+of\s+payments?/i,
      /payment\s+overview/i,
    ],
    keywords: ['summarize', 'summary', 'breakdown', 'overview', 'payment', 'method'],
    description: 'Summarize payments by method and status',
  },
];
