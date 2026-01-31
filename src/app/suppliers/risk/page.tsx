"use client";

import { useState } from "react";
import { useT } from '@/lib/i18n/locale-context';
import styles from "./risk.module.css";

const alerts = [
  { id: 1, type: "Financial", severity: "Critical", supplier: "Prime Manufacturing", invoice: "INV-0867", description: "Supplier filed for Chapter 11 bankruptcy protection", status: "New", date: "2026-01-29" },
  { id: 2, type: "Financial", severity: "Critical", supplier: "Quantum Electronics", invoice: "INV-1045", description: "Payment default on $1.2M credit facility reported", status: "Investigating", date: "2026-01-28" },
  { id: 3, type: "Compliance", severity: "High", supplier: "EcoSupply Partners", invoice: "-", description: "ISO 14001 certification expired without renewal", status: "New", date: "2026-01-28" },
  { id: 4, type: "Quality", severity: "High", supplier: "Prime Manufacturing", invoice: "PO-0445", description: "Defect rate 8.2% on Batch #7891 (threshold: 2%)", status: "Investigating", date: "2026-01-27" },
  { id: 5, type: "Delivery", severity: "High", supplier: "Global Logistics Inc", invoice: "PO-0445", description: "3rd delivery delay in 6 months - systemic issue", status: "Monitoring", date: "2026-01-27" },
  { id: 6, type: "Compliance", severity: "High", supplier: "OmniTech Hardware", invoice: "-", description: "Failed REACH compliance audit - restricted substances", status: "New", date: "2026-01-26" },
  { id: 7, type: "Financial", severity: "High", supplier: "EcoSupply Partners", invoice: "-", description: "Requested payment terms extension Net 45 to Net 60", status: "Investigating", date: "2026-01-26" },
  { id: 8, type: "Reputation", severity: "Medium", supplier: "Pacific Freight Co", invoice: "-", description: "Negative press: labor dispute at main distribution hub", status: "Monitoring", date: "2026-01-25" },
  { id: 9, type: "Delivery", severity: "Medium", supplier: "FastTrack Couriers", invoice: "PO-0501", description: "New supplier - first delivery 2 days late", status: "Monitoring", date: "2026-01-25" },
  { id: 10, type: "Compliance", severity: "Medium", supplier: "NovaPharma Ltd", invoice: "-", description: "ISO 13485 expiring in 45 days - renewal pending", status: "Monitoring", date: "2026-01-24" },
  { id: 11, type: "Quality", severity: "Medium", supplier: "Atlas Building Materials", invoice: "PO-0398", description: "Minor spec deviation on concrete mix batch", status: "Resolved", date: "2026-01-23" },
  { id: 12, type: "Financial", severity: "Medium", supplier: "Nexus Telecom", invoice: "-", description: "Credit rating downgraded from A to BBB+", status: "Monitoring", date: "2026-01-22" },
  { id: 13, type: "Delivery", severity: "Low", supplier: "SilverLine Packaging", invoice: "PO-0467", description: "Shipment arrived 1 day early - warehouse capacity", status: "Resolved", date: "2026-01-22" },
  { id: 14, type: "Compliance", severity: "Low", supplier: "DataStream Analytics", invoice: "-", description: "GDPR DPA annual review due in 60 days", status: "Monitoring", date: "2026-01-21" },
  { id: 15, type: "Financial", severity: "Low", supplier: "Vertex Consulting", invoice: "-", description: "Minor accounts receivable aging increase noted", status: "Monitoring", date: "2026-01-20" },
  { id: 16, type: "Quality", severity: "Low", supplier: "Meridian Foods", invoice: "PO-0412", description: "Packaging label misprint - non-critical field", status: "Resolved", date: "2026-01-19" },
];

const trendData = [
  { month: "Oct", critical: 1, high: 3, medium: 8, low: 15 },
  { month: "Nov", critical: 0, high: 4, medium: 10, low: 18 },
  { month: "Dec", critical: 1, high: 6, medium: 9, low: 20 },
  { month: "Jan", critical: 2, high: 5, medium: 12, low: 24 },
];

function getTypeClass(type: string) {
  const map: Record<string, string> = {
    Financial: styles.typeFinancial,
    Compliance: styles.typeCompliance,
    Delivery: styles.typeDelivery,
    Quality: styles.typeQuality,
    Reputation: styles.typeReputation,
  };
  return map[type] || styles.typeFinancial;
}

function getSevClass(sev: string) {
  const map: Record<string, string> = {
    Critical: styles.sevCritical,
    High: styles.sevHigh,
    Medium: styles.sevMedium,
    Low: styles.sevLow,
  };
  return map[sev] || styles.sevLow;
}

function getSevColor(sev: string) {
  const map: Record<string, string> = {
    Critical: "#F76560",
    High: "#FF9A2E",
    Medium: "#165DFF",
    Low: "#23C343",
  };
  return map[sev] || "#23C343";
}

function getStatusClass(status: string) {
  const map: Record<string, string> = {
    New: styles.statusNew,
    Investigating: styles.statusInvestigating,
    Monitoring: styles.statusMonitoring,
    Resolved: styles.statusResolved,
  };
  return map[status] || styles.statusMonitoring;
}

