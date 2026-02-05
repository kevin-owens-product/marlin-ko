'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './treasury.module.css';

/* ───────────────────────────── Mock Data ───────────────────────────── */

const bankAccounts = [
  { bank: 'Chase', name: 'Operating Account', balance: '$5,200,000', currency: 'USD', type: 'Operating', updated: '2 min ago', status: 'Connected' as const },
  { bank: 'Chase', name: 'Payroll Account', balance: '$1,800,000', currency: 'USD', type: 'Payroll', updated: '2 min ago', status: 'Connected' as const },
  { bank: 'Bank of America', name: 'EUR Account', balance: '\u20AC2,100,000', currency: 'EUR', type: 'Operating', updated: '5 min ago', status: 'Connected' as const },
  { bank: 'Barclays', name: 'GBP Account', balance: '\u00A3890,000', currency: 'GBP', type: 'Operating', updated: '8 min ago', status: 'Syncing' as const },
  { bank: 'Nordea', name: 'SEK Account', balance: '4,500,000 kr', currency: 'SEK', type: 'Operating', updated: '12 min ago', status: 'Connected' as const },
  { bank: 'HSBC', name: 'Reserve Account', balance: '$3,200,000', currency: 'USD', type: 'Reserve', updated: '3 min ago', status: 'Connected' as const },
];

const currencyBreakdown = [
  { currency: 'USD', pct: 65, amount: '$8.32M', color: '#165DFF' },
  { currency: 'EUR', pct: 18, amount: '\u20AC2.10M', color: '#8E51DA' },
  { currency: 'GBP', pct: 8, amount: '\u00A30.89M', color: '#23C343' },
  { currency: 'SEK', pct: 5, amount: '4.50M kr', color: '#FF9A2E' },
  { currency: 'Other', pct: 4, amount: '$0.51M', color: '#4E5969' },
];

const weeklyForecast = [
  { week: 'W1 Feb', inflow: 1020, outflow: 780, confidence: 0.96 },
  { week: 'W2 Feb', inflow: 940, outflow: 850, confidence: 0.95 },
  { week: 'W3 Feb', inflow: 1150, outflow: 920, confidence: 0.93 },
  { week: 'W4 Feb', inflow: 880, outflow: 1010, confidence: 0.91 },
  { week: 'W1 Mar', inflow: 1200, outflow: 840, confidence: 0.89 },
  { week: 'W2 Mar', inflow: 970, outflow: 890, confidence: 0.86 },
  { week: 'W3 Mar', inflow: 1350, outflow: 1080, confidence: 0.83 },
  { week: 'W4 Mar', inflow: 1030, outflow: 950, confidence: 0.80 },
  { week: 'W1 Apr', inflow: 1120, outflow: 810, confidence: 0.76 },
  { week: 'W2 Apr', inflow: 860, outflow: 920, confidence: 0.72 },
  { week: 'W3 Apr', inflow: 1250, outflow: 1030, confidence: 0.68 },
  { week: 'W4 Apr', inflow: 980, outflow: 890, confidence: 0.64 },
];
const forecastMax = Math.max(...weeklyForecast.map((w) => Math.max(w.inflow, w.outflow)));

const paymentCalendar: { day: string; date: string; items: { supplier: string; amount: string; method: string; impact: string }[] }[] = [
  { day: 'Mon', date: 'Feb 3', items: [
    { supplier: 'TechVault Inc', amount: '$42,300', method: 'ACH', impact: '-$42.3K' },
    { supplier: 'CloudNet Pro', amount: '$18,750', method: 'Wire', impact: '-$18.8K' },
  ]},
  { day: 'Tue', date: 'Feb 4', items: [
    { supplier: 'Meridian Corp', amount: '$125,000', method: 'Wire', impact: '-$125K' },
  ]},
  { day: 'Wed', date: 'Feb 5', items: [
    { supplier: 'Apex Logistics', amount: '$67,400', method: 'ACH', impact: '-$67.4K' },
    { supplier: 'InsureCo Ltd', amount: '$18,500', method: 'ACH', impact: '-$18.5K' },
  ]},
  { day: 'Thu', date: 'Feb 6', items: [
    { supplier: 'Nordic Supplies', amount: '285,000 kr', method: 'SEPA', impact: '-$26.8K' },
    { supplier: 'DataStream AI', amount: '$34,200', method: 'ACH', impact: '-$34.2K' },
  ]},
  { day: 'Fri', date: 'Feb 7', items: [
    { supplier: 'EuroParts GmbH', amount: '\u20AC48,600', method: 'SEPA', impact: '-$52.9K' },
    { supplier: 'UK Solutions', amount: '\u00A312,400', method: 'SWIFT', impact: '-$15.7K' },
    { supplier: 'Payroll Batch', amount: '$1,240,000', method: 'ACH', impact: '-$1.24M' },
  ]},
];

