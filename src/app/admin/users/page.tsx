'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { Button, Modal, Input, Select, Skeleton } from '@/components/ui';
import styles from './users.module.css';

/* ---------- Types ---------- */
interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'APPROVER' | 'AP_CLERK' | 'VIEWER';
  tenant: string;
  tenantSlug: string;
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string;
  twoFactorEnabled: boolean;
  avatarColor: string;
}

/* ---------- Mock Data ---------- */
const mockUsers: UserRecord[] = [
  { id: 'u1', name: 'Sarah Chen', email: 'sarah.chen@medius.cloud', role: 'ADMIN', tenant: 'Platform', tenantSlug: 'platform', lastLogin: '2 min ago', status: 'Active', twoFactorEnabled: true, avatarColor: '#165DFF' },
  { id: 'u2', name: 'Kevin Owens', email: 'kevin.owens@medius.cloud', role: 'ADMIN', tenant: 'Platform', tenantSlug: 'platform', lastLogin: '12 min ago', status: 'Active', twoFactorEnabled: true, avatarColor: '#8E51DA' },
  { id: 'u3', name: 'Michael Johnson', email: 'mike.j@acme.com', role: 'ADMIN', tenant: 'Acme Corporation', tenantSlug: 'acme-corp', lastLogin: '25 min ago', status: 'Active', twoFactorEnabled: true, avatarColor: '#23C343' },
  { id: 'u4', name: 'Emma Wilson', email: 'emma.w@nordictech.se', role: 'APPROVER', tenant: 'NordicTech AB', tenantSlug: 'nordictech', lastLogin: '1 hr ago', status: 'Active', twoFactorEnabled: true, avatarColor: '#FF9A2E' },
  { id: 'u5', name: 'James Park', email: 'james.park@globallogistics.com', role: 'ADMIN', tenant: 'GlobalLogistics Inc', tenantSlug: 'globallogistics', lastLogin: '3 hr ago', status: 'Active', twoFactorEnabled: false, avatarColor: '#14C9C9' },
  { id: 'u6', name: 'Lisa Martinez', email: 'lisa.m@bigretail.com', role: 'AP_CLERK', tenant: 'BigRetail Inc', tenantSlug: 'bigretail', lastLogin: '5 hr ago', status: 'Active', twoFactorEnabled: false, avatarColor: '#F53F3F' },
  { id: 'u7', name: 'David Kim', email: 'david.k@cloudhost.io', role: 'APPROVER', tenant: 'CloudHost Services', tenantSlug: 'cloudhost', lastLogin: '1 day ago', status: 'Active', twoFactorEnabled: true, avatarColor: '#722ED1' },
  { id: 'u8', name: 'Anna Bergstrom', email: 'anna.b@nordictech.se', role: 'VIEWER', tenant: 'NordicTech AB', tenantSlug: 'nordictech', lastLogin: '3 days ago', status: 'Active', twoFactorEnabled: false, avatarColor: '#FF7D00' },
  { id: 'u9', name: 'Tom Richards', email: 'tom.r@financehub.co', role: 'ADMIN', tenant: 'FinanceHub Ltd', tenantSlug: 'financehub', lastLogin: '2 hr ago', status: 'Active', twoFactorEnabled: true, avatarColor: '#00B42A' },
  { id: 'u10', name: 'Maria Santos', email: 'maria.s@acme.com', role: 'AP_CLERK', tenant: 'Acme Corporation', tenantSlug: 'acme-corp', lastLogin: 'Never', status: 'Pending', twoFactorEnabled: false, avatarColor: '#86909C' },
  { id: 'u11', name: 'Robert Taylor', email: 'robert.t@bigretail.com', role: 'APPROVER', tenant: 'BigRetail Inc', tenantSlug: 'bigretail', lastLogin: '14 days ago', status: 'Inactive', twoFactorEnabled: false, avatarColor: '#C9CDD4' },
  { id: 'u12', name: 'Yuki Tanaka', email: 'yuki.t@startupxyz.com', role: 'ADMIN', tenant: 'StartupXYZ', tenantSlug: 'startupxyz', lastLogin: '4 hr ago', status: 'Active', twoFactorEnabled: true, avatarColor: '#165DFF' },
  { id: 'u13', name: 'Carlos Mendez', email: 'carlos.m@freshfoods.com', role: 'VIEWER', tenant: 'FreshFoods Inc', tenantSlug: 'freshfoods', lastLogin: '6 hr ago', status: 'Active', twoFactorEnabled: false, avatarColor: '#23C343' },
  { id: 'u14', name: 'Sophie Laurent', email: 'sophie.l@fastship.io', role: 'AP_CLERK', tenant: 'FastShip International', tenantSlug: 'fastship', lastLogin: '2 days ago', status: 'Active', twoFactorEnabled: false, avatarColor: '#FF9A2E' },
  { id: 'u15', name: 'Henrik Johansson', email: 'henrik.j@techparts.co', role: 'APPROVER', tenant: 'TechParts Ltd', tenantSlug: 'techparts', lastLogin: '8 hr ago', status: 'Active', twoFactorEnabled: true, avatarColor: '#8E51DA' },
];

const roleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Approver', value: 'APPROVER' },
  { label: 'AP Clerk', value: 'AP_CLERK' },
  { label: 'Viewer', value: 'VIEWER' },
];

const tenantOptions = [
  { label: 'All Tenants', value: 'all' },
  { label: 'Platform', value: 'Platform' },
  { label: 'Acme Corporation', value: 'Acme Corporation' },
  { label: 'NordicTech AB', value: 'NordicTech AB' },
  { label: 'GlobalLogistics Inc', value: 'GlobalLogistics Inc' },
  { label: 'BigRetail Inc', value: 'BigRetail Inc' },
  { label: 'CloudHost Services', value: 'CloudHost Services' },
  { label: 'FinanceHub Ltd', value: 'FinanceHub Ltd' },
  { label: 'StartupXYZ', value: 'StartupXYZ' },
  { label: 'FreshFoods Inc', value: 'FreshFoods Inc' },
  { label: 'FastShip International', value: 'FastShip International' },
  { label: 'TechParts Ltd', value: 'TechParts Ltd' },
];

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Pending', value: 'Pending' },
];

const roleClassMap: Record<string, string> = {
  ADMIN: styles.roleAdmin,
  APPROVER: styles.roleApprover,
  AP_CLERK: styles.roleClerk,
  VIEWER: styles.roleViewer,
};

const roleLabelMap: Record<string, string> = {
  ADMIN: 'Admin',
  APPROVER: 'Approver',
  AP_CLERK: 'AP Clerk',
  VIEWER: 'Viewer',
};

const statusClassMap: Record<string, string> = {
  Active: styles.statusActive,
  Inactive: styles.statusInactive,
  Pending: styles.statusPending,
};

