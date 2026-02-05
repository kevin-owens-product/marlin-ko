'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './discounting.module.css';

const TABS = ['All', 'Offered', 'Accepted', 'Declined', 'Expired'] as const;

const discountOffers = [
  { supplier: 'Acme Corp', invoice: 'INV-9001', originalTerms: 'Net 60', rate: '2.0%', apy: '18.3%', daysAccel: 40, savings: '$1,240', status: 'Accepted' },
  { supplier: 'Global Logistics Inc', invoice: 'INV-9002', originalTerms: 'Net 45', rate: '1.5%', apy: '16.7%', daysAccel: 30, savings: '$3,420', status: 'Offered' },
  { supplier: 'TechParts Ltd', invoice: 'INV-9003', originalTerms: 'Net 30', rate: '1.0%', apy: '18.3%', daysAccel: 20, savings: '$890', status: 'Accepted' },
  { supplier: 'Pinnacle Consulting', invoice: 'INV-9004', originalTerms: 'Net 60', rate: '2.5%', apy: '20.8%', daysAccel: 45, savings: '$5,600', status: 'Declined' },
  { supplier: 'Metro Freight', invoice: 'INV-9005', originalTerms: 'Net 45', rate: '1.8%', apy: '19.2%', daysAccel: 35, savings: '$2,100', status: 'Accepted' },
  { supplier: 'CloudServ Pro', invoice: 'INV-9006', originalTerms: 'Net 30', rate: '0.8%', apy: '14.6%', daysAccel: 20, savings: '$640', status: 'Offered' },
  { supplier: 'DataFlow Systems', invoice: 'INV-9007', originalTerms: 'Net 60', rate: '2.2%', apy: '17.1%', daysAccel: 45, savings: '$4,200', status: 'Expired' },
  { supplier: 'EuroParts GmbH', invoice: 'INV-9008', originalTerms: 'Net 45', rate: '1.6%', apy: '17.8%', daysAccel: 30, savings: '$1,850', status: 'Accepted' },
  { supplier: 'Summit Marketing', invoice: 'INV-9009', originalTerms: 'Net 30', rate: '1.2%', apy: '21.9%', daysAccel: 20, savings: '$720', status: 'Offered' },
  { supplier: 'NorthStar Logistics', invoice: 'INV-9010', originalTerms: 'Net 60', rate: '2.0%', apy: '16.4%', daysAccel: 45, savings: '$6,300', status: 'Accepted' },
  { supplier: 'ByteWare Solutions', invoice: 'INV-9011', originalTerms: 'Net 45', rate: '1.4%', apy: '15.6%', daysAccel: 30, savings: '$980', status: 'Declined' },
  { supplier: 'Precision Tools Inc', invoice: 'INV-9012', originalTerms: 'Net 60', rate: '2.3%', apy: '19.5%', daysAccel: 40, savings: '$3,750', status: 'Offered' },
  { supplier: 'GreenEnergy Solutions', invoice: 'INV-9013', originalTerms: 'Net 30', rate: '0.9%', apy: '16.4%', daysAccel: 20, savings: '$1,100', status: 'Accepted' },
  { supplier: 'Pacific Imports', invoice: 'INV-9014', originalTerms: 'Net 45', rate: '1.7%', apy: '18.9%', daysAccel: 30, savings: '$2,800', status: 'Expired' },
  { supplier: 'ClearView Analytics', invoice: 'INV-9015', originalTerms: 'Net 60', rate: '2.1%', apy: '17.5%', daysAccel: 45, savings: '$1,560', status: 'Offered' },
];

const slidingScaleData = [
  { daysEarly: 5, rate: 0.3, apy: 21.9 },
  { daysEarly: 10, rate: 0.5, apy: 18.3 },
  { daysEarly: 15, rate: 0.8, apy: 19.5 },
  { daysEarly: 20, rate: 1.0, apy: 18.3 },
  { daysEarly: 25, rate: 1.3, apy: 19.0 },
  { daysEarly: 30, rate: 1.5, apy: 18.3 },
  { daysEarly: 35, rate: 1.8, apy: 18.8 },
  { daysEarly: 40, rate: 2.0, apy: 18.3 },
  { daysEarly: 45, rate: 2.3, apy: 18.7 },
  { daysEarly: 50, rate: 2.5, apy: 18.3 },
  { daysEarly: 55, rate: 2.8, apy: 18.6 },
  { daysEarly: 60, rate: 3.0, apy: 18.3 },
];

