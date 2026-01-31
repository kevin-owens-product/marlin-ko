'use client';

import React from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './risk-dashboard.module.css';

/* =================================================================
   PRD-007 — Fire Station Risk Dashboard
   Fraud & Risk Detection  |  Next.js 16 + React 19 + CSS Modules
   ================================================================= */

// ─── Mock Data ──────────────────────────────────────────────────

const riskScore = {
  value: 82,
  max: 100,
  label: 'Low Risk',
  color: '#23C343',
  trend: '+3 pts from last month',
};

const kpis = [
  {
    label: 'Fraud Prevented MTD',
    value: '$234K',
    sub: 'Across 12 blocked transactions',
    trend: '+18% vs last month',
    trendColor: '#23C343',
  },
  {
    label: 'Active Alerts',
    value: '7',
    sub: '3 critical, 4 high severity',
    trend: '-2 from yesterday',
    trendColor: '#23C343',
  },
  {
    label: 'False Positive Rate',
    value: '1.8%',
    sub: 'Industry avg: 4.2%',
    trend: '-0.3% this quarter',
    trendColor: '#23C343',
  },
  {
    label: 'Avg Detection Time',
    value: '< 3 sec',
    sub: 'AI-powered real-time scan',
    trend: 'Within SLA target',
    trendColor: '#165DFF',
  },
];

const activeThreats = [
  {
    id: 'ALT-2401',
    severity: 'Critical' as const,
    type: 'Duplicate Invoice',
    ref: 'INV-88412 / INV-88397',
    desc: 'Exact amount match ($47,250) from Apex Manufacturing — submitted 3 days apart to different approvers.',
    score: 96,
  },
  {
    id: 'ALT-2402',
    severity: 'Critical' as const,
    type: 'Bank Account Change',
    ref: 'Vendor: GlobalTech Solutions',
    desc: 'Bank account changed to high-risk jurisdiction (offshore). No prior payment history at new institution.',
    score: 93,
  },
  {
    id: 'ALT-2403',
    severity: 'High' as const,
    type: 'Amount Anomaly',
    ref: 'INV-90215 — Bright Services Ltd',
    desc: 'Invoice amount $189,400 is 4.7x the historical average ($40,200). Exceeds 3-sigma threshold.',
    score: 87,
  },
  {
    id: 'ALT-2404',
    severity: 'High' as const,
    type: 'Suspicious Pattern',
    ref: 'Vendor: QuickParts Inc.',
    desc: 'Round-dollar invoices ($50,000 x 3) submitted within 24 hours. Velocity anomaly detected.',
    score: 81,
  },
  {
    id: 'ALT-2405',
    severity: 'High' as const,
    type: 'New Vendor Risk',
    ref: 'Vendor: NovaBridge Consulting',
    desc: 'First invoice from unverified vendor with no trade references. PO created same day as invoice.',
    score: 74,
  },
];

const duplicates = [
  {
    id: 'DUP-001',
    confidence: 97,
    matchedFields: ['Amount', 'Vendor', 'Date'],
    invoiceA: { id: 'INV-88412', vendor: 'Apex Manufacturing', amount: '$47,250.00', date: '2025-01-15', lineItems: '15 units @ $3,150' },
    invoiceB: { id: 'INV-88397', vendor: 'Apex Manufacturing', amount: '$47,250.00', date: '2025-01-12', lineItems: '15 units @ $3,150' },
  },
  {
    id: 'DUP-002',
    confidence: 91,
    matchedFields: ['Amount', 'Invoice#'],
    invoiceA: { id: 'INV-77201', vendor: 'Sterling Supplies', amount: '$12,800.00', date: '2025-01-18', lineItems: 'Bulk office supplies' },
    invoiceB: { id: 'INV-77201-R', vendor: 'Sterling Supplies Co', amount: '$12,800.00', date: '2025-01-20', lineItems: 'Office supplies resubmit' },
  },
  {
    id: 'DUP-003',
    confidence: 85,
    matchedFields: ['Vendor', 'Date', 'Amount'],
    invoiceA: { id: 'INV-66340', vendor: 'Pacific Freight Co.', amount: '$8,950.00', date: '2025-01-10', lineItems: 'Freight — LA to Seattle' },
    invoiceB: { id: 'INV-66355', vendor: 'Pacific Freight Co.', amount: '$8,950.00', date: '2025-01-10', lineItems: 'Freight charges Jan shipment' },
  },
  {
    id: 'DUP-004',
    confidence: 78,
    matchedFields: ['Amount', 'Vendor'],
    invoiceA: { id: 'INV-55012', vendor: 'TechVault Inc.', amount: '$23,100.00', date: '2025-01-08', lineItems: 'Server maintenance Q1' },
    invoiceB: { id: 'INV-55098', vendor: 'TechVault Inc.', amount: '$23,100.00', date: '2025-01-22', lineItems: 'Q1 server maintenance' },
  },
  {
    id: 'DUP-005',
    confidence: 72,
    matchedFields: ['Vendor', 'Date'],
    invoiceA: { id: 'INV-44128', vendor: 'Meridian Logistics', amount: '$6,475.00', date: '2025-01-14', lineItems: 'Warehouse storage Jan' },
    invoiceB: { id: 'INV-44190', vendor: 'Meridian Logistics LLC', amount: '$6,510.00', date: '2025-01-14', lineItems: 'Jan warehouse fee' },
  },
];

