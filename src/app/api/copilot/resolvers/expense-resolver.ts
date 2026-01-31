import { prisma } from '@/lib/db';
import type { ParsedIntent, ResponseBlock } from '@/lib/copilot/types';
import { formatCurrency, formatDate } from './index';

const MAX_TABLE_ROWS = 10;

export async function resolveExpense(intent: ParsedIntent): Promise<{ blocks: ResponseBlock[] }> {
  const blocks: ResponseBlock[] = [];
  const { action, params } = intent;

  try {
    switch (action) {
      case 'list':
      case 'filter': {
        const where: Record<string, unknown> = {};
        if (params.status) where.status = params.status;
        if (params.category) where.category = params.category;

        const [expenses, totalCount] = await Promise.all([
          prisma.expense.findMany({
            where,
            take: MAX_TABLE_ROWS,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } },
          }),
          prisma.expense.count({ where }),
        ]);

        blocks.push({
          type: 'text',
          content: `Found **${totalCount}** expense${totalCount !== 1 ? 's' : ''}.${totalCount > MAX_TABLE_ROWS ? ` Showing the most recent ${MAX_TABLE_ROWS}.` : ''}`,
        });

        if (expenses.length > 0) {
          blocks.push({
            type: 'table',
            headers: ['Employee', 'Category', 'Amount', 'Status', 'Date'],
            rows: expenses.map((e) => [
              e.user?.name || 'Unknown',
              e.category,
              formatCurrency(e.amount, e.currency),
              e.status,
              formatDate(e.expenseDate),
            ]),
            totalCount,
          });
          blocks.push({
            type: 'action_buttons',
            buttons: [{ label: 'View All Expenses', href: '/expenses' }],
          });
        }
        break;
      }

      case 'count': {
        const where: Record<string, unknown> = {};
        if (params.status) where.status = params.status;

        const count = await prisma.expense.count({ where });
        const label = params.status || 'Total';

        blocks.push({
          type: 'summary_card',
          cards: [{ label: `${label} Expenses`, value: String(count) }],
        });
        break;
      }

      case 'summarize': {
        const allExpenses = await prisma.expense.findMany({ select: { category: true, amount: true, status: true } });
        const catMap = new Map<string, { count: number; total: number }>();
        for (const e of allExpenses) {
          const entry = catMap.get(e.category) || { count: 0, total: 0 };
          entry.count++;
          entry.total += e.amount;
          catMap.set(e.category, entry);
        }

        const totalAmount = allExpenses.reduce((sum, e) => sum + e.amount, 0);

        blocks.push({
          type: 'text',
          content: `**Expense Summary** — ${allExpenses.length} total expenses worth ${formatCurrency(totalAmount)}.`,
        });
        blocks.push({
          type: 'table',
          headers: ['Category', 'Count', 'Total'],
          rows: Array.from(catMap.entries())
            .sort(([, a], [, b]) => b.total - a.total)
            .map(([cat, data]) => [cat, String(data.count), formatCurrency(data.total)]),
        });
        break;
      }

      default:
        blocks.push({ type: 'error', message: `Unknown expense action: ${action}` });
    }
  } catch (error) {
    blocks.push({ type: 'error', message: `Error querying expenses: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }

  return { blocks };
}
