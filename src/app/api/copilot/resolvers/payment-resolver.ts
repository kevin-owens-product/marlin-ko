import { prisma } from '@/lib/db';
import type { ParsedIntent, ResponseBlock } from '@/lib/copilot/types';
import { formatCurrency, formatDate } from './index';

const MAX_TABLE_ROWS = 10;

export async function resolvePayment(intent: ParsedIntent): Promise<{ blocks: ResponseBlock[] }> {
  const blocks: ResponseBlock[] = [];
  const { action, params } = intent;

  try {
    switch (action) {
      case 'list':
      case 'filter': {
        const where: Record<string, unknown> = {};
        if (params.status) where.status = params.status;
        if (params.method) where.method = params.method;

        const [batches, totalCount] = await Promise.all([
          prisma.paymentBatch.findMany({
            where,
            take: MAX_TABLE_ROWS,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.paymentBatch.count({ where }),
        ]);

        blocks.push({
          type: 'text',
          content: `Found **${totalCount}** payment batch${totalCount !== 1 ? 'es' : ''}.${totalCount > MAX_TABLE_ROWS ? ` Showing the most recent ${MAX_TABLE_ROWS}.` : ''}`,
        });

        if (batches.length > 0) {
          blocks.push({
            type: 'table',
            headers: ['Batch ID', 'Method', 'Amount', 'Payments', 'Status', 'Date'],
            rows: batches.map((b) => [
              b.id.slice(0, 8),
              b.method,
              formatCurrency(b.totalAmount, b.currency),
              String(b.paymentCount),
              b.status,
              formatDate(b.createdAt),
            ]),
            totalCount,
          });
          blocks.push({
            type: 'action_buttons',
            buttons: [{ label: 'View All Payments', href: '/payments' }],
          });
        }
        break;
      }

      case 'count': {
        const where: Record<string, unknown> = {};
        if (params.status) where.status = params.status;
        if (params.period === 'month') {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          where.createdAt = { gte: monthAgo };
        }

        const [count, totalAmount] = await Promise.all([
          prisma.paymentBatch.count({ where }),
          prisma.paymentBatch.findMany({ where, select: { totalAmount: true } }),
        ]);

        const sum = totalAmount.reduce((acc, b) => acc + b.totalAmount, 0);
        const label = params.status || 'Total';

        blocks.push({
          type: 'summary_card',
          cards: [
            { label: `${label} Batches`, value: String(count) },
            { label: 'Total Amount', value: formatCurrency(sum) },
          ],
        });
        break;
      }

      case 'summarize': {
        const allBatches = await prisma.paymentBatch.findMany({
          select: { method: true, totalAmount: true, status: true, paymentCount: true },
        });

        const methodMap = new Map<string, { count: number; total: number; payments: number }>();
        for (const b of allBatches) {
          const entry = methodMap.get(b.method) || { count: 0, total: 0, payments: 0 };
          entry.count++;
          entry.total += b.totalAmount;
          entry.payments += b.paymentCount;
          methodMap.set(b.method, entry);
        }

        const totalAmount = allBatches.reduce((sum, b) => sum + b.totalAmount, 0);

        blocks.push({
          type: 'text',
          content: `**Payment Summary** — ${allBatches.length} batches totaling ${formatCurrency(totalAmount)}.`,
        });
        blocks.push({
          type: 'table',
          headers: ['Method', 'Batches', 'Payments', 'Total Amount'],
          rows: Array.from(methodMap.entries())
            .sort(([, a], [, b]) => b.total - a.total)
            .map(([method, data]) => [
              method,
              String(data.count),
              String(data.payments),
              formatCurrency(data.total),
            ]),
        });
        break;
      }

      default:
        blocks.push({ type: 'error', message: `Unknown payment action: ${action}` });
    }
  } catch (error) {
    blocks.push({ type: 'error', message: `Error querying payments: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }

  return { blocks };
}
