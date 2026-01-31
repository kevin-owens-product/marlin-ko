import type { IntentPattern } from '../types';

export const cashflowIntents: IntentPattern[] = [
  {
    id: 'cashflow_summarize',
    module: 'cashflow',
    action: 'summarize',
    patterns: [
      /cash\s+(flow|position)/i,
      /what\s+is\s+(our|the)\s+cash\s+(flow|position)/i,
      /summarize\s+cash\s*flow/i,
      /cash\s*flow\s+summary/i,
      /current\s+balance/i,
      /how\s+much\s+cash/i,
    ],
    keywords: ['cash', 'flow', 'position', 'balance', 'summary'],
    description: 'Summarize current cash position',
  },
  {
    id: 'cashflow_forecast',
    module: 'cashflow',
    action: 'forecast',
    patterns: [
      /cash\s*flow\s+forecast/i,
      /forecast\s+cash\s*flow/i,
      /show\s*(me\s*)?the\s+forecast/i,
      /upcoming\s+cash\s*flow/i,
      /projected\s+cash/i,
    ],
    keywords: ['forecast', 'cash', 'flow', 'projected', 'upcoming'],
    description: 'Show cash flow forecast',
  },
  {
    id: 'cashflow_net',
    module: 'cashflow',
    action: 'net',
    patterns: [
      /net\s+(cash\s+)?position/i,
      /inflows?\s+(vs|versus|and)\s+outflows?/i,
      /net\s+cash\s*flow/i,
    ],
    keywords: ['net', 'position', 'inflow', 'outflow', 'cash'],
    description: 'Show net cash position (inflows vs outflows)',
  },
];
