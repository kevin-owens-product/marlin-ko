'use client';

import { useState, useCallback } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { useCRUD } from '@/lib/hooks/use-crud';
import { useInlineEdit } from '@/lib/hooks/use-inline-edit';
import { useToast } from '@/components/ui/Toast';
import { EditableCell } from '@/components/inline-edit/EditableCell';
import { RowActions } from '@/components/inline-edit/RowActions';
import styles from './settings.module.css';

/* ---------- Static data for non-CRUD tabs ---------- */

const erps = [
  { name: 'SAP S/4HANA', status: 'Connected', color: '#23C343', lastSync: '5 min ago', records: '12,847' },
  { name: 'Oracle NetSuite', status: 'Connected', color: '#23C343', lastSync: '12 min ago', records: '8,432' },
  { name: 'Dynamics 365', status: 'Connected', color: '#23C343', lastSync: '8 min ago', records: '15,921' },
  { name: 'Sage Intacct', status: 'Disconnected', color: '#4E5969', lastSync: 'N/A', records: '0' },
  { name: 'QuickBooks', status: 'Disconnected', color: '#4E5969', lastSync: 'N/A', records: '0' },
  { name: 'Custom API', status: 'Error', color: '#F76560', lastSync: '2 days ago', records: '3,200' },
];

const notificationsData = [
  { key: 'invoiceRequiresApproval', email: true, inApp: true },
  { key: 'paymentProcessed', email: true, inApp: true },
  { key: 'riskAlertDetected', email: true, inApp: true },
  { key: 'complianceWarning', email: true, inApp: true },
  { key: 'weeklySummaryReport', email: true, inApp: false },
  { key: 'systemMaintenance', email: false, inApp: true },
  { key: 'newSupplierAdded', email: false, inApp: true },
];

