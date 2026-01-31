'use client';

import Link from 'next/link';
import styles from './validation.module.css';

const frameworkSteps = [
  { label: 'Hypotheses', count: 12 },
  { label: 'Experiments', count: 6 },
  { label: 'Evidence Points', count: 28 },
  { label: 'Decisions Made', count: 9 },
];

const personas = [
  { name: 'CFO', target: 10, actual: 8 },
  { name: 'VP Finance', target: 10, actual: 10 },
  { name: 'AP Manager', target: 8, actual: 9 },
  { name: 'IT Director', target: 6, actual: 5 },
];

const kpiData = [
  {
    title: 'Bet 1: E-Invoicing',
    kpis: [
      { label: 'Mandate coverage', target: 95, actual: 78 },
      { label: 'Format accuracy', target: 99, actual: 97 },
      { label: 'Partner integrations', target: 12, actual: 8 },
      { label: 'Customer adoption', target: 40, actual: 22 },
    ],
  },
  {
    title: 'Bet 2: Payments',
    kpis: [
      { label: 'Discount capture rate', target: 85, actual: 72 },
      { label: 'Card adoption', target: 30, actual: 18 },
      { label: 'Revenue per customer', target: 100, actual: 64 },
      { label: 'Net revenue uplift', target: 15, actual: 11 },
    ],
  },
  {
    title: 'Bet 3: Agentic AI',
    kpis: [
      { label: 'Touchless rate', target: 95, actual: 88 },
      { label: 'Agent accuracy', target: 99, actual: 96 },
      { label: 'Decision confidence', target: 90, actual: 82 },
      { label: 'User trust score', target: 85, actual: 71 },
    ],
  },
];

const evidenceCards = [
  {
    bet: 'E-Invoicing',
    confidence: 'High',
    title: 'Belgium B2B mandate drives urgency',
    text: 'Analysis of 340 EU customers shows 67% have no Peppol readiness. Win rate in RFPs mentioning e-invoicing compliance jumped from 34% to 58% in Q3.',
    date: 'Oct 2025',
  },
  {
    bet: 'Payments',
    confidence: 'Medium',
    title: 'Dynamic discounting shows strong early signal',
    text: 'Pilot with 8 customers yielded 4.2% average discount capture. CFOs report 2.3x ROI within first quarter of deployment.',
    date: 'Nov 2025',
  },
  {
    bet: 'Agentic AI',
    confidence: 'High',
    title: 'Touchless rate correlates with retention',
    text: 'Customers achieving >90% touchless processing show 97% renewal rate vs 82% for those below 70%. NPS delta of +28 points.',
    date: 'Nov 2025',
  },
  {
    bet: 'Payments',
    confidence: 'Medium',
    title: 'Virtual card rebate model validated',
    text: 'Test program with 12 suppliers generated $847K in annualized rebate revenue. Supplier acceptance rate: 64% (target: 70%).',
    date: 'Oct 2025',
  },
  {
    bet: 'Agentic AI',
    confidence: 'Low',
    title: 'Multi-agent orchestration still early',
    text: 'Agent handoff accuracy at 89% (target 95%). Complex workflows involving 3+ agents show 23% higher error rates. More R&D investment needed.',
    date: 'Nov 2025',
  },
];

const experiments = [
  {
    name: 'Peppol auto-routing pilot',
    status: 'Completed',
    progress: 100,
    hypothesis: 'Auto-routing via Peppol will reduce manual corrections by 80%',
  },
  {
    name: 'Dynamic discount optimization',
    status: 'Running',
    progress: 68,
    hypothesis: 'AI-optimized discount timing increases capture rate by 2x vs static rules',
  },
  {
    name: 'Multi-agent workflow beta',
    status: 'Running',
    progress: 42,
    hypothesis: 'Chaining specialized agents reduces end-to-end processing time by 60%',
  },
  {
    name: 'Virtual card supplier onboarding',
    status: 'Running',
    progress: 55,
    hypothesis: 'Guided onboarding flow achieves 70%+ supplier acceptance within 30 days',
  },
  {
    name: 'AI confidence calibration',
    status: 'Planned',
    progress: 0,
    hypothesis: 'Displaying confidence scores increases user override accuracy by 40%',
  },
  {
    name: 'Treasury cash forecasting',
    status: 'Planned',
    progress: 0,
    hypothesis: 'ML-based forecasting achieves <5% variance on 30-day cash predictions',
  },
];

