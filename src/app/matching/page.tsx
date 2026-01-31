'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './matching.module.css';

type MatchStatus = 'Auto-Matched' | 'Exception' | 'Manual Review' | 'Tolerance Breach' | 'Pending';
type MatchType = '2-Way' | '3-Way' | 'Contract' | 'No PO';

interface MatchEntry {
  id: string;
  invoiceNumber: string;
  supplier: string;
  poNumber: string;
  matchType: MatchType;
  invoiceAmount: number;
  poAmount: number;
  variance: number;
  variancePercent: number;
  currency: string;
  status: MatchStatus;
  exceptionReason?: string;
}

const mockEntries: MatchEntry[] = [
  { id: '1', invoiceNumber: 'INV-2024-001847', supplier: 'Acme Corporation', poNumber: 'PO-2024-003421', matchType: '3-Way', invoiceAmount: 24500.00, poAmount: 24500.00, variance: 0.00, variancePercent: 0.0, currency: 'USD', status: 'Auto-Matched' },
  { id: '2', invoiceNumber: 'INV-2024-001846', supplier: 'GlobalTech Solutions', poNumber: 'PO-2024-003389', matchType: '2-Way', invoiceAmount: 18750.50, poAmount: 18500.00, variance: 250.50, variancePercent: 1.35, currency: 'EUR', status: 'Auto-Matched' },
  { id: '3', invoiceNumber: 'INV-2024-001845', supplier: 'Nordic Supplies AB', poNumber: 'PO-2024-003412', matchType: '3-Way', invoiceAmount: 93200.00, poAmount: 92800.00, variance: 400.00, variancePercent: 0.43, currency: 'SEK', status: 'Auto-Matched' },
  { id: '4', invoiceNumber: 'INV-2024-001844', supplier: 'Shanghai Electronics Co', poNumber: 'PO-2024-003398', matchType: '3-Way', invoiceAmount: 156200.00, poAmount: 155000.00, variance: 1200.00, variancePercent: 0.77, currency: 'CNY', status: 'Auto-Matched' },
  { id: '5', invoiceNumber: 'INV-2024-001843', supplier: 'Baxter Medical Ltd', poNumber: 'PO-2024-003345', matchType: '3-Way', invoiceAmount: 7890.25, poAmount: 6500.00, variance: 1390.25, variancePercent: 21.39, currency: 'GBP', status: 'Exception', exceptionReason: 'Amount exceeds PO by 21.4% (threshold: 5%)' },
  { id: '6', invoiceNumber: 'INV-2024-001842', supplier: 'MexiParts Industrial', poNumber: 'PO-2024-003401', matchType: '2-Way', invoiceAmount: 456000.00, poAmount: 450000.00, variance: 6000.00, variancePercent: 1.33, currency: 'MXN', status: 'Manual Review', exceptionReason: 'First invoice from this supplier' },
  { id: '7', invoiceNumber: 'INV-2024-001841', supplier: 'Tokyo Precision Inc', poNumber: 'PO-2024-003410', matchType: '3-Way', invoiceAmount: 2340000, poAmount: 2340000, variance: 0.00, variancePercent: 0.0, currency: 'JPY', status: 'Auto-Matched' },
  { id: '8', invoiceNumber: 'INV-2024-001840', supplier: 'Rheinmetall Services', poNumber: 'PO-2024-003378', matchType: 'Contract', invoiceAmount: 33420.75, poAmount: 33000.00, variance: 420.75, variancePercent: 1.28, currency: 'EUR', status: 'Auto-Matched' },
  { id: '9', invoiceNumber: 'INV-2024-001839', supplier: 'Atlas Freight Corp', poNumber: 'PO-2024-003415', matchType: '2-Way', invoiceAmount: 12890.00, poAmount: 11500.00, variance: 1390.00, variancePercent: 12.09, currency: 'USD', status: 'Exception', exceptionReason: 'Amount variance 12.1% exceeds 5% threshold' },
  { id: '10', invoiceNumber: 'INV-2024-001838', supplier: 'Sao Paulo Chemicals', poNumber: 'PO-2024-003392', matchType: '3-Way', invoiceAmount: 67500.00, poAmount: 67500.00, variance: 0.00, variancePercent: 0.0, currency: 'BRL', status: 'Auto-Matched' },
  { id: '11', invoiceNumber: 'INV-2024-001837', supplier: 'CloudNet Services', poNumber: 'PO-2024-003420', matchType: 'Contract', invoiceAmount: 4999.00, poAmount: 4999.00, variance: 0.00, variancePercent: 0.0, currency: 'USD', status: 'Auto-Matched' },
  { id: '12', invoiceNumber: 'INV-2024-001836', supplier: 'Mumbai Textiles Pvt', poNumber: 'PO-2024-003380', matchType: '3-Way', invoiceAmount: 890500.00, poAmount: 875000.00, variance: 15500.00, variancePercent: 1.77, currency: 'INR', status: 'Auto-Matched' },
  { id: '13', invoiceNumber: 'INV-2024-001835', supplier: 'EuroSteel GmbH', poNumber: 'PO-2024-003405', matchType: '3-Way', invoiceAmount: 28750.00, poAmount: 28000.00, variance: 750.00, variancePercent: 2.68, currency: 'EUR', status: 'Tolerance Breach', exceptionReason: 'Variance 2.68% within soft limit (2-5%)' },
  { id: '14', invoiceNumber: 'INV-2024-001834', supplier: 'Pacific Rim Logistics', poNumber: 'PO-2024-003418', matchType: '2-Way', invoiceAmount: 15680.00, poAmount: 15680.00, variance: 0.00, variancePercent: 0.0, currency: 'SGD', status: 'Auto-Matched' },
  { id: '15', invoiceNumber: 'INV-2024-001833', supplier: 'Canadian Lumber Co', poNumber: '--', matchType: 'No PO', invoiceAmount: 31200.50, poAmount: 0, variance: 31200.50, variancePercent: 100, currency: 'CAD', status: 'Exception', exceptionReason: 'No matching purchase order found' },
  { id: '16', invoiceNumber: 'INV-2024-001832', supplier: 'Dubai Trading FZE', poNumber: 'PO-2024-003399', matchType: '3-Way', invoiceAmount: 72300.00, poAmount: 72300.00, variance: 0.00, variancePercent: 0.0, currency: 'AED', status: 'Auto-Matched' },
  { id: '17', invoiceNumber: 'INV-2024-001831', supplier: 'Zurich Instruments AG', poNumber: 'PO-2024-003390', matchType: '3-Way', invoiceAmount: 45100.00, poAmount: 44000.00, variance: 1100.00, variancePercent: 2.50, currency: 'CHF', status: 'Tolerance Breach', exceptionReason: 'Variance 2.5% within soft limit (2-5%)' },
  { id: '18', invoiceNumber: 'INV-2024-001830', supplier: 'Seoul Semiconductor', poNumber: 'PO-2024-003408', matchType: '3-Way', invoiceAmount: 28900000, poAmount: 28900000, variance: 0.00, variancePercent: 0.0, currency: 'KRW', status: 'Auto-Matched' },
  { id: '19', invoiceNumber: 'INV-2024-001829', supplier: 'Outback Mining Supply', poNumber: 'PO-2024-003416', matchType: '2-Way', invoiceAmount: 19870.00, poAmount: 19870.00, variance: 0.00, variancePercent: 0.0, currency: 'AUD', status: 'Auto-Matched' },
  { id: '20', invoiceNumber: 'INV-2024-001828', supplier: 'Warsaw Packaging Sp', poNumber: 'PO-2024-003375', matchType: '3-Way', invoiceAmount: 14200.00, poAmount: 10500.00, variance: 3700.00, variancePercent: 35.24, currency: 'PLN', status: 'Exception', exceptionReason: 'Duplicate invoice detected - same amount, supplier, and date' },
  { id: '21', invoiceNumber: 'INV-2024-001827', supplier: 'Amsterdam BioTech BV', poNumber: 'PO-2024-003403', matchType: '3-Way', invoiceAmount: 52600.00, poAmount: 52600.00, variance: 0.00, variancePercent: 0.0, currency: 'EUR', status: 'Auto-Matched' },
  { id: '22', invoiceNumber: 'INV-2024-001826', supplier: 'TechnoVolt Inc', poNumber: 'PO-2024-003419', matchType: '2-Way', invoiceAmount: 8750.00, poAmount: 8500.00, variance: 250.00, variancePercent: 2.94, currency: 'USD', status: 'Tolerance Breach', exceptionReason: 'Variance 2.94% within soft limit (2-5%)' },
  { id: '23', invoiceNumber: 'INV-2024-001825', supplier: 'Istanbul Ceramics AS', poNumber: 'PO-2024-003395', matchType: '3-Way', invoiceAmount: 234000.00, poAmount: 230000.00, variance: 4000.00, variancePercent: 1.74, currency: 'TRY', status: 'Auto-Matched' },
  { id: '24', invoiceNumber: 'INV-2024-001824', supplier: 'Oslo Maritime Services', poNumber: 'PO-2024-003411', matchType: 'Contract', invoiceAmount: 68400.00, poAmount: 68400.00, variance: 0.00, variancePercent: 0.0, currency: 'NOK', status: 'Auto-Matched' },
  { id: '25', invoiceNumber: 'INV-2024-001823', supplier: 'Buenos Aires Leather', poNumber: '--', matchType: 'No PO', invoiceAmount: 3450000.00, poAmount: 0, variance: 3450000.00, variancePercent: 100, currency: 'ARS', status: 'Manual Review', exceptionReason: 'No PO found, requires manual PO assignment' },
];

