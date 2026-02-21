'use client';

import { useState, useEffect } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { Skeleton } from '@/components/ui';
import styles from './admin.module.css';

/* ---------- Mock Data ---------- */
const kpis = [
  { labelKey: 'admin.dashboard.totalTenants', value: '48', sub: '+3 this month', direction: 'up' as const },
  { labelKey: 'admin.dashboard.totalUsers', value: '2,847', sub: '312 active today', direction: 'up' as const },
  { labelKey: 'admin.dashboard.apiRequests24h', value: '1.24M', sub: '+8.3% vs yesterday', direction: 'up' as const },
  { labelKey: 'admin.dashboard.systemHealth', value: '99.7%', statusDot: 'green' as const, sub: 'All systems operational', direction: 'up' as const },
  { labelKey: 'admin.dashboard.storageUsed', value: '342 GB', sub: '68% of 500 GB', direction: 'neutral' as const },
  { labelKey: 'admin.dashboard.activeSessions', value: '312', sub: '-18 from peak', direction: 'down' as const },
];

const recentActivity = [
  { id: '1', text: 'Tenant "NordicTech AB" created by admin Sarah Chen', user: 'Sarah Chen', time: '3 min ago', color: '#165DFF' },
  { id: '2', text: 'User role changed: mike.j@acme.com promoted to Admin', user: 'Kevin Owens', time: '8 min ago', color: '#FF9A2E' },
  { id: '3', text: 'Feature flag "ai_copilot_v2" enabled globally', user: 'Sarah Chen', time: '15 min ago', color: '#23C343' },
  { id: '4', text: 'Tenant "Demo Corp" suspended — non-payment', user: 'System', time: '22 min ago', color: '#F53F3F' },
  { id: '5', text: 'Plan upgrade: CloudHost Services (Starter -> Professional)', user: 'Kevin Owens', time: '35 min ago', color: '#23C343' },
  { id: '6', text: 'Bulk password reset executed for tenant "BigRetail Inc"', user: 'Sarah Chen', time: '48 min ago', color: '#FF7D00' },
  { id: '7', text: 'API rate limit increased for tenant "FinanceHub" (10K -> 25K/hr)', user: 'System', time: '1 hr ago', color: '#165DFF' },
  { id: '8', text: 'Audit log export completed (Jan 2026 — 14,832 entries)', user: 'Kevin Owens', time: '1.5 hr ago', color: '#86909C' },
  { id: '9', text: 'New admin user invited: ops@medius.cloud', user: 'Sarah Chen', time: '2 hr ago', color: '#165DFF' },
  { id: '10', text: 'Database maintenance window completed (0 downtime)', user: 'System', time: '2.5 hr ago', color: '#23C343' },
];

const systemAlerts = [
  {
    id: 'alert1',
    severity: 'critical' as const,
    title: 'Payment Gateway Elevated Latency',
    description: 'Stripe API response times averaging 340ms (threshold: 200ms). Monitoring closely.',
    time: '12 min ago',
  },
  {
    id: 'alert2',
    severity: 'warning' as const,
    title: 'Storage Usage Approaching Limit',
    description: 'Platform storage at 68% capacity. Consider expanding allocation before 80% threshold.',
    time: '1 hr ago',
  },
  {
    id: 'alert3',
    severity: 'warning' as const,
    title: 'Matching Agent Queue Depth High',
    description: 'Agent queue depth at 67/100. Processing rate below normal — investigate backlog.',
    time: '2 hr ago',
  },
  {
    id: 'alert4',
    severity: 'info' as const,
    title: 'SSL Certificate Renewal Scheduled',
    description: 'Certificate for api.medius.cloud expires in 30 days. Auto-renewal configured.',
    time: '3 hr ago',
  },
];

const quickActions = [
  { icon: '\u2795', labelKey: 'admin.dashboard.createTenant', color: '#165DFF' },
  { icon: '\u2709', labelKey: 'admin.dashboard.inviteUser', color: '#23C343' },
  { icon: '\u2630', labelKey: 'admin.dashboard.viewLogs', color: '#8E51DA' },
  { icon: '\u2699', labelKey: 'admin.dashboard.toggleMaintenance', color: '#FF7D00' },
];

const resourceUsage = [
  { label: 'CPU', used: 34, total: 100, unit: '%', pct: 34, color: '#165DFF' },
  { label: 'Memory', used: 12.4, total: 20, unit: 'GB', pct: 62, color: '#8E51DA' },
  { label: 'Storage', used: 342, total: 500, unit: 'GB', pct: 68, color: '#FF9A2E' },
  { label: 'Network', used: 340, total: 1000, unit: 'Mbps', pct: 34, color: '#14C9C9' },
];