/* ---------- User type ---------- */

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  avatarUrl: string | null;
  preferences: Record<string, unknown> | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ---------- Role options for select ---------- */

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Approver', value: 'APPROVER' },
  { label: 'AP Clerk', value: 'AP_CLERK' },
  { label: 'Viewer', value: 'VIEWER' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

/* ---------- Helpers ---------- */

function roleLabelFromValue(value: string): string {
  return ROLE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

/* ---------- Component ---------- */

export default function SettingsPage() {
  const t = useT();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('General');
  const [confidence, setConfidence] = useState(92);
  const [notifState, setNotifState] = useState(notificationsData.map(n => ({ ...n })));
  const [saving, setSaving] = useState(false);

  /* ---- Users CRUD ---- */
  const crud = useCRUD<User>({ endpoint: '/api/users' });
  const inline = useInlineEdit<User>();

  const handleSaveEdit = useCallback(async () => {
    if (!inline.editingId) return;
    setSaving(true);
    const result = await crud.update(inline.editingId, inline.editDraft);
    setSaving(false);
    if (result) {
      inline.cancelEdit();
      addToast({ type: 'success', title: 'User updated' });
    } else {
      addToast({ type: 'error', title: 'Failed to update user', message: crud.error ?? undefined });
    }
  }, [inline, crud, addToast]);

  const handleSaveCreate = useCallback(async () => {
    const draft = inline.createDraft;
    if (!draft.email || !draft.name || !draft.role || !draft.tenantId) {
      addToast({ type: 'warning', title: 'Missing required fields', message: 'Email, name, role, and tenant ID are required.' });
      return;
    }
    setSaving(true);
    const result = await crud.create(draft);
    setSaving(false);
    if (result) {
      inline.cancelCreate();
      addToast({ type: 'success', title: 'User created' });
    } else {
      addToast({ type: 'error', title: 'Failed to create user', message: crud.error ?? undefined });
    }
  }, [inline, crud, addToast]);

  const handleConfirmDelete = useCallback(async () => {
    if (!inline.deleteConfirmId) return;
    setSaving(true);
    const ok = await crud.remove(inline.deleteConfirmId);
    setSaving(false);
    if (ok) {
      inline.cancelDelete();
      addToast({ type: 'success', title: 'User deleted' });
    } else {
      addToast({ type: 'error', title: 'Failed to delete user', message: crud.error ?? undefined });
    }
  }, [inline, crud, addToast]);

  /* ---- Tabs ---- */
  const tabDefs = [
    { key: 'General', label: t('settings.general') },
    { key: 'Users', label: t('settings.users') },
    { key: 'Integrations', label: t('settings.integrations') },
    { key: 'Notifications', label: t('settings.notifications') },
    { key: 'Security', label: t('settings.security') },
  ];

  const toggleNotif = (idx: number, type: 'email' | 'inApp') => {
    setNotifState(prev => prev.map((n, i) => i === idx ? { ...n, [type]: !n[type] } : n));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('settings.title')}</h1>
        <p className={styles.subtitle}>{t('settings.subtitle')}</p>
      </div>

      <div className={styles.tabs}>
        {tabDefs.map(tab => (
          <button key={tab.key} className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'General' && (
        <>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('settings.companyInfo')}</h2>
            <div className={styles.formGrid}>
              <div className={styles.field}><label className={styles.fieldLabel}>{t('settings.companyName')}</label><input className={styles.fieldInput} defaultValue="Medius Corp" /></div>
              <div className={styles.field}><label className={styles.fieldLabel}>{t('settings.timezone')}</label><select className={styles.fieldSelect}><option>UTC-5 (Eastern)</option><option>UTC-6 (Central)</option><option>UTC+1 (CET)</option></select></div>
              <div className={styles.field}><label className={styles.fieldLabel}>{t('settings.defaultCurrency')}</label><select className={styles.fieldSelect}><option>USD</option><option>EUR</option><option>GBP</option><option>SEK</option></select></div>
              <div className={styles.field}><label className={styles.fieldLabel}>{t('settings.fiscalYearStart')}</label><select className={styles.fieldSelect}><option>January</option><option>April</option><option>July</option><option>October</option></select></div>
            </div>
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('settings.apSettings')}</h2>
            <div className={styles.formGrid}>
              <div className={styles.field}><label className={styles.fieldLabel}>{t('settings.defaultPaymentTerms')}</label><select className={styles.fieldSelect}><option>Net 30</option><option>Net 45</option><option>Net 60</option><option>Net 90</option></select></div>
              <div className={styles.field}><label className={styles.fieldLabel}>{t('settings.autoApproveThreshold')}</label><input className={styles.fieldInput} defaultValue="$1,000" /></div>
              <div className={styles.field}><label className={styles.fieldLabel}>{t('settings.poMatchTolerance')}</label><input className={styles.fieldInput} defaultValue="5%" /></div>
              <div className={styles.field}><label className={styles.fieldLabel}>{t('settings.duplicateDetectionWindow')}</label><select className={styles.fieldSelect}><option>30 days</option><option>60 days</option><option>90 days</option></select></div>
            </div>
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('settings.aiConfiguration')}</h2>
            <div className={styles.field} style={{ maxWidth: 400 }}>
              <div className={styles.sliderLabel}>
                <label className={styles.fieldLabel}>{t('settings.autoApproveConfidence')}</label>
                <span className={styles.sliderValue}>{confidence}%</span>
              </div>
              <input type="range" className={styles.slider} min="50" max="99" value={confidence} onChange={e => setConfidence(Number(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#4E5969' }}><span>{t('settings.moreAutomation')}</span><span>{t('settings.moreReview')}</span></div>
            </div>
          </div>
          <button className={styles.saveBtn}>{t('common.save')}</button>
        </>
      )}

      {activeTab === 'Users' && (
        <div className={styles.section}>
          <button
            className={styles.inviteBtn}
            onClick={() => inline.startCreate({ role: 'VIEWER', isActive: true } as Partial<User>)}
            disabled={inline.isCreating}
          >
            {t('settings.inviteUser')}
          </button>
          <h2 className={styles.sectionTitle}>{t('settings.teamMembers')}</h2>

          {crud.loading && crud.data.length === 0 && (
            <p style={{ color: '#86909C', fontSize: '0.875rem' }}>Loading users...</p>
          )}

          {crud.error && !crud.loading && crud.data.length === 0 && (
            <p style={{ color: '#F76560', fontSize: '0.875rem' }}>Error: {crud.error}</p>
          )}

          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>{t('common.name')}</th>
                <th>{t('common.email')}</th>
                <th>{t('common.role')}</th>
                <th>{t('common.status')}</th>
                <th>{t('settings.lastActive')}</th>
                <th style={{ textAlign: 'right' }}>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {/* ---- Inline create row ---- */}
              {inline.isCreating && (
                <tr>
                  <td>
                    <EditableCell
                      editing
                      value={inline.createDraft.name ?? ''}
                      onChange={(v) => inline.updateCreateField('name', v)}
                      placeholder="Full name"
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={inline.createDraft.email ?? ''}
                      onChange={(v) => inline.updateCreateField('email', v)}
                      placeholder="email@example.com"
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={inline.createDraft.role ?? ''}
                      onChange={(v) => inline.updateCreateField('role', v)}
                      type="select"
                      options={ROLE_OPTIONS}
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={String(inline.createDraft.isActive ?? true)}
                      onChange={(v) => inline.updateCreateField('isActive', v === 'true')}
                      type="select"
                      options={STATUS_OPTIONS}
                      displayRender={(v) => {
                        const active = v === 'true' || v === true;
                        return (
                          <span className={`${styles.badge} ${active ? styles.badgeGreen : styles.badgeGray}`}>
                            {active ? 'Active' : 'Inactive'}
                          </span>
                        );
                      }}
                    />
                  </td>
                  <td style={{ color: '#86909C' }}>--</td>
                  <td style={{ textAlign: 'right' }}>
                    <RowActions
                      mode="creating"
                      onSave={handleSaveCreate}
                      onCancel={inline.cancelCreate}
                      saving={saving}
                    />
                  </td>
                </tr>
              )}

              {/* ---- Existing user rows ---- */}
              {crud.data.map((user) => {
                const isEditing = inline.editingId === user.id;
                const isDeleting = inline.deleteConfirmId === user.id;

                return (
                  <tr key={user.id}>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? inline.editDraft.name : user.name}
                        onChange={(v) => inline.updateEditField('name', v)}
                        placeholder="Full name"
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? inline.editDraft.email : user.email}
                        onChange={(v) => inline.updateEditField('email', v)}
                        placeholder="email@example.com"
                        displayRender={(v) => <span style={{ color: '#86909C' }}>{v}</span>}
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? inline.editDraft.role : user.role}
                        onChange={(v) => inline.updateEditField('role', v)}
                        type="select"
                        options={ROLE_OPTIONS}
                        displayRender={(v) => roleLabelFromValue(v)}
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? String(inline.editDraft.isActive ?? user.isActive) : String(user.isActive)}
                        onChange={(v) => inline.updateEditField('isActive', v === 'true')}
                        type="select"
                        options={STATUS_OPTIONS}
                        displayRender={(v) => {
                          const active = v === 'true' || v === true;
                          return (
                            <span className={`${styles.badge} ${active ? styles.badgeGreen : styles.badgeGray}`}>
                              {active ? 'Active' : 'Inactive'}
                            </span>
                          );
                        }}
                      />
                    </td>
                    <td style={{ color: '#86909C' }}>{formatRelativeTime(user.lastLoginAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <RowActions
                        mode={isDeleting ? 'deleting' : isEditing ? 'editing' : 'read'}
                        onEdit={() => inline.startEdit(user.id, user)}
                        onDelete={() => inline.requestDelete(user.id)}
                        onSave={handleSaveEdit}
                        onCancel={inline.cancelEdit}
                        onConfirmDelete={handleConfirmDelete}
                        onCancelDelete={inline.cancelDelete}
                        saving={saving}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Integrations' && (
        <>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('settings.erpConnections')}</h2>
            <div className={styles.erpGrid}>
              {erps.map(e => (
                <div key={e.name} className={styles.erpCard}>
                  <div className={styles.erpName}>{e.name}</div>
                  <div className={styles.erpStatus} style={{ color: e.color }}>{e.status}</div>
                  <div className={styles.erpMeta}>Last sync: {e.lastSync} | Records: {e.records}</div>
                  <button className={styles.configBtn}>{t('common.configure')}</button>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('settings.eInvoicingNetworks')}</h2>
            <div className={styles.erpGrid}>
              {[
                { name: 'Peppol', status: 'Connected', color: '#23C343' },
                { name: 'KSeF (Poland)', status: 'Connected', color: '#23C343' },
                { name: 'PPF (France)', status: 'Sandbox', color: '#FF9A2E' },
              ].map(n => (
                <div key={n.name} className={styles.erpCard}>
                  <div className={styles.erpName}>{n.name}</div>
                  <div style={{ color: n.color, fontSize: '0.75rem' }}>{n.status}</div>
                  <button className={styles.configBtn} style={{ marginTop: '0.75rem' }}>{t('common.configure')}</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'Notifications' && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('settings.notificationPreferences')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '0', alignItems: 'center' }}>
            <div style={{ padding: '0.5rem 0', color: '#4E5969', fontSize: '0.75rem', fontWeight: 600 }}>{t('settings.event')}</div>
            <div style={{ padding: '0.5rem 0', color: '#4E5969', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>{t('settings.emailNotif')}</div>
            <div style={{ padding: '0.5rem 0', color: '#4E5969', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>{t('settings.inAppNotif')}</div>
            {notifState.map((n, i) => (
              <div key={n.key} style={{ display: 'contents' }}>
                <div style={{ padding: '0.75rem 0', color: '#334155', fontSize: '0.875rem', borderBottom: '1px solid #E5E6EB' }}>{t(`settings.${n.key}`)}</div>
                <div style={{ padding: '0.75rem 0', textAlign: 'center', borderBottom: '1px solid #E5E6EB' }}>
                  <button className={`${styles.toggleSwitch} ${n.email ? styles.toggleSwitchActive : ''}`} onClick={() => toggleNotif(i, 'email')}>
                    <div className={`${styles.toggleDot} ${n.email ? styles.toggleDotActive : ''}`} />
                  </button>
                </div>
                <div style={{ padding: '0.75rem 0', textAlign: 'center', borderBottom: '1px solid #E5E6EB' }}>
                  <button className={`${styles.toggleSwitch} ${n.inApp ? styles.toggleSwitchActive : ''}`} onClick={() => toggleNotif(i, 'inApp')}>
                    <div className={`${styles.toggleDot} ${n.inApp ? styles.toggleDotActive : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Security' && (
        <>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('settings.authentication')}</h2>
            {[
              { label: t('settings.twoFactorAuth'), desc: t('settings.twoFactorDesc'), active: true },
              { label: t('settings.sso'), desc: t('settings.ssoDesc'), active: false },
              { label: t('settings.ipWhitelist'), desc: t('settings.ipWhitelistDesc'), active: false },
            ].map(s => (
              <div key={s.label} className={styles.toggle}>
                <div><div className={styles.toggleLabel}>{s.label}</div><div className={styles.toggleDesc}>{s.desc}</div></div>
                <button className={`${styles.toggleSwitch} ${s.active ? styles.toggleSwitchActive : ''}`}>
                  <div className={`${styles.toggleDot} ${s.active ? styles.toggleDotActive : ''}`} />
                </button>
              </div>
            ))}
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('settings.sessionManagement')}</h2>
            <div className={styles.formGrid}>
              <div className={styles.field}><label className={styles.fieldLabel}>{t('settings.sessionTimeout')}</label><select className={styles.fieldSelect}><option>30 minutes</option><option>1 hour</option><option>4 hours</option><option>8 hours</option></select></div>
              <div className={styles.field}><label className={styles.fieldLabel}>{t('settings.maxConcurrentSessions')}</label><select className={styles.fieldSelect}><option>3</option><option>5</option><option>Unlimited</option></select></div>
            </div>
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('settings.apiKeys')}</h2>
            <table className={styles.userTable}>
              <thead><tr><th>{t('settings.keyName')}</th><th>{t('settings.key')}</th><th>{t('settings.created')}</th><th>{t('settings.lastUsed')}</th><th>{t('common.status')}</th></tr></thead>
              <tbody>
                <tr><td>Production API</td><td style={{ fontFamily: 'monospace', color: '#86909C' }}>sk_live_****...7x9f</td><td style={{ color: '#86909C' }}>Jan 15, 2024</td><td style={{ color: '#86909C' }}>2 min ago</td><td><span className={`${styles.badge} ${styles.badgeGreen}`}>Active</span></td></tr>
                <tr><td>Staging API</td><td style={{ fontFamily: 'monospace', color: '#86909C' }}>sk_test_****...3k2m</td><td style={{ color: '#86909C' }}>Dec 1, 2023</td><td style={{ color: '#86909C' }}>Yesterday</td><td><span className={`${styles.badge} ${styles.badgeGreen}`}>Active</span></td></tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
