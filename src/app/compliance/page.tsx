'use client';

import { useT } from '@/lib/i18n/locale-context';
import styles from './compliance.module.css';

/* ──────────────────────────────────────────────
   MOCK DATA — inline per project conventions
   ────────────────────────────────────────────── */

const stats = [
  { icon: '\uD83C\uDF0D', label: 'Countries Active', value: '14', change: '+2 this quarter' },
  { icon: '\uD83D\uDCDC', label: 'Mandates Tracked', value: '23', change: '+3 new regulations' },
  { icon: '\u26A0\uFE0F', label: 'Validation Errors', value: '89', change: '-12 vs last week' },
  { icon: '\u2705', label: 'Network Uptime', value: '99.97%', change: 'Last 30 days' },
];

const mandates = [
  {
    flag: '\uD83C\uDDE7\uD83C\uDDEA',
    country: 'Belgium',
    system: 'B2B E-Invoicing Mandate',
    deadline: 'Jan 2026',
    status: 'live' as const,
    statusLabel: 'LIVE',
    readiness: 100,
    color: '#23C343',
    requirements: ['Peppol BIS 3.0', 'UBL 2.1 Format', 'Mandatory B2B Exchange'],
  },
  {
    flag: '\uD83C\uDDF5\uD83C\uDDF1',
    country: 'Poland',
    system: 'KSeF (Krajowy System e-Faktur)',
    deadline: 'Feb 2026',
    status: 'ready' as const,
    statusLabel: 'READY',
    readiness: 95,
    color: '#23C343',
    requirements: ['KSeF XML Schema', 'Token Authentication', 'Real-time Reporting'],
  },
  {
    flag: '\uD83C\uDDEB\uD83C\uDDF7',
    country: 'France',
    system: 'PPF (Portail Public de Facturation)',
    deadline: 'Sep 2026',
    status: 'progress' as const,
    statusLabel: 'IN PROGRESS',
    readiness: 65,
    color: '#FF9A2E',
    requirements: ['Factur-X / CII Format', 'PPF Platform Registration', 'PDP Certification'],
  },
  {
    flag: '\uD83C\uDDE9\uD83C\uDDEA',
    country: 'Germany',
    system: 'XRechnung / Peppol',
    deadline: 'Jan 2027',
    status: 'planning' as const,
    statusLabel: 'PLANNING',
    readiness: 40,
    color: '#165DFF',
    requirements: ['XRechnung 3.0 Schema', 'Peppol Network Access', 'EN16931 Compliance'],
  },
  {
    flag: '\uD83C\uDDEA\uD83C\uDDFA',
    country: 'EU',
    system: 'ViDA (VAT in the Digital Age)',
    deadline: 'Jul 2030',
    status: 'monitoring' as const,
    statusLabel: 'MONITORING',
    readiness: 10,
    color: '#86909C',
    requirements: ['Digital Reporting Requirements', 'Cross-border E-Invoicing', 'Real-time VAT Reporting'],
  },
];

