'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './setup.module.css';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    invoiceLimit: '50 invoices/mo',
    price: '$0',
    period: '',
    billing: 'Free forever',
    popular: false,
    ctaLabel: 'Get Started Free',
    ctaStyle: 'outline' as const,
    features: [
      'AI-powered data extraction',
      'Basic approval workflows',
      'Email invoice capture',
      'Dashboard & reporting',
      '1 user included',
      'Community support',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    invoiceLimit: '500 invoices/mo',
    price: '$299',
    period: '/mo',
    billing: 'Billed annually ($3,588/yr)',
    popular: false,
    ctaLabel: 'Start Free Trial',
    ctaStyle: 'outline' as const,
    features: [
      'Everything in Free',
      'Advanced extraction models',
      'Multi-step approvals',
      'ERP integration (1 system)',
      'Vendor portal access',
      '5 users included',
      'Email & chat support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    invoiceLimit: '2,000 invoices/mo',
    price: '$999',
    period: '/mo',
    billing: 'Billed annually ($11,988/yr)',
    popular: true,
    ctaLabel: 'Start Free Trial',
    ctaStyle: 'primary' as const,
    features: [
      'Everything in Starter',
      'AI autonomous agents',
      'Smart 3-way matching',
      'Predictive cash flow',
      'Custom workflow builder',
      'Unlimited ERP integrations',
      '25 users included',
      'Priority support & CSM',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    invoiceLimit: 'Unlimited invoices',
    price: 'Custom',
    period: '',
    billing: 'Annual contract',
    popular: false,
    ctaLabel: 'Contact Sales',
    ctaStyle: 'enterprise' as const,
    features: [
      'Everything in Professional',
      'Unlimited users',
      'Dedicated infrastructure',
      'Custom AI model training',
      'Advanced compliance (SOX)',
      'SLA guarantee (99.99%)',
      'Dedicated support engineer',
      'Custom integrations',
      'On-premise deployment option',
    ],
  },
];

const COMPLIANCE_BADGES = [
  { label: 'SOC 2 Type II', color: '#165DFF' },
  { label: 'ISO 27001', color: '#23C343' },
  { label: 'GDPR', color: '#8E51DA' },
];

const CUSTOMER_LOGOS = [
  'ACME Corp',
  'GlobalTech',
  'Pinnacle',
  'NovaChem',
  'Vertex',
  'Synapse',
];

export default function SetupPage() {
  const t = useT();
  const [monthlyVolume, setMonthlyVolume] = useState(500);
  const [avgInvoiceValue, setAvgInvoiceValue] = useState(2500);
  const [processingCost, setProcessingCost] = useState(15);
  const [processingDays, setProcessingDays] = useState(8);
  const [selectedPlan, setSelectedPlan] = useState('professional');

  // ROI Calculations
  const annualInvoices = monthlyVolume * 12;
  const currentAnnualCost = annualInvoices * processingCost;
  const mediusCostPerInvoice = 2.5;
  const annualCostSavings = Math.round(currentAnnualCost - annualInvoices * mediusCostPerInvoice);
  const currentHoursPerInvoice = 0.25;
  const mediusHoursPerInvoice = 0.03;
  const timeSavingsHours = Math.round(annualInvoices * (currentHoursPerInvoice - mediusHoursPerInvoice));
  const earlyPaymentRate = 0.02;
  const earlyPaymentCapture = 0.35;
  const earlyPaymentSavings = Math.round(annualInvoices * avgInvoiceValue * earlyPaymentRate * earlyPaymentCapture);
  const totalROI = annualCostSavings + earlyPaymentSavings;

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>
            <span>M</span>
          </div>
          <h1 className={styles.logoTitle}>Medius</h1>
        </div>
        <button className={styles.backLink} onClick={() => window.history.back()}>
          &#8592; {t('common.back')}
        </button>
      </div>

      {/* Page Title */}
      <h1 className={styles.pageTitle}>{t('onboardingSetup.title')}</h1>
      <p className={styles.pageSubtitle}>
        {t('onboardingSetup.subtitle')}
      </p>

      {/* ROI Calculator */}
      <div className={styles.roiSection}>
        <h2 className={styles.sectionTitle}>ROI Calculator</h2>
        <p className={styles.sectionSubtitle}>
          Adjust the sliders to match your current AP operations and see projected savings.
        </p>
        <div className={styles.roiGrid}>
          {/* Inputs */}
          <div className={styles.roiInputs}>
            <p className={styles.roiInputsTitle}>Your Current Operations</p>
            <div className={styles.sliderGroup}>
              {/* Monthly Invoice Volume */}
              <div className={styles.sliderField}>
                <div className={styles.sliderLabel}>
                  <span className={styles.sliderLabelText}>Monthly Invoice Volume</span>
                  <span className={styles.sliderValue}>{monthlyVolume.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  className={styles.slider}
                  min={50}
                  max={10000}
                  step={50}
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                />
                <div className={styles.sliderRange}>
                  <span>50</span>
                  <span>10,000</span>
                </div>
              </div>

              {/* Average Invoice Value */}
              <div className={styles.sliderField}>
                <div className={styles.sliderLabel}>
                  <span className={styles.sliderLabelText}>Average Invoice Value</span>
                  <span className={styles.sliderValue}>${avgInvoiceValue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  className={styles.slider}
                  min={100}
                  max={50000}
                  step={100}
                  value={avgInvoiceValue}
                  onChange={(e) => setAvgInvoiceValue(Number(e.target.value))}
                />
                <div className={styles.sliderRange}>
                  <span>$100</span>
                  <span>$50,000</span>
                </div>
              </div>

              {/* Current Processing Cost */}
              <div className={styles.sliderField}>
                <div className={styles.sliderLabel}>
                  <span className={styles.sliderLabelText}>Current Cost per Invoice</span>
                  <span className={styles.sliderValue}>${processingCost}</span>
                </div>
                <input
                  type="range"
                  className={styles.slider}
                  min={8}
                  max={25}
                  step={1}
                  value={processingCost}
                  onChange={(e) => setProcessingCost(Number(e.target.value))}
                />
                <div className={styles.sliderRange}>
                  <span>$8</span>
                  <span>$25</span>
                </div>
              </div>

              {/* Current Processing Time */}
              <div className={styles.sliderField}>
                <div className={styles.sliderLabel}>
                  <span className={styles.sliderLabelText}>Current Processing Time</span>
                  <span className={styles.sliderValue}>{processingDays} days</span>
                </div>
                <input
                  type="range"
                  className={styles.slider}
                  min={1}
                  max={30}
                  step={1}
                  value={processingDays}
                  onChange={(e) => setProcessingDays(Number(e.target.value))}
                />
                <div className={styles.sliderRange}>
                  <span>1 day</span>
                  <span>30 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className={styles.roiResults}>
            <p className={styles.roiResultsTitle}>Projected Annual Savings</p>
            <div className={styles.roiMetrics}>
              <div className={styles.roiMetric}>
                <div className={styles.roiMetricInfo}>
                  <p className={styles.roiMetricLabel}>Annual Processing Cost Savings</p>
                  <p className={styles.roiMetricDesc}>
                    Reduce from ${processingCost}/invoice to ~$2.50/invoice
                  </p>
                </div>
                <p className={styles.roiMetricValue}>{formatCurrency(annualCostSavings)}</p>
              </div>
              <div className={styles.roiMetric}>
                <div className={styles.roiMetricInfo}>
                  <p className={styles.roiMetricLabel}>Time Savings</p>
                  <p className={styles.roiMetricDesc}>
                    {timeSavingsHours.toLocaleString()} hours/year freed up for your team
                  </p>
                </div>
                <p className={styles.roiMetricValue}>{timeSavingsHours.toLocaleString()} hrs</p>
              </div>
              <div className={styles.roiMetric}>
                <div className={styles.roiMetricInfo}>
                  <p className={styles.roiMetricLabel}>Early Payment Discount Capture</p>
                  <p className={styles.roiMetricDesc}>
                    Capture 2% discounts on 35% more invoices
                  </p>
                </div>
                <p className={styles.roiMetricValue}>{formatCurrency(earlyPaymentSavings)}</p>
              </div>
            </div>
            <div className={styles.roiTotal}>
              <p className={styles.roiTotalLabel}>Total Estimated Annual ROI</p>
              <p className={styles.roiTotalValue}>{formatCurrency(totalROI)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Selection */}
      <div className={styles.planSection}>
        <h2 className={styles.sectionTitle}>Choose Your Plan</h2>
        <p className={styles.sectionSubtitle}>
          All plans include a 14-day free trial. No credit card required.
        </p>
        <div className={styles.planGrid}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            let cardClass = styles.planCard;
            if (plan.popular) cardClass += ` ${styles.planCardPopular}`;
            if (isSelected) cardClass += ` ${styles.planCardSelected}`;

            return (
              <div key={plan.id} className={cardClass}>
                {plan.popular && (
                  <div className={styles.popularBadge}>Most Popular</div>
                )}
                <p className={styles.planName}>{plan.name}</p>
                <p className={styles.planInvoiceLimit}>{plan.invoiceLimit}</p>
                <p className={styles.planPrice}>
                  {plan.id === 'enterprise' ? (
                    <span className={styles.planPriceCustom}>{plan.price}</span>
                  ) : (
                    <>
                      <span className={styles.planPriceValue}>{plan.price}</span>
                      <span className={styles.planPricePeriod}>{plan.period}</span>
                    </>
                  )}
                </p>
                <p className={styles.planBilling}>{plan.billing}</p>
                <ul className={styles.planFeatures}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={styles.planFeature}>
                      <span className={styles.featureCheck}>&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {isSelected ? (
                  <button className={styles.selectedBadge}>
                    <span>&#10003;</span> Selected
                  </button>
                ) : (
                  <button
                    className={`${styles.planCta} ${
                      plan.ctaStyle === 'primary'
                        ? styles.planCtaPrimary
                        : plan.ctaStyle === 'enterprise'
                        ? styles.planCtaEnterprise
                        : styles.planCtaOutline
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.ctaLabel}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Signals */}
      <div className={styles.trustSection}>
        <div className={styles.trustCard}>
          <p className={styles.trustTitle}>Enterprise-Grade Security &amp; Compliance</p>
          <div className={styles.trustBadges}>
            {COMPLIANCE_BADGES.map((badge) => (
              <div key={badge.label} className={styles.trustBadge}>
                <div
                  className={styles.trustBadgeIcon}
                  style={{ backgroundColor: badge.color }}
                >
                  {badge.label.split(' ').map((w, i) => (
                    <span key={i}>{w}<br /></span>
                  ))}
                </div>
                <span className={styles.trustBadgeLabel}>{badge.label} Certified</span>
              </div>
            ))}
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustLogos}>
            {CUSTOMER_LOGOS.map((logo) => (
              <span key={logo} className={styles.trustLogo}>{logo}</span>
            ))}
          </div>
          <p className={styles.trustStat}>
            <strong>4,000+ companies</strong> trust Medius to process over <strong>$50B</strong> in invoices annually
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className={styles.footerCta}>
        <button className={styles.ctaPrimary} onClick={() => window.location.href = '/onboarding'}>
          {t('onboardingSetup.complete')} &#8594;
        </button>
        <button className={styles.ctaSecondary} onClick={() => window.location.href = '/'}>
          Skip to Dashboard
        </button>
      </div>
    </div>
  );
}
