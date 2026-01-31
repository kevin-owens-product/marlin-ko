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
    </div>
  );
}