const bankChanges = [
  { supplier: 'GlobalTech Solutions', oldBank: 'Chase (US) ****4821', newBank: 'First Carib (KY) ****7733', status: 'Failed' as const, riskScore: 93 },
  { supplier: 'Apex Manufacturing', oldBank: 'BofA (US) ****3310', newBank: 'Wells Fargo (US) ****9182', status: 'Verified' as const, riskScore: 12 },
  { supplier: 'NovaBridge Consulting', oldBank: 'N/A — New Vendor', newBank: 'Metro Bank (UK) ****5501', status: 'Pending' as const, riskScore: 68 },
  { supplier: 'Bright Services Ltd', oldBank: 'Barclays (UK) ****2209', newBank: 'Revolut Bus (LT) ****8844', status: 'Pending' as const, riskScore: 71 },
];

const sanctionsResults = [
  { name: 'GlobalTech Solutions Ltd', matchType: 'Name similarity', matchScore: 34, status: 'Cleared' as const },
  { name: 'NovaBridge Consulting', matchType: 'Address match', matchScore: 67, status: 'Investigating' as const },
  { name: 'QuickParts Inc.', matchType: 'Director name', matchScore: 52, status: 'Investigating' as const },
];

const amountAnomalies = [
  { vendor: 'Bright Services Ltd', amount: '$189,400', avgAmount: '$40,200', deviation: 371, benford: true },
  { vendor: 'QuickParts Inc.', amount: '$50,000', avgAmount: '$12,800', deviation: 290, benford: true },
  { vendor: 'NovaBridge Consulting', amount: '$74,500', avgAmount: '$0', deviation: 999, benford: false },
  { vendor: 'Sterling Supplies', amount: '$12,800', avgAmount: '$5,100', deviation: 151, benford: false },
  { vendor: 'Apex Manufacturing', amount: '$47,250', avgAmount: '$31,500', deviation: 50, benford: false },
];

const timingAnomalies = [
  { desc: 'Invoice INV-90215 submitted at 2:47 AM local time — outside normal business hours for Bright Services Ltd.' },
  { desc: 'Three invoices from QuickParts Inc. all timestamped within 4 minutes. Sequential invoice numbers suggest batch generation.' },
  { desc: 'NovaBridge Consulting invoice dated before the purchase order creation date (PO lag: -2 days).' },
];

const velocityAlerts = [
  { desc: 'QuickParts Inc.: 3 invoices totaling $150,000 submitted within 24 hours. Normal frequency: 1 invoice per week.' },
  { desc: 'Meridian Logistics: 5 invoices in the last 7 days vs. historical average of 2 per month.' },
];

const heatmapCategories = [
  'Duplicate',
  'Bank Fraud',
  'Amount Anomaly',
  'Timing',
  'Velocity',
  'Doc Authenticity',
];

const heatmapData: Record<string, [number, number, number, number]> = {
  'Duplicate':        [1, 2, 5, 8],
  'Bank Fraud':       [2, 1, 3, 2],
  'Amount Anomaly':   [0, 3, 6, 4],
  'Timing':           [0, 1, 4, 7],
  'Velocity':         [1, 1, 2, 3],
  'Doc Authenticity': [0, 0, 3, 5],
};

