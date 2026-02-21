'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './scf.module.css';

/* ───────── Types ───────── */

type TransactionStatus = 'Completed' | 'Pending' | 'Processing';

interface EligibleInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  daysToMaturity: number;
  discountRate: string;
  earlyPayAmount: number;
}

interface SCFTransaction {
  id: string;
  invoiceNumber: string;
  originalAmount: number;
  earlyPayAmount: number;
  discount: number;
  requestDate: string;
  paidDate: string;
  status: TransactionStatus;
}

/* ───────── Mock Data ───────── */

const isEnrolled = true;

const programData = {
  creditLine: 500000,
  utilized: 135000,
  available: 365000,
  rateRange: '1.2% - 2.8%',
  enrolledSince: 'Sep 2024',
};

const eligibleInvoices: EligibleInvoice[] = [
  { id: 'ei-1', invoiceNumber: 'INV-2026-0153', amount: 12750, dueDate: 'Feb 22, 2026', daysToMaturity: 1, discountRate: '1.2%', earlyPayAmount: 12597 },
  { id: 'ei-2', invoiceNumber: 'INV-2026-0152', amount: 45000, dueDate: 'Feb 24, 2026', daysToMaturity: 3, discountRate: '1.5%', earlyPayAmount: 44325 },
  { id: 'ei-3', invoiceNumber: 'INV-2026-0154', amount: 31000, dueDate: 'Mar 5, 2026', daysToMaturity: 12, discountRate: '2.1%', earlyPayAmount: 30349 },
  { id: 'ei-4', invoiceNumber: 'INV-2026-0150', amount: 56200, dueDate: 'Mar 3, 2026', daysToMaturity: 10, discountRate: '1.8%', earlyPayAmount: 55188 },
  { id: 'ei-5', invoiceNumber: 'INV-2026-0155', amount: 18200, dueDate: 'Mar 10, 2026', daysToMaturity: 17, discountRate: '2.5%', earlyPayAmount: 17745 },
];

const transactionHistory: SCFTransaction[] = [
  { id: 'tx-1', invoiceNumber: 'INV-2026-0149', originalAmount: 22300, earlyPayAmount: 22034, discount: 266, requestDate: 'Feb 10, 2026', paidDate: 'Feb 11, 2026', status: 'Completed' },
  { id: 'tx-2', invoiceNumber: 'INV-2026-0148', originalAmount: 37500, earlyPayAmount: 36938, discount: 562, requestDate: 'Feb 5, 2026', paidDate: 'Feb 6, 2026', status: 'Completed' },
  { id: 'tx-3', invoiceNumber: 'INV-2026-0147', originalAmount: 19800, earlyPayAmount: 19503, discount: 297, requestDate: 'Jan 28, 2026', paidDate: 'Jan 29, 2026', status: 'Completed' },
  { id: 'tx-4', invoiceNumber: 'INV-2026-0146', originalAmount: 41200, earlyPayAmount: 40582, discount: 618, requestDate: 'Jan 20, 2026', paidDate: 'Jan 21, 2026', status: 'Completed' },
  { id: 'tx-5', invoiceNumber: 'INV-2026-0143', originalAmount: 67500, earlyPayAmount: 66488, discount: 1012, requestDate: 'Jan 15, 2026', paidDate: 'Jan 16, 2026', status: 'Completed' },
];

/* ───────── Helpers ───────── */

