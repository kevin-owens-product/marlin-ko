import { prisma } from '@/lib/db';
import type { ParsedIntent, ResponseBlock } from '@/lib/copilot/types';
import { formatCurrency, formatDate } from './index';

export async function resolveCashflow(intent: ParsedIntent): Promise<{ blocks: ResponseBlock[] }> {
  const blocks: ResponseBlock[] = [];
  const { action } = intent;

  try {
    switch (action) {
      case 'summarize': {
        const forecasts = await prisma.cashFlowForecast.findMany({
          orderBy: { forecastDate: 'desc' },
          take: 10,
        });

        if (forecasts.length === 0) {
          blocks.push({ type: 'text', content: 'No cash flow forecast data available.' });
          break;
        }

        const latest = forecasts[0];
        const totalInflow = forecasts.reduce((sum, f) => sum + f.expectedInflow, 0);
        const totalOutflow = forecasts.reduce((sum, f) => sum + f.expectedOutflow, 0);

        blocks.push({
          type: 'summary_card',
          cards: [
            { label: 'Net Position', value: formatCurrency(latest.netPosition) },
            { label: 'Expected Inflow', value: formatCurrency(totalInflow) },
            { label: 'Expected Outflow', value: formatCurrency(totalOutflow) },
            { label: 'Confidence', value: `${(latest.confidence * 100).toFixed(0)}%` },
          ],
        });
        blocks.push({
          type: 'action_buttons',
          buttons: [{ label: 'View Cash Flow', href: '/cashflow' }],
        });
        break;
      }

      case 'forecast': {
        const forecasts = await prisma.cashFlowForecast.findMany({
          orderBy: { forecastDate: 'asc' },
          take: 10,
        });

        if (forecasts.length === 0) {
          blocks.push({ type: 'text', content: 'No forecast data available.' });
          break;
        }

        blocks.push({
          type: 'text',
          content: `**Cash Flow Forecast** — showing ${forecasts.length} periods.`,
        });
        blocks.push({
          type: 'table',
          headers: ['Date', 'Inflow', 'Outflow', 'Net Position', 'Confidence'],
          rows: forecasts.map((f) => [
            formatDate(f.forecastDate),
            formatCurrency(f.expectedInflow),
            formatCurrency(f.expectedOutflow),
            formatCurrency(f.netPosition),
            `${(f.confidence * 100).toFixed(0)}%`,
          ]),
        });
        break;
      }

      case 'net': {
        const forecasts = await prisma.cashFlowForecast.findMany({
          orderBy: { forecastDate: 'desc' },
          take: 5,
        });

        if (forecasts.length === 0) {
          blocks.push({ type: 'text', content: 'No cash flow data available.' });
          break;
        }

        const totalIn = forecasts.reduce((sum, f) => sum + f.expectedInflow, 0);
        const totalOut = forecasts.reduce((sum, f) => sum + f.expectedOutflow, 0);
        const net = totalIn - totalOut;

        blocks.push({
          type: 'summary_card',
          cards: [
            { label: 'Total Inflows', value: formatCurrency(totalIn) },
            { label: 'Total Outflows', value: formatCurrency(totalOut) },
            { label: 'Net Position', value: formatCurrency(net), trend: net >= 0 ? 'positive' : 'negative' },
          ],
        });
        break;
      }

      default:
        blocks.push({ type: 'error', message: `Unknown cashflow action: ${action}` });
    }
  } catch (error) {
    blocks.push({ type: 'error', message: `Error querying cash flow: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }

  return { blocks };
}
