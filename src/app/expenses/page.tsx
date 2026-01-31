'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useT } from '@/lib/i18n/locale-context';
import { useCRUD } from '@/lib/hooks/use-crud';
import { useInlineEdit } from '@/lib/hooks/use-inline-edit';
import { useToast } from '@/components/ui/Toast';
import { EditableCell } from '@/components/inline-edit/EditableCell';
import { RowActions } from '@/components/inline-edit/RowActions';
import styles from './expenses.module.css';

interface Expense {
  id: string;
  userId: string;
  tenantId: string;
  category: string;
  amount: number;
  currency: string;
  receiptUrl: string;
  status: string;
  description: string;
  merchant: string;
  project: string;
  costCenter: string;
  expenseDate: string;
  submittedAt: string;
  approvedAt: string;
  createdAt: string;
}

const TABS = ['All', 'Pending', 'Approved', 'Rejected', 'Reimbursed'] as const;

const categories = [
  { label: 'Travel', pct: 35, bar: 'catTravel', amount: '$44,450' },
  { label: 'Meals', pct: 18, bar: 'catMeals', amount: '$22,860' },
  { label: 'Supplies', pct: 15, bar: 'catSupplies', amount: '$19,050' },
  { label: 'Software', pct: 14, bar: 'catSoftware', amount: '$17,780' },
  { label: 'Transport', pct: 10, bar: 'catTransport', amount: '$12,700' },
  { label: 'Other', pct: 8, bar: 'catOther', amount: '$10,160' },
];

const CATEGORY_OPTIONS = [
  { label: 'Travel', value: 'TRAVEL' },
  { label: 'Meals', value: 'MEALS' },
  { label: 'Software', value: 'SOFTWARE' },
  { label: 'Office', value: 'OFFICE' },
  { label: 'Equipment', value: 'EQUIPMENT' },
  { label: 'Other', value: 'OTHER' },
];

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Reimbursed', value: 'Reimbursed' },
];

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    Pending: styles.badgePending,
    Approved: styles.badgeApproved,
    Rejected: styles.badgeRejected,
    Reimbursed: styles.badgeReimbursed,
  };
  return `${styles.badge} ${map[status] || ''}`;
}

function formatCurrency(amount: number, currency?: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount);
}

const DEFAULT_USER_ID = 'user_default';
const DEFAULT_TENANT_ID = 'default_tenant';

