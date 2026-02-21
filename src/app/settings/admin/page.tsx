'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/locale-context';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import styles from './admin.module.css';

/* ---------- Navigation Items ---------- */

const NAV_ITEMS = [
  {
    key: 'users',
    path: '/settings/admin/users',
    icon: '\u{1F465}',
    titleKey: 'tenantAdmin.navTeamMembers',
    descKey: 'tenantAdmin.navTeamMembersDesc',
    badge: '12',
  },
  {
    key: 'branding',
    path: '/settings/admin/branding',
    icon: '\u{1F3A8}',
    titleKey: 'tenantAdmin.navBranding',
    descKey: 'tenantAdmin.navBrandingDesc',
    badge: null,
  },
  {
    key: 'webhooks',
    path: '/settings/admin/webhooks',
    icon: '\u{1F517}',
    titleKey: 'tenantAdmin.navWebhooks',
    descKey: 'tenantAdmin.navWebhooksDesc',
    badge: '3',
  },
  {
    key: 'apiKeys',
    path: '/settings/admin/api-keys',
    icon: '\u{1F511}',
    titleKey: 'tenantAdmin.navApiKeys',
    descKey: 'tenantAdmin.navApiKeysDesc',
    badge: '4',
  },
  {
    key: 'notifications',
    path: '/settings/admin/notifications',
    icon: '\u{1F514}',
    titleKey: 'tenantAdmin.navNotifications',
    descKey: 'tenantAdmin.navNotificationsDesc',
    badge: null,
  },
  {
    key: 'export',
    path: '/settings/admin/data-export',
    icon: '\u{1F4E5}',
    titleKey: 'tenantAdmin.navDataExport',
    descKey: 'tenantAdmin.navDataExportDesc',
    badge: null,
  },
];

/* ---------- Quick Setup Checklist ---------- */

interface ChecklistItem {
  labelKey: string;
  status: 'done' | 'partial' | 'pending';
  progress?: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { labelKey: 'tenantAdmin.checklist.approvalWorkflows', status: 'done' },
  { labelKey: 'tenantAdmin.checklist.erpIntegration', status: 'done' },
  { labelKey: 'tenantAdmin.checklist.inviteTeam', status: 'partial', progress: '3/10' },
  { labelKey: 'tenantAdmin.checklist.configureBranding', status: 'pending' },
  { labelKey: 'tenantAdmin.checklist.setupWebhooks', status: 'pending' },
  { labelKey: 'tenantAdmin.checklist.generateApiKeys', status: 'pending' },
];

/* ---------- Activity Feed ---------- */

interface ActivityItem {
  id: string;
  textKey: string;
  textParams?: Record<string, string | number>;
  time: string;
  dotColor: 'Blue' | 'Green' | 'Orange' | 'Red';
}

const ACTIVITY_FEED: ActivityItem[] = [
  {
    id: 'a1',
    textKey: 'tenantAdmin.activity.userInvited',
    textParams: { name: 'Sarah Johnson', email: 'new.hire@medius.com' },
    time: '5 min ago',
    dotColor: 'Blue',
  },
  {
    id: 'a2',
    textKey: 'tenantAdmin.activity.webhookCreated',
    textParams: { url: 'api.erp-system.com' },
    time: '1 hour ago',
    dotColor: 'Green',
  },
  {
    id: 'a3',
    textKey: 'tenantAdmin.activity.roleChanged',
    textParams: { name: 'Marcus Chen', role: 'Approver' },
    time: '3 hours ago',
    dotColor: 'Orange',
  },
  {
    id: 'a4',
    textKey: 'tenantAdmin.activity.apiKeyRevoked',
    textParams: { keyName: 'Legacy Integration' },
    time: '1 day ago',
    dotColor: 'Red',
  },
  {
    id: 'a5',
    textKey: 'tenantAdmin.activity.brandingUpdated',
    time: '2 days ago',
    dotColor: 'Blue',
  },
  {
    id: 'a6',
    textKey: 'tenantAdmin.activity.exportCompleted',
    textParams: { type: 'Invoices', format: 'CSV' },
    time: '3 days ago',
    dotColor: 'Green',
  },
];

/* ---------- Plan Usage ---------- */

interface UsageMeter {
  labelKey: string;
  used: number;
  limit: number;
  unit: string;
}

const USAGE_METERS: UsageMeter[] = [
  { labelKey: 'tenantAdmin.usage.invoicesProcessed', used: 18420, limit: 25000, unit: '' },
  { labelKey: 'tenantAdmin.usage.activeUsers', used: 8, limit: 25, unit: '' },
  { labelKey: 'tenantAdmin.usage.storageUsed', used: 1.8, limit: 5, unit: 'GB' },
  { labelKey: 'tenantAdmin.usage.apiCallsMonth', used: 34892, limit: 100000, unit: '' },
];

/* ---------- Component ---------- */