const investigations = [
  { id: 'INV-C-001', type: 'Duplicate Invoice', entity: 'Apex Manufacturing', assignedTo: 'Sarah Chen', priority: 'Critical' as const, status: 'In Progress' as const, daysOpen: 1 },
  { id: 'INV-C-002', type: 'Bank Fraud', entity: 'GlobalTech Solutions', assignedTo: 'Marcus Webb', priority: 'Critical' as const, status: 'Escalated' as const, daysOpen: 2 },
  { id: 'INV-C-003', type: 'Amount Anomaly', entity: 'Bright Services Ltd', assignedTo: 'Sarah Chen', priority: 'High' as const, status: 'Open' as const, daysOpen: 1 },
  { id: 'INV-C-004', type: 'Suspicious Pattern', entity: 'QuickParts Inc.', assignedTo: 'James Liu', priority: 'High' as const, status: 'In Progress' as const, daysOpen: 3 },
  { id: 'INV-C-005', type: 'New Vendor Risk', entity: 'NovaBridge Consulting', assignedTo: 'Marcus Webb', priority: 'High' as const, status: 'Open' as const, daysOpen: 1 },
  { id: 'INV-C-006', type: 'Duplicate Invoice', entity: 'Sterling Supplies', assignedTo: 'Emma Rossi', priority: 'Medium' as const, status: 'In Progress' as const, daysOpen: 4 },
  { id: 'INV-C-007', type: 'Bank Fraud', entity: 'NovaBridge Consulting', assignedTo: 'James Liu', priority: 'Medium' as const, status: 'Open' as const, daysOpen: 2 },
  { id: 'INV-C-008', type: 'Velocity Alert', entity: 'Meridian Logistics', assignedTo: 'Emma Rossi', priority: 'Medium' as const, status: 'Open' as const, daysOpen: 5 },
  { id: 'INV-C-009', type: 'Amount Anomaly', entity: 'TechVault Inc.', assignedTo: 'Sarah Chen', priority: 'Low' as const, status: 'In Progress' as const, daysOpen: 7 },
  { id: 'INV-C-010', type: 'Timing Anomaly', entity: 'Pacific Freight Co.', assignedTo: 'James Liu', priority: 'Low' as const, status: 'Open' as const, daysOpen: 3 },
];

const monthlyTrends = [
  { month: 'Aug', totalAlerts: 42, confirmedFraud: 5, falsePositives: 8, amountPrevented: 87 },
  { month: 'Sep', totalAlerts: 56, confirmedFraud: 7, falsePositives: 10, amountPrevented: 124 },
  { month: 'Oct', totalAlerts: 49, confirmedFraud: 4, falsePositives: 6, amountPrevented: 96 },
  { month: 'Nov', totalAlerts: 61, confirmedFraud: 8, falsePositives: 9, amountPrevented: 178 },
  { month: 'Dec', totalAlerts: 38, confirmedFraud: 3, falsePositives: 5, amountPrevented: 67 },
  { month: 'Jan', totalAlerts: 52, confirmedFraud: 6, falsePositives: 7, amountPrevented: 234 },
];

// ─── Helpers ────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return '#F76560';
  if (score >= 60) return '#FF9A2E';
  if (score >= 40) return '#165DFF';
  return '#23C343';
}

function confidenceColor(pct: number): string {
  if (pct >= 90) return '#F76560';
  if (pct >= 80) return '#FF9A2E';
  return '#165DFF';
}

function heatCellStyle(val: number, colIndex: number): string {
  if (val === 0) return styles.heatEmpty;
  switch (colIndex) {
    case 0: return styles.heatCritical;
    case 1: return styles.heatHigh;
    case 2: return styles.heatMedium;
    case 3: return styles.heatLow;
    default: return styles.heatEmpty;
  }
}

function priorityClass(p: string): string {
  switch (p) {
    case 'Critical': return styles.priorityCritical;
    case 'High': return styles.priorityHigh;
    case 'Medium': return styles.priorityMedium;
    case 'Low': return styles.priorityLow;
    default: return '';
  }
}

function statusClass(s: string): string {
  switch (s) {
    case 'Open': return styles.statusOpen;
    case 'In Progress': return styles.statusInProgress;
    case 'Escalated': return styles.statusEscalated;
    default: return styles.statusBadge;
  }
}

// ─── Component ──────────────────────────────────────────────────

