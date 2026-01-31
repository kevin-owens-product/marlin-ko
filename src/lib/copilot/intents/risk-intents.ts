import type { IntentPattern } from '../types';

export const riskIntents: IntentPattern[] = [
  {
    id: 'risk_list',
    module: 'risk',
    action: 'list',
    patterns: [
      /show\s*(me\s*)?(all\s*)?risk\s+alerts?/i,
      /list\s*(all\s*)?risk\s+alerts?/i,
      /what\s+risk\s+alerts?/i,
      /open\s+alerts?/i,
      /active\s+alerts?/i,
    ],
    keywords: ['risk', 'alert', 'alerts', 'show', 'list', 'open', 'active'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/open/i.test(query)) params.status = 'OPEN';
      if (/investigating/i.test(query)) params.status = 'INVESTIGATING';
      if (/resolved/i.test(query)) params.status = 'RESOLVED';
      return params;
    },
    description: 'List risk alerts',
  },
  {
    id: 'risk_filter_severity',
    module: 'risk',
    action: 'filter',
    patterns: [
      /critical\s+(risk\s+)?alerts?/i,
      /high\s+severity\s+alerts?/i,
      /(critical|high|medium|low)\s+risk/i,
      /alerts?\s+with\s+(critical|high|medium|low)\s+severity/i,
    ],
    keywords: ['critical', 'high', 'severity', 'risk', 'alert'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      const match = query.match(/(critical|high|medium|low)/i);
      if (match) params.severity = match[1].toUpperCase();
      return params;
    },
    description: 'Filter risk alerts by severity',
  },
  {
    id: 'risk_filter_type',
    module: 'risk',
    action: 'filter',
    patterns: [
      /(fraud|duplicate|anomaly|compliance)\s+(risk\s+)?alerts?/i,
      /alerts?\s+for\s+(fraud|duplicate|anomaly|compliance)/i,
    ],
    keywords: ['fraud', 'duplicate', 'anomaly', 'compliance', 'risk', 'alert'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      const match = query.match(/(fraud|duplicate|anomaly|compliance)/i);
      if (match) params.riskType = match[1].toUpperCase();
      return params;
    },
    description: 'Filter risk alerts by type',
  },
  {
    id: 'risk_count',
    module: 'risk',
    action: 'count',
    patterns: [
      /how\s+many\s+(risk\s+)?alerts?/i,
      /count\s+(of\s+)?(risk\s+)?alerts?/i,
      /number\s+of\s+(risk\s+)?alerts?/i,
      /total\s+(risk\s+)?alerts?/i,
    ],
    keywords: ['how many', 'count', 'number', 'total', 'risk', 'alert'],
    extractParams: (query: string) => {
      const params: Record<string, string> = {};
      if (/open/i.test(query)) params.status = 'OPEN';
      if (/critical/i.test(query)) params.severity = 'CRITICAL';
      return params;
    },
    description: 'Count risk alerts',
  },
  {
    id: 'risk_summarize',
    module: 'risk',
    action: 'summarize',
    patterns: [
      /summarize\s+(risk\s+)?alerts?/i,
      /risk\s+(alert\s+)?summary/i,
      /alerts?\s+by\s+severity/i,
      /overview\s+of\s+(risk|alerts?)/i,
    ],
    keywords: ['summarize', 'summary', 'overview', 'risk', 'alert', 'severity'],
    description: 'Summarize risk alerts by severity',
  },
];
