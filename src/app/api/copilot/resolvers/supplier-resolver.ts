import { prisma } from '@/lib/db';
import type { ParsedIntent, ResponseBlock } from '@/lib/copilot/types';

const MAX_TABLE_ROWS = 10;

export async function resolveSupplier(intent: ParsedIntent): Promise<{ blocks: ResponseBlock[] }> {
  const blocks: ResponseBlock[] = [];
  const { action, params } = intent;

  try {
    switch (action) {
      case 'list':
      case 'filter': {
        const where: Record<string, unknown> = {};
        if (params.active === 'true') where.isActive = true;
        if (params.active === 'false') where.isActive = false;
        if (params.compliance) where.complianceStatus = params.compliance;
        if (params.riskLevel === 'high') where.riskScore = { gte: 70 };
        if (params.riskLevel === 'medium') where.riskScore = { gte: 40, lt: 70 };
        if (params.riskLevel === 'low') where.riskScore = { lt: 40 };

        const [suppliers, totalCount] = await Promise.all([
          prisma.tradingPartner.findMany({
            where,
            take: MAX_TABLE_ROWS,
            orderBy: { riskScore: 'desc' },
          }),
          prisma.tradingPartner.count({ where }),
        ]);

        blocks.push({
          type: 'text',
          content: `Found **${totalCount}** supplier${totalCount !== 1 ? 's' : ''}.${totalCount > MAX_TABLE_ROWS ? ` Showing top ${MAX_TABLE_ROWS} by risk score.` : ''}`,
        });

        if (suppliers.length > 0) {
          blocks.push({
            type: 'table',
            headers: ['Name', 'Category', 'Risk Score', 'Compliance', 'Payment Terms'],
            rows: suppliers.map((s) => [
              s.name,
              s.category || 'N/A',
              String(s.riskScore),
              s.complianceStatus,
              s.paymentTerms || 'N/A',
            ]),
            totalCount,
          });
          blocks.push({
            type: 'action_buttons',
            buttons: [{ label: 'View All Suppliers', href: '/suppliers' }],
          });
        }
        break;
      }

      case 'count': {
        const where: Record<string, unknown> = {};
        if (params.active === 'true') where.isActive = true;
        if (params.riskLevel === 'high') where.riskScore = { gte: 70 };

        const count = await prisma.tradingPartner.count({ where });
        const label = params.riskLevel ? `${params.riskLevel}-risk` : params.active === 'true' ? 'Active' : 'Total';

        blocks.push({
          type: 'summary_card',
          cards: [{ label: `${label.charAt(0).toUpperCase() + label.slice(1)} Suppliers`, value: String(count) }],
        });
        break;
      }

      case 'find': {
        if (!params.name) {
          blocks.push({ type: 'error', message: 'Please specify a supplier name to search for.' });
          break;
        }

        const suppliers = await prisma.tradingPartner.findMany({
          where: { name: { contains: params.name } },
          take: 5,
        });

        if (suppliers.length > 0) {
          blocks.push({
            type: 'table',
            headers: ['Name', 'Category', 'Risk Score', 'Compliance', 'Status'],
            rows: suppliers.map((s) => [
              s.name,
              s.category || 'N/A',
              String(s.riskScore),
              s.complianceStatus,
              s.isActive ? 'Active' : 'Inactive',
            ]),
          });
        } else {
          blocks.push({ type: 'text', content: `No supplier found matching **${params.name}**.` });
        }
        break;
      }

      default:
        blocks.push({ type: 'error', message: `Unknown supplier action: ${action}` });
    }
  } catch (error) {
    blocks.push({ type: 'error', message: `Error querying suppliers: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }

  return { blocks };
}
