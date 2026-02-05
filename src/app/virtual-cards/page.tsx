'use client';

import { useState, useCallback } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { useCRUD } from '@/lib/hooks/use-crud';
import { useInlineEdit } from '@/lib/hooks/use-inline-edit';
import { useToast } from '@/components/ui/Toast';
import { EditableCell } from '@/components/inline-edit/EditableCell';
import { RowActions } from '@/components/inline-edit/RowActions';
import styles from './virtual-cards.module.css';

/* ---------- Types ---------- */

interface VirtualCard {
  id: string;
  tenantId: string;
  supplierId: string;
  cardNumber: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

/* ---------- Static display data ---------- */

const TABS = ['All', 'Enrolled', 'Invited', 'Declined', 'Not Contacted'] as const;

const supplierEnablement = [
  { name: 'Acme Corp', eligible: 'Yes', currentMethod: 'ACH', potentialRebate: '$8,400', status: 'Enrolled' },
  { name: 'Global Logistics Inc', eligible: 'Yes', currentMethod: 'Wire', potentialRebate: '$22,800', status: 'Enrolled' },
  { name: 'TechParts Ltd', eligible: 'Yes', currentMethod: 'ACH', potentialRebate: '$3,200', status: 'Enrolled' },
  { name: 'Pinnacle Consulting', eligible: 'Pending', currentMethod: 'Wire', potentialRebate: '$14,200', status: 'Invited' },
  { name: 'Metro Freight', eligible: 'Yes', currentMethod: 'ACH', potentialRebate: '$5,600', status: 'Enrolled' },
  { name: 'CloudServ Pro', eligible: 'Yes', currentMethod: 'ACH', potentialRebate: '$1,800', status: 'Enrolled' },
  { name: 'DataFlow Systems', eligible: 'Yes', currentMethod: 'Wire', potentialRebate: '$4,200', status: 'Invited' },
  { name: 'EuroParts GmbH', eligible: 'No', currentMethod: 'SEPA', potentialRebate: '-', status: 'Declined' },
  { name: 'Summit Marketing', eligible: 'Yes', currentMethod: 'Check', potentialRebate: '$2,100', status: 'Not Contacted' },
  { name: 'NorthStar Logistics', eligible: 'Yes', currentMethod: 'ACH', potentialRebate: '$11,200', status: 'Enrolled' },
  { name: 'ByteWare Solutions', eligible: 'Yes', currentMethod: 'ACH', potentialRebate: '$1,400', status: 'Enrolled' },
  { name: 'Precision Tools Inc', eligible: 'Pending', currentMethod: 'Wire', potentialRebate: '$7,800', status: 'Invited' },
  { name: 'GreenEnergy Solutions', eligible: 'Yes', currentMethod: 'ACH', potentialRebate: '$3,600', status: 'Enrolled' },
  { name: 'Pacific Imports', eligible: 'No', currentMethod: 'SEPA', potentialRebate: '-', status: 'Declined' },
  { name: 'ClearView Analytics', eligible: 'Yes', currentMethod: 'ACH', potentialRebate: '$2,800', status: 'Enrolled' },
  { name: 'Atlas Manufacturing', eligible: 'Yes', currentMethod: 'Wire', potentialRebate: '$18,600', status: 'Enrolled' },
  { name: 'CoreTech Industries', eligible: 'Yes', currentMethod: 'Wire', potentialRebate: '$13,400', status: 'Invited' },
  { name: 'Henderson Legal', eligible: 'Pending', currentMethod: 'Check', potentialRebate: '$3,200', status: 'Not Contacted' },
  { name: 'BlueWave Media', eligible: 'Yes', currentMethod: 'ACH', potentialRebate: '$800', status: 'Enrolled' },
  { name: 'Silverline Distributors', eligible: 'Yes', currentMethod: 'ACH', potentialRebate: '$6,400', status: 'Enrolled' },
  { name: 'Quantum Research', eligible: 'Yes', currentMethod: 'Check', potentialRebate: '$1,200', status: 'Not Contacted' },
  { name: 'Westfield Partners', eligible: 'Yes', currentMethod: 'Wire', potentialRebate: '$9,800', status: 'Invited' },
  { name: 'Apex Components', eligible: 'No', currentMethod: 'ACH', potentialRebate: '-', status: 'Declined' },
  { name: 'Cascade Systems', eligible: 'Yes', currentMethod: 'ACH', potentialRebate: '$4,600', status: 'Not Contacted' },
  { name: 'Pinnacle Freight Co', eligible: 'Yes', currentMethod: 'Wire', potentialRebate: '$7,200', status: 'Enrolled' },
];

const monthlyRebates = [
  { month: 'Feb', rebate: 28 },
  { month: 'Mar', rebate: 30 },
  { month: 'Apr', rebate: 26 },
  { month: 'May', rebate: 32 },
  { month: 'Jun', rebate: 34 },
  { month: 'Jul', rebate: 31 },
  { month: 'Aug', rebate: 36 },
  { month: 'Sep', rebate: 38 },
  { month: 'Oct', rebate: 35 },
  { month: 'Nov', rebate: 40 },
  { month: 'Dec', rebate: 39 },
  { month: 'Jan', rebate: 42 },
];

const maxRebate = Math.max(...monthlyRebates.map((m) => m.rebate));

const rebateByCategory = [
  { category: 'IT & Software', pct: 32, bar: 'categoryBarIT' },
  { category: 'Logistics', pct: 24, bar: 'categoryBarLogistics' },
  { category: 'Manufacturing', pct: 18, bar: 'categoryBarMfg' },
  { category: 'Services', pct: 14, bar: 'categoryBarServices' },
  { category: 'Marketing', pct: 8, bar: 'categoryBarMktg' },
  { category: 'Facilities', pct: 4, bar: 'categoryBarFacilities' },
];

const topRebateSuppliers = [
  { rank: 1, name: 'Atlas Manufacturing', rebate: '$18,600' },
  { rank: 2, name: 'Global Logistics Inc', rebate: '$15,200' },
  { rank: 3, name: 'CoreTech Industries', rebate: '$13,400' },
  { rank: 4, name: 'NorthStar Logistics', rebate: '$11,200' },
  { rank: 5, name: 'Westfield Partners', rebate: '$9,800' },
  { rank: 6, name: 'Acme Corp', rebate: '$8,400' },
  { rank: 7, name: 'Precision Tools Inc', rebate: '$7,800' },
  { rank: 8, name: 'Pinnacle Freight Co', rebate: '$7,200' },
  { rank: 9, name: 'Silverline Distributors', rebate: '$6,400' },
  { rank: 10, name: 'Metro Freight', rebate: '$5,600' },
];

const aiRecommendations = [
  {
    supplier: 'CoreTech Industries',
    currentMethod: 'Wire',
    annualVolume: '$892,000',
    estRebate: '$13,380',
    reason: 'High-volume wire supplier with 98% on-time payment history. Supplier has confirmed virtual card acceptance capability.',
  },
  {
    supplier: 'Pinnacle Consulting',
    currentMethod: 'Wire',
    annualVolume: '$540,000',
    estRebate: '$8,100',
    reason: 'Professional services supplier with quarterly billing cycle. Converting would consolidate 4 wire transfers into card payments.',
  },
  {
    supplier: 'DataFlow Systems',
    currentMethod: 'Wire',
    annualVolume: '$265,200',
    estRebate: '$3,978',
    reason: 'SaaS vendor currently paid via wire. Industry analysis shows 85% of similar vendors accept virtual cards.',
  },
  {
    supplier: 'Summit Marketing',
    currentMethod: 'Check',
    annualVolume: '$111,000',
    estRebate: '$1,665',
    reason: 'Check-paid supplier incurring $45/payment processing costs. Card conversion eliminates check costs and earns rebates.',
  },
  {
    supplier: 'Cascade Systems',
    currentMethod: 'ACH',
    annualVolume: '$307,200',
    estRebate: '$4,608',
    reason: 'Medium-volume IT supplier. ACH-to-card conversion offers highest incremental rebate in the IT category.',
  },
];

const paymentMethodDist = [
  { method: 'ACH', pct: 42, target: 35, color: '#165DFF', dot: 'dotACH' },
  { method: 'Wire', pct: 18, target: 12, color: '#8E51DA', dot: 'dotWire' },
  { method: 'Virtual Card', pct: 25, target: 38, color: '#23C343', dot: 'dotCard' },
  { method: 'SEPA', pct: 8, target: 8, color: '#FF9A2E', dot: 'dotSEPA' },
  { method: 'Check', pct: 7, target: 2, color: '#F76560', dot: 'dotCheck' },
];

/* ---------- Status options for inline editing ---------- */

const CARD_STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Used', value: 'USED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Expired', value: 'EXPIRED' },
];

