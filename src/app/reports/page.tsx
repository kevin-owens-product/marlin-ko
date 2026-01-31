'use client';

import { useState, useCallback } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { useCRUD } from '@/lib/hooks/use-crud';
import { useInlineEdit } from '@/lib/hooks/use-inline-edit';
import { useToast } from '@/components/ui/Toast';
import { EditableCell } from '@/components/inline-edit/EditableCell';
import { RowActions } from '@/components/inline-edit/RowActions';
import styles from './reports.module.css';

interface Report {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  config: string;
  schedule: string;
  lastRunAt: string;
  createdAt: string;
}

const REPORT_TYPES = [
  { label: 'Spend Analysis', value: 'SPEND_ANALYSIS' },
  { label: 'Aging', value: 'AGING' },
  { label: 'Cash Flow', value: 'CASH_FLOW' },
  { label: 'Compliance', value: 'COMPLIANCE' },
  { label: 'Fraud', value: 'FRAUD' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Custom', value: 'CUSTOM' },
];

const categories = ['All', 'SPEND_ANALYSIS', 'AGING', 'COMPLIANCE', 'CASH_FLOW', 'FRAUD', 'PROCESSING', 'CUSTOM'];

const categoryLabels: Record<string, string> = {
  All: 'All',
  SPEND_ANALYSIS: 'Spend',
  AGING: 'Aging',
  COMPLIANCE: 'Compliance',
  CASH_FLOW: 'Cash Flow',
  FRAUD: 'Fraud',
  PROCESSING: 'Processing',
  CUSTOM: 'Custom',
};

function getTypeClass(type: string): string {
  const map: Record<string, string> = {
    SPEND_ANALYSIS: styles.typeSpend,
    AGING: styles.typeAging,
    CASH_FLOW: styles.typeCashFlow,
    COMPLIANCE: styles.typeCompliance,
    FRAUD: styles.typeFraud,
    PROCESSING: styles.typeProcessing,
    CUSTOM: styles.typeCustom,
  };
  return map[type] || styles.typeCustom;
}

function getTypeLabel(type: string): string {
  const found = REPORT_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

function formatSchedule(schedule: string): string {
  if (!schedule) return '--';
  try {
    const parsed = JSON.parse(schedule);
    if (parsed.frequency && parsed.time) {
      return `${parsed.frequency} (${parsed.time})`;
    }
    if (typeof parsed === 'string') return parsed;
    return JSON.stringify(parsed);
  } catch {
    return schedule;
  }
}

function formatLastRun(lastRunAt: string): string {
  if (!lastRunAt) return 'Never';
  try {
    const date = new Date(lastRunAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  } catch {
    return lastRunAt;
  }
}

export default function ReportsPage() {
  const t = useT();
  const [activeCategory, setActiveCategory] = useState('All');
  const [saving, setSaving] = useState(false);

  const typeParam = activeCategory === 'All' ? undefined : activeCategory;

  const crud = useCRUD<Report>({
    endpoint: '/api/reports',
    defaultParams: typeParam ? { type: typeParam } : {},
  });

  const inline = useInlineEdit<Report>();
  const { addToast } = useToast();

  // Re-fetch when tab changes
  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveCategory(tab);
      const params: Record<string, string> = tab === 'All' ? {} : { type: tab };
      crud.fetchAll(params);
    },
    [crud],
  );

  // --- Create ---
  const handleStartCreate = useCallback(() => {
    inline.startCreate({
      name: '',
      type: 'SPEND_ANALYSIS',
      config: '{}',
      schedule: '{}',
      tenantId: 'default_tenant',
    } as Partial<Report>);
  }, [inline]);

  const handleSaveCreate = useCallback(async () => {
    const draft = inline.createDraft;
    if (!draft.name || !draft.type) {
      addToast({ type: 'warning', title: 'Name and Type are required' });
      return;
    }
    setSaving(true);
    const result = await crud.create({
      name: draft.name,
      type: draft.type,
      config: draft.config ?? '{}',
      schedule: draft.schedule ?? '{}',
      tenantId: draft.tenantId ?? 'default_tenant',
    });
    setSaving(false);
    if (result) {
      inline.cancelCreate();
      addToast({ type: 'success', title: 'Report created' });
    } else {
      addToast({ type: 'error', title: 'Failed to create report', message: crud.error ?? undefined });
    }
  }, [inline, crud, addToast]);

  // --- Update ---
  const handleSaveEdit = useCallback(async () => {
    if (!inline.editingId) return;
    setSaving(true);
    const result = await crud.update(inline.editingId, inline.editDraft);
    setSaving(false);
    if (result) {
      inline.cancelEdit();
      addToast({ type: 'success', title: 'Report updated' });
    } else {
      addToast({ type: 'error', title: 'Failed to update report', message: crud.error ?? undefined });
    }
  }, [inline, crud, addToast]);

  // --- Delete ---
  const handleConfirmDelete = useCallback(async () => {
    if (!inline.deleteConfirmId) return;
    setSaving(true);
    const ok = await crud.remove(inline.deleteConfirmId);
    setSaving(false);
    if (ok) {
      inline.cancelDelete();
      addToast({ type: 'success', title: 'Report deleted' });
    } else {
      addToast({ type: 'error', title: 'Failed to delete report', message: crud.error ?? undefined });
    }
  }, [inline, crud, addToast]);

  const totalReports = crud.pagination.totalCount || crud.data.length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('reports.title')}</h1>
          <p className={styles.subtitle}>{t('reports.subtitle')}</p>
        </div>
        <button className={styles.createBtn} onClick={handleStartCreate}>
          + Add Report
        </button>
      </div>

      <div className={styles.tabs}>
        {categories.map((c) => (
          <button
            key={c}
            className={`${styles.tab} ${activeCategory === c ? styles.tabActive : ''}`}
            onClick={() => handleTabChange(c)}
          >
            {categoryLabels[c] || c}
          </button>
        ))}
      </div>

      <div className={styles.tableWrapper}>
        {crud.loading && crud.data.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#86909C' }}>Loading...</div>
        ) : crud.error && crud.data.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#F76560' }}>{crud.error}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Last Run</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* --- Create row --- */}
              {inline.isCreating && (
                <tr>
                  <td>
                    <EditableCell
                      editing
                      value={inline.createDraft.name ?? ''}
                      onChange={(v) => inline.updateCreateField('name', v)}
                      placeholder="Report name"
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      type="select"
                      value={inline.createDraft.type ?? 'SPEND_ANALYSIS'}
                      onChange={(v) => inline.updateCreateField('type', v)}
                      options={REPORT_TYPES}
                    />
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: '#86909C' }}>--</td>
                  <td style={{ fontSize: '0.8125rem', color: '#86909C' }}>--</td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeGreen}`}>Active</span>
                  </td>
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

              {/* --- Data rows --- */}
              {crud.data.map((report) => {
                const isEditing = inline.editingId === report.id;
                const isDeleting = inline.deleteConfirmId === report.id;

                return (
                  <tr key={report.id}>
                    {/* Name */}
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? inline.editDraft.name : report.name}
                        onChange={(v) => inline.updateEditField('name', v)}
                        displayRender={(val) => <span className={styles.reportName}>{val}</span>}
                      />
                    </td>

                    {/* Type */}
                    <td>
                      <EditableCell
                        editing={isEditing}
                        type="select"
                        value={isEditing ? inline.editDraft.type : report.type}
                        onChange={(v) => inline.updateEditField('type', v)}
                        options={REPORT_TYPES}
                        displayRender={(val) => (
                          <span className={`${styles.typeBadge} ${getTypeClass(val)}`}>
                            {getTypeLabel(val)}
                          </span>
                        )}
                      />
                    </td>

                    {/* Last Run */}
                    <td style={{ fontSize: '0.8125rem', color: '#86909C' }}>
                      {formatLastRun(report.lastRunAt)}
                    </td>

                    {/* Schedule */}
                    <td style={{ fontSize: '0.8125rem', color: '#4E5969' }}>
                      {formatSchedule(report.schedule)}
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`${styles.badge} ${styles.badgeGreen}`}>Active</span>
                    </td>

                    {/* Actions */}
                    <td>
                      <RowActions
                        mode={isDeleting ? 'deleting' : isEditing ? 'editing' : 'read'}
                        onEdit={() => inline.startEdit(report.id, report)}
                        onDelete={() => inline.requestDelete(report.id)}
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
        )}

        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Showing {crud.data.length} of {totalReports} reports
          </span>
          <div className={styles.paginationButtons}>
            <button
              className={styles.pageButton}
              disabled={!crud.pagination.hasPrevious}
              onClick={() =>
                crud.fetchAll({
                  page: String(crud.pagination.page - 1),
                  ...(typeParam ? { type: typeParam } : {}),
                })
              }
            >
              Prev
            </button>
            <button className={`${styles.pageButton} ${styles.pageButtonActive}`}>
              {crud.pagination.page}
            </button>
            <button
              className={styles.pageButton}
              disabled={!crud.pagination.hasNext}
              onClick={() =>
                crud.fetchAll({
                  page: String(crud.pagination.page + 1),
                  ...(typeParam ? { type: typeParam } : {}),
                })
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
