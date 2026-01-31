'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './activity.module.css';

type ActivityType = 'invoice' | 'approval' | 'payment' | 'system';
type BadgeType = 'ai' | 'manual' | 'alert' | 'success';

interface ActivityItem {
  id: number;
  type: ActivityType;
  description: string;
  highlight?: string;
  amount?: string;
  actor: string;
  timestamp: string;
  relatedEntity?: string;
  relatedLink?: string;
  badge?: BadgeType;
  badgeLabel?: string;
}

const mockActivities: ActivityItem[] = [
  { id: 1, type: 'invoice', description: 'Invoice auto-captured from', highlight: 'Acme Corp', amount: '$45,250.00', actor: 'Medius AI', timestamp: '2 min ago', relatedEntity: 'INV-2024-1847', relatedLink: '/approvals/APR-001', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 2, type: 'approval', description: 'Approved invoice from', highlight: 'TechParts Inc', amount: '$8,920.00', actor: 'Lisa Park', timestamp: '5 min ago', relatedEntity: 'INV-2024-1849', relatedLink: '/approvals/APR-003', badge: 'manual', badgeLabel: 'Manual' },
  { id: 3, type: 'payment', description: 'Payment scheduled for', highlight: 'Office Supplies Co', amount: '$2,340.00', actor: 'Medius AI', timestamp: '8 min ago', relatedEntity: 'PAY-2024-3201', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 4, type: 'system', description: 'Anomaly detected: duplicate invoice pattern from', highlight: 'Precision Manufacturing', actor: 'Medius AI', timestamp: '12 min ago', relatedEntity: 'INV-2024-1852', relatedLink: '/approvals/APR-006', badge: 'alert', badgeLabel: 'Exception' },
  { id: 5, type: 'invoice', description: '3-way match completed for', highlight: 'CloudServe Systems', amount: '$67,500.00', actor: 'Medius AI', timestamp: '15 min ago', relatedEntity: 'INV-2024-1851', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 6, type: 'approval', description: 'Escalated to VP Operations:', highlight: 'MediaBuy Agency', amount: '$175,000.00', actor: 'System', timestamp: '18 min ago', relatedEntity: 'APR-011', relatedLink: '/approvals/APR-011', badge: 'alert', badgeLabel: 'Escalated' },
  { id: 7, type: 'payment', description: 'Payment batch executed - 23 invoices totaling', amount: '$487,320.00', actor: 'Medius AI', timestamp: '22 min ago', relatedEntity: 'BATCH-2024-089', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 8, type: 'invoice', description: 'GL coding auto-assigned for', highlight: 'DataFlow Analytics', amount: '$15,800.00', actor: 'Medius AI', timestamp: '25 min ago', relatedEntity: 'INV-2024-1853', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 9, type: 'approval', description: 'Rejected invoice from', highlight: 'BuildRight Construction', amount: '$356,000.00', actor: 'Steve Garcia', timestamp: '28 min ago', relatedEntity: 'INV-2024-1858', relatedLink: '/approvals/APR-012', badge: 'manual', badgeLabel: 'Manual' },
  { id: 10, type: 'system', description: 'Vendor risk score updated for', highlight: 'Green Energy Corp', actor: 'Medius AI', timestamp: '32 min ago', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 11, type: 'invoice', description: 'PO matching completed for', highlight: 'SecureNet Solutions', amount: '$42,000.00', actor: 'Medius AI', timestamp: '35 min ago', relatedEntity: 'INV-2024-1854', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 12, type: 'payment', description: 'Early payment discount captured from', highlight: 'Swift Couriers', amount: '$142.50 saved', actor: 'Medius AI', timestamp: '38 min ago', badge: 'success', badgeLabel: 'Savings' },
  { id: 13, type: 'approval', description: 'Auto-approved low-risk invoice from', highlight: 'Talent Solutions HR', amount: '$28,500.00', actor: 'Medius AI', timestamp: '41 min ago', relatedEntity: 'INV-2024-1859', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 14, type: 'system', description: 'Cash flow forecast updated - 30 day projection adjusted', actor: 'Medius AI', timestamp: '45 min ago', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 15, type: 'invoice', description: 'Tax validation completed for', highlight: 'LegalEase Partners', amount: '$52,000.00', actor: 'Medius AI', timestamp: '48 min ago', relatedEntity: 'INV-2024-1860', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 16, type: 'approval', description: 'Approval delegated from Robert Taylor to', highlight: 'Anna Martinez', actor: 'Robert Taylor', timestamp: '52 min ago', relatedEntity: 'APR-014', badge: 'manual', badgeLabel: 'Manual' },
  { id: 17, type: 'payment', description: 'Payment terms optimized for', highlight: 'FleetMaster Auto', amount: '$19,800.00', actor: 'Medius AI', timestamp: '55 min ago', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 18, type: 'system', description: 'Compliance check flagged: missing W-9 for', highlight: 'Quantum Research Labs', actor: 'Medius AI', timestamp: '1h ago', relatedEntity: 'INV-2024-1862', badge: 'alert', badgeLabel: 'Exception' },
  { id: 19, type: 'invoice', description: 'Invoice received via EDI from', highlight: 'Global Logistics Ltd', amount: '$128,750.00', actor: 'System', timestamp: '1h ago', relatedEntity: 'INV-2024-1848', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 20, type: 'approval', description: 'Bulk approved 5 invoices under $5,000', actor: 'Nancy Clark', timestamp: '1h ago', badge: 'manual', badgeLabel: 'Manual' },
  { id: 21, type: 'payment', description: 'Wire transfer confirmed for', highlight: 'Acme Corp', amount: '$38,500.00', actor: 'Bank API', timestamp: '1.5h ago', relatedEntity: 'PAY-2024-3198', badge: 'success', badgeLabel: 'Confirmed' },
  { id: 22, type: 'system', description: 'AI model retrained on latest invoice patterns - accuracy improved to 97.3%', actor: 'Medius AI', timestamp: '1.5h ago', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 23, type: 'invoice', description: 'Currency conversion applied for', highlight: 'Euro Tech GmbH', amount: 'EUR 34,200 -> $37,180.00', actor: 'Medius AI', timestamp: '2h ago', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 24, type: 'approval', description: 'Requested additional information for', highlight: 'BuildRight Construction', actor: 'Jennifer Wu', timestamp: '2h ago', relatedEntity: 'APR-012', relatedLink: '/approvals/APR-012', badge: 'manual', badgeLabel: 'Manual' },
  { id: 25, type: 'payment', description: 'Payment hold placed on', highlight: 'Precision Manufacturing', amount: '$234,100.00', actor: 'Michael Torres', timestamp: '2h ago', badge: 'alert', badgeLabel: 'Hold' },
  { id: 26, type: 'system', description: 'Monthly reconciliation completed - 99.2% match rate', actor: 'Medius AI', timestamp: '2.5h ago', badge: 'success', badgeLabel: 'Complete' },
  { id: 27, type: 'invoice', description: 'Duplicate invoice detected and blocked from', highlight: 'Office Supplies Co', amount: '$2,340.00', actor: 'Medius AI', timestamp: '3h ago', badge: 'alert', badgeLabel: 'Exception' },
  { id: 28, type: 'approval', description: 'Timeout escalation triggered for', highlight: 'Green Energy Corp', amount: '$89,200.00', actor: 'System', timestamp: '3h ago', relatedEntity: 'APR-009', badge: 'alert', badgeLabel: 'Escalated' },
  { id: 29, type: 'payment', description: 'ACH batch submitted - 47 payments totaling', amount: '$923,450.00', actor: 'Medius AI', timestamp: '3.5h ago', relatedEntity: 'BATCH-2024-088', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 30, type: 'system', description: 'Supplier portal credentials updated for', highlight: 'DataFlow Analytics', actor: 'System', timestamp: '4h ago', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 31, type: 'invoice', description: 'Smart categorization applied to 12 new invoices', actor: 'Medius AI', timestamp: '4h ago', badge: 'ai', badgeLabel: 'AI Auto' },
  { id: 32, type: 'approval', description: 'SLA warning: approval pending >48h for', highlight: 'Quantum Research Labs', amount: '$445,000.00', actor: 'System', timestamp: '4.5h ago', relatedEntity: 'APR-016', badge: 'alert', badgeLabel: 'SLA Warning' },
];

