'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n/locale-context';
import styles from './approval-detail.module.css';

const invoiceData = {
  id: 'APR-001',
  invoiceNumber: 'INV-2024-1847',
  supplier: 'Acme Corp',
  supplierAddress: '123 Industrial Blvd, Chicago, IL 60601',
  supplierContact: 'billing@acmecorp.com',
  amount: 45250.00,
  currency: 'USD',
  requestDate: '2025-01-27',
  dueDate: '2025-02-10',
  submittedBy: 'Sarah Chen',
  department: 'Engineering',
  costCenter: 'CC-4200',
  poReference: 'PO-2024-0892',
  paymentTerms: 'Net 30',
  status: 'Pending Approval',
};

const lineItems = [
  { description: 'Enterprise License - Q1 2025', quantity: 1, unitPrice: 25000.00, glCode: '6100-01', total: 25000.00 },
  { description: 'Premium Support Package', quantity: 1, unitPrice: 12000.00, glCode: '6100-02', total: 12000.00 },
  { description: 'Implementation Services (40 hrs)', quantity: 40, unitPrice: 175.00, glCode: '6200-01', total: 7000.00 },
  { description: 'Data Migration Add-on', quantity: 1, unitPrice: 1250.00, glCode: '6200-02', total: 1250.00 },
];

const workflowSteps = [
  { step: 1, name: 'Department Manager', role: 'Sarah Chen', status: 'approved' as const, timestamp: '2025-01-27 09:15 AM' },
  { step: 2, name: 'Finance Director', role: 'Michael Torres', status: 'current' as const, timestamp: null },
  { step: 3, name: 'VP Operations', role: 'Jennifer Wu', status: 'pending' as const, timestamp: null },
];

const approvalHistory = [
  { action: 'Invoice submitted for approval', actor: 'System (Auto-capture)', timestamp: '2025-01-27 08:30 AM', type: 'system' as const },
  { action: 'AI pre-screening completed - Low Risk', actor: 'Medius AI Engine', timestamp: '2025-01-27 08:31 AM', type: 'system' as const },
  { action: 'Approved by Department Manager', actor: 'Sarah Chen', timestamp: '2025-01-27 09:15 AM', type: 'approved' as const },
  { action: 'Routed to Finance Director for review', actor: 'System (Workflow)', timestamp: '2025-01-27 09:16 AM', type: 'system' as const },
  { action: 'Awaiting approval from Finance Director', actor: 'Michael Torres', timestamp: 'Pending', type: 'pending' as const },
];

const comments = [
  { author: 'Sarah Chen', time: '2025-01-27 09:14 AM', text: 'Approved. This aligns with our Q1 software budget allocation. Vendor has been vetted.' },
  { author: 'Medius AI', time: '2025-01-27 08:31 AM', text: 'Automated analysis: Invoice matches PO-2024-0892 with 98% confidence. Amount within 2% of PO estimate. No anomalies detected.' },
  { author: 'David Kim', time: '2025-01-26 04:45 PM', text: 'Please prioritize this approval - implementation is scheduled for Feb 3rd.' },
];

const similarInvoices = [
  'INV-2024-1201 - Acme Corp - $42,800 - Approved (Dec 2024)',
  'INV-2024-0903 - Acme Corp - $25,000 - Approved (Sep 2024)',
  'INV-2024-0455 - Acme Corp - $38,500 - Approved (May 2024)',
];

const anomalies = [
  'Amount is 5.7% higher than last quarter - within acceptable range',
  'New line item: Data Migration Add-on ($1,250) - first occurrence',
  'Implementation rate ($175/hr) matches contract terms',
];