const filterTabs = ['All', 'Auto-Matched', 'Exceptions', 'Manual Review'] as const;

function getStatusClass(status: MatchStatus): string {
  const map: Record<MatchStatus, string> = {
    'Auto-Matched': styles.badgeMatched,
    'Exception': styles.badgeException,
    'Manual Review': styles.badgeManualReview,
    'Tolerance Breach': styles.badgeTolerance,
    'Pending': styles.badgePending,
  };
  return map[status];
}

function getMatchTypeClass(type: MatchType): string {
  const map: Record<MatchType, string> = {
    '2-Way': styles.matchType2Way,
    '3-Way': styles.matchType3Way,
    'Contract': styles.matchTypeContract,
    'No PO': styles.matchTypeNone,
  };
  return map[type];
}

function getVarianceClass(percent: number): string {
  if (percent === 0) return styles.varianceZero;
  if (percent > 5) return styles.varianceNegative;
  if (percent > 2) return styles.varianceWarning;
  return styles.variancePositive;
}

function formatCurrency(amount: number, currency: string): string {
  const noDecimals = ['JPY', 'KRW'];
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: noDecimals.includes(currency) ? 0 : 2,
    maximumFractionDigits: noDecimals.includes(currency) ? 0 : 2,
  }).format(amount);
}

