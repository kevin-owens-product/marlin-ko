'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './analytics.module.css';

const periods = ['7D', '30D', '90D', 'YTD', '1Y'];

const topSuppliers = [
  { name: 'Acme Corporation', spend: 2450000, pct: 100 },
  { name: 'GlobalTech Solutions', spend: 1870000, pct: 76 },
  { name: 'Nordic Supplies AB', spend: 1340000, pct: 55 },
  { name: 'Tokyo Precision Inc', spend: 980000, pct: 40 },
  { name: 'Baxter Medical Ltd', spend: 890000, pct: 36 },
  { name: 'Shanghai Electronics', spend: 780000, pct: 32 },
  { name: 'MexiParts Industrial', spend: 650000, pct: 27 },
  { name: 'Berlin Consulting AG', spend: 520000, pct: 21 },
  { name: 'Paris Logistics SAS', spend: 440000, pct: 18 },
  { name: 'Sydney Mining Corp', spend: 380000, pct: 16 },
];

const categories = [
  { name: 'IT Services', pct: 32, color: '#165DFF' },
  { name: 'Manufacturing', pct: 24, color: '#23C343' },
  { name: 'Professional Services', pct: 18, color: '#FF9A2E' },
  { name: 'Office Supplies', pct: 12, color: '#8E51DA' },
  { name: 'Logistics', pct: 9, color: '#F76560' },
  { name: 'Other', pct: 5, color: '#4E5969' },
];

const monthlySpend = [
  { month: 'Jan', amount: 2.1 }, { month: 'Feb', amount: 1.8 }, { month: 'Mar', amount: 2.4 },
  { month: 'Apr', amount: 2.2 }, { month: 'May', amount: 1.9 }, { month: 'Jun', amount: 2.6 },
  { month: 'Jul', amount: 2.3 }, { month: 'Aug', amount: 2.0 }, { month: 'Sep', amount: 2.8 },
  { month: 'Oct', amount: 2.5 }, { month: 'Nov', amount: 2.1 }, { month: 'Dec', amount: 2.7 },
];

const agingData = [
  { label: 'Current', count: 847, amount: '$4.2M', color: '#23C343' },
  { label: '1-30 Days', count: 234, amount: '$1.8M', color: '#165DFF' },
  { label: '31-60 Days', count: 89, amount: '$720K', color: '#FF9A2E' },
  { label: '61-90 Days', count: 34, amount: '$290K', color: '#f97316' },
  { label: '90+ Days', count: 12, amount: '$145K', color: '#F76560' },
];

const agents = [
  { name: 'Capture Agent', accuracy: 99.2, processed: 847, avgTime: '0.8s' },
  { name: 'Classification Agent', accuracy: 97.3, processed: 841, avgTime: '0.6s' },
  { name: 'Compliance Agent', accuracy: 98.7, processed: 838, avgTime: '1.1s' },
  { name: 'Matching Agent', accuracy: 94.2, processed: 824, avgTime: '1.4s' },
  { name: 'Risk Agent', accuracy: 96.8, processed: 824, avgTime: '0.9s' },
  { name: 'Approval Agent', accuracy: 95.1, processed: 812, avgTime: '0.5s' },
];

const maxSpend = Math.max(...monthlySpend.map(m => m.amount));

/* ===== Benchmark Comparison Data ===== */
const benchmarkMetrics = [
  {
    name: 'Cost per Invoice',
    yours: '$1.23',
    industry: '$1.87',
    pctYours: 34,
    pctIndustry: 51,
    barColor: '#165DFF',
    advantage: '34% below benchmark',
    savings: '$640K annual savings',
    badge: 'Top Performer',
    badgeType: 'green' as const,
  },
  {
    name: 'Touchless Rate',
    yours: '94.9%',
    industry: '78%',
    pctYours: 95,
    pctIndustry: 78,
    barColor: '#23C343',
    advantage: '16.9pp above industry',
    savings: 'Top 5% of platforms',
    badge: 'Best-in-Class',
    badgeType: 'green' as const,
  },
  {
    name: 'Processing Time',
    yours: '3.2 hrs',
    industry: '8.0 hrs',
    pctYours: 40,
    pctIndustry: 100,
    barColor: '#8E51DA',
    advantage: '60% faster',
    savings: '4.8 hrs saved per invoice',
    badge: 'Elite Speed',
    badgeType: 'blue' as const,
  },
  {
    name: 'Exception Rate',
    yours: '5.1%',
    industry: '12%',
    pctYours: 43,
    pctIndustry: 100,
    barColor: '#FF9A2E',
    advantage: '58% fewer exceptions',
    savings: '6.9pp below average',
    badge: 'Low Risk',
    badgeType: 'green' as const,
  },
  {
    name: 'Fraud Detection',
    yours: '99.2%',
    industry: '94%',
    pctYours: 99,
    pctIndustry: 94,
    barColor: '#F76560',
    advantage: '5.2pp above benchmark',
    savings: 'Best-in-class',
    badge: 'Top 1%',
    badgeType: 'green' as const,
  },
];