export default function ApprovalDetailPage() {
  const t = useT();
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const getStepClass = (status: 'approved' | 'current' | 'pending') => {
    if (status === 'approved') return styles.stepComplete;
    if (status === 'current') return styles.stepCurrent;
    return styles.stepPending;
  };

  const getStepStatusClass = (status: 'approved' | 'current' | 'pending') => {
    if (status === 'approved') return styles.stepStatusApproved;
    if (status === 'current') return styles.stepStatusPending;
    return styles.stepStatusWaiting;
  };

  const getStepStatusText = (status: 'approved' | 'current' | 'pending') => {
    if (status === 'approved') return 'Approved';
    if (status === 'current') return 'Awaiting Review';
    return 'Pending';
  };

  const getHistoryDotClass = (type: 'system' | 'approved' | 'pending' | 'submitted') => {
    if (type === 'approved') return styles.historyDotApproved;
    if (type === 'pending') return styles.historyDotPending;
    if (type === 'submitted') return styles.historyDotSubmitted;
    return styles.historyDotSystem;
  };

  return (
    <div className={styles.container}>
      <Link href="/approvals" className={styles.backLink}>
        <span className={styles.backArrow}>&larr;</span> {t('approvalDetail.backToApprovals')}
      </Link>

      {/* Invoice Summary Header */}
      <div className={styles.summaryHeader}>
        <div className={styles.summaryLeft}>
          <h1 className={styles.invoiceTitle}>{invoiceData.invoiceNumber}</h1>
          <div className={styles.supplierName}>{invoiceData.supplier}</div>
          <div className={styles.summaryMeta}>
            <span className={styles.metaItem}><span className={styles.metaLabel}>Submitted: </span>{invoiceData.requestDate}</span>
            <span className={styles.metaItem}><span className={styles.metaLabel}>Due: </span>{invoiceData.dueDate}</span>
            <span className={styles.metaItem}><span className={styles.metaLabel}>PO: </span>{invoiceData.poReference}</span>
            <span className={styles.metaItem}><span className={styles.metaLabel}>Terms: </span>{invoiceData.paymentTerms}</span>
          </div>
        </div>
        <div className={styles.summaryRight}>
          <div className={styles.totalAmount}>{formatCurrency(invoiceData.amount)}</div>
          <div className={`${styles.statusBadge} ${styles.statusPending}`}>{invoiceData.status}</div>
        </div>
      </div>

      {/* Workflow Visualization */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('approvalDetail.approvalDetails')}</div>
        <div className={styles.workflowSteps}>
          {workflowSteps.map((ws, idx) => (
            <div key={ws.step} className={styles.step}>
              <div className={`${styles.stepIndicator} ${getStepClass(ws.status)}`}>
                {ws.status === 'approved' ? '\u2713' : ws.step}
              </div>
              {idx < workflowSteps.length - 1 && (
                <div className={`${styles.stepConnector} ${ws.status === 'approved' ? styles.connectorComplete : styles.connectorPending}`} />
              )}
              <div className={styles.stepInfo}>
                <span className={styles.stepName}>{ws.name}</span>
                <span className={styles.stepRole}>{ws.role}</span>
                <span className={`${styles.stepStatus} ${getStepStatusClass(ws.status)}`}>
                  {getStepStatusText(ws.status)}
                </span>
                {ws.timestamp && <span className={styles.stepTimestamp}>{ws.timestamp}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.twoCol}>
        {/* Invoice Line Items */}
        <div className={styles.section} style={{ marginBottom: 0 }}>
          <div className={styles.sectionTitle}>{t('invoiceDetail.lineItems')}</div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>GL Code</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td><span className={styles.glCode}>{item.glCode}</span></td>
                  <td>{formatCurrency(item.total)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} className={styles.tableTotal} style={{ textAlign: 'right' }}>Total</td>
                <td className={styles.tableTotal}>{formatCurrency(invoiceData.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Invoice Details */}
        <div className={styles.section} style={{ marginBottom: 0 }}>
          <div className={styles.sectionTitle}>{t('approvalDetail.invoiceInfo')}</div>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{t('invoiceDetail.supplier')}</span>
              <span className={styles.detailValue}>{invoiceData.supplier}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Address</span>
              <span className={styles.detailValue}>{invoiceData.supplierAddress}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Contact</span>
              <span className={styles.detailValue}>{invoiceData.supplierContact}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Currency</span>
              <span className={styles.detailValue}>{invoiceData.currency}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{t('invoiceDetail.costCenter')}</span>
              <span className={styles.detailValue}>{invoiceData.costCenter}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{t('invoiceDetail.poNumber')}</span>
              <span className={styles.detailValue}>{invoiceData.poReference}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Submitted By</span>
              <span className={styles.detailValue}>{invoiceData.submittedBy}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{t('invoiceDetail.department')}</span>
              <span className={styles.detailValue}>{invoiceData.department}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className={styles.aiSection}>
        <div className={styles.aiHeader}>
          <span className={styles.aiTitle}>{t('approvalDetail.aiAnalysis')}</span>
        </div>
        <div className={styles.aiGrid}>
          <div className={styles.aiCard}>
            <div className={styles.aiCardTitle}>Risk Assessment</div>
            <div className={styles.riskMeter}>
              <div className={styles.riskBar}>
                <div className={`${styles.riskFill} ${styles.riskLow}`} style={{ width: '18%' }} />
              </div>
              <span className={`${styles.riskLabel} ${styles.riskLowText}`}>Low</span>
            </div>
            <div className={styles.aiListItem}>Vendor relationship: 3+ years, 47 prior invoices</div>
            <div className={styles.aiListItem}>Amount variance from PO: +2.1% (within tolerance)</div>
            <div className={styles.aiListItem}>Payment history: 100% on-time, no disputes</div>
          </div>
          <div className={styles.aiCard}>
            <div className={styles.aiCardTitle}>Similar Invoices</div>
            {similarInvoices.map((inv, idx) => (
              <div key={idx} className={styles.aiListItem}>{inv}</div>
            ))}
          </div>
          <div className={styles.aiCard}>
            <div className={styles.aiCardTitle}>Anomaly Detection</div>
            {anomalies.map((a, idx) => (
              <div key={idx} className={styles.aiListItem}>{a}</div>
            ))}
          </div>
          <div className={styles.aiCard}>
            <div className={styles.aiCardTitle}>Compliance Check</div>
            <div className={styles.aiListItem}>PO match: Verified (98% confidence)</div>
            <div className={styles.aiListItem}>Budget availability: Confirmed ($127K remaining)</div>
            <div className={styles.aiListItem}>Segregation of duties: Compliant</div>
            <div className={styles.aiListItem}>Duplicate check: No duplicates found</div>
          </div>
        </div>
        <div className={styles.aiRecommendation}>
          <span className={styles.aiRecLabel}>AI Recommendation:</span>
          <span className={styles.aiRecValue}>Approve</span>
          <span className={styles.aiRecConfidence}>94% confidence</span>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <div className={styles.actionsTitle}>Actions</div>
        <div className={styles.actionButtons}>
          <button className={styles.btnApprove}>{t('approvalDetail.approve')}</button>
          <button className={styles.btnReject}>{t('approvalDetail.reject')}</button>
          <button className={styles.btnSecondary}>Request Info</button>
          <button className={styles.btnSecondary}>Delegate</button>
          <button className={styles.btnSecondary}>{t('approvalDetail.escalate')}</button>
        </div>
      </div>

      {/* Approval History */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('approvalDetail.approvalHistory')}</div>
        <div className={styles.historyList}>
          {approvalHistory.map((h, idx) => (
            <div key={idx} className={styles.historyItem}>
              <div className={`${styles.historyDot} ${getHistoryDotClass(h.type)}`} />
              <div className={styles.historyContent}>
                <div className={styles.historyAction}>{h.action}</div>
                <div className={styles.historyMeta}>{h.actor} - {h.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Comments</div>
        <div className={styles.commentThread}>
          {comments.map((c, idx) => (
            <div key={idx} className={styles.comment}>
              <span className={styles.commentAuthor}>{c.author}</span>
              <span className={styles.commentTime}>{c.time}</span>
              <div className={styles.commentText}>{c.text}</div>
            </div>
          ))}
        </div>
        <div className={styles.commentInput}>
          <textarea className={styles.commentField} placeholder={t('approvalDetail.addComment')} rows={2} />
          <button className={styles.commentBtn}>Post</button>
        </div>
      </div>
    </div>
  );
}
