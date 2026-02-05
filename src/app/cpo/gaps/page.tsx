'use client';

import Link from 'next/link';
import styles from './gaps.module.css';

const summaryKpis = [
  { value: '12', label: 'Total Gaps' },
  { value: '4', label: 'Critical' },
  { value: '5', label: 'In Mitigation' },
  { value: '3', label: 'Resolved' },
];

// Risk matrix items: quadrant = likelihood x impact
// highHigh = top-right, highLow = bottom-right, lowHigh = top-left, lowLow = bottom-left
const riskQuadrants = {
  highHigh: [
    { id: 'G1', label: 'AI Trust Deficit', color: '#F76560' },
    { id: 'G2', label: 'Peppol Scale', color: '#F76560' },
    { id: 'G10', label: 'APAC Expansion', color: '#FF9A2E' },
  ],
  lowHigh: [
    { id: 'G3', label: 'Enterprise Readiness', color: '#FF9A2E' },
    { id: 'G4', label: 'Data Migration', color: '#FF9A2E' },
  ],
  highLow: [
    { id: 'G5', label: 'Partner Ecosystem', color: '#FF9A2E' },
    { id: 'G6', label: 'Pricing Model', color: '#FF9A2E' },
    { id: 'G11', label: 'CS Capacity', color: '#23C343' },
  ],
  lowLow: [
    { id: 'G7', label: 'Brand Perception', color: '#23C343' },
    { id: 'G8', label: 'Talent Gap', color: '#23C343' },
    { id: 'G9', label: 'API Platform', color: '#23C343' },
    { id: 'G12', label: 'Competitive Intel', color: '#23C343' },
  ],
};

const gapInventory = [
  {
    id: 'G1',
    severity: 'Critical',
    category: 'Technology',
    title: 'AI Trust & Transparency Deficit',
    description: 'Customers express concern about AI decision-making opacity. Only 42% say they "trust" automated approvals without manual review.',
    mitigationStatus: 'Active',
    mitigationPlan: 'Implementing explainable AI dashboard with confidence scores and decision audit trails',
    targetDate: 'Q1 2026',
    owner: 'Oscar S.',
  },
  {
    id: 'G2',
    severity: 'Critical',
    category: 'Infrastructure',
    title: 'Peppol Network Scaling Limits',
    description: 'Current Peppol gateway handles 12K documents/day. Projected load of 85K/day by Q2 requires 7x scaling.',
    mitigationStatus: 'Active',
    mitigationPlan: 'Cloud-native gateway rebuild with auto-scaling; load testing program initiated',
    targetDate: 'Q1 2026',
    owner: 'Erik B.',
  },
  {
    id: 'G3',
    severity: 'Critical',
    category: 'Product',
    title: 'Enterprise-Grade Feature Gaps',
    description: 'Missing SSO/SAML, advanced RBAC, and SOC 2 Type II certification. Blocks 8 active enterprise deals.',
    mitigationStatus: 'Active',
    mitigationPlan: 'Security sprint in progress; SOC 2 audit scheduled for Jan 2026',
    targetDate: 'Q1 2026',
    owner: 'Helena W.',
  },
  {
    id: 'G4',
    severity: 'Critical',
    category: 'Operations',
    title: 'Data Migration Complexity',
    description: 'Average onboarding takes 14 weeks due to legacy ERP data migration. Target: <6 weeks.',
    mitigationStatus: 'Planned',
    mitigationPlan: 'Building automated migration toolkit with pre-built connectors for top 5 ERPs',
    targetDate: 'Q2 2026',
    owner: 'Per N.',
  },
  {
    id: 'G5',
    severity: 'High',
    category: 'Ecosystem',
    title: 'Partner Ecosystem Immaturity',
    description: 'Only 3 active integration partners. Competitors average 15+. API marketplace not yet launched.',
    mitigationStatus: 'Planned',
    mitigationPlan: 'Partner program design underway; target 10 partners by end of Q2 2026',
    targetDate: 'Q2 2026',
    owner: 'Johan A.',
  },
  {
    id: 'G6',
    severity: 'High',
    category: 'Strategy',
    title: 'Pricing Model Uncertainty',
    description: 'Payment monetization pricing (discount share vs. flat fee) not validated. Sales team split on approach.',
    mitigationStatus: 'Active',
    mitigationPlan: 'A/B pricing pilot with 20 customers; results expected Dec 2025',
    targetDate: 'Dec 2025',
    owner: 'Karin N.',
  },
  {
    id: 'G7',
    severity: 'Medium',
    category: 'Market',
    title: 'Brand Perception as "AP Only"',
    description: '68% of prospect survey respondents still categorize Medius as "AP automation" rather than a finance platform.',
    mitigationStatus: 'Resolved',
    mitigationPlan: 'Rebrand campaign launched; analyst briefings completed with Gartner and Forrester',
    targetDate: 'Completed',
    owner: 'Sarah L.',
  },
  {
    id: 'G8',
    severity: 'Medium',
    category: 'People',
    title: 'AI/ML Engineering Talent Gap',
    description: '3 open senior AI roles unfilled for 4+ months. Team operating at 70% capacity on Bet 3.',
    mitigationStatus: 'Active',
    mitigationPlan: 'Expanded recruiting to EU markets; contractor bridge team onboarded',
    targetDate: 'Q1 2026',
    owner: 'Marcus K.',
  },
  {
    id: 'G9',
    severity: 'Medium',
    category: 'Technology',
    title: 'API Platform Maturity',
    description: 'Current API coverage at 60% of features. Partners and customers requesting full API access for integrations.',
    mitigationStatus: 'Active',
    mitigationPlan: 'API-first initiative to expose remaining features; OpenAPI spec documentation in progress',
    targetDate: 'Q3 2026',
    owner: 'Johan A.',
  },
  {
    id: 'G10',
    severity: 'High',
    category: 'Market',
    title: 'International Expansion Readiness',
    description: 'Limited localization for APAC markets. Missing language support for Japanese, Korean, Mandarin.',
    mitigationStatus: 'Planned',
    mitigationPlan: 'Localization roadmap defined; partnering with regional SI for market entry strategy',
    targetDate: 'Q4 2026',
    owner: 'Karin N.',
  },
  {
    id: 'G11',
    severity: 'Medium',
    category: 'Operations',
    title: 'Customer Success Capacity',
    description: 'CS team bandwidth stretched with 1:80 CSM-to-customer ratio. Expansion revenue at risk.',
    mitigationStatus: 'Active',
    mitigationPlan: 'Hiring 4 CSMs in Q1; implementing digital-touch model for SMB segment',
    targetDate: 'Q2 2026',
    owner: 'Maria E.',
  },
  {
    id: 'G12',
    severity: 'Medium',
    category: 'Strategy',
    title: 'Competitive Intelligence Gap',
    description: 'No systematic win/loss analysis. Relying on anecdotal sales feedback for competitive positioning.',
    mitigationStatus: 'Planned',
    mitigationPlan: 'Implementing automated win/loss surveys; building competitive battlecards with product marketing',
    targetDate: 'Q2 2026',
    owner: 'Sarah L.',
  },
];

