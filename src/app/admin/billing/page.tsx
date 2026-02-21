'use client';

import { useState, useEffect } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { Skeleton } from '@/components/ui';
import styles from './billing.module.css';

/* ---------- Mock Data ---------- */
const revenueKpis = [
  { labelKey: 'admin.billing.mrr', value: '$84,230', sub: '+12.4% vs last month', direction: 'up' as const },
  { labelKey: 'admin.billing.arr', value: '$1.01M', sub: 'Annualized revenue', direction: 'up' as const },
  { labelKey: 'admin.billing.activeSubscriptions', value: '46', sub: '+3 new this month', direction: 'up' as const },
  { labelKey: 'admin.billing.churnRate', value: '1.8%', sub: '-0.3% vs last month', direction: 'down' as const },
];

const planDistribution = [
  { plan: 'Free', count: 8, pct: 17, color: '#86909C' },
  { plan: 'Starter', count: 14, pct: 29, color: '#165DFF' },
  { plan: 'Professional', count: 18, pct: 38, color: '#722ED1' },
  { plan: 'Enterprise', count: 8, pct: 17, color: '#FF7D00' },
];

interface BillingTenant {
  id: string;
  name: string;
  plan: 'Free' | 'Starter' | 'Professional' | 'Enterprise';
  billingStatus: 'active' | 'past_due' | 'trial' | 'free';
  users: number;
  usagePct: number;
  amount: string;
  nextBilling: string;
}

const billingTenants: BillingTenant[] = [
  { id: 'b1', name: 'GlobalLogistics Inc', plan: 'Enterprise', billingStatus: 'active', users: 312, usagePct: 85, amount: '$4,999', nextBilling: '2026-03-01' },
  { id: 'b2', name: 'Acme Corporation', plan: 'Enterprise', billingStatus: 'active', users: 245, usagePct: 72, amount: '$4,999', nextBilling: '2026-03-01' },
  { id: 'b3', name: 'BigRetail Inc', plan: 'Enterprise', billingStatus: 'active', users: 198, usagePct: 68, amount: '$4,999', nextBilling: '2026-03-15' },
  { id: 'b4', name: 'NordicTech AB', plan: 'Professional', billingStatus: 'active', users: 87, usagePct: 56, amount: '$1,499', nextBilling: '2026-03-01' },
  { id: 'b5', name: 'CloudHost Services', plan: 'Professional', billingStatus: 'active', users: 62, usagePct: 48, amount: '$1,499', nextBilling: '2026-03-10' },
  { id: 'b6', name: 'FinanceHub Ltd', plan: 'Professional', billingStatus: 'active', users: 45, usagePct: 42, amount: '$1,499', nextBilling: '2026-03-05' },
  { id: 'b7', name: 'MedTech Solutions', plan: 'Professional', billingStatus: 'active', users: 34, usagePct: 35, amount: '$1,499', nextBilling: '2026-03-12' },
  { id: 'b8', name: 'FastShip International', plan: 'Starter', billingStatus: 'active', users: 22, usagePct: 44, amount: '$299', nextBilling: '2026-03-01' },
  { id: 'b9', name: 'TechParts Ltd', plan: 'Starter', billingStatus: 'active', users: 15, usagePct: 30, amount: '$299', nextBilling: '2026-03-08' },
  { id: 'b10', name: 'StartupXYZ', plan: 'Starter', billingStatus: 'trial', users: 8, usagePct: 16, amount: '$0', nextBilling: '2026-03-12' },
  { id: 'b11', name: 'Demo Corp', plan: 'Starter', billingStatus: 'past_due', users: 3, usagePct: 6, amount: '$299', nextBilling: 'Overdue' },
  { id: 'b12', name: 'FreshFoods Inc', plan: 'Free', billingStatus: 'free', users: 2, usagePct: 5, amount: '$0', nextBilling: '-' },
];

const planClassMap: Record<string, string> = {
  Free: styles.planFree,
  Starter: styles.planStarter,
  Professional: styles.planProfessional,
  Enterprise: styles.planEnterprise,
};