const maxRate = Math.max(...slidingScaleData.map((d) => d.rate));
const maxApy = Math.max(...slidingScaleData.map((d) => d.apy));

const supplierEnrollment = [
  { name: 'Acme Corp', status: 'Enrolled', acceptance: '92%', totalSavings: '$18,400', offersReceived: 24, offersAccepted: 22 },
  { name: 'Global Logistics Inc', status: 'Enrolled', acceptance: '85%', totalSavings: '$34,200', offersReceived: 20, offersAccepted: 17 },
  { name: 'TechParts Ltd', status: 'Enrolled', acceptance: '78%', totalSavings: '$12,600', offersReceived: 18, offersAccepted: 14 },
  { name: 'Pinnacle Consulting', status: 'Invited', acceptance: '0%', totalSavings: '$0', offersReceived: 3, offersAccepted: 0 },
  { name: 'Metro Freight', status: 'Enrolled', acceptance: '88%', totalSavings: '$22,100', offersReceived: 16, offersAccepted: 14 },
  { name: 'CloudServ Pro', status: 'Enrolled', acceptance: '95%', totalSavings: '$8,900', offersReceived: 22, offersAccepted: 21 },
  { name: 'DataFlow Systems', status: 'Enrolled', acceptance: '72%', totalSavings: '$15,300', offersReceived: 25, offersAccepted: 18 },
  { name: 'EuroParts GmbH', status: 'Enrolled', acceptance: '80%', totalSavings: '$28,700', offersReceived: 15, offersAccepted: 12 },
  { name: 'Summit Marketing', status: 'Pending', acceptance: '0%', totalSavings: '$0', offersReceived: 0, offersAccepted: 0 },
  { name: 'NorthStar Logistics', status: 'Enrolled', acceptance: '91%', totalSavings: '$42,500', offersReceived: 22, offersAccepted: 20 },
  { name: 'ByteWare Solutions', status: 'Enrolled', acceptance: '65%', totalSavings: '$6,200', offersReceived: 20, offersAccepted: 13 },
  { name: 'Precision Tools Inc', status: 'Invited', acceptance: '0%', totalSavings: '$0', offersReceived: 5, offersAccepted: 0 },
  { name: 'GreenEnergy Solutions', status: 'Enrolled', acceptance: '83%', totalSavings: '$11,800', offersReceived: 12, offersAccepted: 10 },
  { name: 'Pacific Imports', status: 'Enrolled', acceptance: '76%', totalSavings: '$19,400', offersReceived: 17, offersAccepted: 13 },
  { name: 'ClearView Analytics', status: 'Enrolled', acceptance: '89%', totalSavings: '$9,500', offersReceived: 9, offersAccepted: 8 },
  { name: 'Atlas Manufacturing', status: 'Enrolled', acceptance: '94%', totalSavings: '$56,200', offersReceived: 32, offersAccepted: 30 },
  { name: 'CoreTech Industries', status: 'Enrolled', acceptance: '87%', totalSavings: '$31,600', offersReceived: 23, offersAccepted: 20 },
  { name: 'Henderson Legal', status: 'Pending', acceptance: '0%', totalSavings: '$0', offersReceived: 0, offersAccepted: 0 },
  { name: 'BlueWave Media', status: 'Enrolled', acceptance: '71%', totalSavings: '$4,300', offersReceived: 14, offersAccepted: 10 },
  { name: 'Silverline Distributors', status: 'Enrolled', acceptance: '82%', totalSavings: '$24,800', offersReceived: 28, offersAccepted: 23 },
];

const monthlyCapture = [
  { month: 'Aug', captured: 98 },
  { month: 'Sep', captured: 112 },
  { month: 'Oct', captured: 128 },
  { month: 'Nov', captured: 134 },
  { month: 'Dec', captured: 148 },
  { month: 'Jan', captured: 156 },
];

