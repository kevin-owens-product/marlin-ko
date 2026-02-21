'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { Modal } from '@/components/ui/Modal';
import styles from './portal-invoices.module.css';

/* ───────── Types ───────── */

type InvoiceStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Paid';

interface Invoice {
  id: string;
  invoiceNumber: string;
  dateSubmitted: string;
  amount: number;
  currency: string;
  poReference: string;
  status: InvoiceStatus;
  buyer: string;
  dueDate: string;
  timeline: { event: string; date: string; color: string }[];
}

interface LineItem {
  description: string;
  qty: number;
  unitPrice: number;
}

/* ───────── Mock Data ───────── */

const mockInvoices: Invoice[] = [
  {
    id: '1', invoiceNumber: 'INV-2026-0156', dateSubmitted: '2026-01-28', amount: 24500, currency: 'USD',
    poReference: 'PO-4521', status: 'Submitted', buyer: 'Medius Demo Corp', dueDate: '2026-02-27',
    timeline: [
      { event: 'Invoice submitted', date: 'Jan 28, 2026 10:15 AM', color: 'blue' },
    ],
  },
  {
    id: '2', invoiceNumber: 'INV-2026-0155', dateSubmitted: '2026-01-27', amount: 18200, currency: 'USD',
    poReference: 'PO-4518', status: 'Under Review', buyer: 'TechGlobal Inc', dueDate: '2026-02-26',
    timeline: [
      { event: 'Under review by AP team', date: 'Jan 28, 2026 2:00 PM', color: 'purple' },
      { event: 'Invoice submitted', date: 'Jan 27, 2026 9:30 AM', color: 'blue' },
    ],
  },
  {
    id: '3', invoiceNumber: 'INV-2026-0154', dateSubmitted: '2026-01-25', amount: 31000, currency: 'USD',
    poReference: 'PO-4510', status: 'Under Review', buyer: 'Medius Demo Corp', dueDate: '2026-02-24',
    timeline: [
      { event: 'Under review by AP team', date: 'Jan 26, 2026 11:00 AM', color: 'purple' },
      { event: 'Invoice submitted', date: 'Jan 25, 2026 3:45 PM', color: 'blue' },
    ],
  },
  {
    id: '4', invoiceNumber: 'INV-2026-0153', dateSubmitted: '2026-01-23', amount: 12750, currency: 'USD',
    poReference: 'PO-4505', status: 'Approved', buyer: 'Nordic Manufacturing', dueDate: '2026-02-22',
    timeline: [
      { event: 'Invoice approved for payment', date: 'Jan 27, 2026 4:00 PM', color: 'green' },
      { event: 'PO matched successfully', date: 'Jan 25, 2026 10:00 AM', color: 'blue' },
      { event: 'Invoice submitted', date: 'Jan 23, 2026 8:15 AM', color: 'blue' },
    ],
  },
  {
    id: '5', invoiceNumber: 'INV-2026-0152', dateSubmitted: '2026-01-21', amount: 45000, currency: 'EUR',
    poReference: 'PO-4499', status: 'Approved', buyer: 'TechGlobal Inc', dueDate: '2026-02-20',
    timeline: [
      { event: 'Invoice approved for payment', date: 'Jan 25, 2026 2:30 PM', color: 'green' },
      { event: 'Three-way match completed', date: 'Jan 23, 2026 9:00 AM', color: 'blue' },
      { event: 'Invoice submitted', date: 'Jan 21, 2026 11:00 AM', color: 'blue' },
    ],
  },
  {
    id: '6', invoiceNumber: 'INV-2026-0151', dateSubmitted: '2026-01-20', amount: 8900, currency: 'USD',
    poReference: '', status: 'Rejected', buyer: 'Medius Demo Corp', dueDate: '2026-02-19',
    timeline: [
      { event: 'Rejected: Missing PO reference', date: 'Jan 22, 2026 3:00 PM', color: 'red' },
      { event: 'Invoice submitted', date: 'Jan 20, 2026 2:00 PM', color: 'blue' },
    ],
  },
  {
    id: '7', invoiceNumber: 'INV-2026-0149', dateSubmitted: '2026-01-16', amount: 22300, currency: 'USD',
    poReference: 'PO-4488', status: 'Paid', buyer: 'Nordic Manufacturing', dueDate: '2026-02-15',
    timeline: [
      { event: 'Payment completed via ACH', date: 'Feb 15, 2026 6:00 AM', color: 'green' },
      { event: 'Invoice approved for payment', date: 'Jan 20, 2026 10:00 AM', color: 'green' },
      { event: 'Invoice submitted', date: 'Jan 16, 2026 9:00 AM', color: 'blue' },
    ],
  },
  {
    id: '8', invoiceNumber: 'INV-2026-0148', dateSubmitted: '2026-01-14', amount: 37500, currency: 'GBP',
    poReference: 'PO-4480', status: 'Paid', buyer: 'TechGlobal Inc', dueDate: '2026-02-13',
    timeline: [
      { event: 'Payment completed via Wire', date: 'Feb 13, 2026 6:00 AM', color: 'green' },
      { event: 'Invoice approved for payment', date: 'Jan 18, 2026 11:00 AM', color: 'green' },
      { event: 'Invoice submitted', date: 'Jan 14, 2026 10:30 AM', color: 'blue' },
    ],
  },
  {
    id: '9', invoiceNumber: 'INV-2026-0147', dateSubmitted: '2026-01-12', amount: 19800, currency: 'USD',
    poReference: 'PO-4475', status: 'Paid', buyer: 'Medius Demo Corp', dueDate: '2026-02-11',
    timeline: [
      { event: 'Payment completed via ACH', date: 'Feb 11, 2026 6:00 AM', color: 'green' },
      { event: 'Invoice approved', date: 'Jan 15, 2026 4:00 PM', color: 'green' },
      { event: 'Invoice submitted', date: 'Jan 12, 2026 8:00 AM', color: 'blue' },
    ],
  },
  {
    id: '10', invoiceNumber: 'INV-2026-0146', dateSubmitted: '2026-01-10', amount: 41200, currency: 'USD',
    poReference: 'PO-4470', status: 'Paid', buyer: 'Medius Demo Corp', dueDate: '2026-02-09',
    timeline: [
      { event: 'Payment completed via ACH', date: 'Feb 9, 2026 6:00 AM', color: 'green' },
      { event: 'Invoice approved', date: 'Jan 13, 2026 2:00 PM', color: 'green' },
      { event: 'Invoice submitted', date: 'Jan 10, 2026 11:00 AM', color: 'blue' },
    ],
  },
];

