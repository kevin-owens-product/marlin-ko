'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n/locale-context';
import styles from './invoice-detail.module.css';

const invoiceData = {
  invoiceNumber: 'INV-2024-001847',
  supplier: 'Acme Corporation',
  supplierAddress: '123 Industrial Pkwy, Chicago, IL 60601, USA',
  supplierVAT: 'US-EIN-47-2891034',
  amount: 24500.00,
  currency: 'USD',
  status: 'Approved',
  date: '2024-01-28',
  dueDate: '2024-02-28',
  paymentTerms: 'Net 30',
  poNumber: 'PO-2024-003421',
  department: 'Engineering',
  costCenter: 'CC-4200',
  taxAmount: 3675.00,
  subtotal: 20825.00,
  companyName: 'Medius Finance Corp',
  receivedDate: '2024-01-28T09:14:00Z',
};

const lineItems = [
  { id: 1, description: 'Cloud Infrastructure Services - January 2024', quantity: 1, unitPrice: 8500.00, total: 8500.00, glCode: '6200-01', glName: 'Cloud & Hosting' },
  { id: 2, description: 'Software License Renewal - Enterprise Suite', quantity: 5, unitPrice: 1200.00, total: 6000.00, glCode: '6210-03', glName: 'Software Licenses' },
  { id: 3, description: 'Professional Services - Data Migration', quantity: 40, unitPrice: 125.00, total: 5000.00, glCode: '6300-02', glName: 'Consulting Services' },
  { id: 4, description: 'Security Compliance Audit', quantity: 1, unitPrice: 1325.00, total: 1325.00, glCode: '6310-01', glName: 'Audit & Compliance' },
];

const timelineSteps = [
  { stage: 'Captured', status: 'complete' as const, time: 'Jan 28, 09:14 AM', confidence: '99.2%', detail: 'OCR extraction completed' },
  { stage: 'Classified', status: 'complete' as const, time: 'Jan 28, 09:14 AM', confidence: '97.8%', detail: 'Category: Technology Services' },
  { stage: 'Compliance Check', status: 'complete' as const, time: 'Jan 28, 09:15 AM', confidence: '98.5%', detail: 'All compliance rules passed' },
  { stage: 'PO Matched', status: 'complete' as const, time: 'Jan 28, 09:15 AM', confidence: '96.1%', detail: 'Matched to PO-2024-003421' },
  { stage: 'Approved', status: 'complete' as const, time: 'Jan 28, 09:22 AM', confidence: '98.5%', detail: 'Auto-approved by SmartFlow' },
];

const agentDecisions = [
  { agent: 'Capture Agent', text: 'Extracted 4 line items from PDF with 99.2% confidence. All fields validated against supplier master data.', time: '09:14:12 AM' },
  { agent: 'Classification Agent', text: 'Classified under Technology Services based on supplier category and line item descriptions. GL codes auto-assigned from historical patterns.', time: '09:14:18 AM' },
  { agent: 'Compliance Agent', text: 'Checked against 12 compliance rules. VAT registration verified. Amount within approved budget threshold. No duplicate invoice detected.', time: '09:15:02 AM' },
  { agent: 'Matching Agent', text: 'Three-way match successful: PO-2024-003421, GRN-2024-008891, INV-2024-001847. Variance: 0.0% (within 2% tolerance).', time: '09:15:34 AM' },
  { agent: 'Approval Agent', text: 'Auto-approved per policy AP-2024-017: Matched invoices under $50,000 from Tier-1 suppliers with >95% confidence bypass manual review.', time: '09:22:01 AM' },
];

const approvers = [
  { name: 'SmartFlow Engine', role: 'AI Auto-Approval', status: 'approved' as const },
  { name: 'Sarah Chen', role: 'AP Manager', status: 'approved' as const },
  { name: 'Michael Torres', role: 'Finance Director', status: 'pending' as const },
];

const notes = [
  { author: 'SmartFlow AI', text: 'Invoice processed through fully autonomous pipeline. No exceptions detected. Payment scheduled for Feb 25, 2024 per early payment discount terms.', time: 'Jan 28, 2024 at 09:22 AM' },
  { author: 'Sarah Chen', text: 'Confirmed line items match the SOW for Q1 cloud migration project. Approved.', time: 'Jan 28, 2024 at 10:45 AM' },
];