export default function RiskPage() {
  const t = useT();
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t('supplierRisk.title')}</h1>
          <p>{t('supplierRisk.subtitle')}</p>
        </div>
        <button className={styles.refreshBtn}>Refresh Analysis</button>
      </div>

      <div className={styles.dashGrid}>
        <div className={`${styles.dashCard} ${styles.dashCritical}`}>
          <div className={styles.dashLabel}>{t('riskDashboard.critical')}</div>
          <div className={styles.dashValue}>2</div>
          <div className={styles.dashSub}>Immediate action required</div>
        </div>
        <div className={`${styles.dashCard} ${styles.dashHigh}`}>
          <div className={styles.dashLabel}>{t('riskDashboard.high')}</div>
          <div className={styles.dashValue}>5</div>
          <div className={styles.dashSub}>Review within 24h</div>
        </div>
        <div className={`${styles.dashCard} ${styles.dashMedium}`}>
          <div className={styles.dashLabel}>{t('riskDashboard.medium')}</div>
          <div className={styles.dashValue}>12</div>
          <div className={styles.dashSub}>Monitor closely</div>
        </div>
        <div className={`${styles.dashCard} ${styles.dashLow}`}>
          <div className={styles.dashLabel}>{t('riskDashboard.low')}</div>
          <div className={styles.dashValue}>24</div>
          <div className={styles.dashSub}>Routine monitoring</div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.alertsPanel}>
          <div className={styles.panelTitle}>
            <span>{t('supplierRisk.alerts')}</span>
            <span className={styles.alertCount}>{filtered.length} alerts</span>
          </div>
          <table className={styles.alertTable}>
            <thead>
              <tr>
                <th>{t('common.type')}</th>
                <th>{t('riskDashboard.severity')}</th>
                <th>{t('supplierRisk.supplierName')}</th>
                <th>Reference</th>
                <th>{t('common.description')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.date')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => (
                <tr key={alert.id}>
                  <td><span className={`${styles.typeBadge} ${getTypeClass(alert.type)}`}>{alert.type}</span></td>
                  <td>
                    <span className={`${styles.sevBadge} ${getSevClass(alert.severity)}`}>
                      <span className={styles.sevDot} style={{ background: getSevColor(alert.severity) }} />
                      {alert.severity}
                    </span>
                  </td>
                  <td>{alert.supplier}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#4E5969" }}>{alert.invoice}</td>
                  <td>{alert.description}</td>
                  <td><span className={`${styles.alertStatus} ${getStatusClass(alert.status)}`}>{alert.status}</span></td>
                  <td style={{ fontSize: "0.75rem", color: "#4E5969" }}>{alert.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.insightsPanel}>
          <div className={styles.insightCard}>
            <div className={styles.insightTitle}>{t('supplierRisk.riskTrend')}</div>
            <div className={styles.trendChart}>
              {trendData.map((row, i) => (
                <div key={i}>
                  <div className={styles.trendRow}>
                    <span className={styles.trendLabel}>{row.month}</span>
                    <div className={styles.trendBar} style={{ width: `${row.critical * 20}%`, background: "#F76560", minWidth: row.critical ? "8px" : "0" }} />
                    <div className={styles.trendBar} style={{ width: `${row.high * 8}%`, background: "#FF9A2E", minWidth: row.high ? "8px" : "0" }} />
                    <div className={styles.trendBar} style={{ width: `${row.medium * 5}%`, background: "#165DFF", minWidth: row.medium ? "8px" : "0" }} />
                    <div className={styles.trendBar} style={{ width: `${row.low * 3}%`, background: "#23C343", minWidth: row.low ? "8px" : "0" }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", justifyContent: "center" }}>
              <span style={{ fontSize: "0.625rem", color: "#F76560" }}>{t('riskDashboard.critical')}</span>
              <span style={{ fontSize: "0.625rem", color: "#FF9A2E" }}>{t('riskDashboard.high')}</span>
              <span style={{ fontSize: "0.625rem", color: "#165DFF" }}>{t('riskDashboard.medium')}</span>
              <span style={{ fontSize: "0.625rem", color: "#23C343" }}>{t('riskDashboard.low')}</span>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightTitle}>AI Insights</div>
            <div className={styles.insightList}>
              <div className={styles.insightItem}>
                <div className={styles.insightItemTitle}>Supply Chain Concentration Risk</div>
                <div className={styles.insightItemText}>42% of manufacturing spend concentrated with 2 suppliers. Recommend diversifying to reduce single-point-of-failure risk.</div>
              </div>
              <div className={styles.insightItem}>
                <div className={styles.insightItemTitle}>Financial Stability Decline</div>
                <div className={styles.insightItemText}>3 suppliers show deteriorating financial indicators this quarter. Prime Manufacturing and EcoSupply Partners require immediate review.</div>
              </div>
              <div className={styles.insightItem}>
                <div className={styles.insightItemTitle}>Compliance Gap Forecast</div>
                <div className={styles.insightItemText}>6 certifications expiring in next 90 days. Automated renewal reminders sent. 2 require manual follow-up.</div>
              </div>
              <div className={styles.insightItem}>
                <div className={styles.insightItemTitle}>Geopolitical Risk Update</div>
                <div className={styles.insightItemText}>New tariff regulations may affect 3 APAC-region suppliers. Estimated cost impact: $120K-$180K annually.</div>
              </div>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.aiInsight}>
              <div className={styles.aiLabel}>Medius AI Summary</div>
              <div className={styles.aiText}>Overall supply chain risk has increased 12% this quarter, primarily driven by financial instability at two key manufacturing suppliers. Recommend activating contingency plans for Prime Manufacturing and initiating vendor qualification for alternative electronics suppliers.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