/* ───────── Helpers ───────── */

function formatCurrency(v: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '\u20AC', GBP: '\u00A3', SEK: 'kr' };
  const sym = symbols[currency] || currency + ' ';
  return sym + v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const statusClassMap: Record<InvoiceStatus, string> = {
  Submitted: styles.statusSubmitted,
  'Under Review': styles.statusUnderReview,
  Approved: styles.statusApproved,
  Rejected: styles.statusRejected,
  Paid: styles.statusPaid,
};

const dotColorMap: Record<string, string> = {
  green: '#00B42A',
  blue: '#165DFF',
  purple: '#722ED1',
  red: '#F53F3F',
  orange: '#FF7D00',
};

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected' | 'paid';

const filterStatusMap: Record<FilterTab, InvoiceStatus[]> = {
  all: [],
  pending: ['Submitted', 'Under Review'],
  approved: ['Approved'],
  rejected: ['Rejected'],
  paid: ['Paid'],
};

/* ───────── Component ───────── */

export default function SupplierPortalInvoices() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  /* Form state */
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    amount: '',
    currency: 'USD',
    poReference: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', qty: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  /* Filter & Search */
  const filteredInvoices = useMemo(() => {
    let result = [...mockInvoices];
    if (activeFilter !== 'all') {
      const statuses = filterStatusMap[activeFilter];
      result = result.filter((inv) => statuses.includes(inv.status));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((inv) => inv.invoiceNumber.toLowerCase().includes(q));
    }
    return result;
  }, [activeFilter, searchQuery]);

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* Stats */
  const stats = useMemo(() => ({
    total: mockInvoices.length,
    pending: mockInvoices.filter((i) => i.status === 'Submitted' || i.status === 'Under Review').length,
    approved: mockInvoices.filter((i) => i.status === 'Approved').length,
    paid: mockInvoices.filter((i) => i.status === 'Paid').length,
  }), []);

  /* Line items helpers */
  const addLineItem = useCallback(() => {
    setLineItems((prev) => [...prev, { description: '', qty: 1, unitPrice: 0 }]);
  }, []);

  const removeLineItem = useCallback((index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateLineItem = useCallback((index: number, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }, []);

  /* Form validation */
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.invoiceNumber.trim()) errors.invoiceNumber = 'Required';
    if (!formData.invoiceDate) errors.invoiceDate = 'Required';
    if (!formData.dueDate) errors.dueDate = 'Required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = 'Valid amount required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmitInvoice = useCallback(() => {
    if (validateForm()) {
      setShowSubmitModal(false);
      setFormData({ invoiceNumber: '', invoiceDate: '', dueDate: '', amount: '', currency: 'USD', poReference: '', notes: '' });
      setLineItems([{ description: '', qty: 1, unitPrice: 0 }]);
      setFormErrors({});
    }
  }, [validateForm]);

  /* Filter tabs */
  const filterTabs: { key: FilterTab; labelKey: string }[] = [
    { key: 'all', labelKey: 'supplierPortal.invoices.filterAll' },
    { key: 'pending', labelKey: 'supplierPortal.invoices.filterPending' },
    { key: 'approved', labelKey: 'supplierPortal.invoices.filterApproved' },
    { key: 'rejected', labelKey: 'supplierPortal.invoices.filterRejected' },
    { key: 'paid', labelKey: 'supplierPortal.invoices.filterPaid' },
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
        <h1 className={styles.pageTitle}>{t('supplierPortal.invoices.title')}</h1>
        <button
          className={styles.submitButton}
          onClick={() => setShowSubmitModal(true)}
        >
          &#10010; {t('supplierPortal.invoices.submitNew')}
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>{t('supplierPortal.invoices.totalSubmitted')}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#722ED1' }}>{stats.pending}</div>
          <div className={styles.statLabel}>{t('supplierPortal.invoices.pendingReview')}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#00B42A' }}>{stats.approved}</div>
          <div className={styles.statLabel}>{t('supplierPortal.invoices.approved')}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#009688' }}>{stats.paid}</div>
          <div className={styles.statLabel}>{t('supplierPortal.invoices.paid')}</div>
        </div>
      </div>

      {/* ── Filter + Search ── */}
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
        <div className={styles.searchBox}>
          <span className={styles.searchIcon} aria-hidden="true">&#128269;</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={t('supplierPortal.invoices.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            aria-label={t('common.search')}
          />
        </div>
      </div>

      {/* ── Invoice Table ── */}
      <div className={styles.tableWrapper}>
        {filteredInvoices.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>&#128196;</div>
            <div className={styles.emptyTitle}>{t('supplierPortal.invoices.noInvoices')}</div>
            <div className={styles.emptyDesc}>{t('supplierPortal.invoices.noInvoicesDesc')}</div>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('supplierPortal.invoices.invoiceNumber')}</th>
                  <th>{t('supplierPortal.invoices.dateSubmitted')}</th>
                  <th>{t('supplierPortal.invoices.amount')}</th>
                  <th>{t('supplierPortal.invoices.currency')}</th>
                  <th>{t('supplierPortal.invoices.poReference')}</th>
                  <th>{t('supplierPortal.invoices.status')}</th>
                  <th>{t('supplierPortal.invoices.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td><span className={styles.invoiceId}>{inv.invoiceNumber}</span></td>
                    <td>{inv.dateSubmitted}</td>
                    <td><span className={styles.amountCell}>{formatCurrency(inv.amount, inv.currency)}</span></td>
                    <td>{inv.currency}</td>
                    <td>{inv.poReference || '--'}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClassMap[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.viewButton}
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        {t('supplierPortal.invoices.viewDetails')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className={styles.pagination}>
              <div className={styles.pageInfo}>
                {t('common.showing', {
                  from: (currentPage - 1) * pageSize + 1,
                  to: Math.min(currentPage * pageSize, filteredInvoices.length),
                  total: filteredInvoices.length,
                })}
              </div>
              <div className={styles.pageControls}>
                <button
                  className={styles.pageButton}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  aria-label={t('common.previous')}
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
                  aria-label={t('common.next')}
                >
                  &#8250;
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Detail Slide-out Panel ── */}
      <div
        className={`${styles.slideOverlay} ${selectedInvoice ? styles.slideOverlayVisible : ''}`}
        onClick={() => setSelectedInvoice(null)}
        aria-hidden="true"
      />
      <div className={`${styles.slidePanel} ${selectedInvoice ? styles.slidePanelOpen : ''}`}>
        {selectedInvoice && (
          <>
            <div className={styles.slidePanelHeader}>
              <span className={styles.slidePanelTitle}>
                {t('supplierPortal.invoices.invoiceDetails')}
              </span>
              <button
                className={styles.slidePanelClose}
                onClick={() => setSelectedInvoice(null)}
                aria-label={t('common.close')}
              >
                &#10005;
              </button>
            </div>
            <div className={styles.slidePanelBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.invoices.invoiceNumber')}</span>
                <span className={styles.detailValue}>{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.invoices.status')}</span>
                <span className={`${styles.statusBadge} ${statusClassMap[selectedInvoice.status]}`}>
                  {selectedInvoice.status}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.invoices.amount')}</span>
                <span className={styles.detailValue}>
                  {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)} {selectedInvoice.currency}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.invoices.dateSubmitted')}</span>
                <span className={styles.detailValue}>{selectedInvoice.dateSubmitted}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.invoices.dueDate')}</span>
                <span className={styles.detailValue}>{selectedInvoice.dueDate}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.invoices.poReference')}</span>
                <span className={styles.detailValue}>{selectedInvoice.poReference || '--'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Buyer</span>
                <span className={styles.detailValue}>{selectedInvoice.buyer}</span>
              </div>

              {/* Timeline */}
              <div className={styles.timelineSection}>
                <div className={styles.timelineTitle}>{t('supplierPortal.invoices.timeline')}</div>
                {selectedInvoice.timeline.map((item, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <span
                      className={styles.timelineDot}
                      style={{ background: dotColorMap[item.color] || '#165DFF' }}
                      aria-hidden="true"
                    />
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineEvent}>{item.event}</div>
                      <div className={styles.timelineDate}>{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Submit Invoice Modal ── */}
      <Modal
        open={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title={t('supplierPortal.invoices.submitInvoice')}
        size="lg"
        footer={
          <div className={styles.modalFooter}>
            <button className={styles.cancelButton} onClick={() => setShowSubmitModal(false)}>
              {t('supplierPortal.invoices.cancel')}
            </button>
            <button className={styles.primaryButton} onClick={handleSubmitInvoice}>
              {t('supplierPortal.invoices.submit')}
            </button>
          </div>
        }
      >
        <div className={styles.modalBody}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.invoices.invoiceNumber')} *</label>
              <input
                className={styles.formInput}
                type="text"
                placeholder="INV-2026-0157"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData((p) => ({ ...p, invoiceNumber: e.target.value }))}
              />
              {formErrors.invoiceNumber && <span className={styles.formError}>{formErrors.invoiceNumber}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.invoices.poReference')}</label>
              <input
                className={styles.formInput}
                type="text"
                placeholder="PO-XXXX"
                value={formData.poReference}
                onChange={(e) => setFormData((p) => ({ ...p, poReference: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.invoices.invoiceDate')} *</label>
              <input
                className={styles.formInput}
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData((p) => ({ ...p, invoiceDate: e.target.value }))}
              />
              {formErrors.invoiceDate && <span className={styles.formError}>{formErrors.invoiceDate}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.invoices.dueDate')} *</label>
              <input
                className={styles.formInput}
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((p) => ({ ...p, dueDate: e.target.value }))}
              />
              {formErrors.dueDate && <span className={styles.formError}>{formErrors.dueDate}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.invoices.amount')} *</label>
              <input
                className={styles.formInput}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
              />
              {formErrors.amount && <span className={styles.formError}>{formErrors.amount}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.invoices.currency')}</label>
              <select
                className={styles.formSelect}
                value={formData.currency}
                onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="SEK">SEK - Swedish Krona</option>
                <option value="NOK">NOK - Norwegian Krone</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className={styles.lineItemsSection}>
            <div className={styles.lineItemsHeader}>
              <span className={styles.lineItemsTitle}>{t('supplierPortal.invoices.lineItems')}</span>
              <button className={styles.addLineButton} onClick={addLineItem}>
                &#10010; {t('supplierPortal.invoices.addLineItem')}
              </button>
            </div>
            {lineItems.map((item, idx) => (
              <div key={idx} className={styles.lineItem}>
                <input
                  className={styles.lineItemInput}
                  type="text"
                  placeholder={t('supplierPortal.invoices.description')}
                  value={item.description}
                  onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                />
                <input
                  className={styles.lineItemInput}
                  type="number"
                  min="1"
                  placeholder={t('supplierPortal.invoices.quantity')}
                  value={item.qty}
                  onChange={(e) => updateLineItem(idx, 'qty', parseInt(e.target.value) || 0)}
                />
                <input
                  className={styles.lineItemInput}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t('supplierPortal.invoices.unitPrice')}
                  value={item.unitPrice || ''}
                  onChange={(e) => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                />
                <input
                  className={styles.lineItemInput}
                  type="text"
                  readOnly
                  value={formatCurrency(item.qty * item.unitPrice)}
                  style={{ background: '#F7F8FA' }}
                />
                <button
                  className={styles.removeLineButton}
                  onClick={() => removeLineItem(idx)}
                  disabled={lineItems.length <= 1}
                  aria-label={t('supplierPortal.invoices.removeLineItem')}
                >
                  &#10005;
                </button>
              </div>
            ))}
          </div>

          {/* Upload */}
          <div className={styles.uploadArea}>
            <div className={styles.uploadIcon}>&#128206;</div>
            <div className={styles.uploadText}>{t('supplierPortal.invoices.uploadInvoice')}</div>
            <div className={styles.uploadHint}>{t('supplierPortal.invoices.uploadHint')}</div>
          </div>

          {/* Notes */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('supplierPortal.invoices.notes')}</label>
            <textarea
              className={styles.formTextarea}
              placeholder={t('supplierPortal.invoices.notesPlaceholder')}
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
