"use client";

import Link from "next/link";
import { useT } from '@/lib/i18n/locale-context';
import styles from "./supplier-detail.module.css";

const supplierData: Record<string, any> = {
  "SUP-001": {
    name: "Acme Corp", category: "Software", status: "Active", riskScore: 12,
    contact: { address: "123 Tech Boulevard, San Francisco, CA 94105", phone: "+1 (415) 555-0142", email: "accounts@acmecorp.com", website: "www.acmecorp.com", primaryContact: "Sarah Chen, Account Manager" },
    paymentTerms: { terms: "Net 30", method: "ACH Transfer", currency: "USD", bankAccount: "****4521", earlyPayDiscount: "2/10 Net 30" },
    compliance: [
      { name: "SOC 2 Type II", status: "Valid", expiry: "2026-08-15" },
      { name: "ISO 27001", status: "Valid", expiry: "2026-12-01" },
      { name: "GDPR DPA", status: "Valid", expiry: "2027-03-20" },
      { name: "W-9", status: "Valid", expiry: "N/A" },
    ],
    performance: { onTimeDelivery: "98.5%", qualityScore: "4.8/5", responseTime: "2.1h", disputeRate: "0.3%" },
    aiAssessment: "Acme Corp demonstrates excellent financial stability with consistent revenue growth of 18% YoY. Their SOC 2 and ISO 27001 certifications are current. No supply chain risks detected. Recommend maintaining current payment terms and exploring volume discount opportunities for Q3.",
    spendByMonth: [
      { month: "Jul", amount: 18500 }, { month: "Aug", amount: 22000 }, { month: "Sep", amount: 19800 },
      { month: "Oct", amount: 24500 }, { month: "Nov", amount: 21000 }, { month: "Dec", amount: 28000 },
      { month: "Jan", amount: 25000 }, { month: "Feb", amount: 23500 }, { month: "Mar", amount: 20000 },
      { month: "Apr", amount: 26500 }, { month: "May", amount: 19000 }, { month: "Jun", amount: 17200 },
    ],
    recentInvoices: [
      { id: "INV-2024-0891", amount: 24500, date: "2026-01-15", status: "Paid" },
      { id: "INV-2024-0834", amount: 18900, date: "2026-01-02", status: "Paid" },
      { id: "INV-2024-0798", amount: 32100, date: "2025-12-18", status: "Paid" },
      { id: "INV-2024-0756", amount: 15600, date: "2025-12-05", status: "Pending" },
      { id: "INV-2024-0712", amount: 28400, date: "2025-11-22", status: "Paid" },
    ],
    contracts: [
      { name: "Enterprise Software License", value: "$180,000/yr", end: "2026-12-31" },
      { name: "Premium Support SLA", value: "$45,000/yr", end: "2026-06-30" },
    ],
    conversations: [
      { subject: "Q2 License Renewal Terms", date: "2026-01-28", status: "Open" },
      { subject: "Invoice INV-0756 Clarification", date: "2026-01-10", status: "Resolved" },
      { subject: "SOC 2 Report Request", date: "2025-12-15", status: "Resolved" },
    ],
  },
};