const aiInsights = [
  { icon: '!', color: 'Amber' as const, label: 'Receivables Aging Alert', desc: 'Receivables aging alert: $340K overdue >60 days from 3 customers. Recommend escalation to collections workflow.', roi: '$340K', roiLabel: 'At-risk receivables', roiType: 'risk' as const },
  { icon: '$', color: 'Green' as const, label: 'Cash Surplus Opportunity', desc: 'Cash surplus opportunity: $1.2M available for 7-day dynamic discounting. Projected savings of $18,400 at current discount rates.', roi: '$18.4K', roiLabel: 'Projected savings', roiType: 'savings' as const },
  { icon: 'FX', color: 'Purple' as const, label: 'FX Exposure Warning', desc: 'FX exposure: EUR payables increasing. Consider forward contract for Q2 to hedge \u20AC1.4M in expected outflows.', roi: '$42K', roiLabel: 'Estimated hedge savings', roiType: 'savings' as const },
  { icon: '%', color: 'Blue' as const, label: 'Payment Timing', desc: 'Payment timing: Deferring $450K in non-critical payments by 5 days improves month-end position by 3.2% with zero late-fee risk.', roi: '$14.4K', roiLabel: 'Float value (annualized)', roiType: 'savings' as const },
];

/* Payment Optimization Data */
const optimizationInvoices = [
  { supplier: 'TechVault Inc', amount: '$42,300', due: '2026-02-03', optimalDate: '2026-01-29', strategy: 'Early Discount' as const, savings: '+$846', cashImpact: '-$42.3K early', confidence: 94 },
  { supplier: 'Meridian Corp', amount: '$125,000', due: '2026-02-04', optimalDate: '2026-02-04', strategy: 'On Time' as const, savings: '$0', cashImpact: 'Neutral', confidence: 98 },
  { supplier: 'CloudNet Pro', amount: '$18,750', due: '2026-02-03', optimalDate: '2026-02-08', strategy: 'Defer' as const, savings: '$0', cashImpact: '+5 days float', confidence: 87 },
  { supplier: 'Apex Logistics', amount: '$67,400', due: '2026-02-05', optimalDate: '2026-02-02', strategy: 'Early Discount' as const, savings: '+$1,348', cashImpact: '-$67.4K early', confidence: 92 },
  { supplier: 'InsureCo Ltd', amount: '$18,500', due: '2026-02-05', optimalDate: '2026-02-05', strategy: 'On Time' as const, savings: '$0', cashImpact: 'Neutral', confidence: 99 },
  { supplier: 'Nordic Supplies', amount: '285,000 kr', due: '2026-02-06', optimalDate: '2026-02-11', strategy: 'Defer' as const, savings: '$0', cashImpact: '+5 days float', confidence: 85 },
  { supplier: 'DataStream AI', amount: '$34,200', due: '2026-02-06', optimalDate: '2026-02-03', strategy: 'Early Discount' as const, savings: '+$513', cashImpact: '-$34.2K early', confidence: 91 },
  { supplier: 'EuroParts GmbH', amount: '\u20AC48,600', due: '2026-02-07', optimalDate: '2026-02-07', strategy: 'On Time' as const, savings: '$0', cashImpact: 'Neutral', confidence: 96 },
  { supplier: 'UK Solutions', amount: '\u00A312,400', due: '2026-02-07', optimalDate: '2026-02-12', strategy: 'Defer' as const, savings: '$0', cashImpact: '+5 days float', confidence: 83 },
  { supplier: 'PrecisionTech', amount: '$89,000', due: '2026-02-10', optimalDate: '2026-02-07', strategy: 'Early Discount' as const, savings: '+$1,780', cashImpact: '-$89K early', confidence: 93 },
  { supplier: 'GreenEnergy Co', amount: '$22,100', due: '2026-02-10', optimalDate: '2026-02-10', strategy: 'On Time' as const, savings: '$0', cashImpact: 'Neutral', confidence: 97 },
  { supplier: 'FastFreight Ltd', amount: '$56,800', due: '2026-02-12', optimalDate: '2026-02-17', strategy: 'Defer' as const, savings: '$0', cashImpact: '+5 days float', confidence: 86 },
  { supplier: 'SaaS Global', amount: '$31,500', due: '2026-02-12', optimalDate: '2026-02-09', strategy: 'Early Discount' as const, savings: '+$630', cashImpact: '-$31.5K early', confidence: 90 },
  { supplier: 'Atlas Materials', amount: '$74,200', due: '2026-02-15', optimalDate: '2026-02-15', strategy: 'On Time' as const, savings: '$0', cashImpact: 'Neutral', confidence: 95 },
  { supplier: 'Pinnacle Services', amount: '$41,600', due: '2026-02-15', optimalDate: '2026-02-20', strategy: 'Defer' as const, savings: '$0', cashImpact: '+5 days float', confidence: 84 },
];

