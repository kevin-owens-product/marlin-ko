'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/locale-context';
import styles from './dashboard.module.css';

/* ───────── Mock Data ───────── */

const supplierName = 'Acme Corp';
const lastLoginDate = 'Feb 20, 2026 at 9:42 AM';

const kpiData = {
  outstandingInvoices: { count: 7, total: 160350 },
  pendingPayments: { count: 3, total: 66650 },
  nextPayment: { date: 'Feb 25, 2026', amount: 12500 },
  availableDiscounts: { count: 4, savings: 3200 },
};

interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: 'Submitted' | 'Processing' | 'Matched' | 'Approved' | 'Paid' | 'Rejected';
}

const recentInvoices: RecentInvoice[] = [
  { id: 'ri-1', invoiceNumber: 'INV-2026-0156', date: 'Jan 28, 2026', amount: 24500, status: 'Submitted' },
  { id: 'ri-2', invoiceNumber: 'INV-2026-0155', date: 'Jan 27, 2026', amount: 18200, status: 'Processing' },
  { id: 'ri-3', invoiceNumber: 'INV-2026-0154', date: 'Jan 25, 2026', amount: 31000, status: 'Matched' },
  { id: 'ri-4', invoiceNumber: 'INV-2026-0153', date: 'Jan 23, 2026', amount: 12750, status: 'Approved' },
  { id: 'ri-5', invoiceNumber: 'INV-2026-0149', date: 'Jan 16, 2026', amount: 22300, status: 'Paid' },
];

interface RecentPayment {
  id: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
}

const recentPayments: RecentPayment[] = [
  { id: 'rp-1', date: 'Feb 15, 2026', amount: 22300, method: 'ACH', reference: 'PAY-8401' },
  { id: 'rp-2', date: 'Feb 13, 2026', amount: 37500, method: 'Wire', reference: 'PAY-8392' },
  { id: 'rp-3', date: 'Feb 11, 2026', amount: 19800, method: 'ACH', reference: 'PAY-8385' },
  { id: 'rp-4', date: 'Feb 09, 2026', amount: 41200, method: 'ACH', reference: 'PAY-8371' },
  { id: 'rp-5', date: 'Feb 07, 2026', amount: 15600, method: 'Wire', reference: 'PAY-8365' },
];

interface Notification {
  id: string;
  text: string;
  type: 'payment' | 'invoice' | 'scf' | 'dispute';
  time: string;
}

const notifications: Notification[] = [
  { id: 'n-1', text: 'Payment of $12,500 scheduled for Feb 25', type: 'payment', time: '1 hour ago' },
  { id: 'n-2', text: 'Invoice INV-2026-089 approved', type: 'invoice', time: '3 hours ago' },
  { id: 'n-3', text: 'New SCF program available — save up to 2.1%', type: 'scf', time: '5 hours ago' },
  { id: 'n-4', text: 'Dispute #D-045 response received', type: 'dispute', time: '1 day ago' },
  { id: 'n-5', text: 'Payment of $37,500 completed via Wire', type: 'payment', time: '2 days ago' },
];

const openDisputeCount = 2;

/* ───────── Helpers ───────── */