export default function RiskDashboardPage() {
  const t = useT();
  /* risk ring arc calculation */
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const arcPct = riskScore.value / riskScore.max;
  const dashOffset = circumference * (1 - arcPct);

  /* monthly trends normalisation */
  const maxAlerts = Math.max(...monthlyTrends.map((m) => m.totalAlerts));
  const maxPrevented = Math.max(...monthlyTrends.map((m) => m.amountPrevented));

  return (
    <div className={styles.page}>
      {/* ── Header ─────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.fireIcon} role="img" aria-label="fire station">
            🚒
          </span>
          <div>
            <h1 className={styles.title}>{t('riskDashboard.title')}</h1>
            <p className={styles.subtitle}>
              {t('riskDashboard.subtitle')}
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            Live Monitoring
          </span>
          <button className={styles.refreshBtn}>Refresh Data</button>
        </div>
      </header>

      {/* ── Top Row: Risk Score + KPIs ─────────────────────── */}
      <div className={styles.topRow}>
        {/* score ring */}
        <div className={styles.scoreCard}>
          <div className={styles.scoreRing}>
            <svg className={styles.scoreRingSvg} viewBox="0 0 180 180">
              <circle className={styles.scoreTrack} cx="90" cy="90" r={radius} />
              <circle
                className={styles.scoreArc}
                cx="90"
                cy="90"
                r={radius}
                stroke={riskScore.color}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className={styles.scoreCenter}>
              <span className={styles.scoreValue} style={{ color: riskScore.color }}>
                {riskScore.value}
              </span>
              <span className={styles.scoreMax}>/ {riskScore.max}</span>
            </div>
          </div>
          <span className={styles.scoreLabel} style={{ color: riskScore.color }}>
            {riskScore.label}
          </span>
          <span className={`${styles.scoreTrend} ${styles.trendUp}`}>{riskScore.trend}</span>
        </div>

        {/* KPI cards */}
        <div className={styles.kpiGrid}>
          {kpis.map((k) => (
            <div className={styles.kpiCard} key={k.label}>
              <span className={styles.kpiLabel}>{k.label}</span>
              <span className={styles.kpiValue}>{k.value}</span>
              <span className={styles.kpiSub}>{k.sub}</span>
              <span className={styles.kpiTrend} style={{ color: k.trendColor }}>
                {k.trend}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Threats (red-bordered) ──────────────────── */}
      <section className={styles.sectionCritical}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>&#9888;</span>
          Active Threats
          <span className={`${styles.sectionBadge} ${styles.badgeRed}`}>
            {activeThreats.length} Active
          </span>
        </h2>
        <div className={styles.threatList}>
          {activeThreats.map((t) => (
            <div className={styles.threatCard} key={t.id}>
              <span
                className={
                  t.severity === 'Critical' ? styles.severityCritical : styles.severityHigh
                }
              >
                {t.severity}
              </span>
              <div className={styles.threatInfo}>
                <span className={styles.threatType}>{t.type}</span>
                <span className={styles.threatRef}>{t.ref}</span>
                <span className={styles.threatDesc}>{t.desc}</span>
              </div>
              <div className={styles.threatScore}>
                <div className={styles.threatScoreVal} style={{ color: scoreColor(t.score) }}>
                  {t.score}
                </div>
                <div className={styles.threatScoreLabel}>AI Risk</div>
              </div>
              <div className={styles.threatActions}>
                <button className={styles.btnInvestigate}>Investigate</button>
                <button className={styles.btnApprove}>Approve</button>
                <button className={styles.btnBlock}>Block</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Duplicate Detection ─────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>&#128203;</span>
          Duplicate Detection
          <span className={`${styles.sectionBadge} ${styles.badgeAmber}`}>
            {duplicates.length} Potential
          </span>
        </h2>
        <div className={styles.dupList}>
          {duplicates.map((d) => (
            <div className={styles.dupCard} key={d.id}>
              <div className={styles.dupHeader}>
                <span
                  className={styles.dupConfidence}
                  style={{ color: confidenceColor(d.confidence) }}
                >
                  {d.confidence}% Match Confidence
                </span>
                <div className={styles.dupMatchedFields}>
                  {d.matchedFields.map((f) => (
                    <span className={styles.dupField} key={f}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.dupComparison}>
                <div className={styles.dupInvoice}>
                  <div className={styles.dupInvoiceLabel}>Invoice A</div>
                  <div className={styles.dupInvoiceId}>{d.invoiceA.id}</div>
                  <div className={styles.dupInvoiceDetail}>
                    {d.invoiceA.vendor}
                    <br />
                    {d.invoiceA.amount} &middot; {d.invoiceA.date}
                    <br />
                    {d.invoiceA.lineItems}
                  </div>
                </div>
                <div className={styles.dupVs}>VS</div>
                <div className={styles.dupInvoice}>
                  <div className={styles.dupInvoiceLabel}>Invoice B</div>
                  <div className={styles.dupInvoiceId}>{d.invoiceB.id}</div>
                  <div className={styles.dupInvoiceDetail}>
                    {d.invoiceB.vendor}
                    <br />
                    {d.invoiceB.amount} &middot; {d.invoiceB.date}
                    <br />
                    {d.invoiceB.lineItems}
                  </div>
                </div>
              </div>
              <div className={styles.dupActions}>
                <button className={styles.btnConfirmDup}>Confirm Duplicate</button>
                <button className={styles.btnNotDup}>Not a Duplicate</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bank Account Verification ──────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>&#127974;</span>
          Bank Account Verification
        </h2>

        {/* Bank change requests */}
        <div className={styles.bankSubSection}>
          <h3 className={styles.subTitle}>Recent Bank Change Requests</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Old Bank</th>
                <th>New Bank</th>
                <th>Verification</th>
                <th>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {bankChanges.map((b, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{b.supplier}</td>
                  <td>{b.oldBank}</td>
                  <td>{b.newBank}</td>
                  <td>
                    <span
                      className={
                        b.status === 'Verified'
                          ? styles.statusVerified
                          : b.status === 'Pending'
                          ? styles.statusPending
                          : styles.statusFailed
                      }
                    >
                      {b.status}
                    </span>
                  </td>
                  <td style={{ color: scoreColor(b.riskScore), fontWeight: 700 }}>
                    {b.riskScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sanctions screening */}
        <div className={styles.bankSubSection}>
          <h3 className={styles.subTitle}>Sanctions Screening Results</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Match Type</th>
                <th>Match Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sanctionsResults.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.matchType}</td>
                  <td style={{ color: scoreColor(s.matchScore), fontWeight: 600 }}>
                    {s.matchScore}%
                  </td>
                  <td>
                    <span
                      className={
                        s.status === 'Cleared' ? styles.statusCleared : styles.statusInvestigating
                      }
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Anomaly Detection ──────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>&#128200;</span>
          Anomaly Detection
          <span className={`${styles.sectionBadge} ${styles.badgePurple}`}>AI-Powered</span>
        </h2>

        <div className={styles.anomalyGrid}>
          {/* Amount anomalies */}
          <div className={styles.anomalySubFull}>
            <div className={styles.anomalySubTitle}>
              <span>&#128176;</span> Amount Anomalies
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Invoice Amount</th>
                  <th>Historical Avg</th>
                  <th>Deviation</th>
                  <th>Benford&apos;s Law</th>
                </tr>
              </thead>
              <tbody>
                {amountAnomalies.map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{a.vendor}</td>
                    <td>{a.amount}</td>
                    <td style={{ color: '#86909C' }}>{a.avgAmount}</td>
                    <td style={{ color: a.deviation > 200 ? '#F76560' : a.deviation > 100 ? '#FF9A2E' : '#165DFF', fontWeight: 600 }}>
                      +{a.deviation}%
                    </td>
                    <td>
                      {a.benford ? (
                        <span className={styles.benfordFlag}>FLAGGED</span>
                      ) : (
                        <span style={{ color: '#23C343', fontSize: 12, fontWeight: 500 }}>Pass</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Timing anomalies */}
          <div className={styles.anomalySubSection}>
            <div className={styles.anomalySubTitle}>
              <span>&#9200;</span> Timing Anomalies
            </div>
            {timingAnomalies.map((t, i) => (
              <div className={styles.anomalyItem} key={i}>
                <span className={styles.anomalyDot} style={{ background: '#FF9A2E' }} />
                <span className={styles.anomalyInfo}>
                  <span className={styles.anomalyDetail}>{t.desc}</span>
                </span>
              </div>
            ))}
          </div>

          {/* Velocity alerts */}
          <div className={styles.anomalySubSection}>
            <div className={styles.anomalySubTitle}>
              <span>&#9889;</span> Velocity Alerts
            </div>
            {velocityAlerts.map((v, i) => (
              <div className={styles.anomalyItem} key={i}>
                <span className={styles.anomalyDot} style={{ background: '#F76560' }} />
                <span className={styles.anomalyInfo}>
                  <span className={styles.anomalyDetail}>{v.desc}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Risk Heatmap ───────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>&#127777;</span>
          Risk Heatmap
        </h2>
        <div className={styles.heatmapGrid}>
          {/* header row */}
          <div className={styles.heatmapHeader} />
          <div className={styles.heatmapHeader} style={{ color: '#F76560' }}>
            {t('riskDashboard.critical')}
          </div>
          <div className={styles.heatmapHeader} style={{ color: '#FF9A2E' }}>
            {t('riskDashboard.high')}
          </div>
          <div className={styles.heatmapHeader} style={{ color: '#165DFF' }}>
            {t('riskDashboard.medium')}
          </div>
          <div className={styles.heatmapHeader} style={{ color: '#23C343' }}>
            {t('riskDashboard.low')}
          </div>

          {/* data rows */}
          {heatmapCategories.map((cat) => (
            <React.Fragment key={cat}>
              <div className={styles.heatmapRowLabel}>{cat}</div>
              {heatmapData[cat].map((val, ci) => (
                <div className={heatCellStyle(val, ci)} key={ci}>
                  {val > 0 ? val : '\u2014'}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── Investigation Queue ─────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>&#128269;</span>
          Investigation Queue
          <span className={`${styles.sectionBadge} ${styles.badgeBlue}`}>
            {investigations.length} Open
          </span>
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.investigationTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('riskDashboard.alertType')}</th>
                <th>Entity</th>
                <th>Assigned To</th>
                <th>{t('riskDashboard.severity')}</th>
                <th>{t('riskDashboard.status')}</th>
                <th>Days Open</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {investigations.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600, color: '#165DFF' }}>{inv.id}</td>
                  <td>{inv.type}</td>
                  <td style={{ fontWeight: 600 }}>{inv.entity}</td>
                  <td>{inv.assignedTo}</td>
                  <td>
                    <span className={priorityClass(inv.priority)}>{inv.priority}</span>
                  </td>
                  <td>
                    <span className={statusClass(inv.status)}>{inv.status}</span>
                  </td>
                  <td
                    style={{
                      color: inv.daysOpen > 5 ? '#F76560' : inv.daysOpen > 3 ? '#FF9A2E' : '#E5E6EB',
                      fontWeight: inv.daysOpen > 3 ? 600 : 400,
                    }}
                  >
                    {inv.daysOpen}d
                  </td>
                  <td>
                    <button className={styles.btnViewCase}>View Case</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Monthly Trends (CSS bar chart) ─────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>&#128202;</span>
          Monthly Trends &mdash; Last 6 Months
        </h2>

        <div className={styles.trendsGrid}>
          {monthlyTrends.map((m) => (
            <div className={styles.trendMonth} key={m.month}>
              <div className={styles.trendLabel}>{m.month}</div>
              <div className={styles.trendBars}>
                {/* total alerts */}
                <div className={styles.trendBarWrap}>
                  <div className={styles.trendBarTrack}>
                    <div
                      className={styles.trendBar}
                      style={{
                        width: `${(m.totalAlerts / maxAlerts) * 100}%`,
                        background: '#165DFF',
                      }}
                    />
                  </div>
                  <span className={styles.trendBarValue}>{m.totalAlerts}</span>
                </div>
                {/* confirmed fraud */}
                <div className={styles.trendBarWrap}>
                  <div className={styles.trendBarTrack}>
                    <div
                      className={styles.trendBar}
                      style={{
                        width: `${(m.confirmedFraud / maxAlerts) * 100}%`,
                        background: '#F76560',
                      }}
                    />
                  </div>
                  <span className={styles.trendBarValue}>{m.confirmedFraud}</span>
                </div>
                {/* false positives */}
                <div className={styles.trendBarWrap}>
                  <div className={styles.trendBarTrack}>
                    <div
                      className={styles.trendBar}
                      style={{
                        width: `${(m.falsePositives / maxAlerts) * 100}%`,
                        background: '#FF9A2E',
                      }}
                    />
                  </div>
                  <span className={styles.trendBarValue}>{m.falsePositives}</span>
                </div>
                {/* amount prevented */}
                <div className={styles.trendBarWrap}>
                  <div className={styles.trendBarTrack}>
                    <div
                      className={styles.trendBar}
                      style={{
                        width: `${(m.amountPrevented / maxPrevented) * 100}%`,
                        background: '#23C343',
                      }}
                    />
                  </div>
                  <span className={styles.trendBarValue}>${m.amountPrevented}K</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.trendsLegend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#165DFF' }} />
            Total Alerts
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#F76560' }} />
            Confirmed Fraud
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#FF9A2E' }} />
            False Positives
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#23C343' }} />
            Amount Prevented
          </span>
        </div>
      </section>
    </div>
  );
}