const paymentScenarios = [
  { name: 'Pay All Now', cashImpact: '-$767,350', discounts: '$5,117 captured', lateFees: '$0 risk', wcEffect: 'CCC worsens by 4 days', rating: 'Conservative' },
  { name: 'Optimal Timing (AI)', cashImpact: '-$432,900', discounts: '$5,117 captured', lateFees: '$0 risk', wcEffect: 'CCC improves by 2 days', rating: 'Recommended' },
  { name: 'Maximum Defer', cashImpact: '-$198,500', discounts: '$0 captured', lateFees: '$2,340 risk', wcEffect: 'CCC improves by 6 days', rating: 'Aggressive' },
];

const supplierPriority = {
  critical: [
    { name: 'Meridian Corp', amount: '$125,000', reason: 'Strategic partner, sole-source contract' },
    { name: 'InsureCo Ltd', amount: '$18,500', reason: 'Regulatory compliance, no grace period' },
    { name: 'Atlas Materials', amount: '$74,200', reason: 'Production dependency, tight SLA' },
    { name: 'EuroParts GmbH', amount: '\u20AC48,600', reason: 'Long lead times, relationship-critical' },
    { name: 'GreenEnergy Co', amount: '$22,100', reason: 'Utility provider, service continuity' },
  ],
  flexible: [
    { name: 'CloudNet Pro', amount: '$18,750', reason: 'Net-30 terms, good standing, flexible' },
    { name: 'Nordic Supplies', amount: '285,000 kr', reason: 'Net-45 terms, multiple alternatives' },
    { name: 'UK Solutions', amount: '\u00A312,400', reason: 'Low priority, quarterly review' },
    { name: 'FastFreight Ltd', amount: '$56,800', reason: 'Net-30, historically flexible on timing' },
    { name: 'Pinnacle Services', amount: '$41,600', reason: 'Month-to-month, no penalty clause' },
  ],
};

const batchItems = [
  { name: 'TechVault Inc', due: 'Feb 3', amount: '$42,300', included: true, strategy: 'Early Discount' },
  { name: 'Meridian Corp', due: 'Feb 4', amount: '$125,000', included: true, strategy: 'On Time' },
  { name: 'Apex Logistics', due: 'Feb 5', amount: '$67,400', included: true, strategy: 'Early Discount' },
  { name: 'InsureCo Ltd', due: 'Feb 5', amount: '$18,500', included: true, strategy: 'On Time' },
  { name: 'DataStream AI', due: 'Feb 6', amount: '$34,200', included: true, strategy: 'Early Discount' },
  { name: 'EuroParts GmbH', due: 'Feb 7', amount: '\u20AC48,600', included: true, strategy: 'On Time' },
  { name: 'CloudNet Pro', due: 'Feb 3', amount: '$18,750', included: false, strategy: 'Deferred' },
  { name: 'Nordic Supplies', due: 'Feb 6', amount: '285,000 kr', included: false, strategy: 'Deferred' },
  { name: 'UK Solutions', due: 'Feb 7', amount: '\u00A312,400', included: false, strategy: 'Deferred' },
];

/* Working Capital Extended Data */
const wcTrend = {
  dso: [38, 37, 36, 35, 35, 34],
  dpo: [39, 40, 40, 41, 41, 42],
  ccc: [-1, -3, -4, -6, -6, -8],
};

const wcArAging = [
  { bucket: '0-30 days', amount: '$3,200,000', pct: 59, color: '#23C343' },
  { bucket: '31-60 days', amount: '$1,520,000', pct: 28, color: '#165DFF' },
  { bucket: '61-90 days', amount: '$340,000', pct: 6, color: '#FF9A2E' },
  { bucket: '90+ days', amount: '$340,000', pct: 7, color: '#F76560' },
];

const wcApAging = [
  { bucket: '0-30 days', amount: '$1,980,000', pct: 60, color: '#23C343' },
  { bucket: '31-60 days', amount: '$990,000', pct: 30, color: '#165DFF' },
  { bucket: '61-90 days', amount: '$230,000', pct: 7, color: '#FF9A2E' },
  { bucket: '90+ days', amount: '$100,000', pct: 3, color: '#F76560' },
];

