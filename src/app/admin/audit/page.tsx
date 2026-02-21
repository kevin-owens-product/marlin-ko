'use client';

import { useState, useMemo, useEffect } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { Button, Skeleton } from '@/components/ui';
import styles from './audit.module.css';

/* ---------- Types ---------- */
type Severity = 'info' | 'warning' | 'error' | 'critical';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  userColor: string;
  tenant: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ip: string;
  severity: Severity;
  metadata: Record<string, unknown>;
}

/* ---------- Mock Data ---------- */
const mockEntries: AuditEntry[] = [
  {
    id: 'a1', timestamp: '2026-02-21 14:52:03', user: 'Sarah Chen', userColor: '#165DFF', tenant: 'Platform',
    action: 'CREATE', entity: 'Tenant', entityId: 'TEN-048', details: 'Created tenant "NordicTech AB" with Professional plan',
    ip: '192.168.1.105', severity: 'info',
    metadata: { tenant_name: 'NordicTech AB', plan: 'Professional', admin_email: 'admin@nordictech.se', slug: 'nordictech' },
  },
  {
    id: 'a2', timestamp: '2026-02-21 14:48:17', user: 'Kevin Owens', userColor: '#8E51DA', tenant: 'Acme Corporation',
    action: 'UPDATE', entity: 'User', entityId: 'USR-003', details: 'Role changed: User -> Admin for mike.j@acme.com',
    ip: '192.168.1.100', severity: 'warning',
    metadata: { user_email: 'mike.j@acme.com', old_role: 'User', new_role: 'Admin', reason: 'Promotion approved by CTO' },
  },
  {
    id: 'a3', timestamp: '2026-02-21 14:45:22', user: 'Sarah Chen', userColor: '#165DFF', tenant: 'Platform',
    action: 'UPDATE', entity: 'FeatureFlag', entityId: 'FF-ai_copilot_v2', details: 'Feature flag "ai_copilot_v2" enabled globally',
    ip: '192.168.1.105', severity: 'info',
    metadata: { flag_key: 'ai_copilot_v2', old_status: false, new_status: true, affected_tenants: 48 },
  },
  {
    id: 'a4', timestamp: '2026-02-21 14:42:11', user: 'System', userColor: '#86909C', tenant: 'Demo Corp',
    action: 'SUSPEND', entity: 'Tenant', entityId: 'TEN-005', details: 'Tenant "Demo Corp" auto-suspended: payment overdue 30+ days',
    ip: 'system', severity: 'error',
    metadata: { reason: 'payment_overdue', days_overdue: 34, outstanding_amount: '$299.00', auto_action: true },
  },
  {
    id: 'a5', timestamp: '2026-02-21 14:38:45', user: 'Kevin Owens', userColor: '#8E51DA', tenant: 'CloudHost Services',
    action: 'UPDATE', entity: 'Subscription', entityId: 'SUB-003', details: 'Plan upgraded: Starter -> Professional for CloudHost Services',
    ip: '192.168.1.100', severity: 'info',
    metadata: { old_plan: 'Starter', new_plan: 'Professional', effective_date: '2026-02-21', prorated_charge: '$149.50' },
  },
  {
    id: 'a6', timestamp: '2026-02-21 14:35:00', user: 'Sarah Chen', userColor: '#165DFF', tenant: 'BigRetail Inc',
    action: 'UPDATE', entity: 'User', entityId: 'USR-BATCH', details: 'Bulk password reset: 198 users in BigRetail Inc',
    ip: '192.168.1.105', severity: 'warning',
    metadata: { affected_users: 198, reason: 'security_policy', notification_sent: true, force_change: true },
  },
  {
    id: 'a7', timestamp: '2026-02-21 14:30:22', user: 'System', userColor: '#86909C', tenant: 'GlobalLogistics Inc',
    action: 'CONFIG', entity: 'RateLimit', entityId: 'RL-004', details: 'API rate limit increased: 10K -> 25K req/hr for GlobalLogistics',
    ip: 'system', severity: 'info',
    metadata: { old_limit: 10000, new_limit: 25000, reason: 'usage_growth', approved_by: 'kevin.owens@medius.cloud' },
  },
  {
    id: 'a8', timestamp: '2026-02-21 14:25:00', user: 'Kevin Owens', userColor: '#8E51DA', tenant: 'Platform',
    action: 'EXPORT', entity: 'AuditLog', entityId: 'EXP-0134', details: 'Audit log export: January 2026 (14,832 entries, CSV)',
    ip: '192.168.1.100', severity: 'info',
    metadata: { format: 'CSV', date_range: '2026-01-01 to 2026-01-31', entry_count: 14832, file_size: '4.2 MB' },
  },
  {
    id: 'a9', timestamp: '2026-02-21 14:20:45', user: 'Sarah Chen', userColor: '#165DFF', tenant: 'Platform',
    action: 'CREATE', entity: 'User', entityId: 'USR-INV-013', details: 'Admin invite sent to ops@medius.cloud (Super Admin)',
    ip: '192.168.1.105', severity: 'info',
    metadata: { email: 'ops@medius.cloud', role: 'Super Admin', invited_by: 'sarah.chen@medius.cloud' },
  },
  {
    id: 'a10', timestamp: '2026-02-21 14:15:33', user: 'System', userColor: '#86909C', tenant: 'Platform',
    action: 'CONFIG', entity: 'Database', entityId: 'DB-MAINT-021', details: 'Scheduled database maintenance completed (0 downtime)',
    ip: 'system', severity: 'info',
    metadata: { type: 'vacuum_analyze', tables_processed: 142, duration_ms: 45230, downtime: 0 },
  },
  {
    id: 'a11', timestamp: '2026-02-21 14:10:00', user: 'Kevin Owens', userColor: '#8E51DA', tenant: 'Platform',
    action: 'UPDATE', entity: 'FeatureFlag', entityId: 'FF-treasury_module', details: 'Feature flag "treasury_module" restricted: min plan set to Enterprise',
    ip: '192.168.1.100', severity: 'warning',
    metadata: { flag_key: 'treasury_module', old_min_plan: 'Professional', new_min_plan: 'Enterprise', affected_tenants: 4 },
  },
  {
    id: 'a12', timestamp: '2026-02-21 14:05:12', user: 'Sarah Chen', userColor: '#165DFF', tenant: 'StartupXYZ',
    action: 'DELETE', entity: 'Tenant', entityId: 'TEN-DELETED-007', details: 'Tenant "OldCo" deleted per customer GDPR deletion request',
    ip: '192.168.1.105', severity: 'critical',
    metadata: { tenant_name: 'OldCo', reason: 'gdpr_deletion_request', data_purged: true, backup_retained_days: 30, ticket: 'SUP-4521' },
  },
  {
    id: 'a13', timestamp: '2026-02-21 14:00:00', user: 'System', userColor: '#86909C', tenant: 'Platform',
    action: 'CONFIG', entity: 'SSL', entityId: 'SSL-RENEW-003', details: 'SSL certificate renewed for api.medius.cloud (valid until 2027-02-21)',
    ip: 'system', severity: 'info',
    metadata: { domain: 'api.medius.cloud', issuer: "Let's Encrypt", valid_until: '2027-02-21', auto_renewed: true },
  },
  {
    id: 'a14', timestamp: '2026-02-21 13:55:44', user: 'Kevin Owens', userColor: '#8E51DA', tenant: 'Acme Corporation',
    action: 'IMPERSONATE', entity: 'Session', entityId: 'SESS-IMP-089', details: 'Admin impersonation: viewing tenant "Acme Corp" as mike.j@acme.com',
    ip: '192.168.1.100', severity: 'warning',
    metadata: { impersonator: 'kevin.owens@medius.cloud', target_user: 'mike.j@acme.com', target_tenant: 'Acme Corporation', session_duration: '12 min' },
  },
  {
    id: 'a15', timestamp: '2026-02-21 13:50:00', user: 'Sarah Chen', userColor: '#165DFF', tenant: 'Platform',
    action: 'CONFIG', entity: 'System', entityId: 'SYS-CFG-042', details: 'System config updated: max_upload_size changed from 25MB to 50MB',
    ip: '192.168.1.105', severity: 'info',
    metadata: { key: 'max_upload_size', old_value: '25MB', new_value: '50MB', scope: 'global' },
  },
  {
    id: 'a16', timestamp: '2026-02-21 13:45:22', user: 'System', userColor: '#86909C', tenant: 'Platform',
    action: 'CONFIG', entity: 'Webhook', entityId: 'WH-VERIFY-014', details: 'Webhook endpoint verified for tenant "GlobalLogistics" (200 OK)',
    ip: 'system', severity: 'info',
    metadata: { tenant: 'GlobalLogistics Inc', endpoint: 'https://api.globallogistics.com/webhooks/medius', response_code: 200, latency_ms: 145 },
  },
  {
    id: 'a17', timestamp: '2026-02-21 13:40:00', user: 'System', userColor: '#86909C', tenant: 'Platform',
    action: 'CONFIG', entity: 'Failover', entityId: 'FO-TEST-007', details: 'Payment gateway failover test completed — backup gateway active in 2.3s',
    ip: 'system', severity: 'info',
    metadata: { primary: 'Stripe', backup: 'Adyen', failover_time_ms: 2340, test_result: 'pass', transactions_tested: 5 },
  },
  {
    id: 'a18', timestamp: '2026-02-21 13:35:17', user: 'Kevin Owens', userColor: '#8E51DA', tenant: 'MedTech Solutions',
    action: 'UPDATE', entity: 'Subscription', entityId: 'SUB-009', details: 'Plan downgraded: Enterprise -> Professional for MedTech Solutions',
    ip: '192.168.1.100', severity: 'warning',
    metadata: { old_plan: 'Enterprise', new_plan: 'Professional', effective_date: '2026-03-01', features_removed: ['Treasury', 'SCF', 'Agent Studio'] },
  },
  {
    id: 'a19', timestamp: '2026-02-21 13:30:00', user: 'System', userColor: '#86909C', tenant: 'Platform',
    action: 'CONFIG', entity: 'Cache', entityId: 'CACHE-PURGE-019', details: 'CDN cache purge executed across 12 edge nodes',
    ip: 'system', severity: 'info',
    metadata: { edge_nodes: 12, purge_scope: 'global', reason: 'deployment', cache_keys_invalidated: 8420 },
  },
  {
    id: 'a20', timestamp: '2026-02-21 13:25:00', user: 'System', userColor: '#86909C', tenant: 'FreshFoods Inc',
    action: 'CREATE', entity: 'Tenant', entityId: 'TEN-048', details: 'Self-service signup: "FreshFoods Inc" registered on Free plan',
    ip: '203.0.113.45', severity: 'info',
    metadata: { tenant_name: 'FreshFoods Inc', plan: 'Free', signup_source: 'website', admin_email: 'admin@freshfoods.com' },
  },
  {
    id: 'a21', timestamp: '2026-02-21 13:15:00', user: 'System', userColor: '#86909C', tenant: 'Platform',
    action: 'LOGIN', entity: 'User', entityId: 'USR-001', details: 'Failed login attempt (5th) for admin@oldco.com — account locked',
    ip: '198.51.100.77', severity: 'error',
    metadata: { email: 'admin@oldco.com', failed_attempts: 5, lockout_duration: '30 min', reason: 'invalid_password' },
  },
  {
    id: 'a22', timestamp: '2026-02-21 13:10:00', user: 'Sarah Chen', userColor: '#165DFF', tenant: 'Platform',
    action: 'DELETE', entity: 'User', entityId: 'USR-DEACT-018', details: 'User deactivated: robert.t@bigretail.com (inactive 14+ days)',
    ip: '192.168.1.105', severity: 'warning',
    metadata: { user_email: 'robert.t@bigretail.com', last_login: '2026-02-07', tenant: 'BigRetail Inc', reason: 'inactivity' },
  },
  {
    id: 'a23', timestamp: '2026-02-21 13:00:00', user: 'System', userColor: '#86909C', tenant: 'Platform',
    action: 'CONFIG', entity: 'Deployment', entityId: 'DEPLOY-v2.14.3', details: 'Production deployment: v2.14.3 rolled out (canary -> full)',
    ip: 'system', severity: 'info',
    metadata: { version: '2.14.3', strategy: 'canary', canary_duration: '30 min', rollback_available: true, changes: 14 },
  },
  {
    id: 'a24', timestamp: '2026-02-21 12:45:00', user: 'System', userColor: '#86909C', tenant: 'GlobalLogistics Inc',
    action: 'UPDATE', entity: 'Security', entityId: 'SEC-ALERT-003', details: 'Suspicious API pattern detected: 12,000 requests in 60s from single IP',
    ip: '198.51.100.200', severity: 'critical',
    metadata: { source_ip: '198.51.100.200', request_count: 12000, time_window: '60s', action_taken: 'ip_blocked', tenant: 'GlobalLogistics Inc' },
  },
  {
    id: 'a25', timestamp: '2026-02-21 12:30:00', user: 'Kevin Owens', userColor: '#8E51DA', tenant: 'Platform',
    action: 'LOGIN', entity: 'User', entityId: 'USR-002', details: 'Super Admin login from new device (Firefox on Windows)',
    ip: '192.168.1.100', severity: 'info',
    metadata: { browser: 'Firefox 124', os: 'Windows 11', device_type: 'Desktop', new_device: true, mfa_verified: true },
  },
];