/* ─── Program ROI Monthly Trend Data ─── */
const roiTrendData = [
  { month: 'Aug', roi: 1.4 },
  { month: 'Sep', roi: 1.6 },
  { month: 'Oct', roi: 1.8 },
  { month: 'Nov', roi: 2.0 },
  { month: 'Dec', roi: 2.1 },
  { month: 'Jan', roi: 2.3 },
];

const maxRoi = Math.max(...roiTrendData.map((d) => d.roi));

const maxCapture = Math.max(...monthlyCapture.map((m) => m.captured));

function getOfferBadgeClass(status: string) {
  const map: Record<string, string> = {
    Offered: styles.badgeOffered,
    Accepted: styles.badgeAccepted,
    Declined: styles.badgeDeclined,
    Expired: styles.badgeExpired,
  };
  return `${styles.badge} ${map[status] || ''}`;
}

function getEnrollBadgeClass(status: string) {
  const map: Record<string, string> = {
    Enrolled: styles.badgeEnrolled,
    Pending: styles.badgePending,
    Invited: styles.badgeInvited,
  };
  return `${styles.badge} ${map[status] || ''}`;
}

export default function DiscountingPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<string>('All');

  const filtered =
    activeTab === 'All'
      ? discountOffers
      : discountOffers.filter((o) => o.status === activeTab);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t('discounting.title')}</h1>
          <p>{t('discounting.subtitle')}</p>
        </div>
        <button className={styles.createBtn}>+ New Discount Offer</button>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('discounting.captured')}</div>
          <div className={styles.kpiValue}>$156K</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>+18.4% vs last month</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('discounting.supplierEnrollment')}</div>
          <div className={styles.kpiValue}>34%</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>+6 suppliers this month</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('discounting.avgDiscount')}</div>
          <div className={styles.kpiValue}>18.2%</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>Above 15% target</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('discounting.activeDiscounts')}</div>
          <div className={styles.kpiValue}>12</div>
          <div className={`${styles.kpiSub} ${styles.kpiNeutral}`}>3 pending activation</div>
        </div>
      </div>

      {/* Budget Section */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Monthly Discount Budget</div>
        <div className={styles.budgetSection}>
          <div className={styles.budgetHeader}>
            <span className={styles.budgetLabel}>January 2026 Budget Utilization</span>
            <span className={styles.budgetValue}>$156K / $200K</span>
          </div>
          <div className={styles.progressBarWrap}>
            <div className={styles.progressBar} style={{ width: '78%' }} />
            <span className={styles.progressText}>78%</span>
          </div>
          <div className={styles.budgetDetails}>
            <div className={styles.budgetDetail}>
              <span className={styles.budgetDetailLabel}>Monthly Budget</span>
              <span className={styles.budgetDetailValue}>$200,000</span>
            </div>
            <div className={styles.budgetDetail}>
              <span className={styles.budgetDetailLabel}>Used</span>
              <span className={`${styles.budgetDetailValue} ${styles.budgetDetailGreen}`}>$156,000</span>
            </div>
            <div className={styles.budgetDetail}>
              <span className={styles.budgetDetailLabel}>Remaining</span>
              <span className={`${styles.budgetDetailValue} ${styles.budgetDetailAmber}`}>$44,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Scale Visualization */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Discount Rate vs Days Early (Sliding Scale)</div>
        <div className={styles.sectionSubtitle}>Shows how discount rate and annualized return vary by payment acceleration</div>
        <div className={styles.slidingScale}>
          {slidingScaleData.map((d) => (
            <div key={d.daysEarly} className={styles.scaleCol}>
              <div className={styles.scaleValue}>{d.rate}%</div>
              <div
                className={`${styles.scaleBar} ${styles.scaleBarRate}`}
                style={{ height: `${(d.rate / maxRate) * 140}px` }}
                title={`Rate: ${d.rate}%`}
              />
              <div className={styles.scaleLabel}>{d.daysEarly}d</div>
            </div>
          ))}
        </div>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotRate}`} />
            Discount Rate
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotApy}`} />
            Annualized APY
          </div>
        </div>
      </div>

      {/* Active Discount Offers */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Active Discount Offers</div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('discounting.supplierName')}</th>
                <th>{t('discounting.invoiceNumber')}</th>
                <th>{t('discounting.originalDue')}</th>
                <th>{t('discounting.discountRate')}</th>
                <th>APY</th>
                <th>Days Accelerated</th>
                <th>{t('discounting.savingsAmount')}</th>
                <th>{t('discounting.status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.invoice}>
                  <td>{o.supplier}</td>
                  <td>{o.invoice}</td>
                  <td>{o.originalTerms}</td>
                  <td>{o.rate}</td>
                  <td>{o.apy}</td>
                  <td>{o.daysAccel}</td>
                  <td className={styles.savingsValue}>{o.savings}</td>
                  <td><span className={getOfferBadgeClass(o.status)}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.twoCol}>
        {/* Supplier Enrollment */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('discounting.supplierEnrollment')}</div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('discounting.supplierName')}</th>
                  <th>{t('discounting.status')}</th>
                  <th>Acceptance Rate</th>
                  <th>{t('discounting.savingsAmount')}</th>
                </tr>
              </thead>
              <tbody>
                {supplierEnrollment.map((s) => (
                  <tr key={s.name}>
                    <td>{s.name}</td>
                    <td><span className={getEnrollBadgeClass(s.status)}>{s.status}</span></td>
                    <td>
                      <span className={styles.acceptRate}>
                        <span className={styles.acceptRateValue}>{s.acceptance}</span>
                        {' '}({s.offersAccepted}/{s.offersReceived})
                      </span>
                    </td>
                    <td className={styles.savingsValue}>{s.totalSavings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROI Dashboard */}
        <div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>{t('discounting.roi')}</div>
            <div className={styles.roiGrid}>
              <div className={styles.roiCard}>
                <div className={`${styles.roiValue} ${styles.roiGreen}`}>$776K</div>
                <div className={styles.roiLabel}>{t('discounting.totalSavings')}</div>
              </div>
              <div className={styles.roiCard}>
                <div className={`${styles.roiValue} ${styles.roiBlue}`}>83%</div>
                <div className={styles.roiLabel}>Participation Rate</div>
              </div>
              <div className={styles.roiCard}>
                <div className={`${styles.roiValue} ${styles.roiAmber}`}>$800K</div>
                <div className={styles.roiLabel}>Annual Target</div>
              </div>
            </div>
          </div>

          {/* Monthly Discount Capture Trend */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Monthly Discount Capture Trend</div>
            <div className={styles.chartArea}>
              {monthlyCapture.map((m) => (
                <div key={m.month} className={styles.chartCol}>
                  <div className={styles.chartValue}>${m.captured}K</div>
                  <div
                    className={`${styles.chartBar} ${styles.chartBarGreen}`}
                    style={{ height: `${(m.captured / maxCapture) * 140}px` }}
                    title={`$${m.captured}K`}
                  />
                  <span className={styles.chartLabel}>{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Program ROI Dashboard ─── */}
      <div className={styles.roiDashboard}>
        <div className={styles.roiDashboardHeader}>
          <div className={styles.roiDashboardTitle}>Program ROI Dashboard</div>
          <span className={styles.roiScaleBadge}>Scale Phase — From 20 pilot suppliers to 200+ target</span>
        </div>

        <div className={styles.roiHeroRow}>
          <div className={styles.roiHeroCardPrimary}>
            <div className={styles.roiHeroMetric}>2.3x</div>
            <div className={styles.roiHeroLabel}>Program ROI</div>
            <div className={styles.roiHeroSub}>$776K benefit on $337K program investment</div>
          </div>
          <div className={styles.roiHeroCard}>
            <div className={styles.roiHeroMetricGreen}>4.2%</div>
            <div className={styles.roiHeroLabel}>Avg Discount Capture Rate</div>
            <div className={styles.roiHeroSub}>Dynamic discounting pilot metric</div>
          </div>
          <div className={styles.roiHeroCard}>
            <div className={styles.roiHeroMetric}>$776K</div>
            <div className={styles.roiHeroLabel}>Total Program Benefit</div>
            <div className={styles.roiHeroSub}>Annualized from 20 enrolled suppliers</div>
          </div>
        </div>

        <div className={styles.roiTrendSection}>
          <div className={styles.roiTrendTitle}>Monthly ROI Trend (Improving as Program Scales)</div>
          <div className={styles.roiTrendChart}>
            {roiTrendData.map((d) => (
              <div key={d.month} className={styles.roiTrendCol}>
                <div className={styles.roiTrendValue}>{d.roi}x</div>
                <div
                  className={styles.roiTrendBar}
                  style={{ height: `${(d.roi / maxRoi) * 120}px` }}
                  title={`${d.roi}x ROI`}
                />
                <span className={styles.roiTrendLabel}>{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Pilot to Scale Narrative ─── */}
      <div className={styles.pilotScaleSection}>
        <div className={styles.pilotScaleTitle}>Pilot to Scale Narrative</div>
        <div className={styles.pilotScaleSubtitle}>Dynamic discounting program progression from initial pilot through full-scale deployment</div>

        <div className={styles.pilotTimeline}>
          <div className={styles.pilotTimelineConnector} />

          {/* Phase 1 - Pilot (Completed) */}
          <div className={styles.pilotPhaseCard}>
            <div className={`${styles.pilotPhaseDot} ${styles.pilotPhaseDotCompleted}`}>1</div>
            <div className={styles.pilotPhaseLabel}>Phase 1</div>
            <div className={styles.pilotPhaseName}>Pilot</div>
            <div className={styles.pilotPhaseMetrics}>
              <div className={styles.pilotMetricRow}>
                <span className={styles.pilotMetricLabel}>Suppliers</span>
                <span className={styles.pilotMetricValue}>5</span>
              </div>
              <div className={styles.pilotMetricRow}>
                <span className={styles.pilotMetricLabel}>Capture Rate</span>
                <span className={styles.pilotMetricValueGreen}>2.1%</span>
              </div>
              <div className={styles.pilotMetricRow}>
                <span className={styles.pilotMetricLabel}>ROI</span>
                <span className={styles.pilotMetricValueBlue}>1.4x</span>
              </div>
            </div>
            <span className={`${styles.pilotPhaseBadge} ${styles.pilotBadgeCompleted}`}>Completed</span>
          </div>

          {/* Phase 2 - Expansion (Current) */}
          <div className={styles.pilotPhaseCardActive}>
            <div className={`${styles.pilotPhaseDot} ${styles.pilotPhaseDotActive}`}>2</div>
            <div className={styles.pilotPhaseLabel}>Phase 2</div>
            <div className={styles.pilotPhaseName}>Expansion</div>
            <div className={styles.pilotPhaseMetrics}>
              <div className={styles.pilotMetricRow}>
                <span className={styles.pilotMetricLabel}>Suppliers</span>
                <span className={styles.pilotMetricValue}>20</span>
              </div>
              <div className={styles.pilotMetricRow}>
                <span className={styles.pilotMetricLabel}>Capture Rate</span>
                <span className={styles.pilotMetricValueGreen}>4.2%</span>
              </div>
              <div className={styles.pilotMetricRow}>
                <span className={styles.pilotMetricLabel}>ROI</span>
                <span className={styles.pilotMetricValueBlue}>2.3x</span>
              </div>
            </div>
            <span className={`${styles.pilotPhaseBadge} ${styles.pilotBadgeCurrent}`}>Current</span>
          </div>

          {/* Phase 3 - Scale (Target) */}
          <div className={styles.pilotPhaseCardProjected}>
            <div className={`${styles.pilotPhaseDot} ${styles.pilotPhaseDotTarget}`}>3</div>
            <div className={styles.pilotPhaseLabel}>Phase 3</div>
            <div className={styles.pilotPhaseName}>Scale (Target)</div>
            <div className={styles.pilotPhaseMetrics}>
              <div className={styles.pilotMetricRow}>
                <span className={styles.pilotMetricLabel}>Suppliers</span>
                <span className={styles.pilotMetricValue}>200+</span>
              </div>
              <div className={styles.pilotMetricRow}>
                <span className={styles.pilotMetricLabel}>Capture Rate</span>
                <span className={styles.pilotMetricValueGreen}>5.5% proj.</span>
              </div>
              <div className={styles.pilotMetricRow}>
                <span className={styles.pilotMetricLabel}>ROI</span>
                <span className={styles.pilotMetricValueBlue}>3.1x proj.</span>
              </div>
            </div>
            <span className={`${styles.pilotPhaseBadge} ${styles.pilotBadgeTarget}`}>Projected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
