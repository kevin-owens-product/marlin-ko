import { prisma } from '@/lib/db';
import type { ParsedIntent, ResponseBlock } from '@/lib/copilot/types';
import { formatCurrency, formatDate } from './index';

const MAX_TABLE_ROWS = 10;

export async function resolvePurchaseOrder(intent: ParsedIntent): Promise<{ blocks: ResponseBlock[] }> {
  const blocks: ResponseBlock[] = [];
  const { action, params } = intent;

  try {
    switch (action) {
      case 'list':
      case 'filter': {
        const where: Record<string, unknown> = {};
        if (params.status) where.status = params.status;
        if (params.supplier) {
          where.supplier = { name: { contains: params.supplier } };
        }

        const [pos, totalCount] = await Promise.all([
          prisma.purchaseOrder.findMany({
            where,
            take: MAX_TABLE_ROWS,
            orderBy: { createdAt: 'desc' },
            include: { supplier: { select: { name: true } } },
          }),
          prisma.purchaseOrder.count({ where }),
        ]);

        blocks.push({
          type: 'text',
          content: `Found **${totalCount}** purchase order${totalCount !== 1 ? 's' : ''}.${totalCount > MAX_TABLE_ROWS ? ` Showing the most recent ${MAX_TABLE_ROWS}.` : ''}`,
        });

        if (pos.length > 0) {
          blocks.push({
            type: 'table',
            headers: ['PO #', 'Supplier', 'Amount', 'Status', 'Date'],
            rows: pos.map((po) => [
              po.poNumber,
              po.supplier?.name || 'Unknown',
              formatCurrency(po.totalAmount, po.currency),
              po.status,
              formatDate(po.createdAt),
            ]),
            totalCount,
          });
          blocks.push({
            type: 'action_buttons',
            buttons: [{ label: 'View All POs', href: '/purchase-orders' }],
          });
        }
        break;
      }

      case 'count': {
        const where: Record<string, unknown> = {};
        if (params.status) where.status = params.status;

        const count = await prisma.purchaseOrder.count({ where });
        const label = params.status || 'Total';

        blocks.push({
          type: 'summary_card',
          cards: [{ label: `${label} Purchase Orders`, value: String(count) }],
        });
        break;
      }

      case 'summarize': {
        const allPOs = await prisma.purchaseOrder.findMany({ select: { status: true, totalAmount: true } });
        const statusMap = new Map<string, { count: number; total: number }>();
        for (const po of allPOs) {
          const entry = statusMap.get(po.status) || { count: 0, total: 0 };
          entry.count++;
          entry.total += po.totalAmount;
          statusMap.set(po.status, entry);
        }

        blocks.push({
          type: 'text',
          content: `**Purchase Order Summary** — ${allPOs.length} total across ${statusMap.size} statuses.`,
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
        blocks.push({ type: 'error', message: `Unknown PO action: ${action}` });
    }
  } catch (error) {
    blocks.push({ type: 'error', message: `Error querying purchase orders: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }

  return { blocks };
}
