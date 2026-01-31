import type { IntentPattern } from '../types';

export const expenseIntents: IntentPattern[] = [
  {
    id: 'expense_list',
    module: 'expenses',
    action: 'list',
    patterns: [
      /show\s*(me\s*)?(all\s*)?expenses?/i,
      /list\s*(all\s*)?expenses?/i,
      /what\s+expenses?/i,
      /pending\s+expenses?/i,
    ],
    keywords: ['expense', 'expenses', 'show', 'list', 'pending'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/pending/i.test(query)) params.status = 'SUBMITTED';
      if (/approved/i.test(query)) params.status = 'APPROVED';
      if (/rejected/i.test(query)) params.status = 'REJECTED';
      if (/draft/i.test(query)) params.status = 'DRAFT';
      if (/reimbursed/i.test(query)) params.status = 'REIMBURSED';
      return params;
    },
    description: 'List expenses with optional status filter',
  },
  {
    id: 'expense_filter_category',
    module: 'expenses',
    action: 'filter',
    patterns: [
      /expenses?\s+(for|in|by)\s+(\w+)/i,
      /(travel|meals?|software|office|equipment)\s+expenses?/i,
    ],
    keywords: ['expense', 'category', 'travel', 'meals', 'software', 'office', 'equipment'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      const catMatch = query.match(/(travel|meals?|software|office|equipment)/i);
      if (catMatch) params.category = catMatch[1].toUpperCase();
      return params;
    },
    description: 'Filter expenses by category',
  },
  {
    id: 'expense_count',
    module: 'expenses',
    action: 'count',
    patterns: [
      /how\s+many\s+expenses?/i,
      /count\s+(of\s+)?expenses?/i,
      /number\s+of\s+expenses?/i,
      /total\s+expenses?/i,
    ],
    keywords: ['how many', 'count', 'number', 'total', 'expense'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/pending|approval/i.test(query)) params.status = 'SUBMITTED';
      if (/approved/i.test(query)) params.status = 'APPROVED';
      return params;
    },
    description: 'Count expenses',
  },
  {
    id: 'expense_summarize',
    module: 'expenses',
    action: 'summarize',
    patterns: [
      /summarize\s+expenses?/i,
      /expense\s+summary/i,
      /expenses?\s+by\s+category/i,
      /spending\s+by\s+category/i,
      /spend\s+breakdown/i,
      /overview\s+of\s+expenses?/i,
    ],
    keywords: ['summarize', 'summary', 'breakdown', 'overview', 'expense', 'category', 'spend'],
    description: 'Summarize expenses by category',
  },
];
