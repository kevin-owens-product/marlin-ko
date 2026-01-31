'use client';

import { useT } from '@/lib/i18n/locale-context';
import styles from './dashboard.module.css';

const kpis: { icon: string; labelKey: string; value: string; change: string; direction: 'up' | 'down' | 'neutral' }[] = [
  { icon: '\u2699', labelKey: 'dashboard.touchlessRate', value: '94.9%', change: '\u21912.3%', direction: 'up' },
  { icon: '\uD83D\uDCC4', labelKey: 'dashboard.invoicesToday', value: '847', change: '+12% vs avg', direction: 'up' },
  { icon: '\u23F3', labelKey: 'dashboard.pendingApprovals', value: '23', change: '5 urgent', direction: 'neutral' },
  { icon: '\uD83D\uDCB0', labelKey: 'dashboard.cashPosition', value: '$12.8M', change: '\u21910.4M', direction: 'up' },
  { icon: '\uD83C\uDFF7\uFE0F', labelKey: 'dashboard.discountsCaptured', value: '$156K', change: '\u219118K MTD', direction: 'up' },
  { icon: '\uD83E\uDD16', labelKey: 'dashboard.aiConfidence', value: '96.2%', change: '\u21910.8%', direction: 'up' },
];

const pipelineStages: { nameKey: string; count: number; color: string }[] = [
  { nameKey: 'dashboard.captured', count: 124, color: '#165DFF' },
  { nameKey: 'dashboard.classified', count: 118, color: '#8E51DA' },
  { nameKey: 'dashboard.compliance', count: 115, color: '#14C9C9' },
  { nameKey: 'dashboard.matched', count: 108, color: '#FF9A2E' },
  { nameKey: 'dashboard.riskCheck', count: 108, color: '#F76560' },
  { nameKey: 'dashboard.approved', count: 103, color: '#23C343' },
  { nameKey: 'dashboard.payment', count: 98, color: '#33D1C9' },
];

const recentActivity = [
  { text: 'Invoice #INV-9847 auto-matched to PO-2241 (Acme Corp)', time: '2 min ago', color: '#23C343' },
  { text: 'Compliance check passed for batch FR-2026-041 (23 invoices)', time: '5 min ago', color: '#23C343' },
  { text: 'Risk Agent flagged duplicate: INV-9843 vs INV-9801', time: '8 min ago', color: '#FF9A2E' },
  { text: 'Payment batch PB-447 submitted ($234,500 - 18 invoices)', time: '12 min ago', color: '#165DFF' },
  { text: 'Early payment discount captured: $4,200 (Vendor: TechParts Ltd)', time: '15 min ago', color: '#23C343' },
  { text: 'GL coding auto-assigned for 12 invoices (Confidence: 98.1%)', time: '18 min ago', color: '#23C343' },
  { text: 'Approval escalated: INV-9839 exceeds $50K threshold', time: '22 min ago', color: '#FF9A2E' },
  { text: 'New vendor registered: Nordic Supply AB (Sweden)', time: '28 min ago', color: '#165DFF' },
  { text: 'Compliance alert: Belgium B2B mandate format update detected', time: '35 min ago', color: '#F76560' },
  { text: 'Monthly accrual report generated and distributed', time: '42 min ago', color: '#165DFF' },
];

const agents: { name: string; status: 'active' | 'idle' | 'error'; tasks: number; accuracy: number; time: string; health: number }[] = [
  { name: 'Capture Agent', status: 'active', tasks: 142, accuracy: 99.1, time: '1.2s', health: 98 },
  { name: 'Classification Agent', status: 'active', tasks: 138, accuracy: 97.8, time: '0.8s', health: 96 },
  { name: 'Compliance Agent', status: 'active', tasks: 115, accuracy: 99.7, time: '2.1s', health: 99 },
  { name: 'Matching Agent', status: 'active', tasks: 108, accuracy: 96.3, time: '1.5s', health: 94 },
  { name: 'Risk Agent', status: 'active', tasks: 108, accuracy: 98.2, time: '0.9s', health: 97 },
  { name: 'Payment Agent', status: 'idle', tasks: 47, accuracy: 99.9, time: '3.2s', health: 100 },
  { name: 'Coding Agent', status: 'active', tasks: 134, accuracy: 98.1, time: '0.6s', health: 95 },
];

