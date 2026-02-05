'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useT } from '@/lib/i18n/locale-context';
import { useCRUD } from '@/lib/hooks/use-crud';
import { useInlineEdit } from '@/lib/hooks/use-inline-edit';
import { useBulkSelect } from '@/lib/hooks/use-bulk-select';
import { useToast } from '@/components/ui/Toast';
import { EditableCell } from '@/components/inline-edit/EditableCell';
import { RowActions } from '@/components/inline-edit/RowActions';
import styles from './invoices.module.css';

type InvoiceStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'on_hold';

interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
  aiConfidence: number;
}

const filterTabs = ['All', 'Pending', 'Processing', 'Approved', 'Rejected', 'On Hold'] as const;

const statusOptions: { label: string; value: string }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'On Hold', value: 'on_hold' },
];

function formatAmount(amount: number, currency: string): string {
  const noDecimals = ['JPY', 'KRW'];
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: noDecimals.includes(currency) ? 0 : 2,
    maximumFractionDigits: noDecimals.includes(currency) ? 0 : 2,
  }).format(amount);
}

function getStatusLabel(status: InvoiceStatus): string {
  const map: Record<InvoiceStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    approved: 'Approved',
    rejected: 'Rejected',
    on_hold: 'On Hold',
  };
  return map[status] ?? status;
}

function getStatusClass(status: InvoiceStatus): string {
  const map: Record<InvoiceStatus, string> = {
    pending: styles.badgePending,
    processing: styles.badgeProcessing,
    approved: styles.badgeApproved,
    rejected: styles.badgeRejected,
    on_hold: styles.badgeOnHold,
  };
  return map[status] ?? '';
}

function getConfidenceClass(confidence: number): string {
  if (confidence >= 85) return styles.confidenceHigh;
  if (confidence >= 60) return styles.confidenceMedium;
  return styles.confidenceLow;
}