const defaultSupplier = {
  name: "Unknown Supplier", category: "General", status: "Active", riskScore: 50,
  contact: { address: "456 Business Ave, New York, NY 10001", phone: "+1 (212) 555-0199", email: "info@supplier.com", website: "www.supplier.com", primaryContact: "John Smith, Sales Rep" },
  paymentTerms: { terms: "Net 30", method: "Wire Transfer", currency: "USD", bankAccount: "****9876", earlyPayDiscount: "None" },
  compliance: [
    { name: "SOC 2 Type II", status: "Expiring", expiry: "2026-03-01" },
    { name: "ISO 27001", status: "Valid", expiry: "2027-01-15" },
    { name: "W-9", status: "Valid", expiry: "N/A" },
  ],
  performance: { onTimeDelivery: "94.2%", qualityScore: "4.2/5", responseTime: "4.8h", disputeRate: "1.2%" },
  aiAssessment: "This supplier shows moderate risk indicators. Financial stability is adequate but monitoring recommended. Compliance certifications need renewal attention. Consider requesting updated financial statements and scheduling a quarterly business review.",
  spendByMonth: [
    { month: "Jul", amount: 32000 }, { month: "Aug", amount: 28000 }, { month: "Sep", amount: 35000 },
    { month: "Oct", amount: 41000 }, { month: "Nov", amount: 38000 }, { month: "Dec", amount: 45000 },
    { month: "Jan", amount: 42000 }, { month: "Feb", amount: 36000 }, { month: "Mar", amount: 39000 },
    { month: "Apr", amount: 44000 }, { month: "May", amount: 37000 }, { month: "Jun", amount: 33000 },
  ],
  recentInvoices: [
    { id: "INV-2024-1102", amount: 42500, date: "2026-01-20", status: "Pending" },
    { id: "INV-2024-1045", amount: 38200, date: "2026-01-08", status: "Paid" },
    { id: "INV-2024-0998", amount: 29800, date: "2025-12-22", status: "Paid" },
    { id: "INV-2024-0945", amount: 51000, date: "2025-12-10", status: "Overdue" },
    { id: "INV-2024-0901", amount: 34600, date: "2025-11-28", status: "Paid" },
  ],
  contracts: [
    { name: "Master Service Agreement", value: "$500,000/yr", end: "2026-09-30" },
    { name: "Maintenance & Support", value: "$120,000/yr", end: "2026-06-15" },
    { name: "Professional Services", value: "$75,000", end: "2026-04-30" },
  ],
  conversations: [
    { subject: "Delivery Schedule Update", date: "2026-01-25", status: "Open" },
    { subject: "Quality Issue - Batch #4421", date: "2026-01-12", status: "Open" },
    { subject: "Contract Renewal Discussion", date: "2025-12-20", status: "Resolved" },
  ],
};

function getRiskClass(score: number) {
  if (score <= 30) return styles.riskLow;
  if (score <= 60) return styles.riskMedium;
  return styles.riskHigh;
}

function getStatusClass(s: string) {
  if (s === "Active") return styles.statusActive;
  if (s === "On Hold") return styles.statusOnHold;
  if (s === "Blocked") return styles.statusBlocked;
  return styles.statusNew;
}

function getCertClass(s: string) {
  if (s === "Valid") return styles.certValid;
  if (s === "Expiring") return styles.certExpiring;
  return styles.certExpired;
}

function getInvoiceStatusClass(s: string) {
  if (s === "Paid") return styles.invoicePaid;
  if (s === "Pending") return styles.invoicePending;
  return styles.invoiceOverdue;
}