function formatCurrency(v: number): string {
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const invoiceStatusClassMap: Record<string, string> = {
  Submitted: styles.statusSubmitted,
  Processing: styles.statusProcessing,
  Matched: styles.statusMatched,
  Approved: styles.statusApproved,
  Paid: styles.statusPaid,
  Rejected: styles.statusRejected,
};

const notificationIconMap: Record<string, string> = {
  payment: '&#128176;',
  invoice: '&#128196;',
  scf: '&#9733;',
  dispute: '&#9888;',
};

const notificationColorMap: Record<string, string> = {
  payment: styles.notifPayment,
  invoice: styles.notifInvoice,
  scf: styles.notifScf,
  dispute: styles.notifDispute,
};

/* ───────── Component ───────── */

export default function SupplierDashboardPage() {
  const t = useT();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.kpiGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonKpi} />
          ))}
        </div>
        <div className={styles.contentGrid}>
          <div className={styles.skeletonSection} />
          <div className={styles.skeletonSection} />
        </div>
        <div className={styles.skeletonSection} />
      </div>
    );
  }

  return (
    <>
      {/* ── Welcome Banner ── */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>
          {t('supplierPortal.dashboard.welcome', { name: supplierName })}
        </h1>
        <p className={styles.lastLogin}>
          {t('supplierPortal.dashboard.lastLogin', { date: lastLoginDate })}
        </p>
      </div>

      {/* ── Notification Banner ── */}
      {showBanner && (
        <div className={styles.notificationBanner}>
          <span className={styles.bannerIcon} aria-hidden="true">&#9432;</span>
          <span className={styles.bannerText}>
            {t('supplierPortal.dashboard.termsUpdatedNotice')}
          </span>
          <button
            className={styles.bannerClose}
            onClick={() => setShowBanner(false)}
            aria-label={t('supplierPortal.dashboard.dismissNotification')}
          >
            &#10005;
          </button>
        </div>
      )}

      {/* ── KPI Cards Row ── */}
      <div className={styles.kpiGrid}>
        {/* Outstanding Invoices */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconRow}>
            <div className={`${styles.kpiIconBubble} ${styles.kpiIconBlue}`}>&#128196;</div>
          </div>
          <div className={styles.kpiLabel}>
            {t('supplierPortal.dashboard.outstandingInvoices')}
          </div>
          <div className={styles.kpiValue}>
            {kpiData.outstandingInvoices.count}
          </div>
          <div className={styles.kpiSub}>
            {formatCurrency(kpiData.outstandingInvoices.total)} {t('supplierPortal.dashboard.totalValue')}
          </div>
        </div>

        {/* Pending Payments */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconRow}>
            <div className={`${styles.kpiIconBubble} ${styles.kpiIconOrange}`}>&#128176;</div>
          </div>
          <div className={styles.kpiLabel}>
            {t('supplierPortal.dashboard.pendingPayments')}
          </div>
          <div className={styles.kpiValue}>
            {kpiData.pendingPayments.count}
          </div>
          <div className={styles.kpiSub}>
            {formatCurrency(kpiData.pendingPayments.total)} {t('supplierPortal.dashboard.pending')}
          </div>
        </div>

        {/* Next Payment Date */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconRow}>
            <div className={`${styles.kpiIconBubble} ${styles.kpiIconGreen}`}>&#128197;</div>
          </div>
          <div className={styles.kpiLabel}>
            {t('supplierPortal.dashboard.nextPaymentDate')}
          </div>
          <div className={styles.kpiValue}>
            {kpiData.nextPayment.date}
          </div>
          <div className={styles.kpiSub}>
            {formatCurrency(kpiData.nextPayment.amount)}
          </div>
        </div>

        {/* Available Discounts */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconRow}>
            <div className={`${styles.kpiIconBubble} ${styles.kpiIconPurple}`}>&#9733;</div>
          </div>
          <div className={styles.kpiLabel}>
            {t('supplierPortal.dashboard.availableDiscounts')}
          </div>
          <div className={styles.kpiValue} style={{ color: '#722ED1' }}>
            {kpiData.availableDiscounts.count}
          </div>
          <div className={styles.kpiSub}>
            {formatCurrency(kpiData.availableDiscounts.savings)} {t('supplierPortal.dashboard.potentialSavings')}
          </div>
        </div>
      </div>

      {/* ── Recent Invoices Table ── */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {t('supplierPortal.dashboard.recentInvoices')}
          </h2>
          <button
            className={styles.sectionAction}
            onClick={() => router.push('/supplier-portal/invoices')}
          >
            {t('supplierPortal.dashboard.viewAll')}
          </button>
        </div>
        <div className={styles.sectionBody}>
          <table className={styles.upcomingTable}>
            <thead>
              <tr>
                <th>{t('supplierPortal.dashboard.invoiceNumber')}</th>
                <th>{t('supplierPortal.dashboard.date')}</th>
                <th>{t('supplierPortal.dashboard.amount')}</th>
                <th>{t('supplierPortal.dashboard.status')}</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <span className={styles.invoiceRef}>{inv.invoiceNumber}</span>
                  </td>
                  <td>{inv.date}</td>
                  <td>
                    <span className={styles.amountCell}>{formatCurrency(inv.amount)}</span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${invoiceStatusClassMap[inv.status] || ''}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Two Column: Recent Payments + Notifications ── */}
      <div className={styles.contentGrid}>
        {/* Recent Payments */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {t('supplierPortal.dashboard.recentPayments')}
            </h2>
            <button
              className={styles.sectionAction}
              onClick={() => router.push('/supplier-portal/payments')}
            >
              {t('supplierPortal.dashboard.viewAll')}
            </button>
          </div>
          <div className={styles.sectionBody}>
            <table className={styles.upcomingTable}>
              <thead>
                <tr>
                  <th>{t('supplierPortal.dashboard.date')}</th>
                  <th>{t('supplierPortal.dashboard.amount')}</th>
                  <th>{t('supplierPortal.dashboard.method')}</th>
                  <th>{t('supplierPortal.dashboard.reference')}</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.date}</td>
                    <td>
                      <span className={styles.amountCell}>{formatCurrency(p.amount)}</span>
                    </td>
                    <td>
                      <span className={styles.methodBadge}>{p.method}</span>
                    </td>
                    <td>
                      <span className={styles.invoiceRef}>{p.reference}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications/Alerts Panel */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {t('supplierPortal.dashboard.notificationsAlerts')}
            </h2>
          </div>
          <div className={styles.sectionBody}>
            <ul className={styles.notificationList}>
              {notifications.map((notif) => (
                <li key={notif.id} className={styles.notificationItem}>
                  <span
                    className={`${styles.notificationIcon} ${notificationColorMap[notif.type] || ''}`}
                    dangerouslySetInnerHTML={{ __html: notificationIconMap[notif.type] || '&#9432;' }}
                  />
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationText}>{notif.text}</div>
                    <div className={styles.notificationTime}>{notif.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Open Disputes + Quick Actions Row ── */}
      <div className={styles.contentGrid}>
        {/* Open Disputes */}
        <div className={styles.disputeCard}>
          <div className={styles.disputeCardContent}>
            <div className={styles.disputeIconBubble}>&#9888;</div>
            <div className={styles.disputeInfo}>
              <div className={styles.disputeCount}>{openDisputeCount}</div>
              <div className={styles.disputeLabel}>{t('supplierPortal.dashboard.openDisputes')}</div>
            </div>
          </div>
          <button
            className={styles.disputeLink}
            onClick={() => router.push('/supplier-portal/disputes')}
          >
            {t('supplierPortal.dashboard.viewDisputes')}
          </button>
        </div>

        {/* Quick Actions */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {t('supplierPortal.dashboard.quickActions')}
            </h2>
          </div>
          <div className={styles.quickActionsGrid}>
            <button
              className={styles.quickAction}
              onClick={() => router.push('/supplier-portal/invoices')}
            >
              <span className={`${styles.quickActionIcon} ${styles.quickActionIconBlue}`}>
                &#10010;
              </span>
              <span className={styles.quickActionLabel}>
                {t('supplierPortal.dashboard.submitInvoice')}
              </span>
            </button>
            <button
              className={styles.quickAction}
              onClick={() => router.push('/supplier-portal/payments')}
            >
              <span className={`${styles.quickActionIcon} ${styles.quickActionIconGreen}`}>
                &#128176;
              </span>
              <span className={styles.quickActionLabel}>
                {t('supplierPortal.dashboard.viewPayments')}
              </span>
            </button>
            <button
              className={styles.quickAction}
              onClick={() => {/* Contact support action */}}
            >
              <span className={`${styles.quickActionIcon} ${styles.quickActionIconOrange}`}>
                &#128172;
              </span>
              <span className={styles.quickActionLabel}>
                {t('supplierPortal.dashboard.contactSupport')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
