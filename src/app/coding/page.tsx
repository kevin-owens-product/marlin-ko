'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './coding.module.css';

type CodingStatus = 'Auto-Coded' | 'Overridden' | 'Pending Review' | 'Learning';

interface CodingEntry {
  id: string;
  invoiceNumber: string;
  supplier: string;
  predictedGLCode: string;
  glName: string;
  confidence: number;
  status: CodingStatus;
  amount: number;
  currency: string;
  category: string;
}

const mockEntries: CodingEntry[] = [
  { id: '1', invoiceNumber: 'INV-2024-001847', supplier: 'Acme Corporation', predictedGLCode: '6200-01', glName: 'Cloud & Hosting', confidence: 98.5, status: 'Auto-Coded', amount: 24500.00, currency: 'USD', category: 'Technology' },
  { id: '2', invoiceNumber: 'INV-2024-001846', supplier: 'GlobalTech Solutions', predictedGLCode: '6210-03', glName: 'Software Licenses', confidence: 87.2, status: 'Pending Review', amount: 18750.50, currency: 'EUR', category: 'Technology' },
  { id: '3', invoiceNumber: 'INV-2024-001845', supplier: 'Nordic Supplies AB', predictedGLCode: '5100-02', glName: 'Office Supplies', confidence: 92.1, status: 'Auto-Coded', amount: 93200.00, currency: 'SEK', category: 'Operations' },
  { id: '4', invoiceNumber: 'INV-2024-001844', supplier: 'Shanghai Electronics Co', predictedGLCode: '5200-01', glName: 'Raw Materials', confidence: 95.8, status: 'Auto-Coded', amount: 156200.00, currency: 'CNY', category: 'Manufacturing' },
  { id: '5', invoiceNumber: 'INV-2024-001843', supplier: 'Baxter Medical Ltd', predictedGLCode: '6400-05', glName: 'Medical Supplies', confidence: 34.5, status: 'Learning', amount: 7890.25, currency: 'GBP', category: 'Healthcare' },
  { id: '6', invoiceNumber: 'INV-2024-001842', supplier: 'MexiParts Industrial', predictedGLCode: '5200-03', glName: 'Machine Parts', confidence: 61.3, status: 'Overridden', amount: 456000.00, currency: 'MXN', category: 'Manufacturing' },
  { id: '7', invoiceNumber: 'INV-2024-001841', supplier: 'Tokyo Precision Inc', predictedGLCode: '5200-02', glName: 'Precision Components', confidence: 99.1, status: 'Auto-Coded', amount: 2340000, currency: 'JPY', category: 'Manufacturing' },
  { id: '8', invoiceNumber: 'INV-2024-001840', supplier: 'Rheinmetall Services', predictedGLCode: '6300-02', glName: 'Consulting Services', confidence: 88.7, status: 'Auto-Coded', amount: 33420.75, currency: 'EUR', category: 'Services' },
  { id: '9', invoiceNumber: 'INV-2024-001839', supplier: 'Atlas Freight Corp', predictedGLCode: '5400-01', glName: 'Freight & Shipping', confidence: 76.4, status: 'Pending Review', amount: 12890.00, currency: 'USD', category: 'Logistics' },
  { id: '10', invoiceNumber: 'INV-2024-001838', supplier: 'Sao Paulo Chemicals', predictedGLCode: '5200-04', glName: 'Chemical Supplies', confidence: 94.3, status: 'Auto-Coded', amount: 67500.00, currency: 'BRL', category: 'Manufacturing' },
  { id: '11', invoiceNumber: 'INV-2024-001837', supplier: 'CloudNet Services', predictedGLCode: '6200-01', glName: 'Cloud & Hosting', confidence: 99.8, status: 'Auto-Coded', amount: 4999.00, currency: 'USD', category: 'Technology' },
  { id: '12', invoiceNumber: 'INV-2024-001836', supplier: 'Mumbai Textiles Pvt', predictedGLCode: '5100-05', glName: 'Textiles & Fabrics', confidence: 82.6, status: 'Pending Review', amount: 890500.00, currency: 'INR', category: 'Manufacturing' },
  { id: '13', invoiceNumber: 'INV-2024-001835', supplier: 'EuroSteel GmbH', predictedGLCode: '5200-01', glName: 'Raw Materials', confidence: 91.4, status: 'Auto-Coded', amount: 28750.00, currency: 'EUR', category: 'Manufacturing' },
  { id: '14', invoiceNumber: 'INV-2024-001834', supplier: 'Pacific Rim Logistics', predictedGLCode: '5400-01', glName: 'Freight & Shipping', confidence: 96.7, status: 'Auto-Coded', amount: 15680.00, currency: 'SGD', category: 'Logistics' },
  { id: '15', invoiceNumber: 'INV-2024-001833', supplier: 'Canadian Lumber Co', predictedGLCode: '5200-06', glName: 'Building Materials', confidence: 55.8, status: 'Learning', amount: 31200.50, currency: 'CAD', category: 'Construction' },
  { id: '16', invoiceNumber: 'INV-2024-001832', supplier: 'Dubai Trading FZE', predictedGLCode: '5100-01', glName: 'General Supplies', confidence: 97.2, status: 'Auto-Coded', amount: 72300.00, currency: 'AED', category: 'Operations' },
  { id: '17', invoiceNumber: 'INV-2024-001831', supplier: 'Zurich Instruments AG', predictedGLCode: '6500-01', glName: 'Lab Equipment', confidence: 89.3, status: 'Overridden', amount: 45100.00, currency: 'CHF', category: 'R&D' },
  { id: '18', invoiceNumber: 'INV-2024-001830', supplier: 'Seoul Semiconductor', predictedGLCode: '5200-02', glName: 'Electronic Components', confidence: 93.6, status: 'Auto-Coded', amount: 28900000, currency: 'KRW', category: 'Manufacturing' },
];

