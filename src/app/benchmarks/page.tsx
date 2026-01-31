'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './benchmarks.module.css';

const tabs = ['Performance Benchmarks', 'Predictive Analytics', 'Prescriptive Insights', 'Executive Summary'];

/* ===== Benchmark Data ===== */
const benchmarkMetrics = [
  {
    name: 'Touchless Processing Rate',
    you: 94.9,
    industry: 72,
    best: 98,
    unit: '%',
    youLabel: '94.9%',
    industryLabel: '72%',
    bestLabel: '98%',
    percentile: 87,
    trend: '+3.2%',
    trendDir: 'up' as const,
    opportunity: 'Closing the 3.1% gap to best-in-class could save ~$45K/year in manual processing costs.',
  },
  {
    name: 'Cost Per Invoice',
    you: 3.2,
    industry: 8.5,
    best: 1.8,
    unit: '$',
    youLabel: '$3.20',
    industryLabel: '$8.50',
    bestLabel: '$1.80',
    percentile: 82,
    trend: '-$0.40',
    trendDir: 'up' as const,
    opportunity: 'Further automation of exception handling could reduce cost to $2.10 per invoice.',
    invert: true,
  },
  {
    name: 'Processing Time',
    you: 2.3,
    industry: 8.5,
    best: 0.5,
    unit: ' days',
    youLabel: '2.3 days',
    industryLabel: '8.5 days',
    bestLabel: '0.5 days',
    percentile: 79,
    trend: '-0.5 days',
    trendDir: 'up' as const,
    opportunity: 'AI-driven straight-through processing could bring time below 1 day.',
    invert: true,
  },
  {
    name: 'Discount Capture Rate',
    you: 68,
    industry: 40,
    best: 92,
    unit: '%',
    youLabel: '68%',
    industryLabel: '40%',
    bestLabel: '92%',
    percentile: 74,
    trend: '+5%',
    trendDir: 'up' as const,
    opportunity: 'Optimizing payment timing for top 20 suppliers could capture $320K in additional discounts.',
  },
  {
    name: 'Exception Rate',
    you: 5.1,
    industry: 15,
    best: 2,
    unit: '%',
    youLabel: '5.1%',
    industryLabel: '15%',
    bestLabel: '2%',
    percentile: 85,
    trend: '-1.2%',
    trendDir: 'up' as const,
    opportunity: 'Enhanced ML matching models could reduce exceptions by another 1.5%.',
    invert: true,
  },
  {
    name: 'Supplier Satisfaction',
    you: 4.2,
    industry: 3.1,
    best: 4.7,
    unit: '/5',
    youLabel: '4.2/5',
    industryLabel: '3.1/5',
    bestLabel: '4.7/5',
    percentile: 88,
    trend: '+0.3',
    trendDir: 'up' as const,
    opportunity: 'Improving payment predictability could lift satisfaction to 4.5+.',
    max: 5,
  },
];

/* ===== Predictive Analytics Data ===== */
const accrualBreakdown = [
  { category: 'IT Services', amount: '$820K', pct: 34 },
  { category: 'Professional Services', amount: '$510K', pct: 21 },
  { category: 'Manufacturing', amount: '$440K', pct: 18 },
  { category: 'Logistics', amount: '$380K', pct: 16 },
  { category: 'Other', amount: '$250K', pct: 11 },
];

const spendForecast = [
  { category: 'IT Services', current: '$1.2M', month1: '$1.3M', month2: '$1.1M', month3: '$1.4M', trend: [60, 72, 55, 78] },
  { category: 'Manufacturing', current: '$980K', month1: '$1.0M', month2: '$1.1M', month3: '$1.0M', trend: [55, 58, 64, 58] },
  { category: 'Professional Svcs', current: '$650K', month1: '$700K', month2: '$680K', month3: '$750K', trend: [45, 50, 48, 54] },
  { category: 'Office Supplies', current: '$420K', month1: '$390K', month2: '$410K', month3: '$400K', trend: [42, 38, 40, 39] },
  { category: 'Logistics', current: '$380K', month1: '$410K', month2: '$450K', month3: '$430K', trend: [32, 36, 42, 38] },
];

