'use client';

import { useState, useCallback } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { useCRUD } from '@/lib/hooks/use-crud';
import { useInlineEdit } from '@/lib/hooks/use-inline-edit';
import { useToast } from '@/components/ui/Toast';
import { EditableCell } from '@/components/inline-edit/EditableCell';
import { RowActions } from '@/components/inline-edit/RowActions';
import styles from './payments.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PaymentBatch {
  id: string;
  tenantId: string;
  totalAmount: number;
  currency: string;
  paymentCount: number;
  status: string;
  method: string;
  processedAt: string | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Constants & static display data                                    */
/* ------------------------------------------------------------------ */

const TABS = ['All', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const;

const TAB_LABELS: Record<string, string> = {
  All: 'payments.all',
  PENDING: 'payments.pending',
  PROCESSING: 'common.processing',
  COMPLETED: 'payments.completed',
  FAILED: 'payments.failed',
};

const METHOD_OPTIONS = [
  { label: 'ACH', value: 'ACH' },
  { label: 'Wire', value: 'WIRE' },
  { label: 'Virtual Card', value: 'VIRTUAL_CARD' },
  { label: 'SEPA', value: 'SEPA' },
  { label: 'BACS', value: 'BACS' },
  { label: 'Check', value: 'CHECK' },
];

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
];

const paymentMethods = [
  { label: 'ACH', pct: 45, bar: 'barACH' },
  { label: 'Wire', pct: 20, bar: 'barWire' },
  { label: 'Virtual Card', pct: 25, bar: 'barVCard' },
  { label: 'SEPA', pct: 8, bar: 'barSEPA' },
  { label: 'Check', pct: 2, bar: 'barCheck' },
];

