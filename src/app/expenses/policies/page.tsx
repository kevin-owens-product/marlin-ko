'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { useCRUD } from '@/lib/hooks/use-crud';
import { useInlineEdit } from '@/lib/hooks/use-inline-edit';
import { useToast } from '@/components/ui/Toast';
import { EditableCell } from '@/components/inline-edit/EditableCell';
import { RowActions } from '@/components/inline-edit/RowActions';
import styles from './expense-policies.module.css';

interface ExpensePolicy {
  id: string;
  tenantId: string;
  name: string;
  rules: string;
  isActive: boolean;
  createdAt: string;
}

const violations = [
  { id: 'VIO-041', date: '2026-01-29', employee: 'David Kim', policy: 'Travel Expense Policy', rule: 'Hotel rate exceeded $250 cap ($380/night)', severity: 'High', status: 'Open' },
  { id: 'VIO-040', date: '2026-01-28', employee: 'Lisa Park', policy: 'Meals & Entertainment Policy', rule: 'Client dinner exceeded $100 per person ($140)', severity: 'Medium', status: 'Open' },
  { id: 'VIO-039', date: '2026-01-25', employee: 'Maria Rodriguez', policy: 'Software & Subscriptions Policy', rule: 'Purchased software without IT approval ($2,400)', severity: 'High', status: 'Open' },
  { id: 'VIO-038', date: '2026-01-22', employee: 'Kevin Brooks', policy: 'Meals & Entertainment Policy', rule: 'Missing receipt for $89 lunch expense', severity: 'Low', status: 'Resolved' },
  { id: 'VIO-037', date: '2026-01-20', employee: 'Robert Taylor', policy: 'Travel Expense Policy', rule: 'Booked first class domestic flight', severity: 'High', status: 'Resolved' },
  { id: 'VIO-036', date: '2026-01-18', employee: 'Anna Martinez', policy: 'Office Supplies Policy', rule: 'Purchased from non-approved vendor ($340)', severity: 'Medium', status: 'Resolved' },
  { id: 'VIO-035', date: '2026-01-15', employee: 'James Wilson', policy: 'Meals & Entertainment Policy', rule: 'Exceeded team meal per-person limit ($92)', severity: 'Low', status: 'Resolved' },
];

function getSeverityBadge(severity: string) {
  const map: Record<string, string> = {
    High: styles.badgeHigh,
    Medium: styles.badgeMedium,
    Low: styles.badgeLow,
  };
  return `${styles.badge} ${map[severity] || ''}`;
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    Resolved: styles.badgeResolved,
    Open: styles.badgeOpen,
  };
  return `${styles.badge} ${map[status] || ''}`;
}