const openQuestions = [
  {
    question: 'Should we build or acquire Peppol network capacity?',
    context: 'Build option estimated at $1.8M over 6 months. Acquisition target identified at $4.2M but immediate capacity. Board wants recommendation by Q1.',
    priority: 'High',
    deadline: 'Jan 15, 2026',
    assignee: 'Erik B. & Marcus K.',
  },
  {
    question: 'What is the right payment monetization model for mid-market?',
    context: 'Dynamic discount sharing works for enterprise (avg $12K/yr revenue per customer) but may not scale to mid-market. Need pricing research.',
    priority: 'High',
    deadline: 'Dec 20, 2025',
    assignee: 'Karin N. & Maria E.',
  },
  {
    question: 'How do we position against Coupa in RFPs without price competition?',
    context: 'Lost 3 of last 5 competitive deals to Coupa on price. Need to articulate value differentiation around AI and speed-to-value.',
    priority: 'Medium',
    deadline: 'Jan 30, 2026',
    assignee: 'Karin N. & Sarah L.',
  },
  {
    question: 'What is the minimum viable partner ecosystem for launch?',
    context: 'Full marketplace is 12+ months away. Need to determine the 5 critical integrations that unblock the most revenue.',
    priority: 'Medium',
    deadline: 'Feb 15, 2026',
    assignee: 'Johan A.',
  },
  {
    question: 'Can multi-agent orchestration achieve 95% accuracy by Q2?',
    context: 'Current accuracy at 89%. Engineering estimates 95% requires 2 additional ML engineers and 3 months of training data collection.',
    priority: 'High',
    deadline: 'Jan 31, 2026',
    assignee: 'Oscar S. & Thomas L.',
  },
];