export default function AdminDashboardPage() {
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
          <Skeleton width={280} height={28} />
          <Skeleton width={200} height={16} />
        </div>
        <div className={styles.kpiGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.kpiCard}>
              <Skeleton width={100} height={12} />
              <Skeleton width={80} height={28} />
              <Skeleton width={60} height={12} />
            </div>
          ))}
        </div>
        <div className={styles.sectionGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}><Skeleton width={140} height={16} /></div>
            <div className={styles.cardBody}>
              <Skeleton width="100%" height={120} />
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}><Skeleton width={140} height={16} /></div>
            <div className={styles.cardBody}>
              <Skeleton width="100%" height={120} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{t('admin.dashboard.title')}</h1>
        <p className={styles.subtitle}>{t('admin.dashboard.subtitle')}</p>
      </div>

      {/* KPI Row */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <div key={kpi.labelKey} className={styles.kpiCard}>
            <div className={styles.kpiLabel}>{t(kpi.labelKey)}</div>
            <div className={styles.kpiValue}>
              {kpi.value}
              {kpi.statusDot && (
                <span
                  className={`${styles.kpiStatusDot} ${
                    kpi.statusDot === 'green' ? styles.kpiStatusDotGreen : styles.kpiStatusDotYellow
                  }`}
                  style={{ marginLeft: '8px' }}
                />
              )}
            </div>
            <span
              className={`${styles.kpiSub} ${
                kpi.direction === 'up'
                  ? styles.kpiSubUp
                  : kpi.direction === 'down'
                  ? styles.kpiSubDown
                  : styles.kpiSubNeutral
              }`}
            >
              {kpi.direction === 'up' ? '\u2191' : kpi.direction === 'down' ? '\u2193' : '\u2022'} {kpi.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Recent Activity + System Alerts */}
      <div className={styles.sectionGrid}>
        {/* Recent Activity Feed */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.dashboard.recentActivity')}</span>
            <span className={styles.cardBadge}>{t('admin.dashboard.last10')}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.activityList}>
              {recentActivity.map((item, index) => (
                <div key={item.id} className={styles.activityItem}>
                  <div className={styles.activityDotWrapper}>
                    <span className={styles.activityDot} style={{ backgroundColor: item.color }} />
                    {index < recentActivity.length - 1 && <span className={styles.activityLine} />}
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>{item.text}</div>
                    <div className={styles.activityMeta}>
                      <span className={styles.activityUser}>{item.user}</span>
                      <span className={styles.activityTime}>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.dashboard.systemAlerts')}</span>
            <span className={`${styles.cardBadge} ${styles.cardBadgeWarning}`}>
              {systemAlerts.filter((a) => a.severity === 'critical').length} {t('admin.dashboard.critical')}
            </span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.alertList}>
              {systemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`${styles.alertItem} ${
                    alert.severity === 'critical'
                      ? styles.alertItemCritical
                      : alert.severity === 'warning'
                      ? styles.alertItemWarning
                      : styles.alertItemInfo
                  }`}
                >
                  <span className={styles.alertIcon}>
                    {alert.severity === 'critical' ? '\u26A0' : alert.severity === 'warning' ? '\u26A0' : '\u2139'}
                  </span>
                  <div className={styles.alertContent}>
                    <div className={styles.alertTitle}>{alert.title}</div>
                    <div className={styles.alertDescription}>{alert.description}</div>
                    <div className={styles.alertTime}>{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions + Resource Utilization */}
      <div className={styles.sectionGrid}>
        {/* Quick Actions */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.dashboard.quickActions')}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.quickActions}>
              {quickActions.map((action) => (
                <button key={action.labelKey} className={styles.quickActionBtn} type="button">
                  <span className={styles.quickActionIcon} style={{ color: action.color }}>{action.icon}</span>
                  <span className={styles.quickActionLabel}>{t(action.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resource Utilization */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.dashboard.resourceUtilization')}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.resourceList}>
              {resourceUsage.map((resource) => (
                <div key={resource.label} className={styles.resourceItem}>
                  <div className={styles.resourceHeader}>
                    <span className={styles.resourceLabel}>{resource.label}</span>
                    <span className={styles.resourceValue}>
                      {resource.used}{resource.unit === '%' ? '%' : ` ${resource.unit}`} / {resource.total}{resource.unit === '%' ? '%' : ` ${resource.unit}`}
                    </span>
                  </div>
                  <div className={styles.resourceBar}>
                    <div
                      className={styles.resourceBarFill}
                      style={{
                        width: `${resource.pct}%`,
                        backgroundColor: resource.pct > 80 ? '#F53F3F' : resource.pct > 60 ? '#FF9A2E' : resource.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