/* ---------- Badge helpers ---------- */

function getEligibleBadgeClass(eligible: string) {
  const map: Record<string, string> = {
    Yes: styles.badgeYes,
    No: styles.badgeNo,
    Pending: styles.badgePending,
  };
  return `${styles.badge} ${map[eligible] || ''}`;
}

function getStatusBadgeClass(status: string) {
  const map: Record<string, string> = {
    Enrolled: styles.badgeEnrolled,
    Invited: styles.badgeInvited,
    Declined: styles.badgeDeclined,
    'Not Contacted': styles.badgeNotContacted,
  };
  return `${styles.badge} ${map[status] || ''}`;
}

function getCardBadgeClass(status: string) {
  const map: Record<string, string> = {
    ACTIVE: styles.badgeActive,
    USED: styles.badgeUsed,
    CANCELLED: styles.badgeCancelled,
    EXPIRED: styles.badgeExpired,
    // Legacy display-cased values
    Active: styles.badgeActive,
    Used: styles.badgeUsed,
    Cancelled: styles.badgeCancelled,
    Issued: styles.badgeIssued,
  };
  return `${styles.badge} ${map[status] || ''}`;
}

function formatCardStatus(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'Active',
    USED: 'Used',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired',
  };
  return map[status] || status;
}

function buildConicGradient() {
  let offset = 0;
  const segments = paymentMethodDist.map((m) => {
    const start = offset;
    offset += m.pct;
    return `${m.color} ${start}% ${offset}%`;
  });
  return `conic-gradient(${segments.join(', ')})`;
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/* ---------- Page component ---------- */

export default function VirtualCardsPage() {
  const t = useT();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('All');
  const [saving, setSaving] = useState(false);

  /* CRUD hook for virtual cards */
  const crud = useCRUD<VirtualCard>({ endpoint: '/api/virtual-cards' });

  /* Inline editing hook */
  const inline = useInlineEdit<VirtualCard>();

  /* ---------- CRUD handlers ---------- */

  const handleSaveCreate = useCallback(async () => {
    const draft = inline.createDraft;
    if (!draft.supplierId || !draft.cardNumber || !draft.amount || !draft.expiresAt) {
      addToast({ type: 'warning', title: 'Missing required fields', message: 'Please fill in supplierId, cardNumber, amount, and expiresAt.' });
      return;
    }
    setSaving(true);
    const result = await crud.create({
      supplierId: draft.supplierId,
      cardNumber: draft.cardNumber,
      amount: draft.amount,
      currency: draft.currency || 'USD',
      status: draft.status || 'ACTIVE',
      expiresAt: draft.expiresAt,
      tenantId: draft.tenantId || 'default',
    });
    setSaving(false);
    if (result) {
      inline.cancelCreate();
      addToast({ type: 'success', title: 'Card created', message: `Virtual card ${result.cardNumber} has been created.` });
    } else {
      addToast({ type: 'error', title: 'Create failed', message: crud.error || 'Could not create virtual card.' });
    }
  }, [inline, crud, addToast]);

  const handleSaveEdit = useCallback(async () => {
    if (!inline.editingId) return;
    setSaving(true);
    const result = await crud.update(inline.editingId, {
      cardNumber: inline.editDraft.cardNumber,
      amount: inline.editDraft.amount,
      currency: inline.editDraft.currency,
      status: inline.editDraft.status,
      expiresAt: inline.editDraft.expiresAt,
    });
    setSaving(false);
    if (result) {
      inline.cancelEdit();
      addToast({ type: 'success', title: 'Card updated', message: `Virtual card ${result.cardNumber} has been updated.` });
    } else {
      addToast({ type: 'error', title: 'Update failed', message: crud.error || 'Could not update virtual card.' });
    }
  }, [inline, crud, addToast]);

  const handleConfirmDelete = useCallback(async () => {
    if (!inline.deleteConfirmId) return;
    setSaving(true);
    const ok = await crud.remove(inline.deleteConfirmId);
    setSaving(false);
    if (ok) {
      inline.cancelDelete();
      addToast({ type: 'success', title: 'Card deleted', message: 'Virtual card has been removed.' });
    } else {
      addToast({ type: 'error', title: 'Delete failed', message: crud.error || 'Could not delete virtual card.' });
    }
  }, [inline, crud, addToast]);

  /* ---------- Supplier enablement filter ---------- */

  const filteredSuppliers =
    activeTab === 'All'
      ? supplierEnablement
      : supplierEnablement.filter((s) => s.status === activeTab);

  /* ---------- Render ---------- */

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t('virtualCards.title')}</h1>
          <p>{t('virtualCards.subtitle')}</p>
        </div>
        <button
          className={styles.createBtn}
          onClick={() => inline.startCreate({ currency: 'USD', status: 'ACTIVE' })}
        >
          {t('virtualCards.generateCard')}
        </button>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('virtualCards.totalSpend')}</div>
          <div className={styles.kpiValue}>$1.8M</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>+22.4% vs last month</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('virtualCards.rebatesEarned')}</div>
          <div className={styles.kpiValue}>$42K</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>1.5% avg cashback</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('virtualCards.activeCards')}</div>
          <div className={styles.kpiValue}>38%</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>+5% from last quarter</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('virtualCards.avgTransaction')}</div>
          <div className={styles.kpiValue}>234</div>
          <div className={`${styles.kpiSub} ${styles.kpiNeutral}`}>12 active, 222 used</div>
        </div>
      </div>

      {/* ─── Annualized Revenue KPI ─── */}
      <div className={styles.revenueHeroSection}>
        <div className={styles.revenueHeroTitle}>Annualized Revenue KPI</div>
        <div className={styles.revenueHeroGrid}>
          <div className={styles.revenueHeroCardPrimary}>
            <div className={styles.revenueHeroMetric}>$504K/yr</div>
            <div className={styles.revenueHeroLabel}>Current Run Rate</div>
            <div className={styles.revenueHeroSub}>$42K/month x 12</div>
          </div>
          <div className={styles.revenueHeroCard}>
            <div className={styles.revenueHeroMetricBlue}>$847K/yr</div>
            <div className={styles.revenueHeroLabel}>Target (Full Enrollment)</div>
            <div className={styles.revenueHeroSub}>Annualized rebate revenue</div>
          </div>
          <div className={styles.revenueHeroCard}>
            <div className={styles.revenueHeroMetricAmber}>$343K</div>
            <div className={styles.revenueHeroLabel}>Gap to Close</div>
            <div className={styles.revenueHeroSub}>15 suppliers pending conversion</div>
          </div>
          <div className={styles.revenueHeroCard}>
            <div className={styles.revenueHeroMetricPurple}>59%</div>
            <div className={styles.revenueHeroLabel}>Progress to Target</div>
            <div className={styles.revenueHeroSub}>$504K of $847K achieved</div>
          </div>
        </div>

        <div className={styles.revenueProgressSection}>
          <div className={styles.revenueProgressHeader}>
            <span className={styles.revenueProgressLabel}>Revenue Progress to $847K Target</span>
            <span className={styles.revenueProgressPct}>59%</span>
          </div>
          <div className={styles.revenueProgressBarWrap}>
            <div className={styles.revenueProgressBar} style={{ width: '59%' }} />
            <span className={styles.revenueProgressText}>$504K / $847K</span>
          </div>
          <div className={styles.revenueProgressMeta}>
            <span className={styles.revenueProgressMetaItem}>
              Active Suppliers: <span className={styles.revenueProgressMetaValue}>25</span>
            </span>
            <span className={styles.revenueProgressMetaItem}>
              Pipeline: <span className={styles.revenueProgressMetaValue}>8 suppliers</span>
            </span>
            <span className={styles.revenueProgressMetaItem}>
              High-Potential: <span className={styles.revenueProgressMetaValue}>7 suppliers</span>
            </span>
          </div>
          <div className={styles.revenuePerSupplier}>
            <span className={styles.revenuePerSupplierLabel}>Each supplier conversion =</span>
            <span className={styles.revenuePerSupplierValue}>avg $22.9K annual rebate</span>
          </div>
        </div>
      </div>

      {/* ─── Revenue Acceleration Plan ─── */}
      <div className={styles.waterfallSection}>
        <div className={styles.waterfallTitle}>Revenue Acceleration Plan</div>
        <div className={styles.waterfallSubtitle}>Waterfall view showing path from current $504K run rate to $847K target at full conversion</div>

        <div className={styles.waterfallChart}>
          {/* Current Active - $504K */}
          <div className={styles.waterfallCol}>
            <div className={styles.waterfallValue}>$504K</div>
            <div
              className={`${styles.waterfallBarSegment} ${styles.waterfallBarGreen}`}
              style={{ height: `${(504 / 847) * 220}px` }}
            />
            <span className={styles.waterfallLabel}>Current Active</span>
            <span className={styles.waterfallLabelSub}>25 suppliers</span>
          </div>

          {/* Pipeline - +$183K */}
          <div className={styles.waterfallCol}>
            <div className={styles.waterfallValue}>+$183K</div>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div
                className={`${styles.waterfallBarSegment} ${styles.waterfallBarBlue}`}
                style={{ height: `${(183 / 847) * 220}px`, borderRadius: '3px 3px 0 0' }}
              />
              <div
                className={`${styles.waterfallBarSegment} ${styles.waterfallBarSpacer}`}
                style={{ height: `${(504 / 847) * 220}px` }}
              />
            </div>
            <span className={styles.waterfallLabel}>In Pipeline</span>
            <span className={styles.waterfallLabelSub}>8 suppliers</span>
          </div>

          {/* High-Potential - +$160K */}
          <div className={styles.waterfallCol}>
            <div className={styles.waterfallValue}>+$160K</div>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div
                className={`${styles.waterfallBarSegment} ${styles.waterfallBarPurple}`}
                style={{ height: `${(160 / 847) * 220}px`, borderRadius: '3px 3px 0 0' }}
              />
              <div
                className={`${styles.waterfallBarSegment} ${styles.waterfallBarSpacer}`}
                style={{ height: `${(687 / 847) * 220}px` }}
              />
            </div>
            <span className={styles.waterfallLabel}>High-Potential</span>
            <span className={styles.waterfallLabelSub}>7 suppliers</span>
          </div>

          {/* Total - $847K */}
          <div className={styles.waterfallCol}>
            <div className={styles.waterfallValue}>$847K</div>
            <div
              className={`${styles.waterfallBarSegment} ${styles.waterfallBarTotal}`}
              style={{ height: '220px' }}
            />
            <span className={styles.waterfallLabel}>Full Conversion</span>
            <span className={styles.waterfallLabelSub}>40 suppliers</span>
          </div>
        </div>

        <div className={styles.waterfallDetails}>
          <div className={styles.waterfallDetailCard}>
            <div className={styles.waterfallDetailHeader}>
              <span className={`${styles.waterfallDetailDot} ${styles.waterfallDotGreen}`} />
              <span className={styles.waterfallDetailLabel}>Current Active</span>
            </div>
            <div className={styles.waterfallDetailValue}>$504K</div>
            <div className={styles.waterfallDetailMeta}>25 suppliers enrolled and generating rebates</div>
          </div>
          <div className={styles.waterfallDetailCard}>
            <div className={styles.waterfallDetailHeader}>
              <span className={`${styles.waterfallDetailDot} ${styles.waterfallDotBlue}`} />
              <span className={styles.waterfallDetailLabel}>In Pipeline</span>
            </div>
            <div className={styles.waterfallDetailValue}>+$183K</div>
            <div className={styles.waterfallDetailMeta}>8 suppliers in active conversion discussions</div>
          </div>
          <div className={styles.waterfallDetailCard}>
            <div className={styles.waterfallDetailHeader}>
              <span className={`${styles.waterfallDetailDot} ${styles.waterfallDotPurple}`} />
              <span className={styles.waterfallDetailLabel}>High-Potential</span>
            </div>
            <div className={styles.waterfallDetailValue}>+$160K</div>
            <div className={styles.waterfallDetailMeta}>7 suppliers identified as strong candidates</div>
          </div>
          <div className={styles.waterfallDetailCard}>
            <div className={styles.waterfallDetailHeader}>
              <span className={`${styles.waterfallDetailDot} ${styles.waterfallDotGold}`} />
              <span className={styles.waterfallDetailLabel}>Full Conversion</span>
            </div>
            <div className={styles.waterfallDetailValue}>$847K</div>
            <div className={styles.waterfallDetailMeta}>Total annualized rebate at 100% enrollment</div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className={styles.aiCard}>
        <div className={styles.aiHeader}>
          <div className={styles.aiIcon}>AI</div>
          <h3 className={styles.aiTitle}>Supplier Card Conversion Recommendations</h3>
        </div>
        {aiRecommendations.map((r, i) => (
          <div key={i} className={styles.aiSuggestion}>
            <div className={styles.aiSugHeader}>
              <span className={styles.aiSugTitle}>{r.supplier}</span>
              <span className={styles.aiSugRebate}>{r.estRebate}/yr est.</span>
            </div>
            <div className={styles.aiSugDesc}>{r.reason}</div>
            <div className={styles.aiSugMeta}>
              <span className={styles.aiSugMetaItem}>
                Current: <span className={styles.aiSugMetaValue}>{r.currentMethod}</span>
              </span>
              <span className={styles.aiSugMetaItem}>
                Annual Volume: <span className={styles.aiSugMetaValue}>{r.annualVolume}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Enablement Table */}
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

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Supplier Enablement</div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('virtualCards.supplier')}</th>
                <th>Card Eligible</th>
                <th>Current Method</th>
                <th>Potential Rebate</th>
                <th>{t('virtualCards.status')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((s) => (
                <tr key={s.name}>
                  <td>{s.name}</td>
                  <td><span className={getEligibleBadgeClass(s.eligible)}>{s.eligible}</span></td>
                  <td>{s.currentMethod}</td>
                  <td className={styles.rebateValue}>{s.potentialRebate}</td>
                  <td><span className={getStatusBadgeClass(s.status)}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rebate Dashboard */}
      <div className={styles.threeCol}>
        {/* Monthly Rebate Trend */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Monthly Rebate Trend (12mo)</div>
          <div className={styles.chartArea}>
            {monthlyRebates.map((m) => (
              <div key={m.month} className={styles.chartCol}>
                <div className={styles.chartValue}>${m.rebate}K</div>
                <div
                  className={`${styles.chartBar} ${styles.chartBarGreen}`}
                  style={{ height: `${(m.rebate / maxRebate) * 140}px` }}
                  title={`$${m.rebate}K`}
                />
                <span className={styles.chartLabel}>{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rebate by Category */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Rebate by Category</div>
          <div className={styles.categoryList}>
            {rebateByCategory.map((c) => (
              <div key={c.category} className={styles.categoryRow}>
                <span className={styles.categoryLabel}>{c.category}</span>
                <div className={styles.categoryBarWrap}>
                  <div
                    className={`${styles.categoryBar} ${styles[c.bar as keyof typeof styles]}`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <span className={styles.categoryPct}>{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Suppliers by Rebate */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Top 10 Suppliers by Rebate</div>
          <div className={styles.topSupplierList}>
            {topRebateSuppliers.map((s) => (
              <div key={s.rank} className={styles.topSupplierRow}>
                <span className={styles.topSupplierRank}>{s.rank}</span>
                <span className={styles.topSupplierName}>{s.name}</span>
                <span className={styles.topSupplierRebate}>{s.rebate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card Issuance Log - CRUD with Inline Editing */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('virtualCards.recentTransactions')}</div>

        {crud.error && !saving && (
          <div style={{ color: '#F76560', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
            {crud.error}
          </div>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('virtualCards.cardNumber')}</th>
                <th>{t('virtualCards.supplier')}</th>
                <th>{t('common.amount')}</th>
                <th>Currency</th>
                <th>Created</th>
                <th>{t('virtualCards.expires')}</th>
                <th>{t('virtualCards.status')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Create row */}
              {inline.isCreating && (
                <tr>
                  <td>
                    <EditableCell
                      editing
                      value={inline.createDraft.cardNumber ?? ''}
                      onChange={(v) => inline.updateCreateField('cardNumber', v)}
                      type="text"
                      placeholder="VC-2026-0001"
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={inline.createDraft.supplierId ?? ''}
                      onChange={(v) => inline.updateCreateField('supplierId', v)}
                      type="text"
                      placeholder="Supplier ID"
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={inline.createDraft.amount ?? ''}
                      onChange={(v) => inline.updateCreateField('amount', v)}
                      type="number"
                      placeholder="0.00"
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={inline.createDraft.currency ?? 'USD'}
                      onChange={(v) => inline.updateCreateField('currency', v)}
                      type="text"
                      placeholder="USD"
                    />
                  </td>
                  <td>
                    <span style={{ color: '#86909C', fontSize: '0.75rem' }}>Auto</span>
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={inline.createDraft.expiresAt ?? ''}
                      onChange={(v) => inline.updateCreateField('expiresAt', v)}
                      type="date"
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={inline.createDraft.status ?? 'ACTIVE'}
                      onChange={(v) => inline.updateCreateField('status', v)}
                      type="select"
                      options={CARD_STATUS_OPTIONS}
                      displayRender={(v: string) => (
                        <span className={getCardBadgeClass(v)}>{formatCardStatus(v)}</span>
                      )}
                    />
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

              {/* Loading state */}
              {crud.loading && crud.data.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#86909C', padding: '2rem' }}>
                    Loading virtual cards...
                  </td>
                </tr>
              )}

              {/* Empty state */}
              {!crud.loading && crud.data.length === 0 && !inline.isCreating && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#86909C', padding: '2rem' }}>
                    No virtual cards found. Click &quot;Generate New Card&quot; to create one.
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {crud.data.map((card) => {
                const isEditing = inline.editingId === card.id;
                const isDeleting = inline.deleteConfirmId === card.id;

                return (
                  <tr key={card.id}>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? inline.editDraft.cardNumber : card.cardNumber}
                        onChange={(v) => inline.updateEditField('cardNumber', v)}
                        type="text"
                        displayRender={(v: string) => <span className={styles.cardId}>{v}</span>}
                      />
                    </td>
                    <td>{card.supplierId}</td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? inline.editDraft.amount : card.amount}
                        onChange={(v) => inline.updateEditField('amount', v)}
                        type="number"
                        displayRender={(v: number) => formatCurrency(v, card.currency)}
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? inline.editDraft.currency : card.currency}
                        onChange={(v) => inline.updateEditField('currency', v)}
                        type="text"
                      />
                    </td>
                    <td>{formatDate(card.createdAt)}</td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? (inline.editDraft.expiresAt ?? '').slice(0, 10) : card.expiresAt}
                        onChange={(v) => inline.updateEditField('expiresAt', v)}
                        type="date"
                        displayRender={(v: string) => formatDate(v)}
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? inline.editDraft.status : card.status}
                        onChange={(v) => inline.updateEditField('status', v)}
                        type="select"
                        options={CARD_STATUS_OPTIONS}
                        displayRender={(v: string) => (
                          <span className={getCardBadgeClass(v)}>{formatCardStatus(v)}</span>
                        )}
                      />
                    </td>
                    <td>
                      {isDeleting ? (
                        <RowActions
                          mode="deleting"
                          onConfirmDelete={handleConfirmDelete}
                          onCancelDelete={inline.cancelDelete}
                          saving={saving}
                        />
                      ) : isEditing ? (
                        <RowActions
                          mode="editing"
                          onSave={handleSaveEdit}
                          onCancel={inline.cancelEdit}
                          saving={saving}
                        />
                      ) : (
                        <RowActions
                          mode="read"
                          onEdit={() => inline.startEdit(card.id, card)}
                          onDelete={() => inline.requestDelete(card.id)}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Method Optimization */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Payment Method Optimization</div>
        <div className={styles.sectionSubtitle}>Current distribution vs optimization targets to maximize virtual card rebates</div>
        <div className={styles.pieContainer}>
          <div
            className={styles.pieChart}
            style={{ background: buildConicGradient() }}
          />
          <div className={styles.pieLegend}>
            {paymentMethodDist.map((m) => (
              <div key={m.method} className={styles.pieLegendRow}>
                <span className={`${styles.pieLegendDot} ${styles[m.dot as keyof typeof styles]}`} />
                <span className={styles.pieLegendLabel}>{m.method}</span>
                <span className={styles.pieLegendPct}>{m.pct}%</span>
                <span className={styles.pieLegendTarget}>Target: {m.target}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
