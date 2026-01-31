'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './onboarding.module.css';

const INDUSTRIES = [
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Technology',
  'Financial Services',
  'Professional Services',
  'Other',
];

const COMPANY_SIZES = ['1-50', '51-200', '201-1000', '1000+'];

const ERP_SYSTEMS = [
  { id: 'sap', name: 'SAP', desc: 'S/4HANA & ECC integration', color: '#0070f2' },
  { id: 'netsuite', name: 'NetSuite', desc: 'Oracle NetSuite ERP', color: '#1b7c52' },
  { id: 'd365', name: 'D365', desc: 'Microsoft Dynamics 365', color: '#d83b01' },
  { id: 'sage', name: 'Sage', desc: 'Sage Intacct & 300', color: '#00dc82' },
  { id: 'quickbooks', name: 'QuickBooks', desc: 'Intuit QuickBooks Online', color: '#2ca01c' },
  { id: 'custom', name: 'Custom API', desc: 'REST / GraphQL endpoint', color: '#8E51DA' },
];

const WORKFLOW_TEMPLATES = [
  {
    id: 'standard-2step',
    name: 'Standard 2-Step',
    icon: '1-2',
    iconBg: '#165DFF',
    description: 'Manager approves, then Finance approves. The most common workflow for mid-size organizations.',
    whenToUse: 'Best for: Teams with clear reporting structure and moderate invoice volumes.',
  },
  {
    id: 'highvalue-3step',
    name: 'High Value 3-Step',
    icon: '1-3',
    iconBg: '#8E51DA',
    description: 'Department Head, VP, and CFO approval chain for invoices exceeding configurable thresholds.',
    whenToUse: 'Best for: Invoices over $10,000 that require executive oversight.',
  },
  {
    id: 'dept-head',
    name: 'Department Head',
    icon: 'DH',
    iconBg: '#FF9A2E',
    description: 'Route invoices to the relevant department head based on GL code or cost center mapping.',
    whenToUse: 'Best for: Decentralized organizations with department-level budget ownership.',
  },
  {
    id: 'auto-approve',
    name: 'Auto-Approve Low Value',
    icon: 'AI',
    iconBg: '#23C343',
    description: 'AI auto-approves invoices under a set threshold when vendor and PO match with high confidence.',
    whenToUse: 'Best for: High-volume, low-value recurring invoices from trusted vendors.',
  },
];

const MOCK_VENDORS = [
  { name: 'Acme Corporation', email: 'ap@acme.com', category: 'Supplier', dedup: 'clean' },
  { name: 'TechFlow Solutions', email: 'billing@techflow.io', category: 'Technology', dedup: 'clean' },
  { name: 'Acme Corp.', email: 'invoices@acme.com', category: 'Supplier', dedup: 'warning' },
  { name: 'GlobalShip Logistics', email: 'finance@globalship.com', category: 'Logistics', dedup: 'clean' },
  { name: 'OfficeMax Pro', email: 'ar@officemax.com', category: 'Office Supplies', dedup: 'clean' },
];

const STEP_LABELS = ['Welcome', 'Try It Now', 'Connect ERP', 'Import Vendors', 'Workflows', "You're Ready!"];

