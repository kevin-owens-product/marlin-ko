"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/locale-context';
import styles from './CommandPalette.module.css';

interface CommandItem {
  id: string;
  labelKey: string;
  hintKey?: string;
  icon: string;
  href?: string;
  action?: () => void;
  sectionKey: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAGES: CommandItem[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: '\u25A1', href: '/', sectionKey: 'commandPalette.pages' },
  { id: 'activity', labelKey: 'nav.activityFeed', icon: '\u2261', href: '/activity', sectionKey: 'commandPalette.pages' },
  { id: 'invoices', labelKey: 'nav.invoices', icon: '\u2630', href: '/invoices', sectionKey: 'commandPalette.pages' },
  { id: 'approvals', labelKey: 'nav.approvals', icon: '\u2713', href: '/approvals', sectionKey: 'commandPalette.pages' },
  { id: 'matching', labelKey: 'nav.poMatching', icon: '\u2194', href: '/matching', sectionKey: 'commandPalette.pages' },
  { id: 'coding', labelKey: 'nav.aiCoding', icon: '#', href: '/coding', sectionKey: 'commandPalette.pages' },
  { id: 'payments', labelKey: 'nav.payments', icon: '$', href: '/payments', sectionKey: 'commandPalette.pages' },
  { id: 'discounting', labelKey: 'nav.dynamicDiscounting', icon: '%', href: '/discounting', sectionKey: 'commandPalette.pages' },
  { id: 'virtual-cards', labelKey: 'nav.virtualCards', icon: '\u2610', href: '/virtual-cards', sectionKey: 'commandPalette.pages' },
  { id: 'scf', labelKey: 'nav.supplyChainFinance', icon: '\u21C6', href: '/scf', sectionKey: 'commandPalette.pages' },
  { id: 'expenses', labelKey: 'nav.expenses', icon: '\u2197', href: '/expenses', sectionKey: 'commandPalette.pages' },
  { id: 'cashflow', labelKey: 'nav.cashFlow', icon: '~', href: '/cashflow', sectionKey: 'commandPalette.pages' },
  { id: 'treasury', labelKey: 'nav.treasury', icon: '\u2622', href: '/treasury', sectionKey: 'commandPalette.pages' },
  { id: 'purchase-orders', labelKey: 'nav.purchaseOrders', icon: '\u2692', href: '/purchase-orders', sectionKey: 'commandPalette.pages' },
  { id: 'contracts', labelKey: 'nav.contracts', icon: '\u270E', href: '/contracts', sectionKey: 'commandPalette.pages' },
  { id: 'suppliers', labelKey: 'nav.supplierDirectory', icon: '\u2302', href: '/suppliers', sectionKey: 'commandPalette.pages' },
  { id: 'supplier-portal', labelKey: 'nav.supplierPortal', icon: '\u2616', href: '/supplier-portal', sectionKey: 'commandPalette.pages' },
  { id: 'conversations', labelKey: 'nav.conversations', icon: '\u2709', href: '/suppliers/conversations', sectionKey: 'commandPalette.pages' },
  { id: 'risk', labelKey: 'nav.riskMonitor', icon: '\u26A0', href: '/suppliers/risk', sectionKey: 'commandPalette.pages' },
  { id: 'supplier-network', labelKey: 'nav.networkMap', icon: '\u2609', href: '/suppliers/network', sectionKey: 'commandPalette.pages' },
  { id: 'supplier-onboarding', labelKey: 'nav.onboardingPipeline', icon: '\u2B07', href: '/suppliers/onboarding', sectionKey: 'commandPalette.pages' },
  { id: 'supplier-performance', labelKey: 'nav.performanceScores', icon: '\u2593', href: '/suppliers/performance', sectionKey: 'commandPalette.pages' },
  { id: 'supplier-diversity', labelKey: 'nav.diversityEsg', icon: '\u2618', href: '/suppliers/diversity', sectionKey: 'commandPalette.pages' },
  { id: 'analytics', labelKey: 'nav.analytics', icon: '\u2593', href: '/analytics', sectionKey: 'commandPalette.pages' },
  { id: 'benchmarks', labelKey: 'nav.benchmarks', icon: '\u2637', href: '/benchmarks', sectionKey: 'commandPalette.pages' },
  { id: 'reports', labelKey: 'nav.reports', icon: '\u2630', href: '/reports', sectionKey: 'commandPalette.pages' },
  { id: 'copilot', labelKey: 'nav.aiCopilot', icon: '\u2726', href: '/copilot', sectionKey: 'commandPalette.pages' },
  { id: 'agent-studio', labelKey: 'nav.agentStudio', icon: '\u2699', href: '/agent-studio', sectionKey: 'commandPalette.pages' },
  { id: 'risk-dashboard', labelKey: 'nav.riskDashboard', icon: '\u26A0', href: '/risk-dashboard', sectionKey: 'commandPalette.pages' },
  { id: 'compliance', labelKey: 'nav.complianceHub', icon: '\u2690', href: '/compliance', sectionKey: 'commandPalette.pages' },
  { id: 'settings', labelKey: 'nav.settings', icon: '\u2699', href: '/settings', sectionKey: 'commandPalette.pages' },
  { id: 'audit', labelKey: 'nav.auditLog', icon: '\u2691', href: '/audit', sectionKey: 'commandPalette.pages' },
  { id: 'onboarding', labelKey: 'nav.onboarding', icon: '\u2605', href: '/onboarding', sectionKey: 'commandPalette.pages' },
  { id: 'cpo', labelKey: 'nav.cpoPortal', icon: '\u2726', href: '/cpo', sectionKey: 'commandPalette.pages' },
  { id: 'cpo-vision', labelKey: 'nav.cpoVision', icon: '\u2726', href: '/cpo/vision', sectionKey: 'commandPalette.pages' },
  { id: 'cpo-validation', labelKey: 'nav.cpoValidation', icon: '\u2726', href: '/cpo/validation', sectionKey: 'commandPalette.pages' },
  { id: 'cpo-alignment', labelKey: 'nav.cpoAlignment', icon: '\u2726', href: '/cpo/alignment', sectionKey: 'commandPalette.pages' },
  { id: 'cpo-gaps', labelKey: 'nav.cpoGaps', icon: '\u2726', href: '/cpo/gaps', sectionKey: 'commandPalette.pages' },
];