const quickActions: { icon: string; labelKey: string; badge: string | null }[] = [
  { icon: '\u2705', labelKey: 'dashboard.reviewApprovals', badge: '23' },
  { icon: '\u26A0\uFE0F', labelKey: 'dashboard.processExceptions', badge: '7' },
  { icon: '\uD83D\uDEA8', labelKey: 'dashboard.riskAlerts', badge: '3' },
  { icon: '\uD83D\uDCB3', labelKey: 'dashboard.createPayment', badge: null },
  { icon: '\uD83D\uDCC1', labelKey: 'dashboard.uploadInvoice', badge: null },
  { icon: '\uD83D\uDCCA', labelKey: 'dashboard.generateReport', badge: null },
];

const upcomingPayments: { name: string; detail: string; urgency: 'urgent' | 'soon' | 'normal' }[] = [
  { name: 'Acme Corp - PO #2241', detail: 'Tomorrow', urgency: 'urgent' },
  { name: 'Global Logistics Batch', detail: 'Wed, Feb 1', urgency: 'soon' },
  { name: 'TechParts Ltd (discount)', detail: 'Thu, Feb 2', urgency: 'soon' },
  { name: 'Office Supplies Co', detail: 'Fri, Feb 3', urgency: 'normal' },
];

const expiringContracts: { name: string; detail: string; urgency: 'urgent' | 'soon' | 'normal' }[] = [
  { name: 'Nordic Supply AB', detail: 'Feb 15', urgency: 'soon' },
  { name: 'FastShip International', detail: 'Feb 28', urgency: 'normal' },
  { name: 'CloudHost Services', detail: 'Mar 1', urgency: 'normal' },
];

const complianceDeadlines: { name: string; detail: string; urgency: 'urgent' | 'soon' | 'normal' }[] = [
  { name: 'Belgium B2B Mandate', detail: 'Jan 2026', urgency: 'urgent' },
  { name: 'KSeF Certification Renewal', detail: 'Mar 2026', urgency: 'soon' },
  { name: 'France PPF Registration', detail: 'Jun 2026', urgency: 'normal' },
];