/* ───────────────────────────── Helpers ───────────────────────────── */

function getStatusClass(status: 'Connected' | 'Syncing' | 'Error') {
  const m: Record<string, string> = {
    Connected: styles.statusConnected,
    Syncing: styles.statusSyncing,
    Error: styles.statusError,
  };
  return `${styles.statusDot} ${m[status] || ''}`;
}

function getStrategyClass(s: string) {
  if (s === 'Early Discount') return styles.strategyEarly;
  if (s === 'Defer') return styles.strategyDefer;
  return styles.strategyOnTime;
}

function getConfidenceClass(c: number) {
  if (c >= 90) return styles.confidenceHigh;
  if (c >= 80) return styles.confidenceMed;
  return styles.confidenceLow;
}

function insightColorClass(c: string) {
  const m: Record<string, string> = {
    Amber: styles.insightAmber,
    Green: styles.insightGreen,
    Purple: styles.insightPurple,
    Blue: styles.insightBlue,
  };
  return m[c] || styles.insightBlue;
}

/* Build conic-gradient for pie chart */
function buildPieGradient() {
  let acc = 0;
  const stops: string[] = [];
  currencyBreakdown.forEach((c) => {
    stops.push(`${c.color} ${acc}deg ${acc + c.pct * 3.6}deg`);
    acc += c.pct * 3.6;
  });
  return `conic-gradient(${stops.join(', ')})`;
}

/* ───────────────────────────── Tabs ───────────────────────────── */

type Tab = 'position' | 'forecast' | 'optimization' | 'capital';

/* ───────────────────────────── Component ───────────────────────────── */

