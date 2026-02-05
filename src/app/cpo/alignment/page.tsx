'use client';

import Link from 'next/link';
import styles from './alignment.module.css';

const alignKpis = [
  { value: '14', label: 'Key Stakeholders' },
  { value: '92', suffix: '%', label: 'Attendance Rate' },
  { value: '18', label: 'Decisions Made' },
  { value: '82', suffix: '/100', label: 'Alignment Score' },
];

const stakeholders = [
  { initials: 'SL', name: 'Sarah Lindström', role: 'CPO', dept: 'Product', color: '#165DFF', rag: 'green', status: 'Champion', influence: 'Very High' },
  { initials: 'MK', name: 'Marcus Karlsson', role: 'CTO', dept: 'Engineering', color: '#8E51DA', rag: 'green', status: 'Champion', influence: 'Very High' },
  { initials: 'AJ', name: 'Anna Jensen', role: 'CFO', dept: 'Finance', color: '#14C9C9', rag: 'green', status: 'Supportive', influence: 'Very High' },
  { initials: 'EB', name: 'Erik Bergström', role: 'VP Engineering', dept: 'Engineering', color: '#8E51DA', rag: 'green', status: 'Champion', influence: 'High' },
  { initials: 'KN', name: 'Karin Norberg', role: 'VP Sales', dept: 'Sales', color: '#FF9A2E', rag: 'amber', status: 'Cautious', influence: 'High' },
  { initials: 'PN', name: 'Per Nilsson', role: 'VP Customer Success', dept: 'CS', color: '#23C343', rag: 'green', status: 'Supportive', influence: 'High' },
  { initials: 'LH', name: 'Lisa Holm', role: 'Head of Design', dept: 'Product', color: '#165DFF', rag: 'green', status: 'Champion', influence: 'Medium' },
  { initials: 'OS', name: 'Oscar Svensson', role: 'Head of AI', dept: 'Engineering', color: '#8E51DA', rag: 'green', status: 'Champion', influence: 'High' },
  { initials: 'HW', name: 'Helena Wallin', role: 'Head of Compliance', dept: 'Legal', color: '#F76560', rag: 'amber', status: 'Cautious', influence: 'Medium' },
  { initials: 'JA', name: 'Johan Andersson', role: 'Head of Partnerships', dept: 'Business Dev', color: '#FF9A2E', rag: 'red', status: 'Skeptical', influence: 'Medium' },
  { initials: 'MA', name: 'Maria Ekström', role: 'Sr. PM - Payments', dept: 'Product', color: '#165DFF', rag: 'green', status: 'Champion', influence: 'Medium' },
  { initials: 'TL', name: 'Thomas Lund', role: 'Sr. PM - AI', dept: 'Product', color: '#165DFF', rag: 'green', status: 'Supportive', influence: 'Medium' },
  { initials: 'CG', name: 'Clara Gustafsson', role: 'Finance Director', dept: 'Finance', color: '#14C9C9', rag: 'green', status: 'Supportive', influence: 'Medium' },
  { initials: 'FK', name: 'Fredrik Krantz', role: 'Sales Director EMEA', dept: 'Sales', color: '#FF9A2E', rag: 'amber', status: 'Cautious', influence: 'Medium' },
];

const buyinTeams = [
  { team: 'Product', green: 85, amber: 10, red: 5, score: 92 },
  { team: 'Engineering', green: 78, amber: 17, red: 5, score: 88 },
  { team: 'Finance', green: 70, amber: 25, red: 5, score: 82 },
  { team: 'Sales', green: 55, amber: 30, red: 15, score: 68 },
  { team: 'Customer Success', green: 72, amber: 23, red: 5, score: 84 },
  { team: 'Legal / Compliance', green: 60, amber: 30, red: 10, score: 74 },
];