function formatCurrency(v: number): string {
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const statusClassMap: Record<TransactionStatus, string> = {
  Completed: styles.statusCompleted,
  Pending: styles.statusPending,
  Processing: styles.statusProcessing,
};

/* ───────── Component ───────── */

export default function SupplierPortalSCF() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [enrolled] = useState(isEnrolled);
  const [showApplication, setShowApplication] = useState(false);

  /* Calculator state */
  const [calcAmount, setCalcAmount] = useState('50000');
  const [calcDays, setCalcDays] = useState('15');
  const [calcRate, setCalcRate] = useState('1.8');
  const [showCalcResult, setShowCalcResult] = useState(false);

  /* Application form state */
  const [applicationData, setApplicationData] = useState({
    companyName: 'Acme Corp',
    taxId: '84-1234567',
    bankName: 'JPMorgan Chase',
    accountNumber: '',
    routingNumber: '',
    estimatedVolume: '',
    notes: '',
  });
  const [appErrors, setAppErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  /* Calculator */
  const calcResult = useMemo(() => {
    const amount = parseFloat(calcAmount) || 0;
    const days = parseInt(calcDays) || 0;
    const rate = parseFloat(calcRate) || 0;
    const discount = (amount * rate * days) / (365 * 100);
    const receiveAmount = amount - discount;
    const receiveDate = new Date();
    receiveDate.setDate(receiveDate.getDate() + 1);
    return {
      originalAmount: amount,
      discount: Math.round(discount * 100) / 100,
      receiveAmount: Math.round(receiveAmount * 100) / 100,
      receiveDate: receiveDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      savings: days,
    };
  }, [calcAmount, calcDays, calcRate]);

  const handleCalculate = useCallback(() => {
    setShowCalcResult(true);
  }, []);

  /* Application validation */
  const validateApplication = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!applicationData.accountNumber.trim()) errors.accountNumber = 'Required';
    if (!applicationData.routingNumber.trim()) errors.routingNumber = 'Required';
    if (!applicationData.estimatedVolume.trim()) errors.estimatedVolume = 'Required';
    setAppErrors(errors);
    return Object.keys(errors).length === 0;
  }, [applicationData]);

  const handleSubmitApplication = useCallback(() => {
    if (validateApplication()) {
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setShowApplication(false);
      }, 1500);
    }
  }, [validateApplication]);

  /* Utilization percentage */
  const utilizationPercent = Math.round((programData.utilized / programData.creditLine) * 100);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={`${styles.skeleton} ${styles.skeletonStatus}`} />
        <div className={styles.statsRow}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${styles.skeleton} ${styles.skeletonStats}`} />
          ))}
        </div>
        <div className={`${styles.skeleton} ${styles.skeletonTable}`} />
      </div>
    );
  }

  return (
    <>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('supplierPortal.scf.title')}</h1>
          <p className={styles.pageSubtitle}>{t('supplierPortal.scf.subtitle')}</p>
        </div>
      </div>

      {/* ── Program Status Card ── */}
      <div className={styles.statusCard}>
        <div className={styles.statusLeft}>
          <div className={`${styles.statusIcon} ${enrolled ? styles.statusIconEnrolled : styles.statusIconNotEnrolled}`}>
            {enrolled ? '\u2713' : '\u2212'}
          </div>
          <div>
            <div className={styles.statusLabel}>{t('supplierPortal.scf.programStatus')}</div>
            <div className={styles.statusValue}>
              {enrolled ? t('supplierPortal.scf.enrolled') : t('supplierPortal.scf.notEnrolled')}
            </div>
          </div>
        </div>
        <span className={`${styles.statusBadge} ${enrolled ? styles.statusBadgeEnrolled : styles.statusBadgeNotEnrolled}`}>
          {enrolled ? t('supplierPortal.scf.activeProgram') : t('supplierPortal.scf.enrollNow')}
        </span>
      </div>

      {/* ══════════════════════════════════════════
           ENROLLED VIEW
         ══════════════════════════════════════════ */}
      {enrolled && (
        <>
          {/* Stats Row */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{t('supplierPortal.scf.availableCreditLine')}</div>
              <div className={styles.statValue} style={{ color: 'var(--color-success, #00B42A)' }}>
                {formatCurrency(programData.available)}
              </div>
              <div className={styles.statSub}>
                {t('supplierPortal.scf.ofTotal', { total: formatCurrency(programData.creditLine) })}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{t('supplierPortal.scf.currentUtilization')}</div>
              <div className={styles.statValue}>{formatCurrency(programData.utilized)}</div>
              <div className={styles.statSub}>{utilizationPercent}% {t('supplierPortal.scf.used')}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{t('supplierPortal.scf.financingRate')}</div>
              <div className={styles.statValue}>{programData.rateRange}</div>
              <div className={styles.statSub}>{t('supplierPortal.scf.annualized')}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{t('supplierPortal.scf.enrolledSince')}</div>
              <div className={styles.statValue}>{programData.enrolledSince}</div>
              <div className={styles.statSub}>{t('supplierPortal.scf.totalSaved', { amount: formatCurrency(2755) })}</div>
            </div>
          </div>

          {/* Utilization Progress Bar */}
          <div className={styles.utilizationSection}>
            <div className={styles.utilizationCard}>
              <div className={styles.utilizationHeader}>
                <span className={styles.utilizationTitle}>{t('supplierPortal.scf.creditUtilization')}</span>
                <span className={styles.utilizationPercent}>{utilizationPercent}%</span>
              </div>
              <div className={styles.progressBarTrack}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${utilizationPercent}%` }}
                />
              </div>
              <div className={styles.utilizationDetails}>
                <div className={styles.utilizationDetail}>
                  <span className={styles.utilizationDetailLabel}>{t('supplierPortal.scf.utilized')}</span>
                  <span className={styles.utilizationDetailValue}>{formatCurrency(programData.utilized)}</span>
                </div>
                <div className={styles.utilizationDetail}>
                  <span className={styles.utilizationDetailLabel}>{t('supplierPortal.scf.available')}</span>
                  <span className={styles.utilizationDetailValue}>{formatCurrency(programData.available)}</span>
                </div>
                <div className={styles.utilizationDetail}>
                  <span className={styles.utilizationDetailLabel}>{t('supplierPortal.scf.totalCreditLine')}</span>
                  <span className={styles.utilizationDetailValue}>{formatCurrency(programData.creditLine)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className={styles.howItWorks}>
            <h2 className={styles.howItWorksTitle}>{t('supplierPortal.scf.howItWorks')}</h2>
            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <h3 className={styles.stepTitle}>{t('supplierPortal.scf.step1Title')}</h3>
                <p className={styles.stepDesc}>{t('supplierPortal.scf.step1Desc')}</p>
              </div>
              <div className={styles.stepArrowWrapper}>
                <span className={styles.stepArrow}>&#8594;</span>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <h3 className={styles.stepTitle}>{t('supplierPortal.scf.step2Title')}</h3>
                <p className={styles.stepDesc}>{t('supplierPortal.scf.step2Desc')}</p>
              </div>
              <div className={styles.stepArrowWrapper}>
                <span className={styles.stepArrow}>&#8594;</span>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <h3 className={styles.stepTitle}>{t('supplierPortal.scf.step3Title')}</h3>
                <p className={styles.stepDesc}>{t('supplierPortal.scf.step3Desc')}</p>
              </div>
            </div>
          </div>

          {/* Eligible Invoices Table */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('supplierPortal.scf.eligibleInvoices')}</h2>
            </div>
            {eligibleInvoices.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>&#128196;</div>
                <div className={styles.emptyTitle}>{t('supplierPortal.scf.noEligibleInvoices')}</div>
                <div className={styles.emptyDesc}>{t('supplierPortal.scf.noEligibleInvoicesDesc')}</div>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('supplierPortal.scf.invoice')}</th>
                    <th>{t('supplierPortal.scf.amount')}</th>
                    <th>{t('supplierPortal.scf.dueDate')}</th>
                    <th>{t('supplierPortal.scf.daysToMaturity')}</th>
                    <th>{t('supplierPortal.scf.discountRate')}</th>
                    <th>{t('supplierPortal.scf.earlyPayAmount')}</th>
                    <th>{t('supplierPortal.scf.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td><span className={styles.invoiceRef}>{inv.invoiceNumber}</span></td>
                      <td><span className={styles.amountCell}>{formatCurrency(inv.amount)}</span></td>
                      <td>{inv.dueDate}</td>
                      <td>{inv.daysToMaturity} {t('supplierPortal.scf.days')}</td>
                      <td>{inv.discountRate}</td>
                      <td><span className={styles.amountCell}>{formatCurrency(inv.earlyPayAmount)}</span></td>
                      <td>
                        <button className={styles.earlyPayButton}>
                          {t('supplierPortal.scf.requestEarlyPayment')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Early Payment Calculator */}
          <div className={styles.calculatorCard}>
            <h2 className={styles.calculatorTitle}>{t('supplierPortal.scf.earlyPaymentCalculator')}</h2>
            <div className={styles.calculatorGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('supplierPortal.scf.invoiceAmount')}</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min="0"
                  step="100"
                  value={calcAmount}
                  onChange={(e) => { setCalcAmount(e.target.value); setShowCalcResult(false); }}
                  placeholder="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('supplierPortal.scf.daysBeforeMaturity')}</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min="1"
                  max="90"
                  value={calcDays}
                  onChange={(e) => { setCalcDays(e.target.value); setShowCalcResult(false); }}
                  placeholder="15"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('supplierPortal.scf.discountRatePercent')}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className={styles.formInput}
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={calcRate}
                    onChange={(e) => { setCalcRate(e.target.value); setShowCalcResult(false); }}
                    style={{ flex: 1 }}
                  />
                  <button className={styles.calculateButton} onClick={handleCalculate}>
                    {t('supplierPortal.scf.calculate')}
                  </button>
                </div>
              </div>
            </div>

            {showCalcResult && (
              <div className={styles.calculatorResult}>
                <div className={styles.resultGrid}>
                  <div className={styles.resultItem}>
                    <div className={styles.resultLabel}>{t('supplierPortal.scf.originalAmount')}</div>
                    <div className={styles.resultValue}>{formatCurrency(calcResult.originalAmount)}</div>
                  </div>
                  <div className={styles.resultItem}>
                    <div className={styles.resultLabel}>{t('supplierPortal.scf.discountFee')}</div>
                    <div className={styles.resultValue}>{formatCurrency(calcResult.discount)}</div>
                  </div>
                  <div className={styles.resultItem}>
                    <div className={styles.resultLabel}>{t('supplierPortal.scf.youReceive')}</div>
                    <div className={`${styles.resultValue} ${styles.resultHighlight}`}>
                      {formatCurrency(calcResult.receiveAmount)}
                    </div>
                  </div>
                  <div className={styles.resultItem}>
                    <div className={styles.resultLabel}>{t('supplierPortal.scf.paidBy')}</div>
                    <div className={styles.resultValue}>{calcResult.receiveDate}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('supplierPortal.scf.transactionHistory')}</h2>
            </div>
            {transactionHistory.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>&#128203;</div>
                <div className={styles.emptyTitle}>{t('supplierPortal.scf.noTransactions')}</div>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('supplierPortal.scf.invoice')}</th>
                    <th>{t('supplierPortal.scf.originalAmount')}</th>
                    <th>{t('supplierPortal.scf.earlyPayAmount')}</th>
                    <th>{t('supplierPortal.scf.discount')}</th>
                    <th>{t('supplierPortal.scf.requestDate')}</th>
                    <th>{t('supplierPortal.scf.paidDate')}</th>
                    <th>{t('supplierPortal.scf.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory.map((tx) => (
                    <tr key={tx.id}>
                      <td><span className={styles.invoiceRef}>{tx.invoiceNumber}</span></td>
                      <td><span className={styles.amountCell}>{formatCurrency(tx.originalAmount)}</span></td>
                      <td><span className={styles.amountCell}>{formatCurrency(tx.earlyPayAmount)}</span></td>
                      <td style={{ color: 'var(--color-error, #F53F3F)' }}>-{formatCurrency(tx.discount)}</td>
                      <td>{tx.requestDate}</td>
                      <td>{tx.paidDate}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${statusClassMap[tx.status]}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Terms & Conditions */}
          <div className={styles.termsSection}>
            <button
              className={styles.termsToggle}
              onClick={() => setShowApplication(!showApplication)}
              aria-expanded={showApplication}
            >
              <span className={styles.termsToggleText}>
                {t('supplierPortal.scf.termsAndConditions')}
              </span>
              <span className={styles.termsToggleIcon}>
                {showApplication ? '\u25B2' : '\u25BC'}
              </span>
            </button>
            {showApplication && (
              <div className={styles.termsContent}>
                <p className={styles.termsText}>{t('supplierPortal.scf.termsIntro')}</p>
                <ul className={styles.termsList}>
                  <li>{t('supplierPortal.scf.term1')}</li>
                  <li>{t('supplierPortal.scf.term2')}</li>
                  <li>{t('supplierPortal.scf.term3')}</li>
                  <li>{t('supplierPortal.scf.term4')}</li>
                  <li>{t('supplierPortal.scf.term5')}</li>
                </ul>
                <p className={styles.termsFootnote}>{t('supplierPortal.scf.termsFootnote')}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
           NOT ENROLLED VIEW
         ══════════════════════════════════════════ */}
      {!enrolled && (
        <div className={styles.notEnrolledSection}>
          {/* Benefits Overview */}
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={`${styles.benefitIcon} ${styles.benefitIconFast}`}>&#9889;</div>
              <h3 className={styles.benefitTitle}>{t('supplierPortal.scf.benefitFasterTitle')}</h3>
              <p className={styles.benefitDesc}>{t('supplierPortal.scf.benefitFasterDesc')}</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={`${styles.benefitIcon} ${styles.benefitIconRate}`}>&#128200;</div>
              <h3 className={styles.benefitTitle}>{t('supplierPortal.scf.benefitRatesTitle')}</h3>
              <p className={styles.benefitDesc}>{t('supplierPortal.scf.benefitRatesDesc')}</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={`${styles.benefitIcon} ${styles.benefitIconEasy}`}>&#128736;</div>
              <h3 className={styles.benefitTitle}>{t('supplierPortal.scf.benefitEasyTitle')}</h3>
              <p className={styles.benefitDesc}>{t('supplierPortal.scf.benefitEasyDesc')}</p>
            </div>
          </div>

          {/* Eligibility Requirements */}
          <div className={styles.requirementsCard}>
            <h2 className={styles.requirementsTitle}>{t('supplierPortal.scf.eligibilityRequirements')}</h2>
            <div className={styles.requirementsList}>
              <div className={styles.requirementItem}>
                <span className={`${styles.requirementCheck} ${styles.requirementMet}`}>&#10003;</span>
                <span>{t('supplierPortal.scf.requirementActiveSupplier')}</span>
              </div>
              <div className={styles.requirementItem}>
                <span className={`${styles.requirementCheck} ${styles.requirementMet}`}>&#10003;</span>
                <span>{t('supplierPortal.scf.requirementMinInvoices')}</span>
              </div>
              <div className={styles.requirementItem}>
                <span className={`${styles.requirementCheck} ${styles.requirementMet}`}>&#10003;</span>
                <span>{t('supplierPortal.scf.requirementVerifiedBank')}</span>
              </div>
              <div className={styles.requirementItem}>
                <span className={`${styles.requirementCheck} ${styles.requirementUnmet}`}>&#9675;</span>
                <span>{t('supplierPortal.scf.requirementCompliance')}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          {!showApplication && (
            <div className={styles.ctaSection}>
              <h2 className={styles.ctaTitle}>{t('supplierPortal.scf.ctaTitle')}</h2>
              <p className={styles.ctaDesc}>{t('supplierPortal.scf.ctaDesc')}</p>
              <button
                className={styles.ctaButton}
                onClick={() => setShowApplication(true)}
              >
                {t('supplierPortal.scf.applyForSCF')}
              </button>
            </div>
          )}

          {/* Application Form */}
          {showApplication && (
            <div className={styles.applicationCard}>
              <h2 className={styles.applicationTitle}>{t('supplierPortal.scf.applicationForm')}</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('supplierPortal.scf.companyName')}</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={applicationData.companyName}
                    onChange={(e) => setApplicationData((p) => ({ ...p, companyName: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('supplierPortal.scf.taxId')}</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={applicationData.taxId}
                    onChange={(e) => setApplicationData((p) => ({ ...p, taxId: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('supplierPortal.scf.bankName')}</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={applicationData.bankName}
                    onChange={(e) => setApplicationData((p) => ({ ...p, bankName: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('supplierPortal.scf.accountNumber')} *</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder={t('supplierPortal.scf.accountNumberPlaceholder')}
                    value={applicationData.accountNumber}
                    onChange={(e) => {
                      setApplicationData((p) => ({ ...p, accountNumber: e.target.value }));
                      setAppErrors((p) => ({ ...p, accountNumber: '' }));
                    }}
                  />
                  {appErrors.accountNumber && (
                    <span className={styles.formError}>{appErrors.accountNumber}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('supplierPortal.scf.routingNumber')} *</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder={t('supplierPortal.scf.routingNumberPlaceholder')}
                    value={applicationData.routingNumber}
                    onChange={(e) => {
                      setApplicationData((p) => ({ ...p, routingNumber: e.target.value }));
                      setAppErrors((p) => ({ ...p, routingNumber: '' }));
                    }}
                  />
                  {appErrors.routingNumber && (
                    <span className={styles.formError}>{appErrors.routingNumber}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('supplierPortal.scf.estimatedMonthlyVolume')} *</label>
                  <select
                    className={styles.formSelect}
                    value={applicationData.estimatedVolume}
                    onChange={(e) => {
                      setApplicationData((p) => ({ ...p, estimatedVolume: e.target.value }));
                      setAppErrors((p) => ({ ...p, estimatedVolume: '' }));
                    }}
                  >
                    <option value="" disabled>{t('supplierPortal.scf.selectVolume')}</option>
                    <option value="under50k">{t('supplierPortal.scf.under50k')}</option>
                    <option value="50k-200k">{t('supplierPortal.scf.range50to200')}</option>
                    <option value="200k-500k">{t('supplierPortal.scf.range200to500')}</option>
                    <option value="over500k">{t('supplierPortal.scf.over500k')}</option>
                  </select>
                  {appErrors.estimatedVolume && (
                    <span className={styles.formError}>{appErrors.estimatedVolume}</span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('supplierPortal.scf.additionalNotes')}</label>
                <textarea
                  className={styles.formTextarea}
                  placeholder={t('supplierPortal.scf.notesPlaceholder')}
                  value={applicationData.notes}
                  onChange={(e) => setApplicationData((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>

              <div className={styles.submitArea}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowApplication(false)}
                >
                  {t('supplierPortal.scf.cancel')}
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleSubmitApplication}
                  disabled={submitting}
                >
                  {submitting
                    ? t('supplierPortal.scf.submitting')
                    : t('supplierPortal.scf.submitApplication')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
