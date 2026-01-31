import type { IntentPattern } from '../types';

export const dashboardIntents: IntentPattern[] = [
  {
    id: 'dashboard_overview',
    module: 'dashboard',
    action: 'overview',
    patterns: [
      /give\s+me\s+(an?\s+)?overview/i,
      /show\s*(me\s*)?(an?\s+)?overview/i,
      /what['']?s\s+happening/i,
      /how\s+are\s+things/i,
      /operations?\s+overview/i,
      /summary\s+of\s+(everything|operations?|all)/i,
    ],
    keywords: ['overview', 'summary', 'happening', 'operations', 'everything'],
    description: 'Show operations overview',
  },
  {
    id: 'dashboard_metrics',
    module: 'dashboard',
    action: 'metrics',
    patterns: [
      /key\s+metrics/i,
      /what\s+are\s+the\s+(key\s+)?metrics/i,
      /show\s*(me\s*)?(key\s+)?metrics/i,
      /kpi/i,
      /dashboard\s+stats?/i,
      /today['']?s\s+(numbers?|metrics?|stats?)/i,
    ],
    keywords: ['metrics', 'KPI', 'stats', 'numbers', 'key', 'dashboard', 'today'],
    description: 'Show key metrics',
  },
];
