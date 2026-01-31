"use client";

import { useState } from "react";
import { useT } from '@/lib/i18n/locale-context';
import styles from "./supplier-portal.module.css";

/* ───────── Mock Data ───────── */

const buyers = [
  {
    id: "BUY-001",
    name: "Medius Demo Corp",
    relationship: "Since Jan 2021",
    status: "Active" as const,
    openInvoices: 4,
    lastPayment: "2026-01-22",
    ytdVolume: 485000,
  },
  {
    id: "BUY-002",
    name: "TechGlobal Inc",
    relationship: "Since Mar 2022",
    status: "Active" as const,
    openInvoices: 2,
    lastPayment: "2026-01-18",
    ytdVolume: 312000,
  },
  {
    id: "BUY-003",
    name: "Nordic Manufacturing",
    relationship: "Since Sep 2023",
    status: "Active" as const,
    openInvoices: 1,
    lastPayment: "2026-01-10",
    ytdVolume: 198000,
  },
  {
    id: "BUY-004",
    name: "Atlantic Health",
    relationship: "Since Nov 2025",
    status: "Pending" as const,
    openInvoices: 0,
    lastPayment: "--",
    ytdVolume: 0,
  },
];

const invoices = [
  { id: "INV-2026-0156", buyer: "Medius Demo Corp", amount: 24500, submitted: "2026-01-28", status: "Received", expectedPayment: "2026-02-27", hasRemittance: false },
  { id: "INV-2026-0155", buyer: "TechGlobal Inc", amount: 18200, submitted: "2026-01-27", status: "Processing", expectedPayment: "2026-02-26", hasRemittance: false },
  { id: "INV-2026-0154", buyer: "Medius Demo Corp", amount: 31000, submitted: "2026-01-25", status: "Processing", expectedPayment: "2026-02-24", hasRemittance: false },
  { id: "INV-2026-0153", buyer: "Nordic Manufacturing", amount: 12750, submitted: "2026-01-23", status: "Approved", expectedPayment: "2026-02-22", hasRemittance: false },
  { id: "INV-2026-0152", buyer: "TechGlobal Inc", amount: 45000, submitted: "2026-01-21", status: "Approved", expectedPayment: "2026-02-20", hasRemittance: false },
  { id: "INV-2026-0151", buyer: "Medius Demo Corp", amount: 8900, submitted: "2026-01-20", status: "Scheduled", expectedPayment: "2026-02-05", hasRemittance: false },
  { id: "INV-2026-0150", buyer: "Medius Demo Corp", amount: 56200, submitted: "2026-01-18", status: "Scheduled", expectedPayment: "2026-02-03", hasRemittance: false },
  { id: "INV-2026-0149", buyer: "Nordic Manufacturing", amount: 22300, submitted: "2026-01-16", status: "Paid", expectedPayment: "2026-02-15", hasRemittance: true },
  { id: "INV-2026-0148", buyer: "TechGlobal Inc", amount: 37500, submitted: "2026-01-14", status: "Paid", expectedPayment: "2026-02-13", hasRemittance: true },
  { id: "INV-2026-0147", buyer: "Medius Demo Corp", amount: 19800, submitted: "2026-01-12", status: "Paid", expectedPayment: "2026-02-11", hasRemittance: true },
  { id: "INV-2026-0146", buyer: "Medius Demo Corp", amount: 41200, submitted: "2026-01-10", status: "Paid", expectedPayment: "2026-02-09", hasRemittance: true },
  { id: "INV-2026-0145", buyer: "TechGlobal Inc", amount: 15600, submitted: "2026-01-08", status: "Paid", expectedPayment: "2026-02-07", hasRemittance: true },
  { id: "INV-2026-0144", buyer: "Nordic Manufacturing", amount: 28900, submitted: "2026-01-06", status: "Paid", expectedPayment: "2026-02-05", hasRemittance: true },
  { id: "INV-2026-0143", buyer: "Medius Demo Corp", amount: 67500, submitted: "2026-01-04", status: "Paid", expectedPayment: "2026-02-03", hasRemittance: true },
  { id: "INV-2026-0142", buyer: "TechGlobal Inc", amount: 9300, submitted: "2026-01-02", status: "Paid", expectedPayment: "2026-02-01", hasRemittance: true },
  { id: "INV-2025-0141", buyer: "Medius Demo Corp", amount: 33400, submitted: "2025-12-30", status: "Paid", expectedPayment: "2026-01-29", hasRemittance: true },
  { id: "INV-2025-0140", buyer: "Nordic Manufacturing", amount: 51200, submitted: "2025-12-28", status: "Paid", expectedPayment: "2026-01-27", hasRemittance: true },
  { id: "INV-2025-0139", buyer: "Medius Demo Corp", amount: 14700, submitted: "2025-12-26", status: "Paid", expectedPayment: "2026-01-25", hasRemittance: true },
  { id: "INV-2025-0138", buyer: "TechGlobal Inc", amount: 26800, submitted: "2025-12-23", status: "Paid", expectedPayment: "2026-01-22", hasRemittance: true },
  { id: "INV-2025-0137", buyer: "Medius Demo Corp", amount: 43100, submitted: "2025-12-20", status: "Paid", expectedPayment: "2026-01-19", hasRemittance: true },
];