const billingStatusClassMap: Record<string, string> = {
  active: styles.billingStatusActive,
  past_due: styles.billingStatusPastDue,
  trial: styles.billingStatusTrial,
  free: styles.billingStatusFree,
};

const billingStatusLabelMap: Record<string, string> = {
  active: 'Active',
  past_due: 'Past Due',
  trial: 'Trial',
  free: 'Free',
};

const planComparison = [
  { feature: 'Users', free: '1', starter: '5', professional: '25', enterprise: 'Unlimited' },
  { feature: 'Invoices / month', free: '100', starter: '1,000', professional: '10,000', enterprise: 'Unlimited' },
  { feature: 'Basic AP Automation', free: true, starter: true, professional: true, enterprise: true },
  { feature: 'Approval Workflows', free: false, starter: true, professional: true, enterprise: true },
  { feature: 'Dynamic Discounting', free: false, starter: false, professional: true, enterprise: true },
  { feature: 'Advanced Analytics', free: false, starter: false, professional: true, enterprise: true },
  { feature: 'Supply Chain Finance', free: false, starter: false, professional: true, enterprise: true },
  { feature: 'AI Copilot', free: false, starter: false, professional: true, enterprise: true },
  { feature: 'Virtual Cards', free: false, starter: false, professional: false, enterprise: true },
  { feature: 'Treasury Management', free: false, starter: false, professional: false, enterprise: true },
  { feature: 'SSO / SAML', free: false, starter: false, professional: true, enterprise: true },
  { feature: 'API Access', free: false, starter: true, professional: true, enterprise: true },
  { feature: 'Priority Support', free: false, starter: false, professional: true, enterprise: true },
  { feature: 'Dedicated CSM', free: false, starter: false, professional: false, enterprise: true },
];