const supplierRisks = [
  { name: 'Shanghai Electronics Co.', riskType: 'Financial Distress', probability: 78, severity: 'high' as const, action: 'Diversify supply chain' },
  { name: 'Nordic Supplies AB', riskType: 'Delivery Delays', probability: 65, severity: 'high' as const, action: 'Negotiate SLA penalties' },
  { name: 'GlobalTech Solutions', riskType: 'Compliance Gap', probability: 52, severity: 'medium' as const, action: 'Request audit report' },
  { name: 'MexiParts Industrial', riskType: 'Price Volatility', probability: 44, severity: 'medium' as const, action: 'Lock in 6-mo contract' },
  { name: 'Berlin Consulting AG', riskType: 'Capacity Constraint', probability: 31, severity: 'low' as const, action: 'Identify backup vendor' },
];

const volumeHistory = [
  { label: 'Feb', value: 1050, forecast: false },
  { label: 'Mar', value: 1120, forecast: false },
  { label: 'Apr', value: 980, forecast: false },
  { label: 'May', value: 1200, forecast: false },
  { label: 'Jun', value: 1340, forecast: false },
  { label: 'Jul', value: 1180, forecast: false },
  { label: 'Aug', value: 1090, forecast: false },
  { label: 'Sep', value: 1420, forecast: false },
  { label: 'Oct', value: 1310, forecast: false },
  { label: 'Nov', value: 1150, forecast: false },
  { label: 'Dec', value: 1480, forecast: false },
  { label: 'Jan', value: 1390, forecast: false },
  { label: 'Feb*', value: 1450, forecast: true },
  { label: 'Mar*', value: 1520, forecast: true },
  { label: 'Apr*', value: 1410, forecast: true },
];

const maxVolume = Math.max(...volumeHistory.map(v => v.value));

/* ===== Prescriptive Insights Data ===== */
const insights = [
  {
    priority: 'High' as const,
    category: 'Cost Reduction',
    title: 'Consolidate office supply vendors',
    description: 'Reducing from 12 to 3 preferred vendors for office supplies can leverage volume discounts and reduce procurement overhead.',
    impact: '$185K/year',
    effort: 'Low',
  },
  {
    priority: 'High' as const,
    category: 'Process Optimization',
    title: 'Automate 3-way matching exceptions',
    description: 'Top 5 exception categories account for 72% of manual interventions. Targeted ML models can resolve these automatically.',
    impact: '$240K/year',
    effort: 'Medium',
  },
  {
    priority: 'High' as const,
    category: 'Revenue Opportunity',
    title: 'Optimize early payment discounts',
    description: 'Analysis shows $4.2M in invoices eligible for 2% early payment discounts that are currently being paid at net terms.',
    impact: '$320K/year',
    effort: 'Low',
  },
  {
    priority: 'Medium' as const,
    category: 'Risk Mitigation',
    title: 'Diversify single-source suppliers',
    description: '8 critical components rely on a single supplier. Qualifying backup suppliers reduces supply chain risk by 60%.',
    impact: '$150K risk reduction',
    effort: 'High',
  },
  {
    priority: 'Medium' as const,
    category: 'Cost Reduction',
    title: 'Renegotiate IT service contracts',
    description: 'Benchmark analysis shows IT service rates are 18% above market median. Contract renegotiation due in Q2.',
    impact: '$210K/year',
    effort: 'Medium',
  },
  {
    priority: 'Medium' as const,
    category: 'Process Optimization',
    title: 'Implement dynamic approval routing',
    description: 'Current static approval chains add 1.8 days on average. AI-driven routing based on risk score can cut this to 0.4 days.',
    impact: '$95K/year',
    effort: 'Medium',
  },
  {
    priority: 'Low' as const,
    category: 'Revenue Opportunity',
    title: 'Rebate program optimization',
    description: 'Supplier rebate tracking shows $120K in unclaimed volume rebates across 6 supplier agreements.',
    impact: '$120K one-time',
    effort: 'Low',
  },
  {
    priority: 'Low' as const,
    category: 'Risk Mitigation',
    title: 'Enhance duplicate detection rules',
    description: 'Current fuzzy matching misses 2.3% of potential duplicates. Enhanced algorithms could catch an additional $67K in duplicate payments.',
    impact: '$67K/year',
    effort: 'Low',
  },
];