const payments = [
  { id: "PAY-8401", date: "2026-01-22", amount: 41200, method: "ACH", buyer: "Medius Demo Corp", reference: "REM-8401", status: "Completed" },
  { id: "PAY-8392", date: "2026-01-20", amount: 15600, method: "Wire", buyer: "TechGlobal Inc", reference: "REM-8392", status: "Completed" },
  { id: "PAY-8385", date: "2026-01-18", amount: 28900, method: "ACH", buyer: "Nordic Manufacturing", reference: "REM-8385", status: "Completed" },
  { id: "PAY-8371", date: "2026-01-15", amount: 67500, method: "ACH", buyer: "Medius Demo Corp", reference: "REM-8371", status: "Completed" },
  { id: "PAY-8365", date: "2026-01-13", amount: 9300, method: "Wire", buyer: "TechGlobal Inc", reference: "REM-8365", status: "Completed" },
  { id: "PAY-8350", date: "2026-01-10", amount: 33400, method: "ACH", buyer: "Medius Demo Corp", reference: "REM-8350", status: "Completed" },
  { id: "PAY-8342", date: "2026-01-08", amount: 51200, method: "ACH", buyer: "Nordic Manufacturing", reference: "REM-8342", status: "Completed" },
  { id: "PAY-8331", date: "2026-01-05", amount: 14700, method: "Wire", buyer: "Medius Demo Corp", reference: "REM-8331", status: "Completed" },
  { id: "PAY-8320", date: "2026-01-03", amount: 26800, method: "ACH", buyer: "TechGlobal Inc", reference: "REM-8320", status: "Completed" },
  { id: "PAY-8310", date: "2025-12-30", amount: 43100, method: "ACH", buyer: "Medius Demo Corp", reference: "REM-8310", status: "Completed" },
];

const discountOffers = [
  {
    id: "DD-001",
    buyer: "Medius Demo Corp",
    invoiceRef: "INV-2026-0153",
    originalTerms: "Net 30",
    originalAmount: 56200,
    discountRate: 1.5,
    earlyPaymentDate: "2026-02-01",
    savings: 843,
  },
  {
    id: "DD-002",
    buyer: "TechGlobal Inc",
    invoiceRef: "INV-2026-0152",
    originalTerms: "Net 45",
    originalAmount: 45000,
    discountRate: 2.0,
    earlyPaymentDate: "2026-01-31",
    savings: 900,
  },
  {
    id: "DD-003",
    buyer: "Nordic Manufacturing",
    invoiceRef: "INV-2026-0154",
    originalTerms: "Net 30",
    originalAmount: 31000,
    discountRate: 1.25,
    earlyPaymentDate: "2026-02-02",
    savings: 387.5,
  },
];

const messages = [
  { id: "MSG-001", sender: "Medius Demo Corp", subject: "PO-4521 delivery schedule update", date: "2026-01-29", preview: "We need to adjust the delivery timeline for PO-4521. Please review the updated schedule...", unread: true },
  { id: "MSG-002", sender: "TechGlobal Inc", subject: "New RFQ: Q2 Software Licenses", date: "2026-01-28", preview: "We are soliciting quotes for our Q2 software license renewal. Please submit your proposal...", unread: true },
  { id: "MSG-003", sender: "Nordic Manufacturing", subject: "Invoice INV-2026-0153 approved", date: "2026-01-27", preview: "Your invoice INV-2026-0153 has been approved and scheduled for payment on Feb 22...", unread: false },
  { id: "MSG-004", sender: "Medius Demo Corp", subject: "Annual compliance review reminder", date: "2026-01-25", preview: "This is a reminder that your annual compliance documentation is due for renewal by March 15...", unread: false },
  { id: "MSG-005", sender: "TechGlobal Inc", subject: "Payment remittance for PAY-8392", date: "2026-01-20", preview: "Please find attached the remittance advice for payment PAY-8392 processed on Jan 20...", unread: false },
];

