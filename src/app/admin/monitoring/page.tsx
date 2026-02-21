'use client';

import { useState, useEffect } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { Skeleton } from '@/components/ui';
import styles from './monitoring.module.css';

/* ---------- Mock Data ---------- */
const apiMetrics = [
  { label: 'Avg Response Time', value: '42ms', sub: 'Last 5 minutes', status: 'good' as const },
  { label: 'P95 Latency', value: '128ms', sub: 'Below 200ms threshold', status: 'good' as const },
  { label: 'P99 Latency', value: '340ms', sub: 'Slightly elevated', status: 'warn' as const },
  { label: 'Error Rate', value: '0.03%', sub: '12 errors / 38,400 requests', status: 'good' as const },
];

const sessionsByTenant = [
  { tenant: 'Acme Corporation', count: 87, pct: 28 },
  { tenant: 'GlobalLogistics Inc', count: 64, pct: 21 },
  { tenant: 'BigRetail Inc', count: 52, pct: 17 },
  { tenant: 'NordicTech AB', count: 38, pct: 12 },
  { tenant: 'CloudHost Services', count: 24, pct: 8 },
  { tenant: 'FinanceHub Ltd', count: 18, pct: 6 },
  { tenant: 'Others (6 tenants)', count: 29, pct: 9 },
];

const dbStats = [
  { label: 'Connection Pool', value: '24/50 active' },
  { label: 'Avg Query Time', value: '4.2ms' },
  { label: 'Slow Queries (>1s)', value: '3 in last hour' },
  { label: 'Total Table Size', value: '142 GB' },
  { label: 'Index Hit Rate', value: '99.7%' },
  { label: 'Replication Lag', value: '0.2s' },
];

const agentQueues = [
  { name: 'Capture Agent', depth: 23, maxDepth: 100, color: '#165DFF', status: 'Healthy' },
  { name: 'Classification Agent', depth: 18, maxDepth: 100, color: '#8E51DA', status: 'Healthy' },
  { name: 'Compliance Agent', depth: 42, maxDepth: 100, color: '#14C9C9', status: 'Healthy' },
  { name: 'Matching Agent', depth: 67, maxDepth: 100, color: '#FF9A2E', status: 'Warning' },
  { name: 'Risk Agent', depth: 8, maxDepth: 100, color: '#F53F3F', status: 'Healthy' },
  { name: 'Payment Agent', depth: 3, maxDepth: 100, color: '#23C343', status: 'Healthy' },
  { name: 'Coding Agent', depth: 31, maxDepth: 100, color: '#722ED1', status: 'Healthy' },
];

const recentErrors = [
  {
    id: 'e1',
    type: 'TimeoutError',
    message: 'Request to payment gateway timed out after 30000ms',
    time: '4 min ago',
    stack: 'at PaymentService.processPayment (payment-service.ts:142)\nat BatchProcessor.run (batch-processor.ts:89)\nat async Queue.process (queue.ts:45)',
  },
  {
    id: 'e2',
    type: 'ValidationError',
    message: 'Invalid invoice format: missing required field "tax_id" for tenant nordictech',
    time: '12 min ago',
    stack: 'at InvoiceValidator.validate (invoice-validator.ts:67)\nat CaptureAgent.process (capture-agent.ts:134)\nat async AgentRunner.execute (agent-runner.ts:28)',
  },
  {
    id: 'e3',
    type: 'DatabaseError',
    message: 'Connection pool exhausted: max connections (50) reached, retrying in 500ms',
    time: '28 min ago',
    stack: 'at ConnectionPool.acquire (connection-pool.ts:89)\nat QueryExecutor.execute (query-executor.ts:34)\nat async InvoiceRepository.findById (invoice-repo.ts:56)',
  },
  {
    id: 'e4',
    type: 'RateLimitError',
    message: 'API rate limit exceeded for tenant "globallogistics" (25000 req/hr)',
    time: '45 min ago',
    stack: 'at RateLimiter.check (rate-limiter.ts:42)\nat APIGateway.handleRequest (gateway.ts:78)\nat async Router.dispatch (router.ts:23)',
  },
  {
    id: 'e5',
    type: 'AuthenticationError',
    message: 'JWT token expired for user david.k@cloudhost.io, refresh token also invalid',
    time: '1 hr ago',
    stack: 'at AuthMiddleware.verify (auth-middleware.ts:56)\nat async TokenService.refresh (token-service.ts:89)\nat SessionManager.validate (session-manager.ts:34)',
  },
];