export default function OnboardingPage() {
  const t = useT();
  const [currentStep, setCurrentStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [uploadedFile, setUploadedFile] = useState(false);
  const [connectedErps, setConnectedErps] = useState<string[]>([]);
  const [connectingErp, setConnectingErp] = useState<string | null>(null);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>(['standard-2step']);
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorCategory, setVendorCategory] = useState('');

  const totalSteps = 6;
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleConnectErp = (erpId: string) => {
    setConnectingErp(erpId);
    setTimeout(() => {
      setConnectedErps((prev) => [...prev, erpId]);
      setConnectingErp(null);
    }, 2000);
  };

  const toggleWorkflow = (id: string) => {
    setSelectedWorkflows((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const estimatedVolume = parseInt(monthlyVolume) || 500;
  const annualSavings = Math.round(estimatedVolume * 12 * 8.5);
  const hoursSaved = Math.round(estimatedVolume * 12 * 0.15);
  const earlyPayDiscount = Math.round(estimatedVolume * 12 * 25 * 0.02);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderWelcome();
      case 2:
        return renderTryItNow();
      case 3:
        return renderConnectERP();
      case 4:
        return renderImportVendors();
      case 5:
        return renderWorkflows();
      case 6:
        return renderSuccess();
      default:
        return null;
    }
  };

  const renderWelcome = () => (
    <>
      <h2 className={styles.stepTitle}>{t('onboarding.welcomeTitle')}</h2>
      <p className={styles.stepDescription}>
        {t('onboarding.welcomeSubtitle')}
      </p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.formGridFull}`}>
          <label className={styles.label}>Company Name</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter your company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Industry</label>
          <select
            className={styles.select}
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Company Size</label>
          <select
            className={styles.select}
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
          >
            <option value="">Select size</option>
            {COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>{size} employees</option>
            ))}
          </select>
        </div>
        <div className={`${styles.field} ${styles.formGridFull}`}>
          <label className={styles.label}>Monthly Invoice Volume</label>
          <input
            type="number"
            className={styles.input}
            placeholder="e.g. 500"
            value={monthlyVolume}
            onChange={(e) => setMonthlyVolume(e.target.value)}
          />
        </div>
      </div>
    </>
  );

  const renderTryItNow = () => (
    <>
      <h2 className={styles.stepTitle}>Try It Now</h2>
      <p className={styles.stepDescription}>
        See AI-powered invoice extraction in action. Upload an invoice or set up email forwarding.
      </p>
      <div className={styles.tryItSection}>
        <div className={styles.headlineBadge}>
          <span>&#9889;</span> See AI extraction in &lt; 5 minutes
        </div>
        <div
          className={`${styles.uploadZone} ${uploadedFile ? styles.uploadZoneActive : ''}`}
          onClick={() => setUploadedFile(true)}
        >
          <div className={styles.uploadIcon}>&#128196;</div>
          <p className={styles.uploadTitle}>
            {uploadedFile ? 'Invoice uploaded successfully!' : 'Drag & drop your invoice here'}
          </p>
          <p className={styles.uploadSubtitle}>
            {uploadedFile
              ? 'Processing with AI extraction...'
              : 'or click to browse files'}
          </p>
          <p className={styles.uploadFormats}>Supported: PDF, PNG, JPG, TIFF (max 25MB)</p>
        </div>

        <div className={styles.orDivider}>
          <span className={styles.orText}>or</span>
        </div>

        <div className={styles.emailForward}>
          <div className={styles.emailIcon}>&#9993;</div>
          <div className={styles.emailInfo}>
            <p className={styles.emailLabel}>Forward invoices to your dedicated inbox</p>
            <p className={styles.emailAddress}>
              {companyName ? companyName.toLowerCase().replace(/\s+/g, '-') : 'your-company'}@inbox.medius.ai
            </p>
          </div>
          <button className={styles.copyBtn} onClick={() => {}}>Copy</button>
        </div>

        {uploadedFile && (
          <div className={styles.extractionPreview}>
            <p className={styles.previewTitle}>AI Extraction Preview</p>
            <p className={styles.previewSubtitle}>Fields automatically detected from your invoice</p>
            <div className={styles.previewGrid}>
              <div className={styles.previewField}>
                <span className={styles.previewFieldLabel}>Vendor</span>
                <span className={styles.previewFieldValue}>Acme Corporation</span>
              </div>
              <div className={styles.previewField}>
                <span className={styles.previewFieldLabel}>Invoice Number</span>
                <span className={styles.previewFieldValue}>INV-2024-0891</span>
              </div>
              <div className={styles.previewField}>
                <span className={styles.previewFieldLabel}>Amount</span>
                <span className={styles.previewFieldValue}>$12,450.00</span>
              </div>
              <div className={styles.previewField}>
                <span className={styles.previewFieldLabel}>Date</span>
                <span className={styles.previewFieldValue}>Jan 15, 2025</span>
              </div>
              <div className={styles.previewField}>
                <span className={styles.previewFieldLabel}>Due Date</span>
                <span className={styles.previewFieldValue}>Feb 14, 2025</span>
              </div>
              <div className={styles.previewField}>
                <span className={styles.previewFieldLabel}>PO Number</span>
                <span className={styles.previewFieldValue}>PO-34521</span>
              </div>
            </div>
            <div className={styles.confidenceBadge}>
              <span>&#10003;</span> 98.5% Extraction Confidence
            </div>
          </div>
        )}
      </div>
    </>
  );

  const renderConnectERP = () => (
    <>
      <h2 className={styles.stepTitle}>{t('onboarding.connectERP')}</h2>
      <p className={styles.stepDescription}>
        Connect your ERP system for seamless invoice processing and automated data sync. You can always do this later.
      </p>
      <div className={styles.erpGrid}>
        {ERP_SYSTEMS.map((erp) => {
          const isConnected = connectedErps.includes(erp.id);
          return (
            <div
              key={erp.id}
              className={`${styles.erpCard} ${isConnected ? styles.erpCardConnected : ''}`}
            >
              <div className={styles.erpLogo} style={{ backgroundColor: erp.color }}>
                {erp.name.substring(0, 2).toUpperCase()}
              </div>
              <p className={styles.erpName}>{erp.name}</p>
              <p className={styles.erpDesc}>{erp.desc}</p>
              {isConnected ? (
                <div className={styles.connectedBadge}>
                  <span>&#10003;</span> Connected
                </div>
              ) : (
                <button
                  className={styles.connectBtn}
                  onClick={() => handleConnectErp(erp.id)}
                >
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  const renderImportVendors = () => (
    <>
      <h2 className={styles.stepTitle}>Import Your Vendors</h2>
      <p className={styles.stepDescription}>
        Import your vendor master list via CSV or add vendors manually. We&apos;ll check for duplicates automatically.
      </p>
      <div className={styles.vendorSection}>
        <div className={styles.vendorUpload}>
          <div className={styles.uploadIcon}>&#128206;</div>
          <p className={styles.uploadTitle}>Upload CSV file</p>
          <p className={styles.uploadSubtitle}>
            Drag & drop your vendor list CSV, or click to browse
          </p>
          <p className={styles.uploadFormats}>Expected columns: Name, Email, Category, Payment Terms</p>
        </div>

        <div className={styles.orDivider}>
          <span className={styles.orText}>or add manually</span>
        </div>

        <div className={styles.vendorManualForm}>
          <p className={styles.manualFormTitle}>Add Vendor</p>
          <div className={styles.manualFormRow}>
            <div className={styles.field}>
              <label className={styles.label}>Vendor Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Company name"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                placeholder="billing@vendor.com"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Supplier"
                value={vendorCategory}
                onChange={(e) => setVendorCategory(e.target.value)}
              />
            </div>
            <button className={styles.addBtn}>Add</button>
          </div>
        </div>

        <div className={styles.extractionPreview}>
          <p className={styles.previewTitle}>Sample Data Preview</p>
          <p className={styles.previewSubtitle}>5 vendors loaded with deduplication check</p>
          <table className={styles.vendorTable}>
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Email</th>
                <th>Category</th>
                <th>Dedup Check</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_VENDORS.map((vendor, idx) => (
                <tr key={idx}>
                  <td>{vendor.name}</td>
                  <td>{vendor.email}</td>
                  <td>{vendor.category}</td>
                  <td>
                    <span
                      className={`${styles.dedupBadge} ${
                        vendor.dedup === 'warning' ? styles.dedupBadgeWarning : ''
                      }`}
                    >
                      {vendor.dedup === 'clean' ? (
                        <><span>&#10003;</span> Clean</>
                      ) : (
                        <><span>&#9888;</span> Possible Duplicate</>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderWorkflows = () => (
    <>
      <h2 className={styles.stepTitle}>{t('onboarding.configureApprovals')}</h2>
      <p className={styles.stepDescription}>
        Choose one or more workflow templates to get started. You can customize these anytime from Settings.
      </p>
      <div className={styles.workflowGrid}>
        {WORKFLOW_TEMPLATES.map((wf) => {
          const isSelected = selectedWorkflows.includes(wf.id);
          return (
            <div
              key={wf.id}
              className={`${styles.workflowCard} ${isSelected ? styles.workflowCardSelected : ''}`}
              onClick={() => toggleWorkflow(wf.id)}
            >
              <div className={styles.workflowHeader}>
                <div
                  className={styles.workflowIcon}
                  style={{ backgroundColor: `${wf.iconBg}22`, color: wf.iconBg }}
                >
                  {wf.icon}
                </div>
                <p className={styles.workflowName}>{wf.name}</p>
              </div>
              <p className={styles.workflowDesc}>{wf.description}</p>
              <p className={styles.workflowWhen}>
                <strong>When to use: </strong>{wf.whenToUse}
              </p>
              {isSelected && (
                <div className={styles.selectedIndicator}>
                  <span>&#10003;</span> Selected
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  const renderSuccess = () => (
    <>
      <div className={styles.successSection}>
        <div className={styles.successAnimation}>&#127881;</div>
        <h2 className={styles.successTitle}>You&apos;re Ready!</h2>
        <p className={styles.successSubtitle}>
          {companyName || 'Your company'} is all set up on Medius. Here&apos;s a quick look at your projected ROI.
        </p>

        <div className={styles.roiCard}>
          <p className={styles.roiTitle}>Projected Annual ROI</p>
          <div className={styles.roiMetrics}>
            <div className={styles.roiMetric}>
              <p className={styles.roiMetricValue}>${annualSavings.toLocaleString()}</p>
              <p className={styles.roiMetricLabel}>Processing Cost Savings</p>
            </div>
            <div className={styles.roiMetric}>
              <p className={styles.roiMetricValue}>{hoursSaved.toLocaleString()} hrs</p>
              <p className={styles.roiMetricLabel}>Time Saved Per Year</p>
            </div>
            <div className={styles.roiMetric}>
              <p className={styles.roiMetricValue}>${earlyPayDiscount.toLocaleString()}</p>
              <p className={styles.roiMetricLabel}>Early Payment Discounts</p>
            </div>
          </div>
        </div>

        <div className={styles.quickActions}>
          <div className={styles.quickAction}>
            <div className={styles.quickActionIcon}>&#128196;</div>
            <p className={styles.quickActionLabel}>Upload First Invoice</p>
            <p className={styles.quickActionDesc}>Process your first real invoice with AI</p>
          </div>
          <div className={styles.quickAction}>
            <div className={styles.quickActionIcon}>&#128101;</div>
            <p className={styles.quickActionLabel}>Invite Team Members</p>
            <p className={styles.quickActionDesc}>Add approvers and AP staff</p>
          </div>
          <div className={styles.quickAction}>
            <div className={styles.quickActionIcon}>&#128200;</div>
            <p className={styles.quickActionLabel}>Explore Dashboard</p>
            <p className={styles.quickActionDesc}>See real-time analytics and insights</p>
          </div>
        </div>
      </div>
    </>
  );

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
      </div>

      {/* Progress */}
      <div className={styles.progressSection}>
        <div className={styles.stepsRow}>
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNum = i + 1;
            let dotClass = styles.stepDot;
            if (stepNum < currentStep) dotClass += ` ${styles.stepDotCompleted}`;
            else if (stepNum === currentStep) dotClass += ` ${styles.stepDotActive}`;
            return (
              <div key={stepNum} className={dotClass}>
                {stepNum < currentStep ? '\u2713' : stepNum}
              </div>
            );
          })}
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
        <div className={styles.stepLabels}>
          {STEP_LABELS.map((label, i) => {
            let labelClass = styles.stepLabel;
            if (i + 1 < currentStep) labelClass += ` ${styles.stepLabelCompleted}`;
            else if (i + 1 === currentStep) labelClass += ` ${styles.stepLabelActive}`;
            return (
              <span key={label} className={labelClass}>{label}</span>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className={styles.card}>
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        <button
          className={styles.backBtn}
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          &#8592; Back
        </button>
        <div className={styles.navRight}>
          {currentStep < totalSteps && currentStep > 1 && (
            <button className={styles.skipBtn} onClick={handleSkip}>
              Skip this step
            </button>
          )}
          {currentStep < totalSteps ? (
            <button className={styles.nextBtn} onClick={handleNext}>
              Next &#8594;
            </button>
          ) : (
            <button className={styles.finishBtn} onClick={() => window.location.href = '/'}>
              Go to Dashboard &#8594;
            </button>
          )}
        </div>
      </div>

      {/* Connecting Modal */}
      {connectingErp && (
        <div className={styles.connectingOverlay}>
          <div className={styles.connectingModal}>
            <div className={styles.spinner} />
            <p className={styles.connectingText}>
              Connecting to {ERP_SYSTEMS.find((e) => e.id === connectingErp)?.name}...
            </p>
            <p className={styles.connectingSubtext}>
              Authorizing via OAuth 2.0 and validating credentials
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