/* ───────── Helpers ───────── */

type InvoiceStatus = "Received" | "Processing" | "Approved" | "Scheduled" | "Paid";
type PaymentStatus = "Completed" | "Failed";

function getInvoiceStatusClass(s: InvoiceStatus): string {
  const map: Record<InvoiceStatus, string> = {
    Received: styles.statusReceived,
    Processing: styles.statusProcessing,
    Approved: styles.statusApproved,
    Scheduled: styles.statusScheduled,
    Paid: styles.statusPaid,
  };
  return map[s] || styles.statusReceived;
}

function getPaymentStatusClass(s: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    Completed: styles.statusCompleted,
    Failed: styles.statusFailed,
  };
  return map[s] || styles.statusCompleted;
}

function formatCurrency(v: number): string {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatCurrencyDecimal(v: number): string {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ───────── Tabs ───────── */

type TabKey = "buyers" | "invoices" | "submit" | "payments" | "discounts" | "profile" | "messages";

const tabLabels: { key: TabKey; label: string }[] = [
  { key: "buyers", label: "My Buyers" },
  { key: "invoices", label: "Invoice Tracker" },
  { key: "submit", label: "Submit Invoice" },
  { key: "payments", label: "Payment History" },
  { key: "discounts", label: "Dynamic Discounting" },
  { key: "profile", label: "Profile" },
  { key: "messages", label: "Messages" },
];

/* ───────── Component ───────── */

export default function SupplierPortalPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<TabKey>("buyers");

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoPlaceholder}>AC</div>
          <div className={styles.headerInfo}>
            <h1>{t('supplierPortal.title')} - Acme Corp</h1>
            <p>{t('supplierPortal.subtitle')}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.notificationButton}>
            <span>&#128276;</span>
            <span className={styles.notifDot} />
          </button>
          <button className={styles.settingsButton}>{t('header.settings')}</button>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Invoices Submitted</div>
          <div className={styles.statValue}>156</div>
          <div className={`${styles.statChange} ${styles.statUp}`}>+12 this month</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Payments Received</div>
          <div className={styles.statValue} style={{ color: "#23C343" }}>$1.2M</div>
          <div className={`${styles.statChange} ${styles.statUp}`}>+8.4% from last quarter</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('supplierPortal.pendingVerification')}</div>
          <div className={styles.statValue} style={{ color: "#FF9A2E" }}>3</div>
          <div className={`${styles.statChange} ${styles.statNeutral}`}>{t('common.actions')}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Avg Payment Time</div>
          <div className={styles.statValue}>28 <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "#86909C" }}>days</span></div>
          <div className={`${styles.statChange} ${styles.statUp}`}>-2 days from last quarter</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {tabLabels.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            {t.key === "messages" && (
              <span style={{ marginLeft: 6, background: "#F76560", color: "#fff", borderRadius: "9999px", padding: "1px 6px", fontSize: "0.6875rem", fontWeight: 700 }}>2</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}

      {/* Multi-Buyer View */}
      {activeTab === "buyers" && (
        <>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>&#127970;</span> Your Buyer Relationships
          </div>
          <div className={styles.buyerGrid}>
            {buyers.map((b) => (
              <div key={b.id} className={styles.buyerCard}>
                <div className={styles.buyerCardHeader}>
                  <div>
                    <div className={styles.buyerName}>{b.name}</div>
                    <div className={styles.buyerRelationship}>{b.relationship}</div>
                  </div>
                  <span className={`${styles.buyerStatusBadge} ${b.status === "Active" ? styles.buyerActive : styles.buyerPending}`}>
                    {b.status}
                  </span>
                </div>
                <div className={styles.buyerDetails}>
                  <div className={styles.buyerDetailItem}>
                    <div className={styles.buyerDetailLabel}>Open Invoices</div>
                    <div className={styles.buyerDetailValue}>{b.openInvoices}</div>
                  </div>
                  <div className={styles.buyerDetailItem}>
                    <div className={styles.buyerDetailLabel}>Last Payment</div>
                    <div className={styles.buyerDetailValue}>{b.lastPayment}</div>
                  </div>
                  <div className={styles.buyerDetailItem}>
                    <div className={styles.buyerDetailLabel}>YTD Volume</div>
                    <div className={styles.buyerDetailValue}>{b.ytdVolume > 0 ? formatCurrency(b.ytdVolume) : "--"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Network Value Banner */}
          <div className={styles.networkBanner}>
            <div className={styles.networkBannerContent}>
              <div className={styles.networkBannerTitle}>Grow Your Business with the Medius Network</div>
              <div className={styles.networkBannerText}>
                Join 550K+ suppliers on Medius. Submit invoices to all your Medius customers from one portal.
                Reduce payment times, access early payment programs, and streamline your accounts receivable.
              </div>
              <div className={styles.networkBannerStats}>
                <div className={styles.networkBannerStat}>
                  <div className={styles.networkBannerStatValue}>550K+</div>
                  <div className={styles.networkBannerStatLabel}>Suppliers</div>
                </div>
                <div className={styles.networkBannerStat}>
                  <div className={styles.networkBannerStatValue}>4,200+</div>
                  <div className={styles.networkBannerStatLabel}>Buyers</div>
                </div>
                <div className={styles.networkBannerStat}>
                  <div className={styles.networkBannerStatValue}>$48B</div>
                  <div className={styles.networkBannerStatLabel}>Processed Annually</div>
                </div>
              </div>
            </div>
            <div className={styles.networkBannerCTA}>
              <button className={styles.networkCTAButton}>{t('supplierPortal.inviteSupplier')}</button>
            </div>
          </div>
        </>
      )}

      {/* Invoice Tracker */}
      {activeTab === "invoices" && (
        <>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>&#128196;</span> Invoice Tracker
          </div>
          <div className={styles.tableWrapper}>
            <div className={styles.tableHeader}>
              <div className={styles.tableTitle}>All Invoices ({invoices.length})</div>
              <div className={styles.tableActions}>
                <button className={styles.tableActionButton}>{t('common.filter')}</button>
                <button className={styles.tableActionButton}>{t('common.export')} CSV</button>
              </div>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Buyer</th>
                  <th>{t('common.amount')}</th>
                  <th>Submitted</th>
                  <th>{t('common.status')}</th>
                  <th>Expected Payment</th>
                  <th>Remittance</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td><span className={styles.invoiceId}>{inv.id}</span></td>
                    <td>{inv.buyer}</td>
                    <td><span className={styles.amount}>{formatCurrency(inv.amount)}</span></td>
                    <td>{inv.submitted}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getInvoiceStatusClass(inv.status as InvoiceStatus)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>{inv.expectedPayment}</td>
                    <td>
                      {inv.hasRemittance ? (
                        <span className={styles.remittanceLink}>View</span>
                      ) : (
                        <span style={{ color: "#475569", fontSize: "0.8125rem" }}>--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.pagination}>
              <span className={styles.paginationInfo}>Showing 20 of 156 invoices</span>
              <div className={styles.paginationButtons}>
                <button className={styles.pageButton}>Prev</button>
                <button className={`${styles.pageButton} ${styles.pageButtonActive}`}>1</button>
                <button className={styles.pageButton}>2</button>
                <button className={styles.pageButton}>3</button>
                <button className={styles.pageButton}>...</button>
                <button className={styles.pageButton}>8</button>
                <button className={styles.pageButton}>Next</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Submit Invoice */}
      {activeTab === "submit" && (
        <>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>&#128228;</span> Submit New Invoice
          </div>
          <div className={styles.submitSection}>
            <div className={styles.submitGrid}>
              <div className={styles.uploadArea}>
                <div className={styles.uploadIcon}>&#128206;</div>
                <div className={styles.uploadTitle}>Drop invoice file here or click to browse</div>
                <div className={styles.uploadSubtitle}>Upload your invoice document for automatic data extraction</div>
                <div className={styles.uploadFormats}>Supported: PDF, PNG, JPG, XML, EDI (Max 25MB)</div>
              </div>
              <div className={styles.formFields}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Buyer</label>
                  <select className={styles.formSelect} defaultValue="">
                    <option value="" disabled>Select buyer...</option>
                    <option value="BUY-001">Medius Demo Corp</option>
                    <option value="BUY-002">TechGlobal Inc</option>
                    <option value="BUY-003">Nordic Manufacturing</option>
                    <option value="BUY-004">Atlantic Health</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>PO Reference</label>
                  <input className={styles.formInput} type="text" placeholder="e.g. PO-4521" />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Amount</label>
                    <input className={styles.formInput} type="text" placeholder="0.00" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Currency</label>
                    <select className={styles.formSelect} defaultValue="USD">
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="SEK">SEK - Swedish Krona</option>
                      <option value="NOK">NOK - Norwegian Krone</option>
                    </select>
                  </div>
                </div>
                <button className={styles.submitButton}>{t('common.submit')}</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Payment History */}
      {activeTab === "payments" && (
        <>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>&#128176;</span> Payment History
          </div>
          <div className={styles.tableWrapper}>
            <div className={styles.tableHeader}>
              <div className={styles.tableTitle}>Recent Payments (Last 10)</div>
              <div className={styles.tableActions}>
                <button className={styles.tableActionButton}>{t('common.download')} All</button>
              </div>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Payment ID</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Remittance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.date}</td>
                    <td><span className={styles.invoiceId}>{p.id}</span></td>
                    <td>{p.buyer}</td>
                    <td><span className={styles.amount}>{formatCurrency(p.amount)}</span></td>
                    <td><span className={styles.methodBadge}>{p.method}</span></td>
                    <td><span className={styles.remittanceLink}>{p.reference}</span></td>
                    <td>
                      <span className={`${styles.statusBadge} ${getPaymentStatusClass(p.status as PaymentStatus)}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Dynamic Discounting */}
      {activeTab === "discounts" && (
        <>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>&#9889;</span> Dynamic Discounting Offers
          </div>
          <div className={styles.discountGrid}>
            {discountOffers.map((d) => (
              <div key={d.id} className={styles.discountCard}>
                <div className={styles.discountBuyer}>{d.buyer}</div>
                <div className={styles.discountDetails}>
                  <div className={styles.discountRow}>
                    <span className={styles.discountLabel}>Invoice</span>
                    <span className={styles.discountValue}>{d.invoiceRef}</span>
                  </div>
                  <div className={styles.discountRow}>
                    <span className={styles.discountLabel}>Original Terms</span>
                    <span className={styles.discountValue}>{d.originalTerms}</span>
                  </div>
                  <div className={styles.discountRow}>
                    <span className={styles.discountLabel}>Invoice Amount</span>
                    <span className={styles.discountValue}>{formatCurrency(d.originalAmount)}</span>
                  </div>
                  <div className={styles.discountRow}>
                    <span className={styles.discountLabel}>Discount Rate</span>
                    <span className={`${styles.discountValue} ${styles.discountHighlight}`}>{d.discountRate}%</span>
                  </div>
                  <div className={styles.discountRow}>
                    <span className={styles.discountLabel}>Early Payment Date</span>
                    <span className={styles.discountValue}>{d.earlyPaymentDate}</span>
                  </div>
                </div>
                <div className={styles.discountSavings}>
                  <div className={styles.discountSavingsLabel}>Your Savings</div>
                  <div className={styles.discountSavingsValue}>{formatCurrencyDecimal(d.savings)}</div>
                </div>
                <button className={styles.discountAcceptButton}>Accept Early Payment</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Profile Management */}
      {activeTab === "profile" && (
        <>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>&#128100;</span> Profile Management
          </div>
          <div className={styles.profileGrid}>
            {/* Bank Details */}
            <div className={styles.profileCard}>
              <div className={styles.profileCardHeader}>
                <div className={styles.profileCardTitle}>Bank Details</div>
                <button className={styles.profileEditButton}>Edit</button>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Bank Name</span>
                <span className={styles.profileItemValue}>JPMorgan Chase</span>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Account Number</span>
                <span className={`${styles.profileItemValue} ${styles.profileMasked}`}>**** **** 4821</span>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Routing Number</span>
                <span className={`${styles.profileItemValue} ${styles.profileMasked}`}>****2109</span>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>SWIFT/BIC</span>
                <span className={`${styles.profileItemValue} ${styles.profileMasked}`}>CHAS****</span>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Verification</span>
                <span className={styles.profileStatus}>
                  <span className={`${styles.profileStatusDot} ${styles.profileStatusDotGreen}`} />
                  <span style={{ color: "#23C343", fontSize: "0.8125rem", fontWeight: 500 }}>Verified</span>
                </span>
              </div>
            </div>

            {/* Tax Documents */}
            <div className={styles.profileCard}>
              <div className={styles.profileCardHeader}>
                <div className={styles.profileCardTitle}>Tax Documents</div>
                <button className={styles.profileEditButton}>Upload</button>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>W-9 Form</span>
                <span className={styles.profileStatus}>
                  <span className={`${styles.profileStatusDot} ${styles.profileStatusDotGreen}`} />
                  <span style={{ color: "#23C343", fontSize: "0.8125rem", fontWeight: 500 }}>Current (Exp. Dec 2026)</span>
                </span>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Tax ID (EIN)</span>
                <span className={`${styles.profileItemValue} ${styles.profileMasked}`}>**-***4823</span>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>1099 Forms</span>
                <span className={styles.profileStatus}>
                  <span className={`${styles.profileStatusDot} ${styles.profileStatusDotBlue}`} />
                  <span style={{ color: "#165DFF", fontSize: "0.8125rem", fontWeight: 500 }}>3 Available</span>
                </span>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>VAT Registration</span>
                <span className={styles.profileStatus}>
                  <span className={`${styles.profileStatusDot} ${styles.profileStatusDotAmber}`} />
                  <span style={{ color: "#FF9A2E", fontSize: "0.8125rem", fontWeight: 500 }}>Not Applicable</span>
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className={styles.profileCard}>
              <div className={styles.profileCardHeader}>
                <div className={styles.profileCardTitle}>Contact Information</div>
                <button className={styles.profileEditButton}>Edit</button>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Primary Contact</span>
                <span className={styles.profileItemValue}>Sarah Mitchell</span>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Email</span>
                <span className={styles.profileItemValue}>s.mitchell@acmecorp.com</span>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Phone</span>
                <span className={styles.profileItemValue}>+1 (555) 234-8901</span>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Address</span>
                <span className={styles.profileItemValue}>123 Innovation Dr, Austin, TX 78701</span>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>DUNS Number</span>
                <span className={styles.profileItemValue}>08-123-4567</span>
              </div>
            </div>

            {/* Certifications */}
            <div className={styles.profileCard}>
              <div className={styles.profileCardHeader}>
                <div className={styles.profileCardTitle}>Certifications</div>
                <button className={styles.profileEditButton}>Add</button>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>ISO 9001:2015</span>
                <span className={styles.profileStatus}>
                  <span className={`${styles.profileStatusDot} ${styles.profileStatusDotGreen}`} />
                  <span style={{ color: "#23C343", fontSize: "0.8125rem", fontWeight: 500 }}>Valid until Mar 2027</span>
                </span>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>SOC 2 Type II</span>
                <span className={styles.profileStatus}>
                  <span className={`${styles.profileStatusDot} ${styles.profileStatusDotGreen}`} />
                  <span style={{ color: "#23C343", fontSize: "0.8125rem", fontWeight: 500 }}>Valid until Sep 2026</span>
                </span>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Minority Business Enterprise</span>
                <span className={styles.profileStatus}>
                  <span className={`${styles.profileStatusDot} ${styles.profileStatusDotAmber}`} />
                  <span style={{ color: "#FF9A2E", fontSize: "0.8125rem", fontWeight: 500 }}>Renewal Due</span>
                </span>
              </div>
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Cyber Essentials Plus</span>
                <span className={styles.profileStatus}>
                  <span className={`${styles.profileStatusDot} ${styles.profileStatusDotGreen}`} />
                  <span style={{ color: "#23C343", fontSize: "0.8125rem", fontWeight: 500 }}>Valid until Jun 2026</span>
                </span>
              </div>
              <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap" }}>
                <span className={styles.certBadge}>ISO 9001</span>
                <span className={styles.certBadge}>SOC 2</span>
                <span className={styles.certBadge}>MBE</span>
                <span className={styles.certBadge}>Cyber Essentials</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Communication Center */}
      {activeTab === "messages" && (
        <>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>&#128172;</span> Communication Center
          </div>
          <div className={styles.messagesCard}>
            <div className={styles.tableHeader}>
              <div className={styles.tableTitle}>Recent Messages (2 unread)</div>
              <div className={styles.tableActions}>
                <button className={styles.tableActionButton}>Compose</button>
                <button className={styles.tableActionButton}>Mark All Read</button>
              </div>
            </div>
            {messages.map((m) => (
              <div key={m.id} className={`${styles.messageItem} ${m.unread ? styles.messageUnread : ""}`}>
                <span className={m.unread ? styles.messageUnreadDot : styles.messageReadDot} />
                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <span className={styles.messageSender}>{m.sender}</span>
                    <span className={styles.messageDate}>{m.date}</span>
                  </div>
                  <div className={styles.messageSubject}>{m.subject}</div>
                  <div className={styles.messagePreview}>{m.preview}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