/* ===== AI Spend Recommendations Data ===== */
const spendRecommendations = [
  {
    title: 'Category Consolidation',
    description: '23 suppliers in IT Services — consolidating to top 5 could save $180K/year through volume pricing. Current fragmentation drives 31% cost premium vs. consolidated peers.',
    impact: '$180K/year',
    priority: 'high' as const,
  },
  {
    title: 'Early Payment Capture',
    description: '$420K in available early-pay discounts this month across 34 eligible invoices. Average discount: 2.1% / 10 net 30. Current capture rate: 68% — optimizing payment timing lifts this to 92%.',
    impact: '$420K/month',
    priority: 'high' as const,
  },
  {
    title: 'Supplier Risk Mitigation',
    description: '2 suppliers with >$500K annual spend show declining delivery metrics — recommend sourcing alternatives. Shanghai Electronics (78% risk score) and Nordic Supplies (65% risk score) flagged.',
    impact: '$1.2M at risk',
    priority: 'medium' as const,
  },
  {
    title: 'Payment Method Optimization',
    description: 'Converting 15 wire transfers to virtual cards would generate $22K in annual rebates. Wire transfer fees of $35/each vs. virtual card rebates of 1.5% on average transaction of $12K.',
    impact: '$22K/year',
    priority: 'low' as const,
  },
];

/* ===== Spend Anomaly Detection Data ===== */
const spendAnomalies = [
  {
    category: 'Office Supplies',
    description: '+42% vs 6-month average ($34K overspend). Spike driven by Q1 bulk ordering from 3 new cost centers. No approved POs on file for $18K of the variance.',
    severity: 'amber' as const,
    trendValue: '+42%',
    trendLabel: 'vs 6-mo avg',
    amount: '$34K over',
    action: 'Review bulk orders with cost center managers; enforce PO requirements',
  },
  {
    category: 'Travel & Entertainment',
    description: '+18% vs budget ($12K over). Conference season driving higher-than-forecast travel spend. 4 trips above per-diem policy limits detected.',
    severity: 'amber' as const,
    trendValue: '+18%',
    trendLabel: 'vs budget',
    amount: '$12K over',
    action: 'Flag policy violations; review conference ROI with department heads',
  },
  {
    category: 'Consulting Fees',
    description: 'New vendor Apex Advisory at $89K — no historical baseline. Engagement approved by VP Engineering but bypassed standard procurement workflow. Single-source selection.',
    severity: 'blue' as const,
    trendValue: 'New',
    trendLabel: 'no baseline',
    amount: '$89K',
    action: 'Conduct retroactive vendor qualification; add to approved vendor list',
  },
  {
    category: 'Duplicate Risk',
    description: '3 potential duplicate invoices detected worth $14.2K. Pattern: same supplier, amounts within 2%, dates within 5 business days. Two from Acme Corp, one from GlobalTech.',
    severity: 'red' as const,
    trendValue: '3 found',
    trendLabel: 'this period',
    amount: '$14.2K',
    action: 'Hold payment on flagged invoices; verify with suppliers before release',
  },
];

