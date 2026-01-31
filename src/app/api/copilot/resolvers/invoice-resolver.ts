import { prisma } from '@/lib/db';
import type { ParsedIntent, ResponseBlock } from '@/lib/copilot/types';
import { formatCurrency, formatDate } from './index';

const MAX_TABLE_ROWS = 10;

export async function resolveInvoice(intent: ParsedIntent): Promise<{ blocks: ResponseBlock[] }> {
  const blocks: ResponseBlock[] = [];
  const { action, params } = intent;

  try {
    switch (action) {
      case 'list':
      case 'filter': {
        const where: Record<string, unknown> = {};
        if (params.status) where.status = params.status;
        if (params.vendor) where.vendorName = { contains: params.vendor };
        if (params.minAmount || params.maxAmount) {
          const amountFilter: Record<string, number> = {};
          if (params.minAmount) amountFilter.gte = parseFloat(params.minAmount);
          if (params.maxAmount) amountFilter.lte = parseFloat(params.maxAmount);
          where.totalAmount = amountFilter;
        }

        const [invoices, totalCount] = await Promise.all([
          prisma.invoice.findMany({ where, take: MAX_TABLE_ROWS, orderBy: { createdAt: 'desc' } }),
          prisma.invoice.count({ where }),
        ]);

        const statusLabel = params.status ? ` (${params.status})` : '';
        blocks.push({
          type: 'text',
          content: `Found **${totalCount}** invoice${totalCount !== 1 ? 's' : ''}${statusLabel}.${totalCount > MAX_TABLE_ROWS ? ` Showing the most recent ${MAX_TABLE_ROWS}.` : ''}`,
        });

        if (invoices.length > 0) {
          blocks.push({
            type: 'table',
            headers: ['Invoice #', 'Vendor', 'Amount', 'Status', 'Date'],
            rows: invoices.map((inv) => [
              inv.invoiceNumber || 'N/A',
              inv.vendorName || 'Unknown',
              formatCurrency(inv.totalAmount || 0, inv.currency || 'USD'),
              inv.status,
              formatDate(inv.createdAt),
            ]),
            totalCount,
          });

          blocks.push({
            type: 'action_buttons',
            buttons: [{ label: 'View All Invoices', href: '/invoices' }],
          });
        }
        break;
      }

      case 'count': {
        const where: Record<string, unknown> = {};
        if (params.status) where.status = params.status;
        if (params.period === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          where.createdAt = { gte: today };
        } else if (params.period === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          where.createdAt = { gte: weekAgo };
        } else if (params.period === 'month') {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          where.createdAt = { gte: monthAgo };
        }

        const count = await prisma.invoice.count({ where });
        const label = params.status || (params.period ? `this ${params.period}` : 'total');

        blocks.push({
          type: 'summary_card',
          cards: [{ label: `${label.charAt(0).toUpperCase() + label.slice(1)} Invoices`, value: String(count) }],
        });
        break;
      }

      case 'summarize': {
        const allInvoices = await prisma.invoice.findMany({ select: { status: true, totalAmount: true } });
        const statusMap = new Map<string, { count: number; total: number }>();
        for (const inv of allInvoices) {
          const entry = statusMap.get(inv.status) || { count: 0, total: 0 };
          entry.count++;
          entry.total += inv.totalAmount || 0;
          statusMap.set(inv.status, entry);
        }

        blocks.push({
          type: 'text',
          content: `**Invoice Summary** — ${allInvoices.length} total invoices across ${statusMap.size} statuses.`,
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

      case 'find': {
        if (!params.invoiceNumber) {
          blocks.push({ type: 'error', message: 'Please specify an invoice number to search for.' });
          break;
        }
        const invoice = await prisma.invoice.findFirst({
          where: { invoiceNumber: { contains: params.invoiceNumber } },
        });

        if (invoice) {
          blocks.push({
            type: 'summary_card',
            cards: [
              { label: 'Invoice #', value: invoice.invoiceNumber || 'N/A' },
              { label: 'Vendor', value: invoice.vendorName || 'Unknown' },
              { label: 'Amount', value: formatCurrency(invoice.totalAmount || 0, invoice.currency || 'USD') },
              { label: 'Status', value: invoice.status },
            ],
          });
          blocks.push({
            type: 'text',
            content: `Due: ${formatDate(invoice.dueDate)} | AI Confidence: ${((invoice.aiConfidence || 0) * 100).toFixed(1)}%`,
          });
        } else {
          blocks.push({ type: 'text', content: `No invoice found matching **${params.invoiceNumber}**.` });
        }
        break;
      }

      default:
        blocks.push({ type: 'error', message: `Unknown invoice action: ${action}` });
    }
  } catch (error) {
    blocks.push({ type: 'error', message: `Error querying invoices: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }

  return { blocks };
}
