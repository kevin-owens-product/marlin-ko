'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/locale-context';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import styles from './users.module.css';

/* ---------- Types ---------- */

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  twoFaEnabled: boolean;
  avatarUrl: string | null;
  permissions: string[];
  [key: string]: unknown;
}

interface PendingInvite {
  id: string;
  email: string;
  name: string;
  role: string;
  invitedOn: string;
}

/* ---------- Mock Data ---------- */

const MOCK_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.johnson@medius.com', role: 'ADMIN', status: 'active', lastLogin: '2 min ago', twoFaEnabled: true, avatarUrl: null, permissions: ['invoices', 'payments', 'suppliers', 'reports', 'settings'] },
  { id: '2', name: 'Marcus Chen', email: 'marcus.chen@medius.com', role: 'APPROVER', status: 'active', lastLogin: '15 min ago', twoFaEnabled: true, avatarUrl: null, permissions: ['invoices', 'payments', 'reports'] },
  { id: '3', name: 'Elena Rodriguez', email: 'elena.r@medius.com', role: 'AP_CLERK', status: 'active', lastLogin: '1 hour ago', twoFaEnabled: false, avatarUrl: null, permissions: ['invoices', 'suppliers'] },
  { id: '4', name: 'James Williams', email: 'j.williams@medius.com', role: 'APPROVER', status: 'active', lastLogin: '3 hours ago', twoFaEnabled: true, avatarUrl: null, permissions: ['invoices', 'payments', 'reports'] },
  { id: '5', name: 'Priya Patel', email: 'priya.patel@medius.com', role: 'AP_CLERK', status: 'active', lastLogin: 'Yesterday', twoFaEnabled: false, avatarUrl: null, permissions: ['invoices', 'suppliers'] },
  { id: '6', name: 'Thomas Anderson', email: 't.anderson@medius.com', role: 'VIEWER', status: 'active', lastLogin: '2 days ago', twoFaEnabled: false, avatarUrl: null, permissions: ['reports'] },
  { id: '7', name: 'Lisa Kim', email: 'lisa.kim@medius.com', role: 'AP_CLERK', status: 'active', lastLogin: 'Yesterday', twoFaEnabled: true, avatarUrl: null, permissions: ['invoices', 'suppliers'] },
  { id: '8', name: 'David Brown', email: 'd.brown@medius.com', role: 'VIEWER', status: 'inactive', lastLogin: '2 weeks ago', twoFaEnabled: false, avatarUrl: null, permissions: ['reports'] },
];

const MOCK_PENDING: PendingInvite[] = [
  { id: 'p1', email: 'new.hire@medius.com', name: 'New Hire', role: 'AP_CLERK', invitedOn: 'Feb 18, 2026' },
  { id: 'p2', email: 'contractor@external.com', name: 'External Contractor', role: 'VIEWER', invitedOn: 'Feb 15, 2026' },
  { id: 'p3', email: 'finance.lead@medius.com', name: 'Finance Lead', role: 'APPROVER', invitedOn: 'Feb 12, 2026' },
];

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Approver', value: 'APPROVER' },
  { label: 'AP Clerk', value: 'AP_CLERK' },
  { label: 'Viewer', value: 'VIEWER' },
];

const ALL_PERMISSIONS = [
  { key: 'invoices', label: 'Invoices' },
  { key: 'payments', label: 'Payments' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'contracts', label: 'Contracts' },
  { key: 'audit', label: 'Audit Logs' },
];

const roleLabelMap: Record<string, string> = {
  ADMIN: 'Admin',
  APPROVER: 'Approver',
  AP_CLERK: 'AP Clerk',
  VIEWER: 'Viewer',
};

const USER_LIMIT = 25;

/* ---------- Component ---------- */