export default function InvoiceDetailPage() {
  const t = useT();
  return (
    <div className={styles.page}>
      <Link href="/invoices">
        <button className={styles.backLink}>
          &#8592; {t('invoiceDetail.backToInvoices')}
        </button>
      </Link>

      <div className={styles.invoiceHeader}>
        <div className={styles.invoiceHeaderLeft}>
          <h1>{invoiceData.invoiceNumber}</h1>
          <div className={styles.invoiceHeaderMeta}>
            <span>{t('invoiceDetail.supplier')}: <strong>{invoiceData.supplier}</strong></span>
            <span>{t('invoiceDetail.dueDate')}: <strong>{invoiceData.dueDate}</strong></span>
            <span>{t('invoiceDetail.poNumber')}: <strong>{invoiceData.poNumber}</strong></span>
            <span>Terms: <strong>{invoiceData.paymentTerms}</strong></span>
          </div>
        </div>
        <div className={styles.invoiceHeaderRight}>
          <div className={styles.invoiceAmount}>
            ${invoiceData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            <span className={styles.invoiceAmountCurrency}>{invoiceData.currency}</span>
          </div>
          <span className={styles.badgeApproved}>{invoiceData.status}</span>
        </div>
      </div>

      <div className={styles.twoColumn}>
        <div className={styles.leftColumn}>
          {/* Document Preview */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Document Preview</span>
              <button className={styles.backLink} style={{ marginBottom: 0 }}>Download PDF</button>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.docPreview}>
                <div className={styles.docPreviewIcon}>&#128196;</div>
                <div>INV-2024-001847.pdf</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>Click to view full document</div>
              </div>
            </div>
          </div>

          {/* Extracted Data */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{t('invoiceDetail.invoiceDetails')}</span>
              <span style={{ fontSize: '0.75rem', color: '#23C343' }}>{t('invoiceDetail.aiConfidence')}: 98.5%</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Invoice Number</span>
                  <span className={styles.fieldValue}>{invoiceData.invoiceNumber}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>{t('invoiceDetail.invoiceDate')}</span>
                  <span className={styles.fieldValue}>{invoiceData.date}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>{t('invoiceDetail.supplier')}</span>
                  <span className={styles.fieldValue}>{invoiceData.supplier}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Supplier VAT</span>
                  <span className={styles.fieldValue}>{invoiceData.supplierVAT}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Supplier Address</span>
                  <span className={styles.fieldValue}>{invoiceData.supplierAddress}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Bill To</span>
                  <span className={styles.fieldValue}>{invoiceData.companyName}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>{t('invoiceDetail.department')}</span>
                  <span className={styles.fieldValue}>{invoiceData.department}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>{t('invoiceDetail.costCenter')}</span>
                  <span className={styles.fieldValue}>{invoiceData.costCenter}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Payment Terms</span>
                  <span className={styles.fieldValue}>{invoiceData.paymentTerms}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>{t('invoiceDetail.poNumber')}</span>
                  <span className={styles.fieldValue}>{invoiceData.poNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{t('invoiceDetail.lineItems')}</span>
              <span style={{ fontSize: '0.75rem', color: '#86909C' }}>{lineItems.length} items</span>
            </div>
            <table className={styles.lineItemsTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('common.description')}</th>
                  <th>{t('invoiceDetail.quantity')}</th>
                  <th>{t('invoiceDetail.unitPrice')}</th>
                  <th>{t('invoiceDetail.total')}</th>
                  <th>{t('invoiceDetail.glCode')}</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 600 }}>${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={styles.glCode}>{item.glCode}</span>
                      <span style={{ fontSize: '0.6875rem', color: '#4E5969', marginLeft: '0.375rem' }}>{item.glName}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right' }}>Subtotal</td>
                  <td>${invoiceData.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right' }}>Tax (15%)</td>
                  <td>${invoiceData.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>{t('invoiceDetail.total')}</td>
                  <td style={{ fontWeight: 700, color: '#165DFF' }}>${invoiceData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className={styles.rightColumn}>
          {/* AI Processing Timeline */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{t('invoiceDetail.timeline')}</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.timeline}>
                {timelineSteps.map((step, i) => (
                  <div key={i} className={styles.timelineItem}>
                    <div className={styles.timelineLine} />
                    <div className={`${styles.timelineDot} ${
                      step.status === 'complete' ? styles.timelineDotComplete :
                      step.status === 'active' ? styles.timelineDotActive :
                      styles.timelineDotPending
                    }`}>
                      {step.status === 'complete' ? '\u2713' : (i + 1)}
                    </div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineTitle}>{step.stage}</div>
                      <div className={styles.timelineTime}>{step.time}</div>
                      <div className={styles.timelineConfidence}>Confidence: {step.confidence} -- {step.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Decision Log */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Agent Decision Log</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.decisionLog}>
                {agentDecisions.map((decision, i) => (
                  <div key={i} className={styles.decisionItem}>
                    <div className={styles.decisionAgent}>{decision.agent}</div>
                    <div className={styles.decisionText}>{decision.text}</div>
                    <div className={styles.decisionTime}>{decision.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Approval Status */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{t('invoiceDetail.status')}</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.approvalStatus}>
                {approvers.map((approver, i) => (
                  <div key={i} className={styles.approver}>
                    <div className={styles.approverInfo}>
                      <span className={styles.approverName}>{approver.name}</span>
                      <span className={styles.approverRole}>{approver.role}</span>
                    </div>
                    <span className={`${styles.approverBadge} ${
                      approver.status === 'approved' ? styles.approverApproved : styles.approverPending
                    }`}>
                      {approver.status === 'approved' ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.card}>
            <div className={styles.cardBody}>
              <div className={styles.actionButtons}>
                <button className={styles.btnApprove}>{t('invoiceDetail.approve')}</button>
                <button className={styles.btnReject}>{t('invoiceDetail.reject')}</button>
                <button className={styles.btnEscalate}>Escalate</button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Notes & Comments</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.notesSection}>
                {notes.map((note, i) => (
                  <div key={i} className={styles.noteItem}>
                    <div className={styles.noteAuthor}>{note.author}</div>
                    <div className={styles.noteText}>{note.text}</div>
                    <div className={styles.noteTime}>{note.time}</div>
                  </div>
                ))}
                <div className={styles.noteInput}>
                  <textarea className={styles.noteTextarea} placeholder="Add a note..." rows={2} />
                  <button className={styles.noteSubmitBtn}>Post</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