export default function TreasuryPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<Tab>('position');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'position', label: t('treasury.cashPositions') },
    { key: 'forecast', label: 'Forecast' },
    { key: 'optimization', label: 'Payment Optimization' },
    { key: 'capital', label: 'Working Capital' },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>{t('treasury.title')}</h1>
        <p>{t('treasury.subtitle')}</p>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Cash Position Tab ─── */}
      {activeTab === 'position' && (
        <>
          {/* KPI Row */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>{t('treasury.totalAssets')}</div>
              <div className={styles.kpiValue}>$12.8M</div>
              <div className={`${styles.kpiSub} ${styles.kpiUp}`}>+3.2% vs last week</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>{t('treasury.liquidAssets')}</div>
              <div className={styles.kpiValue}>$5.2M</div>
              <div className={`${styles.kpiSub} ${styles.kpiNeutral}`}>Chase Operating</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>{t('treasury.investments')}</div>
              <div className={styles.kpiValue}>$5.4M</div>
              <div className={`${styles.kpiSub} ${styles.kpiNeutral}`}>42 invoices</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>{t('treasury.fxExposure')}</div>
              <div className={styles.kpiValue}>$3.3M</div>
              <div className={`${styles.kpiSub} ${styles.kpiNeutral}`}>28 pending payments</div>
            </div>
          </div>

          {/* Consolidated Cash + Currency Breakdown */}
          <div className={styles.cashPosition}>
            <div className={styles.totalCash}>
              <div className={styles.totalLabel}>Consolidated Cash Position</div>
              <div className={styles.totalValue}>$12.8M</div>
              <div className={styles.totalSub}>Across 6 accounts, 4 currencies</div>
            </div>
            <div className={styles.pieSection}>
              <div className={styles.sectionTitle}>Currency Breakdown</div>
              <div className={styles.pieContainer}>
                <div className={styles.pieChart} style={{ background: buildPieGradient() }}>
                  <div className={styles.pieCenter}>
                    <div className={styles.pieCenterValue}>$12.8M</div>
                    <div className={styles.pieCenterLabel}>Total</div>
                  </div>
                </div>
                <div className={styles.pieLegend}>
                  {currencyBreakdown.map((c) => (
                    <div key={c.currency} className={styles.pieLegendItem}>
                      <div className={styles.pieLegendLeft}>
                        <div className={styles.pieLegendDot} style={{ background: c.color }} />
                        <span className={styles.pieLegendName}>{c.currency} ({c.pct}%)</span>
                      </div>
                      <span className={styles.pieLegendValue}>{c.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bank Accounts */}
          <div className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>{t('treasury.investmentPortfolio')}</div>
          <div className={styles.bankGrid}>
            {bankAccounts.map((acct, i) => (
              <div key={i} className={styles.bankCard}>
                <div className={styles.bankHeader}>
                  <div>
                    <div className={styles.bankName}>{acct.bank}</div>
                    <div className={styles.bankType}>{acct.name} &middot; {acct.type}</div>
                  </div>
                  <span className={getStatusClass(acct.status)}>{acct.status}</span>
                </div>
                <div className={styles.bankBalance}>{acct.balance}</div>
                <div className={styles.bankCurrency}>{acct.currency}</div>
                <div className={styles.bankFooter}>
                  <span className={styles.bankUpdated}>Updated {acct.updated}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Cash Buffer Status */}
          <div className={styles.bufferSection}>
            <div className={styles.sectionTitle}>Cash Buffer Status</div>
            <div className={styles.bufferGrid}>
              <div className={styles.bufferMetric}>
                <div className={styles.bufferMetricValue}>$2.0M</div>
                <div className={styles.bufferMetricLabel}>Minimum Buffer</div>
              </div>
              <div className={styles.bufferMetric}>
                <div className={styles.bufferMetricValue} style={{ color: '#23C343' }}>$3.8M</div>
                <div className={styles.bufferMetricLabel}>Current Buffer</div>
              </div>
              <div className={styles.bufferMetric}>
                <div className={styles.bufferMetricValue} style={{ color: '#23C343' }}>Healthy</div>
                <div className={styles.bufferMetricLabel}>Buffer Health</div>
              </div>
              <div className={styles.bufferMetric}>
                <div className={styles.bufferMetricValue}>18 days</div>
                <div className={styles.bufferMetricLabel}>Days of Coverage</div>
              </div>
            </div>
            <div className={styles.bufferBar}>
              <div className={`${styles.bufferFill} ${styles.bufferHealthy}`} style={{ width: '76%' }} />
            </div>
          </div>

          {/* AI Treasury Insights */}
          <div className={styles.aiCard}>
            <div className={styles.aiHeader}>
              <div className={styles.aiIcon}>AI</div>
              <h3 className={styles.aiTitle}>Treasury Insights</h3>
            </div>
            <div className={styles.insightsGrid}>
              {aiInsights.map((ins, i) => (
                <div key={i} className={styles.insightCard}>
                  <div className={styles.insightIconRow}>
                    <div className={`${styles.insightEmoji} ${insightColorClass(ins.color)}`}>{ins.icon}</div>
                    <div className={styles.insightLabel}>{ins.label}</div>
                  </div>
                  <div className={styles.insightDesc}>{ins.desc}</div>
                  <div className={styles.insightRoi}>
                    <span className={`${styles.insightRoiValue} ${ins.roiType === 'risk' ? styles.insightRoiRisk : styles.insightRoiSavings}`}>{ins.roi}</span>
                    <span className={styles.insightRoiLabel}>{ins.roiLabel}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.insightsTotalRow}>
              <span className={styles.insightsTotalLabel}>Total optimization opportunity this period</span>
              <span className={styles.insightsTotalValue}>$74.8K savings + $340K risk mitigation</span>
            </div>
          </div>
        </>
      )}

      {/* ─── Forecast Tab ─── */}
      {activeTab === 'forecast' && (
        <>
          {/* KPI Row */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>12-Week Net Position</div>
              <div className={styles.kpiValue}>+$2.4M</div>
              <div className={`${styles.kpiSub} ${styles.kpiUp}`}>Net positive inflow</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Total Projected Inflows</div>
              <div className={styles.kpiValue}>$12.75M</div>
              <div className={`${styles.kpiSub} ${styles.kpiUp}`}>Avg $1.06M/week</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Total Projected Outflows</div>
              <div className={styles.kpiValue}>$10.97M</div>
              <div className={`${styles.kpiSub} ${styles.kpiNeutral}`}>Avg $914K/week</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Forecast Accuracy</div>
              <div className={styles.kpiValue}>94.2%</div>
              <div className={`${styles.kpiSub} ${styles.kpiUp}`}>At 2-week horizon</div>
            </div>
          </div>

          {/* 12-Week Forecast Chart */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>AI Cash Forecast &mdash; 12 Weeks</div>
              <div className={styles.forecastAccuracy}>
                <span className={styles.forecastAccuracyDot} />
                94.2% accurate at 2-week horizon
              </div>
            </div>
            <div className={styles.forecastChart}>
              {weeklyForecast.map((w) => {
                const inflowH = (w.inflow / forecastMax) * 100;
                const outflowH = (w.outflow / forecastMax) * 100;
                return (
                  <div key={w.week} className={styles.forecastWeek}>
                    <div className={styles.forecastBars}>
                      <div
                        className={styles.barInflow}
                        style={{
                          height: `${inflowH}px`,
                          opacity: 0.4 + w.confidence * 0.6,
                        }}
                        title={`Inflow: $${w.inflow}K (${Math.round(w.confidence * 100)}% conf)`}
                      />
                      <div
                        className={styles.barOutflow}
                        style={{
                          height: `${outflowH}px`,
                          background: '#F76560',
                          opacity: 0.4 + w.confidence * 0.6,
                        }}
                        title={`Outflow: $${w.outflow}K (${Math.round(w.confidence * 100)}% conf)`}
                      />
                    </div>
                    <span className={styles.forecastLabel}>{w.week}</span>
                  </div>
                );
              })}
            </div>
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotInflow}`} />
                Projected Inflows
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotOutflow}`} />
                Projected Outflows
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotConfidence}`} />
                Darker = Higher Confidence
              </div>
            </div>
          </div>

          {/* Payment Calendar */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Upcoming Payment Calendar</div>
            <div className={styles.calendarGrid}>
              {paymentCalendar.map((day) => (
                <div key={day.date} className={styles.calendarDay}>
                  <div className={styles.calendarDayHeader}>{day.day}</div>
                  <div className={styles.calendarDayDate}>{day.date}</div>
                  {day.items.map((item, j) => (
                    <div key={j} className={styles.calendarItem}>
                      <div className={styles.calendarItemName}>{item.supplier}</div>
                      <div className={styles.calendarItemAmount}>{item.amount} &middot; {item.method}</div>
                      <div className={`${styles.calendarItemImpact} ${styles.impactNeg}`}>{item.impact}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ─── Payment Optimization Tab ─── */}
      {activeTab === 'optimization' && (
        <>
          {/* Payment Scenarios Comparison */}
          <div className={styles.scenarioGrid}>
            {paymentScenarios.map((sc) => (
              <div
                key={sc.name}
                className={`${styles.scenarioCard} ${sc.rating === 'Recommended' ? styles.scenarioRecommended : ''}`}
              >
                {sc.rating === 'Recommended' && (
                  <div className={styles.scenarioRecommendedTag}>AI Recommended</div>
                )}
                <div className={styles.scenarioName}>{sc.name}</div>
                <div className={styles.scenarioMetrics}>
                  <div className={styles.scenarioMetric}>
                    <span className={styles.scenarioMetricLabel}>Cash Impact</span>
                    <span className={styles.scenarioMetricValue}>{sc.cashImpact}</span>
                  </div>
                  <div className={styles.scenarioMetric}>
                    <span className={styles.scenarioMetricLabel}>Discounts</span>
                    <span className={styles.scenarioMetricValue}>{sc.discounts}</span>
                  </div>
                  <div className={styles.scenarioMetric}>
                    <span className={styles.scenarioMetricLabel}>Late Fees Risk</span>
                    <span className={styles.scenarioMetricValue}>{sc.lateFees}</span>
                  </div>
                  <div className={styles.scenarioMetric}>
                    <span className={styles.scenarioMetricLabel}>Working Capital</span>
                    <span className={styles.scenarioMetricValue}>{sc.wcEffect}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Payment Timing Recommendations */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>AI Payment Timing Recommendations</div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Optimal Pay Date</th>
                    <th>Strategy</th>
                    <th>Savings/Cost</th>
                    <th>Cash Impact</th>
                    <th>AI Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {optimizationInvoices.map((inv, i) => (
                    <tr key={i}>
                      <td>{inv.supplier}</td>
                      <td>{inv.amount}</td>
                      <td>{inv.due}</td>
                      <td>{inv.optimalDate}</td>
                      <td>
                        <span className={`${styles.badge} ${
                          inv.strategy === 'Early Discount' ? styles.badgeGreen :
                          inv.strategy === 'Defer' ? styles.badgeAmber : styles.badgeBlue
                        }`}>
                          {inv.strategy}
                        </span>
                      </td>
                      <td className={getStrategyClass(inv.strategy)}>{inv.savings}</td>
                      <td>{inv.cashImpact}</td>
                      <td>
                        <span className={styles.confidenceBar}>
                          <span
                            className={`${styles.confidenceFill} ${getConfidenceClass(inv.confidence)}`}
                            style={{ width: `${inv.confidence}%` }}
                          />
                        </span>
                        {inv.confidence}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplier Priority Matrix + Batch Builder */}
          <div className={styles.twoCol}>
            {/* Supplier Priority Matrix */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Supplier Priority Matrix</div>
              <div className={styles.matrixGrid}>
                <div className={styles.matrixColumn}>
                  <div className={`${styles.matrixColumnTitle} ${styles.matrixCritical}`}>
                    Critical &mdash; Must Pay On Time
                  </div>
                  {supplierPriority.critical.map((s, i) => (
                    <div key={i} className={styles.matrixItem}>
                      <div>
                        <div className={styles.matrixSupplier}>{s.name}</div>
                        <div className={styles.matrixReason}>{s.reason}</div>
                      </div>
                      <div className={styles.matrixAmount}>{s.amount}</div>
                    </div>
                  ))}
                </div>
                <div className={styles.matrixColumn}>
                  <div className={`${styles.matrixColumnTitle} ${styles.matrixFlexible}`}>
                    Flexible &mdash; Can Optimize
                  </div>
                  {supplierPriority.flexible.map((s, i) => (
                    <div key={i} className={styles.matrixItem}>
                      <div>
                        <div className={styles.matrixSupplier}>{s.name}</div>
                        <div className={styles.matrixReason}>{s.reason}</div>
                      </div>
                      <div className={styles.matrixAmount}>{s.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cash-Aware Batch Builder */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Cash-Aware Batch Builder</div>
              <div className={styles.batchSummary}>
                <div className={styles.batchMetric}>
                  <div className={styles.batchMetricValue}>$340,000</div>
                  <div className={styles.batchMetricLabel}>Batch Total</div>
                </div>
                <div className={styles.batchMetric}>
                  <div className={styles.batchMetricValue}>$5,200,000</div>
                  <div className={styles.batchMetricLabel}>Available Cash</div>
                </div>
                <div className={styles.batchMetric}>
                  <div className={styles.batchMetricValue}>$2,000,000</div>
                  <div className={styles.batchMetricLabel}>Buffer Required</div>
                </div>
                <div className={styles.batchMetric}>
                  <div className={styles.batchMetricValue} style={{ color: '#23C343' }}>$2,860,000</div>
                  <div className={styles.batchMetricLabel}>Net Available</div>
                </div>
              </div>
              {batchItems.map((item, i) => (
                <div key={i} className={styles.batchItem}>
                  <div className={styles.batchItemLeft}>
                    <input
                      type="checkbox"
                      className={styles.batchCheckbox}
                      checked={item.included}
                      readOnly
                    />
                    <div>
                      <div className={styles.batchItemName}>{item.name}</div>
                      <div className={styles.batchItemDue}>Due {item.due}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.batchItemAmount}>{item.amount}</div>
                    <div className={`${styles.batchItemStatus} ${
                      item.included ? styles.strategyEarly : styles.strategyDefer
                    }`}>
                      {item.strategy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ─── Working Capital Tab ─── */}
      {activeTab === 'capital' && (
        <>
          {/* Working Capital KPIs */}
          <div className={styles.wcGrid}>
            <div className={styles.wcCard}>
              <div className={`${styles.wcValue} ${styles.wcGood}`}>34</div>
              <div className={styles.wcLabel}>DSO (Days Sales Outstanding)</div>
              <div className={`${styles.wcDelta} ${styles.wcGood}`}>-2 days vs prior month</div>
            </div>
            <div className={styles.wcCard}>
              <div className={`${styles.wcValue} ${styles.wcGood}`}>42</div>
              <div className={styles.wcLabel}>DPO (Days Payable Outstanding)</div>
              <div className={`${styles.wcDelta} ${styles.wcGood}`}>+3 days vs prior month</div>
            </div>
            <div className={styles.wcCard}>
              <div className={`${styles.wcValue} ${styles.wcGood}`}>-8</div>
              <div className={styles.wcLabel}>Cash Conversion Cycle</div>
              <div className={`${styles.wcDelta} ${styles.wcGood}`}>Negative = cash efficient</div>
            </div>
            <div className={styles.wcCard}>
              <div className={`${styles.wcValue} ${styles.wcNeutral}`}>2.1x</div>
              <div className={styles.wcLabel}>Current Ratio</div>
              <div className={`${styles.wcDelta} ${styles.wcGood}`}>Above 2.0x target</div>
            </div>
          </div>

          {/* Trend Charts + Aging */}
          <div className={styles.wcDetailGrid}>
            {/* DSO Trend */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>DSO Trend (6 Months)</div>
              <div className={styles.wcTrend}>
                {wcTrend.dso.map((v, i) => (
                  <div
                    key={i}
                    className={styles.wcTrendBar}
                    style={{ height: `${((v - 28) / 14) * 60}px`, background: '#165DFF' }}
                    title={`${v} days`}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Sep</span>
                <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Oct</span>
                <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Nov</span>
                <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Dec</span>
                <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Jan</span>
                <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Feb</span>
              </div>
            </div>

            {/* DPO Trend */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>DPO Trend (6 Months)</div>
              <div className={styles.wcTrend}>
                {wcTrend.dpo.map((v, i) => (
                  <div
                    key={i}
                    className={styles.wcTrendBar}
                    style={{ height: `${((v - 34) / 12) * 60}px`, background: '#8E51DA' }}
                    title={`${v} days`}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Sep</span>
                <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Oct</span>
                <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Nov</span>
                <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Dec</span>
                <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Jan</span>
                <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Feb</span>
              </div>
            </div>
          </div>

          {/* AR and AP Aging */}
          <div className={styles.twoCol}>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Accounts Receivable Aging</div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Aging Bucket</th>
                      <th>Amount</th>
                      <th>% of Total</th>
                      <th>Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wcArAging.map((row) => (
                      <tr key={row.bucket}>
                        <td>{row.bucket}</td>
                        <td>{row.amount}</td>
                        <td>{row.pct}%</td>
                        <td>
                          <div style={{ width: '80px', height: '6px', background: '#E5E6EB', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${row.pct}%`, height: '100%', background: row.color, borderRadius: '3px' }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Accounts Payable Aging</div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Aging Bucket</th>
                      <th>Amount</th>
                      <th>% of Total</th>
                      <th>Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wcApAging.map((row) => (
                      <tr key={row.bucket}>
                        <td>{row.bucket}</td>
                        <td>{row.amount}</td>
                        <td>{row.pct}%</td>
                        <td>
                          <div style={{ width: '80px', height: '6px', background: '#E5E6EB', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${row.pct}%`, height: '100%', background: row.color, borderRadius: '3px' }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cash Conversion Cycle Visual */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Cash Conversion Cycle Trend (6 Months)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
                {wcTrend.ccc.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${Math.abs(v) * 8}px`,
                      background: v < 0 ? '#23C343' : '#F76560',
                      borderRadius: '2px 2px 0 0',
                      opacity: 0.5 + (i / 6) * 0.5,
                    }}
                    title={`CCC: ${v} days`}
                  />
                ))}
              </div>
              <div style={{ textAlign: 'right', minWidth: '120px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#23C343' }}>-8 days</div>
                <div style={{ fontSize: '0.75rem', color: '#86909C' }}>Current CCC</div>
                <div style={{ fontSize: '0.6875rem', color: '#23C343', marginTop: '0.25rem' }}>Improving trend</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #E5E6EB' }}>
              <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Sep</span>
              <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Oct</span>
              <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Nov</span>
              <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Dec</span>
              <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Jan</span>
              <span style={{ fontSize: '0.6875rem', color: '#4E5969' }}>Feb</span>
            </div>
          </div>

          {/* AI Working Capital Insight */}
          <div className={styles.aiCard}>
            <div className={styles.aiHeader}>
              <div className={styles.aiIcon}>AI</div>
              <h3 className={styles.aiTitle}>Working Capital Optimization</h3>
            </div>
            <div className={styles.insightsGrid}>
              <div className={styles.insightCard}>
                <div className={styles.insightIconRow}>
                  <div className={`${styles.insightEmoji} ${styles.insightGreen}`}>$</div>
                  <div className={styles.insightLabel}>DSO Improvement</div>
                </div>
                <div className={styles.insightDesc}>
                  DSO has decreased from 38 to 34 days over 6 months. AI projects further improvement to 31 days by Q2 through automated dunning and early-pay incentives.
                </div>
              </div>
              <div className={styles.insightCard}>
                <div className={styles.insightIconRow}>
                  <div className={`${styles.insightEmoji} ${styles.insightPurple}`}>DPO</div>
                </div>
                <div className={styles.insightDesc}>
                  DPO extended to 42 days through strategic payment timing. Further optimization possible: shifting 12 flexible suppliers to net-45 terms would add $180K in float.
                </div>
              </div>
              <div className={styles.insightCard}>
                <div className={styles.insightIconRow}>
                  <div className={`${styles.insightEmoji} ${styles.insightAmber}`}>!</div>
                  <div className={styles.insightLabel}>AR Aging Risk</div>
                </div>
                <div className={styles.insightDesc}>
                  $340K in receivables exceeding 60 days. Three customers flagged: Orion Inc ($140K), Nexus Ltd ($120K), Vertex Co ($80K). Recommend escalated collection.
                </div>
              </div>
              <div className={styles.insightCard}>
                <div className={styles.insightIconRow}>
                  <div className={`${styles.insightEmoji} ${styles.insightBlue}`}>CCC</div>
                </div>
                <div className={styles.insightDesc}>
                  Negative cash conversion cycle (-8 days) means the company is effectively being paid before it pays suppliers. This is a strong competitive advantage in working capital.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
