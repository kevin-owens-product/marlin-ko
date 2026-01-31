'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './AgentMonitor.module.css';

interface Agent {
  name: string;
  icon: string;
  iconBg: string;
  status: 'active' | 'idle' | 'offline';
  currentTask: string;
  queueDepth: number;
  docsPerHour: number;
  accuracy: number;
  avgTime: string;
}

const agents: Agent[] = [
  {
    name: 'Capture Agent',
    icon: '\uD83D\uDCF7',
    iconBg: 'rgba(59,130,246,0.15)',
    status: 'active',
    currentTask: 'Processing batch #447 (12 invoices)',
    queueDepth: 24,
    docsPerHour: 340,
    accuracy: 99.1,
    avgTime: '1.2s',
  },
  {
    name: 'Classification Agent',
    icon: '\uD83C\uDFF7\uFE0F',
    iconBg: 'rgba(139,92,246,0.15)',
    status: 'active',
    currentTask: 'Auto-coding INV-9847 (GL: 6001)',
    queueDepth: 18,
    docsPerHour: 425,
    accuracy: 97.8,
    avgTime: '0.8s',
  },
  {
    name: 'Compliance Agent',
    icon: '\uD83D\uDEE1\uFE0F',
    iconBg: 'rgba(6,182,212,0.15)',
    status: 'active',
    currentTask: 'UBL validation - Belgium batch',
    queueDepth: 15,
    docsPerHour: 180,
    accuracy: 99.7,
    avgTime: '2.1s',
  },
  {
    name: 'Matching Agent',
    icon: '\uD83D\uDD17',
    iconBg: 'rgba(245,158,11,0.15)',
    status: 'active',
    currentTask: '3-way match: INV-9845 / PO-2239 / GR-1102',
    queueDepth: 31,
    docsPerHour: 210,
    accuracy: 96.3,
    avgTime: '1.5s',
  },
  {
    name: 'Risk Agent',
    icon: '\uD83D\uDEA8',
    iconBg: 'rgba(239,68,68,0.15)',
    status: 'active',
    currentTask: 'Duplicate detection scan (batch #446)',
    queueDepth: 8,
    docsPerHour: 520,
    accuracy: 98.2,
    avgTime: '0.9s',
  },
  {
    name: 'Approval Agent',
    icon: '\u2705',
    iconBg: 'rgba(16,185,129,0.15)',
    status: 'active',
    currentTask: 'Routing INV-9841 to L2 approver',
    queueDepth: 23,
    docsPerHour: 155,
    accuracy: 99.5,
    avgTime: '0.4s',
  },
  {
    name: 'Payment Agent',
    icon: '\uD83D\uDCB3',
    iconBg: 'rgba(34,211,238,0.15)',
    status: 'idle',
    currentTask: 'Waiting for next payment window (14:00)',
    queueDepth: 47,
    docsPerHour: 95,
    accuracy: 99.9,
    avgTime: '3.2s',
  },
  {
    name: 'Coding Agent',
    icon: '\uD83E\uDDE0',
    iconBg: 'rgba(168,85,247,0.15)',
    status: 'active',
    currentTask: 'ML inference: cost center prediction batch',
    queueDepth: 22,
    docsPerHour: 480,
    accuracy: 98.1,
    avgTime: '0.6s',
  },
];

const activityLog = [
  { time: '10:42', agent: 'Capture', action: 'Extracted 12 invoices from email batch', status: 'success' as const },
  { time: '10:41', agent: 'Matching', action: 'Auto-matched INV-9847 to PO-2241', status: 'success' as const },
  { time: '10:40', agent: 'Compliance', action: 'UBL schema check passed (BE batch)', status: 'success' as const },
  { time: '10:39', agent: 'Risk', action: 'Flagged INV-9843: potential duplicate', status: 'warning' as const },
  { time: '10:38', agent: 'Classification', action: 'GL code 6001 assigned (confidence: 98.4%)', status: 'success' as const },
  { time: '10:36', agent: 'Payment', action: 'Batch PB-447 submitted ($234,500)', status: 'success' as const },
  { time: '10:35', agent: 'Coding', action: 'Cost center predicted: CC-4401 (Engineering)', status: 'success' as const },
  { time: '10:33', agent: 'Approval', action: 'INV-9839 escalated to L2 ($52K threshold)', status: 'warning' as const },
  { time: '10:31', agent: 'Capture', action: 'OCR completed: 3 paper invoices digitized', status: 'success' as const },
  { time: '10:30', agent: 'Risk', action: 'Vendor risk score updated: TechParts Ltd (Low)', status: 'success' as const },
  { time: '10:28', agent: 'Compliance', action: 'KSeF token refresh failed - retry queued', status: 'error' as const },
  { time: '10:27', agent: 'Matching', action: 'Fuzzy match: INV-9841 to PO-2237 (87% conf)', status: 'warning' as const },
  { time: '10:25', agent: 'Classification', action: 'New vendor detected: Nordic Supply AB', status: 'success' as const },
  { time: '10:24', agent: 'Coding', action: 'Tax code auto-assigned: VAT-21% (Belgium)', status: 'success' as const },
  { time: '10:22', agent: 'Capture', action: 'PDF extraction: 8 structured invoices parsed', status: 'success' as const },
  { time: '10:20', agent: 'Risk', action: 'Daily anomaly scan complete: 0 critical findings', status: 'success' as const },
  { time: '10:18', agent: 'Approval', action: 'Auto-approved 14 invoices (under threshold)', status: 'success' as const },
  { time: '10:15', agent: 'Compliance', action: 'Factur-X validation passed (FR batch)', status: 'success' as const },
  { time: '10:12', agent: 'Payment', action: 'Early discount identified: $4,200 (TechParts)', status: 'success' as const },
  { time: '10:10', agent: 'Matching', action: 'Receipt confirmed: GR-1101 for PO-2235', status: 'success' as const },
];

