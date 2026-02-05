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

/* ---- CFO Command Center data ---- */

const cfoKpis: {
  label: string;
  value: string;
  badge: string;
  badgeColor: 'green' | 'amber' | 'red' | 'blue';
  context: string;
  dotColor: string;
}[] = [
  { label: 'Cash Position', value: '$12.8M', badge: '+3.2% vs last week', badgeColor: 'green', context: 'Real-time consolidated', dotColor: '#23C343' },
  { label: 'DSO', value: '34 days', badge: '-2d vs prior month', badgeColor: 'green', context: 'Industry avg: 42 days', dotColor: '#23C343' },
  { label: 'Cash Conversion Cycle', value: '-8 days', badge: 'Cash efficient', badgeColor: 'green', context: 'Negative = collecting before paying', dotColor: '#23C343' },
  { label: 'Forecast Accuracy', value: '94.2%', badge: 'AI-powered', badgeColor: 'blue', context: '2-week horizon', dotColor: '#165DFF' },
  { label: 'Working Capital Ratio', value: '2.1x', badge: 'Above 2.0x target', badgeColor: 'green', context: 'Healthy liquidity', dotColor: '#23C343' },
];

const cashForecastWeeks: { week: string; inflow: number; outflow: number }[] = [
  { week: 'W1', inflow: 82, outflow: 70 },
  { week: 'W2', inflow: 75, outflow: 68 },
  { week: 'W3', inflow: 90, outflow: 72 },
  { week: 'W4', inflow: 65, outflow: 60 },
  { week: 'W5', inflow: 78, outflow: 74 },
  { week: 'W6', inflow: 85, outflow: 65 },
  { week: 'W7', inflow: 70, outflow: 66 },
  { week: 'W8', inflow: 88, outflow: 75 },
  { week: 'W9', inflow: 72, outflow: 58 },
  { week: 'W10', inflow: 80, outflow: 70 },
  { week: 'W11', inflow: 76, outflow: 64 },
  { week: 'W12', inflow: 92, outflow: 78 },
];

const aiInsights: {
  icon: string;
  iconColor: 'green' | 'blue' | 'amber';
  title: string;
  description: string;
  impact: string;
  impactColor: 'green' | 'amber' | 'blue';
}[] = [
  {
    icon: '\u23F1',
    iconColor: 'green',
    title: 'Payment timing optimization',
    description: 'Deferring $450K in flexible payments improves month-end position by 3.2%. Savings: $14.4K annualized.',
    impact: '$14.4K/yr',
    impactColor: 'green',
  },
  {
    icon: '\uD83D\uDCC8',
    iconColor: 'blue',
    title: 'Cash surplus opportunity',
    description: '$410K available in Week 1 March for overnight sweep. Projected income: $1,200.',
    impact: '$1,200',
    impactColor: 'blue',
  },
  {
    icon: '\u26A0\uFE0F',
    iconColor: 'amber',
    title: 'Supplier concentration risk',
    description: 'Top 3 suppliers = 76% of spend. Recommend diversification plan to reduce single-source dependency.',
    impact: 'Risk',
    impactColor: 'amber',
  },
];