export default function TenantAdminPage() {
  const t = useT();
  const router = useRouter();
  const [checklist] = useState<ChecklistItem[]>(CHECKLIST_ITEMS);

  const completedCount = checklist.filter((c) => c.status === 'done').length;
  const totalCount = checklist.length;

  const getUsageVariant = (ratio: number): 'default' | 'success' | 'warning' | 'danger' => {
    if (ratio >= 0.9) return 'danger';
    if (ratio >= 0.75) return 'warning';
    return 'default';
  };

  const getUsageBarClass = (ratio: number): string => {
    if (ratio >= 0.9) return styles.usageBarDanger;
    if (ratio >= 0.75) return styles.usageBarWarning;
    return styles.usageBarDefault;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) return num.toLocaleString();
    return String(num);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backLink} onClick={() => router.push('/settings')}>
          &#8592; {t('tenantAdmin.backToSettings')}
        </button>
        <h1 className={styles.headerTitle}>{t('tenantAdmin.title')}</h1>
        <p className={styles.headerSubtitle}>{t('tenantAdmin.subtitle')}</p>
      </div>

      {/* Summary Stats */}
      <div className={styles.statsRow}>
        <StatCard
          title={t('tenantAdmin.stats.totalUsers')}
          value="12"
          icon={<span>&#128101;</span>}
          trend={{ direction: 'up', value: '+2 this month' }}
        />
        <StatCard
          title={t('tenantAdmin.stats.activeIntegrations')}
          value="4"
          variant="success"
          icon={<span>&#128279;</span>}
        />
        <StatCard
          title={t('tenantAdmin.stats.webhookEvents24h')}
          value="847"
          icon={<span>&#128228;</span>}
          trend={{ direction: 'up', value: '+12%' }}
        />
        <StatCard
          title={t('tenantAdmin.stats.apiCalls24h')}
          value="2,341"
          icon={<span>&#128200;</span>}
          trend={{ direction: 'down', value: '-5%' }}
        />
      </div>

      {/* Navigation Grid */}
      <div className={styles.navGrid}>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.key}
            className={styles.navCard}
            onClick={() => router.push(item.path)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push(item.path);
              }
            }}
            tabIndex={0}
            role="link"
            aria-label={t(item.titleKey)}
          >
            <div className={styles.navCardIcon}>{item.icon}</div>
            <div className={styles.navCardContent}>
              <div className={styles.navCardTitle}>
                {t(item.titleKey)}
                {item.badge && <span className={styles.navCardBadge}>{item.badge}</span>}
              </div>
              <div className={styles.navCardDesc}>{t(item.descKey)}</div>
            </div>
            <span className={styles.navCardArrow} aria-hidden="true">&#8250;</span>
          </div>
        ))}
      </div>

      {/* Main Content: Checklist + Activity + Usage */}
      <div className={styles.content}>
        <div className={styles.mainColumn}>
          {/* Quick Setup Checklist */}
          <div className={styles.card}>
            <div className={styles.cardTitleRow}>
              <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>
                {t('tenantAdmin.checklist.title')}
              </h2>
              <span className={styles.cardSubtitle}>
                {completedCount}/{totalCount} {t('tenantAdmin.checklist.completed')}
              </span>
            </div>
            <ProgressBar
              value={completedCount}
              max={totalCount}
              variant={completedCount === totalCount ? 'success' : 'default'}
              size="sm"
              animated
            />
            <div style={{ marginTop: 'var(--space-4)' }}>
              {checklist.map((item, index) => (
                <div key={index} className={styles.checklistItem}>
                  <span
                    className={`${styles.checkIcon} ${
                      item.status === 'done'
                        ? styles.checkIconDone
                        : item.status === 'partial'
                        ? styles.checkIconPartial
                        : styles.checkIconPending
                    }`}
                  >
                    {item.status === 'done' ? '\u2713' : item.status === 'partial' ? '\u00B7' : ''}
                  </span>
                  <span
                    className={`${styles.checklistLabel} ${
                      item.status === 'done' ? styles.checklistLabelDone : ''
                    }`}
                  >
                    {t(item.labelKey)}
                  </span>
                  {item.progress && (
                    <span className={styles.checklistProgress}>{item.progress}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Admin Activity */}
          <div className={styles.card}>
            <div className={styles.cardTitleRow}>
              <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>
                {t('tenantAdmin.activity.title')}
              </h2>
              <button className={styles.viewAllLink}>
                {t('tenantAdmin.activity.viewAll')} &#8250;
              </button>
            </div>
            <div className={styles.activityFeed}>
              {ACTIVITY_FEED.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <span
                    className={`${styles.activityDot} ${
                      styles[`activityDot${activity.dotColor}`]
                    }`}
                  />
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>
                      {t(activity.textKey, activity.textParams)}
                    </div>
                    <div className={styles.activityTime}>{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Plan Usage */}
        <div className={styles.sidebar}>
          <div className={styles.card}>
            <div className={styles.cardTitleRow}>
              <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>
                {t('tenantAdmin.usage.title')}
              </h2>
              <span className={styles.planBadge}>Enterprise</span>
            </div>
            <div className={styles.usageSection}>
              {USAGE_METERS.map((meter) => {
                const ratio = meter.used / meter.limit;
                return (
                  <div key={meter.labelKey} className={styles.usageItem}>
                    <div className={styles.usageHeader}>
                      <span className={styles.usageLabel}>{t(meter.labelKey)}</span>
                      <span className={styles.usageValue}>
                        {formatNumber(meter.used)}
                        {meter.unit ? ` ${meter.unit}` : ''} / {formatNumber(meter.limit)}
                        {meter.unit ? ` ${meter.unit}` : ''}
                      </span>
                    </div>
                    <div className={styles.usageBar}>
                      <div
                        className={`${styles.usageBarFill} ${getUsageBarClass(ratio)}`}
                        style={{ width: `${Math.min(100, ratio * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Organization Info */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t('tenantAdmin.orgInfo')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
                  {t('tenantAdmin.orgName')}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Medius Corp
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
                  {t('tenantAdmin.plan')}
                </span>
                <span className={styles.planBadge}>Enterprise</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
                  {t('tenantAdmin.createdDate')}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  March 15, 2023
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
                  {t('tenantAdmin.memberCount')}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  12 {t('tenantAdmin.members')}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-1)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-accent)' }}>24,847</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{t('tenantAdmin.invoicesProcessed')}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-accent)' }}>1.8 GB</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{t('tenantAdmin.storageUsed')}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-accent)' }}>99.7%</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{t('tenantAdmin.uptime')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