export default function MatchingPage() {
  const t = useT();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filteredEntries = mockEntries.filter((entry) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Auto-Matched') return entry.status === 'Auto-Matched';
    if (activeFilter === 'Exceptions') return entry.status === 'Exception' || entry.status === 'Tolerance Breach';
    if (activeFilter === 'Manual Review') return entry.status === 'Manual Review';
    return true;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{t('matching.title')}</h1>
        <p>{t('matching.subtitle')}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('matching.matchedToday')}</div>
          <div className={styles.statValue}>287</div>
          <div className={`${styles.statChange} ${styles.statUp}`}>+15.2% from yesterday</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('matching.matchRate')}</div>
          <div className={styles.statValue}>94.2%</div>
          <div className={`${styles.statChange} ${styles.statUp}`}>+1.1% this week</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('matching.exceptions')}</div>
          <div className={styles.statValue}>17</div>
          <div className={`${styles.statChange} ${styles.statDown}`}>+4 since yesterday</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('matching.toleranceBreaches')}</div>
          <div className={styles.statValue}>3</div>
          <div className={`${styles.statChange} ${styles.statNeutral}`}>Within soft limits</div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filterTabs}>
          {filterTabs.map((tab) => {
            const tabLabels: Record<string, string> = {
              All: t('matching.all'),
              'Auto-Matched': t('matching.autoMatched'),
              Exceptions: t('matching.exceptionsTab'),
              'Manual Review': t('matching.manualReview'),
            };
            return (
              <button
                key={tab}
                className={activeFilter === tab ? styles.filterTabActive : styles.filterTab}
                onClick={() => setActiveFilter(tab)}
              >
                {tabLabels[tab] || tab}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{t('matching.matchResults')}</span>
          <span style={{ fontSize: '0.75rem', color: '#86909C' }}>{filteredEntries.length} entries</span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('matching.invoiceNumber')}</th>
              <th>{t('matching.supplier')}</th>
              <th>{t('matching.poNumber')}</th>
              <th>{t('matching.matchType')}</th>
              <th>{t('matching.invoiceAmt')}</th>
              <th>{t('matching.poAmt')}</th>
              <th>{t('matching.variance')}</th>
              <th>{t('matching.status')}</th>
              <th>{t('matching.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <span className={styles.invoiceLink}>{entry.invoiceNumber}</span>
                </td>
                <td>{entry.supplier}</td>
                <td>
                  <span className={styles.poNumber}>{entry.poNumber}</span>
                </td>
                <td>
                  <span className={getMatchTypeClass(entry.matchType)}>{entry.matchType}</span>
                </td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(entry.invoiceAmount, entry.currency)} <span style={{ color: '#4E5969', fontSize: '0.75rem' }}>{entry.currency}</span>
                </td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {entry.poAmount > 0 ? formatCurrency(entry.poAmount, entry.currency) : '--'}
                </td>
                <td>
                  <div>
                    <span className={getVarianceClass(entry.variancePercent)}>
                      {entry.matchType === 'No PO' ? t('matching.na') :
                        entry.variance === 0 ? t('matching.exact') :
                        `${entry.variancePercent > 0 ? '+' : ''}${entry.variancePercent.toFixed(2)}%`}
                    </span>
                    {entry.exceptionReason && (
                      <div className={styles.exceptionDetails}>{entry.exceptionReason}</div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={getStatusClass(entry.status)}>{entry.status}</span>
                </td>
                <td>
                  <div className={styles.actionsCell}>
                    <button className={styles.actionBtn}>{t('common.view')}</button>
                    {(entry.status === 'Exception' || entry.status === 'Manual Review' || entry.status === 'Tolerance Breach') && (
                      <>
                        <button className={styles.btnApproveSmall}>{t('common.approve')}</button>
                        <button className={styles.btnRejectSmall}>{t('common.reject')}</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {filteredEntries.length} of {mockEntries.length} matches
          </div>
        </div>
      </div>
    </div>
  );
}
