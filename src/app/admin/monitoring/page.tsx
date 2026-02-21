'use client';

import { useState, useEffect } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { Skeleton } from '@/components/ui';
import styles from './monitoring.module.css';

/* ---------- Mock Data ---------- */
const healthCards = [
  {
    title: 'API Server',
    status: 'Operational',
    statusType: 'green' as const,
    stats: [
      { label: 'Uptime', value: '99.97%' },
      { label: 'Avg Response', value: '42ms' },
      { label: 'Requests/min', value: '2,340' },
    ],
  },
  {
    title: 'Database',
    status: 'Healthy',
    statusType: 'green' as const,
    stats: [
      { label: 'Connections', value: '24/50' },
      { label: 'Query Latency', value: '4.2ms' },
      { label: 'Pool Usage', value: '48%' },
    ],
  },
  {
    title: 'Redis',
    status: 'Healthy',
    statusType: 'green' as const,
    stats: [
      { label: 'Memory', value: '2.8/8 GB' },
      { label: 'Hit Rate', value: '99.2%' },
      { label: 'Connections', value: '156' },
    ],
  },
  {
    title: 'Queue',
    status: 'Warning',
    statusType: 'yellow' as const,
    stats: [
      { label: 'Pending Jobs', value: '182' },
      { label: 'Processing Rate', value: '45/min' },
      { label: 'Failed Jobs', value: '3' },
    ],
  },
];

const hourlyRequests = [
  { hour: '00:00', count: 12400 },
  { hour: '01:00', count: 8200 },
  { hour: '02:00', count: 5600 },
  { hour: '03:00', count: 4100 },
  { hour: '04:00', count: 3800 },
  { hour: '05:00', count: 5200 },
  { hour: '06:00', count: 14600 },
  { hour: '07:00', count: 32400 },
  { hour: '08:00', count: 48200 },
  { hour: '09:00', count: 62100 },
  { hour: '10:00', count: 71800 },
  { hour: '11:00', count: 68400 },
  { hour: '12:00', count: 54200 },
  { hour: '13:00', count: 65800 },
  { hour: '14:00', count: 72100 },
  { hour: '15:00', count: 69400 },
  { hour: '16:00', count: 58200 },
  { hour: '17:00', count: 42800 },
  { hour: '18:00', count: 28600 },
  { hour: '19:00', count: 22400 },
  { hour: '20:00', count: 18600 },
  { hour: '21:00', count: 15200 },
  { hour: '22:00', count: 14800 },
  { hour: '23:00', count: 13200 },
];

const maxRequests = Math.max(...hourlyRequests.map((h) => h.count));

const errorBreakdown = [
  { endpoint: 'POST /api/invoices', errors: 5, rate: '0.02%' },
  { endpoint: 'GET /api/suppliers', errors: 3, rate: '0.01%' },
  { endpoint: 'POST /api/payments', errors: 2, rate: '0.08%' },
  { endpoint: 'PUT /api/approvals', errors: 1, rate: '0.005%' },
  { endpoint: 'GET /api/analytics', errors: 1, rate: '0.003%' },
];

const topEndpoints = [
  { name: 'GET /api/invoices', count: 142000, pct: 100 },
  { name: 'GET /api/dashboard', count: 98400, pct: 69 },
  { name: 'POST /api/invoices', count: 62100, pct: 44 },
  { name: 'GET /api/suppliers', count: 48200, pct: 34 },
  { name: 'POST /api/payments', count: 34600, pct: 24 },
  { name: 'GET /api/approvals', count: 28900, pct: 20 },
  { name: 'PUT /api/invoices', count: 22400, pct: 16 },
  { name: 'GET /api/analytics', count: 18700, pct: 13 },
];

const activeSessions = [
  { user: 'Sarah Chen', ip: '192.168.1.105', duration: '2h 14m', lastActivity: 'Now' },
  { user: 'Kevin Owens', ip: '192.168.1.100', duration: '1h 48m', lastActivity: 'Now' },
  { user: 'Michael Johnson', ip: '192.168.1.112', duration: '45m', lastActivity: '2 min ago' },
  { user: 'Emma Wilson', ip: '192.168.1.120', duration: '32m', lastActivity: '5 min ago' },
  { user: 'James Park', ip: '10.0.0.15', duration: '1h 22m', lastActivity: '8 min ago' },
  { user: 'Tom Richards', ip: '10.0.1.42', duration: '28m', lastActivity: '12 min ago' },
  { user: 'Yuki Tanaka', ip: '192.168.2.50', duration: '15m', lastActivity: '3 min ago' },
  { user: 'David Kim', ip: '172.16.0.88', duration: '55m', lastActivity: '15 min ago' },
];