export default function BenchmarksPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [summaryGenerated, setSummaryGenerated] = useState(false);

  function getPercentileClass(p: number) {
    if (p >= 80) return styles.percentileHigh;
    if (p >= 50) return styles.percentileMid;
    return styles.percentileLow;
  }

  function getBarPercent(value: number, max?: number) {
    const ceiling = max || 100;
    return Math.min((value / ceiling) * 100, 100);
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('benchmarks.title')}</h1>
          <p className={styles.subtitle}>{t('benchmarks.subtitle')}</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className={styles.tabBar}>
        {tabs.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ========== TAB: Performance Benchmarks ========== */}
      {activeTab === 'Performance Benchmarks' && (
        <>
          {/* Summary KPIs */}
          <div className={styles.kpiRow}>
            <div className={styles.kpiMini}>
              <div className={styles.kpiMiniLabel}>{t('benchmarks.percentile')}</div>
              <div className={styles.kpiMiniValue}>83rd</div>
              <div className={styles.kpiMiniSub}>Top quartile</div>
            </div>
            <div className={styles.kpiMini}>
              <div className={styles.kpiMiniLabel}>Metrics Above Industry</div>
              <div className={styles.kpiMiniValue}>6 / 6</div>
              <div className={styles.kpiMiniSub}>All metrics outperform</div>
            </div>
            <div className={styles.kpiMini}>
              <div className={styles.kpiMiniLabel}>Improvement Potential</div>
              <div className={styles.kpiMiniValue}>$580K</div>
              <div className={styles.kpiMiniSub}>Annualized opportunity</div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('benchmarks.yourScore')} vs {t('benchmarks.industryAvg')}</h2>
              <span className={styles.sectionBadge}>Updated Jan 2026</span>
            </div>
            <div className={styles.benchmarkList}>
              {benchmarkMetrics.map(m => {
                const max = m.max || (m.invert ? Math.max(m.you, m.industry, m.best) * 1.1 : 100);
                const youPct = m.invert
                  ? ((max - m.you) / max) * 100
                  : getBarPercent(m.you, m.max);
                const industryPct = m.invert
                  ? ((max - m.industry) / max) * 100
                  : getBarPercent(m.industry, m.max);
                const bestPct = m.invert
                  ? ((max - m.best) / max) * 100
                  : getBarPercent(m.best, m.max);

                return (
                  <div key={m.name} className={styles.benchmarkItem}>
                    <div className={styles.benchmarkMeta}>
                      <span className={styles.benchmarkName}>{m.name}</span>
                      <span className={`${styles.benchmarkPercentile} ${getPercentileClass(m.percentile)}`}>
                        {m.percentile}th percentile
                      </span>
                    </div>

                    <div className={styles.benchmarkBarArea}>
                      <div className={styles.benchmarkBarTrack}>
                        {/* Your performance bar */}
                        <div
                          className={styles.benchmarkBarYou}
                          style={{ width: `${youPct}%`, background: '#165DFF' }}
                        >
                          <span className={styles.benchmarkBarYouLabel}>{m.youLabel}</span>
                        </div>
                        {/* Industry average marker */}
                        <div
                          className={`${styles.benchmarkMarker} ${styles.benchmarkMarkerIndustry}`}
                          style={{ left: `${industryPct}%` }}
                        >
                          <div className={`${styles.benchmarkMarkerDot} ${styles.benchmarkMarkerDotIndustry}`} />
                        </div>
                        {/* Best-in-class marker */}
                        <div
                          className={`${styles.benchmarkMarker} ${styles.benchmarkMarkerBest}`}
                          style={{ left: `${bestPct}%` }}
                        >
                          <div className={`${styles.benchmarkMarkerDot} ${styles.benchmarkMarkerDotBest}`} />
                        </div>
                      </div>
                    </div>

                    <div className={styles.benchmarkLegend}>
                      <span className={styles.benchmarkLegendItem}>
                        <span className={styles.legendDot} style={{ background: '#165DFF' }} /> You: {m.youLabel}
                      </span>
                      <span className={styles.benchmarkLegendItem}>
                        <span className={styles.legendDot} style={{ background: '#86909C' }} /> Industry Avg: {m.industryLabel}
                      </span>
                      <span className={styles.benchmarkLegendItem}>
                        <span className={styles.legendDot} style={{ background: '#FF9A2E' }} /> Best-in-Class: {m.bestLabel}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div className={`${styles.benchmarkTrend} ${m.trendDir === 'up' ? styles.trendUp : styles.trendDown}`}>
                        {m.trendDir === 'up' ? '\u2191' : '\u2193'} {m.trend} vs last quarter
                      </div>
                      <div className={styles.benchmarkOpportunity}>{m.opportunity}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ========== TAB: Predictive Analytics ========== */}
      {activeTab === 'Predictive Analytics' && (
        <>
          <div className={styles.grid2}>
            {/* Month-End Accrual Prediction */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Month-End Accrual Prediction</h2>
                <span className={styles.sectionBadge}>AI Forecast</span>
              </div>
              <div className={styles.predictionCard}>
                <div className={styles.predictionHeader}>
                  <span className={styles.predictionTitle}>Predicted Total Accrual</span>
                  <span className={styles.predictionConfidence}>94% confidence</span>
                </div>
                <div className={styles.predictionValue}>$2.4M</div>
                <div style={{ fontSize: '0.75rem', color: '#86909C', marginBottom: '0.75rem' }}>
                  Range: $2.18M &ndash; $2.62M (90% interval)
                </div>
                <div className={styles.predictionBreakdown}>
                  {accrualBreakdown.map(item => (
                    <div key={item.category} className={styles.predictionBreakdownItem}>
                      <span className={styles.predictionBreakdownLabel}>{item.category} ({item.pct}%)</span>
                      <span className={styles.predictionBreakdownVal}>{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Spend Forecast */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Spend Forecast (Next 3 Months)</h2>
                <span className={styles.sectionBadge}>By Category</span>
              </div>
              <table className={styles.forecastTable}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Current</th>
                    <th>Feb</th>
                    <th>Mar</th>
                    <th>Apr</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {spendForecast.map(row => (
                    <tr key={row.category}>
                      <td>{row.category}</td>
                      <td>{row.current}</td>
                      <td>{row.month1}</td>
                      <td>{row.month2}</td>
                      <td>{row.month3}</td>
                      <td>
                        <span className={styles.forecastTrend}>
                          {row.trend.map((h, i) => (
                            <span
                              key={i}
                              className={styles.forecastBar}
                              style={{
                                height: `${(h / 80) * 20}px`,
                                background: i === row.trend.length - 1 ? '#8E51DA' : '#165DFF',
                              }}
                            />
                          ))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.grid2}>
            {/* Supplier Risk Predictions */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Supplier Risk Predictions</h2>
                <span className={styles.sectionBadge}>5 Flagged</span>
              </div>
              <div className={styles.riskList}>
                {supplierRisks.map(r => (
                  <div
                    key={r.name}
                    className={`${styles.riskItem} ${
                      r.severity === 'high' ? styles.riskHigh : r.severity === 'medium' ? styles.riskMedium : styles.riskLow
                    }`}
                  >
                    <div className={styles.riskInfo}>
                      <div className={styles.riskSupplier}>{r.name}</div>
                      <div className={styles.riskType}>{r.riskType}</div>
                    </div>
                    <div
                      className={styles.riskProb}
                      style={{
                        color: r.severity === 'high' ? '#F76560' : r.severity === 'medium' ? '#FF9A2E' : '#165DFF',
                      }}
                    >
                      {r.probability}%
                    </div>
                    <span className={styles.riskAction}>{r.action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Volume Forecasting */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Invoice Volume Forecasting</h2>
                <span className={styles.sectionBadge}>12-Mo History + 3-Mo Forecast</span>
              </div>
              <div className={styles.volumeChart}>
                {volumeHistory.map(v => (
                  <div key={v.label} className={styles.volumeBar}>
                    <div
                      className={`${styles.volumeBarFill} ${v.forecast ? styles.volumeForecast : ''}`}
                      style={{
                        height: `${(v.value / maxVolume) * 120}px`,
                        background: v.forecast ? 'rgba(139, 92, 246, 0.25)' : '#165DFF',
                      }}
                    />
                    <span className={styles.volumeLabel}>{v.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem' }}>
                <span className={styles.benchmarkLegendItem}>
                  <span className={styles.legendDot} style={{ background: '#165DFF' }} /> Historical
                </span>
                <span className={styles.benchmarkLegendItem}>
                  <span className={styles.legendDot} style={{ background: '#8E51DA', border: '1.5px dashed #8E51DA' }} /> Forecast
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== TAB: Prescriptive Insights ========== */}
      {activeTab === 'Prescriptive Insights' && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>AI-Generated Prescriptive Insights</h2>
            <span className={styles.sectionBadge}>8 Recommendations</span>
          </div>
          <div className={styles.insightsGrid}>
            {insights.map((ins, idx) => (
              <div key={idx} className={styles.insightCard}>
                <div className={styles.insightTop}>
                  <span
                    className={`${styles.priorityBadge} ${
                      ins.priority === 'High'
                        ? styles.priorityHigh
                        : ins.priority === 'Medium'
                        ? styles.priorityMedium
                        : styles.priorityLow
                    }`}
                  >
                    {ins.priority}
                  </span>
                  <span className={styles.insightCategory}>{ins.category}</span>
                </div>
                <div className={styles.insightTitle}>{ins.title}</div>
                <div className={styles.insightDesc}>{ins.description}</div>
                <div className={styles.insightMeta}>
                  <span className={styles.insightImpact}>{ins.impact}</span>
                  <span className={styles.insightEffort}>Effort: {ins.effort}</span>
                </div>
                <button className={styles.insightAction}>Take Action</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== TAB: Executive Summary ========== */}
      {activeTab === 'Executive Summary' && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Executive Summary Generator</h2>
            <span className={styles.generatedTag}>AI-Powered</span>
          </div>

          <div className={styles.execSummary}>
            <div className={styles.execHeader}>
              <span className={styles.execTitle}>Weekly AP Performance Brief</span>
              <button className={styles.generateBtn} onClick={() => setSummaryGenerated(true)}>
                {summaryGenerated ? 'Regenerate Summary' : 'Generate Weekly Summary'}
              </button>
            </div>

            {summaryGenerated && (
              <div className={styles.execContent}>
                {/* Period & Overview */}
                <div className={styles.execSection}>
                  <div className={styles.execSectionLabel}>Period Overview</div>
                  <p className={styles.execText}>
                    <span className={styles.execHighlight}>Week of January 20 &ndash; 26, 2026</span> &mdash; The AP department
                    processed <span className={styles.execHighlight}>3,241 invoices</span> totaling{' '}
                    <span className={styles.execHighlight}>$8.7M</span> in spend, representing a{' '}
                    <span className={styles.execHighlight}>12.3% increase</span> in volume versus the prior week.
                    Touchless processing rate reached{' '}
                    <span className={styles.execHighlight}>94.9%</span>, up from 91.7% at the start of the quarter.
                  </p>
                </div>

                {/* Key Metrics */}
                <div className={styles.execSection}>
                  <div className={styles.execSectionLabel}>Key Performance Metrics</div>
                  <ul className={styles.execList}>
                    <li className={styles.execListItem}>
                      Invoice processing cost decreased to <span className={styles.execHighlight}>$3.20/invoice</span>,
                      62% below industry average of $8.50
                    </li>
                    <li className={styles.execListItem}>
                      Average cycle time of <span className={styles.execHighlight}>2.3 days</span> &mdash; 73% faster than
                      industry benchmark of 8.5 days
                    </li>
                    <li className={styles.execListItem}>
                      Exception rate held steady at <span className={styles.execHighlight}>5.1%</span>, ranking in the
                      85th percentile among peers
                    </li>
                    <li className={styles.execListItem}>
                      Early payment discount capture improved to <span className={styles.execHighlight}>68%</span>,
                      yielding $42K in savings this week
                    </li>
                    <li className={styles.execListItem}>
                      Supplier satisfaction score stable at <span className={styles.execHighlight}>4.2/5.0</span>,
                      well above industry average of 3.1
                    </li>
                  </ul>
                </div>

                {/* Trends */}
                <div className={styles.execSection}>
                  <div className={styles.execSectionLabel}>Notable Trends</div>
                  <ul className={styles.execList}>
                    <li className={styles.execListItem}>
                      IT Services spend is trending <span className={styles.execHighlight}>8% above forecast</span> &mdash;
                      driven by Q1 license renewals; expected to normalize in February
                    </li>
                    <li className={styles.execListItem}>
                      Shanghai Electronics flagged for <span className={styles.execHighlight}>financial distress risk (78%)</span> &mdash;
                      contingency sourcing evaluation underway
                    </li>
                    <li className={styles.execListItem}>
                      Invoice volume forecast projects <span className={styles.execHighlight}>1,450&ndash;1,520 invoices</span> for
                      Feb&ndash;Mar, driven by seasonal procurement patterns
                    </li>
                  </ul>
                </div>

                {/* Actions Needed */}
                <div className={styles.execSection}>
                  <div className={styles.execSectionLabel}>Recommended Actions</div>
                  <ul className={styles.execList}>
                    <li className={styles.execListItem}>
                      <span className={styles.execHighlight}>[High Priority]</span> Initiate office supply vendor consolidation
                      &mdash; estimated $185K annual savings, low effort
                    </li>
                    <li className={styles.execListItem}>
                      <span className={styles.execHighlight}>[High Priority]</span> Accelerate early payment discount program
                      expansion &mdash; $320K opportunity identified across eligible invoices
                    </li>
                    <li className={styles.execListItem}>
                      <span className={styles.execHighlight}>[Medium Priority]</span> Schedule IT service contract renegotiation
                      for Q2 &mdash; rates 18% above market median
                    </li>
                    <li className={styles.execListItem}>
                      <span className={styles.execHighlight}>[Medium Priority]</span> Begin qualification of backup suppliers for
                      8 single-source critical components
                    </li>
                  </ul>
                </div>

                {/* Footer */}
                <div className={styles.execMeta}>
                  <span>Generated: Jan 27, 2026, 08:00 AM</span>
                  <span>Model: Medius AI Analytics Engine v3.2</span>
                  <span>Data freshness: Real-time</span>
                </div>
              </div>
            )}

            {!summaryGenerated && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#4E5969' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.5 }}>&#x1F4CA;</div>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem', color: '#86909C' }}>
                  Click &quot;Generate Weekly Summary&quot; to create an AI-powered executive brief
                </div>
                <div style={{ fontSize: '0.75rem' }}>
                  Combines benchmarks, predictions, and prescriptive insights into a concise report
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
