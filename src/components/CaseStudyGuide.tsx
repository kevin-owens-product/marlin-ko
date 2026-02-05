"use client";

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './CaseStudyGuide.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PageLink {
  label: string;
  path: string;
  description: string;
}

interface SubSection {
  heading: string;
  links: PageLink[];
}

interface AnswerNarrative {
  summary: string;
  keyPoints: string[];
  highlightStat?: { value: string; label: string };
}

interface Question {
  number: number;
  title: string;
  questionText: string;
  talkingPoint: string;
  badgeColor: string;
  answerNarrative: AnswerNarrative;
  links?: PageLink[];
  subSections?: SubSection[];
}

// ─── Question Data ───────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    number: 1,
    title: 'Market Repositioning',
    questionText: 'How would you reposition the company from an AP automation vendor to a strategic finance platform?',
    talkingPoint: 'CFO Command Center — from cost center to strategic value driver',
    badgeColor: 'Red',
    answerNarrative: {
      summary: 'Reposition Medius from an AP automation tool to a Strategic Finance Platform by building a CFO Command Center that delivers real-time cash visibility, AI-powered decision support, and board-ready analytics — shifting the value prop from cost savings to strategic advantage.',
      keyPoints: [
        'Dashboard reimagined as CFO nerve center with real-time cash positions, spend intelligence, and predictive insights',
        'AI confidence scores on every invoice turn AP from manual data entry into autonomous processing (88% touchless rate)',
        'Agent Studio introduces specialized AI agents that handle coding, matching, and risk — replacing task automation with decision intelligence',
        'Analytics layer surfaces strategic spend patterns, benchmark comparisons, and forecast accuracy — data CFOs actually present to boards',
      ],
      highlightStat: { value: '88%', label: 'Touchless processing rate' },
    },
    links: [
      { label: 'Dashboard', path: '/', description: 'CFO Command Center in action' },
      { label: 'Invoices', path: '/invoices', description: 'AI confidence on every invoice' },
      { label: 'Agent Studio', path: '/agent-studio', description: 'Specialized AI agents' },
      { label: 'Analytics', path: '/analytics', description: 'Strategic data layer' },
    ],
  },
  {
    number: 2,
    title: 'Strategic Bets',
    questionText: 'What are the 3 strategic bets you would place to drive the next phase of growth?',
    talkingPoint: 'E-Invoicing mandates + Payment monetization + Agentic AI',
    badgeColor: 'Green',
    answerNarrative: {
      summary: 'Three ICE-scored bets that compound on each other: E-Invoicing creates regulatory pull and a compliance moat, Payment Monetization diversifies revenue beyond SaaS, and Agentic AI delivers the long-term category-defining differentiation.',
      keyPoints: [
        'Bet 1 — E-Invoicing: Belgium B2B mandate drives urgency; 67% of EU customers have no Peppol readiness; win rate jumped from 34% to 58% in RFPs mentioning compliance',
        'Bet 2 — Payment Monetization: Dynamic discounting pilot yielded 4.2% average discount capture with 2.3x ROI; virtual card program generated $847K annualized rebate revenue',
        'Bet 3 — Agentic AI: Customers with >90% touchless processing show 97% renewal rate vs 82% below 70%; NPS delta of +28 points',
        'ICE scoring: E-Invoicing ranked #1 (score 24), Payments #2 (score 21), Agentic AI #3 (score 21) — highest impact but requires most R&D',
      ],
      highlightStat: { value: '3', label: 'Bets, ICE-scored & validated' },
    },
    subSections: [
      {
        heading: 'Bet 1 — E-Invoicing',
        links: [
          { label: 'Compliance', path: '/compliance', description: 'Mandate tracker & Peppol readiness' },
        ],
      },
      {
        heading: 'Bet 2 — Payment Monetization',
        links: [
          { label: 'Discounting', path: '/discounting', description: 'Dynamic discounting engine' },
          { label: 'Virtual Cards', path: '/virtual-cards', description: 'Card issuance & rebate dashboard' },
          { label: 'SCF', path: '/scf', description: 'Supply chain finance programs' },
          { label: 'Payments', path: '/payments', description: 'AI payment optimization' },
        ],
      },
      {
        heading: 'Bet 3 — Agentic AI',
        links: [
          { label: 'Agent Studio', path: '/agent-studio', description: 'Agent constellation & decision logs' },
          { label: 'PO Matching', path: '/matching', description: 'PO matching agent' },
          { label: 'AI Coding', path: '/coding', description: 'Classification agent' },
          { label: 'Risk Dashboard', path: '/risk-dashboard', description: 'Risk scoring agent' },
        ],
      },
    ],
  },
  {
    number: 3,
    title: 'Long-Term Pillars',
    questionText: 'What are the long-term competitive moats you would build over 3–5 years?',
    talkingPoint: '5 pillars: Data network, Supplier network, Treasury, Composable platform, Vertical intelligence',
    badgeColor: 'Purple',
    answerNarrative: {
      summary: 'Five interlocking moats that get stronger with scale. Each pillar reinforces the others — more suppliers feed more data, more data trains better AI, better AI attracts more suppliers. Competitors can copy features but not the compounding network.',
      keyPoints: [
        'Data Network Effects: Industry benchmarking across anonymized customer base creates insights no single customer could generate alone',
        'Supplier Network: 22+ active suppliers with portal, onboarding pipeline, performance scorecards, and diversity tracking — each supplier added increases value for all buyers',
        'Treasury & Cash Flow: AI-powered cash forecasting and investment optimization turn AP into a profit center, not just a cost line',
        'Composable Platform: ERP integrations and API-first architecture make Medius the connective tissue of finance operations',
        'Vertical Intelligence: GL coding and expense policy engines learn industry-specific patterns — accuracy improves with every transaction processed',
      ],
      highlightStat: { value: '5', label: 'Compounding moats' },
    },
    subSections: [
      {
        heading: 'Pillar 1 — Data Network Effects',
        links: [
          { label: 'Benchmarks', path: '/benchmarks', description: 'Industry benchmarking from anonymized network' },
          { label: 'Network Map', path: '/suppliers/network', description: 'Supplier network flywheel & compounding data' },
        ],
      },
      {
        heading: 'Pillar 2 — Supplier Network',
        links: [
          { label: 'Supplier Portal', path: '/supplier-portal', description: 'Supplier-facing experience' },
          { label: 'Suppliers', path: '/suppliers', description: '22 suppliers with CRUD' },
          { label: 'Conversations', path: '/suppliers/conversations', description: 'Communication agent' },
          { label: 'Network Map', path: '/suppliers/network', description: 'Network intelligence & geographic reach' },
          { label: 'Onboarding Pipeline', path: '/suppliers/onboarding', description: 'Supplier activation funnel' },
          { label: 'Performance', path: '/suppliers/performance', description: 'Supplier scorecards & benchmarks' },
          { label: 'Risk Management', path: '/suppliers/risk', description: 'Risk alerts & mitigation tracking' },
          { label: 'Diversity & ESG', path: '/suppliers/diversity', description: 'Certifications & sustainability' },
        ],
      },
      {
        heading: 'Pillar 3 — Treasury',
        links: [
          { label: 'Treasury', path: '/treasury', description: 'Cash positions & investments' },
          { label: 'Cash Flow', path: '/cashflow', description: 'AI cash forecasting' },
          { label: 'Payments', path: '/payments', description: 'AI payment optimization' },
          { label: 'SCF', path: '/scf', description: 'Supply chain financing & working capital' },
        ],
      },
      {
        heading: 'Pillar 4 — Composable Platform',
        links: [
          { label: 'Integrations Hub', path: '/integrations', description: 'ERP ecosystem & data flow orchestration' },
          { label: 'Developer Portal', path: '/developer', description: 'API-first architecture & partner marketplace' },
          { label: 'Settings', path: '/settings', description: 'Configuration & API keys' },
        ],
      },
      {
        heading: 'Pillar 5 — Vertical Intelligence',
        links: [
          { label: 'AI Coding', path: '/coding', description: 'GL code intelligence' },
          { label: 'Expense Policies', path: '/expenses/policies', description: 'Vertical policy rules' },
        ],
      },
    ],
  },
  {
    number: 4,
    title: 'Vision Development Process',
    questionText: 'How did you develop and refine this strategic vision?',
    talkingPoint: 'Data-driven discovery → market intelligence → AI-powered exploration',
    badgeColor: 'Blue',
    answerNarrative: {
      summary: 'A structured 5-phase research journey from Aug–Nov 2025: Discovery, Analysis, Synthesis, Strategy, Execution. Each phase produced concrete artifacts — from a 47-page market overview to ICE-scored strategic bets — ensuring the vision was grounded in data, not intuition.',
      keyPoints: [
        '32 customer interviews across 4 personas (CFO, VP Finance, AP Manager, IT Director) surfaced the real jobs-to-be-done',
        'Market sizing: $47.2B TAM (+11.2% CAGR) → $12.8B SAM → $820M SOM — validated a large, growing addressable market',
        'Competitive landscape mapped 5 players (Coupa, SAP Concur, Tipalti, Bill.com) — Medius differentiated on AI-native architecture and speed',
        'ICE scoring framework objectively ranked strategic bets on Impact, Confidence, and Ease — removing bias from prioritization',
      ],
      highlightStat: { value: '32', label: 'Customer interviews' },
    },
    links: [
      { label: 'Vision Development', path: '/cpo/vision', description: 'Full vision development process' },
      { label: 'CPO Strategy Portal', path: '/cpo', description: 'Strategy portal hub' },
    ],
  },
  {
    number: 5,
    title: 'Validation Approach',
    questionText: 'How would you validate this vision with customers and the market?',
    talkingPoint: 'Customer discovery, KPI dashboards, evidence library, experiment pipeline',
    badgeColor: 'Orange',
    answerNarrative: {
      summary: 'A rigorous validation funnel: 12 hypotheses narrowed through 6 active experiments, generating 28 evidence points that informed 9 strategic decisions. Every bet is tracked against target KPIs with a live evidence library — the vision is a living document, not a static deck.',
      keyPoints: [
        'Customer discovery: 32 interviews across 18 companies, NPS score of 72 — strong signal that the strategic direction resonates',
        '12 KPIs tracked per bet: E-Invoicing at 78% mandate coverage (target 95%), Payments at 72% discount capture (target 85%), AI at 88% touchless (target 95%)',
        'Evidence library with confidence ratings: Belgium B2B mandate (High), dynamic discounting ROI (Medium), multi-agent orchestration (Low — needs more R&D)',
        '6 experiments in pipeline: Peppol auto-routing (complete), discount optimization (68%), multi-agent beta (42%), virtual card onboarding (55%), plus 2 planned',
      ],
      highlightStat: { value: '28', label: 'Evidence points collected' },
    },
    links: [
      { label: 'Validation Approach', path: '/cpo/validation', description: 'Full validation framework' },
      { label: 'CPO Strategy Portal', path: '/cpo', description: 'Strategy portal hub' },
    ],
  },
  {
    number: 6,
    title: 'Cross-Functional Engagement',
    questionText: 'How would you drive cross-functional alignment on this vision?',
    talkingPoint: 'Stakeholder mapping, buy-in tracking, decision logging, communication plan',
    badgeColor: 'Cyan',
    answerNarrative: {
      summary: 'Systematic alignment across 14 key stakeholders using RAG-status tracking, team-level buy-in scores, and a structured cadence of workshops, reviews, and communications. The result: 82/100 alignment score, 92% attendance, and board approval of a $4.2M incremental investment.',
      keyPoints: [
        '14 stakeholders mapped with influence levels and RAG status — 9 Champions/Supportive, 3 Cautious (Sales, Legal), 1 Skeptical (Partnerships)',
        'Buy-in tracker by team: Product (92/100), Engineering (88), Finance (82), Customer Success (84), Sales (68), Legal (74) — Sales is the gap to close',
        '8 alignment events from Vision Discovery Workshop through Board Strategy Presentation — each producing documented outcomes and decisions',
        '6 communication channels: weekly exec sync, bi-weekly product review, monthly all-hands, stakeholder newsletter, sales enablement, async Slack',
      ],
      highlightStat: { value: '82', label: 'Alignment score (of 100)' },
    },
    links: [
      { label: 'Cross-Functional Alignment', path: '/cpo/alignment', description: 'Full alignment process' },
      { label: 'CPO Strategy Portal', path: '/cpo', description: 'Strategy portal hub' },
    ],
  },
  {
    number: 7,
    title: 'Vision Gaps & Uncertainties',
    questionText: 'What are the biggest gaps or uncertainties in this vision?',
    talkingPoint: 'Risk matrix, gap inventory, mitigation tracking, open questions',
    badgeColor: 'Gray',
    answerNarrative: {
      summary: '12 gaps identified and tracked with severity ratings, owners, and mitigation plans. Intellectual honesty about what we don\'t know yet — 4 are critical, 5 are in active mitigation, and 3 are resolved. Every gap has a named owner and target date.',
      keyPoints: [
        'Top critical risks: AI Trust Deficit (only 42% trust automated approvals), Peppol Scaling (need 7x from 12K to 85K docs/day), Enterprise Readiness (missing SSO/SOC2, blocking 8 deals)',
        'Risk matrix maps 8 risks by likelihood x impact — AI Trust and Peppol Scale sit in the high-likelihood/high-impact quadrant',
        '5 open strategic questions with deadlines: Peppol build-vs-acquire ($1.8M vs $4.2M), mid-market pricing model, Coupa competitive positioning, minimum partner ecosystem, multi-agent accuracy target',
        'Data migration onboarding takes 14 weeks (target <6 weeks) — automated toolkit with pre-built ERP connectors in development',
      ],
      highlightStat: { value: '4', label: 'Critical gaps tracked' },
    },
    links: [
      { label: 'Gaps & Uncertainties', path: '/cpo/gaps', description: 'Full gaps analysis' },
      { label: 'CPO Strategy Portal', path: '/cpo', description: 'Strategy portal hub' },
    ],
  },
];

