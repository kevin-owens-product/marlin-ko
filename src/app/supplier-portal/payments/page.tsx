'use client';

import { useState, useEffect, useMemo } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './payments.module.css';

/* ───────── Types ───────── */

type PaymentStatus = 'Scheduled' | 'Processing' | 'Completed' | 'Failed';

interface Payment {
  id: string;
  paymentRef: string;
  invoiceNumber: string;
  amount: number;
  method: string;
  date: string;
  status: PaymentStatus;
  buyer: string;
  bankRef: string;
  processedDate: string;
}

/* ───────── Mock Data ───────── */

const mockPayments: Payment[] = [
  { id: '1', paymentRef: 'PAY-8420', invoiceNumber: 'INV-2026-0153', amount: 12750, method: 'ACH', date: '2026-02-22', status: 'Scheduled', buyer: 'Nordic Manufacturing', bankRef: '', processedDate: '' },
  { id: '2', paymentRef: 'PAY-8418', invoiceNumber: 'INV-2026-0152', amount: 45000, method: 'Wire', date: '2026-02-24', status: 'Scheduled', buyer: 'TechGlobal Inc', bankRef: '', processedDate: '' },
  { id: '3', paymentRef: 'PAY-8415', invoiceNumber: 'INV-2026-0151', amount: 8900, method: 'ACH', date: '2026-02-28', status: 'Processing', buyer: 'Medius Demo Corp', bankRef: 'BNK-44521', processedDate: '' },
  { id: '4', paymentRef: 'PAY-8401', invoiceNumber: 'INV-2026-0149', amount: 22300, method: 'ACH', date: '2026-02-15', status: 'Completed', buyer: 'Nordic Manufacturing', bankRef: 'BNK-44498', processedDate: '2026-02-15' },
  { id: '5', paymentRef: 'PAY-8392', invoiceNumber: 'INV-2026-0148', amount: 37500, method: 'Wire', date: '2026-02-13', status: 'Completed', buyer: 'TechGlobal Inc', bankRef: 'BNK-44485', processedDate: '2026-02-13' },
  { id: '6', paymentRef: 'PAY-8385', invoiceNumber: 'INV-2026-0147', amount: 19800, method: 'ACH', date: '2026-02-11', status: 'Completed', buyer: 'Medius Demo Corp', bankRef: 'BNK-44472', processedDate: '2026-02-11' },
  { id: '7', paymentRef: 'PAY-8371', invoiceNumber: 'INV-2026-0146', amount: 41200, method: 'ACH', date: '2026-02-09', status: 'Completed', buyer: 'Medius Demo Corp', bankRef: 'BNK-44460', processedDate: '2026-02-09' },
  { id: '8', paymentRef: 'PAY-8365', invoiceNumber: 'INV-2026-0145', amount: 15600, method: 'Wire', date: '2026-02-07', status: 'Completed', buyer: 'TechGlobal Inc', bankRef: 'BNK-44448', processedDate: '2026-02-07' },
  { id: '9', paymentRef: 'PAY-8350', invoiceNumber: 'INV-2026-0144', amount: 28900, method: 'ACH', date: '2026-02-05', status: 'Completed', buyer: 'Nordic Manufacturing', bankRef: 'BNK-44435', processedDate: '2026-02-05' },
  { id: '10', paymentRef: 'PAY-8342', invoiceNumber: 'INV-2026-0143', amount: 67500, method: 'ACH', date: '2026-02-03', status: 'Completed', buyer: 'Medius Demo Corp', bankRef: 'BNK-44420', processedDate: '2026-02-03' },
  { id: '11', paymentRef: 'PAY-8331', invoiceNumber: 'INV-2026-0142', amount: 9300, method: 'Wire', date: '2026-02-01', status: 'Completed', buyer: 'TechGlobal Inc', bankRef: 'BNK-44410', processedDate: '2026-02-01' },
  { id: '12', paymentRef: 'PAY-8320', invoiceNumber: 'INV-2026-0141', amount: 33400, method: 'ACH', date: '2026-01-29', status: 'Completed', buyer: 'Medius Demo Corp', bankRef: 'BNK-44398', processedDate: '2026-01-29' },
];

const scheduledPayments = [
  { invoiceNumber: 'INV-2026-0153', amount: 12750, date: '2026-02-22', day: '22', month: 'Feb', method: 'ACH' },
  { invoiceNumber: 'INV-2026-0152', amount: 45000, date: '2026-02-24', day: '24', month: 'Feb', method: 'Wire' },
  { invoiceNumber: 'INV-2026-0151', amount: 8900, date: '2026-02-28', day: '28', month: 'Feb', method: 'ACH' },
  { invoiceNumber: 'INV-2026-0150', amount: 56200, date: '2026-03-03', day: '03', month: 'Mar', method: 'ACH' },
  { invoiceNumber: 'INV-2026-0154', amount: 31000, date: '2026-03-05', day: '05', month: 'Mar', method: 'Wire' },
];

