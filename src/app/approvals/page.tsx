'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/lib/i18n/locale-context';
import styles from './approvals.module.css';

type Priority = 'urgent' | 'high' | 'normal';
type AIRec = 'approve' | 'reject' | 'review';

interface ApprovalItem {
  id: string;
  invoiceNumber: string;
  supplier: string;
  amount: number;
  requestDate: string;
  dueDate: string;
  daysWaiting: number;
  priority: Priority;
  currentStep: number;
  totalSteps: number;
  aiRecommendation: AIRec;
  aiConfidence: number;
  department: string;
  requester: string;
}

const mockApprovals: ApprovalItem[] = [
  { id: 'APR-001', invoiceNumber: 'INV-2024-1847', supplier: 'Acme Corp', amount: 45250.00, requestDate: '2025-01-27', dueDate: '2025-02-10', daysWaiting: 3, priority: 'urgent', currentStep: 2, totalSteps: 3, aiRecommendation: 'approve', aiConfidence: 94, department: 'Engineering', requester: 'Sarah Chen' },
  { id: 'APR-002', invoiceNumber: 'INV-2024-1848', supplier: 'Global Logistics Ltd', amount: 128750.00, requestDate: '2025-01-26', dueDate: '2025-02-15', daysWaiting: 4, priority: 'high', currentStep: 1, totalSteps: 3, aiRecommendation: 'review', aiConfidence: 67, department: 'Operations', requester: 'Mike Johnson' },
  { id: 'APR-003', invoiceNumber: 'INV-2024-1849', supplier: 'TechParts Inc', amount: 8920.00, requestDate: '2025-01-28', dueDate: '2025-02-20', daysWaiting: 2, priority: 'normal', currentStep: 2, totalSteps: 2, aiRecommendation: 'approve', aiConfidence: 98, department: 'IT', requester: 'Lisa Park' },
  { id: 'APR-004', invoiceNumber: 'INV-2024-1850', supplier: 'Office Supplies Co', amount: 2340.00, requestDate: '2025-01-25', dueDate: '2025-02-08', daysWaiting: 5, priority: 'normal', currentStep: 1, totalSteps: 2, aiRecommendation: 'approve', aiConfidence: 99, department: 'Admin', requester: 'Tom Wilson' },
  { id: 'APR-005', invoiceNumber: 'INV-2024-1851', supplier: 'CloudServe Systems', amount: 67500.00, requestDate: '2025-01-24', dueDate: '2025-02-07', daysWaiting: 6, priority: 'urgent', currentStep: 3, totalSteps: 3, aiRecommendation: 'approve', aiConfidence: 91, department: 'Engineering', requester: 'David Kim' },
  { id: 'APR-006', invoiceNumber: 'INV-2024-1852', supplier: 'Precision Manufacturing', amount: 234100.00, requestDate: '2025-01-23', dueDate: '2025-02-06', daysWaiting: 7, priority: 'urgent', currentStep: 2, totalSteps: 3, aiRecommendation: 'reject', aiConfidence: 82, department: 'Production', requester: 'Anna Roberts' },
  { id: 'APR-007', invoiceNumber: 'INV-2024-1853', supplier: 'DataFlow Analytics', amount: 15800.00, requestDate: '2025-01-27', dueDate: '2025-02-18', daysWaiting: 3, priority: 'normal', currentStep: 1, totalSteps: 2, aiRecommendation: 'approve', aiConfidence: 96, department: 'Marketing', requester: 'James Lee' },
  { id: 'APR-008', invoiceNumber: 'INV-2024-1854', supplier: 'SecureNet Solutions', amount: 42000.00, requestDate: '2025-01-26', dueDate: '2025-02-12', daysWaiting: 4, priority: 'high', currentStep: 2, totalSteps: 3, aiRecommendation: 'approve', aiConfidence: 88, department: 'IT Security', requester: 'Rachel Adams' },
  { id: 'APR-009', invoiceNumber: 'INV-2024-1855', supplier: 'Green Energy Corp', amount: 89200.00, requestDate: '2025-01-22', dueDate: '2025-02-05', daysWaiting: 8, priority: 'high', currentStep: 1, totalSteps: 3, aiRecommendation: 'review', aiConfidence: 54, department: 'Facilities', requester: 'Mark Thompson' },
  { id: 'APR-010', invoiceNumber: 'INV-2024-1856', supplier: 'Swift Couriers', amount: 4750.00, requestDate: '2025-01-28', dueDate: '2025-02-25', daysWaiting: 2, priority: 'normal', currentStep: 1, totalSteps: 2, aiRecommendation: 'approve', aiConfidence: 97, department: 'Logistics', requester: 'Emily Watson' },
  { id: 'APR-011', invoiceNumber: 'INV-2024-1857', supplier: 'MediaBuy Agency', amount: 175000.00, requestDate: '2025-01-21', dueDate: '2025-02-04', daysWaiting: 9, priority: 'urgent', currentStep: 2, totalSteps: 3, aiRecommendation: 'review', aiConfidence: 61, department: 'Marketing', requester: 'Chris Brown' },
  { id: 'APR-012', invoiceNumber: 'INV-2024-1858', supplier: 'BuildRight Construction', amount: 356000.00, requestDate: '2025-01-20', dueDate: '2025-02-03', daysWaiting: 10, priority: 'high', currentStep: 3, totalSteps: 3, aiRecommendation: 'reject', aiConfidence: 78, department: 'Facilities', requester: 'Steve Garcia' },
  { id: 'APR-013', invoiceNumber: 'INV-2024-1859', supplier: 'Talent Solutions HR', amount: 28500.00, requestDate: '2025-01-27', dueDate: '2025-02-17', daysWaiting: 3, priority: 'normal', currentStep: 1, totalSteps: 2, aiRecommendation: 'approve', aiConfidence: 93, department: 'HR', requester: 'Patricia Moore' },
  { id: 'APR-014', invoiceNumber: 'INV-2024-1860', supplier: 'LegalEase Partners', amount: 52000.00, requestDate: '2025-01-25', dueDate: '2025-02-14', daysWaiting: 5, priority: 'high', currentStep: 2, totalSteps: 2, aiRecommendation: 'approve', aiConfidence: 85, department: 'Legal', requester: 'Robert Taylor' },
  { id: 'APR-015', invoiceNumber: 'INV-2024-1861', supplier: 'FleetMaster Auto', amount: 19800.00, requestDate: '2025-01-26', dueDate: '2025-02-16', daysWaiting: 4, priority: 'normal', currentStep: 1, totalSteps: 2, aiRecommendation: 'approve', aiConfidence: 95, department: 'Operations', requester: 'Nancy Clark' },
  { id: 'APR-016', invoiceNumber: 'INV-2024-1862', supplier: 'Quantum Research Labs', amount: 445000.00, requestDate: '2025-01-19', dueDate: '2025-02-02', daysWaiting: 11, priority: 'urgent', currentStep: 2, totalSteps: 3, aiRecommendation: 'review', aiConfidence: 58, department: 'R&D', requester: 'Kevin Wright' },
];