const BADGE_CLASSES: Record<string, string> = {
  Red: styles.badgeRed,
  Green: styles.badgeGreen,
  Purple: styles.badgePurple,
  Blue: styles.badgeBlue,
  Orange: styles.badgeOrange,
  Cyan: styles.badgeCyan,
  Gray: styles.badgeGray,
};

// ─── Component ───────────────────────────────────────────────────────────────

interface CaseStudyGuideProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function CaseStudyGuide({ isOpen, onToggle }: CaseStudyGuideProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  // Keyboard shortcut: Cmd+Shift+G / Ctrl+Shift+G
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        onToggle();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  const toggleQuestion = useCallback((index: number) => {
    setExpandedQuestion(prev => (prev === index ? null : index));
  }, []);

  const handleNavigate = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const isCurrentPage = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  // ─── Render helpers ──────────────────────────────────────────────────────

  function renderLinks(links: PageLink[]) {
    return (
      <div className={styles.linkList}>
        {links.map((link) => {
          const active = isCurrentPage(link.path);
          return (
            <button
              key={link.path + link.description}
              className={`${styles.pageLink} ${active ? styles.pageLinkActive : ''}`}
              onClick={() => handleNavigate(link.path)}
            >
              <span className={styles.pageLinkPath}>{link.path}</span>
              <span className={styles.pageLinkDesc}>{link.description}</span>
              {active && <span className={styles.hereIndicator}>HERE</span>}
            </button>
          );
        })}
      </div>
    );
  }

  function renderNarrative(narrative: AnswerNarrative) {
    return (
      <div className={styles.narrativeBlock}>
        {narrative.highlightStat && (
          <div className={styles.narrativeHighlight}>
            <span className={styles.narrativeHighlightValue}>{narrative.highlightStat.value}</span>
            <span className={styles.narrativeHighlightLabel}>{narrative.highlightStat.label}</span>
          </div>
        )}
        <div className={styles.narrativeSummary}>{narrative.summary}</div>
        <ul className={styles.narrativePoints}>
          {narrative.keyPoints.map((point, i) => (
            <li key={i} className={styles.narrativePoint}>{point}</li>
          ))}
        </ul>
      </div>
    );
  }

  function renderQuestionBody(q: Question) {
    return (
      <>
        {renderNarrative(q.answerNarrative)}
        {q.subSections && q.subSections.map((sub) => (
          <div key={sub.heading} className={styles.subSection}>
            <div className={styles.subSectionLabel}>{sub.heading}</div>
            {renderLinks(sub.links)}
          </div>
        ))}
        {!q.subSections && q.links && renderLinks(q.links)}
      </>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Collapsed tab on right edge */}
      {!isOpen && (
        <button className={styles.tab} onClick={onToggle}>
          <span className={styles.tabPulse} />
          Case Study Guide
        </button>
      )}

      {/* Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <span className={styles.title}>Case Study Guide</span>
            <button className={styles.closeButton} onClick={onToggle}>
              ✕
            </button>
          </div>
        </div>

        {/* Shortcut hint */}
        <div className={styles.shortcutHint}>
          Toggle with <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>G</kbd>
        </div>

        {/* Question list */}
        <div className={styles.questionList}>
          {QUESTIONS.map((q, i) => {
            const isExpanded = expandedQuestion === i;

            return (
              <div
                key={q.number}
                className={styles.questionItem}
              >
                <button
                  className={styles.questionHeader}
                  onClick={() => toggleQuestion(i)}
                >
                  <span className={`${styles.questionBadge} ${BADGE_CLASSES[q.badgeColor] || styles.badgeGray}`}>
                    {q.number}
                  </span>
                  <span className={styles.questionTitleText}>{q.title}</span>
                  <span className={`${styles.expandArrow} ${isExpanded ? styles.expandArrowOpen : ''}`}>
                    ▸
                  </span>
                </button>
                <div className={`${styles.questionBody} ${isExpanded ? styles.questionBodyOpen : ''}`}>
                  <div className={styles.questionContent}>
                    <div className={styles.questionText}>{q.questionText}</div>
                    <div className={styles.talkingPoint}>{q.talkingPoint}</div>
                    {renderQuestionBody(q)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}
