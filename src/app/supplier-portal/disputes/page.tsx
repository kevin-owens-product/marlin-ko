'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { Modal } from '@/components/ui/Modal';
import styles from './portal-disputes.module.css';

/* ───────── Types ───────── */

type DisputeStatus = 'Open' | 'Under Review' | 'Awaiting Info' | 'Resolved' | 'Closed';
type DisputeType = 'Amount Discrepancy' | 'Missing Payment' | 'Rejected Invoice' | 'Duplicate' | 'Other';

interface Message {
  id: string;
  sender: 'supplier' | 'buyer';
  senderName: string;
  text: string;
  time: string;
}

interface Dispute {
  id: string;
  disputeNumber: string;
  relatedInvoice: string;
  type: DisputeType;
  amount: number;
  status: DisputeStatus;
  created: string;
  lastUpdate: string;
  description: string;
  messages: Message[];
  statusStep: number; // 0=Created, 1=Under Review, 2=Awaiting Info, 3=Resolved
}

/* ───────── Mock Data ───────── */

const mockDisputes: Dispute[] = [
  {
    id: '1', disputeNumber: 'D-045', relatedInvoice: 'INV-2026-0151', type: 'Rejected Invoice',
    amount: 8900, status: 'Open', created: '2026-02-10', lastUpdate: '2026-02-18', statusStep: 1,
    description: 'Invoice was rejected due to missing PO reference, but the work was completed under verbal agreement with procurement team.',
    messages: [
      { id: 'm1', sender: 'supplier', senderName: 'Acme Corp', text: 'This invoice was for work completed under verbal agreement with John Smith from procurement. The PO was supposed to be issued retroactively.', time: 'Feb 10, 2026 3:15 PM' },
      { id: 'm2', sender: 'buyer', senderName: 'Medius Demo Corp', text: 'We are reviewing this with our procurement team. We will need a confirmation from John Smith regarding the verbal agreement.', time: 'Feb 12, 2026 10:00 AM' },
      { id: 'm3', sender: 'supplier', senderName: 'Acme Corp', text: 'I have CC\'d John Smith on the original email thread. He can confirm the scope of work and the agreed pricing.', time: 'Feb 13, 2026 2:30 PM' },
      { id: 'm4', sender: 'buyer', senderName: 'Medius Demo Corp', text: 'Thank you. We have received confirmation from John. We are now processing the retroactive PO. Please allow 2-3 business days.', time: 'Feb 18, 2026 11:45 AM' },
    ],
  },
  {
    id: '2', disputeNumber: 'D-044', relatedInvoice: 'INV-2026-0142', type: 'Amount Discrepancy',
    amount: 1250, status: 'Awaiting Info', created: '2026-02-05', lastUpdate: '2026-02-15', statusStep: 2,
    description: 'Payment PAY-8331 was $1,250 less than the invoiced amount. Invoice was for $9,300 but payment received was $8,050.',
    messages: [
      { id: 'm1', sender: 'supplier', senderName: 'Acme Corp', text: 'We received $8,050 but the invoice INV-2026-0142 was for $9,300. There is a discrepancy of $1,250.', time: 'Feb 5, 2026 9:00 AM' },
      { id: 'm2', sender: 'buyer', senderName: 'TechGlobal Inc', text: 'We applied a credit memo CM-2026-0012 for $1,250 related to defective items returned on Jan 15. Please review the credit memo and confirm.', time: 'Feb 8, 2026 4:00 PM' },
      { id: 'm3', sender: 'supplier', senderName: 'Acme Corp', text: 'We were not aware of any returns. Could you provide the return authorization number and details of the items returned?', time: 'Feb 10, 2026 11:00 AM' },
    ],
  },
  {
    id: '3', disputeNumber: 'D-041', relatedInvoice: 'INV-2025-0138', type: 'Missing Payment',
    amount: 26800, status: 'Resolved', created: '2026-01-20', lastUpdate: '2026-02-02', statusStep: 3,
    description: 'Payment for INV-2025-0138 was not received by the expected date of Jan 22.',
    messages: [
      { id: 'm1', sender: 'supplier', senderName: 'Acme Corp', text: 'We have not received payment for INV-2025-0138 which was due on Jan 22, 2026.', time: 'Jan 20, 2026 2:00 PM' },
      { id: 'm2', sender: 'buyer', senderName: 'TechGlobal Inc', text: 'We apologize for the delay. The payment was held due to a banking system maintenance window. It has been re-initiated and should arrive within 2 business days.', time: 'Jan 22, 2026 9:30 AM' },
      { id: 'm3', sender: 'supplier', senderName: 'Acme Corp', text: 'Payment received. Thank you for the quick resolution.', time: 'Jan 25, 2026 10:00 AM' },
    ],
  },
  {
    id: '4', disputeNumber: 'D-038', relatedInvoice: 'INV-2025-0135', type: 'Duplicate',
    amount: 15400, status: 'Closed', created: '2026-01-10', lastUpdate: '2026-01-18', statusStep: 3,
    description: 'Duplicate charge detected. INV-2025-0135 appears to have been submitted twice.',
    messages: [
      { id: 'm1', sender: 'buyer', senderName: 'Medius Demo Corp', text: 'We noticed INV-2025-0135 was submitted twice. The duplicate has been flagged and will not be processed.', time: 'Jan 10, 2026 1:00 PM' },
      { id: 'm2', sender: 'supplier', senderName: 'Acme Corp', text: 'Confirmed. This was submitted in error from our system. The duplicate can be disregarded.', time: 'Jan 11, 2026 8:00 AM' },
    ],
  },
];

