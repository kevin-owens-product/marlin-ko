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
  nextPayment: { date: 'Feb 22, 2026', amount: 12750 },
  openDisputes: { count: 2, urgent: 1 },
  scfCredit: { available: 250000 },
};

interface ActivityEvent {
  id: string;
  text: string;
  time: string;
  color: 'green' | 'blue' | 'orange' | 'red' | 'purple';
}

const recentActivity: ActivityEvent[] = [
  { id: 'act-1', text: 'Invoice INV-2026-0156 was received and is under review', time: '2 hours ago', color: 'blue' },
  { id: 'act-2', text: 'Payment $22,300 processed via ACH for INV-2026-0149', time: '5 hours ago', color: 'green' },
  { id: 'act-3', text: 'Invoice INV-2026-0153 has been approved', time: '1 day ago', color: 'green' },
  { id: 'act-4', text: 'Dispute #D-45 response received from Medius Demo Corp', time: '1 day ago', color: 'orange' },
  { id: 'act-5', text: 'Payment $37,500 processed via Wire for INV-2026-0148', time: '2 days ago', color: 'green' },
];

interface UpcomingPayment {
  id: string;
  invoiceNumber: string;
  amount: number;
  expectedDate: string;
  method: string;
}

const upcomingPayments: UpcomingPayment[] = [
  { id: 'up-1', invoiceNumber: 'INV-2026-0153', amount: 12750, expectedDate: 'Feb 22, 2026', method: 'ACH' },
  { id: 'up-2', invoiceNumber: 'INV-2026-0152', amount: 45000, expectedDate: 'Feb 24, 2026', method: 'Wire' },
  { id: 'up-3', invoiceNumber: 'INV-2026-0151', amount: 8900, expectedDate: 'Feb 28, 2026', method: 'ACH' },
  { id: 'up-4', invoiceNumber: 'INV-2026-0150', amount: 56200, expectedDate: 'Mar 3, 2026', method: 'ACH' },
  { id: 'up-5', invoiceNumber: 'INV-2026-0154', amount: 31000, expectedDate: 'Mar 5, 2026', method: 'Wire' },
];

const buyerAnnouncement =
  'Medius Demo Corp has updated their payment terms. Net-30 terms now apply to all new invoices submitted after February 15, 2026. Please review the updated terms in your Documents section.';

/* ───────── Helpers ───────── */