export default function MonitoringPage() {
  const t = useT();
  const [loading, setLoading] = useState(true);

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
        <div className={styles.healthGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.healthCard}>
              <Skeleton width={120} height={14} />
              <Skeleton width={80} height={14} />
              <Skeleton width={100} height={14} />
              <Skeleton width={100} height={14} />
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

      {/* System Health Status Cards */}
      <div className={styles.healthGrid}>
        {healthCards.map((card) => (
          <div key={card.title} className={styles.healthCard}>
            <div className={styles.healthCardHeader}>
              <span className={styles.healthCardTitle}>{card.title}</span>
              <span className={`${styles.healthStatus} ${
                card.statusType === 'green' ? styles.healthStatusGreen :
                card.statusType === 'yellow' ? styles.healthStatusYellow :
                styles.healthStatusRed
              }`}>
                <span className={styles.healthDot} />
                {card.status}
              </span>
            </div>
            <div className={styles.healthStats}>
              {card.stats.map((stat) => (
                <div key={stat.label} className={styles.healthStatRow}>
                  <span className={styles.healthStatLabel}>{stat.label}</span>
                  <span className={styles.healthStatValue}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* API Request Volume + Response Time Distribution */}
      <div className={styles.sectionGrid}>
        {/* Request Volume Bar Chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.monitoring.requestVolume')}</span>
            <span className={`${styles.cardBadge} ${styles.cardBadgeGreen}`}>1.24M {t('admin.monitoring.last24h')}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.barChart}>
              {hourlyRequests.map((hr) => (
                <div key={hr.hour} className={styles.barCol}>
                  <div
                    className={styles.bar}
                    style={{ height: `${(hr.count / maxRequests) * 100}%` }}
                    title={`${hr.hour}: ${hr.count.toLocaleString()} requests`}
                  />
                  <span className={styles.barLabel}>{hr.hour.split(':')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Response Time Distribution */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.monitoring.responseTime')}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.percentileGrid}>
              <div className={styles.percentileCard}>
                <span className={styles.percentileLabel}>P50</span>
                <span className={`${styles.percentileValue} ${styles.metricGood}`}>28</span>
                <span className={styles.percentileUnit}>ms</span>
              </div>
              <div className={styles.percentileCard}>
                <span className={styles.percentileLabel}>P95</span>
                <span className={`${styles.percentileValue} ${styles.metricGood}`}>128</span>
                <span className={styles.percentileUnit}>ms</span>
              </div>
              <div className={styles.percentileCard}>
                <span className={styles.percentileLabel}>P99</span>
                <span className={`${styles.percentileValue} ${styles.metricWarn}`}>340</span>
                <span className={styles.percentileUnit}>ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Rate Breakdown + Top Endpoints */}
      <div className={styles.sectionGrid}>
        {/* Error Rate by Endpoint */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.monitoring.errorBreakdown')}</span>
            <span className={`${styles.cardBadge} ${styles.cardBadgeAmber}`}>0.03% {t('admin.monitoring.overallRate')}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.errorList}>
              {errorBreakdown.map((err) => (
                <div key={err.endpoint} className={styles.errorRow}>
                  <span className={styles.errorEndpoint}>{err.endpoint}</span>
                  <span className={styles.errorCount}>{err.errors}</span>
                  <span className={styles.errorRate}>{err.rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Endpoints by Volume */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.monitoring.topEndpoints')}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.endpointList}>
              {topEndpoints.map((ep) => (
                <div key={ep.name} className={styles.endpointRow}>
                  <span className={styles.endpointName}>{ep.name}</span>
                  <div className={styles.endpointBar}>
                    <div className={styles.endpointBarFill} style={{ width: `${ep.pct}%` }} />
                  </div>
                  <span className={styles.endpointCount}>{(ep.count / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className={styles.sectionGrid}>
        <div className={`${styles.card} ${styles.sectionFull}`} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('admin.monitoring.activeSessions')}</span>
            <span className={`${styles.cardBadge} ${styles.cardBadgeGreen}`}>
              {activeSessions.length} {t('admin.monitoring.online')}
            </span>
          </div>
          <div className={styles.cardBody}>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.sessionTable}>
                <thead>
                  <tr>
                    <th>{t('admin.monitoring.user')}</th>
                    <th>{t('admin.monitoring.ipAddress')}</th>
                    <th>{t('admin.monitoring.duration')}</th>
                    <th>{t('admin.monitoring.lastActivityCol')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.map((session, i) => (
                    <tr key={i}>
                      <td>
                        <span className={styles.sessionUser}>{session.user}</span>
                      </td>
                      <td>
                        <span className={styles.sessionIp}>{session.ip}</span>
                      </td>
                      <td>
                        <span className={styles.sessionDuration}>{session.duration}</span>
                      </td>
                      <td>
                        <span className={styles.sessionActivity}>
                          {session.lastActivity === 'Now' && (
                            <span className={styles.healthDot} style={{ color: 'var(--color-success)', marginRight: '6px' }} />
                          )}
                          {session.lastActivity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