export default function UsersPage() {
  const t = useT();
  const router = useRouter();
  const { addToast } = useToast();

  const [members, setMembers] = useState<TeamMember[]>(MOCK_MEMBERS);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(MOCK_PENDING);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /* Invite Modal */
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'VIEWER', message: '' });
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({});

  /* Edit Modal */
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', permissions: new Set<string>() });

  /* ---- Selection ---- */
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === members.length) return new Set();
      return new Set(members.map((m) => m.id));
    });
  }, [members]);

  /* ---- Invite ---- */
  const validateInvite = (): boolean => {
    const errors: Record<string, string> = {};
    if (!inviteForm.email.trim()) errors.email = t('tenantAdmin.users.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) errors.email = t('tenantAdmin.users.invalidEmail');
    if (!inviteForm.name.trim()) errors.name = t('tenantAdmin.users.nameRequired');
    setInviteErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendInvite = () => {
    if (!validateInvite()) return;
    setPendingInvites((prev) => [
      {
        id: `p${Date.now()}`,
        email: inviteForm.email,
        name: inviteForm.name,
        role: inviteForm.role,
        invitedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
      ...prev,
    ]);
    setInviteModalOpen(false);
    setInviteForm({ email: '', name: '', role: 'VIEWER', message: '' });
    setInviteErrors({});
    addToast({ type: 'success', title: t('tenantAdmin.users.inviteSent') });
  };

  /* ---- Edit Modal ---- */
  const openEditModal = useCallback((member: TeamMember) => {
    setEditingMember(member);
    setEditForm({
      name: member.name,
      email: member.email,
      role: member.role,
      permissions: new Set(member.permissions),
    });
    setEditModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingMember) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === editingMember.id
          ? { ...m, name: editForm.name, email: editForm.email, role: editForm.role, permissions: Array.from(editForm.permissions) }
          : m
      )
    );
    setEditModalOpen(false);
    setEditingMember(null);
    addToast({ type: 'success', title: t('tenantAdmin.users.memberUpdated') });
  }, [editingMember, editForm, addToast, t]);

  const togglePermission = useCallback((key: string) => {
    setEditForm((prev) => {
      const next = new Set(prev.permissions);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...prev, permissions: next };
    });
  }, []);

  /* ---- Actions ---- */
  const handleRoleChange = (id: string, newRole: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
    addToast({ type: 'success', title: t('tenantAdmin.users.roleUpdated') });
  };

  const handleDeactivate = (id: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'inactive' as const } : m)));
    addToast({ type: 'info', title: t('tenantAdmin.users.memberDeactivated') });
  };

  const handleActivate = (id: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'active' as const } : m)));
    addToast({ type: 'success', title: t('tenantAdmin.users.memberActivated') });
  };

  const handleRemove = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    addToast({ type: 'success', title: t('tenantAdmin.users.memberRemoved') });
  };

  const handleResendInvite = (id: string) => {
    void id;
    addToast({ type: 'success', title: t('tenantAdmin.users.inviteResent') });
  };

  const handleCancelInvite = (id: string) => {
    setPendingInvites((prev) => prev.filter((p) => p.id !== id));
    addToast({ type: 'info', title: t('tenantAdmin.users.inviteCancelled') });
  };

  const handleBulkDeactivate = () => {
    setMembers((prev) =>
      prev.map((m) => (selectedIds.has(m.id) ? { ...m, status: 'inactive' as const } : m))
    );
    setSelectedIds(new Set());
    addToast({ type: 'info', title: t('tenantAdmin.users.bulkDeactivated') });
  };

  const handleBulkRoleChange = (newRole: string) => {
    setMembers((prev) =>
      prev.map((m) => (selectedIds.has(m.id) ? { ...m, role: newRole } : m))
    );
    setSelectedIds(new Set());
    addToast({ type: 'success', title: t('tenantAdmin.users.roleUpdated') });
  };

  /* ---- Stats ---- */
  const activeCount = members.filter((m) => m.status === 'active').length;
  const twoFaCount = members.filter((m) => m.twoFaEnabled).length;

  /* ---- Table Columns ---- */
  const columns: DataTableColumn<TeamMember>[] = [
    {
      key: 'select',
      header: '',
      width: '40px',
      render: (_val, row) => (
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={selectedIds.has(row.id)}
          onChange={() => toggleSelect(row.id)}
          aria-label={`Select ${row.name}`}
        />
      ),
    },
    {
      key: 'name',
      header: t('tenantAdmin.users.name'),
      sortable: true,
      render: (_val, row) => (
        <div className={styles.userCell}>
          <Avatar name={row.name} size="sm" status={row.status === 'active' ? 'online' : row.status === 'inactive' ? 'offline' : undefined} />
          <div>
            <div className={styles.userName}>{row.name}</div>
            <div className={styles.userEmail}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: t('tenantAdmin.users.role'),
      sortable: true,
      render: (_val, row) => (
        <Select
          options={ROLE_OPTIONS}
          value={row.role}
          onChange={(e) => handleRoleChange(row.id, e.target.value)}
        />
      ),
    },
    {
      key: 'status',
      header: t('tenantAdmin.users.status'),
      sortable: true,
      render: (_val, row) => {
        if (row.status === 'active') {
          return <span className={styles.statusActive}><span className={styles.statusDot} />{t('common.active')}</span>;
        }
        if (row.status === 'pending') {
          return <span className={styles.statusPending}><span className={styles.statusDot} />{t('common.pending')}</span>;
        }
        return <span className={styles.statusInactive}><span className={styles.statusDot} />{t('common.inactive')}</span>;
      },
    },
    {
      key: 'lastLogin',
      header: t('tenantAdmin.users.lastLogin'),
      sortable: true,
      render: (val) => <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{String(val)}</span>,
    },
    {
      key: 'twoFaEnabled',
      header: t('tenantAdmin.users.twoFA'),
      width: '80px',
      render: (_val, row) => (
        <span className={`${styles.twofaBadge} ${row.twoFaEnabled ? styles.twofaEnabled : styles.twofaDisabled}`}>
          {row.twoFaEnabled ? '\u2713 On' : 'Off'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      render: (_val, row) => {
        const items: DropdownItem[] = [
          { label: t('tenantAdmin.users.editMember'), onClick: () => openEditModal(row) },
          { type: 'separator' },
        ];
        if (row.status === 'active') {
          items.push({ label: t('tenantAdmin.users.deactivate'), onClick: () => handleDeactivate(row.id) });
        } else {
          items.push({ label: t('tenantAdmin.users.activate'), onClick: () => handleActivate(row.id) });
        }
        items.push({ type: 'separator' });
        items.push({ label: t('tenantAdmin.users.remove'), onClick: () => handleRemove(row.id), danger: true });
        return (
          <Dropdown
            trigger={<span className={styles.actionDots}>&#8943;</span>}
            items={items}
            align="right"
          />
        );
      },
    },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backLink} onClick={() => router.push('/settings/admin')}>
            &#8592; {t('tenantAdmin.title')}
          </button>
          <h1 className={styles.headerTitle}>{t('tenantAdmin.users.title')}</h1>
          <p className={styles.headerSubtitle}>{t('tenantAdmin.users.subtitle')}</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.userLimit}>
            <span className={styles.userLimitCount}>{members.length}</span>
            {t('tenantAdmin.users.of')} {USER_LIMIT} {t('tenantAdmin.users.usersLabel')}
          </div>
          <Button
            variant="primary"
            icon={<span>+</span>}
            onClick={() => setInviteModalOpen(true)}
          >
            {t('tenantAdmin.users.inviteMember')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <StatCard title={t('tenantAdmin.users.totalMembers')} value={members.length} icon={<span>&#128101;</span>} />
        <StatCard title={t('tenantAdmin.users.activeMembers')} value={activeCount} variant="success" icon={<span>&#10003;</span>} />
        <StatCard title={t('tenantAdmin.users.pendingInvitations')} value={pendingInvites.length} variant="warning" icon={<span>&#9993;</span>} />
        <StatCard title={t('tenantAdmin.users.twoFAEnabled')} value={`${twoFaCount}/${members.length}`} icon={<span>&#128274;</span>} />
      </div>

      <div className={styles.content}>
        {/* Members Table */}
        <div className={styles.tableCard}>
          {selectedIds.size > 0 && (
            <div className={styles.tableHeader}>
              <div className={styles.tableHeaderLeft}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selectedIds.size === members.length}
                  onChange={toggleSelectAll}
                  aria-label="Select all members"
                />
                <span className={styles.selectedCount}>
                  {selectedIds.size} {t('tenantAdmin.users.selected')}
                </span>
              </div>
              <div className={styles.bulkActions}>
                <Button variant="ghost" size="sm" onClick={handleBulkDeactivate}>
                  {t('tenantAdmin.users.bulkDeactivate')}
                </Button>
                <Select
                  options={ROLE_OPTIONS}
                  placeholder={t('tenantAdmin.users.bulkChangeRole')}
                  value=""
                  onChange={(e) => handleBulkRoleChange(e.target.value)}
                />
              </div>
            </div>
          )}
          <DataTable<TeamMember>
            columns={columns}
            data={members}
            keyExtractor={(row) => row.id}
            searchable
            searchPlaceholder={t('tenantAdmin.users.searchPlaceholder')}
            searchKeys={['name', 'email', 'role']}
            pagination
            pageSize={10}
            emptyTitle={t('common.noData')}
            emptyDescription={t('tenantAdmin.users.subtitle')}
          />
        </div>

        {/* Pending Invitations */}
        {pendingInvites.length > 0 && (
          <div className={styles.pendingSection}>
            <h3 className={styles.pendingSectionTitle}>
              {t('tenantAdmin.users.pendingSection')} ({pendingInvites.length})
            </h3>
            <div className={styles.pendingList}>
              {pendingInvites.map((invite) => (
                <div key={invite.id} className={styles.pendingItem}>
                  <div className={styles.pendingInfo}>
                    <span className={styles.pendingEmail}>{invite.email}</span>
                    <span className={styles.pendingMeta}>
                      {roleLabelMap[invite.role] || invite.role} &middot; {t('tenantAdmin.users.invitedOn')} {invite.invitedOn}
                    </span>
                  </div>
                  <div className={styles.pendingActions}>
                    <Button variant="ghost" size="sm" onClick={() => handleResendInvite(invite.id)}>
                      {t('tenantAdmin.users.resendInvite')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleCancelInvite(invite.id)}>
                      {t('tenantAdmin.users.cancelInvite')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Role Descriptions */}
        <div className={styles.roleHelpPanel}>
          <h3 className={styles.roleHelpTitle}>{t('tenantAdmin.users.roleDescriptions')}</h3>
          <div className={styles.roleHelpList}>
            <div className={styles.roleHelpItem}>
              <div className={styles.roleHelpItemTitle}>{t('tenantAdmin.users.roleAdmin')}</div>
              <div className={styles.roleHelpItemDesc}>{t('tenantAdmin.users.roleAdminDesc')}</div>
            </div>
            <div className={styles.roleHelpItem}>
              <div className={styles.roleHelpItemTitle}>{t('tenantAdmin.users.roleApprover')}</div>
              <div className={styles.roleHelpItemDesc}>{t('tenantAdmin.users.roleApproverDesc')}</div>
            </div>
            <div className={styles.roleHelpItem}>
              <div className={styles.roleHelpItemTitle}>{t('tenantAdmin.users.roleApClerk')}</div>
              <div className={styles.roleHelpItemDesc}>{t('tenantAdmin.users.roleApClerkDesc')}</div>
            </div>
            <div className={styles.roleHelpItem}>
              <div className={styles.roleHelpItemTitle}>{t('tenantAdmin.users.roleViewer')}</div>
              <div className={styles.roleHelpItemDesc}>{t('tenantAdmin.users.roleViewerDesc')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        open={inviteModalOpen}
        onClose={() => { setInviteModalOpen(false); setInviteErrors({}); }}
        title={t('tenantAdmin.users.inviteTitle')}
        size="md"
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => { setInviteModalOpen(false); setInviteErrors({}); }}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSendInvite}>
              {t('tenantAdmin.users.sendInvite')}
            </Button>
          </div>
        }
      >
        <div className={styles.inviteForm}>
          <div className={styles.formRow}>
            <Input
              label={t('tenantAdmin.users.inviteEmail')}
              type="email"
              placeholder="email@example.com"
              value={inviteForm.email}
              onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
              error={inviteErrors.email}
              required
            />
            <Input
              label={t('tenantAdmin.users.inviteName')}
              placeholder="Full Name"
              value={inviteForm.name}
              onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))}
              error={inviteErrors.name}
              required
            />
          </div>
          <Select
            label={t('tenantAdmin.users.inviteRole')}
            options={ROLE_OPTIONS}
            value={inviteForm.role}
            onChange={(e) => setInviteForm((prev) => ({ ...prev, role: e.target.value }))}
            required
          />
          <div>
            <label className={styles.textareaLabel}>{t('tenantAdmin.users.inviteMessage')}</label>
            <textarea
              className={styles.textarea}
              placeholder={t('tenantAdmin.users.inviteMessagePlaceholder')}
              value={inviteForm.message}
              onChange={(e) => setInviteForm((prev) => ({ ...prev, message: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingMember(null); }}
        title={t('tenantAdmin.users.editMemberTitle')}
        size="md"
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => { setEditModalOpen(false); setEditingMember(null); }}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              {t('tenantAdmin.users.saveChanges')}
            </Button>
          </div>
        }
      >
        <div className={styles.editForm}>
          <div className={styles.formRow}>
            <Input
              label={t('tenantAdmin.users.name')}
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label={t('tenantAdmin.users.email')}
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <Select
            label={t('tenantAdmin.users.role')}
            options={ROLE_OPTIONS}
            value={editForm.role}
            onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
            required
          />
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' as unknown as number, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
              {t('tenantAdmin.users.permissions')}
            </div>
            <div className={styles.permissionsGrid}>
              {ALL_PERMISSIONS.map((perm) => (
                <label key={perm.key} className={styles.permissionCheckbox}>
                  <input
                    type="checkbox"
                    className={styles.permissionCheckboxInput}
                    checked={editForm.permissions.has(perm.key)}
                    onChange={() => togglePermission(perm.key)}
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