function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export default function InvoicesPage() {
  const t = useT();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const crud = useCRUD<Invoice>({ endpoint: '/api/invoices', autoFetch: false });
  const inline = useInlineEdit<Invoice>();
  const { addToast } = useToast();
  const bulk = useBulkSelect();
  const checkboxRef = useRef<HTMLInputElement>(null);
  const visibleIds = crud.data.map((inv) => inv.id);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = bulk.someSelected && !bulk.allSelected(visibleIds);
    }
  }, [bulk.someSelected, bulk.allSelected, visibleIds]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (activeFilter !== 'All') params.status = activeFilter.toLowerCase().replace(' ', '_');
    if (searchQuery) params.search = searchQuery;
    crud.fetchAll(params);
  }, [activeFilter, searchQuery]);

  const handleSaveEdit = useCallback(async () => {
    if (!inline.editingId) return;
    setSaving(true);
    const result = await crud.update(inline.editingId, inline.editDraft);
    setSaving(false);
    if (result) {
      inline.cancelEdit();
      addToast({ type: 'success', title: t('common.updateSuccess') });
    } else {
      addToast({ type: 'error', title: t('common.errorSaving'), message: crud.error ?? undefined });
    }
  }, [inline.editingId, inline.editDraft, crud, inline, addToast, t]);

  const handleSaveCreate = useCallback(async () => {
    const draft = inline.createDraft;
    if (!draft.invoiceNumber || !draft.vendorName || !draft.totalAmount) {
      addToast({ type: 'warning', title: 'Missing required fields', message: 'Invoice number, vendor name, and amount are required.' });
      return;
    }
    setSaving(true);
    const result = await crud.create({
      invoiceNumber: draft.invoiceNumber,
      vendorName: draft.vendorName,
      totalAmount: draft.totalAmount,
      currency: draft.currency || 'USD',
      dueDate: draft.dueDate || undefined,
    });
    setSaving(false);
    if (result) {
      inline.cancelCreate();
      addToast({ type: 'success', title: t('common.createSuccess') });
    } else {
      addToast({ type: 'error', title: t('common.errorSaving'), message: crud.error ?? undefined });
    }
  }, [inline.createDraft, crud, inline, addToast, t]);

  const handleConfirmDelete = useCallback(async () => {
    if (!inline.deleteConfirmId) return;
    const success = await crud.remove(inline.deleteConfirmId);
    if (success) {
      inline.cancelDelete();
      addToast({ type: 'success', title: t('common.deleteSuccess') });
    } else {
      addToast({ type: 'error', title: t('common.errorDeleting'), message: crud.error ?? undefined });
    }
  }, [inline.deleteConfirmId, crud, inline, addToast, t]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t('invoices.title')}</h1>
          <p>{t('invoices.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className={styles.uploadBtn}
            style={{ background: '#23C343' }}
            onClick={() => inline.startCreate({ currency: 'USD' } as Partial<Invoice>)}
          >
            <span>+</span>
            {t('common.addNew')}
          </button>
          <Link href="/invoices/upload">
            <button className={styles.uploadBtn}>
              <span>+</span>
              {t('invoices.uploadInvoice')}
            </button>
          </Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('invoices.totalInvoices')}</div>
          <div className={styles.statValue}>{crud.pagination.totalCount || '--'}</div>
          <div className={`${styles.statChange} ${styles.statUp}`}>{t('invoices.fromLastMonth', { pct: '12.4' })}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('invoices.pendingReview')}</div>
          <div className={styles.statValue}>--</div>
          <div className={`${styles.statChange} ${styles.statDown}`}>{t('invoices.sinceYesterday', { count: 0 })}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('invoices.processing')}</div>
          <div className={styles.statValue}>--</div>
          <div className={`${styles.statChange} ${styles.statNeutral}`}>{t('invoices.aiAgentsActive')}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('invoices.approvedToday')}</div>
          <div className={styles.statValue}>--</div>
          <div className={`${styles.statChange} ${styles.statUp}`}>{t('invoices.autoApproved', { pct: '0' })}</div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filterTabs}>
          {filterTabs.map((tab) => {
            const tabLabels: Record<string, string> = {
              'All': t('invoices.all'),
              'Pending': t('invoices.pending'),
              'Processing': t('invoices.processing'),
              'Approved': t('invoices.approved'),
              'Rejected': t('invoices.rejected'),
              'On Hold': t('invoices.onHold'),
            };
            return (
              <button
                key={tab}
                className={activeFilter === tab ? styles.filterTabActive : styles.filterTab}
                onClick={() => setActiveFilter(tab)}
              >
                {tabLabels[tab]}
              </button>
            );
          })}
        </div>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>&#128269;</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('invoices.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {crud.error && !saving && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(247,101,96,0.1)', color: '#F76560', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
          {crud.error}
        </div>
      )}

      {bulk.count > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>{bulk.count} selected</span>
          <button className={styles.bulkBtn} onClick={() => { /* export */ }}>Export</button>
          <button className={`${styles.bulkBtn} ${styles.bulkBtnDanger}`} onClick={() => { /* delete */ }}>Delete</button>
          <button className={styles.bulkBtnClear} onClick={bulk.clear}>Clear</button>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  ref={checkboxRef}
                  checked={bulk.allSelected(visibleIds)}
                  onChange={() => bulk.toggleAll(visibleIds)}
                />
              </th>
              <th>{t('invoices.invoiceNumber')}</th>
              <th>{t('invoices.supplier')}</th>
              <th>{t('invoices.amount')}</th>
              <th>{t('invoices.currency')}</th>
              <th>{t('invoices.status')}</th>
              <th>{t('invoices.date')}</th>
              <th>{t('invoices.dueDate')}</th>
              <th>{t('invoices.aiConfidence')}</th>
              <th>{t('invoices.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {/* Create row */}
            {inline.isCreating && (
              <tr>
                <td />
                <td>
                  <EditableCell
                    editing
                    value={inline.createDraft.invoiceNumber ?? ''}
                    onChange={(v) => inline.updateCreateField('invoiceNumber', v)}
                    placeholder="INV-2024-XXXX"
                  />
                </td>
                <td>
                  <EditableCell
                    editing
                    value={inline.createDraft.vendorName ?? ''}
                    onChange={(v) => inline.updateCreateField('vendorName', v)}
                    placeholder="Vendor name"
                  />
                </td>
                <td>
                  <EditableCell
                    editing
                    value={inline.createDraft.totalAmount ?? ''}
                    onChange={(v) => inline.updateCreateField('totalAmount', v)}
                    type="number"
                    placeholder="0.00"
                  />
                </td>
                <td>
                  <EditableCell
                    editing
                    value={inline.createDraft.currency ?? 'USD'}
                    onChange={(v) => inline.updateCreateField('currency', v)}
                    placeholder="USD"
                  />
                </td>
                <td>
                  <span className={styles.badgePending}>Pending</span>
                </td>
                <td className={styles.dateCell}>--</td>
                <td>
                  <EditableCell
                    editing
                    value={inline.createDraft.dueDate ?? ''}
                    onChange={(v) => inline.updateCreateField('dueDate', v)}
                    type="date"
                  />
                </td>
                <td>--</td>
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

            {/* Loading state */}
            {crud.loading && crud.data.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#86909C' }}>
                  {t('common.loading')}
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!crud.loading && crud.data.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#86909C' }}>
                  {t('common.noData')}
                </td>
              </tr>
            )}

            {/* Data rows */}
            {crud.data.map((inv) => {
              const isEditing = inline.editingId === inv.id;
              const isDeleting = inline.deleteConfirmId === inv.id;
              const draft = inline.editDraft;
              const overdue = isOverdue(inv.dueDate);

              return (
                <tr key={inv.id}>
                  <td><input type="checkbox" checked={bulk.selected.has(inv.id)} onChange={() => bulk.toggle(inv.id)} /></td>
                  <td>
                    <EditableCell
                      editing={isEditing}
                      value={isEditing ? draft.invoiceNumber : inv.invoiceNumber}
                      onChange={(v) => inline.updateEditField('invoiceNumber', v)}
                      displayRender={(val) => (
                        <Link href={`/invoices/${inv.id}`} style={{ color: '#165DFF', fontWeight: 500 }}>
                          {val}
                        </Link>
                      )}
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing={isEditing}
                      value={isEditing ? draft.vendorName : inv.vendorName}
                      onChange={(v) => inline.updateEditField('vendorName', v)}
                      displayRender={(val) => (
                        <div className={styles.supplierCell}>
                          <span className={styles.supplierName}>{val}</span>
                        </div>
                      )}
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing={isEditing}
                      value={isEditing ? draft.totalAmount : inv.totalAmount}
                      onChange={(v) => inline.updateEditField('totalAmount', v)}
                      type="number"
                      displayRender={(val) => (
                        <span className={styles.amount}>{formatAmount(val, inv.currency)}</span>
                      )}
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing={isEditing}
                      value={isEditing ? draft.currency : inv.currency}
                      onChange={(v) => inline.updateEditField('currency', v)}
                      displayRender={(val) => (
                        <span className={styles.currency}>{val}</span>
                      )}
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing={isEditing}
                      value={isEditing ? draft.status : inv.status}
                      onChange={(v) => inline.updateEditField('status', v)}
                      type="select"
                      options={statusOptions}
                      displayRender={(val) => (
                        <span className={getStatusClass(val)}>{getStatusLabel(val)}</span>
                      )}
                    />
                  </td>
                  <td className={styles.dateCell}>
                    {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '--'}
                  </td>
                  <td>
                    <EditableCell
                      editing={isEditing}
                      value={isEditing ? (draft.dueDate ?? '').slice(0, 10) : (inv.dueDate ?? '').slice(0, 10)}
                      onChange={(v) => inline.updateEditField('dueDate', v)}
                      type="date"
                      displayRender={(val) => (
                        <span className={`${styles.dateCell} ${overdue ? styles.overdue : ''}`}>
                          {val || '--'}
                          {overdue && <span style={{ marginLeft: '0.25rem', fontSize: '0.7rem' }}> OVERDUE</span>}
                        </span>
                      )}
                    />
                  </td>
                  <td>
                    <div className={styles.confidenceBar}>
                      <div className={styles.confidenceTrack}>
                        <div
                          className={`${styles.confidenceFill} ${getConfidenceClass(inv.aiConfidence ?? 0)}`}
                          style={{ width: `${inv.aiConfidence ?? 0}%` }}
                        />
                      </div>
                      <span className={styles.confidenceValue}>{inv.aiConfidence ?? 0}%</span>
                    </div>
                  </td>
                  <td>
                    {isDeleting ? (
                      <RowActions
                        mode="deleting"
                        onConfirmDelete={handleConfirmDelete}
                        onCancelDelete={inline.cancelDelete}
                      />
                    ) : isEditing ? (
                      <RowActions
                        mode="editing"
                        onSave={handleSaveEdit}
                        onCancel={inline.cancelEdit}
                        saving={saving}
                      />
                    ) : (
                      <div className={styles.actionsCell}>
                        <Link href={`/invoices/${inv.id}`}>
                          <button className={styles.actionBtn}>{t('common.view')}</button>
                        </Link>
                        <RowActions
                          mode="read"
                          onEdit={() => inline.startEdit(inv.id, inv)}
                          onDelete={() => inline.requestDelete(inv.id)}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing 1-{crud.data.length} of {crud.pagination.totalCount} invoices
          </div>
          <div className={styles.paginationButtons}>
            <button className={crud.pagination.hasPrevious ? styles.pageBtn : styles.pageBtnDisabled} disabled={!crud.pagination.hasPrevious}>
              Previous
            </button>
            <button className={styles.pageBtnActive}>{crud.pagination.page || 1}</button>
            {crud.pagination.hasNext && (
              <button className={styles.pageBtn}>{(crud.pagination.page || 1) + 1}</button>
            )}
            <button className={crud.pagination.hasNext ? styles.pageBtn : styles.pageBtnDisabled} disabled={!crud.pagination.hasNext}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
