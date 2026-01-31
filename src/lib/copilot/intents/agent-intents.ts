import type { IntentPattern } from '../types';

export const agentIntents: IntentPattern[] = [
  {
    id: 'agent_status',
    module: 'agents',
    action: 'status',
    patterns: [
      /agent\s+status/i,
      /show\s*(me\s*)?agent\s+status/i,
      /what\s+agents?\s+are\s+(running|active)/i,
      /which\s+agents?\s+are\s+(active|online)/i,
      /status\s+of\s+agents?/i,
    ],
    keywords: ['agent', 'status', 'active', 'running', 'online'],
    description: 'Show agent status',
  },
  {
    id: 'agent_health',
    module: 'agents',
    action: 'health',
    patterns: [
      /are\s+(all\s+)?agents?\s+(healthy|ok|working)/i,
      /agent\s+health/i,
      /health\s+check/i,
      /system\s+health/i,
    ],
    keywords: ['agent', 'health', 'healthy', 'check', 'system'],
    description: 'Check agent health',
  },
  {
    id: 'agent_stats',
    module: 'agents',
    action: 'stats',
    patterns: [
      /agent\s+(processing\s+)?stats/i,
      /how\s+many\s+(tasks?\s+)?agents?\s+(processed|completed)/i,
      /agent\s+performance/i,
      /processing\s+stats/i,
    ],
    keywords: ['agent', 'stats', 'processing', 'performance', 'tasks'],
    description: 'Show agent processing stats',
  },
];