function formatCurrency(v: number): string {
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const dotColorMap: Record<string, string> = {
  green: styles.dotGreen,
  blue: styles.dotBlue,
  orange: styles.dotOrange,
  red: styles.dotRed,
  purple: styles.dotPurple,
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
          {[1, 2, 3, 4, 5].map((i) => (
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
      {/* ── Welcome Header ── */}
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
          <span className={styles.bannerText}>{buyerAnnouncement}</span>
          <button
            className={styles.bannerClose}
            onClick={() => setShowBanner(false)}
            aria-label={t('supplierPortal.dashboard.dismissNotification')}
          >
            &#10005;
          </button>
        </div>
      )}

      {/* ── KPI Cards ── */}
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
            {formatCurrency(kpiData.outstandingInvoices.total)}
          </div>
          <div className={styles.kpiSub}>
            {t('supplierPortal.dashboard.invoiceCount', { count: kpiData.outstandingInvoices.count })}
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
            {formatCurrency(kpiData.pendingPayments.total)}
          </div>
          <div className={styles.kpiSub}>
            {t('supplierPortal.dashboard.paymentCount', { count: kpiData.pendingPayments.count })}
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

        {/* Open Disputes */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconRow}>
            <div className={`${styles.kpiIconBubble} ${styles.kpiIconRed}`}>&#9888;</div>
          </div>
          <div className={styles.kpiLabel}>
            {t('supplierPortal.dashboard.openDisputes')}
          </div>
          <div className={styles.kpiValue}>
            {kpiData.openDisputes.count}
            {kpiData.openDisputes.urgent > 0 && (
              <span className={`${styles.kpiBadge} ${styles.kpiBadgeUrgent}`}>
                {kpiData.openDisputes.urgent} {t('supplierPortal.dashboard.urgent')}
              </span>
            )}
          </div>
          <div className={styles.kpiSub}>
            {t('supplierPortal.disputes.awaitingResponse')}
          </div>
        </div>

        {/* Available SCF Credit */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconRow}>
            <div className={`${styles.kpiIconBubble} ${styles.kpiIconPurple}`}>&#9733;</div>
          </div>
          <div className={styles.kpiLabel}>
            {t('supplierPortal.dashboard.availableSCFCredit')}
          </div>
          <div className={styles.kpiValue} style={{ color: '#722ED1' }}>
            {formatCurrency(kpiData.scfCredit.available)}
          </div>
          <div className={styles.kpiSub}>
            {t('supplierPortal.dashboard.scfProgram')}
          </div>
        </div>
      </div>

      {/* ── Two Column: Activity + Quick Actions ── */}
      <div className={styles.contentGrid}>
        {/* Recent Invoice Activity */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {t('supplierPortal.dashboard.recentActivity')}
            </h2>
            <button
              className={styles.sectionAction}
              onClick={() => router.push('/supplier-portal/invoices')}
            >
              {t('supplierPortal.dashboard.viewAll')}
            </button>
          </div>
          <div className={styles.sectionBody}>
            {recentActivity.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>&#128203;</div>
                <div className={styles.emptyTitle}>
                  {t('supplierPortal.dashboard.noRecentActivity')}
                </div>
              </div>
            ) : (
              <ul className={styles.activityList}>
                {recentActivity.map((event) => (
                  <li key={event.id} className={styles.activityItem}>
                    <span
                      className={`${styles.activityDot} ${dotColorMap[event.color] || styles.dotBlue}`}
                      aria-hidden="true"
                    />
                    <div className={styles.activityContent}>
                      <div className={styles.activityText}>{event.text}</div>
                      <div className={styles.activityTime}>{event.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
                {t('supplierPortal.dashboard.submitNewInvoice')}
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
              onClick={() => router.push('/supplier-portal/disputes')}
            >
              <span className={`${styles.quickActionIcon} ${styles.quickActionIconOrange}`}>
                &#9888;
              </span>
              <span className={styles.quickActionLabel}>
                {t('supplierPortal.dashboard.createDispute')}
              </span>
            </button>
            <button
              className={styles.quickAction}
              onClick={() => router.push('/supplier-portal/profile')}
            >
              <span className={`${styles.quickActionIcon} ${styles.quickActionIconPurple}`}>
                &#128100;
              </span>
              <span className={styles.quickActionLabel}>
                {t('supplierPortal.dashboard.updateProfile')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Upcoming Payments Timeline ── */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {t('supplierPortal.dashboard.upcomingPayments')}
          </h2>
          <button
            className={styles.sectionAction}
            onClick={() => router.push('/supplier-portal/payments')}
          >
            {t('supplierPortal.dashboard.viewAll')}
          </button>
        </div>
        <div className={styles.sectionBody}>
          {upcomingPayments.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>&#128176;</div>
              <div className={styles.emptyTitle}>
                {t('supplierPortal.dashboard.noUpcomingPayments')}
              </div>
            </div>
          ) : (
            <table className={styles.upcomingTable}>
              <thead>
                <tr>
                  <th>{t('supplierPortal.dashboard.invoiceNumber')}</th>
                  <th>{t('supplierPortal.dashboard.amount')}</th>
                  <th>{t('supplierPortal.dashboard.expectedDate')}</th>
                  <th>{t('supplierPortal.dashboard.method')}</th>
                </tr>
              </thead>
              <tbody>
                {upcomingPayments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className={styles.invoiceRef}>{p.invoiceNumber}</span>
                    </td>
                    <td>
                      <span className={styles.amountCell}>{formatCurrency(p.amount)}</span>
                    </td>
                    <td>{p.expectedDate}</td>
                    <td>
                      <span className={styles.methodBadge}>{p.method}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