export default function ApprovalsPage() {
  const t = useT();
  const tabs = [
    { key: 'My Approvals', label: t('approvals.myApprovals') },
    { key: 'All Pending', label: t('approvals.allPending') },
    { key: 'Escalated', label: t('approvals.escalated') },
    { key: 'Completed', label: t('common.completed') },
  ];
  const priorities = [
    { key: 'All', label: t('common.all') },
    { key: 'Urgent', label: t('approvals.urgent') },
    { key: 'High', label: t('approvals.high') },
    { key: 'Normal', label: t('approvals.normal') },
  ];
  const [activeTab, setActiveTab] = useState('My Approvals');
  const [activePriority, setActivePriority] = useState('All');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = mockApprovals.filter((a) => {
    if (activePriority !== 'All' && a.priority !== activePriority.toLowerCase()) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((a) => a.id)));
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const getPriorityClass = (p: Priority) => {
    if (p === 'urgent') return `${styles.priorityBadge} ${styles.priorityUrgent}`;
    if (p === 'high') return `${styles.priorityBadge} ${styles.priorityHigh}`;
    return `${styles.priorityBadge} ${styles.priorityNormal}`;
  };

  const getAiClass = (r: AIRec) => {
    if (r === 'approve') return styles.aiApprove;
    if (r === 'reject') return styles.aiReject;
    return styles.aiReview;
  };

  const getAiLabel = (r: AIRec) => {
    if (r === 'approve') return t('common.approve');
    if (r === 'reject') return t('common.reject');
    return t('approvals.needsReview');
  };

  const getDaysClass = (d: number) => {
    if (d >= 7) return styles.daysCritical;
    if (d >= 4) return styles.daysWarning;
    return styles.daysNormal;
  };

  const renderStepDots = (current: number, total: number) => {
    const dots = [];
    for (let i = 1; i <= total; i++) {
      dots.push(
        <span key={i} className={i <= current ? styles.stepDot : styles.stepDotPending} />
      );
    }
    return dots;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('approvals.title')}</h1>
        <p className={styles.subtitle}>{t('approvals.subtitle')}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('approvals.pending')}</div>
          <div className={`${styles.statValue} ${styles.pending}`}>23</div>
          <div className={styles.statChange}>{t('approvals.sinceYesterday', { count: 5 })}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('approvals.approvedToday')}</div>
          <div className={`${styles.statValue} ${styles.approved}`}>67</div>
          <div className={styles.statChange}>{t('approvals.autoApprovedByAI', { pct: 92 })}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('approvals.rejected')}</div>
          <div className={`${styles.statValue} ${styles.rejected}`}>4</div>
          <div className={styles.statChange}>{t('approvals.flaggedByAI', { count: 2 })}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('approvals.avgApprovalTime')}</div>
          <div className={`${styles.statValue} ${styles.timeColor}`}>2.3h</div>
          <div className={styles.statChange}>{t('approvals.downFromLastMonth', { time: '4.1h' })}</div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.controlsRight}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>{t('approvals.priority')}</span>
            {priorities.map((p) => (
              <button
                key={p.key}
                className={activePriority === p.key ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => setActivePriority(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected.size > 0 && (
        <div className={styles.bulkActions}>
          <button className={styles.bulkApprove}>{t('approvals.approveSelected')}</button>
          <button className={styles.bulkReject}>{t('approvals.rejectSelected')}</button>
          <span className={styles.selectedCount}>{selected.size} item{selected.size !== 1 ? 's' : ''} selected</span>
        </div>
      )}

      <div className={styles.cardList}>
        {filtered.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.cardCheckbox}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={selected.has(item.id)}
                onChange={() => toggleSelect(item.id)}
              />
            </div>

            <div className={styles.cardBody}>
              <div className={styles.cardTopRow}>
                <Link href={`/approvals/${item.id}`} className={styles.invoiceNumber}>
                  {item.invoiceNumber}
                </Link>
                <span className={styles.separator}>|</span>
                <span className={styles.supplier}>{item.supplier}</span>
                <span className={styles.amount}>{formatCurrency(item.amount)}</span>
                <span className={getPriorityClass(item.priority)}>{item.priority}</span>
              </div>

              <div className={styles.cardMeta}>
                <span className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('approvals.requested')}</span>{item.requestDate}
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('approvals.due')}</span>{item.dueDate}
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('approvals.waiting')}</span>
                  <span className={getDaysClass(item.daysWaiting)}>{item.daysWaiting}d</span>
                </span>
                <span className={styles.stepProgress}>
                  {renderStepDots(item.currentStep, item.totalSteps)}
                  <span>{t('approvals.step', { current: item.currentStep, total: item.totalSteps })}</span>
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('approvals.dept')}</span>{item.department}
                </span>
              </div>

              <div className={styles.aiRow}>
                <span className={styles.aiLabel}>{t('approvals.aiRecommendation')}</span>
                <span className={getAiClass(item.aiRecommendation)}>
                  {getAiLabel(item.aiRecommendation)}
                </span>
                <span className={styles.confidence}>{t('approvals.confidence', { pct: item.aiConfidence })}</span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button className={styles.approveBtn}>{t('common.approve')}</button>
              <button className={styles.rejectBtn}>{t('common.reject')}</button>
              <Link href={`/approvals/${item.id}`} className={styles.detailLink}>
                {t('approvals.viewDetails')}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