/* ───────── Helpers ───────── */

function formatCurrency(v: number): string {
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const statusClassMap: Record<PaymentStatus, string> = {
  Scheduled: styles.statusScheduled,
  Processing: styles.statusProcessing,
  Completed: styles.statusCompleted,
  Failed: styles.statusFailed,
};

type FilterTab = 'all' | 'scheduled' | 'completed' | 'thisMonth' | 'lastMonth';

/* ───────── Component ───────── */

export default function SupplierPortalPayments() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  /* Filter */
  const filteredPayments = useMemo(() => {
    switch (activeFilter) {
      case 'scheduled':
        return mockPayments.filter((p) => p.status === 'Scheduled' || p.status === 'Processing');
      case 'completed':
        return mockPayments.filter((p) => p.status === 'Completed');
      case 'thisMonth':
        return mockPayments.filter((p) => p.date.startsWith('2026-02'));
      case 'lastMonth':
        return mockPayments.filter((p) => p.date.startsWith('2026-01'));
      default:
        return mockPayments;
    }
  }, [activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* Payment preferences state */
  const [preferredMethod, setPreferredMethod] = useState('ACH');
  const [bankStatus] = useState('Verified');

  /* Stats */
  const stats = useMemo(() => {
    const completedPayments = mockPayments.filter((p) => p.status === 'Completed');
    const totalYTD = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingCount = mockPayments.filter(
      (p) => p.status === 'Scheduled' || p.status === 'Processing'
    ).length;
    const nextPayment = mockPayments.find((p) => p.status === 'Scheduled');
    return {
      totalYTD,
      pendingCount,
      avgDays: 28,
      earlySavings: 4750,
      nextPaymentAmount: nextPayment?.amount || 0,
      nextPaymentDate: nextPayment?.date || '--',
    };
  }, []);

  const filterTabs: { key: FilterTab; labelKey: string }[] = [
    { key: 'all', labelKey: 'supplierPortal.payments.filterAll' },
    { key: 'scheduled', labelKey: 'supplierPortal.payments.filterScheduled' },
    { key: 'completed', labelKey: 'supplierPortal.payments.filterCompleted' },
    { key: 'thisMonth', labelKey: 'supplierPortal.payments.filterThisMonth' },
    { key: 'lastMonth', labelKey: 'supplierPortal.payments.filterLastMonth' },
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.statsRow}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${styles.skeleton} ${styles.skeletonStats}`} />
          ))}
        </div>
        <div className={`${styles.skeleton} ${styles.skeletonTable}`} />
      </div>
    );
  }

  return (
    <>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t('supplierPortal.payments.title')}</h1>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('supplierPortal.payments.totalReceivedYTD')}</div>
          <div className={styles.statValue} style={{ color: 'var(--color-success, #00B42A)' }}>
            {formatCurrency(stats.totalYTD)}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('supplierPortal.payments.pendingPayments')}</div>
          <div className={styles.statValue}>{stats.pendingCount}</div>
          <div className={styles.statSub}>{t('common.processing')}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('supplierPortal.payments.avgPaymentTime')}</div>
          <div className={styles.statValue}>
            {stats.avgDays} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#86909C' }}>{t('supplierPortal.payments.days')}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('supplierPortal.payments.earlyPaymentSavings')}</div>
          <div className={styles.statValue} style={{ color: '#722ED1' }}>
            {formatCurrency(stats.earlySavings)}
          </div>
          <div className={styles.statSub}>{t('supplierPortal.payments.ytdSavings')}</div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className={styles.filterRow}>
        <div className={styles.filterTabs}>
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.filterTab} ${activeFilter === tab.key ? styles.filterTabActive : ''}`}
              onClick={() => { setActiveFilter(tab.key); setCurrentPage(1); }}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Payment Table ── */}
      <div className={styles.tableWrapper}>
        {filteredPayments.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>&#128176;</div>
            <div className={styles.emptyTitle}>{t('supplierPortal.payments.noPayments')}</div>
            <div className={styles.emptyDesc}>{t('supplierPortal.payments.noPaymentsDesc')}</div>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('supplierPortal.payments.paymentRef')}</th>
                  <th>{t('supplierPortal.payments.invoiceNumber')}</th>
                  <th>{t('supplierPortal.payments.amount')}</th>
                  <th>{t('supplierPortal.payments.method')}</th>
                  <th>{t('supplierPortal.payments.date')}</th>
                  <th>{t('supplierPortal.payments.status')}</th>
                  <th>{t('supplierPortal.payments.remittanceAdvice')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((p) => (
                  <tr key={p.id} onClick={() => setSelectedPayment(p)}>
                    <td><span className={styles.paymentRef}>{p.paymentRef}</span></td>
                    <td><span className={styles.invoiceRef}>{p.invoiceNumber}</span></td>
                    <td><span className={styles.amountCell}>{formatCurrency(p.amount)}</span></td>
                    <td><span className={styles.methodBadge}>{p.method}</span></td>
                    <td>{p.date}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClassMap[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.status === 'Completed' ? (
                        <button
                          className={styles.downloadButton}
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          {t('supplierPortal.payments.downloadRemittance')}
                        </button>
                      ) : (
                        <span style={{ color: '#86909C', fontSize: '0.8125rem' }}>--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <div className={styles.pageInfo}>
                {t('common.showing', {
                  from: (currentPage - 1) * pageSize + 1,
                  to: Math.min(currentPage * pageSize, filteredPayments.length),
                  total: filteredPayments.length,
                })}
              </div>
              <div className={styles.pageControls}>
                <button
                  className={styles.pageButton}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  &#8249;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`${styles.pageButton} ${page === currentPage ? styles.pageButtonActive : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className={styles.pageButton}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  &#8250;
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Payment Schedule ── */}
      <div className={styles.scheduleSection}>
        <h2 className={styles.sectionTitle}>{t('supplierPortal.payments.paymentSchedule')}</h2>
        <div className={styles.scheduleList}>
          {scheduledPayments.map((sp, idx) => (
            <div key={idx} className={styles.scheduleCard}>
              <div className={styles.scheduleInfo}>
                <div className={styles.scheduleDate}>
                  <div className={styles.scheduleDateDay}>{sp.day}</div>
                  <div className={styles.scheduleDateMonth}>{sp.month}</div>
                </div>
                <div className={styles.scheduleDetails}>
                  <span className={styles.scheduleInvoice}>{sp.invoiceNumber}</span>
                  <span className={styles.scheduleMethod}>{sp.method}</span>
                </div>
              </div>
              <span className={styles.scheduleAmount}>{formatCurrency(sp.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Payment Preferences ── */}
      <div className={styles.preferencesSection}>
        <h2 className={styles.sectionTitle}>{t('supplierPortal.payments.paymentPreferences')}</h2>
        <div className={styles.preferencesGrid}>
          <div className={styles.preferenceItem}>
            <div className={styles.preferenceLabel}>{t('supplierPortal.payments.preferredMethod')}</div>
            <select
              className={styles.preferenceSelect}
              value={preferredMethod}
              onChange={(e) => setPreferredMethod(e.target.value)}
            >
              <option value="ACH">ACH Transfer</option>
              <option value="Wire">Wire Transfer</option>
              <option value="VirtualCard">Virtual Card</option>
              <option value="SEPA">SEPA Transfer</option>
            </select>
          </div>
          <div className={styles.preferenceItem}>
            <div className={styles.preferenceLabel}>{t('supplierPortal.payments.bankDetailsStatus')}</div>
            <div className={styles.preferenceStatusRow}>
              <span className={styles.preferenceStatusBadge}>{bankStatus}</span>
              <span className={styles.preferenceStatusDate}>{t('supplierPortal.payments.lastVerified')}: Jan 10, 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Slide-out ── */}
      <div
        className={`${styles.slideOverlay} ${selectedPayment ? styles.slideOverlayVisible : ''}`}
        onClick={() => setSelectedPayment(null)}
        aria-hidden="true"
      />
      <div className={`${styles.slidePanel} ${selectedPayment ? styles.slidePanelOpen : ''}`}>
        {selectedPayment && (
          <>
            <div className={styles.slidePanelHeader}>
              <span className={styles.slidePanelTitle}>
                {t('supplierPortal.payments.paymentDetails')}
              </span>
              <button
                className={styles.slidePanelClose}
                onClick={() => setSelectedPayment(null)}
                aria-label={t('common.close')}
              >
                &#10005;
              </button>
            </div>
            <div className={styles.slidePanelBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.payments.paymentRef')}</span>
                <span className={styles.detailValue}>{selectedPayment.paymentRef}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.payments.status')}</span>
                <span className={`${styles.statusBadge} ${statusClassMap[selectedPayment.status]}`}>
                  {selectedPayment.status}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.payments.amount')}</span>
                <span className={styles.detailValue}>{formatCurrency(selectedPayment.amount)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.payments.method')}</span>
                <span className={styles.detailValue}>{selectedPayment.method}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.payments.date')}</span>
                <span className={styles.detailValue}>{selectedPayment.date}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.payments.relatedInvoice')}</span>
                <span className={styles.detailValue}>{selectedPayment.invoiceNumber}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Buyer</span>
                <span className={styles.detailValue}>{selectedPayment.buyer}</span>
              </div>
              {selectedPayment.bankRef && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Bank Reference</span>
                  <span className={styles.detailValue}>{selectedPayment.bankRef}</span>
                </div>
              )}

              {selectedPayment.status === 'Completed' && (
                <button className={styles.downloadFullButton}>
                  &#128196; {t('supplierPortal.payments.downloadRemittance')}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