const accuracyTrendData = [
  { month: 'Sep', accuracy: 91.2, modelVersion: null },
  { month: 'Oct', accuracy: 93.1, modelVersion: 'v2.1' },
  { month: 'Nov', accuracy: 94.8, modelVersion: null },
  { month: 'Dec', accuracy: 95.6, modelVersion: 'v2.2' },
  { month: 'Jan', accuracy: 96.5, modelVersion: null },
  { month: 'Feb', accuracy: 97.3, modelVersion: 'v2.3' },
];

interface VerticalData {
  name: string;
  status: 'Active' | 'Learning';
  patterns: { name: string; code: string }[];
  accuracy: number;
  samples: number;
}

const verticalData: VerticalData[] = [
  {
    name: 'Technology',
    status: 'Active',
    patterns: [
      { name: 'Cloud/Hosting', code: 'GL 6200-01' },
      { name: 'Software Licenses', code: '6210-03' },
      { name: 'SaaS Subscriptions', code: '6200-05' },
    ],
    accuracy: 98.2,
    samples: 4200,
  },
  {
    name: 'Manufacturing',
    status: 'Active',
    patterns: [
      { name: 'Raw Materials', code: '5200-01' },
      { name: 'Machine Parts', code: '5200-03' },
      { name: 'Electronic Components', code: '5200-02' },
    ],
    accuracy: 96.8,
    samples: 3800,
  },
  {
    name: 'Professional Services',
    status: 'Active',
    patterns: [
      { name: 'Consulting', code: '6300-02' },
      { name: 'Legal', code: '6300-04' },
      { name: 'Advisory', code: '6300-01' },
    ],
    accuracy: 94.2,
    samples: 1900,
  },
  {
    name: 'Healthcare',
    status: 'Learning',
    patterns: [
      { name: 'Medical Supplies', code: '6400-05' },
      { name: 'Pharma', code: '6400-01' },
      { name: 'Equipment', code: '6400-03' },
    ],
    accuracy: 91.5,
    samples: 850,
  },
  {
    name: 'Logistics',
    status: 'Active',
    patterns: [
      { name: 'Freight & Shipping', code: '5400-01' },
      { name: 'Warehousing', code: '5400-03' },
      { name: 'Customs', code: '5400-05' },
    ],
    accuracy: 97.5,
    samples: 2100,
  },
  {
    name: 'R&D',
    status: 'Learning',
    patterns: [
      { name: 'Lab Equipment', code: '6500-01' },
      { name: 'Research Materials', code: '6500-03' },
      { name: 'Patents', code: '6500-05' },
    ],
    accuracy: 89.3,
    samples: 620,
  },
];

interface OverridePattern {
  originalCode: string;
  correctedCode: string;
  frequency: number;
  patternLearned: string;
  modelUpdated: boolean;
  confidenceAfter: number;
}