export default function AnalyticsPage() {
  const t = useT();
  const [period, setPeriod] = useState('30D');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('analytics.title')}</h1>
          <p className={styles.subtitle}>{t('analytics.subtitle')}</p>
        </div>
        <div className={styles.dateRange}>
          {periods.map(p => (
            <button key={p} className={`${styles.dateBtn} ${period === p ? styles.dateBtnActive : ''}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
      </div>

      <div className={styles.kpiGrid}>
        {[
          { label: 'Total Processed', value: '12,847', trend: '↑ 12.3%', up: true },
          { label: 'Touchless Rate', value: '94.9%', trend: '↑ 2.3%', up: true },
          { label: t('analytics.avgProcessingTime'), value: '3.2 hrs', trend: '↓ 18%', up: true },
          { label: t('analytics.costPerInvoice'), value: '$1.23', trend: '↓ $0.34', up: true },
        ].map(kpi => (
          <div key={kpi.label} className={styles.kpiCard}>
            <div className={styles.kpiLabel}>{kpi.label}</div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={`${styles.kpiTrend} ${kpi.up ? styles.trendUp : styles.trendDown}`}>{kpi.trend} vs last period</div>
          </div>
        ))}
      </div>

      <div className={styles.grid2}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('analytics.topSuppliersByVolume')}</h2>
          <div className={styles.barChart}>
            {topSuppliers.map(s => (
              <div key={s.name} className={styles.barRow}>
                <span className={styles.barLabel}>{s.name}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${s.pct}%`, background: '#165DFF' }}>
                    <span className={styles.barValue}>${(s.spend / 1e6).toFixed(1)}M</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('analytics.spendByCategory')}</h2>
          <div className={styles.barChart}>
            {categories.map(c => (
              <div key={c.name} className={styles.barRow}>
                <span className={styles.barLabel}>{c.name}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${c.pct}%`, background: c.color }}>
                    <span className={styles.barValue}>{c.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <h2 className={styles.sectionTitle}>{t('analytics.processingTrends')}</h2>
            <div className={styles.monthlyChart}>
              {monthlySpend.map(m => (
                <div key={m.month} className={styles.monthBar}>
                  <div className={styles.monthBarFill} style={{ height: `${(m.amount / maxSpend) * 120}px`, background: '#165DFF' }} />
                  <span className={styles.monthLabel}>{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('analytics.exceptionAnalysis')}</h2>
        <div className={styles.agingGrid}>
          {agingData.map(a => (
            <div key={a.label} className={styles.agingCard} style={{ borderLeft: `3px solid ${a.color}` }}>
              <div className={styles.agingLabel}>{a.label}</div>
              <div className={styles.agingCount}>{a.count}</div>
              <div className={styles.agingAmount}>{a.amount}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('analytics.aiPerformance')}</h2>
        <div className={styles.agentGrid}>
          {agents.map(a => (
            <div key={a.name} className={styles.agentCard}>
              <div className={styles.agentName}>{a.name}</div>
              <div className={styles.agentStat}><span>Accuracy</span><span className={styles.agentValue}>{a.accuracy}%</span></div>
              <div className={styles.agentStat}><span>Processed Today</span><span className={styles.agentValue}>{a.processed}</span></div>
              <div className={styles.agentStat}><span>Avg Time</span><span className={styles.agentValue}>{a.avgTime}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* ========== Benchmark Comparison Section ========== */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderLeft}>
            <h2 className={styles.sectionHeaderTitle}>Industry Benchmark Comparison</h2>
            <span className={styles.networkBadge}>
              <span className={styles.networkDot} />
              Powered by Medius Data Network — 4,218 companies
            </span>
          </div>
        </div>
        <div className={styles.benchmarkGrid}>
          {benchmarkMetrics.map(m => (
            <div key={m.name} className={styles.benchmarkCard}>
              <div className={styles.benchmarkCardHeader}>
                <span className={styles.benchmarkMetricName}>{m.name}</span>
                <span className={`${styles.benchmarkStatusBadge} ${m.badgeType === 'green' ? styles.badgeGreen : styles.badgeBlue}`}>
                  {m.badge}
                </span>
              </div>
              <div className={styles.benchmarkValues}>
                <span className={styles.benchmarkYourValue}>{m.yours}</span>
                <span className={styles.benchmarkVs}>vs</span>
                <span className={styles.benchmarkIndustryValue}>{m.industry} avg</span>
              </div>
              <div className={styles.benchmarkBarContainer}>
                <div className={styles.benchmarkBarYours} style={{ width: `${m.pctYours}%`, background: m.barColor }} />
                <div className={styles.benchmarkBarIndustry} style={{ left: `${m.pctIndustry}%` }} />
              </div>
              <div className={styles.benchmarkCallout}>
                <span className={m.barColor === '#165DFF' ? styles.benchmarkCalloutBlue : styles.benchmarkCalloutHighlight}>
                  {m.advantage}
                </span>
                {' '}&mdash; {m.savings}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========== AI Spend Recommendations Section ========== */}
      <div className={styles.aiSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderLeft}>
            <span className={styles.aiSectionIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" />
                <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
                <path d="M8 15h8" /><path d="M8 19h8" />
              </svg>
            </span>
            <h2 className={styles.sectionHeaderTitle}>AI Spend Recommendations</h2>
          </div>
          <span className={styles.networkBadge}>
            <span className={styles.networkDot} />
            4 Actionable Insights
          </span>
        </div>
        <p className={styles.sectionSubtitle}>
          Strategic opportunities identified by Medius AI across your spend data — ranked by potential ROI impact.
        </p>
        <div className={styles.recommendationsList}>
          {spendRecommendations.map(rec => (
            <div key={rec.title} className={styles.recommendationCard}>
              <div className={styles.recommendationTop}>
                <div className={styles.recommendationTitleRow}>
                  <span className={`${styles.priorityDot} ${
                    rec.priority === 'high' ? styles.priorityHigh :
                    rec.priority === 'medium' ? styles.priorityMedium :
                    styles.priorityLow
                  }`} />
                  <span className={styles.recommendationTitle}>{rec.title}</span>
                </div>
                <span className={styles.impactBadge}>{rec.impact}</span>
              </div>
              <div className={styles.recommendationDesc}>{rec.description}</div>
              <div className={styles.recommendationFooter}>
                <span className={`${styles.priorityLabel} ${
                  rec.priority === 'high' ? styles.priorityLabelHigh :
                  rec.priority === 'medium' ? styles.priorityLabelMedium :
                  styles.priorityLabelLow
                }`}>
                  {rec.priority === 'high' ? 'High Priority' : rec.priority === 'medium' ? 'Medium Priority' : 'Opportunity'}
                </span>
                <button className={styles.recommendationAction}>View Details &rarr;</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========== Spend Anomaly Detection Section ========== */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderLeft}>
            <h2 className={styles.sectionHeaderTitle}>Spend Anomaly Detection</h2>
          </div>
          <span className={`${styles.severityBadge} ${styles.severityRed}`}>4 Active Alerts</span>
        </div>
        <p className={styles.sectionSubtitle}>
          Automated monitoring flags unusual spend patterns, budget variances, and potential risks requiring review.
        </p>
        <div className={styles.anomalyList}>
          {spendAnomalies.map(a => (
            <div key={a.category} className={`${styles.anomalyCard} ${
              a.severity === 'amber' ? styles.anomalyCardAmber :
              a.severity === 'red' ? styles.anomalyCardRed :
              styles.anomalyCardBlue
            }`}>
              <div className={`${styles.anomalyIconWrap} ${
                a.severity === 'amber' ? styles.anomalyIconAmber :
                a.severity === 'red' ? styles.anomalyIconRed :
                styles.anomalyIconBlue
              }`}>
                {a.severity === 'red' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                ) : a.severity === 'amber' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                )}
              </div>
              <div className={styles.anomalyContent}>
                <div className={styles.anomalyHeader}>
                  <span className={styles.anomalyTitle}>{a.category}</span>
                  <span className={`${styles.severityBadge} ${
                    a.severity === 'amber' ? styles.severityAmber :
                    a.severity === 'red' ? styles.severityRed :
                    styles.severityBlue
                  }`}>
                    {a.severity === 'amber' ? 'Warning' : a.severity === 'red' ? 'Critical' : 'Info'}
                  </span>
                </div>
                <div className={styles.anomalyDesc}>{a.description}</div>
                <div className={styles.anomalyFooter}>
                  <span className={`${styles.anomalyTrend} ${
                    a.severity === 'amber' ? styles.anomalyTrendAmber :
                    a.severity === 'red' ? styles.anomalyTrendRed :
                    styles.anomalyTrendBlue
                  }`}>
                    {a.severity === 'red' ? '\u26A0' : a.severity === 'amber' ? '\u2191' : '\u2139'} {a.trendValue} {a.trendLabel} &middot; {a.amount}
                  </span>
                  <span className={styles.anomalyRecommendation}>{a.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
