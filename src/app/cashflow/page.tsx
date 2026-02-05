'use client';

import { useT } from '@/lib/i18n/locale-context';
import styles from './cashflow.module.css';

const weeklyForecast = [
  { week: 'W1 Feb', inflow: 820, outflow: 650 },
  { week: 'W2 Feb', inflow: 740, outflow: 580 },
  { week: 'W3 Feb', inflow: 910, outflow: 720 },
  { week: 'W4 Feb', inflow: 680, outflow: 810 },
  { week: 'W1 Mar', inflow: 950, outflow: 640 },
  { week: 'W2 Mar', inflow: 770, outflow: 690 },
  { week: 'W3 Mar', inflow: 1100, outflow: 880 },
  { week: 'W4 Mar', inflow: 830, outflow: 750 },
  { week: 'W1 Apr', inflow: 920, outflow: 610 },
  { week: 'W2 Apr', inflow: 660, outflow: 720 },
  { week: 'W3 Apr', inflow: 1050, outflow: 830 },
  { week: 'W4 Apr', inflow: 780, outflow: 690 },
];

const maxVal = Math.max(
  ...weeklyForecast.map((w) => Math.max(w.inflow, w.outflow))
);

const commitments = [
  { item: 'Payroll - January', amount: '$1,240,000', due: '2026-01-31', type: 'Payroll', status: 'Due' },
  { item: 'Vendor Batch BT-2026-0041', amount: '$284,500', due: '2026-01-30', type: 'AP', status: 'Due' },
  { item: 'Office Lease Q1', amount: '$87,000', due: '2026-02-01', type: 'Lease', status: 'Upcoming' },
  { item: 'AWS Infrastructure', amount: '$42,300', due: '2026-02-03', type: 'SaaS', status: 'Upcoming' },
  { item: 'Insurance Premium', amount: '$18,500', due: '2026-02-05', type: 'Insurance', status: 'Upcoming' },
  { item: 'Tax Withholding Q4', amount: '$156,000', due: '2026-02-15', type: 'Tax', status: 'Upcoming' },
  { item: 'Equipment Financing', amount: '$34,200', due: '2026-02-10', type: 'Loan', status: 'Upcoming' },
  { item: 'Marketing Campaign Q1', amount: '$65,000', due: '2026-02-08', type: 'Marketing', status: 'Upcoming' },
  { item: 'Client Receivable - Meridian', amount: '$320,000', due: '2026-01-28', type: 'AR', status: 'Overdue' },
  { item: 'Client Receivable - Apex Co', amount: '$185,000', due: '2026-02-04', type: 'AR', status: 'Upcoming' },
];

const aiInsights = [
  {
    title: 'Receivables Risk Alert',
    desc: 'Meridian Corp receivable of $320K is 2 days overdue. Historical pattern suggests payment within 5 business days. Recommend sending automated reminder.',
  },
  {
    title: 'Cash Surplus Opportunity',
    desc: 'Projected surplus of $410K in Week 1 of March. Consider deploying to overnight sweep account for estimated $1,200 in interest income.',
  },
  {
    title: 'Payment Timing Optimization',
    desc: 'Shifting $284K vendor batch from Jan 30 to Feb 3 would improve month-end cash position by 2.2% with no late payment risk.',
  },
];

const scenarioPlanning = [
  {
    name: 'Base Case',
    tag: 'Current Trajectory',
    tagClass: 'tagBlue',
    description: 'Projected cashflow based on current AR/AP patterns, contractual obligations, and historical seasonal trends.',
    endingBalance: '$14.2M',
    netChange: '+$1.4M',
    netPositive: true,
    confidence: 92,
    assumptions: [
      'AR collections maintain 34-day DSO average',
      'No major contract changes or cancellations',
      'Seasonal patterns consistent with prior year',
    ],
  },
  {
    name: 'Optimistic',
    tag: 'Highest Upside',
    tagClass: 'tagGreen',
    description: 'Accelerated collections from top accounts plus two pending enterprise contract wins closing in Q1.',
    endingBalance: '$17.6M',
    netChange: '+$4.8M',
    netPositive: true,
    confidence: 38,
    assumptions: [
      'Enterprise deals ($2.1M) close by mid-February',
      'Meridian and Apex accelerate payment to net-15',
      'Dynamic discounting captures $180K in savings',
    ],
  },
  {
    name: 'Conservative',
    tag: 'Downside Risk',
    tagClass: 'tagAmber',
    description: 'Delayed receivables due to client budget freezes and broader economic headwinds affecting mid-market segment.',
    endingBalance: '$10.1M',
    netChange: '-$2.7M',
    netPositive: false,
    confidence: 15,
    assumptions: [
      'DSO extends to 48 days across mid-market clients',
      'Two enterprise renewals delayed to Q2',
      'Additional $400K in unplanned infrastructure costs',
    ],
  },
];