const validationResults = [
  { id: 'INV-2026-9847', format: 'UBL 2.1', country: '\uD83C\uDDE7\uD83C\uDDEA BE', checkType: 'Schema', result: 'pass' as const, details: 'All 47 schema rules passed', timestamp: '2026-01-30 14:32:01' },
  { id: 'INV-2026-9846', format: 'Peppol BIS 3.0', country: '\uD83C\uDDF3\uD83C\uDDF1 NL', checkType: 'Business Rules', result: 'pass' as const, details: 'EN16931 rules validated', timestamp: '2026-01-30 14:31:45' },
  { id: 'INV-2026-9845', format: 'Factur-X', country: '\uD83C\uDDEB\uD83C\uDDF7 FR', checkType: 'Format', result: 'warning' as const, details: 'PDF/A-3 embed - minor metadata issue', timestamp: '2026-01-30 14:31:22' },
  { id: 'INV-2026-9844', format: 'FatturaPA 1.2', country: '\uD83C\uDDEE\uD83C\uDDF9 IT', checkType: 'Schema', result: 'pass' as const, details: 'SDI validation successful', timestamp: '2026-01-30 14:30:58' },
  { id: 'INV-2026-9843', format: 'KSeF XML', country: '\uD83C\uDDF5\uD83C\uDDF1 PL', checkType: 'Signature', result: 'fail' as const, details: 'Token auth expired - renewal required', timestamp: '2026-01-30 14:30:33' },
  { id: 'INV-2026-9842', format: 'UBL 2.1', country: '\uD83C\uDDE7\uD83C\uDDEA BE', checkType: 'Business Rules', result: 'warning' as const, details: 'Optional field BT-29 recommended', timestamp: '2026-01-30 14:29:47' },
  { id: 'INV-2026-9841', format: 'Peppol BIS 3.0', country: '\uD83C\uDDE9\uD83C\uDDEA DE', checkType: 'Schema', result: 'pass' as const, details: 'XRechnung rules validated', timestamp: '2026-01-30 14:29:15' },
  { id: 'INV-2026-9840', format: 'Factur-X', country: '\uD83C\uDDEB\uD83C\uDDF7 FR', checkType: 'Format', result: 'pass' as const, details: 'CII cross-industry invoice OK', timestamp: '2026-01-30 14:28:44' },
  { id: 'INV-2026-9839', format: 'FatturaPA 1.2', country: '\uD83C\uDDEE\uD83C\uDDF9 IT', checkType: 'Signature', result: 'pass' as const, details: 'XAdES-BES signature valid', timestamp: '2026-01-30 14:28:02' },
  { id: 'INV-2026-9838', format: 'KSeF XML', country: '\uD83C\uDDF5\uD83C\uDDF1 PL', checkType: 'Business Rules', result: 'pass' as const, details: 'Polish fiscal rules passed', timestamp: '2026-01-30 14:27:31' },
  { id: 'INV-2026-9837', format: 'UBL 2.1', country: '\uD83C\uDDEA\uD83C\uDDF8 ES', checkType: 'Schema', result: 'pass' as const, details: 'SII schema validated', timestamp: '2026-01-30 14:26:55' },
  { id: 'INV-2026-9836', format: 'Peppol BIS 3.0', country: '\uD83C\uDDF3\uD83C\uDDF4 NO', checkType: 'Business Rules', result: 'pass' as const, details: 'EHF 3.0 rules passed', timestamp: '2026-01-30 14:26:12' },
  { id: 'INV-2026-9835', format: 'FatturaPA 1.2', country: '\uD83C\uDDEE\uD83C\uDDF9 IT', checkType: 'Format', result: 'fail' as const, details: 'Missing CodiceDestinatario field', timestamp: '2026-01-30 14:25:38' },
  { id: 'INV-2026-9834', format: 'KSeF XML', country: '\uD83C\uDDF5\uD83C\uDDF1 PL', checkType: 'Schema', result: 'pass' as const, details: 'FA(2) schema v2.0 validated', timestamp: '2026-01-30 14:25:01' },
  { id: 'INV-2026-9833', format: 'Factur-X', country: '\uD83C\uDDEB\uD83C\uDDF7 FR', checkType: 'Signature', result: 'pass' as const, details: 'PAdES signature embedded', timestamp: '2026-01-30 14:24:22' },
  { id: 'INV-2026-9832', format: 'UBL 2.1', country: '\uD83C\uDDE7\uD83C\uDDEA BE', checkType: 'Schema', result: 'pass' as const, details: 'Peppol BIS 3.0 conformant', timestamp: '2026-01-30 14:23:48' },
  { id: 'INV-2026-9831', format: 'Peppol BIS 3.0', country: '\uD83C\uDDEB\uD83C\uDDEE FI', checkType: 'Business Rules', result: 'warning' as const, details: 'Finvoice mapping advisory', timestamp: '2026-01-30 14:23:05' },
  { id: 'INV-2026-9830', format: 'FatturaPA 1.2', country: '\uD83C\uDDEE\uD83C\uDDF9 IT', checkType: 'Schema', result: 'pass' as const, details: 'Tipo documento TD01 valid', timestamp: '2026-01-30 14:22:29' },
  { id: 'INV-2026-9829', format: 'KSeF XML', country: '\uD83C\uDDF5\uD83C\uDDF1 PL', checkType: 'Format', result: 'fail' as const, details: 'Encoding error - UTF-8 BOM detected', timestamp: '2026-01-30 14:21:44' },
  { id: 'INV-2026-9828', format: 'UBL 2.1', country: '\uD83C\uDDE9\uD83C\uDDEA DE', checkType: 'Business Rules', result: 'pass' as const, details: 'Leitweg-ID format validated', timestamp: '2026-01-30 14:21:02' },
];

