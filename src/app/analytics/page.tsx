'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './analytics.module.css';

const periods = ['7D', '30D', '90D', 'YTD', '1Y'];

const topSuppliers = [
  { name: 'Acme Corporation', spend: 2450000, pct: 100 },
  { name: 'GlobalTech Solutions', spend: 1870000, pct: 76 },
  { name: 'Nordic Supplies AB', spend: 1340000, pct: 55 },
  { name: 'Tokyo Precision Inc', spend: 980000, pct: 40 },
  { name: 'Baxter Medical Ltd', spend: 890000, pct: 36 },
  { name: 'Shanghai Electronics', spend: 780000, pct: 32 },
  { name: 'MexiParts Industrial', spend: 650000, pct: 27 },
  { name: 'Berlin Consulting AG', spend: 520000, pct: 21 },
  { name: 'Paris Logistics SAS', spend: 440000, pct: 18 },
  { name: 'Sydney Mining Corp', spend: 380000, pct: 16 },
];

const categories = [
  { name: 'IT Services', pct: 32, color: '#165DFF' },
  { name: 'Manufacturing', pct: 24, color: '#23C343' },
  { name: 'Professional Services', pct: 18, color: '#FF9A2E' },
  { name: 'Office Supplies', pct: 12, color: '#8E51DA' },
  { name: 'Logistics', pct: 9, color: '#F76560' },
  { name: 'Other', pct: 5, color: '#4E5969' },
];

const monthlySpend = [
  { month: 'Jan', amount: 2.1 }, { month: 'Feb', amount: 1.8 }, { month: 'Mar', amount: 2.4 },
  { month: 'Apr', amount: 2.2 }, { month: 'May', amount: 1.9 }, { month: 'Jun', amount: 2.6 },
  { month: 'Jul', amount: 2.3 }, { month: 'Aug', amount: 2.0 }, { month: 'Sep', amount: 2.8 },
  { month: 'Oct', amount: 2.5 }, { month: 'Nov', amount: 2.1 }, { month: 'Dec', amount: 2.7 },
];

const agingData = [
  { label: 'Current', count: 847, amount: '$4.2M', color: '#23C343' },
  { label: '1-30 Days', count: 234, amount: '$1.8M', color: '#165DFF' },
  { label: '31-60 Days', count: 89, amount: '$720K', color: '#FF9A2E' },
  { label: '61-90 Days', count: 34, amount: '$290K', color: '#f97316' },
  { label: '90+ Days', count: 12, amount: '$145K', color: '#F76560' },
];

const agents = [
  { name: 'Capture Agent', accuracy: 99.2, processed: 847, avgTime: '0.8s' },
  { name: 'Classification Agent', accuracy: 97.3, processed: 841, avgTime: '0.6s' },
  { name: 'Compliance Agent', accuracy: 98.7, processed: 838, avgTime: '1.1s' },
  { name: 'Matching Agent', accuracy: 94.2, processed: 824, avgTime: '1.4s' },
  { name: 'Risk Agent', accuracy: 96.8, processed: 824, avgTime: '0.9s' },
  { name: 'Approval Agent', accuracy: 95.1, processed: 812, avgTime: '0.5s' },
];

const maxSpend = Math.max(...monthlySpend.map(m => m.amount));

export default function AnalyticsPage() {
  const t = useT();
  const [period, setPeriod] = useState('30D');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('analytics.title')}</h1>
          <p className={styles.subtitle}>{t('analytics.subtitle')}</p>
        </div>
        <div className={styles.dateRange}>
          {periods.map(p => (
            <button key={p} className={`${styles.dateBtn} ${period === p ? styles.dateBtnActive : ''}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
      </div>

      <div className={styles.kpiGrid}>
        {[
          { label: 'Total Processed', value: '12,847', trend: '↑ 12.3%', up: true },
          { label: 'Touchless Rate', value: '94.9%', trend: '↑ 2.3%', up: true },
          { label: t('analytics.avgProcessingTime'), value: '3.2 hrs', trend: '↓ 18%', up: true },
          { label: t('analytics.costPerInvoice'), value: '$1.23', trend: '↓ $0.34', up: true },
        ].map(kpi => (
          <div key={kpi.label} className={styles.kpiCard}>
            <div className={styles.kpiLabel}>{kpi.label}</div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={`${styles.kpiTrend} ${kpi.up ? styles.trendUp : styles.trendDown}`}>{kpi.trend} vs last period</div>
          </div>
        ))}
      </div>

      <div className={styles.grid2}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('analytics.topSuppliersByVolume')}</h2>
          <div className={styles.barChart}>
            {topSuppliers.map(s => (
              <div key={s.name} className={styles.barRow}>
                <span className={styles.barLabel}>{s.name}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${s.pct}%`, background: '#165DFF' }}>
                    <span className={styles.barValue}>${(s.spend / 1e6).toFixed(1)}M</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('analytics.spendByCategory')}</h2>
          <div className={styles.barChart}>
            {categories.map(c => (
              <div key={c.name} className={styles.barRow}>
                <span className={styles.barLabel}>{c.name}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${c.pct}%`, background: c.color }}>
                    <span className={styles.barValue}>{c.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <h2 className={styles.sectionTitle}>{t('analytics.processingTrends')}</h2>
            <div className={styles.monthlyChart}>
              {monthlySpend.map(m => (
                <div key={m.month} className={styles.monthBar}>
                  <div className={styles.monthBarFill} style={{ height: `${(m.amount / maxSpend) * 120}px`, background: '#165DFF' }} />
                  <span className={styles.monthLabel}>{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('analytics.exceptionAnalysis')}</h2>
        <div className={styles.agingGrid}>
          {agingData.map(a => (
            <div key={a.label} className={styles.agingCard} style={{ borderLeft: `3px solid ${a.color}` }}>
              <div className={styles.agingLabel}>{a.label}</div>
              <div className={styles.agingCount}>{a.count}</div>
              <div className={styles.agingAmount}>{a.amount}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('analytics.aiPerformance')}</h2>
        <div className={styles.agentGrid}>
          {agents.map(a => (
            <div key={a.name} className={styles.agentCard}>
              <div className={styles.agentName}>{a.name}</div>
              <div className={styles.agentStat}><span>Accuracy</span><span className={styles.agentValue}>{a.accuracy}%</span></div>
              <div className={styles.agentStat}><span>Processed Today</span><span className={styles.agentValue}>{a.processed}</span></div>
              <div className={styles.agentStat}><span>Avg Time</span><span className={styles.agentValue}>{a.avgTime}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