const actionClassMap: Record<string, string> = {
  CREATE: styles.actionCreate,
  UPDATE: styles.actionUpdate,
  DELETE: styles.actionDelete,
  LOGIN: styles.actionLogin,
  EXPORT: styles.actionExport,
  CONFIG: styles.actionConfig,
  APPROVE: styles.actionApprove,
  REJECT: styles.actionReject,
  SUSPEND: styles.actionSuspend,
  IMPERSONATE: styles.actionImpersonate,
};

const severityClassMap: Record<Severity, string> = {
  info: styles.severityInfo,
  warning: styles.severityWarning,
  error: styles.severityError,
  critical: styles.severityCritical,
};

const actionOptions = [
  'All Actions', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT', 'CONFIG', 'SUSPEND', 'IMPERSONATE',
];

const entityOptions = [
  'All Entities', 'Tenant', 'User', 'FeatureFlag', 'Subscription', 'System', 'AuditLog',
  'Database', 'SSL', 'RateLimit', 'Webhook', 'Cache', 'Deployment', 'Session', 'Security', 'Failover',
];

const tenantOptions = [
  'All Tenants', 'Platform', 'Acme Corporation', 'NordicTech AB', 'GlobalLogistics Inc',
  'BigRetail Inc', 'CloudHost Services', 'Demo Corp', 'MedTech Solutions', 'StartupXYZ', 'FreshFoods Inc',
];