export default function UsersPage() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form state
  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('AP_CLERK');
  const [formTenant, setFormTenant] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return mockUsers.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (tenantFilter !== 'all' && user.tenant !== tenantFilter) return false;
      if (statusFilter !== 'all' && user.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.tenant.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, roleFilter, tenantFilter, statusFilter]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((u) => u.id)));
    }
  }, [filtered, selectedIds.size]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const handleCreateSubmit = () => {
    setCreateModalOpen(false);
    setFormEmail('');
    setFormName('');
    setFormRole('AP_CLERK');
    setFormTenant('');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Skeleton width={220} height={28} />
            <Skeleton width={280} height={16} />
          </div>
        </div>
        <div className={styles.tableCard}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Skeleton width={16} height={16} />
              <Skeleton width={32} height={32} variant="circle" />
              <Skeleton width={120} height={14} />
              <Skeleton width={60} height={14} />
              <Skeleton width={100} height={14} />
              <Skeleton width={70} height={14} />
              <Skeleton width={40} height={14} />
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
          <h1 className={styles.title}>{t('admin.users.title')}</h1>
          <p className={styles.subtitle}>{t('admin.users.subtitle')}</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={() => {}}>
            {t('admin.users.export')}
          </Button>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            {t('admin.users.createUser')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder={t('admin.users.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.filterSelect} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          {roleOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)}>
          {tenantOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>
            {selectedIds.size} {t('admin.users.selected')}
          </span>
          <div className={styles.bulkActions}>
            <button className={`${styles.bulkBtn} ${styles.bulkBtnDanger}`} type="button">
              {t('admin.users.deactivateSelected')}
            </button>
            <button className={styles.bulkBtn} type="button">
              {t('admin.users.exportSelected')}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>{t('admin.users.name')}</th>
              <th>{t('admin.users.role')}</th>
              <th>{t('admin.users.tenant')}</th>
              <th>{t('admin.users.status')}</th>
              <th>{t('admin.users.lastLogin')}</th>
              <th>{t('admin.users.twoFactor')}</th>
              <th>{t('admin.users.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                  {t('admin.users.noResults')}
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedIds.has(user.id)}
                      onChange={() => toggleSelect(user.id)}
                    />
                  </td>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar} style={{ backgroundColor: user.avatarColor }}>
                        {getInitials(user.name)}
                      </div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.roleBadge} ${roleClassMap[user.role] || styles.roleViewer}`}>
                      {roleLabelMap[user.role] || user.role}
                    </span>
                  </td>
                  <td>
                    <span className={styles.tenantLink}>{user.tenant}</span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusClassMap[user.status] || styles.statusActive}`}>
                      <span className={styles.statusDot} />
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <span className={styles.lastLogin}>{user.lastLogin}</span>
                  </td>
                  <td>
                    {user.twoFactorEnabled ? (
                      <span className={styles.tfaEnabled}>
                        <span className={styles.tfaDot} />
                        {t('admin.users.enabled')}
                      </span>
                    ) : (
                      <span className={styles.tfaDisabled}>
                        <span className={styles.tfaDot} />
                        {t('admin.users.disabled')}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button className={styles.actionBtn} type="button">
                        {t('admin.users.edit')}
                      </button>
                      <button className={styles.actionBtn} type="button">
                        {t('admin.users.resetPassword')}
                      </button>
                      <button className={styles.actionBtn} type="button">
                        {t('admin.users.impersonate')}
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} type="button">
                        {user.status === 'Active' ? t('admin.users.deactivate') : t('admin.users.activate')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            {t('admin.users.showing', { count: String(filtered.length), total: String(mockUsers.length) })}
          </div>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn} disabled type="button">{'\u2039'}</button>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`} type="button">1</button>
            <button className={styles.pageBtn} disabled type="button">{'\u203A'}</button>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t('admin.users.createUser')}
        size="md"
        footer={
          <div className={styles.formActions}>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              {t('admin.common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleCreateSubmit}>
              {t('admin.users.createUser')}
            </Button>
          </div>
        }
      >
        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <Input
              label={t('admin.users.emailLabel')}
              type="email"
              placeholder="user@company.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
            />
            <Input
              label={t('admin.users.nameLabel')}
              placeholder="Full Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formRow}>
            <Select
              label={t('admin.users.roleLabel')}
              options={[
                { label: 'Admin', value: 'ADMIN' },
                { label: 'Approver', value: 'APPROVER' },
                { label: 'AP Clerk', value: 'AP_CLERK' },
                { label: 'Viewer', value: 'VIEWER' },
              ]}
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              required
            />
            <Select
              label={t('admin.users.tenantLabel')}
              placeholder={t('admin.users.selectTenant')}
              options={tenantOptions.filter((o) => o.value !== 'all')}
              value={formTenant}
              onChange={(e) => setFormTenant(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