export default function SupplierDetailPage({ params }: { params: { id: string } }) {
  const t = useT();
  const supplier = supplierData[params.id] || { ...defaultSupplier, name: params.id.replace("SUP-", "Supplier #") };
  const maxSpend = Math.max(...supplier.spendByMonth.map((m: any) => m.amount));

  return (
    <div className={styles.container}>
      <Link href="/suppliers" className={styles.backLink}>
        &larr; {t('supplierDetail.backToSuppliers')}
      </Link>

      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.avatar}>{supplier.name.charAt(0)}</div>
          <div className={styles.headerText}>
            <h1>{supplier.name}</h1>
            <div className={styles.headerMeta}>
              <span>{supplier.category}</span>
              <span className={`${styles.statusBadge} ${getStatusClass(supplier.status)}`}>{supplier.status}</span>
              <span className={`${styles.riskBadge} ${getRiskClass(supplier.riskScore)}`}>
                Risk: {supplier.riskScore}/100
              </span>
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn}>Edit Supplier</button>
          <button className={styles.actionBtn}>Start Conversation</button>
          <button className={styles.actionBtn}>View Invoices</button>
          <button className={styles.actionBtnPrimary}>Create PO</button>
        </div>
      </div>

      <div className={styles.columns}>
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>{t('supplierDetail.contactInfo')}</div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Address</span>
                <span className={styles.infoValue}>{supplier.contact.address}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Phone</span>
                <span className={styles.infoValue}>{supplier.contact.phone}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{supplier.contact.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Website</span>
                <span className={styles.infoValue}>{supplier.contact.website}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Primary Contact</span>
                <span className={styles.infoValue}>{supplier.contact.primaryContact}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>{t('supplierDetail.bankDetails')}</div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Terms</span>
                <span className={styles.infoValue}>{supplier.paymentTerms.terms}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Method</span>
                <span className={styles.infoValue}>{supplier.paymentTerms.method}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Currency</span>
                <span className={styles.infoValue}>{supplier.paymentTerms.currency}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Early Pay Discount</span>
                <span className={styles.infoValue}>{supplier.paymentTerms.earlyPayDiscount}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>{t('supplierDetail.complianceStatus')}</div>
            <div className={styles.certList}>
              {supplier.compliance.map((cert: any, i: number) => (
                <div key={i} className={styles.certItem}>
                  <span className={styles.certName}>{cert.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "#4E5969" }}>{cert.expiry}</span>
                    <span className={`${styles.certStatus} ${getCertClass(cert.status)}`}>{cert.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>{t('supplierDetail.performance')}</div>
            <div className={styles.metricsGrid}>
              <div className={styles.metricItem}>
                <div className={styles.metricValue}>{supplier.performance.onTimeDelivery}</div>
                <div className={styles.metricLabel}>On-Time Delivery</div>
              </div>
              <div className={styles.metricItem}>
                <div className={styles.metricValue}>{supplier.performance.qualityScore}</div>
                <div className={styles.metricLabel}>Quality Score</div>
              </div>
              <div className={styles.metricItem}>
                <div className={styles.metricValue}>{supplier.performance.responseTime}</div>
                <div className={styles.metricLabel}>Avg Response</div>
              </div>
              <div className={styles.metricItem}>
                <div className={styles.metricValue}>{supplier.performance.disputeRate}</div>
                <div className={styles.metricLabel}>Dispute Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>{t('supplierDetail.riskProfile')}</div>
            <div className={styles.aiInsight}>
              <div className={styles.aiLabel}>Medius AI Analysis</div>
              <div className={styles.aiText}>{supplier.aiAssessment}</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Spend Trend (12 Months)</div>
            <div className={styles.spendChart}>
              {supplier.spendByMonth.map((m: any, i: number) => (
                <div
                  key={i}
                  className={styles.spendBar}
                  style={{ height: `${(m.amount / maxSpend) * 100}%` }}
                >
                  <span className={styles.spendBarLabel}>{m.month}</span>
                  <span className={styles.spendBarValue}>${(m.amount / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>{t('supplierDetail.invoices')}</div>
            <div className={styles.invoiceList}>
              {supplier.recentInvoices.map((inv: any, i: number) => (
                <div key={i} className={styles.invoiceItem}>
                  <span className={styles.invoiceId}>{inv.id}</span>
                  <span className={styles.invoiceAmount}>${inv.amount.toLocaleString()}</span>
                  <span style={{ fontSize: "0.75rem", color: "#4E5969" }}>{inv.date}</span>
                  <span className={`${styles.invoiceStatus} ${getInvoiceStatusClass(inv.status)}`}>{inv.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>{t('supplierDetail.contracts')}</div>
            <div className={styles.contractList}>
              {supplier.contracts.map((c: any, i: number) => (
                <div key={i} className={styles.contractItem}>
                  <span className={styles.contractName}>{c.name}</span>
                  <span className={styles.contractValue}>{c.value}</span>
                  <span style={{ fontSize: "0.75rem", color: "#4E5969" }}>Ends: {c.end}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>{t('supplierDetail.overview')}</div>
            <div className={styles.conversationList}>
              {supplier.conversations.map((conv: any, i: number) => (
                <div key={i} className={styles.conversationItem}>
                  <span className={styles.conversationSubject}>{conv.subject}</span>
                  <span className={styles.conversationDate}>{conv.date}</span>
                  <span className={`${styles.conversationStatus} ${conv.status === "Open" ? styles.convOpen : styles.convResolved}`}>
                    {conv.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