export default function ValidationPage() {
  const maxTarget = Math.max(...personas.map((p) => p.target));

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/cpo" className={styles.breadcrumbLink}>CPO Strategy Portal</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>Validation Approach</span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.badge}>Q5</span>
        <h1 className={styles.headerTitle}>Validation Approach</h1>
      </div>

      {/* Validation Framework */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Validation Framework</div>
        <div className={styles.frameworkFlow}>
          {frameworkSteps.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div className={styles.frameworkStep}>
                <div className={styles.frameworkStepLabel}>{step.label}</div>
                <div className={styles.frameworkStepCount}>{step.count}</div>
              </div>
              {i < frameworkSteps.length - 1 && (
                <span className={styles.frameworkArrow}>&rarr;</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Customer Discovery */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Customer Discovery
          <span className={styles.sectionBadge}>32 interviews</span>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>32</div>
            <div className={styles.statLabel}>Interviews</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>18</div>
            <div className={styles.statLabel}>Companies</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>72</div>
            <div className={styles.statLabel}>NPS Score</div>
          </div>
        </div>
        <div className={styles.personaBars}>
          {personas.map((p) => (
            <div key={p.name} className={styles.personaRow}>
              <span className={styles.personaName}>{p.name}</span>
              <div className={styles.personaBarContainer}>
                <div
                  className={styles.personaBarTarget}
                  style={{ width: `${(p.target / maxTarget) * 100}%` }}
                />
                <div
                  className={styles.personaBarActual}
                  style={{ width: `${(p.actual / maxTarget) * 100}%` }}
                />
              </div>
              <span className={styles.personaValues}>{p.actual} / {p.target} target</span>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          KPI Dashboard by Bet
          <span className={styles.sectionBadge}>12 KPIs</span>
        </div>
        <div className={styles.kpiColumns}>
          {kpiData.map((col) => (
            <div key={col.title} className={styles.kpiColumn}>
              <div className={styles.kpiColumnTitle}>{col.title}</div>
              {col.kpis.map((kpi) => {
                const maxVal = Math.max(kpi.target, kpi.actual);
                return (
                  <div key={kpi.label} className={styles.kpiItem}>
                    <div className={styles.kpiItemLabel}>{kpi.label}</div>
                    <div className={styles.kpiItemBars}>
                      <div className={styles.kpiBarRow}>
                        <span className={styles.kpiBarLabel}>Target</span>
                        <div className={styles.kpiBarTrack}>
                          <div
                            className={styles.kpiBarFill}
                            style={{
                              width: `${(kpi.target / maxVal) * 100}%`,
                              backgroundColor: '#C9CDD4',
                            }}
                          />
                        </div>
                        <span className={styles.kpiBarValue}>{kpi.target}%</span>
                      </div>
                      <div className={styles.kpiBarRow}>
                        <span className={styles.kpiBarLabel}>Actual</span>
                        <div className={styles.kpiBarTrack}>
                          <div
                            className={styles.kpiBarFill}
                            style={{
                              width: `${(kpi.actual / maxVal) * 100}%`,
                              backgroundColor: kpi.actual >= kpi.target ? '#23C343' : '#FF9A2E',
                            }}
                          />
                        </div>
                        <span className={styles.kpiBarValue}>{kpi.actual}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Cards */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Evidence Library
          <span className={styles.sectionBadge}>5 entries</span>
        </div>
        <div className={styles.evidenceGrid}>
          {evidenceCards.map((ev, i) => (
            <div key={i} className={styles.evidenceCard}>
              <div className={styles.evidenceCardHeader}>
                <span className={styles.evidenceBetBadge}>{ev.bet}</span>
                <span className={
                  ev.confidence === 'High' ? styles.confidenceHigh :
                  ev.confidence === 'Medium' ? styles.confidenceMedium :
                  styles.confidenceLow
                }>
                  {ev.confidence}
                </span>
              </div>
              <div className={styles.evidenceTitle}>{ev.title}</div>
              <div className={styles.evidenceText}>{ev.text}</div>
              <div className={styles.evidenceDate}>{ev.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Experimentation Pipeline */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Experimentation Pipeline
          <span className={styles.sectionBadge}>6 experiments</span>
        </div>
        <table className={styles.expTable}>
          <thead>
            <tr>
              <th>Experiment</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Hypothesis</th>
            </tr>
          </thead>
          <tbody>
            {experiments.map((exp) => (
              <tr key={exp.name}>
                <td style={{ fontWeight: 600 }}>{exp.name}</td>
                <td>
                  <span className={
                    exp.status === 'Completed' ? styles.statusCompleted :
                    exp.status === 'Running' ? styles.statusRunning :
                    styles.statusPlanned
                  }>
                    {exp.status}
                  </span>
                </td>
                <td>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${exp.progress}%` }}
                    />
                  </div>
                </td>
                <td><span className={styles.hypothesis}>{exp.hypothesis}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