export default function BillingPage() {
  const t = useT();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Skeleton width={280} height={28} />
            <Skeleton width={200} height={16} />
          </div>
        </div>
        <div className={styles.revenueGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.revenueCard}>
              <Skeleton width={100} height={12} />
              <Skeleton width={80} height={28} />
              <Skeleton width={120} height={12} />
            </div>
          ))}
        </div>
        <div className={styles.sectionGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}><Skeleton width={160} height={16} /></div>
            <div className={styles.cardBody}><Skeleton width="100%" height={120} /></div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}><Skeleton width={160} height={16} /></div>
            <div className={styles.cardBody}><Skeleton width="100%" height={120} /></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{t('admin.billing.title')}</h1>
          <p className={styles.subtitle}>{t('admin.billing.subtitle')}</p>
        </div>
      </div>

      {/* Revenue Overview KPIs */}
      <div className={styles.revenueGrid}>
        {revenueKpis.map((kpi) => (
          <div key={kpi.labelKey} className={styles.revenueCard}>
            <div className={styles.revenueLabel}>{t(kpi.labelKey)}</div>
            <div className={styles.revenueValue}>{kpi.value}</div>
            <span
              className={`${styles.revenueSub} ${
                kpi.direction === 'up' ? styles.revenueSubUp : kpi.direction === 'down' ? styles.revenueSubDown : styles.revenueSubNeutral
              }`}
            >
              {kpi.direction === 'up' ? '\u2191' : kpi.direction === 'down' ? '\u2193' : '\u2022'} {kpi.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Plan Distribution + Plan Comparison */}
      <div className={styles.sectionGrid}>
        {/* Plan Distribution Chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.billing.planDistribution')}</span>
            <span className={styles.cardBadge}>48 {t('admin.billing.totalTenants')}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.planChart}>
              {planDistribution.map((item) => (
                <div key={item.plan} className={styles.planChartRow}>
                  <span className={styles.planChartLabel}>{item.plan}</span>
                  <div className={styles.planChartBar}>
                    <div
                      className={styles.planChartBarFill}
                      style={{
                        width: `${item.pct}%`,
                        backgroundColor: item.color,
                      }}
                    >
                      <span className={styles.planChartBarText}>{item.pct}%</span>
                    </div>
                  </div>
                  <span className={styles.planChartCount}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan Comparison Matrix */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.billing.planComparison')}</span>
          </div>
          <div className={styles.cardBody} style={{ overflowX: 'auto' }}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>{t('admin.billing.feature')}</th>
                  <th>
                    <div className={styles.comparisonPlanHeader}>
                      <span className={styles.comparisonPlanName}>Free</span>
                      <span className={styles.comparisonPlanPrice}>$0/mo</span>
                    </div>
                  </th>
                  <th>
                    <div className={styles.comparisonPlanHeader}>
                      <span className={styles.comparisonPlanName}>Starter</span>
                      <span className={styles.comparisonPlanPrice}>$299/mo</span>
                    </div>
                  </th>
                  <th>
                    <div className={styles.comparisonPlanHeader}>
                      <span className={styles.comparisonPlanName}>Pro</span>
                      <span className={styles.comparisonPlanPrice}>$1,499/mo</span>
                    </div>
                  </th>
                  <th>
                    <div className={styles.comparisonPlanHeader}>
                      <span className={styles.comparisonPlanName}>Enterprise</span>
                      <span className={styles.comparisonPlanPrice}>$4,999/mo</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {planComparison.map((row) => (
                  <tr key={row.feature}>
                    <td>{row.feature}</td>
                    <td>{renderCell(row.free)}</td>
                    <td>{renderCell(row.starter)}</td>
                    <td>{renderCell(row.professional)}</td>
                    <td>{renderCell(row.enterprise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tenant Billing Table */}
      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{t('admin.billing.tenantBilling')}</span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('admin.billing.tenantCol')}</th>
              <th>{t('admin.billing.planCol')}</th>
              <th>{t('admin.billing.statusCol')}</th>
              <th>{t('admin.billing.usersCol')}</th>
              <th>{t('admin.billing.usageCol')}</th>
              <th>{t('admin.billing.amountCol')}</th>
              <th>{t('admin.billing.nextBillingCol')}</th>
              <th>{t('admin.billing.actionsCol')}</th>
            </tr>
          </thead>
          <tbody>
            {billingTenants.map((tenant) => (
              <tr key={tenant.id}>
                <td>
                  <span className={styles.tenantName}>{tenant.name}</span>
                </td>
                <td>
                  <span className={`${styles.planBadge} ${planClassMap[tenant.plan]}`}>
                    {tenant.plan}
                  </span>
                </td>
                <td>
                  <span className={`${styles.billingStatus} ${billingStatusClassMap[tenant.billingStatus]}`}>
                    <span className={styles.billingDot} />
                    {billingStatusLabelMap[tenant.billingStatus]}
                  </span>
                </td>
                <td>{tenant.users}</td>
                <td>
                  <span className={styles.usageBar}>
                    <span
                      className={styles.usageBarFill}
                      style={{
                        width: `${tenant.usagePct}%`,
                        backgroundColor: tenant.usagePct > 80 ? '#F53F3F' : tenant.usagePct > 60 ? '#FF9A2E' : '#165DFF',
                      }}
                    />
                  </span>
                  <span className={styles.usageText}>{tenant.usagePct}%</span>
                </td>
                <td>
                  <span className={styles.amount}>{tenant.amount}</span>
                </td>
                <td>
                  <span className={styles.nextBilling}>{tenant.nextBilling}</span>
                </td>
                <td>
                  <div className={styles.actionsCell}>
                    {tenant.plan !== 'Enterprise' && (
                      <button className={styles.actionBtn} type="button">
                        {t('admin.billing.upgrade')}
                      </button>
                    )}
                    {tenant.plan !== 'Free' && (
                      <button className={styles.actionBtn} type="button">
                        {t('admin.billing.downgrade')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            {t('admin.billing.showingAll', { total: String(billingTenants.length) })}
          </div>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn} disabled type="button">{'\u2039'}</button>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`} type="button">1</button>
            <button className={styles.pageBtn} disabled type="button">{'\u203A'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderCell(value: boolean | string) {
  if (typeof value === 'string') {
    return <span className={styles.featureValue}>{value}</span>;
  }
  return value ? (
    <span className={styles.checkMark}>{'\u2713'}</span>
  ) : (
    <span className={styles.dashMark}>{'\u2014'}</span>
  );
}