const profitCenterData = [
  { unit: 'Enterprise Solutions', inflow: '$2,180K', outflow: '$1,420K', net: '+$760K', netPositive: true, margin: '34.9%', trend: 82 },
  { unit: 'Mid-Market', inflow: '$1,540K', outflow: '$980K', net: '+$560K', netPositive: true, margin: '36.4%', trend: 68 },
  { unit: 'SMB', inflow: '$720K', outflow: '$510K', net: '+$210K', netPositive: true, margin: '29.2%', trend: 45 },
  { unit: 'Professional Services', inflow: '$480K', outflow: '$390K', net: '+$90K', netPositive: true, margin: '18.8%', trend: 30 },
  { unit: 'Partner Channel', inflow: '$340K', outflow: '$180K', net: '+$160K', netPositive: true, margin: '47.1%', trend: 72 },
  { unit: 'Product / R&D', inflow: '$140K', outflow: '$820K', net: '-$680K', netPositive: false, margin: '-485.7%', trend: -55 },
];

const cashAllocation = [
  { label: 'Operating Reserve', amount: '$3.8M', pct: 30, color: '#165DFF' },
  { label: 'Growth Investment', amount: '$2.5M', pct: 20, color: '#23C343' },
  { label: 'Debt Service', amount: '$1.8M', pct: 14, color: '#FF9A2E' },
  { label: 'Strategic M&A Reserve', amount: '$2.0M', pct: 16, color: '#8E51DA' },
  { label: 'Dynamic Discounting Pool', amount: '$1.2M', pct: 9, color: '#14C9C9' },
  { label: 'Unallocated', amount: '$1.5M', pct: 11, color: '#86909C' },
];

function getBadgeClass(status: string) {
  const map: Record<string, string> = {
    Due: styles.badgeDue,
    Overdue: styles.badgeOverdue,
    Upcoming: styles.badgeUpcoming,
    Paid: styles.badgePaid,
  };
  return `${styles.badge} ${map[status] || ''}`;
}

