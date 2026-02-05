'use client';

import Link from 'next/link';
import styles from './vision.module.css';

const researchPhases = [
  {
    date: 'Aug 2025',
    title: 'Discovery',
    description: 'Initial market scan, customer pain-point identification, and competitive landscape mapping.',
    activities: ['Stakeholder interviews', 'Market sizing research', 'Competitive audit', 'Customer advisory board'],
    output: 'Discovery Brief: 47-page market overview with opportunity areas',
  },
  {
    date: 'Sep 2025',
    title: 'Analysis',
    description: 'Deep quantitative analysis of market trends, win/loss data, and usage analytics.',
    activities: ['Win/loss analysis', 'Usage data mining', 'Churn analysis', 'Revenue attribution'],
    output: 'Analysis Report: Data-driven insights across 1,200 customer accounts',
  },
  {
    date: 'Oct 2025',
    title: 'Synthesis',
    description: 'Pattern recognition across data sources, theme clustering, and opportunity scoring.',
    activities: ['Theme clustering', 'Opportunity mapping', 'Jobs-to-be-done framework', 'Value chain analysis'],
    output: 'Strategy Canvas: 3 strategic bets with supporting evidence',
  },
  {
    date: 'Oct 2025',
    title: 'Strategy',
    description: 'Vision articulation, strategic bet definition, and resource allocation planning.',
    activities: ['Vision narrative writing', 'ICE scoring', 'Resource modeling', 'Roadmap drafting'],
    output: 'Strategic Plan: 18-month product vision with quarterly milestones',
  },
  {
    date: 'Nov 2025 →',
    title: 'Execution',
    description: 'Rolling validation, sprint execution, and continuous customer feedback loops.',
    activities: ['Sprint planning', 'Customer beta programs', 'KPI tracking', 'Monthly reviews'],
    output: 'In Progress: Q1 2026 deliverables on track (78% confidence)',
  },
];

const competitors = [
  {
    name: 'Medius',
    position: 'Strategic Finance Platform',
    strengths: ['AI-native', 'Full AP stack', 'E-invoicing'],
    gaps: ['Scale perception', 'Brand awareness'],
    tier: 1,
    highlight: true,
  },
  {
    name: 'Coupa',
    position: 'BSM Suite Leader',
    strengths: ['Enterprise presence', 'Procurement depth', 'Community'],
    gaps: ['Innovation pace', 'AI maturity', 'Complexity'],
    tier: 1,
    highlight: false,
  },
  {
    name: 'SAP Concur',
    position: 'T&E + Invoice',
    strengths: ['SAP ecosystem', 'Global scale', 'Travel integration'],
    gaps: ['Legacy UX', 'Slow AI adoption', 'Modular rigidity'],
    tier: 1,
    highlight: false,
  },
  {
    name: 'Tipalti',
    position: 'Mid-Market Payments',
    strengths: ['Payment automation', 'Fast deployment', 'Tax compliance'],
    gaps: ['No procurement', 'Limited analytics', 'Scale ceiling'],
    tier: 2,
    highlight: false,
  },
  {
    name: 'Bill.com',
    position: 'SMB AP/AR',
    strengths: ['SMB penetration', 'Network effects', 'Bank integrations'],
    gaps: ['Enterprise features', 'AI depth', 'Complex workflows'],
    tier: 3,
    highlight: false,
  },
];

const customerInsights = [
  {
    persona: 'CFO',
    interviews: 8,
    quote: 'We need a platform that gives us real-time visibility into cash positions, not just a glorified invoice processor.',
    themes: ['Cash visibility', 'Strategic reporting', 'Board-ready dashboards'],
  },
  {
    persona: 'VP Finance',
    interviews: 10,
    quote: 'The biggest win would be eliminating the 3-day close delay caused by manual invoice reconciliation.',
    themes: ['Close acceleration', 'Automation ROI', 'Audit confidence'],
  },
  {
    persona: 'AP Manager',
    interviews: 9,
    quote: 'I spend 40% of my time on exceptions. If AI could handle even half of those, it would transform our team.',
    themes: ['Exception handling', 'AI trust', 'Team productivity'],
  },
  {
    persona: 'IT Director',
    interviews: 5,
    quote: 'Integration with our ERP is the make-or-break factor. We can\'t afford another silo.',
    themes: ['ERP integration', 'API-first', 'Data governance'],
  },
];