const overridePatterns: OverridePattern[] = [
  { originalCode: '6200-01', correctedCode: '6200-05', frequency: 42, patternLearned: 'SaaS vs Hosting distinction', modelUpdated: true, confidenceAfter: 96.8 },
  { originalCode: '5200-01', correctedCode: '5200-03', frequency: 38, patternLearned: 'Parts vs Raw materials', modelUpdated: true, confidenceAfter: 95.2 },
  { originalCode: '6300-02', correctedCode: '6300-04', frequency: 31, patternLearned: 'Legal vs Consulting services', modelUpdated: true, confidenceAfter: 93.7 },
  { originalCode: '5400-01', correctedCode: '5400-03', frequency: 27, patternLearned: 'Warehousing vs Freight', modelUpdated: true, confidenceAfter: 97.1 },
  { originalCode: '5100-01', correctedCode: '5200-04', frequency: 19, patternLearned: 'Chemical supplies reclassification', modelUpdated: false, confidenceAfter: 88.4 },
  { originalCode: '6500-01', correctedCode: '6500-03', frequency: 14, patternLearned: 'Research materials vs Equipment', modelUpdated: false, confidenceAfter: 85.9 },
];

const feedbackCycleSteps = [
  { label: 'Invoice Arrives', icon: '1' },
  { label: 'ML Classifies', icon: '2' },
  { label: 'Human Reviews', icon: '3' },
  { label: 'Override (if needed)', icon: '4' },
  { label: 'Pattern Learned', icon: '5' },
  { label: 'Model Updated', icon: '6' },
  { label: 'Better Classification', icon: '7' },
];

const smartFlowRules = [
  { name: 'Technology Services Auto-Code', description: 'Auto-assign GL 6200-xx for known technology vendors with >90% confidence', hits: 1247, accuracy: '99.1%', active: true },
  { name: 'Raw Materials Classification', description: 'Map supplier categories to GL 5200-xx based on material type keywords', hits: 892, accuracy: '96.8%', active: true },
  { name: 'Logistics & Freight Routing', description: 'Route shipping invoices to GL 5400-01 based on supplier and description', hits: 634, accuracy: '97.5%', active: true },
  { name: 'Professional Services Detection', description: 'Identify consulting and services invoices for GL 6300-xx assignment', hits: 423, accuracy: '94.2%', active: true },
  { name: 'New Supplier Learning', description: 'Queue invoices from new suppliers for manual review and pattern learning', hits: 89, accuracy: '87.3%', active: false },
];

function getStatusClass(status: CodingStatus): string {
  const map: Record<CodingStatus, string> = {
    'Auto-Coded': styles.badgeAutoCoded,
    'Overridden': styles.badgeOverridden,
    'Pending Review': styles.badgePending,
    'Learning': styles.badgeLearning,
  };
  return map[status];
}

function getConfidenceClass(confidence: number): string {
  if (confidence >= 85) return styles.confidenceHigh;
  if (confidence >= 60) return styles.confidenceMedium;
  return styles.confidenceLow;
}

function getVerticalAccuracyColor(accuracy: number): string {
  if (accuracy >= 97) return '#23C343';
  if (accuracy >= 94) return '#165DFF';
  if (accuracy >= 90) return '#FF9A2E';
  return '#F76560';
}