const aiSuggestions = [
  {
    title: 'Consolidate ACH Batch for Feb 3-5',
    desc: 'Combining 4 pending ACH payments into a single batch would reduce processing fees.',
    savings: 'Save $340 in fees',
  },
  {
    title: 'Switch Atlas Manufacturing to Virtual Card',
    desc: 'This supplier accepts virtual cards. Switching from wire would earn 1.5% cashback on $92,100.',
    savings: 'Earn $1,382 rebate',
  },
  {
    title: 'Early Payment Discount - Pinnacle Consulting',
    desc: 'Pay INV-8839 by Jan 31 (2 days early) to capture 2/10 net 30 discount.',
    savings: 'Save $1,350',
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getBadgeClass(status: string) {
  const map: Record<string, string> = {
    PENDING: styles.badgePending,
    PROCESSING: styles.badgeProcessing,
    COMPLETED: styles.badgeCompleted,
    FAILED: styles.badgeFailed,
  };
  return `${styles.badge} ${map[status] || ''}`;
}

function formatMethodLabel(method: string) {
  const map: Record<string, string> = {
    ACH: 'ACH',
    WIRE: 'Wire',
    VIRTUAL_CARD: 'Virtual Card',
    SEPA: 'SEPA',
    BACS: 'BACS',
    CHECK: 'Check',
  };
  return map[method] || method;
}

function formatStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  };
  return map[status] || status;
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PaymentsPage() {
  const t = useT();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('All');
  const [saving, setSaving] = useState(false);

  /* ---- CRUD ---- */
  const statusFilter = activeTab === 'All' ? undefined : activeTab;
  const {
    data: batches,
    loading,
    error,
    pagination,
    fetchAll,
    create,
    update,
    remove,
  } = useCRUD<PaymentBatch>({
    endpoint: '/api/payment-batches',
    defaultParams: statusFilter ? { status: statusFilter } : {},
  });

  /* ---- Inline edit ---- */
  const {
    editingId,
    editDraft,
    isCreating,
    createDraft,
    deleteConfirmId,
    startEdit,
    updateEditField,
    cancelEdit,
    startCreate,
    updateCreateField,
    cancelCreate,
    requestDelete,
    cancelDelete,
  } = useInlineEdit<PaymentBatch>();

  /* ---- Tab change refetch ---- */
  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      cancelEdit();
      cancelCreate();
      const params: Record<string, string> = tab === 'All' ? {} : { status: tab };
      fetchAll(params);
    },
    [fetchAll, cancelEdit, cancelCreate],
  );

  /* ---- Handlers ---- */
  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;
    setSaving(true);
    const result = await update(editingId, editDraft);
    setSaving(false);
    if (result) {
      cancelEdit();
      addToast({ type: 'success', title: 'Payment batch updated' });
    } else {
      addToast({ type: 'error', title: 'Failed to update payment batch' });
    }
  }, [editingId, editDraft, update, cancelEdit, addToast]);

  const handleSaveCreate = useCallback(async () => {
    const { totalAmount, paymentCount, method, tenantId } = createDraft as Partial<PaymentBatch>;
    if (!totalAmount || !paymentCount || !method || !tenantId) {
      addToast({
        type: 'warning',
        title: 'Missing required fields',
        message: 'totalAmount, paymentCount, method, and tenantId are required.',
      });
      return;
    }
    setSaving(true);
    const result = await create(createDraft);
    setSaving(false);
    if (result) {
      cancelCreate();
      addToast({ type: 'success', title: 'Payment batch created' });
    } else {
      addToast({ type: 'error', title: 'Failed to create payment batch' });
    }
  }, [createDraft, create, cancelCreate, addToast]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmId) return;
    setSaving(true);
    const ok = await remove(deleteConfirmId);
    setSaving(false);
    if (ok) {
      cancelDelete();
      addToast({ type: 'success', title: 'Payment batch deleted' });
    } else {
      addToast({ type: 'error', title: 'Failed to delete payment batch' });
    }
  }, [deleteConfirmId, remove, cancelDelete, addToast]);

  const handleAddNew = useCallback(() => {
    startCreate({ currency: 'USD', status: 'PENDING', tenantId: '', method: 'ACH' } as Partial<PaymentBatch>);
  }, [startCreate]);

  /* ---- Render helpers ---- */
  function rowMode(batch: PaymentBatch): 'read' | 'editing' | 'deleting' {
    if (deleteConfirmId === batch.id) return 'deleting';
    if (editingId === batch.id) return 'editing';
    return 'read';
  }

  return (
    <div className={styles.container}>
      {/* ---------- Header ---------- */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t('payments.title')}</h1>
          <p>{t('payments.subtitle')}</p>
        </div>
        <button className={styles.createBtn} onClick={handleAddNew}>
          {t('payments.createPaymentBatch')}
        </button>
      </div>

      {/* ---------- KPIs ---------- */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('payments.totalPaidMTD')}</div>
          <div className={styles.kpiValue}>$2.4M</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>+12.3% vs last month</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('payments.pending')}</div>
          <div className={styles.kpiValue}>$847K</div>
          <div className={`${styles.kpiSub} ${styles.kpiNeutral}`}>23 invoices awaiting</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('payments.discountsCaptured')}</div>
          <div className={styles.kpiValue}>$156K</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>94% capture rate</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('payments.virtualCardRebates')}</div>
          <div className={styles.kpiValue}>$42K</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>1.5% avg cashback</div>
        </div>
      </div>

      {/* ---------- Payment Methods Breakdown ---------- */}
      <div className={styles.methodsCard}>
        <div className={styles.methodsTitle}>{t('payments.paymentMethodsBreakdown')}</div>
        {paymentMethods.map((m) => (
          <div key={m.label} className={styles.methodRow}>
            <span className={styles.methodLabel}>{m.label}</span>
            <div className={styles.methodBarWrap}>
              <div
                className={`${styles.methodBar} ${styles[m.bar as keyof typeof styles]}`}
                style={{ width: `${m.pct}%` }}
              />
            </div>
            <span className={styles.methodPct}>{m.pct}%</span>
          </div>
        ))}
      </div>

      {/* ---------- AI Suggestions ---------- */}
      <div className={styles.aiCard}>
        <div className={styles.aiHeader}>
          <div className={styles.aiIcon}>AI</div>
          <h3 className={styles.aiTitle}>{t('payments.aiSuggestionsTitle')}</h3>
        </div>
        {aiSuggestions.map((s, i) => (
          <div key={i} className={styles.aiSuggestion}>
            <div className={styles.aiSugTitle}>{s.title}</div>
            <div className={styles.aiSugDesc}>
              {s.desc}{' '}
              <span className={styles.aiSavings}>{s.savings}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Tabs ---------- */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => handleTabChange(tab)}
          >
            {t(TAB_LABELS[tab] || tab)}
          </button>
        ))}
      </div>

      {/* ---------- Payment Batches Table ---------- */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('payments.paymentBatches')}</div>

        {error && (
          <div style={{ color: '#F76560', marginBottom: '1rem', fontSize: '0.8125rem' }}>
            {error}
          </div>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('payments.total')}</th>
                <th>{t('payments.count')}</th>
                <th>{t('payments.method')}</th>
                <th>Currency</th>
                <th>{t('payments.status')}</th>
                <th>{t('payments.date')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {/* ---- Create row ---- */}
              {isCreating && (
                <tr>
                  <td>
                    <span style={{ color: '#4E5969', fontStyle: 'italic' }}>New</span>
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={createDraft.totalAmount ?? ''}
                      onChange={(v) => updateCreateField('totalAmount', v)}
                      type="number"
                      placeholder="0.00"
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={createDraft.paymentCount ?? ''}
                      onChange={(v) => updateCreateField('paymentCount', v)}
                      type="number"
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={createDraft.method ?? ''}
                      onChange={(v) => updateCreateField('method', v)}
                      type="select"
                      options={METHOD_OPTIONS}
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={createDraft.currency ?? 'USD'}
                      onChange={(v) => updateCreateField('currency', v)}
                      type="text"
                      placeholder="USD"
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={createDraft.status ?? 'PENDING'}
                      onChange={(v) => updateCreateField('status', v)}
                      type="select"
                      options={STATUS_OPTIONS}
                    />
                  </td>
                  <td>-</td>
                  <td>
                    <RowActions
                      mode="creating"
                      onSave={handleSaveCreate}
                      onCancel={cancelCreate}
                      saving={saving}
                    />
                  </td>
                </tr>
              )}

              {/* ---- Loading state ---- */}
              {loading && batches.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#4E5969' }}>
                    Loading...
                  </td>
                </tr>
              )}

              {/* ---- Empty state ---- */}
              {!loading && batches.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#4E5969' }}>
                    No payment batches found.
                  </td>
                </tr>
              )}

              {/* ---- Data rows ---- */}
              {batches.map((batch) => {
                const isEditing = editingId === batch.id;
                const mode = rowMode(batch);

                return (
                  <tr key={batch.id}>
                    <td>{batch.id.slice(0, 8)}</td>

                    {/* totalAmount */}
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? editDraft.totalAmount : batch.totalAmount}
                        onChange={(v) => updateEditField('totalAmount', v)}
                        type="number"
                        displayRender={(v) => formatCurrency(v, batch.currency)}
                      />
                    </td>

                    {/* paymentCount */}
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? editDraft.paymentCount : batch.paymentCount}
                        onChange={(v) => updateEditField('paymentCount', v)}
                        type="number"
                      />
                    </td>

                    {/* method */}
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? editDraft.method : batch.method}
                        onChange={(v) => updateEditField('method', v)}
                        type="select"
                        options={METHOD_OPTIONS}
                        displayRender={(v) => (
                          <span className={styles.methodTag}>{formatMethodLabel(v)}</span>
                        )}
                      />
                    </td>

                    {/* currency */}
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? editDraft.currency : batch.currency}
                        onChange={(v) => updateEditField('currency', v)}
                        type="text"
                      />
                    </td>

                    {/* status */}
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? editDraft.status : batch.status}
                        onChange={(v) => updateEditField('status', v)}
                        type="select"
                        options={STATUS_OPTIONS}
                        displayRender={(v) => (
                          <span className={getBadgeClass(v)}>{formatStatusLabel(v)}</span>
                        )}
                      />
                    </td>

                    {/* createdAt */}
                    <td>{batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : '-'}</td>

                    {/* actions */}
                    <td>
                      <RowActions
                        mode={mode}
                        onEdit={() => startEdit(batch.id, batch)}
                        onDelete={() => requestDelete(batch.id)}
                        onSave={handleSaveEdit}
                        onCancel={cancelEdit}
                        onConfirmDelete={handleConfirmDelete}
                        onCancelDelete={cancelDelete}
                        saving={saving}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ---- Pagination info ---- */}
        {pagination.totalCount > 0 && (
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#4E5969' }}>
            Showing {batches.length} of {pagination.totalCount} batches
          </div>
        )}
      </div>

      {/* ---------- Unified Payment Monetization Dashboard ---------- */}
      <div className={styles.monetizationSection}>
        <div className={styles.monetizationHeader}>
          <div className={styles.monetizationHeaderLeft}>
            <div className={styles.monetizationTitle}>Unified Payment Monetization Dashboard</div>
            <div className={styles.monetizationSubtitle}>Cross-product view of all payment-derived revenue streams</div>
          </div>
          <span className={styles.monetizationTagline}>Revenue Beyond SaaS</span>
        </div>

        {/* Stacked Horizontal Bar Chart */}
        <div className={styles.stackedBarSection}>
          <div className={styles.stackedBarTitle}>Monthly Monetization by Revenue Stream</div>
          <div className={styles.stackedBarTotal}>
            <span className={styles.stackedBarTotalValue}>$231.6K</span>
            <span className={styles.stackedBarTotalSub}>/month</span>
            <span className={styles.stackedBarTotalAnnual}>$2.78M annualized</span>
          </div>
          <div className={styles.stackedBarWrap}>
            <div className={`${styles.stackedBarSegment} ${styles.stackedSegDynDisc}`} style={{ width: '67.4%' }} title="Dynamic Discounting: $156K/mo">
              $156K
            </div>
            <div className={`${styles.stackedBarSegment} ${styles.stackedSegVCard}`} style={{ width: '18.1%' }} title="Virtual Card Rebates: $42K/mo">
              $42K
            </div>
            <div className={`${styles.stackedBarSegment} ${styles.stackedSegSCF}`} style={{ width: '10.9%' }} title="SCF Program Fees: $25.2K/mo">
              $25.2K
            </div>
            <div className={`${styles.stackedBarSegment} ${styles.stackedSegCostSav}`} style={{ width: '3.6%' }} title="Payment Cost Savings: $8.4K/mo">
            </div>
          </div>
          <div className={styles.stackedBarLegend}>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendDotBlue}`} />Dynamic Discounting (67.4%)</span>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendDotGreen}`} />Virtual Card Rebates (18.1%)</span>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendDotPurple}`} />SCF Program Fees (10.9%)</span>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendDotAmber}`} />Payment Cost Savings (3.6%)</span>
          </div>
        </div>

        {/* Revenue Stream Cards */}
        <div className={styles.revenueStreamGrid}>
          <div className={styles.revenueStreamCard}>
            <div className={`${styles.revenueStreamCardAccent} ${styles.accentBlue}`} />
            <div className={styles.revenueStreamLabel}>Dynamic Discounting</div>
            <div className={styles.revenueStreamValue}>$1.87M</div>
            <div className={styles.revenueStreamMonthly}>$156K/month</div>
            <div className={styles.revenueStreamPct}>67.4% of total</div>
          </div>
          <div className={styles.revenueStreamCard}>
            <div className={`${styles.revenueStreamCardAccent} ${styles.accentGreen}`} />
            <div className={styles.revenueStreamLabel}>Virtual Card Rebates</div>
            <div className={styles.revenueStreamValue}>$504K</div>
            <div className={styles.revenueStreamMonthly}>$42K/month</div>
            <div className={styles.revenueStreamTarget}>Target: $847K (+68%)</div>
          </div>
          <div className={styles.revenueStreamCard}>
            <div className={`${styles.revenueStreamCardAccent} ${styles.accentPurple}`} />
            <div className={styles.revenueStreamLabel}>SCF Program Fees</div>
            <div className={styles.revenueStreamValue}>$302K</div>
            <div className={styles.revenueStreamMonthly}>$25.2K/month</div>
            <div className={styles.revenueStreamPct}>10.9% of total</div>
          </div>
          <div className={styles.revenueStreamCard}>
            <div className={`${styles.revenueStreamCardAccent} ${styles.accentAmber}`} />
            <div className={styles.revenueStreamLabel}>Payment Cost Savings</div>
            <div className={styles.revenueStreamValue}>$101K</div>
            <div className={styles.revenueStreamMonthly}>$8.4K/month</div>
            <div className={styles.revenueStreamPct}>3.6% of total</div>
          </div>
        </div>

        {/* Total Monetization Impact */}
        <div className={styles.totalImpactCard}>
          <div className={styles.totalImpactLeft}>
            <div className={styles.totalImpactLabel}>Total Monetization Impact</div>
            <div className={styles.totalImpactValue}>$231.6K/month</div>
            <div className={styles.totalImpactSub}>Revenue diversification beyond SaaS subscriptions</div>
          </div>
          <div className={styles.totalImpactRight}>
            <div className={styles.totalImpactAnnual}>$2.78M</div>
            <div className={styles.totalImpactAnnualLabel}>Annualized</div>
          </div>
        </div>
      </div>

      {/* ---------- Payment Intelligence Summary ---------- */}
      <div className={styles.intelligenceSection}>
        <div className={styles.intelligenceHeader}>
          <div className={styles.intelligenceIcon}>AI</div>
          <div className={styles.intelligenceTitle}>Payment Intelligence Summary</div>
          <span className={styles.intelligenceBadge}>ICE Score 21</span>
        </div>

        {/* Key Insight */}
        <div className={styles.insightCard}>
          <div className={styles.insightQuote}>
            For every <span className={styles.insightHighlight}>$1M</span> in payments processed, Medius generates{' '}
            <span className={styles.insightHighlight}>$23.1K</span> in monetization revenue
          </div>
        </div>

        {/* Monetization Rate + Trend */}
        <div className={styles.trendRow}>
          <div className={styles.trendCard}>
            <div className={styles.trendCardLabel}>Monetization Rate Trend</div>
            <div className={styles.trendValues}>
              <span className={styles.trendBefore}>1.8%</span>
              <span className={styles.trendAfter}>2.3%</span>
            </div>
            <div className={styles.trendSub}>+0.5% improvement over 6 months</div>
            <div className={styles.trendBarWrap}>
              <div className={`${styles.trendBar} ${styles.trendBarGreen}`} style={{ width: '76%' }} />
            </div>
          </div>
          <div className={styles.trendCard}>
            <div className={styles.trendCardLabel}>Revenue per $1M Processed</div>
            <div className={styles.trendValues}>
              <span className={styles.trendAfter}>$23.1K</span>
            </div>
            <div className={styles.trendSub}>Blended rate across all monetization channels</div>
            <div className={styles.trendBarWrap}>
              <div className={`${styles.trendBar} ${styles.trendBarBlue}`} style={{ width: '65%' }} />
            </div>
          </div>
        </div>

        {/* Top Optimization Opportunity */}
        <div className={styles.optimizationCard}>
          <span className={styles.optimizationBadge}>Top Optimization</span>
          <div className={styles.optimizationText}>
            Converting 15 remaining ACH suppliers to virtual cards would add{' '}
            <span className={styles.optimizationValue}>$183K/year</span>{' '}
            in rebate revenue. Current virtual card adoption is at 40 suppliers with a target of 120.
          </div>
        </div>

        {/* Supplier Adoption Funnel */}
        <div className={styles.funnelCard}>
          <div className={styles.funnelTitle}>Supplier Adoption Funnel</div>
          <div className={styles.funnelSteps}>
            <div className={styles.funnelStep}>
              <span className={styles.funnelLabel}>Total Suppliers</span>
              <div className={styles.funnelBarOuter}>
                <div className={`${styles.funnelBar} ${styles.funnelBarBlue}`} style={{ width: '100%' }}>340</div>
              </div>
              <span className={styles.funnelValue}>340</span>
            </div>
            <div className={styles.funnelStep}>
              <span className={styles.funnelLabel}>Optimized Terms</span>
              <div className={styles.funnelBarOuter}>
                <div className={`${styles.funnelBar} ${styles.funnelBarPurple}`} style={{ width: '58.8%' }}>200</div>
              </div>
              <span className={styles.funnelValue}>200</span>
            </div>
            <div className={styles.funnelStep}>
              <span className={styles.funnelLabel}>On Virtual Cards</span>
              <div className={styles.funnelBarOuter}>
                <div className={`${styles.funnelBar} ${styles.funnelBarGreen}`} style={{ width: '11.8%' }}>40</div>
              </div>
              <span className={styles.funnelValue}>40</span>
            </div>
            <div className={styles.funnelStep}>
              <span className={styles.funnelLabel}>Target on Cards</span>
              <div className={styles.funnelBarOuter}>
                <div className={`${styles.funnelBar} ${styles.funnelBarAmber}`} style={{ width: '35.3%' }}>120</div>
              </div>
              <span className={styles.funnelValue}>120</span>
            </div>
          </div>
          <div className={styles.funnelTarget}>
            <span className={styles.funnelTargetLabel}>Gap to close:</span>
            <span className={styles.funnelTargetValue}>80 suppliers (40 &#8594; 120)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