const differentiators = [
  {
    icon: '🧠',
    title: 'AI-Native Architecture',
    text: 'Built from the ground up with AI at the core, not bolted on. Competitors retrofit AI onto legacy systems.',
    stat: '94.9% touchless processing vs industry average of 78%',
  },
  {
    icon: '⚡',
    title: 'Speed-to-Value',
    text: 'Modular architecture allows customers to start with AP and expand to Treasury, Payments, Compliance.',
    stat: 'Average 8 weeks vs 6-12 months for legacy platforms',
  },
  {
    icon: '🌐',
    title: 'Network Effects',
    text: 'Every transaction makes benchmarks smarter, every supplier connection strengthens the ecosystem. Competitors operate in silos.',
    stat: '4,218 companies on the Medius Data Network',
  },
];

const competitiveWins = [
  {
    competitor: 'vs Coupa',
    text: 'Win on speed and AI depth. Coupa is comprehensive but slow to implement and AI is surface-level.',
  },
  {
    competitor: 'vs SAP Concur',
    text: 'Win on modularity and UX. Concur is entrenched but dated architecture limits innovation.',
  },
  {
    competitor: 'vs Tipalti',
    text: 'Win on enterprise readiness. Tipalti strong in mid-market but lacks compliance depth for global enterprises.',
  },
  {
    competitor: 'vs Bill.com',
    text: 'Win on sophistication. Bill.com is SMB-focused with limited AI and no Treasury capabilities.',
  },
];

const iceBets = [
  {
    name: 'E-Invoicing Compliance Engine',
    impact: 9,
    confidence: 8,
    ease: 7,
    total: 24,
    rank: 1,
    rationale: 'Regulatory mandate creates captive demand; builds competitive moat in European markets',
  },
  {
    name: 'Payment Monetization Suite',
    impact: 8,
    confidence: 7,
    ease: 6,
    total: 21,
    rank: 2,
    rationale: 'Revenue diversification beyond SaaS; aligns with CFO value perception shift',
  },
  {
    name: 'Agentic AI Platform',
    impact: 10,
    confidence: 6,
    ease: 5,
    total: 21,
    rank: 3,
    rationale: 'Highest long-term differentiation; requires significant R&D but defines next-gen category',
  },
];

function getBarColor(score: number) {
  if (score >= 9) return '#23C343';
  if (score >= 7) return '#165DFF';
  if (score >= 5) return '#FF9A2E';
  return '#F76560';
}