export default function CodingPage() {
  const t = useT();
  const [ruleStates, setRuleStates] = useState(
    smartFlowRules.map((r) => r.active)
  );

  const toggleRule = (index: number) => {
    setRuleStates((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{t('coding.title')}</h1>
        <p>{t('coding.subtitle')}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('coding.autoCodedToday')}</div>
          <div className={styles.statValue}>412</div>
          <div className={`${styles.statChange} ${styles.statUp}`}>+8.3% from yesterday</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('coding.accuracyRate')}</div>
          <div className={styles.statValue}>97.3%</div>
          <div className={`${styles.statChange} ${styles.statUp}`}>+0.4% this week</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('coding.manualOverrides')}</div>
          <div className={styles.statValue}>14</div>
          <div className={`${styles.statChange} ${styles.statDown}`}>-3 from yesterday</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('coding.learningQueue')}</div>
          <div className={styles.statValue}>7</div>
          <div className={`${styles.statChange} ${styles.statNeutral}`}>New patterns detected</div>
        </div>
      </div>

      {/* Coding Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{t('coding.recentClassifications')}</span>
          <span style={{ fontSize: '0.75rem', color: '#86909C' }}>{mockEntries.length} entries</span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('coding.invoiceNumber')}</th>
              <th>{t('coding.supplier')}</th>
              <th>{t('coding.category')}</th>
              <th>{t('coding.predictedGLCode')}</th>
              <th>{t('coding.confidence')}</th>
              <th>{t('coding.status')}</th>
              <th>{t('coding.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {mockEntries.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <span className={styles.invoiceLink}>{entry.invoiceNumber}</span>
                </td>
                <td>{entry.supplier}</td>
                <td style={{ color: '#86909C', fontSize: '0.8125rem' }}>{entry.category}</td>
                <td>
                  <span className={styles.glCode}>{entry.predictedGLCode}</span>
                  <span className={styles.glName}>{entry.glName}</span>
                </td>
                <td>
                  <div className={styles.confidenceBar}>
                    <div className={styles.confidenceTrack}>
                      <div
                        className={`${styles.confidenceFill} ${getConfidenceClass(entry.confidence)}`}
                        style={{ width: `${entry.confidence}%` }}
                      />
                    </div>
                    <span className={styles.confidenceValue}>{entry.confidence}%</span>
                  </div>
                </td>
                <td>
                  <span className={getStatusClass(entry.status)}>{entry.status}</span>
                </td>
                <td>
                  <div className={styles.actionsCell}>
                    <button className={styles.actionBtn}>{t('common.review')}</button>
                    <button className={styles.actionBtn}>{t('common.override')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SmartFlow Rules */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{t('coding.smartFlowRules')}</span>
          <span style={{ fontSize: '0.75rem', color: '#86909C' }}>{smartFlowRules.length} rules configured</span>
        </div>
        <div className={styles.rulesSection}>
          <div className={styles.rulesList}>
            {smartFlowRules.map((rule, i) => (
              <div key={i} className={styles.ruleItem}>
                <div className={styles.ruleInfo}>
                  <span className={styles.ruleName}>{rule.name}</span>
                  <span className={styles.ruleDescription}>{rule.description}</span>
                </div>
                <div className={styles.ruleStats}>
                  <div className={styles.ruleStat}>
                    <span className={styles.ruleStatValue}>{rule.hits.toLocaleString()}</span>
                    <span className={styles.ruleStatLabel}>{t('coding.hits')}</span>
                  </div>
                  <div className={styles.ruleStat}>
                    <span className={styles.ruleStatValue}>{rule.accuracy}</span>
                    <span className={styles.ruleStatLabel}>{t('coding.accuracy')}</span>
                  </div>
                  <button
                    className={`${styles.ruleToggle} ${ruleStates[i] ? styles.ruleToggleOn : styles.ruleToggleOff}`}
                    onClick={() => toggleRule(i)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accuracy Trend Over Time */}
      <div className={styles.aiSection}>
        <div className={styles.aiSectionHeader}>
          <div className={styles.aiSectionTitleRow}>
            <span className={styles.aiSectionTitle}>Accuracy Trend Over Time</span>
            <span className={styles.aiBadge}>AI</span>
          </div>
          <span className={styles.aiSectionSubtitle}>Continuous Learning</span>
        </div>
        <div className={styles.aiSectionBody}>
          <div className={styles.trendChartWrapper}>
            <div className={styles.trendChart}>
              {accuracyTrendData.map((d, i) => (
                <div key={i} className={styles.trendBarCol}>
                  <span className={styles.trendBarValue}>{d.accuracy}%</span>
                  {d.modelVersion && (
                    <span className={styles.trendModelLabel}>{d.modelVersion}</span>
                  )}
                  <div className={styles.trendBarTrack}>
                    <div
                      className={styles.trendBarFill}
                      style={{ height: `${((d.accuracy - 88) / 12) * 100}%` }}
                    />
                  </div>
                  <span className={styles.trendBarMonth}>{d.month}</span>
                </div>
              ))}
            </div>
            <div className={styles.trendDelta}>
              <span className={styles.trendDeltaValue}>+6.1%</span>
              <span className={styles.trendDeltaLabel}>improvement over 6 months</span>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Vertical Intelligence */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Industry Vertical Intelligence</span>
          <span style={{ fontSize: '0.75rem', color: '#86909C' }}>{verticalData.length} verticals tracked</span>
        </div>
        <div className={styles.verticalsGrid}>
          {verticalData.map((v, i) => (
            <div key={i} className={styles.verticalCard}>
              <div className={styles.verticalCardHeader}>
                <span className={styles.verticalName}>{v.name}</span>
                <span className={v.status === 'Active' ? styles.verticalBadgeActive : styles.verticalBadgeLearning}>
                  {v.status}
                </span>
              </div>
              <div className={styles.verticalPatterns}>
                {v.patterns.map((p, j) => (
                  <div key={j} className={styles.verticalPatternRow}>
                    <span className={styles.verticalPatternName}>{p.name}</span>
                    <span className={styles.verticalPatternCode}>{p.code}</span>
                  </div>
                ))}
              </div>
              <div className={styles.verticalAccuracy}>
                <div className={styles.verticalAccuracyBar}>
                  <div
                    className={styles.verticalAccuracyFill}
                    style={{ width: `${v.accuracy}%`, background: getVerticalAccuracyColor(v.accuracy) }}
                  />
                </div>
                <span className={styles.verticalAccuracyValue} style={{ color: getVerticalAccuracyColor(v.accuracy) }}>
                  {v.accuracy}%
                </span>
              </div>
              <div className={styles.verticalSamples}>
                <span className={styles.verticalSamplesValue}>{v.samples.toLocaleString()}</span>
                <span className={styles.verticalSamplesLabel}>training samples</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Loop & Override Intelligence */}
      <div className={styles.aiSection}>
        <div className={styles.aiSectionHeader}>
          <div className={styles.aiSectionTitleRow}>
            <span className={styles.aiSectionTitle}>Feedback Loop &amp; Override Intelligence</span>
            <span className={styles.aiBadge}>AI</span>
          </div>
          <span className={styles.aiSectionSubtitle}>Adaptive Learning Pipeline</span>
        </div>
        <div className={styles.aiSectionBody}>
          {/* Feedback summary stats */}
          <div className={styles.feedbackStatsRow}>
            <div className={styles.feedbackStatCard}>
              <span className={styles.feedbackStatValue}>247</span>
              <span className={styles.feedbackStatLabel}>Total Overrides</span>
            </div>
            <div className={styles.feedbackStatCard}>
              <span className={styles.feedbackStatValue}>198</span>
              <span className={styles.feedbackStatLabel}>Patterns Learned</span>
            </div>
            <div className={styles.feedbackStatCard}>
              <span className={styles.feedbackStatValue}>12</span>
              <span className={styles.feedbackStatLabel}>Model Updates Triggered</span>
            </div>
            <div className={styles.feedbackStatCard}>
              <span className={styles.feedbackStatValue} style={{ color: '#23C343' }}>+4.1%</span>
              <span className={styles.feedbackStatLabel}>Accuracy Lift from Feedback</span>
            </div>
          </div>

          {/* Override patterns table */}
          <div className={styles.feedbackTableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Original Code</th>
                  <th>Corrected Code</th>
                  <th>Frequency</th>
                  <th>Pattern Learned</th>
                  <th>Model Updated</th>
                  <th>Confidence After</th>
                </tr>
              </thead>
              <tbody>
                {overridePatterns.map((op, i) => (
                  <tr key={i}>
                    <td><span className={styles.glCode}>{op.originalCode}</span></td>
                    <td><span className={styles.glCode}>{op.correctedCode}</span></td>
                    <td style={{ fontWeight: 600 }}>{op.frequency}</td>
                    <td style={{ fontSize: '0.8125rem', color: '#4E5969' }}>{op.patternLearned}</td>
                    <td>
                      <span className={op.modelUpdated ? styles.feedbackBadgeYes : styles.feedbackBadgeNo}>
                        {op.modelUpdated ? 'Yes' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.confidenceBar}>
                        <div className={styles.confidenceTrack}>
                          <div
                            className={`${styles.confidenceFill} ${getConfidenceClass(op.confidenceAfter)}`}
                            style={{ width: `${op.confidenceAfter}%` }}
                          />
                        </div>
                        <span className={styles.confidenceValue}>{op.confidenceAfter}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Feedback cycle visualization */}
          <div className={styles.feedbackCycle}>
            <span className={styles.feedbackCycleTitle}>Adaptive Feedback Cycle</span>
            <div className={styles.feedbackCycleSteps}>
              {feedbackCycleSteps.map((step, i) => (
                <div key={i} className={styles.feedbackCycleStep}>
                  <div className={styles.feedbackCycleIcon}>{step.icon}</div>
                  <span className={styles.feedbackCycleLabel}>{step.label}</span>
                  {i < feedbackCycleSteps.length - 1 && (
                    <div className={styles.feedbackCycleArrow}>
                      <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                        <path d="M14 1L19 6L14 11M1 6H19" stroke="#165DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
