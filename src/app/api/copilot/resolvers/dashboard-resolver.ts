import { prisma } from '@/lib/db';
import type { ParsedIntent, ResponseBlock } from '@/lib/copilot/types';
import { formatCurrency } from './index';

export async function resolveDashboard(intent: ParsedIntent): Promise<{ blocks: ResponseBlock[] }> {
  const blocks: ResponseBlock[] = [];
  const { action } = intent;

  try {
    switch (action) {
      case 'overview':
      case 'metrics': {
        const [
          invoiceCount,
          pendingInvoices,
          poCount,
          contractCount,
          supplierCount,
          openAlerts,
          pendingPayments,
        ] = await Promise.all([
          prisma.invoice.count(),
          prisma.invoice.count({ where: { status: { in: ['ingested', 'extracted', 'classified'] } } }),
          prisma.purchaseOrder.count(),
          prisma.contract.count({ where: { status: 'ACTIVE' } }),
          prisma.tradingPartner.count({ where: { isActive: true } }),
          prisma.riskAlert.count({ where: { status: 'OPEN' } }),
          prisma.paymentBatch.count({ where: { status: 'PENDING' } }),
        ]);

        blocks.push({
          type: 'summary_card',
          cards: [
            { label: 'Total Invoices', value: String(invoiceCount) },
            { label: 'Pending Review', value: String(pendingInvoices) },
            { label: 'Open Risk Alerts', value: String(openAlerts) },
            { label: 'Pending Payments', value: String(pendingPayments) },
          ],
        });

        blocks.push({
          type: 'table',
          headers: ['Module', 'Count'],
          rows: [
            ['Total Invoices', String(invoiceCount)],
            ['Purchase Orders', String(poCount)],
            ['Active Contracts', String(contractCount)],
            ['Active Suppliers', String(supplierCount)],
            ['Open Risk Alerts', String(openAlerts)],
            ['Pending Payments', String(pendingPayments)],
          ],
        });

        // Calculate totals
        const invoiceTotals = await prisma.invoice.findMany({ select: { totalAmount: true } });
        const totalInvoiceValue = invoiceTotals.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

        blocks.push({
          type: 'text',
          content: `Total invoice value across all records: **${formatCurrency(totalInvoiceValue)}**.`,
        });

        blocks.push({
          type: 'action_buttons',
          buttons: [
            { label: 'Invoices', href: '/invoices' },
            { label: 'Risk Dashboard', href: '/risk-dashboard' },
            { label: 'Payments', href: '/payments' },
          ],
        });
        break;
      }

      default:
        blocks.push({ type: 'error', message: `Unknown dashboard action: ${action}` });
    }
  } catch (error) {
    blocks.push({ type: 'error', message: `Error querying dashboard: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }

  return { blocks };
}