export default function VisionPage() {
  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/cpo" className={styles.breadcrumbLink}>CPO Strategy Portal</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>Vision Development</span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.badge}>Q4</span>
        <h1 className={styles.headerTitle}>Vision Development Process</h1>
      </div>

      {/* Research Journey Timeline */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Research Journey
          <span className={styles.sectionBadge}>5 phases</span>
        </div>
        <div className={styles.timeline}>
          <div className={styles.timelineLine} />
          {researchPhases.map((phase) => (
            <div key={phase.title} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineDate}>{phase.date}</div>
              <div className={styles.timelineTitle}>{phase.title}</div>
              <div className={styles.timelineDesc}>{phase.description}</div>
              <div className={styles.timelineActivities}>
                {phase.activities.map((a) => (
                  <span key={a} className={styles.activityTag}>{a}</span>
                ))}
              </div>
              <div className={styles.timelineOutput}>{phase.output}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Analysis */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Market Analysis</div>
        <div className={styles.marketGrid}>
          <div className={styles.marketCard}>
            <div className={styles.marketLabel}>TAM</div>
            <div className={styles.marketValue}>$47.2B</div>
            <div className={styles.marketGrowth}>+11.2% CAGR</div>
          </div>
          <div className={styles.marketCard}>
            <div className={styles.marketLabel}>SAM</div>
            <div className={styles.marketValue}>$12.8B</div>
            <div className={styles.marketGrowth}>+14.6% CAGR</div>
          </div>
          <div className={styles.marketCard}>
            <div className={styles.marketLabel}>SOM</div>
            <div className={styles.marketValue}>$820M</div>
            <div className={styles.marketGrowth}>+22.3% CAGR</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className={`${styles.circle} ${styles.circleTam}`}>
            <div className={`${styles.circle} ${styles.circleSam}`}>
              <div className={`${styles.circle} ${styles.circleSom}`}>
                <span className={styles.circleLabel}>SOM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competitive Landscape Grid */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Competitive Landscape
          <span className={styles.sectionBadge}>5 players</span>
        </div>
        <table className={styles.compTable}>
          <thead>
            <tr>
              <th>Company</th>
              <th>Position</th>
              <th>Strengths</th>
              <th>Gaps</th>
              <th>Tier</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((c) => (
              <tr key={c.name}>
                <td className={c.highlight ? styles.compHighlight : styles.compName}>{c.name}</td>
                <td>{c.position}</td>
                <td>
                  <div className={styles.tagList}>
                    {c.strengths.map((s) => (
                      <span key={s} className={styles.tagGreen}>{s}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className={styles.tagList}>
                    {c.gaps.map((g) => (
                      <span key={g} className={styles.tagRed}>{g}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className={`${styles.tierBadge} ${
                    c.tier === 1 ? styles.tier1 : c.tier === 2 ? styles.tier2 : styles.tier3
                  }`}>
                    Tier {c.tier}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Competitive Differentiation - Why Medius Wins */}
      <div className={styles.sectionAi}>
        <div className={styles.heroStatement}>
          <div className={styles.heroTitle}>Why Medius Wins</div>
          <div className={styles.heroSubtitle}>Strategic differentiation that drives competitive advantage</div>
        </div>

        <div className={styles.differentiatorGrid}>
          {differentiators.map((d) => (
            <div key={d.title} className={styles.differentiatorCard}>
              <div className={styles.differentiatorIcon}>{d.icon}</div>
              <div className={styles.differentiatorTitle}>{d.title}</div>
              <div className={styles.differentiatorText}>{d.text}</div>
              <div className={styles.differentiatorStat}>{d.stat}</div>
            </div>
          ))}
        </div>

        <div className={styles.winSummaryTitle}>
          Competitive Win Summary
          <span className={styles.sectionBadge}>4 head-to-head</span>
        </div>
        <div className={styles.winSummaryGrid}>
          {competitiveWins.map((w) => (
            <div key={w.competitor} className={styles.winCard}>
              <div className={styles.winCardCompetitor}>{w.competitor}</div>
              <div className={styles.winCardText}>{w.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Insights */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Customer Insights
          <span className={styles.sectionBadge}>32 interviews</span>
        </div>
        <div className={styles.insightsGrid}>
          {customerInsights.map((ci) => (
            <div key={ci.persona} className={styles.insightCard}>
              <div className={styles.insightPersona}>{ci.persona}</div>
              <div className={styles.insightCount}>{ci.interviews} interviews</div>
              <div className={styles.insightQuote}>&ldquo;{ci.quote}&rdquo;</div>
              <div className={styles.insightThemes}>
                {ci.themes.map((t) => (
                  <span key={t} className={styles.themeTag}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Framework — ICE Scoring */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Decision Framework — ICE Scoring
          <span className={styles.sectionBadge}>3 strategic bets</span>
        </div>
        <table className={styles.iceTable}>
          <thead>
            <tr>
              <th>Strategic Bet</th>
              <th>Impact</th>
              <th>Confidence</th>
              <th>Ease</th>
              <th>ICE Score</th>
              <th>Rank</th>
              <th>Rationale</th>
            </tr>
          </thead>
          <tbody>
            {iceBets.map((bet) => (
              <tr key={bet.name}>
                <td style={{ fontWeight: 600 }}>{bet.name}</td>
                <td>
                  <div className={styles.iceBar}>
                    <div className={styles.iceBarTrack}>
                      <div
                        className={styles.iceBarFill}
                        style={{ width: `${bet.impact * 10}%`, backgroundColor: getBarColor(bet.impact) }}
                      />
                    </div>
                    <span className={styles.iceScore}>{bet.impact}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.iceBar}>
                    <div className={styles.iceBarTrack}>
                      <div
                        className={styles.iceBarFill}
                        style={{ width: `${bet.confidence * 10}%`, backgroundColor: getBarColor(bet.confidence) }}
                      />
                    </div>
                    <span className={styles.iceScore}>{bet.confidence}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.iceBar}>
                    <div className={styles.iceBarTrack}>
                      <div
                        className={styles.iceBarFill}
                        style={{ width: `${bet.ease * 10}%`, backgroundColor: getBarColor(bet.ease) }}
                      />
                    </div>
                    <span className={styles.iceScore}>{bet.ease}</span>
                  </div>
                </td>
                <td><span className={styles.iceTotal}>{bet.total}</span></td>
                <td>
                  <span className={`${styles.rankBadge} ${
                    bet.rank === 2 ? styles.rankBadge2 : bet.rank === 3 ? styles.rankBadge3 : ''
                  }`}>
                    {bet.rank}
                  </span>
                </td>
                <td><span className={styles.rationale}>{bet.rationale}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
