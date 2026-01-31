"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/i18n/locale-context';
import styles from './Sidebar.module.css';
import {
  DashboardIcon,
  ActivityIcon,
  InvoiceIcon,
  ApprovalIcon,
  MatchingIcon,
  CodingIcon,
  PaymentsIcon,
  DiscountingIcon,
  VirtualCardsIcon,
  SupplyChainIcon,
  ExpensesIcon,
  CashFlowIcon,
  TreasuryIcon,
  PurchaseOrderIcon,
  ContractsIcon,
  SupplierDirectoryIcon,
  SupplierPortalIcon,
  ConversationsIcon,
  RiskMonitorIcon,
  NetworkMapIcon,
  OnboardingPipelineIcon,
  PerformanceIcon,
  DiversityIcon,
  AnalyticsIcon,
  BenchmarksIcon,
  ReportsIcon,
  CopilotIcon,
  AgentStudioIcon,
  RiskDashboardIcon,
  ComplianceIcon,
  CpoPortalIcon,
  SettingsIcon,
  AuditIcon,
  OnboardingIcon,
  ChevronRightIcon,
  CollapseLeftIcon,
  CollapseRightIcon,
} from './icons';

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  badgeType?: 'default' | 'warning' | 'error' | 'new';
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: 'nav.overview',
    items: [
      { labelKey: 'nav.dashboard', href: '/', icon: DashboardIcon },
      { labelKey: 'nav.activityFeed', href: '/activity', icon: ActivityIcon },
    ],
  },
  {
    labelKey: 'nav.accountsPayable',
    items: [
      { labelKey: 'nav.invoices', href: '/invoices', icon: InvoiceIcon, badge: '23', badgeType: 'default' },
      { labelKey: 'nav.approvals', href: '/approvals', icon: ApprovalIcon, badge: '5', badgeType: 'warning' },
      { labelKey: 'nav.poMatching', href: '/matching', icon: MatchingIcon },
      { labelKey: 'nav.aiCoding', href: '/coding', icon: CodingIcon },
    ],
  },
  {
    labelKey: 'nav.finance',
    items: [
      { labelKey: 'nav.payments', href: '/payments', icon: PaymentsIcon },
      { labelKey: 'nav.dynamicDiscounting', href: '/discounting', icon: DiscountingIcon, badge: 'NEW', badgeType: 'new' },
      { labelKey: 'nav.virtualCards', href: '/virtual-cards', icon: VirtualCardsIcon, badge: 'NEW', badgeType: 'new' },
      { labelKey: 'nav.supplyChainFinance', href: '/scf', icon: SupplyChainIcon, badge: 'NEW', badgeType: 'new' },
      { labelKey: 'nav.expenses', href: '/expenses', icon: ExpensesIcon },
      { labelKey: 'nav.cashFlow', href: '/cashflow', icon: CashFlowIcon },
      { labelKey: 'nav.treasury', href: '/treasury', icon: TreasuryIcon, badge: 'NEW', badgeType: 'new' },
    ],
  },
  {
    labelKey: 'nav.procurement',
    items: [
      { labelKey: 'nav.purchaseOrders', href: '/purchase-orders', icon: PurchaseOrderIcon },
      { labelKey: 'nav.contracts', href: '/contracts', icon: ContractsIcon },
    ],
  },
  {
    labelKey: 'nav.suppliers',
    items: [
      { labelKey: 'nav.supplierDirectory', href: '/suppliers', icon: SupplierDirectoryIcon },
      { labelKey: 'nav.supplierPortal', href: '/supplier-portal', icon: SupplierPortalIcon, badge: 'NEW', badgeType: 'new' },
      { labelKey: 'nav.conversations', href: '/suppliers/conversations', icon: ConversationsIcon },
      { labelKey: 'nav.riskMonitor', href: '/suppliers/risk', icon: RiskMonitorIcon },
      { labelKey: 'nav.networkMap', href: '/suppliers/network', icon: NetworkMapIcon, badge: 'NEW', badgeType: 'new' as const },
      { labelKey: 'nav.onboardingPipeline', href: '/suppliers/onboarding', icon: OnboardingPipelineIcon, badge: 'NEW', badgeType: 'new' as const },
      { labelKey: 'nav.performanceScores', href: '/suppliers/performance', icon: PerformanceIcon, badge: 'NEW', badgeType: 'new' as const },
      { labelKey: 'nav.diversityEsg', href: '/suppliers/diversity', icon: DiversityIcon, badge: 'NEW', badgeType: 'new' as const },
    ],
  },
  {
    labelKey: 'nav.intelligence',
    items: [
      { labelKey: 'nav.analytics', href: '/analytics', icon: AnalyticsIcon },
      { labelKey: 'nav.benchmarks', href: '/benchmarks', icon: BenchmarksIcon, badge: 'NEW', badgeType: 'new' },
      { labelKey: 'nav.reports', href: '/reports', icon: ReportsIcon },
      { labelKey: 'nav.aiCopilot', href: '/copilot', icon: CopilotIcon },
    ],
  },
  {
    labelKey: 'nav.aiAutomation',
    items: [
      { labelKey: 'nav.agentStudio', href: '/agent-studio', icon: AgentStudioIcon, badge: 'NEW', badgeType: 'new' },
      { labelKey: 'nav.riskDashboard', href: '/risk-dashboard', icon: RiskDashboardIcon, badge: 'NEW', badgeType: 'new' },
      { labelKey: 'nav.complianceHub', href: '/compliance', icon: ComplianceIcon, badge: 'NEW', badgeType: 'new' },
    ],
  },
  {
    labelKey: 'nav.cpoStrategy',
    items: [
      { labelKey: 'nav.cpoPortal', href: '/cpo', icon: CpoPortalIcon, badge: 'NEW', badgeType: 'new' },
    ],
  },
  {
    labelKey: 'nav.admin',
    items: [
      { labelKey: 'nav.settings', href: '/settings', icon: SettingsIcon },
      { labelKey: 'nav.auditLog', href: '/audit', icon: AuditIcon },
      { labelKey: 'nav.onboarding', href: '/onboarding', icon: OnboardingIcon, badge: 'NEW', badgeType: 'new' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, getUserInitials, getRoleLabel, getRoleColor } = useAuth();
  const t = useT();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (labelKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(labelKey)) {
        next.delete(labelKey);
      } else {
        next.add(labelKey);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  if (!user) return null;

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>
          <span>M</span>
        </div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Medius</span>
            <span className={styles.logoSubtitle}>{t('nav.apAutomation')}</span>
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        {NAV_GROUPS.map((group) => {
          const isGroupCollapsed = collapsedGroups.has(group.labelKey);
          const groupLabel = t(group.labelKey);
          return (
            <div key={group.labelKey} className={styles.group}>
              {!collapsed && (
                <button
                  className={styles.groupHeader}
                  onClick={() => toggleGroup(group.labelKey)}
                >
                  <span className={styles.groupLabel}>{groupLabel}</span>
                  <span
                    className={`${styles.groupChevron} ${
                      !isGroupCollapsed ? styles.groupChevronOpen : ''
                    }`}
                  >
                    <ChevronRightIcon size={12} />
                  </span>
                </button>
              )}
              <div
                className={`${styles.groupItems} ${
                  isGroupCollapsed && !collapsed ? styles.groupItemsCollapsed : ''
                }`}
              >
                {group.items.map((item) => {
                  const IconComponent = item.icon;
                  const itemLabel = t(item.labelKey);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.navLink} ${
                        isActive(item.href) ? styles.navLinkActive : ''
                      }`}
                      title={collapsed ? itemLabel : undefined}
                    >
                      <span className={styles.navIcon}>
                        <IconComponent size={18} />
                      </span>
                      {!collapsed && (
                        <>
                          <span className={styles.navLabel}>{itemLabel}</span>
                          {item.badge && (
                            <span
                              className={`${styles.badge} ${
                                item.badgeType === 'warning'
                                  ? styles.badgeWarning
                                  : item.badgeType === 'error'
                                  ? styles.badgeError
                                  : item.badgeType === 'new'
                                  ? styles.badgeNew
                                  : ''
                              }`}
                            >
                              {item.badgeType === 'new' ? t('common.new') : item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userSection} onClick={logout}>
          <div
            className={styles.userAvatar}
            style={{ backgroundColor: getRoleColor(user.role) }}
          >
            {getUserInitials(user.name)}
          </div>
          {!collapsed && (
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>{getRoleLabel(user.role)}</div>
            </div>
          )}
        </div>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
        >
          {collapsed ? <CollapseRightIcon size={16} /> : <CollapseLeftIcon size={16} />}
        </button>
      </div>
    </aside>
  );
}