const QUICK_ACTIONS: CommandItem[] = [
  { id: 'new-invoice', labelKey: 'commandPalette.createNewInvoice', hintKey: 'commandPalette.startNewInvoice', icon: '+', sectionKey: 'commandPalette.quickActions', href: '/invoices' },
  { id: 'new-po', labelKey: 'commandPalette.createPurchaseOrder', hintKey: 'commandPalette.draftNewPO', icon: '+', sectionKey: 'commandPalette.quickActions', href: '/purchase-orders' },
  { id: 'run-report', labelKey: 'commandPalette.generateReport', hintKey: 'commandPalette.runAnalyticsReport', icon: '\u2593', sectionKey: 'commandPalette.quickActions', href: '/reports' },
];

const RECENT: CommandItem[] = [
  { id: 'recent-1', labelKey: 'INV-2024-0847', hintKey: 'Acme Supplies - $12,450.00', icon: '\u2630', sectionKey: 'commandPalette.recent', href: '/invoices' },
  { id: 'recent-2', labelKey: 'INV-2024-0843', hintKey: 'GlobalTech Inc - $8,200.00', icon: '\u2630', sectionKey: 'commandPalette.recent', href: '/invoices' },
  { id: 'recent-3', labelKey: 'PO-2024-0156', hintKey: 'Office Depot - $3,420.00', icon: '\u2692', sectionKey: 'commandPalette.recent', href: '/purchase-orders' },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const t = useT();

  // Resolve labels for search
  const resolveLabel = (item: CommandItem): string => {
    // For recent items, labelKey is a raw string (invoice/PO number)
    const resolved = t(item.labelKey);
    return resolved === item.labelKey && !item.labelKey.includes('.') ? item.labelKey : resolved;
  };

  const resolveHint = (item: CommandItem): string | undefined => {
    if (!item.hintKey) return undefined;
    const resolved = t(item.hintKey);
    return resolved === item.hintKey && !item.hintKey.includes('.') ? item.hintKey : resolved;
  };

  const resolveSection = (item: CommandItem): string => t(item.sectionKey);

  const allItems = [...PAGES, ...QUICK_ACTIONS, ...RECENT];

  const filtered = query.length === 0
    ? [...RECENT, ...QUICK_ACTIONS, ...PAGES.slice(0, 6)]
    : allItems.filter((item) => {
        const label = resolveLabel(item).toLowerCase();
        const hint = resolveHint(item)?.toLowerCase() || '';
        const q = query.toLowerCase();
        return label.includes(q) || hint.includes(q);
      });

  const sections = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const sec = resolveSection(item);
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(item);
    return acc;
  }, {});

  const flatItems = Object.values(sections).flat();

  const handleSelect = useCallback((item: CommandItem) => {
    onClose();
    setQuery('');
    if (item.href) {
      router.push(item.href);
    } else if (item.action) {
      item.action();
    }
  }, [onClose, router]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && flatItems[activeIndex]) {
        e.preventDefault();
        handleSelect(flatItems[activeIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, flatItems, handleSelect, onClose]);

  if (!isOpen) return null;

  let itemIndex = 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>{'\u2315'}</span>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder={t('commandPalette.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className={styles.escHint}>ESC</span>
        </div>

        <div className={styles.results}>
          {flatItems.length === 0 ? (
            <div className={styles.empty}>{t('common.noResults', { query })}</div>
          ) : (
            Object.entries(sections).map(([section, items]) => (
              <div key={section}>
                <div className={styles.sectionLabel}>{section}</div>
                {items.map((item) => {
                  const idx = itemIndex++;
                  return (
                    <button
                      key={item.id}
                      className={`${styles.resultItem} ${
                        idx === activeIndex ? styles.resultItemActive : ''
                      }`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <span className={styles.resultIcon}>{item.icon}</span>
                      <div className={styles.resultInfo}>
                        <div className={styles.resultLabel}>{resolveLabel(item)}</div>
                        {resolveHint(item) && (
                          <div className={styles.resultHint}>{resolveHint(item)}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerKeys}>
            <span className={styles.footerKey}>
              <span className={styles.kbd}>{'\u2191'}{'\u2193'}</span> {t('commandPalette.navigate')}
            </span>
            <span className={styles.footerKey}>
              <span className={styles.kbd}>{'\u21B5'}</span> {t('commandPalette.select')}
            </span>
            <span className={styles.footerKey}>
              <span className={styles.kbd}>esc</span> {t('commandPalette.close')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