const timelineEvents = [
  { date: 'Aug 12, 2025', title: 'Vision Discovery Workshop', type: 'Workshop', participants: 8, outcome: 'Identified 12 opportunity areas; prioritized top 5 for deep-dive' },
  { date: 'Aug 28, 2025', title: 'Executive Strategy Offsite', type: 'Offsite', participants: 6, outcome: 'Aligned on "Strategic Finance Platform" positioning; committed to 3 bets' },
  { date: 'Sep 15, 2025', title: 'Engineering Architecture Review', type: 'Review', participants: 12, outcome: 'Validated platform extensibility; identified 3 technical risks' },
  { date: 'Sep 30, 2025', title: 'Sales Enablement Kickoff', type: 'Cadence', participants: 14, outcome: 'New positioning deck approved; training schedule set for Q4' },
  { date: 'Oct 10, 2025', title: 'Customer Advisory Board', type: 'Workshop', participants: 18, outcome: '8 customers validated e-invoicing urgency; 5 signed up for beta' },
  { date: 'Oct 24, 2025', title: 'Cross-Functional Sprint Review', type: 'Review', participants: 10, outcome: 'Demo of Peppol routing; stakeholder feedback incorporated' },
  { date: 'Nov 7, 2025', title: 'Board Strategy Presentation', type: 'Review', participants: 5, outcome: 'Board approved 18-month roadmap and $4.2M incremental investment' },
  { date: 'Nov 21, 2025', title: 'Monthly Alignment Cadence (Nov)', type: 'Cadence', participants: 14, outcome: 'Reviewed Q4 progress; addressed Sales concerns on pricing model' },
];

const commChannels = [
  { channel: 'Executive Sync', frequency: 'Weekly', audience: 'C-Suite + VPs', format: 'Stand-up (15 min)', content: 'Key decisions, blockers, cross-team dependencies' },
  { channel: 'Product Strategy Review', frequency: 'Bi-weekly', audience: 'Product + Engineering', format: 'Presentation + Q&A', content: 'Sprint progress, metric updates, architectural decisions' },
  { channel: 'All-Hands Update', frequency: 'Monthly', audience: 'All teams (140+)', format: 'Town hall', content: 'Vision progress, customer wins, team spotlights' },
  { channel: 'Stakeholder Newsletter', frequency: 'Monthly', audience: 'Top 14 stakeholders', format: 'Email digest', content: 'KPI dashboard, evidence updates, upcoming milestones' },
  { channel: 'Sales Enablement', frequency: 'Bi-weekly', audience: 'Sales + CS', format: 'Workshop', content: 'Positioning updates, competitive intel, demo scripts' },
  { channel: 'Slack #strategy-vision', frequency: 'Continuous', audience: 'All stakeholders', format: 'Async channel', content: 'Real-time updates, quick decisions, resource sharing' },
];

const decisions = [
  { id: 'D-001', date: 'Aug 28', title: 'Adopt "Strategic Finance Platform" positioning', participants: ['SL', 'MK', 'AJ'], outcome: 'Approved', rationale: 'Unanimous support; validated by customer research data' },
  { id: 'D-002', date: 'Sep 5', title: 'Prioritize E-Invoicing as Bet #1', participants: ['SL', 'EB', 'HW'], outcome: 'Approved', rationale: 'Regulatory deadline creates hard market pull; highest ICE score' },
  { id: 'D-003', date: 'Sep 15', title: 'Build vs. buy for Peppol gateway', participants: ['MK', 'EB', 'OS'], outcome: 'Approved', rationale: 'Build in-house for IP control; 6-week sprint estimate acceptable' },
  { id: 'D-004', date: 'Oct 1', title: 'Delay partner API program to Q2', participants: ['SL', 'JA', 'EB'], outcome: 'Deferred', rationale: 'Resource constraints; focus on core bets first' },
  { id: 'D-005', date: 'Oct 24', title: 'Expand AI agent framework scope', participants: ['SL', 'OS', 'TL'], outcome: 'Approved', rationale: 'Beta results exceeded expectations; accelerate investment' },
  { id: 'D-006', date: 'Nov 7', title: 'Approve $4.2M incremental budget', participants: ['AJ', 'SL', 'MK'], outcome: 'Approved', rationale: 'Board approved based on projected 3.2x ROI in 18 months' },
  { id: 'D-007', date: 'Nov 14', title: 'Expand beta to 10 additional customers', participants: ['SL', 'PN', 'KN'], outcome: 'Approved', rationale: 'Strong demand from pipeline; CS capacity confirmed' },
  { id: 'D-008', date: 'Nov 18', title: 'Hire dedicated Peppol compliance lead', participants: ['SL', 'HW', 'MK'], outcome: 'Approved', rationale: 'Critical for EU regulatory expertise; budget allocated' },
  { id: 'D-009', date: 'Nov 21', title: 'Delay multi-tenant architecture migration', participants: ['MK', 'EB', 'OS'], outcome: 'Deferred', rationale: 'Current architecture sufficient for 18-month horizon; revisit Q3' },
  { id: 'D-010', date: 'Nov 28', title: 'Launch customer advisory board', participants: ['SL', 'PN', 'KN'], outcome: 'Approved', rationale: 'Validates roadmap priorities; strengthens customer relationships' },
  { id: 'D-011', date: 'Dec 2', title: 'Increase dynamic discounting pilot budget', participants: ['AJ', 'SL', 'MA'], outcome: 'Modified', rationale: '+50% vs requested; phased rollout approved' },
  { id: 'D-012', date: 'Dec 5', title: 'Partner with 3 regional resellers in DACH', participants: ['JA', 'KN', 'SL'], outcome: 'Approved', rationale: 'Accelerates market entry; reduces direct sales burden' },
  { id: 'D-013', date: 'Dec 10', title: 'Deprecate legacy reporting module', participants: ['SL', 'EB', 'PN'], outcome: 'Deferred', rationale: 'Customer dependency identified; 6-month migration support needed' },
  { id: 'D-014', date: 'Dec 12', title: 'Implement SOC2 Type II certification', participants: ['HW', 'MK', 'AJ'], outcome: 'Approved', rationale: 'Enterprise sales requirement; audit scheduled for Q2' },
  { id: 'D-015', date: 'Dec 18', title: 'Add virtual card issuing capability', participants: ['SL', 'MA', 'AJ'], outcome: 'Pilot', rationale: '3-month trial with 5 customers; evaluate unit economics' },
  { id: 'D-016', date: 'Jan 8', title: 'Migrate to new ML inference platform', participants: ['OS', 'MK', 'EB'], outcome: 'Approved', rationale: '40% cost reduction; improved latency for AI features' },
  { id: 'D-017', date: 'Jan 15', title: 'Expand sales team by 4 enterprise AEs', participants: ['KN', 'AJ', 'SL'], outcome: 'Modified', rationale: '2 AEs approved; prove ROI before additional hires' },
  { id: 'D-018', date: 'Jan 22', title: 'Acquire Peppol access point provider', participants: ['SL', 'MK', 'AJ', 'JA'], outcome: 'Deferred', rationale: 'Build vs buy analysis required; revisit after Q1 results' },
];