const filterOptions = ['All', 'Invoices', 'Approvals', 'Payments', 'System'];

const filterMap: Record<string, ActivityType | null> = {
  All: null,
  Invoices: 'invoice',
  Approvals: 'approval',
  Payments: 'payment',
  System: 'system',
};

export default function ActivityPage() {
  const t = useT();
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? mockActivities
    : mockActivities.filter((a) => a.type === filterMap[activeFilter]);

  const getIconClass = (type: ActivityType) => {
    const map: Record<ActivityType, string> = {
      invoice: styles.iconInvoice,
      approval: styles.iconApproval,
      payment: styles.iconPayment,
      system: styles.iconSystem,
    };
    return map[type];
  };

  const getIconSymbol = (type: ActivityType) => {
    const map: Record<ActivityType, string> = {
      invoice: '\u2709',
      approval: '\u2713',
      payment: '$',
      system: '\u2699',
    };
    return map[type];
  };

  const getBadgeClass = (badge: BadgeType) => {
    const map: Record<BadgeType, string> = {
      ai: styles.badgeAI,
      manual: styles.badgeManual,
      alert: styles.badgeAlert,
      success: styles.badgeSuccess,
    };
    return map[badge];
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('activity.title')}</h1>
        <p className={styles.subtitle}>{t('activity.subtitle')}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Today&#39;s Actions</div>
          <div className={`${styles.statValue} ${styles.statTotal}`}>347</div>
          <div className={styles.statChange}>+12% vs yesterday</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>AI Actions</div>
          <div className={`${styles.statValue} ${styles.statAI}`}>289</div>
          <div className={styles.statChange}>83% of total actions</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Human Actions</div>
          <div className={`${styles.statValue} ${styles.statHuman}`}>58</div>
          <div className={styles.statChange}>17% of total actions</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Exceptions</div>
          <div className={`${styles.statValue} ${styles.statExceptions}`}>12</div>
          <div className={styles.statChange}>3 require attention</div>
        </div>
      </div>

      <div className={styles.filters}>
        {filterOptions.map((f) => {
          const filterLabels: Record<string, string> = {
            All: t('activity.allActivity'),
            Invoices: t('activity.invoiceActivity'),
            Approvals: t('activity.approvalActivity'),
            Payments: t('activity.paymentActivity'),
            System: t('activity.systemActivity'),
          };
          return (
            <button
              key={f}
              className={activeFilter === f ? styles.filterBtnActive : styles.filterBtn}
              onClick={() => setActiveFilter(f)}
            >
              {filterLabels[f] || f}
            </button>
          );
        })}
      </div>

      <div className={styles.feedList}>
        {filtered.map((item, idx) => (
          <div key={item.id} className={styles.feedItem}>
            <div className={styles.iconCol}>
              <div className={`${styles.icon} ${getIconClass(item.type)}`}>
                {getIconSymbol(item.type)}
              </div>
              {idx < filtered.length - 1 && <div className={styles.connector} />}
            </div>

            <div className={styles.feedContent}>
              <div className={styles.feedDescription}>
                {item.description}
                {item.highlight && <>{' '}<span className={styles.feedHighlight}>{item.highlight}</span></>}
                {item.amount && <>{' '}<span className={styles.feedAmount}>{item.amount}</span></>}
              </div>
              <div className={styles.feedMeta}>
                <span className={styles.feedActor}>{item.actor}</span>
                <span className={styles.feedTime}>{item.timestamp}</span>
                {item.relatedEntity && (
                  <span className={styles.feedLink}>
                    {item.relatedEntity}
                  </span>
                )}
                {item.badge && item.badgeLabel && (
                  <span className={`${styles.feedBadge} ${getBadgeClass(item.badge)}`}>
                    {item.badgeLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.loadMore}>
        <button className={styles.loadMoreBtn}>Load More Activity</button>
      </div>
    </div>
  );
}