const networkStatus = [
  { name: 'Peppol', type: 'Access Point - Owned', status: 'connected' as const, statusLabel: 'Connected', messagesToday: 847, uptime: '99.99%', color: '#165DFF', icon: 'PEP' },
  { name: 'KSeF', type: 'Direct API', status: 'connected' as const, statusLabel: 'Connected', messagesToday: 342, uptime: '99.95%', color: '#8E51DA', icon: 'KSF' },
  { name: 'PPF', type: 'Sandbox', status: 'testing' as const, statusLabel: 'Testing', messagesToday: 12, uptime: 'N/A', color: '#FF9A2E', icon: 'PPF' },
  { name: 'SDI', type: 'Direct API', status: 'connected' as const, statusLabel: 'Connected', messagesToday: 892, uptime: '99.98%', color: '#23C343', icon: 'SDI' },
  { name: 'SII', type: 'Direct API', status: 'connected' as const, statusLabel: 'Connected', messagesToday: 567, uptime: '99.97%', color: '#F76560', icon: 'SII' },
  { name: 'Pagero', type: 'Partner - Long Tail', status: 'connected' as const, statusLabel: 'Connected', messagesToday: 234, uptime: '99.90%', color: '#14C9C9', icon: 'PAG' },
];

const formatMatrix = {
  formats: ['UBL 2.1', 'Peppol BIS 3.0', 'Factur-X / CII', 'FatturaPA 1.2', 'KSeF XML'],
  conversions: [
    // UBL -> others
    ['self', 'full', 'full', 'full', 'partial'],
    // Peppol BIS -> others
    ['full', 'self', 'full', 'full', 'partial'],
    // Factur-X -> others
    ['full', 'full', 'self', 'partial', 'partial'],
    // FatturaPA -> others
    ['full', 'full', 'partial', 'self', 'partial'],
    // KSeF -> others
    ['partial', 'partial', 'partial', 'partial', 'self'],
  ] as ('self' | 'full' | 'partial')[][],
};

const errorBreakdown = [
  { label: 'Schema Violations', count: 34, color: '#F76560' },
  { label: 'Missing Fields', count: 23, color: '#FF9A2E' },
  { label: 'Format Errors', count: 18, color: '#8E51DA' },
  { label: 'Business Rule Violations', count: 9, color: '#165DFF' },
  { label: 'Digital Signature Issues', count: 5, color: '#14C9C9' },
];

const maxErrorCount = 34;

const alerts = [
  { severity: 'critical' as const, title: 'KSeF Token Expired', description: 'Authentication token expired for Polish subsidiary PL-SUB-004. 12 invoices are blocked pending re-authentication.', time: '15 min ago', action: 'Renew Token' },
  { severity: 'critical' as const, title: 'SDI Rejection Spike', description: 'FatturaPA rejection rate increased to 4.2% (threshold: 2%). Missing CodiceDestinatario in 8 invoices.', time: '42 min ago', action: 'View Errors' },
  { severity: 'warning' as const, title: 'Belgium Schema Update', description: 'B2B mandate schema v3.2 update detected from Belgian authorities. Testing against current templates required before Feb 15.', time: '2 hours ago', action: 'Start Testing' },
  { severity: 'warning' as const, title: 'PPF Certificate Expiry', description: 'France PPF sandbox certificate expiring in 14 days. Production certificate must be renewed before Go-Live.', time: '5 hours ago', action: 'Renew Cert' },
  { severity: 'warning' as const, title: 'Peppol SMP Record', description: 'Service Metadata Publisher record for participant ID 0208:BE0123456789 needs refresh. Last updated 89 days ago.', time: '8 hours ago', action: 'Update SMP' },
  { severity: 'info' as const, title: 'Italy SDI Report Ready', description: 'Quarterly compliance report for SDI operations (Q4 2025) is ready for review and submission to Agenzia delle Entrate.', time: '1 day ago', action: 'View Report' },
  { severity: 'info' as const, title: 'Peppol Directory Update', description: 'New participant directory update available (v2026.01). Contains 847 new endpoints across 12 countries.', time: '2 days ago', action: 'Apply Update' },
  { severity: 'info' as const, title: 'ViDA Draft Published', description: 'EU Commission published updated ViDA directive draft. New timeline suggests phased rollout starting July 2030.', time: '3 days ago', action: 'Read Summary' },
];