export default function GapsPage() {
  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/cpo" className={styles.breadcrumbLink}>CPO Strategy Portal</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>Gaps &amp; Uncertainties</span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.badge}>Q7</span>
        <h1 className={styles.headerTitle}>Gaps &amp; Uncertainties</h1>
      </div>

      {/* Summary KPIs */}
      <div className={styles.summaryKpis}>
        {summaryKpis.map((kpi) => (
          <div key={kpi.label} className={styles.summaryKpi}>
            <div className={styles.summaryKpiValue}>{kpi.value}</div>
            <div className={styles.summaryKpiLabel}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Risk Matrix */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Risk Matrix
          <span className={styles.sectionBadge}>12 risks mapped</span>
        </div>
        <div className={styles.riskMatrix}>
          {/* Row 0: axis labels */}
          <div className={styles.axisCorner} />
          <div className={styles.axisLabelTop}>Low Impact</div>
          <div className={styles.axisLabelTop}>High Impact</div>

          {/* Row 1: High Likelihood */}
          <div className={styles.axisLabelLeft}>High Likelihood</div>
          <div className={`${styles.quadrant} ${styles.quadrantOrange}`}>
            {riskQuadrants.highLow.map((r) => (
              <div key={r.id} className={styles.riskDot}>
                <span className={styles.riskDotCircle} style={{ backgroundColor: r.color }} />
                {r.label}
              </div>
            ))}
          </div>
          <div className={`${styles.quadrant} ${styles.quadrantRed}`}>
            {riskQuadrants.highHigh.map((r) => (
              <div key={r.id} className={styles.riskDot}>
                <span className={styles.riskDotCircle} style={{ backgroundColor: r.color }} />
                {r.label}
              </div>
            ))}
          </div>

          {/* Row 2: Low Likelihood */}
          <div className={styles.axisLabelLeft}>Low Likelihood</div>
          <div className={`${styles.quadrant} ${styles.quadrantGreen}`}>
            {riskQuadrants.lowLow.map((r) => (
              <div key={r.id} className={styles.riskDot}>
                <span className={styles.riskDotCircle} style={{ backgroundColor: r.color }} />
                {r.label}
              </div>
            ))}
          </div>
          <div className={`${styles.quadrant} ${styles.quadrantOrange}`}>
            {riskQuadrants.lowHigh.map((r) => (
              <div key={r.id} className={styles.riskDot}>
                <span className={styles.riskDotCircle} style={{ backgroundColor: r.color }} />
                {r.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gap Inventory */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Gap Inventory
          <span className={styles.sectionBadge}>12 gaps</span>
        </div>
        <div className={styles.gapGrid}>
          {gapInventory.map((gap) => (
            <div key={gap.id} className={styles.gapCard}>
              <div className={styles.gapCardHeader}>
                <span className={
                  gap.severity === 'Critical' ? styles.severityCritical :
                  gap.severity === 'High' ? styles.severityHigh :
                  styles.severityMedium
                }>
                  {gap.severity}
                </span>
                <span className={styles.categoryTag}>{gap.category}</span>
              </div>
              <div className={styles.gapTitle}>{gap.title}</div>
              <div className={styles.gapDesc}>{gap.description}</div>
              <div className={styles.gapMeta}>
                <div className={styles.gapMetaRow}>
                  <span className={styles.gapMetaLabel}>Mitigation</span>
                  <span className={
                    gap.mitigationStatus === 'Active' ? styles.mitigationActive :
                    gap.mitigationStatus === 'Planned' ? styles.mitigationPlanned :
                    styles.mitigationResolved
                  }>
                    {gap.mitigationStatus}
                  </span>
                </div>
                <div className={styles.gapMetaRow}>
                  <span className={styles.gapMetaLabel}>Plan</span>
                  <span className={styles.gapMetaValue} style={{ textAlign: 'right', maxWidth: '200px' }}>{gap.mitigationPlan}</span>
                </div>
                <div className={styles.gapMetaRow}>
                  <span className={styles.gapMetaLabel}>Target</span>
                  <span className={styles.gapMetaValue}>{gap.targetDate}</span>
                </div>
                <div className={styles.gapMetaRow}>
                  <span className={styles.gapMetaLabel}>Owner</span>
                  <span className={styles.gapMetaValue}>{gap.owner}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Open Questions */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Open Questions
          <span className={styles.sectionBadge}>5 questions</span>
        </div>
        <div className={styles.questionsGrid}>
          {openQuestions.map((q, i) => (
            <div key={i} className={styles.questionCard}>
              <div className={styles.questionText}>{q.question}</div>
              <div className={styles.questionContext}>{q.context}</div>
              <div className={styles.questionMeta}>
                <span className={q.priority === 'High' ? styles.priorityHigh : styles.priorityMedium}>
                  {q.priority}
                </span>
                <span className={styles.questionDeadline}>{q.deadline}</span>
                <span className={styles.questionAssignee}>{q.assignee}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