const systemGauges = [
  { label: 'CPU Usage', value: 34, unit: '%', sub: '8 cores / 16 threads', color: '#165DFF' },
  { label: 'Memory Usage', value: 62, unit: '%', sub: '12.4 / 20 GB', color: '#8E51DA' },
  { label: 'Disk I/O', value: 18, unit: '%', sub: '145 MB/s read, 67 MB/s write', color: '#23C343' },
  { label: 'Network', value: 24, unit: '%', sub: '340 Mbps in, 128 Mbps out', color: '#14C9C9' },
];

const agents = [
  { name: 'Capture Agent', status: 'active' as const, tasks: 142, accuracy: 99.1, avgTime: '1.2s', health: 98 },
  { name: 'Classification Agent', status: 'active' as const, tasks: 138, accuracy: 97.8, avgTime: '0.8s', health: 96 },
  { name: 'Compliance Agent', status: 'active' as const, tasks: 115, accuracy: 99.7, avgTime: '2.1s', health: 99 },
  { name: 'Matching Agent', status: 'active' as const, tasks: 108, accuracy: 96.3, avgTime: '1.5s', health: 87 },
  { name: 'Risk Agent', status: 'active' as const, tasks: 108, accuracy: 98.2, avgTime: '0.9s', health: 97 },
  { name: 'Payment Agent', status: 'idle' as const, tasks: 47, accuracy: 99.9, avgTime: '3.2s', health: 100 },
  { name: 'Coding Agent', status: 'active' as const, tasks: 134, accuracy: 98.1, avgTime: '0.6s', health: 95 },
  { name: 'Supplier Agent', status: 'active' as const, tasks: 56, accuracy: 97.4, avgTime: '1.8s', health: 93 },
];

