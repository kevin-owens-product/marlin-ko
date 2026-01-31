'use client';

import Link from 'next/link';
import styles from './cpo.module.css';

const timelinePhases = [
  { label: 'Discovery', status: 'Complete', dot: 'complete' },
  { label: 'Analysis', status: 'Complete', dot: 'complete' },
  { label: 'Synthesis', status: 'Complete', dot: 'complete' },
  { label: 'Validation', status: 'Active', dot: 'active' },
  { label: 'Execution', status: 'Upcoming', dot: 'upcoming' },
];

const kpis = [
  { label: 'Vision Maturity', value: '78', suffix: '%' },
  { label: 'Validation Coverage', value: '64', suffix: '%' },
  { label: 'Alignment Score', value: '82', suffix: '/100' },
  { label: 'Gaps Addressed', value: '7', suffix: '/12' },
];

const navCards = [
  {
    question: 'Q4',
    title: 'Vision Development Process',
    href: '/cpo/vision',
    color: '#165DFF',
    description: 'How the strategic vision was developed through data-driven discovery, market intelligence, and competitive analysis.',
    metric: 'Vision Maturity: 78%',
    bullets: ['5-phase research journey', 'TAM/SAM/SOM sizing', 'Competitive landscape', 'ICE scoring framework'],
  },
  {
    question: 'Q5',
    title: 'Validation Approach',
    href: '/cpo/validation',
    color: '#FF9A2E',
    description: 'Customer discovery, experimentation pipeline, and evidence-driven validation of strategic bets.',
    metric: 'Validation Coverage: 64%',
    bullets: ['32 customer interviews', 'KPI dashboard per bet', '6 active experiments', 'Evidence confidence tracking'],
  },
  {
    question: 'Q6',
    title: 'Cross-Functional Engagement',
    href: '/cpo/alignment',
    color: '#14C9C9',
    description: 'Driving alignment across Engineering, Sales, Finance, and Customer Success on the product vision.',
    metric: 'Alignment Score: 82/100',
    bullets: ['14 key stakeholders', '92% attendance rate', '18 decisions logged', 'Buy-in by team tracker'],
  },
  {
    question: 'Q7',
    title: 'Gaps & Uncertainties',
    href: '/cpo/gaps',
    color: '#8E51DA',
    description: 'Identifying, tracking, and mitigating the biggest risks and unknowns in the strategic vision.',
    metric: 'Gaps Addressed: 7/12',
    bullets: ['12 total gaps identified', '4 critical priority', 'Risk matrix visualization', '5 open questions tracked'],
  },
];

export default function CpoPortalPage() {
  return (
    <div className={styles.page}>
      {/* Hero Header */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>CPO Strategy Portal</h1>
        <p className={styles.heroSubtitle}>
          Strategic product vision for Medius&apos;s transformation from AP automation vendor to comprehensive finance platform. Research-driven process covering market analysis, validation, alignment, and risk management.
        </p>
      </div>

      {/* Strategic Timeline Strip */}
      <div className={styles.timelineStrip}>
        {timelinePhases.map((phase) => (
          <div key={phase.label} className={styles.timelinePhase}>
            <div className={`${styles.timelineDot} ${
              phase.dot === 'complete' ? styles.dotComplete :
              phase.dot === 'active' ? styles.dotActive :
              styles.dotUpcoming
            }`} />
            <div className={styles.timelinePhaseLabel}>{phase.label}</div>
            <div className={styles.timelinePhaseStatus}>{phase.status}</div>
          </div>
        ))}
      </div>

      {/* KPI Summary Cards */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className={styles.kpiCard}>
            <div className={styles.kpiLabel}>{kpi.label}</div>
            <div>
              <span className={styles.kpiValue}>{kpi.value}</span>
              <span className={styles.kpiSuffix}>{kpi.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Cards */}
      <div className={styles.navGrid}>
        {navCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={styles.navCard}
            style={{ borderLeftColor: card.color }}
          >
            <div className={styles.navCardHeader}>
              <span className={styles.questionBadge} style={{ backgroundColor: card.color }}>
                {card.question}
              </span>
              <span className={styles.navCardTitle}>{card.title}</span>
            </div>
            <div className={styles.navCardDesc}>{card.description}</div>
            <div className={styles.navCardMetric}>{card.metric}</div>
            <div className={styles.navCardBullets}>
              {card.bullets.map((b) => (
                <span key={b} className={styles.bullet}>{b}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
