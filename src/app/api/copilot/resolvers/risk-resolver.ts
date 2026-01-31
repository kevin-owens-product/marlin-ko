import { prisma } from '@/lib/db';
import type { ParsedIntent, ResponseBlock } from '@/lib/copilot/types';
import { formatDate } from './index';

const MAX_TABLE_ROWS = 10;

export async function resolveRisk(intent: ParsedIntent): Promise<{ blocks: ResponseBlock[] }> {
  const blocks: ResponseBlock[] = [];
  const { action, params } = intent;

  try {
    switch (action) {
      case 'list':
      case 'filter': {
        const where: Record<string, unknown> = {};
        if (params.status) where.status = params.status;
        if (params.severity) where.severity = params.severity;
        if (params.riskType) where.riskType = params.riskType;

        // Default to open alerts
        if (!params.status && !params.severity && !params.riskType) {
          where.status = 'OPEN';
        }

        const [alerts, totalCount] = await Promise.all([
          prisma.riskAlert.findMany({
            where,
            take: MAX_TABLE_ROWS,
            orderBy: { detectedAt: 'desc' },
          }),
          prisma.riskAlert.count({ where }),
        ]);

        blocks.push({
          type: 'text',
          content: `Found **${totalCount}** risk alert${totalCount !== 1 ? 's' : ''}.${totalCount > MAX_TABLE_ROWS ? ` Showing the most recent ${MAX_TABLE_ROWS}.` : ''}`,
        });

        if (alerts.length > 0) {
          blocks.push({
            type: 'table',
            headers: ['Type', 'Severity', 'Description', 'Status', 'Detected'],
            rows: alerts.map((a) => [
              a.riskType,
              a.severity,
              a.description.length > 50 ? a.description.slice(0, 50) + '...' : a.description,
              a.status,
              formatDate(a.detectedAt),
            ]),
            totalCount,
          });
          blocks.push({
            type: 'action_buttons',
            buttons: [{ label: 'View Risk Dashboard', href: '/risk-dashboard' }],
          });
        }
        break;
      }

      case 'count': {
        const where: Record<string, unknown> = {};
        if (params.status) where.status = params.status;
        if (params.severity) where.severity = params.severity;
        if (!params.status) where.status = 'OPEN';

        const count = await prisma.riskAlert.count({ where });
        const label = params.severity ? `${params.severity}` : 'Open';

        blocks.push({
          type: 'summary_card',
          cards: [{ label: `${label} Risk Alerts`, value: String(count) }],
        });
        break;
      }

      case 'summarize': {
        const allAlerts = await prisma.riskAlert.findMany({
          where: { status: 'OPEN' },
          select: { severity: true, riskType: true },
        });

        const severityMap = new Map<string, number>();
        const typeMap = new Map<string, number>();
        for (const a of allAlerts) {
          severityMap.set(a.severity, (severityMap.get(a.severity) || 0) + 1);
          typeMap.set(a.riskType, (typeMap.get(a.riskType) || 0) + 1);
        }

        blocks.push({
          type: 'summary_card',
          cards: [
            { label: 'Total Open', value: String(allAlerts.length) },
            { label: 'Critical', value: String(severityMap.get('CRITICAL') || 0) },
            { label: 'High', value: String(severityMap.get('HIGH') || 0) },
            { label: 'Medium', value: String(severityMap.get('MEDIUM') || 0) },
          ],
        });

        blocks.push({
          type: 'table',
          headers: ['Risk Type', 'Open Alerts'],
          rows: Array.from(typeMap.entries())
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => [type, String(count)]),
        });
        break;
      }

      default:
        blocks.push({ type: 'error', message: `Unknown risk action: ${action}` });
    }
  } catch (error) {
    blocks.push({ type: 'error', message: `Error querying risk alerts: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }

  return { blocks };
}
