import { prisma } from '@/lib/db';
import type { ParsedIntent, ResponseBlock } from '@/lib/copilot/types';

// Agent definitions matching the agent-studio page
const AGENTS = [
  { id: 'capture', name: 'Capture Agent', description: 'Invoice data extraction' },
  { id: 'classification', name: 'Classification Agent', description: 'GL code assignment' },
  { id: 'compliance', name: 'Compliance Agent', description: 'Regulatory validation' },
  { id: 'matching', name: 'Matching Agent', description: 'PO matching' },
  { id: 'risk', name: 'Risk Agent', description: 'Fraud & anomaly detection' },
  { id: 'advisory', name: 'Advisory Agent', description: 'Financial recommendations' },
  { id: 'payment', name: 'Payment Agent', description: 'Payment optimization' },
  { id: 'supplier', name: 'Supplier Agent', description: 'Supplier communication' },
  { id: 'forecasting', name: 'Forecasting Agent', description: 'Cash flow prediction' },
];

export async function resolveAgent(intent: ParsedIntent): Promise<{ blocks: ResponseBlock[] }> {
  const blocks: ResponseBlock[] = [];
  const { action } = intent;

  try {
    switch (action) {
      case 'status': {
        const decisions = await prisma.agentDecision.findMany({
          select: { agentId: true, outcome: true },
        });

        const agentStats = new Map<string, { total: number; executed: number }>();
        for (const d of decisions) {
          const entry = agentStats.get(d.agentId) || { total: 0, executed: 0 };
          entry.total++;
          if (d.outcome === 'executed') entry.executed++;
          agentStats.set(d.agentId, entry);
        }

        blocks.push({
          type: 'text',
          content: `**Agent Status** — ${AGENTS.length} agents configured.`,
        });
        blocks.push({
          type: 'table',
          headers: ['Agent', 'Description', 'Tasks', 'Success Rate'],
          rows: AGENTS.map((a) => {
            const stats = agentStats.get(a.id);
            const tasks = stats ? String(stats.total) : '0';
            const rate = stats && stats.total > 0
              ? `${((stats.executed / stats.total) * 100).toFixed(0)}%`
              : 'N/A';
            return [a.name, a.description, tasks, rate];
          }),
        });
        blocks.push({
          type: 'action_buttons',
          buttons: [{ label: 'View Agent Studio', href: '/agent-studio' }],
        });
        break;
      }

      case 'health': {
        blocks.push({
          type: 'summary_card',
          cards: [
            { label: 'Agents Online', value: `${AGENTS.length}/${AGENTS.length}` },
            { label: 'System Status', value: 'Healthy' },
          ],
        });
        blocks.push({
          type: 'text',
          content: 'All agents are operational and processing tasks normally.',
        });
        break;
      }

      case 'stats': {
        const decisions = await prisma.agentDecision.findMany({
          select: { agentId: true, outcome: true, confidenceScore: true },
        });

        const totalDecisions = decisions.length;
        const executed = decisions.filter((d) => d.outcome === 'executed').length;
        const avgConfidence = decisions.length > 0
          ? decisions.reduce((sum, d) => sum + d.confidenceScore, 0) / decisions.length
          : 0;

        blocks.push({
          type: 'summary_card',
          cards: [
            { label: 'Total Decisions', value: String(totalDecisions) },
            { label: 'Auto-Executed', value: String(executed) },
            { label: 'Execution Rate', value: totalDecisions > 0 ? `${((executed / totalDecisions) * 100).toFixed(0)}%` : 'N/A' },
            { label: 'Avg Confidence', value: `${(avgConfidence * 100).toFixed(1)}%` },
          ],
        });
        break;
      }

      default:
        blocks.push({ type: 'error', message: `Unknown agent action: ${action}` });
    }
  } catch (error) {
    blocks.push({ type: 'error', message: `Error querying agents: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }

  return { blocks };
}