export default function Home() {
  const t = useT();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.greeting}>{t('dashboard.greeting', { name: 'Sarah' })}</h1>
            <p className={styles.subtitle}>{t('dashboard.subtitle')}</p>
          </div>
          <div className={styles.headerDate}>
            <div className={styles.headerDateDay}>{timeStr}</div>
            <div>{dateStr}</div>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <div key={kpi.labelKey} className={styles.kpiCard}>
            <span className={styles.kpiIcon}>{kpi.icon}</span>
            <div className={styles.kpiLabel}>{t(kpi.labelKey)}</div>
            <div className={styles.kpiValueRow}>
              <span className={styles.kpiValue}>{kpi.value}</span>
              <span className={`${styles.kpiChange} ${
                kpi.direction === 'up' ? styles.kpiChangeUp :
                kpi.direction === 'down' ? styles.kpiChangeDown :
                styles.kpiChangeNeutral
              }`}>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Processing Pipeline */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          {t('dashboard.processingPipeline')}
          <span className={styles.sectionTitleBadge}>{t('common.live')}</span>
        </div>
        <div className={styles.pipeline}>
          {pipelineStages.map((stage, i) => (
            <div key={stage.nameKey} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div className={styles.pipelineStage}>
                <div className={styles.pipelineBlock} style={{ backgroundColor: `${stage.color}20` }}>
                  <div className={styles.pipelineName}>{t(stage.nameKey)}</div>
                  <div className={styles.pipelineCount} style={{ color: stage.color }}>{stage.count}</div>
                </div>
                <div className={styles.pipelineBar} style={{ backgroundColor: stage.color }} />
              </div>
              {i < pipelineStages.length - 1 && (
                <span className={styles.pipelineArrow}>{'\u2192'}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Activity + Agent Performance */}
      <div className={styles.mainGrid}>
        {/* Recent Activity */}
        <div className={styles.section} style={{ marginBottom: 0 }}>
          <div className={styles.sectionTitle}>
            {t('dashboard.recentActivity')}
            <span className={styles.sectionTitleBadge}>{t('common.events', { count: recentActivity.length })}</span>
          </div>
          <div className={styles.activityList}>
            {recentActivity.map((item, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityDot} style={{ backgroundColor: item.color }} />
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>{item.text}</div>
                  <div className={styles.activityTime}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Performance */}
        <div className={styles.section} style={{ marginBottom: 0 }}>
          <div className={styles.sectionTitle}>
            {t('dashboard.agentPerformance')}
            <span className={styles.sectionTitleBadge}>{t('dashboard.activeOf', { active: agents.filter(a => a.status === 'active').length, total: agents.length })}</span>
          </div>
          <div className={styles.agentPerfGrid}>
            {agents.map((agent) => (
              <div key={agent.name} className={styles.agentPerfRow}>
                <div className={styles.agentPerfName}>
                  <div className={`${styles.agentStatusDot} ${agent.status === 'active' ? styles.agentStatusDotActive : styles.agentStatusDotIdle}`} />
                  <span className={styles.agentPerfNameText}>{agent.name}</span>
                </div>
                <div className={styles.agentPerfStat}>
                  <span className={styles.agentPerfStatValue}>{agent.tasks}</span>
                  <span className={styles.agentPerfStatLabel}>{t('dashboard.tasks')}</span>
                </div>
                <div className={styles.agentPerfStat}>
                  <span className={styles.agentPerfStatValue}>{agent.accuracy}%</span>
                  <span className={styles.agentPerfStatLabel}>{t('dashboard.accuracy')}</span>
                </div>
                <div className={styles.agentPerfStat}>
                  <span className={styles.agentPerfStatValue}>{agent.time}</span>
                  <span className={styles.agentPerfStatLabel}>{t('dashboard.avgTime')}</span>
                </div>
                <div>
                  <div className={styles.healthBar}>
                    <div
                      className={styles.healthBarFill}
                      style={{
                        width: `${agent.health}%`,
                        backgroundColor: agent.health >= 97 ? '#23C343' : agent.health >= 90 ? '#FF9A2E' : '#F76560',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('dashboard.quickActions')}</div>
        <div className={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <div key={action.labelKey} className={styles.quickAction}>
              <div className={styles.quickActionIcon}>{action.icon}</div>
              <div className={styles.quickActionLabel}>
                {t(action.labelKey)}
                {action.badge && <span className={styles.quickActionBadge}>{action.badge}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('dashboard.upcoming')}</div>
        <div className={styles.upcomingGrid}>
          <div className={styles.upcomingGroup}>
            <div className={styles.upcomingGroupTitle}>
              {t('dashboard.paymentsDueThisWeek')}
            </div>
            {upcomingPayments.map((item, i) => (
              <div key={i} className={styles.upcomingItem}>
                <span className={styles.upcomingItemName}>{item.name}</span>
                <span className={`${styles.upcomingItemDetail} ${
                  item.urgency === 'urgent' ? styles.upcomingItemUrgent :
                  item.urgency === 'soon' ? styles.upcomingItemSoon : ''
                }`}>{item.detail}</span>
              </div>
            ))}
          </div>
          <div className={styles.upcomingGroup}>
            <div className={styles.upcomingGroupTitle}>
              {t('dashboard.expiringContracts')}
            </div>
            {expiringContracts.map((item, i) => (
              <div key={i} className={styles.upcomingItem}>
                <span className={styles.upcomingItemName}>{item.name}</span>
                <span className={`${styles.upcomingItemDetail} ${
                  item.urgency === 'urgent' ? styles.upcomingItemUrgent :
                  item.urgency === 'soon' ? styles.upcomingItemSoon : ''
                }`}>{item.detail}</span>
              </div>
            ))}
          </div>
          <div className={styles.upcomingGroup}>
            <div className={styles.upcomingGroupTitle}>
              {t('dashboard.complianceDeadlines')}
            </div>
            {complianceDeadlines.map((item, i) => (
              <div key={i} className={styles.upcomingItem}>
                <span className={styles.upcomingItemName}>{item.name}</span>
                <span className={`${styles.upcomingItemDetail} ${
                  item.urgency === 'urgent' ? styles.upcomingItemUrgent :
                  item.urgency === 'soon' ? styles.upcomingItemSoon : ''
                }`}>{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
