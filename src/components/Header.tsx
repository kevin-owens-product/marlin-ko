"use client";

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLocale, useT } from '@/lib/i18n/locale-context';
import { useCopilot } from '@/lib/copilot/copilot-context';
import { SUPPORTED_LOCALES } from '@/lib/i18n/types';
import type { Locale } from '@/lib/i18n/types';
import styles from './Header.module.css';

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

const BREADCRUMB_KEYS: Record<string, string> = {
  invoices: 'breadcrumb.invoices',
  approvals: 'breadcrumb.approvals',
  matching: 'breadcrumb.matching',
  coding: 'breadcrumb.coding',
  payments: 'breadcrumb.payments',
  discounting: 'breadcrumb.discounting',
  'virtual-cards': 'breadcrumb.virtualCards',
  scf: 'breadcrumb.scf',
  expenses: 'breadcrumb.expenses',
  cashflow: 'breadcrumb.cashflow',
  treasury: 'breadcrumb.treasury',
  'purchase-orders': 'breadcrumb.purchaseOrders',
  contracts: 'breadcrumb.contracts',
  suppliers: 'breadcrumb.suppliers',
  'supplier-portal': 'breadcrumb.supplierPortal',
  directory: 'breadcrumb.directory',
  conversations: 'breadcrumb.conversations',
  risk: 'breadcrumb.risk',
  network: 'breadcrumb.network',
  performance: 'breadcrumb.performance',
  diversity: 'breadcrumb.diversity',
  analytics: 'breadcrumb.analytics',
  benchmarks: 'breadcrumb.benchmarks',
  reports: 'breadcrumb.reports',
  copilot: 'breadcrumb.copilot',
  'agent-studio': 'breadcrumb.agentStudio',
  'risk-dashboard': 'breadcrumb.riskDashboard',
  compliance: 'breadcrumb.compliance',
  settings: 'breadcrumb.settings',
  erp: 'breadcrumb.erp',
  users: 'breadcrumb.users',
  audit: 'breadcrumb.audit',
  activity: 'breadcrumb.activity',
  onboarding: 'breadcrumb.onboarding',
  setup: 'breadcrumb.setup',
  upload: 'breadcrumb.upload',
  workflows: 'breadcrumb.workflows',
  policies: 'breadcrumb.policies',
  submit: 'breadcrumb.submit',
};

export function Header({ onOpenCommandPalette }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout, getUserInitials, getRoleColor } = useAuth();
  const { locale, setLocale } = useLocale();
  const { toggle: toggleCopilot } = useCopilot();
  const t = useT();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const notificationCount = 7;

  const breadcrumbs = (() => {
    if (pathname === '/') return [{ label: t('breadcrumb.dashboard'), href: '/' }];
    const segments = pathname.split('/').filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];
    let path = '';
    for (const seg of segments) {
      path += '/' + seg;
      const key = BREADCRUMB_KEYS[seg];
      crumbs.push({
        label: key ? t(key) : seg.charAt(0).toUpperCase() + seg.slice(1),
        href: path,
      });
    }
    return crumbs;
  })();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const currentLocaleInfo = SUPPORTED_LOCALES.find((l) => l.code === locale);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.breadcrumb}>
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href}>
              {i > 0 && <span className={styles.breadcrumbSep}>/</span>}
              <span
                className={
                  i === breadcrumbs.length - 1
                    ? styles.breadcrumbCurrent
                    : styles.breadcrumbParent
                }
              >
                {' '}{crumb.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      <button className={styles.searchBtn} onClick={onOpenCommandPalette}>
        <span className={styles.searchIcon}>{'\u2315'}</span>
        <span className={styles.searchText}>{t('header.searchPlaceholder')}</span>
        <span className={styles.searchShortcut}>{'\u2318'}K</span>
      </button>

      <div className={styles.right}>
        <span className={styles.tenantName}>{t('header.tenantName')}</span>

        <div className={styles.langWrapper} ref={langRef}>
          <button
            className={styles.langBtn}
            onClick={() => setShowLangDropdown(!showLangDropdown)}
          >
            {currentLocaleInfo?.flag} {locale.toUpperCase()}
          </button>
          {showLangDropdown && (
            <div className={styles.dropdown}>
              {SUPPORTED_LOCALES.map((loc) => (
                <button
                  key={loc.code}
                  className={`${styles.dropdownItem} ${loc.code === locale ? styles.dropdownItemActive : ''}`}
                  onClick={() => {
                    setLocale(loc.code as Locale);
                    setShowLangDropdown(false);
                  }}
                >
                  {loc.flag} {loc.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className={styles.iconBtn} title={t('header.notifications')}>
          {'\u2611'}
          {notificationCount > 0 && (
            <span className={styles.notifBadge}>{notificationCount}</span>
          )}
        </button>

        <button className={styles.iconBtn} title={t('copilot.title')} onClick={toggleCopilot}>
          {'\u2728'}
        </button>

        <div className={styles.avatarWrapper} ref={dropdownRef}>
          <button
            className={styles.avatarBtn}
            style={{ backgroundColor: getRoleColor(user.role) }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {getUserInitials(user.name)}
          </button>

          {showDropdown && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem}>
                {'\u2616'} {t('header.profile')}
              </button>
              <button className={styles.dropdownItem}>
                {'\u2699'} {t('header.settings')}
              </button>
              <div className={styles.dropdownDivider} />
              <button
                className={styles.dropdownItem}
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
              >
                {'\u2190'} {t('header.signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
