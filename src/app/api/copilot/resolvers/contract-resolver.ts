import { prisma } from '@/lib/db';
import type { ParsedIntent, ResponseBlock } from '@/lib/copilot/types';
import { formatCurrency, formatDate } from './index';

const MAX_TABLE_ROWS = 10;

export async function resolveContract(intent: ParsedIntent): Promise<{ blocks: ResponseBlock[] }> {
  const blocks: ResponseBlock[] = [];
  const { action, params } = intent;

  try {
    switch (action) {
      case 'list':
      case 'filter': {
        const where: Record<string, unknown> = {};
        if (params.status === 'EXPIRING') {
          const thirtyDays = new Date();
          thirtyDays.setDate(thirtyDays.getDate() + 30);
          where.endDate = { lte: thirtyDays };
          where.status = { in: ['ACTIVE', 'EXPIRING'] };
        } else if (params.status) {
          where.status = params.status;
        }

        const [contracts, totalCount] = await Promise.all([
          prisma.contract.findMany({
            where,
            take: MAX_TABLE_ROWS,
            orderBy: { endDate: 'asc' },
            include: { supplier: { select: { name: true } } },
          }),
          prisma.contract.count({ where }),
        ]);

        const label = params.status === 'EXPIRING' ? 'expiring (within 30 days)' : '';
        blocks.push({
          type: 'text',
          content: `Found **${totalCount}** ${label} contract${totalCount !== 1 ? 's' : ''}.${totalCount > MAX_TABLE_ROWS ? ` Showing ${MAX_TABLE_ROWS}.` : ''}`,
        });

        if (contracts.length > 0) {
          blocks.push({
            type: 'table',
            headers: ['Title', 'Supplier', 'Value', 'Status', 'End Date'],
            rows: contracts.map((c) => [
              c.title,
              c.supplier?.name || 'Unknown',
              formatCurrency(c.value, c.currency),
              c.status,
              formatDate(c.endDate),
            ]),
            totalCount,
          });
          blocks.push({
            type: 'action_buttons',
            buttons: [{ label: 'View All Contracts', href: '/contracts' }],
          });
        }
        break;
      }

      case 'count': {
        const where: Record<string, unknown> = {};
        if (params.status === 'EXPIRING') {
          const thirtyDays = new Date();
          thirtyDays.setDate(thirtyDays.getDate() + 30);
          where.endDate = { lte: thirtyDays };
          where.status = { in: ['ACTIVE', 'EXPIRING'] };
        } else if (params.status) {
          where.status = params.status;
        }

        const count = await prisma.contract.count({ where });
        const label = params.status || 'Total';

        blocks.push({
          type: 'summary_card',
          cards: [{ label: `${label} Contracts`, value: String(count) }],
        });
        break;
      }

      case 'summarize': {
        const allContracts = await prisma.contract.findMany({ select: { status: true, value: true } });
        const statusMap = new Map<string, { count: number; total: number }>();
        for (const c of allContracts) {
          const entry = statusMap.get(c.status) || { count: 0, total: 0 };
          entry.count++;
          entry.total += c.value;
          statusMap.set(c.status, entry);
        }

        blocks.push({
          type: 'text',
          content: `**Contract Summary** — ${allContracts.length} total across ${statusMap.size} statuses.`,
        });
        blocks.push({
          type: 'table',
          headers: ['Status', 'Count', 'Total Value'],
          rows: Array.from(statusMap.entries()).map(([status, data]) => [
            status,
            String(data.count),
            formatCurrency(data.total),
          ]),
        });
        break;
      }

      default:
        blocks.push({ type: 'error', message: `Unknown contract action: ${action}` });
    }
  } catch (error) {
    blocks.push({ type: 'error', message: `Error querying contracts: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }

  return { blocks };
}