const spendCategories: { name: string; pct: number; color: string }[] = [
  { name: 'IT Services', pct: 32, color: '#165DFF' },
  { name: 'Manufacturing', pct: 24, color: '#8E51DA' },
  { name: 'Professional Services', pct: 18, color: '#23C343' },
  { name: 'Facilities', pct: 14, color: '#FF9A2E' },
  { name: 'Other', pct: 12, color: '#86909C' },
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

      {/* === CFO COMMAND CENTER === */}
      <div className={styles.cfoDivider}>
        <div className={styles.cfoDividerLine} />
        <span className={styles.cfoDividerLabel}>CFO Command Center</span>
        <div className={styles.cfoDividerLine} />
      </div>

      {/* 1. CFO Strategic KPI Row */}
      <div className={styles.cfoKpiGrid}>
        {cfoKpis.map((kpi) => (
          <div key={kpi.label} className={styles.cfoKpiCard}>
            <div className={styles.cfoKpiHeader}>
              <span className={styles.cfoKpiLabel}>{kpi.label}</span>
              <span className={styles.cfoKpiStatusDot} style={{ backgroundColor: kpi.dotColor }} />
            </div>
            <div className={styles.cfoKpiValue}>{kpi.value}</div>
            <div className={styles.cfoKpiMeta}>
              <span className={`${styles.cfoKpiBadge} ${
                kpi.badgeColor === 'green' ? styles.cfoKpiBadgeGreen :
                kpi.badgeColor === 'amber' ? styles.cfoKpiBadgeAmber :
                kpi.badgeColor === 'red' ? styles.cfoKpiBadgeRed :
                styles.cfoKpiBadgeBlue
              }`}>{kpi.badge}</span>
              <span className={styles.cfoKpiContext}>{kpi.context}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Cash Forecast Widget - 12-week outlook */}
      <div className={styles.cashForecastSection}>
        <div className={styles.forecastHeader}>
          <div className={styles.forecastHeaderLeft}>
            <span className={styles.sectionTitle} style={{ marginBottom: 0 }}>Cash Forecast</span>
            <span className={styles.sectionTitleBadge}>12-Week</span>
          </div>
          <span className={styles.forecastLink}>View Full Forecast &rarr;</span>
        </div>
        <div className={styles.forecastBody}>
          <div className={styles.forecastChart}>
            <div className={styles.forecastChartLabel}>Projected Inflows vs Outflows</div>
            <div className={styles.forecastBars}>
              {cashForecastWeeks.map((w) => (
                <div key={w.week} className={styles.forecastBarGroup}>
                  <div className={styles.forecastBarPair}>
                    <div className={styles.forecastBarInflow} style={{ height: `${w.inflow}%` }} />
                    <div className={styles.forecastBarOutflow} style={{ height: `${w.outflow}%` }} />
                  </div>
                  <span className={styles.forecastBarWeek}>{w.week}</span>
                </div>
              ))}
            </div>
            <div className={styles.forecastLegend}>
              <span className={styles.forecastLegendItem}>
                <span className={styles.forecastLegendDot} style={{ backgroundColor: '#23C343' }} />
                Inflows
              </span>
              <span className={styles.forecastLegendItem}>
                <span className={styles.forecastLegendDot} style={{ backgroundColor: '#F76560' }} />
                Outflows
              </span>
            </div>
          </div>
          <div className={styles.forecastSidebar}>
            <div className={styles.forecastStat}>
              <div className={styles.forecastStatLabel}>Net Position (12 Weeks)</div>
              <div className={styles.forecastStatValue}>+$2.4M</div>
              <div className={styles.forecastStatContext}>Cumulative net inflow</div>
            </div>
            <div className={styles.forecastStat}>
              <div className={styles.forecastStatLabel}>Forecast Confidence</div>
              <div className={styles.forecastStatValueBlue}>94.2%</div>
              <div className={styles.forecastStatContext}>Accuracy at 2-week horizon</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI Strategic Insights */}
      <div className={styles.aiInsightsSection}>
        <div className={styles.aiInsightsHeader}>
          <span className={styles.aiInsightsTitle}>AI Strategic Recommendations</span>
          <span className={styles.aiBadge}>AI</span>
        </div>
        <div className={styles.insightCards}>
          {aiInsights.map((insight) => (
            <div key={insight.title} className={styles.insightCard}>
              <div className={styles.insightCardHeader}>
                <div className={`${styles.insightIcon} ${
                  insight.iconColor === 'green' ? styles.insightIconGreen :
                  insight.iconColor === 'blue' ? styles.insightIconBlue :
                  styles.insightIconAmber
                }`}>
                  {insight.icon}
                </div>
                <span className={`${styles.insightImpactBadge} ${
                  insight.impactColor === 'green' ? styles.cfoKpiBadgeGreen :
                  insight.impactColor === 'amber' ? styles.cfoKpiBadgeAmber :
                  styles.cfoKpiBadgeBlue
                }`}>{insight.impact}</span>
              </div>
              <div className={styles.insightTitle}>{insight.title}</div>
              <div className={styles.insightDescription}>{insight.description}</div>
              <span className={styles.insightAction}>Take Action &rarr;</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Strategic Spend Summary */}
      <div className={styles.spendSection}>
        <div className={styles.spendHeader}>
          <div className={styles.spendHeaderLeft}>
            <span className={styles.sectionTitle} style={{ marginBottom: 0 }}>Strategic Spend Intelligence</span>
          </div>
          <span className={styles.spendLink}>View Full Analytics &rarr;</span>
        </div>
        <div className={styles.spendBody}>
          <div className={styles.spendChartArea}>
            <div className={styles.spendStackedBar}>
              {spendCategories.map((cat) => (
                <div
                  key={cat.name}
                  className={styles.spendBarSegment}
                  style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                  title={`${cat.name}: ${cat.pct}%`}
                />
              ))}
            </div>
            <div className={styles.spendLegend}>
              {spendCategories.map((cat) => (
                <span key={cat.name} className={styles.spendLegendItem}>
                  <span className={styles.spendLegendDot} style={{ backgroundColor: cat.color }} />
                  {cat.name}
                  <span className={styles.spendLegendValue}>{cat.pct}%</span>
                </span>
              ))}
            </div>
          </div>
          <div className={styles.spendSidebar}>
            <div className={styles.spendTotal}>
              <div className={styles.spendTotalLabel}>Total MTD</div>
              <div className={styles.spendTotalValue}>$2.4M</div>
              <div className={styles.spendTotalContext}>Across 847 invoices</div>
            </div>
            <div className={styles.spendAnomaly}>
              <div className={styles.spendAnomalyLabel}>Spend Anomaly</div>
              <div className={styles.spendAnomalyText}>Office Supplies +42% vs 6-month avg</div>
            </div>
          </div>
        </div>
      </div>

      {/* === END CFO COMMAND CENTER === */}

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