export default function MonitoringPage() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [expandedError, setExpandedError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Skeleton width={260} height={28} />
            <Skeleton width={200} height={16} />
          </div>
        </div>
        <div className={styles.metricsGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.metricCard}>
              <Skeleton width={120} height={12} />
              <Skeleton width={80} height={28} />
              <Skeleton width={140} height={12} />
            </div>
          ))}
        </div>
        <div className={styles.sectionGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardHeader}><Skeleton width={160} height={16} /></div>
              <div className={styles.cardBody}><Skeleton width="100%" height={120} /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{t('admin.monitoring.title')}</h1>
          <p className={styles.subtitle}>{t('admin.monitoring.subtitle')}</p>
        </div>
        <div className={styles.liveBadge}>
          <span className={styles.liveDot} />
          {t('admin.monitoring.live')}
        </div>
      </div>

      {/* API Performance Metrics */}
      <div className={styles.metricsGrid}>
        {apiMetrics.map((metric) => (
          <div key={metric.label} className={styles.metricCard}>
            <div className={styles.metricLabel}>{metric.label}</div>
            <div className={`${styles.metricValue} ${
              metric.status === 'good' ? styles.metricGood :
              metric.status === 'warn' ? styles.metricWarn :
              styles.metricBad
            }`}>
              {metric.value}
            </div>
            <div className={styles.metricSub}>{metric.sub}</div>
          </div>
        ))}
      </div>

      {/* Sessions + Database Stats */}
      <div className={styles.sectionGrid}>
        {/* Active Sessions by Tenant */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.monitoring.activeSessions')}</span>
            <span className={`${styles.cardBadge} ${styles.cardBadgeGreen}`}>312 {t('admin.monitoring.total')}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.sessionsList}>
              {sessionsByTenant.map((session) => (
                <div key={session.tenant} className={styles.sessionRow}>
                  <span className={styles.sessionTenant}>{session.tenant}</span>
                  <div className={styles.sessionBar}>
                    <div className={styles.sessionBarFill} style={{ width: `${session.pct}%` }} />
                  </div>
                  <span className={styles.sessionCount}>{session.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Database Stats */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.monitoring.databaseStats')}</span>
            <span className={`${styles.cardBadge} ${styles.cardBadgeGreen}`}>{t('admin.monitoring.healthy')}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.statsGrid}>
              {dbStats.map((stat) => (
                <div key={stat.label} className={styles.statItem}>
                  <span className={styles.statLabel}>{stat.label}</span>
                  <span className={styles.statValue}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Queue Depths + Recent Errors */}
      <div className={styles.sectionGrid}>
        {/* Queue Depths */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.monitoring.queueDepths')}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.queueList}>
              {agentQueues.map((queue) => (
                <div key={queue.name} className={styles.queueItem}>
                  <span className={styles.queueName}>{queue.name}</span>
                  <div className={styles.queueBar}>
                    <div
                      className={styles.queueBarFill}
                      style={{
                        width: `${(queue.depth / queue.maxDepth) * 100}%`,
                        backgroundColor: queue.depth > 60 ? '#FF9A2E' : queue.color,
                      }}
                    >
                      <span className={styles.queueBarLabel}>{queue.depth}</span>
                    </div>
                  </div>
                  <span className={`${styles.queueStatus} ${
                    queue.status === 'Healthy' ? styles.metricGood : styles.metricWarn
                  }`}>
                    {queue.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Errors */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.monitoring.recentErrors')}</span>
            <span className={`${styles.cardBadge} ${styles.cardBadgeAmber}`}>
              {recentErrors.length} {t('admin.monitoring.errors')}
            </span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.errorList}>
              {recentErrors.map((error) => (
                <div
                  key={error.id}
                  className={styles.errorItem}
                  onClick={() => setExpandedError(expandedError === error.id ? null : error.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedError(expandedError === error.id ? null : error.id);
                    }
                  }}
                >
                  <div className={styles.errorHeader}>
                    <span className={styles.errorType}>{error.type}</span>
                    <span className={styles.errorTime}>{error.time}</span>
                  </div>
                  <div className={styles.errorMessage}>{error.message}</div>
                  {expandedError === error.id && (
                    <div className={styles.errorStack}>{error.stack}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Gauges + Agent Health */}
      <div className={styles.sectionGrid}>
        {/* CPU / Memory / Disk / Network */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.monitoring.systemResources')}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.gaugeGrid}>
              {systemGauges.map((gauge) => (
                <div key={gauge.label} className={styles.gaugeItem}>
                  <div className={styles.gaugeRing}>
                    <div className={styles.gaugeRingBg} />
                    <div
                      className={styles.gaugeRingFill}
                      style={{
                        borderTopColor: gauge.value > 80 ? '#F53F3F' : gauge.value > 60 ? '#FF9A2E' : gauge.color,
                        borderRightColor: gauge.value > 25 ? (gauge.value > 80 ? '#F53F3F' : gauge.value > 60 ? '#FF9A2E' : gauge.color) : 'transparent',
                        borderBottomColor: gauge.value > 50 ? (gauge.value > 80 ? '#F53F3F' : gauge.value > 60 ? '#FF9A2E' : gauge.color) : 'transparent',
                        borderLeftColor: gauge.value > 75 ? (gauge.value > 80 ? '#F53F3F' : gauge.value > 60 ? '#FF9A2E' : gauge.color) : 'transparent',
                        transform: `rotate(${(gauge.value / 100) * 360}deg)`,
                      }}
                    />
                    <span className={styles.gaugeValue}>{gauge.value}{gauge.unit}</span>
                  </div>
                  <span className={styles.gaugeLabel}>{gauge.label}</span>
                  <span className={styles.gaugeSub}>{gauge.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Health Status */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.monitoring.agentHealth')}</span>
            <span className={`${styles.cardBadge} ${styles.cardBadgeGreen}`}>
              {agents.filter((a) => a.status === 'active').length}/{agents.length} {t('admin.monitoring.active')}
            </span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.agentGrid}>
              {agents.map((agent) => (
                <div
                  key={agent.name}
                  className={`${styles.agentCard} ${
                    agent.status === 'active'
                      ? styles.agentCardActive
                      : agent.status === 'idle'
                      ? styles.agentCardIdle
                      : styles.agentCardError
                  }`}
                >
                  <div className={styles.agentName}>{agent.name}</div>
                  <div className={styles.agentStats}>
                    <div className={styles.agentStat}>
                      <span className={styles.agentStatValue}>{agent.tasks}</span>
                      <span className={styles.agentStatLabel}>Tasks</span>
                    </div>
                    <div className={styles.agentStat}>
                      <span className={styles.agentStatValue}>{agent.accuracy}%</span>
                      <span className={styles.agentStatLabel}>Accuracy</span>
                    </div>
                    <div className={styles.agentStat}>
                      <span className={styles.agentStatValue}>{agent.avgTime}</span>
                      <span className={styles.agentStatLabel}>Avg Time</span>
                    </div>
                  </div>
                  <div className={styles.agentHealth}>
                    <div
                      className={styles.agentHealthFill}
                      style={{
                        width: `${agent.health}%`,
                        backgroundColor: agent.health >= 95 ? '#23C343' : agent.health >= 90 ? '#FF9A2E' : '#F53F3F',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