const signatures = [
  { name: 'XAdES-BES (Peppol)', algorithm: 'RSA-SHA256', validDocs: 12847, expiry: 'Mar 2027', status: 'valid' as const },
  { name: 'CAdES-BES (KSeF)', algorithm: 'RSA-SHA256', validDocs: 3409, expiry: 'Jun 2026', status: 'renewal' as const },
  { name: 'PAdES (Factur-X)', algorithm: 'ECDSA-P256', validDocs: 1823, expiry: 'Nov 2027', status: 'valid' as const },
  { name: 'XAdES-T (SDI)', algorithm: 'RSA-SHA256', validDocs: 8932, expiry: 'Sep 2026', status: 'valid' as const },
  { name: 'XMLDSig (SII)', algorithm: 'RSA-SHA256', validDocs: 5617, expiry: 'Dec 2026', status: 'valid' as const },
];

/* ──────────────────────────────────────────────
   PAGE COMPONENT
   ────────────────────────────────────────────── */

export default function CompliancePage() {
  const t = useT();
  return (
    <div className={styles.page}>
      {/* ── Hero Header ── */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{t('compliance.title')}</h1>
            <p className={styles.heroSubtitle}>
              {t('compliance.subtitle')}
            </p>
          </div>
          <div className={styles.heroScore}>
            <div className={styles.heroScoreLabel}>OVERALL COMPLIANCE SCORE</div>
            <div className={styles.heroScoreRow}>
              <span className={styles.heroScoreValue}>97.3%</span>
              <span className={styles.heroScoreTrend}>
                <span className={styles.trendArrowUp}>{'\u2191'}</span>
                +1.2% vs last month
              </span>
            </div>
            <div className={styles.heroScoreBar}>
              <div className={styles.heroScoreBarFill} style={{ width: '97.3%' }} />
            </div>
            <div className={styles.heroScoreMeta}>
              Based on 12,341 compliant invoices across 14 jurisdictions
            </div>
          </div>
        </div>
      </header>

      {/* ── Stats Row ── */}
      <div className={styles.statsRow}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statChange}>{stat.change}</div>
          </div>
        ))}
      </div>

      {/* ── Regulatory Timeline ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            Regulatory Timeline
            <span className={styles.badge}>5 mandates</span>
          </div>
          <span className={styles.sectionAction}>View Full Calendar</span>
        </div>

        <div className={styles.timelineTrack}>
          <div className={styles.timelineLine} />
          {mandates.map((m, index) => (
            <div key={m.country} className={styles.timelineItem} style={{ zIndex: mandates.length - index }}>
              <div className={styles.timelineDot} style={{ borderColor: m.color, background: m.readiness === 100 ? m.color : '#ffffff' }} />
              <div className={styles.timelineCard}>
                <div className={styles.timelineCardHeader}>
                  <span className={styles.timelineFlag}>{m.flag}</span>
                  <div className={styles.timelineCardInfo}>
                    <span className={styles.timelineCountry}>{m.country}</span>
                    <span className={styles.timelineSystem}>{m.system}</span>
                  </div>
                  <span className={`${styles.timelineStatus} ${
                    m.status === 'live' ? styles.timelineStatusLive :
                    m.status === 'ready' ? styles.timelineStatusReady :
                    m.status === 'progress' ? styles.timelineStatusProgress :
                    m.status === 'planning' ? styles.timelineStatusPlanning :
                    styles.timelineStatusMonitoring
                  }`}>{m.statusLabel}</span>
                </div>
                <div className={styles.timelineDeadline}>Deadline: {m.deadline}</div>
                <div className={styles.timelineProgressOuter}>
                  <div className={styles.timelineProgressInner} style={{ width: `${m.readiness}%`, backgroundColor: m.color }} />
                </div>
                <div className={styles.timelineReadiness}>{m.readiness}% readiness</div>
                <div className={styles.timelineRequirements}>
                  {m.requirements.map((req) => (
                    <span key={req} className={styles.requirementTag}>{req}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Schema Validation Engine ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            {t('compliance.validationResults')}
            <span className={styles.badge}>20 recent</span>
          </div>
          <span className={styles.sectionAction}>Export Validation Log</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>{t('compliance.format')}</th>
                <th>{t('compliance.country')}</th>
                <th>Check Type</th>
                <th>Result</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {validationResults.map((v) => (
                <tr key={v.id}>
                  <td className={styles.monoCell}>{v.id}</td>
                  <td>{v.format}</td>
                  <td>{v.country}</td>
                  <td>
                    <span className={styles.checkTypeBadge}>{v.checkType}</span>
                  </td>
                  <td>
                    <span className={`${styles.resultBadge} ${
                      v.result === 'pass' ? styles.resultPass :
                      v.result === 'fail' ? styles.resultFail :
                      styles.resultWarning
                    }`}>
                      {v.result === 'pass' ? t('compliance.passed') : v.result === 'fail' ? t('compliance.failed') : t('compliance.warnings')}
                    </span>
                  </td>
                  <td className={styles.detailsCell}>{v.details}</td>
                  <td className={styles.timestampCell}>{v.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── E-Invoice Network Status ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            {t('compliance.networkStatus')}
            <span className={styles.badge}>6 networks</span>
          </div>
          <span className={styles.sectionAction}>Network Dashboard</span>
        </div>

        <div className={styles.networkGrid}>
          {networkStatus.map((net) => (
            <div key={net.name} className={styles.networkCard}>
              <div className={styles.networkCardHeader}>
                <div className={styles.networkIconBox} style={{ backgroundColor: `${net.color}20`, borderColor: `${net.color}40` }}>
                  <span style={{ color: net.color, fontWeight: 700, fontSize: '0.75rem' }}>{net.icon}</span>
                </div>
                <div className={styles.networkCardInfo}>
                  <span className={styles.networkCardName}>{net.name}</span>
                  <span className={styles.networkCardType}>{net.type}</span>
                </div>
                <span className={`${styles.networkStatusDot} ${
                  net.status === 'connected' ? styles.networkStatusConnected :
                  styles.networkStatusTesting
                }`} />
              </div>
              <div className={styles.networkCardStats}>
                <div className={styles.networkStat}>
                  <span className={styles.networkStatLabel}>{t('compliance.status')}</span>
                  <span className={`${styles.networkStatValue} ${
                    net.status === 'connected' ? styles.networkStatConnected : styles.networkStatTesting
                  }`}>{net.statusLabel}</span>
                </div>
                <div className={styles.networkStat}>
                  <span className={styles.networkStatLabel}>Messages Today</span>
                  <span className={styles.networkStatValue}>
                    {net.messagesToday.toLocaleString()}{net.status === 'testing' ? ' (test)' : ''}
                  </span>
                </div>
                <div className={styles.networkStat}>
                  <span className={styles.networkStatLabel}>Uptime</span>
                  <span className={styles.networkStatValue}>{net.uptime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Format Transformation Matrix + Error Breakdown ── */}
      <div className={styles.dualGrid}>
        {/* Format Transformation */}
        <section className={styles.section} style={{ marginBottom: 0 }}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              Format Transformation
              <span className={styles.badge}>5 formats</span>
            </div>
          </div>

          <div className={styles.matrixWrapper}>
            <table className={styles.matrixTable}>
              <thead>
                <tr>
                  <th className={styles.matrixCorner}>From / To</th>
                  {formatMatrix.formats.map((f) => (
                    <th key={f} className={styles.matrixHeader}>{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formatMatrix.formats.map((fromFormat, rowIdx) => (
                  <tr key={fromFormat}>
                    <td className={styles.matrixRowLabel}>{fromFormat}</td>
                    {formatMatrix.conversions[rowIdx].map((val, colIdx) => (
                      <td key={colIdx} className={styles.matrixCell}>
                        {val === 'self' ? (
                          <span className={styles.matrixSelf}>{'\u2014'}</span>
                        ) : val === 'full' ? (
                          <span className={styles.matrixFull}>{'\u2713'}</span>
                        ) : (
                          <span className={styles.matrixPartial}>{'\u25D0'}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.matrixLegend}>
              <span className={styles.legendItem}>
                <span className={styles.matrixFull}>{'\u2713'}</span> Full Support
              </span>
              <span className={styles.legendItem}>
                <span className={styles.matrixPartial}>{'\u25D0'}</span> Partial Support
              </span>
              <span className={styles.legendItem}>
                <span className={styles.matrixSelf}>{'\u2014'}</span> Same Format
              </span>
            </div>
          </div>
        </section>

        {/* Error Breakdown */}
        <section className={styles.section} style={{ marginBottom: 0 }}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              Error Breakdown
              <span className={styles.badge}>89 total</span>
            </div>
          </div>

          <div className={styles.errorList}>
            {errorBreakdown.map((err) => (
              <div key={err.label} className={styles.errorItem}>
                <div className={styles.errorItemHeader}>
                  <span className={styles.errorItemLabel}>{err.label}</span>
                  <span className={styles.errorItemCount} style={{ color: err.color }}>{err.count}</span>
                </div>
                <div className={styles.errorBarTrack}>
                  <div
                    className={styles.errorBarFill}
                    style={{
                      width: `${(err.count / maxErrorCount) * 100}%`,
                      backgroundColor: err.color,
                    }}
                  />
                </div>
                <div className={styles.errorItemPercent}>
                  {((err.count / 89) * 100).toFixed(1)}% of total
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Compliance Alerts ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            Compliance Alerts
            <span className={styles.badgeCritical}>2 critical</span>
            <span className={styles.badgeWarning}>3 warnings</span>
            <span className={styles.badge}>3 info</span>
          </div>
          <span className={styles.sectionAction}>View All Alerts</span>
        </div>

        <div className={styles.alertGrid}>
          {alerts.map((alert, i) => (
            <div key={i} className={`${styles.alertCard} ${
              alert.severity === 'critical' ? styles.alertCardCritical :
              alert.severity === 'warning' ? styles.alertCardWarning :
              styles.alertCardInfo
            }`}>
              <div className={styles.alertCardTop}>
                <span className={`${styles.alertSeverity} ${
                  alert.severity === 'critical' ? styles.severityCritical :
                  alert.severity === 'warning' ? styles.severityWarning :
                  styles.severityInfo
                }`}>{alert.severity.toUpperCase()}</span>
                <span className={styles.alertTime}>{alert.time}</span>
              </div>
              <div className={styles.alertCardTitle}>{alert.title}</div>
              <div className={styles.alertCardDesc}>{alert.description}</div>
              <button className={`${styles.alertActionBtn} ${
                alert.severity === 'critical' ? styles.alertActionCritical :
                alert.severity === 'warning' ? styles.alertActionWarning :
                styles.alertActionInfo
              }`}>{alert.action}</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Digital Signature Status ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            Digital Signature Status
            <span className={styles.badge}>5 certificates</span>
          </div>
          <span className={styles.sectionAction}>Manage Certificates</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Certificate Name</th>
                <th>Algorithm</th>
                <th>Valid Documents</th>
                <th>{t('compliance.deadline')}</th>
                <th>{t('compliance.status')}</th>
              </tr>
            </thead>
            <tbody>
              {signatures.map((sig) => (
                <tr key={sig.name}>
                  <td className={styles.certName}>{sig.name}</td>
                  <td className={styles.monoCell}>{sig.algorithm}</td>
                  <td>{sig.validDocs.toLocaleString()}</td>
                  <td>{sig.expiry}</td>
                  <td>
                    <span className={`${styles.resultBadge} ${
                      sig.status === 'valid' ? styles.resultPass : styles.resultWarning
                    }`}>
                      {sig.status === 'valid' ? 'VALID' : 'RENEWAL NEEDED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