export default function CashFlowPage() {
  const t = useT();
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{t('cashflow.title')}</h1>
        <p>{t('cashflow.subtitle')}</p>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('cashflow.currentBalance')}</div>
          <div className={styles.kpiValue}>$12.8M</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>+3.2% vs last week</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('cashflow.netCashFlow')}</div>
          <div className={styles.kpiValue}>+$2.1M</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>Net positive inflow</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('cashflow.inflows30d')}</div>
          <div className={styles.kpiValue}>$5.4M</div>
          <div className={`${styles.kpiSub} ${styles.kpiNeutral}`}>42 outstanding invoices</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('cashflow.outflows30d')}</div>
          <div className={styles.kpiValue}>$3.3M</div>
          <div className={`${styles.kpiSub} ${styles.kpiNeutral}`}>28 pending payments</div>
        </div>
      </div>

      {/* 12-Week Forecast Chart */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('cashflow.forecast')}</div>
        <div className={styles.chartArea}>
          {weeklyForecast.map((w) => (
            <div key={w.week} className={styles.weekCol}>
              <div className={styles.barGroup}>
                <div
                  className={styles.barInflow}
                  style={{ height: `${(w.inflow / maxVal) * 180}px` }}
                  title={`Inflow: $${w.inflow}K`}
                />
                <div
                  className={styles.barOutflow}
                  style={{ height: `${(w.outflow / maxVal) * 180}px` }}
                  title={`Outflow: $${w.outflow}K`}
                />
              </div>
              <span className={styles.weekLabel}>{w.week}</span>
            </div>
          ))}
        </div>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotInflow}`} />
            Inflows
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotOutflow}`} />
            Outflows
          </div>
        </div>
      </div>

      <div className={styles.twoCol}>
        {/* Upcoming Commitments */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Upcoming Commitments</div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>{t('common.amount')}</th>
                  <th>Due Date</th>
                  <th>{t('common.type')}</th>
                  <th>{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {commitments.map((c, i) => (
                  <tr key={i}>
                    <td>{c.item}</td>
                    <td>{c.amount}</td>
                    <td>{c.due}</td>
                    <td>{c.type}</td>
                    <td>
                      <span className={getBadgeClass(c.status)}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Working Capital Metrics */}
        <div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Working Capital Metrics</div>
            <div className={styles.wcMetrics}>
              <div className={styles.wcCard}>
                <div className={`${styles.wcValue} ${styles.wcGood}`}>34</div>
                <div className={styles.wcLabel}>DSO (Days)</div>
              </div>
              <div className={styles.wcCard}>
                <div className={`${styles.wcValue} ${styles.wcGood}`}>42</div>
                <div className={styles.wcLabel}>DPO (Days)</div>
              </div>
              <div className={styles.wcCard}>
                <div className={`${styles.wcValue} ${styles.wcGood}`}>-8</div>
                <div className={styles.wcLabel}>Cash Conversion Cycle</div>
              </div>
            </div>
          </div>

          {/* AI Treasury Insights */}
          <div className={styles.aiCard}>
            <div className={styles.aiHeader}>
              <div className={styles.aiIcon}>AI</div>
              <h3 className={styles.aiTitle}>Treasury Insights</h3>
            </div>
            {aiInsights.map((insight, i) => (
              <div key={i} className={styles.aiInsight}>
                <div className={styles.aiInsightTitle}>{insight.title}</div>
                <div className={styles.aiInsightDesc}>{insight.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Planning */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>90-Day Scenario Planning</div>
        <div className={styles.scenarioGrid}>
          {scenarioPlanning.map((s, i) => (
            <div key={i} className={styles.scenarioCard}>
              <div className={styles.scenarioHeader}>
                <span className={styles.scenarioName}>{s.name}</span>
                <span className={`${styles.scenarioTag} ${styles[s.tagClass]}`}>{s.tag}</span>
              </div>
              <p className={styles.scenarioDesc}>{s.description}</p>
              <div className={styles.scenarioMetrics}>
                <div className={styles.scenarioMetric}>
                  <span className={styles.scenarioMetricLabel}>90-Day Ending Balance</span>
                  <span className={styles.scenarioMetricValue}>{s.endingBalance}</span>
                </div>
                <div className={styles.scenarioMetric}>
                  <span className={styles.scenarioMetricLabel}>Net Cash Change</span>
                  <span className={`${styles.scenarioMetricValue} ${s.netPositive ? styles.kpiUp : styles.kpiDown}`}>{s.netChange}</span>
                </div>
              </div>
              <div className={styles.scenarioAssumptions}>
                <span className={styles.scenarioAssumptionsLabel}>Key Assumptions</span>
                <ul className={styles.scenarioList}>
                  {s.assumptions.map((a, j) => (
                    <li key={j}>{a}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.scenarioConfidence}>
                <div className={styles.confidenceRow}>
                  <span className={styles.confidenceLabel}>Confidence</span>
                  <span className={styles.confidenceValue}>{s.confidence}%</span>
                </div>
                <div className={styles.confidenceTrack}>
                  <div className={styles.confidenceFill} style={{ width: `${s.confidence}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profit Center Impact */}
      <div className={styles.section}>
        <div className={styles.sectionHeaderRow}>
          <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>Cashflow by Profit Center</div>
          <span className={styles.aiBadge}>AI</span>
        </div>
        <p className={styles.sectionSubtext}>AI-attributed cashflow contribution by business unit over the trailing 30 days</p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Business Unit</th>
                <th>Inflows (30d)</th>
                <th>Outflows (30d)</th>
                <th>Net Cash</th>
                <th>Margin</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {profitCenterData.map((row, i) => (
                <tr key={i}>
                  <td className={styles.unitName}>{row.unit}</td>
                  <td>{row.inflow}</td>
                  <td>{row.outflow}</td>
                  <td>
                    <span className={row.netPositive ? styles.netPositive : styles.netNegative}>{row.net}</span>
                  </td>
                  <td>{row.margin}</td>
                  <td>
                    <div className={styles.trendBarWrap}>
                      {row.trend >= 0 ? (
                        <div className={styles.trendBarPositive} style={{ width: `${row.trend}%` }} />
                      ) : (
                        <div className={styles.trendBarNegative} style={{ width: `${Math.abs(row.trend)}%` }} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Cash Allocation */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Strategic Cash Allocation</div>
        <p className={styles.sectionSubtext}>Current deployment of $12.8M across strategic reserves and operational pools</p>
        <div className={styles.allocationBar}>
          {cashAllocation.map((a, i) => (
            <div
              key={i}
              className={styles.allocationSegment}
              style={{ width: `${a.pct}%`, background: a.color }}
              title={`${a.label}: ${a.amount} (${a.pct}%)`}
            />
          ))}
        </div>
        <div className={styles.allocationLegend}>
          {cashAllocation.map((a, i) => (
            <div key={i} className={styles.allocationLegendItem}>
              <span className={styles.allocationDot} style={{ background: a.color }} />
              <span className={styles.allocationLegendLabel}>{a.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.allocationCards}>
          {cashAllocation.map((a, i) => (
            <div key={i} className={styles.allocationCard}>
              <div className={styles.allocationCardHeader}>
                <span className={styles.allocationCardDot} style={{ background: a.color }} />
                <span className={styles.allocationCardLabel}>{a.label}</span>
              </div>
              <div className={styles.allocationCardAmount}>{a.amount}</div>
              <div className={styles.allocationCardPct}>{a.pct}% of total</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