function parseRulesDescription(rules: string): string {
  try {
    const parsed = JSON.parse(rules);
    if (Array.isArray(parsed)) return parsed.join('; ');
    if (typeof parsed === 'object' && parsed.description) return parsed.description;
    return String(rules);
  } catch {
    return rules || '';
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const STATUS_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

export default function ExpensePoliciesPage() {
  const t = useT();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const crud = useCRUD<ExpensePolicy>({ endpoint: '/api/expense-policies' });
  const inline = useInlineEdit<ExpensePolicy>();

  // --- Handlers ---

  async function handleSaveEdit() {
    if (!inline.editingId) return;
    setSaving(true);
    const payload: Partial<ExpensePolicy> = {
      name: inline.editDraft.name,
      rules: inline.editDraft.rules,
      isActive: inline.editDraft.isActive,
    };
    const result = await crud.update(inline.editingId, payload);
    setSaving(false);
    if (result) {
      toast.addToast({ type: 'success', title: 'Policy updated' });
      inline.cancelEdit();
    } else {
      toast.addToast({ type: 'error', title: 'Failed to update policy', message: crud.error ?? undefined });
    }
  }

  async function handleSaveCreate() {
    const name = (inline.createDraft.name ?? '').trim();
    if (!name) {
      toast.addToast({ type: 'warning', title: 'Name is required' });
      return;
    }
    setSaving(true);
    const payload: Partial<ExpensePolicy> = {
      name,
      tenantId: 'default-tenant',
      rules: inline.createDraft.rules ?? '',
      isActive: inline.createDraft.isActive ?? true,
    };
    const result = await crud.create(payload);
    setSaving(false);
    if (result) {
      toast.addToast({ type: 'success', title: 'Policy created' });
      inline.cancelCreate();
    } else {
      toast.addToast({ type: 'error', title: 'Failed to create policy', message: crud.error ?? undefined });
    }
  }

  async function handleConfirmDelete() {
    if (!inline.deleteConfirmId) return;
    setSaving(true);
    const ok = await crud.remove(inline.deleteConfirmId);
    setSaving(false);
    if (ok) {
      toast.addToast({ type: 'success', title: 'Policy deleted' });
      inline.cancelDelete();
    } else {
      toast.addToast({ type: 'error', title: 'Failed to delete policy', message: crud.error ?? undefined });
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t('expensePolicies.title')}</h1>
          <p>{t('expensePolicies.subtitle')}</p>
        </div>
        <button className={styles.createBtn} onClick={() => inline.startCreate({ isActive: true })}>
          {t('expensePolicies.createPolicy')}
        </button>
      </div>

      {/* Policy Table */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Policies</div>
        {crud.loading && !crud.data.length && <p>Loading...</p>}
        {crud.error && !crud.data.length && <p style={{ color: '#F76560' }}>{crud.error}</p>}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('expensePolicies.policyName')}</th>
                <th>{t('expensePolicies.status')}</th>
                <th>Description</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Inline create row */}
              {inline.isCreating && (
                <tr>
                  <td>
                    <EditableCell
                      editing
                      value={inline.createDraft.name ?? ''}
                      onChange={(v) => inline.updateCreateField('name', v)}
                      placeholder="Policy name"
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={String(inline.createDraft.isActive ?? true)}
                      onChange={(v) => inline.updateCreateField('isActive', v === 'true')}
                      type="select"
                      options={STATUS_OPTIONS}
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={inline.createDraft.rules ?? ''}
                      onChange={(v) => inline.updateCreateField('rules', v)}
                      placeholder="Rules / description"
                    />
                  </td>
                  <td>-</td>
                  <td>
                    <RowActions
                      mode="creating"
                      onSave={handleSaveCreate}
                      onCancel={inline.cancelCreate}
                      saving={saving}
                    />
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {crud.data.map((policy) => {
                const isEditing = inline.editingId === policy.id;
                const isDeleting = inline.deleteConfirmId === policy.id;
                const draft = isEditing ? inline.editDraft : policy;

                return (
                  <tr key={policy.id}>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? draft.name : policy.name}
                        onChange={(v) => inline.updateEditField('name', v)}
                        placeholder="Policy name"
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? String(draft.isActive) : String(policy.isActive)}
                        onChange={(v) => inline.updateEditField('isActive', v === 'true')}
                        type="select"
                        options={STATUS_OPTIONS}
                        displayRender={(v) => (
                          <span
                            className={`${styles.policyBadge} ${
                              v === 'true' ? styles.badgeActive : styles.badgeDraft
                            }`}
                          >
                            {v === 'true' ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? draft.rules : policy.rules}
                        onChange={(v) => inline.updateEditField('rules', v)}
                        placeholder="Rules / description"
                        displayRender={(v) => (
                          <span title={v}>{parseRulesDescription(v)}</span>
                        )}
                      />
                    </td>
                    <td>{formatDate(policy.createdAt)}</td>
                    <td>
                      <RowActions
                        mode={isDeleting ? 'deleting' : isEditing ? 'editing' : 'read'}
                        onEdit={() => inline.startEdit(policy.id, policy)}
                        onDelete={() => inline.requestDelete(policy.id)}
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

              {!crud.loading && !crud.data.length && !inline.isCreating && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#86909C', padding: '2rem' }}>
                    No policies found. Click &quot;Create Policy&quot; to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Violation Log */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Violation Log</div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('common.date')}</th>
                <th>{t('expenses.employee')}</th>
                <th>Policy</th>
                <th>Rule Violated</th>
                <th>Severity</th>
                <th>{t('expensePolicies.status')}</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.date}</td>
                  <td>{v.employee}</td>
                  <td>{v.policy}</td>
                  <td>{v.rule}</td>
                  <td>
                    <span className={getSeverityBadge(v.severity)}>{v.severity}</span>
                  </td>
                  <td>
                    <span className={getStatusBadge(v.status)}>{v.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