const avatarColors: Record<string, string> = {
  SL: '#165DFF', MK: '#8E51DA', AJ: '#14C9C9', EB: '#8E51DA',
  KN: '#FF9A2E', PN: '#23C343', LH: '#165DFF', OS: '#8E51DA',
  HW: '#F76560', JA: '#FF9A2E', MA: '#165DFF', TL: '#165DFF',
  CG: '#14C9C9', FK: '#FF9A2E',
};

export default function AlignmentPage() {
  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/cpo" className={styles.breadcrumbLink}>CPO Strategy Portal</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>Cross-Functional Engagement</span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.badge}>Q6</span>
        <h1 className={styles.headerTitle}>Cross-Functional Engagement</h1>
      </div>

      {/* Alignment KPIs */}
      <div className={styles.alignKpis}>
        {alignKpis.map((kpi) => (
          <div key={kpi.label} className={styles.alignKpi}>
            <div>
              <span className={styles.alignKpiValue}>{kpi.value}</span>
              {kpi.suffix && <span className={styles.alignKpiSuffix}>{kpi.suffix}</span>}
            </div>
            <div className={styles.alignKpiLabel}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Stakeholder Map */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Stakeholder Map
          <span className={styles.sectionBadge}>14 stakeholders</span>
        </div>
        <div className={styles.ragLegend}>
          <div className={styles.ragLegendItem}>
            <span className={`${styles.ragDot} ${styles.ragGreen}`} />
            <span className={styles.ragLegendLabel}>Champion/Supportive</span>
            <span className={styles.ragLegendDesc}>Fully aligned, actively advocating</span>
          </div>
          <div className={styles.ragLegendItem}>
            <span className={`${styles.ragDot} ${styles.ragAmber}`} />
            <span className={styles.ragLegendLabel}>Cautious</span>
            <span className={styles.ragLegendDesc}>Supportive but has concerns to address</span>
          </div>
          <div className={styles.ragLegendItem}>
            <span className={`${styles.ragDot} ${styles.ragRed}`} />
            <span className={styles.ragLegendLabel}>Skeptical</span>
            <span className={styles.ragLegendDesc}>Significant concerns, needs more evidence</span>
          </div>
        </div>
        <div className={styles.stakeholderGrid}>
          {stakeholders.map((s) => (
            <div key={s.name} className={styles.stakeholderCard}>
              <div className={styles.avatar} style={{ backgroundColor: s.color }}>
                {s.initials}
              </div>
              <div className={styles.stakeholderInfo}>
                <div className={styles.stakeholderName}>{s.name}</div>
                <div className={styles.stakeholderRole}>{s.role}</div>
                <div className={styles.stakeholderDept}>{s.dept}</div>
                <div className={styles.stakeholderMeta}>
                  <span className={`${styles.ragDot} ${
                    s.rag === 'green' ? styles.ragGreen :
                    s.rag === 'amber' ? styles.ragAmber :
                    styles.ragRed
                  }`} />
                  <span className={`${styles.statusBadge} ${
                    s.status === 'Champion' ? styles.statusChampion :
                    s.status === 'Supportive' ? styles.statusSupportive :
                    s.status === 'Cautious' ? styles.statusCautious :
                    styles.statusSkeptical
                  }`}>
                    {s.status}
                  </span>
                  <span className={styles.influenceTag}>{s.influence}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buy-in Tracker */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Buy-in Tracker
          <span className={styles.sectionBadge}>by team</span>
        </div>
        <div className={styles.buyinGrid}>
          {buyinTeams.map((t) => (
            <div key={t.team} className={styles.buyinRow}>
              <span className={styles.buyinTeam}>{t.team}</span>
              <div className={styles.buyinBarContainer}>
                <div className={styles.buyinSegGreen} style={{ width: `${t.green}%` }} />
                <div className={styles.buyinSegAmber} style={{ width: `${t.amber}%` }} />
                <div className={styles.buyinSegRed} style={{ width: `${t.red}%` }} />
              </div>
              <span className={styles.buyinScore}>{t.score}/100</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alignment Timeline */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Alignment Timeline
          <span className={styles.sectionBadge}>8 events</span>
        </div>
        <div className={styles.alignTimeline}>
          <div className={styles.alignTimelineLine} />
          {timelineEvents.map((ev) => (
            <div key={ev.title} className={styles.alignTimelineItem}>
              <div className={styles.alignTimelineDot} />
              <div className={styles.alignTimelineDate}>{ev.date}</div>
              <div className={styles.alignTimelineTitle}>{ev.title}</div>
              <div className={styles.alignTimelineMeta}>
                <span className={styles.typeBadge}>{ev.type}</span>
                <span className={styles.participantCount}>{ev.participants} participants</span>
              </div>
              <div className={styles.alignTimelineOutcome}>{ev.outcome}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Plan */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Communication Plan
          <span className={styles.sectionBadge}>6 channels</span>
        </div>
        <table className={styles.commTable}>
          <thead>
            <tr>
              <th>Channel</th>
              <th>Frequency</th>
              <th>Audience</th>
              <th>Format</th>
              <th>Content</th>
            </tr>
          </thead>
          <tbody>
            {commChannels.map((ch) => (
              <tr key={ch.channel}>
                <td style={{ fontWeight: 600 }}>{ch.channel}</td>
                <td><span className={styles.freqBadge}>{ch.frequency}</span></td>
                <td>{ch.audience}</td>
                <td>{ch.format}</td>
                <td style={{ fontSize: '0.75rem', color: '#4E5969' }}>{ch.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Decision Log */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Decision Log
          <span className={styles.sectionBadge}>18 decisions</span>
        </div>
        <table className={styles.decisionTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Decision</th>
              <th>Participants</th>
              <th>Outcome</th>
              <th>Rationale</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((d) => (
              <tr key={d.id}>
                <td><span className={styles.decisionId}>{d.id}</span></td>
                <td>{d.date}</td>
                <td style={{ fontWeight: 500 }}>{d.title}</td>
                <td>
                  <div className={styles.participantAvatars}>
                    {d.participants.map((p) => (
                      <div
                        key={p}
                        className={styles.miniAvatar}
                        style={{ backgroundColor: avatarColors[p] || '#86909C' }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                </td>
                <td>
                  <span className={`${styles.outcomeBadge} ${
                    d.outcome === 'Approved' ? styles.outcomeApproved :
                    d.outcome === 'Deferred' ? styles.outcomeDeferred :
                    d.outcome === 'Modified' ? styles.outcomeModified :
                    d.outcome === 'Pilot' ? styles.outcomePilot :
                    styles.outcomeRejected
                  }`}>
                    {d.outcome}
                  </span>
                </td>
                <td><span className={styles.decisionRationale}>{d.rationale}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
