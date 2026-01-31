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

interface Question {
  number: number;
  title: string;
  questionText: string;
  talkingPoint: string;
  badgeColor: string;
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
    subSections: [
      {
        heading: 'Pillar 1 — Data Network Effects',
        links: [
          { label: 'Benchmarks', path: '/benchmarks', description: 'Industry benchmarking' },
          { label: 'Analytics', path: '/analytics', description: 'Spend intelligence' },
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
          { label: 'Diversity & ESG', path: '/suppliers/diversity', description: 'Certifications & sustainability' },
        ],
      },
      {
        heading: 'Pillar 3 — Treasury',
        links: [
          { label: 'Treasury', path: '/treasury', description: 'Cash positions & investments' },
          { label: 'Cash Flow', path: '/cashflow', description: 'AI cash forecasting' },
        ],
      },
      {
        heading: 'Pillar 4 — Composable Platform',
        links: [
          { label: 'Settings', path: '/settings', description: 'ERP integrations & APIs' },
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

export function CaseStudyGuide() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  // Keyboard shortcut: Cmd+Shift+G / Ctrl+Shift+G
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  function renderQuestionBody(q: Question) {
    if (q.subSections) {
      return (
        <>
          {q.subSections.map((sub) => (
            <div key={sub.heading} className={styles.subSection}>
              <div className={styles.subSectionLabel}>{sub.heading}</div>
              {renderLinks(sub.links)}
            </div>
          ))}
        </>
      );
    }
    if (q.links) {
      return renderLinks(q.links);
    }
    return null;
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Collapsed tab on right edge */}
      {!isOpen && (
        <button className={styles.tab} onClick={() => setIsOpen(true)}>
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
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
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