const userOptions = [
  'All Users', 'Sarah Chen', 'Kevin Owens', 'System',
];

export default function AuditPage() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [entityFilter, setEntityFilter] = useState('All Entities');
  const [tenantFilter, setTenantFilter] = useState('All Tenants');
  const [userFilter, setUserFilter] = useState('All Users');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return mockEntries.filter((entry) => {
      if (actionFilter !== 'All Actions' && entry.action !== actionFilter) return false;
      if (entityFilter !== 'All Entities' && entry.entity !== entityFilter) return false;
      if (tenantFilter !== 'All Tenants' && entry.tenant !== tenantFilter) return false;
      if (userFilter !== 'All Users' && entry.user !== userFilter) return false;
      if (dateFrom && entry.timestamp < dateFrom) return false;
      if (dateTo && entry.timestamp > dateTo + ' 23:59:59') return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          entry.user.toLowerCase().includes(q) ||
          entry.details.toLowerCase().includes(q) ||
          entry.entityId.toLowerCase().includes(q) ||
          entry.tenant.toLowerCase().includes(q) ||
          entry.action.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, actionFilter, entityFilter, tenantFilter, userFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const newEventsCount = 5;

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerInfo}>
              <Skeleton width={240} height={28} />
              <Skeleton width={300} height={16} />
            </div>
          </div>
        </div>
        <div className={styles.tableCard}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Skeleton width={130} height={14} />
              <Skeleton width={80} height={14} />
              <Skeleton width={90} height={14} />
              <Skeleton width={60} height={20} />
              <Skeleton width={80} height={14} />
              <Skeleton width={200} height={14} />
              <Skeleton width={90} height={14} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{t('admin.audit.title')}</h1>
            <p className={styles.subtitle}>{t('admin.audit.subtitle')}</p>
          </div>
          <div className={styles.newEventsBadge}>
            <span className={styles.newEventsDot} />
            {newEventsCount} {t('admin.audit.newEvents')}
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={() => {}}>
            {t('admin.audit.exportCsv')}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder={t('admin.audit.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
        <input
          type="date"
          className={styles.dateInput}
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
          aria-label={t('admin.audit.dateFrom')}
        />
        <input
          type="date"
          className={styles.dateInput}
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
          aria-label={t('admin.audit.dateTo')}
        />
        <select className={styles.filterSelect} value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }}>
          {userOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select className={styles.filterSelect} value={tenantFilter} onChange={(e) => { setTenantFilter(e.target.value); setCurrentPage(1); }}>
          {tenantOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select className={styles.filterSelect} value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}>
          {actionOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select className={styles.filterSelect} value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setCurrentPage(1); }}>
          {entityOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('admin.audit.timestamp')}</th>
              <th>{t('admin.audit.user')}</th>
              <th>{t('admin.audit.tenant')}</th>
              <th>{t('admin.audit.action')}</th>
              <th>{t('admin.audit.entity')}</th>
              <th>{t('admin.audit.details')}</th>
              <th>{t('admin.audit.ip')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', cursor: 'default' }}>
                  {t('admin.audit.noResults')}
                </td>
              </tr>
            ) : (
              paginated.map((entry) => (
                <>
                  <tr
                    key={entry.id}
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedId(expandedId === entry.id ? null : entry.id);
                      }
                    }}
                  >
                    <td>
                      <span className={styles.timestamp}>{entry.timestamp}</span>
                    </td>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.userDot} style={{ backgroundColor: entry.userColor }} />
                        <span className={styles.userName}>{entry.user}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.tenantName}>{entry.tenant}</span>
                    </td>
                    <td>
                      <span className={`${styles.actionBadge} ${actionClassMap[entry.action] || styles.actionConfig}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td>
                      <span className={styles.entity}>{entry.entity} / {entry.entityId}</span>
                    </td>
                    <td>
                      <div>
                        <span className={styles.details}>{entry.details}</span>
                        <div style={{ marginTop: '2px' }}>
                          <span className={`${styles.severityBadge} ${severityClassMap[entry.severity]}`}>
                            {entry.severity}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.ip}>{entry.ip}</span>
                    </td>
                  </tr>
                  {expandedId === entry.id && (
                    <tr key={`${entry.id}-expanded`} className={styles.expandedRow}>
                      <td colSpan={7}>
                        <div className={styles.expandedContent}>
                          <div className={styles.detailTitle}>
                            {t('admin.audit.fullDetail')} - {entry.action} {entry.entity} ({entry.entityId})
                          </div>
                          <pre className={styles.detailJson}>
                            {JSON.stringify(
                              {
                                id: entry.id,
                                timestamp: entry.timestamp,
                                actor: entry.user,
                                tenant: entry.tenant,
                                action: entry.action,
                                entity_type: entry.entity,
                                entity_id: entry.entityId,
                                severity: entry.severity,
                                source_ip: entry.ip,
                                description: entry.details,
                                metadata: entry.metadata,
                              },
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            {t('admin.audit.showing', {
              start: String(Math.min((currentPage - 1) * pageSize + 1, filtered.length)),
              end: String(Math.min(currentPage * pageSize, filtered.length)),
              total: String(filtered.length),
            })}
          </div>
          <div className={styles.pageControls}>
            <button
              className={styles.pageBtn}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              type="button"
            >
              {'\u00AB'}
            </button>
            <button
              className={styles.pageBtn}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              type="button"
            >
              {'\u2039'}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageBtn} ${page === currentPage ? styles.pageBtnActive : ''}`}
                onClick={() => setCurrentPage(page)}
                type="button"
              >
                {page}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              type="button"
            >
              {'\u203A'}
            </button>
            <button
              className={styles.pageBtn}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              type="button"
            >
              {'\u00BB'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