export default function ExpensesPage() {
  const t = useT();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('All');

  const tabParams = useCallback((): Record<string, string> => {
    if (activeTab === 'All') return {};
    return { status: activeTab };
  }, [activeTab]);

  const crud = useCRUD<Expense>({ endpoint: '/api/expenses', autoFetch: false });
  const inline = useInlineEdit<Expense>();

  // Re-fetch when tab changes
  useEffect(() => {
    crud.fetchAll(tabParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSave = async () => {
    const result = await crud.update(inline.editingId!, inline.editDraft);
    if (result) {
      inline.cancelEdit();
      addToast({ type: 'success', title: t('common.updateSuccess') });
    } else {
      addToast({ type: 'error', title: t('common.errorSaving') });
    }
  };

  const handleCreate = async () => {
    const result = await crud.create(inline.createDraft);
    if (result) {
      inline.cancelCreate();
      addToast({ type: 'success', title: t('common.createSuccess') });
    } else {
      addToast({ type: 'error', title: t('common.errorSaving') });
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await crud.remove(id);
    inline.cancelDelete();
    addToast({
      type: ok ? 'success' : 'error',
      title: t(ok ? 'common.deleteSuccess' : 'common.errorDeleting'),
    });
  };

  const handleAddNew = () => {
    inline.startCreate({
      userId: DEFAULT_USER_ID,
      tenantId: DEFAULT_TENANT_ID,
      category: 'OTHER',
      amount: 0,
      currency: 'USD',
      status: 'Pending',
      expenseDate: new Date().toISOString().split('T')[0],
      description: '',
      merchant: '',
    } as Partial<Expense>);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t('expenses.title')}</h1>
          <p>{t('expenses.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className={styles.submitBtn}
            onClick={handleAddNew}
            disabled={inline.isCreating}
            style={{ opacity: inline.isCreating ? 0.5 : 1 }}
          >
            {t('common.addNew')}
          </button>
          <Link href="/expenses/submit" className={styles.submitBtn}>
            {t('expenses.submitExpense')}
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('expenses.totalExpensesMTD')}</div>
          <div className={styles.kpiValue}>$127K</div>
          <div className={`${styles.kpiSub} ${styles.kpiNeutral}`}>22 employees</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('expenses.pendingReview')}</div>
          <div className={styles.kpiValue}>18</div>
          <div className={`${styles.kpiSub} ${styles.kpiWarn}`}>$14,200 total</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('expenses.approvedMTD')}</div>
          <div className={styles.kpiValue}>156</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>98.7% on time</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('expenses.policyViolations')}</div>
          <div className={styles.kpiValue}>3</div>
          <div className={`${styles.kpiSub} ${styles.kpiError}`}>Requires attention</div>
        </div>
      </div>

      <div className={styles.twoCol}>
        {/* Expenses Table Section */}
        <div>
          {/* Tabs */}
          <div className={styles.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Expenses Table */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              {activeTab === 'All' ? t('expenses.allExpenses') : activeTab}
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('expenses.date')}</th>
                    <th>{t('expenses.category')}</th>
                    <th>{t('expenses.amount')}</th>
                    <th>Merchant</th>
                    <th>{t('common.description')}</th>
                    <th>{t('expenses.receipt')}</th>
                    <th>{t('expenses.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Inline create row */}
                  {inline.isCreating && (
                    <tr>
                      <td>
                        <EditableCell
                          editing
                          type="date"
                          value={inline.createDraft.expenseDate ?? ''}
                          onChange={(v) => inline.updateCreateField('expenseDate', v)}
                        />
                      </td>
                      <td>
                        <EditableCell
                          editing
                          type="select"
                          options={CATEGORY_OPTIONS}
                          value={inline.createDraft.category ?? ''}
                          onChange={(v) => inline.updateCreateField('category', v)}
                        />
                      </td>
                      <td>
                        <EditableCell
                          editing
                          type="number"
                          value={inline.createDraft.amount ?? 0}
                          onChange={(v) => inline.updateCreateField('amount', v)}
                          placeholder="0.00"
                        />
                      </td>
                      <td>
                        <EditableCell
                          editing
                          type="text"
                          value={inline.createDraft.merchant ?? ''}
                          onChange={(v) => inline.updateCreateField('merchant', v)}
                          placeholder="Merchant name"
                        />
                      </td>
                      <td>
                        <EditableCell
                          editing
                          type="text"
                          value={inline.createDraft.description ?? ''}
                          onChange={(v) => inline.updateCreateField('description', v)}
                          placeholder="Description"
                        />
                      </td>
                      <td>--</td>
                      <td>
                        <span className={getStatusBadge('Pending')}>Pending</span>
                      </td>
                      <td>
                        <RowActions
                          mode="creating"
                          onSave={handleCreate}
                          onCancel={() => inline.cancelCreate()}
                        />
                      </td>
                    </tr>
                  )}

                  {crud.loading && !crud.data.length && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                        {t('common.loading')}
                      </td>
                    </tr>
                  )}

                  {!crud.loading && !crud.data.length && !inline.isCreating && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#86909C' }}>
                        No expenses found
                      </td>
                    </tr>
                  )}

                  {crud.data.map((expense) => {
                    const isEditing = inline.editingId === expense.id;
                    const isDeleting = inline.deleteConfirmId === expense.id;
                    const draft = isEditing ? inline.editDraft : expense;

                    return (
                      <tr key={expense.id}>
                        <td>
                          <EditableCell
                            editing={isEditing}
                            type="date"
                            value={draft.expenseDate ?? ''}
                            onChange={(v) => inline.updateEditField('expenseDate', v)}
                          />
                        </td>
                        <td>
                          <EditableCell
                            editing={isEditing}
                            type="select"
                            options={CATEGORY_OPTIONS}
                            value={draft.category ?? ''}
                            onChange={(v) => inline.updateEditField('category', v)}
                          />
                        </td>
                        <td>
                          <EditableCell
                            editing={isEditing}
                            type="number"
                            value={draft.amount ?? 0}
                            onChange={(v) => inline.updateEditField('amount', v)}
                            displayRender={(val: number) => formatCurrency(val, expense.currency)}
                          />
                        </td>
                        <td>
                          <EditableCell
                            editing={isEditing}
                            type="text"
                            value={draft.merchant ?? ''}
                            onChange={(v) => inline.updateEditField('merchant', v)}
                            placeholder="Merchant"
                          />
                        </td>
                        <td>
                          <EditableCell
                            editing={isEditing}
                            type="text"
                            value={draft.description ?? ''}
                            onChange={(v) => inline.updateEditField('description', v)}
                            placeholder="Description"
                          />
                        </td>
                        <td>
                          <span className={expense.receiptUrl ? styles.receiptIcon : styles.receiptNone}>
                            {expense.receiptUrl ? '[ok]' : '[--]'}
                          </span>
                        </td>
                        <td>
                          <EditableCell
                            editing={isEditing}
                            type="select"
                            options={STATUS_OPTIONS}
                            value={draft.status ?? ''}
                            onChange={(v) => inline.updateEditField('status', v)}
                            displayRender={(val: string) => (
                              <span className={getStatusBadge(val)}>{val}</span>
                            )}
                          />
                        </td>
                        <td>
                          <RowActions
                            mode={isDeleting ? 'deleting' : isEditing ? 'editing' : 'read'}
                            onEdit={() => inline.startEdit(expense.id, expense)}
                            onDelete={() => inline.requestDelete(expense.id)}
                            onSave={handleSave}
                            onCancel={() => inline.cancelEdit()}
                            onConfirmDelete={() => handleDelete(expense.id)}
                            onCancelDelete={() => inline.cancelDelete()}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Category Breakdown Sidebar */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Category Breakdown</div>
          <div className={styles.catBreakdown}>
            {categories.map((c) => (
              <div key={c.label} className={styles.catRow}>
                <span className={styles.catLabel}>{c.label}</span>
                <div className={styles.catBarWrap}>
                  <div
                    className={`${styles.catBar} ${styles[c.bar as keyof typeof styles]}`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <span className={styles.catAmt}>{c.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