const pipelineSegmentDefs = [
  { labelKey: 'agentMonitor.processing', value: 35, color: '#165DFF' },
  { labelKey: 'agentMonitor.validating', value: 25, color: '#8E51DA' },
  { labelKey: 'agentMonitor.matching', value: 20, color: '#FF9A2E' },
  { labelKey: 'agentMonitor.approving', value: 12, color: '#23C343' },
  { labelKey: 'agentMonitor.queued', value: 8, color: '#475569' },
];

const statusColors: Record<string, string> = {
  success: '#23C343',
  warning: '#FF9A2E',
  error: '#F76560',
};

export function AgentMonitor() {
  const [compact, setCompact] = useState(false);
  const t = useT();

  const pipelineSegments = pipelineSegmentDefs.map((s) => ({
    ...s,
    label: t(s.labelKey),
  }));

  const totalPipeline = pipelineSegments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>{t('agentMonitor.title')}</span>
          <span className={styles.systemBadge}>
            <span className={styles.systemDot} />
            {t('agentMonitor.allSystemsOnline')}
          </span>
        </div>
        <button className={styles.toggleBtn} onClick={() => setCompact(!compact)}>
          {compact ? t('agentMonitor.expanded') : t('agentMonitor.compact')}
        </button>
      </div>

      {/* Agent Cards */}
      <div className={styles.agentGrid}>
        {compact ? (
          agents.map((agent) => (
            <div key={agent.name} className={styles.agentCompact}>
              <span className={styles.agentCompactIcon}>{agent.icon}</span>
              <span className={styles.agentCompactName}>
                <span
                  className={`${styles.statusDot} ${
                    agent.status === 'active' ? styles.statusActive :
                    agent.status === 'idle' ? styles.statusIdle :
                    styles.statusOffline
                  }`}
                />
                {agent.name}
              </span>
              <span className={styles.agentCompactStats}>
                <span>Q:{agent.queueDepth}</span>
                <span>{agent.docsPerHour}/hr</span>
                <span>{agent.accuracy}%</span>
              </span>
            </div>
          ))
        ) : (
          agents.map((agent) => (
            <div key={agent.name} className={styles.agentCard}>
              <div className={styles.agentIcon} style={{ backgroundColor: agent.iconBg }}>
                {agent.icon}
              </div>
              <div className={styles.agentBody}>
                <div className={styles.agentNameRow}>
                  <span className={styles.agentName}>
                    <span
                      className={`${styles.statusDot} ${
                        agent.status === 'active' ? styles.statusActive :
                        agent.status === 'idle' ? styles.statusIdle :
                        styles.statusOffline
                      }`}
                    />
                    {agent.name}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#4E5969' }}>
                    {t('agentMonitor.queue')}: {agent.queueDepth}
                  </span>
                </div>
                <div className={styles.agentTask}>{agent.currentTask}</div>
                <div className={styles.agentStatsRow}>
                  <span className={styles.agentStat}>
                    <span className={styles.agentStatValue}>{agent.docsPerHour}</span> {t('agentMonitor.docsPerHour')}
                  </span>
                  <span className={styles.agentStat}>
                    <span className={styles.agentStatValue}>{agent.accuracy}%</span> {t('agentMonitor.accuracy')}
                  </span>
                  <span className={styles.agentStat}>
                    <span className={styles.agentStatValue}>{agent.avgTime}</span> {t('agentMonitor.avg')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pipeline Status */}
      <div className={styles.pipelineSection}>
        <div className={styles.pipelineLabel}>{t('agentMonitor.pipelineStatus')}</div>
        <div className={styles.pipelineBarOuter}>
          {pipelineSegments.map((seg) => (
            <div
              key={seg.label}
              className={styles.pipelineSegment}
              style={{
                width: `${(seg.value / totalPipeline) * 100}%`,
                backgroundColor: seg.color,
                borderRadius: '3px',
              }}
            />
          ))}
        </div>
        <div className={styles.pipelineLegend}>
          {pipelineSegments.map((seg) => (
            <span key={seg.label} className={styles.pipelineLegendItem}>
              <span className={styles.pipelineLegendDot} style={{ backgroundColor: seg.color }} />
              {seg.label} ({seg.value}%)
            </span>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className={styles.activitySection}>
        <div className={styles.activityTitle}>{t('agentMonitor.activityLog')}</div>
        <div className={styles.activityLog}>
          {activityLog.map((entry, i) => (
            <div key={i} className={styles.activityLogItem}>
              <span className={styles.activityLogTime}>{entry.time}</span>
              <span
                className={styles.activityLogDot}
                style={{ backgroundColor: statusColors[entry.status] || '#4E5969' }}
              />
              <div className={styles.activityLogContent}>
                <span className={styles.activityLogAgent}>{entry.agent}</span>
                {' '}
                <span className={styles.activityLogAction}>{entry.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