const disputeTypeOptions: { value: DisputeType; labelKey: string }[] = [
  { value: 'Amount Discrepancy', labelKey: 'supplierPortal.disputes.typeAmountDiscrepancy' },
  { value: 'Missing Payment', labelKey: 'supplierPortal.disputes.typeMissingPayment' },
  { value: 'Rejected Invoice', labelKey: 'supplierPortal.disputes.typeRejectedInvoice' },
  { value: 'Duplicate', labelKey: 'supplierPortal.disputes.typeDuplicate' },
  { value: 'Other', labelKey: 'supplierPortal.disputes.typeOther' },
];

const invoiceOptions = [
  'INV-2026-0156', 'INV-2026-0155', 'INV-2026-0154', 'INV-2026-0153',
  'INV-2026-0152', 'INV-2026-0151', 'INV-2026-0149', 'INV-2026-0148',
];

const statusStepLabels = ['Created', 'Under Review', 'Awaiting Info', 'Resolved'];

/* ───────── Helpers ───────── */

function formatCurrency(v: number): string {
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const statusClassMap: Record<DisputeStatus, string> = {
  Open: styles.statusOpen,
  'Under Review': styles.statusUnderReview,
  'Awaiting Info': styles.statusAwaitingInfo,
  Resolved: styles.statusResolved,
  Closed: styles.statusClosed,
};

/* ───────── Component ───────── */

export default function SupplierPortalDisputes() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  /* Create form state */
  const [newDispute, setNewDispute] = useState({
    invoice: '',
    type: '' as DisputeType | '',
    amount: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  /* Stats */
  const stats = useMemo(() => ({
    open: mockDisputes.filter((d) => d.status === 'Open' || d.status === 'Under Review').length,
    awaiting: mockDisputes.filter((d) => d.status === 'Awaiting Info').length,
    resolved30d: mockDisputes.filter((d) => d.status === 'Resolved' || d.status === 'Closed').length,
    avgDays: 12,
  }), []);

  /* Validate */
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!newDispute.invoice) errors.invoice = 'Required';
    if (!newDispute.type) errors.type = 'Required';
    if (!newDispute.amount || parseFloat(newDispute.amount) <= 0) errors.amount = 'Valid amount required';
    if (!newDispute.description.trim()) errors.description = 'Required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [newDispute]);

  const handleCreateDispute = useCallback(() => {
    if (validateForm()) {
      setShowCreateModal(false);
      setNewDispute({ invoice: '', type: '', amount: '', description: '' });
      setFormErrors({});
    }
  }, [validateForm]);

  const handleSendReply = useCallback(() => {
    if (replyText.trim() && selectedDispute) {
      /* In production, this would send to API */
      setReplyText('');
    }
  }, [replyText, selectedDispute]);

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
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t('supplierPortal.disputes.title')}</h1>
        <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
          &#10010; {t('supplierPortal.disputes.createDispute')}
        </button>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#FF7D00' }}>{stats.open}</div>
          <div className={styles.statLabel}>{t('supplierPortal.disputes.openDisputes')}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#165DFF' }}>{stats.awaiting}</div>
          <div className={styles.statLabel}>{t('supplierPortal.disputes.awaitingResponse')}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#00B42A' }}>{stats.resolved30d}</div>
          <div className={styles.statLabel}>{t('supplierPortal.disputes.resolved30d')}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {stats.avgDays} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#86909C' }}>{t('supplierPortal.disputes.days')}</span>
          </div>
          <div className={styles.statLabel}>{t('supplierPortal.disputes.avgResolutionTime')}</div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrapper}>
        {mockDisputes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>&#9989;</div>
            <div className={styles.emptyTitle}>{t('supplierPortal.disputes.noDisputes')}</div>
            <div className={styles.emptyDesc}>{t('supplierPortal.disputes.noDisputesDesc')}</div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('supplierPortal.disputes.disputeNumber')}</th>
                <th>{t('supplierPortal.disputes.relatedInvoice')}</th>
                <th>{t('supplierPortal.disputes.type')}</th>
                <th>{t('supplierPortal.disputes.amount')}</th>
                <th>{t('supplierPortal.disputes.status')}</th>
                <th>{t('supplierPortal.disputes.created')}</th>
                <th>{t('supplierPortal.disputes.lastUpdate')}</th>
                <th>{t('supplierPortal.disputes.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {mockDisputes.map((d) => (
                <tr key={d.id} onClick={() => setSelectedDispute(d)}>
                  <td><span className={styles.disputeId}>{d.disputeNumber}</span></td>
                  <td><span className={styles.invoiceRef}>{d.relatedInvoice}</span></td>
                  <td><span className={styles.typeBadge}>{d.type}</span></td>
                  <td><span className={styles.amountCell}>{formatCurrency(d.amount)}</span></td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusClassMap[d.status]}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>{d.created}</td>
                  <td>{d.lastUpdate}</td>
                  <td>
                    <button
                      className={styles.viewButton}
                      onClick={(e) => { e.stopPropagation(); setSelectedDispute(d); }}
                    >
                      {t('common.view')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Detail Slide-out ── */}
      <div
        className={`${styles.slideOverlay} ${selectedDispute ? styles.slideOverlayVisible : ''}`}
        onClick={() => setSelectedDispute(null)}
        aria-hidden="true"
      />
      <div className={`${styles.slidePanel} ${selectedDispute ? styles.slidePanelOpen : ''}`}>
        {selectedDispute && (
          <>
            <div className={styles.slidePanelHeader}>
              <span className={styles.slidePanelTitle}>
                {t('supplierPortal.disputes.disputeDetails')} - {selectedDispute.disputeNumber}
              </span>
              <button
                className={styles.slidePanelClose}
                onClick={() => setSelectedDispute(null)}
                aria-label={t('common.close')}
              >
                &#10005;
              </button>
            </div>
            <div className={styles.slidePanelBody}>
              {/* Detail rows */}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.disputes.relatedInvoice')}</span>
                <span className={styles.detailValue}>{selectedDispute.relatedInvoice}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.disputes.type')}</span>
                <span className={styles.detailValue}>{selectedDispute.type}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.disputes.amount')}</span>
                <span className={styles.detailValue}>{formatCurrency(selectedDispute.amount)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.disputes.status')}</span>
                <span className={`${styles.statusBadge} ${statusClassMap[selectedDispute.status]}`}>
                  {selectedDispute.status}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('supplierPortal.disputes.description')}</span>
                <span className={styles.detailValue} style={{ maxWidth: '60%', textAlign: 'right' }}>
                  {selectedDispute.description}
                </span>
              </div>

              {/* Status Timeline */}
              <div className={styles.statusTimeline}>
                <div className={styles.timelineTitle}>{t('supplierPortal.disputes.statusTimeline')}</div>
                <div className={styles.timelineSteps}>
                  {statusStepLabels.map((label, idx) => {
                    const isActive = idx <= selectedDispute.statusStep;
                    const isCurrent = idx === selectedDispute.statusStep;
                    return (
                      <div
                        key={label}
                        className={`${styles.timelineStep} ${isActive ? styles.timelineStepActive : ''}`}
                      >
                        <div
                          className={`${styles.timelineStepDot} ${
                            isCurrent
                              ? styles.timelineStepDotCurrent
                              : isActive
                              ? styles.timelineStepDotActive
                              : ''
                          }`}
                        >
                          {isActive && !isCurrent ? '\u2713' : idx + 1}
                        </div>
                        <span
                          className={`${styles.timelineStepLabel} ${isActive ? styles.timelineStepLabelActive : ''}`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Message Thread */}
              <div className={styles.messageThread}>
                <div className={styles.timelineTitle}>{t('supplierPortal.disputes.messageThread')}</div>
                <div className={styles.messageList}>
                  {selectedDispute.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${styles.message} ${
                        msg.sender === 'supplier' ? styles.messageSupplier : styles.messageBuyer
                      }`}
                    >
                      <div className={styles.messageSender}>{msg.senderName}</div>
                      <div className={styles.messageText}>{msg.text}</div>
                      <div className={styles.messageTime}>{msg.time}</div>
                    </div>
                  ))}
                </div>

                {/* Reply */}
                {selectedDispute.status !== 'Resolved' && selectedDispute.status !== 'Closed' && (
                  <div className={styles.replyBox}>
                    <textarea
                      className={styles.replyInput}
                      placeholder={t('supplierPortal.disputes.replyPlaceholder')}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={1}
                    />
                    <button className={styles.attachButton} aria-label={t('supplierPortal.disputes.attachFile')}>
                      &#128206;
                    </button>
                    <button
                      className={styles.sendButton}
                      onClick={handleSendReply}
                      aria-label={t('supplierPortal.disputes.sendReply')}
                    >
                      &#10148;
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Create Dispute Modal ── */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('supplierPortal.disputes.newDispute')}
        size="md"
        footer={
          <div className={styles.modalFooter}>
            <button className={styles.cancelButton} onClick={() => setShowCreateModal(false)}>
              {t('supplierPortal.disputes.cancel')}
            </button>
            <button className={styles.primaryButton} onClick={handleCreateDispute}>
              {t('supplierPortal.disputes.submit')}
            </button>
          </div>
        }
      >
        <div className={styles.modalBody}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.disputes.selectInvoice')} *</label>
              <select
                className={styles.formSelect}
                value={newDispute.invoice}
                onChange={(e) => setNewDispute((p) => ({ ...p, invoice: e.target.value }))}
              >
                <option value="" disabled>{t('supplierPortal.disputes.selectInvoice')}</option>
                {invoiceOptions.map((inv) => (
                  <option key={inv} value={inv}>{inv}</option>
                ))}
              </select>
              {formErrors.invoice && <span className={styles.formError}>{formErrors.invoice}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.disputes.disputeType')} *</label>
              <select
                className={styles.formSelect}
                value={newDispute.type}
                onChange={(e) => setNewDispute((p) => ({ ...p, type: e.target.value as DisputeType }))}
              >
                <option value="" disabled>{t('supplierPortal.disputes.selectType')}</option>
                {disputeTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                ))}
              </select>
              {formErrors.type && <span className={styles.formError}>{formErrors.type}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('supplierPortal.disputes.disputedAmount')} *</label>
            <input
              className={styles.formInput}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={newDispute.amount}
              onChange={(e) => setNewDispute((p) => ({ ...p, amount: e.target.value }))}
            />
            {formErrors.amount && <span className={styles.formError}>{formErrors.amount}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('supplierPortal.disputes.description')} *</label>
            <textarea
              className={styles.formTextarea}
              placeholder={t('supplierPortal.disputes.descriptionPlaceholder')}
              value={newDispute.description}
              onChange={(e) => setNewDispute((p) => ({ ...p, description: e.target.value }))}
            />
            {formErrors.description && <span className={styles.formError}>{formErrors.description}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('supplierPortal.disputes.supportingDocs')}</label>
            <div className={styles.uploadArea}>
              <div className={styles.uploadText}>{t('supplierPortal.disputes.uploadDocs')}</div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
