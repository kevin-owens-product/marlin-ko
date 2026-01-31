"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/locale-context";
import styles from "./diversity.module.css";

/* ── Diversity Targets ──────────────────────────────────────────────────────── */

interface DiversityTarget {
  label: string;
  certClass: string;
  actual: number;
  target: number;
  color: string;
}

const DIVERSITY_TARGETS: DiversityTarget[] = [
  { label: "MBE", certClass: "certMBE", actual: 7.8, target: 10, color: "#165DFF" },
  { label: "WBE", certClass: "certWBE", actual: 4.2, target: 5, color: "#a855f7" },
  { label: "SDVOSB", certClass: "certSDVOSB", actual: 2.8, target: 3, color: "#23C343" },
  { label: "HUBZone", certClass: "certHUBZone", actual: 1.9, target: 3, color: "#FF9A2E" },
  { label: "LGBTBE", certClass: "certLGBTBE", actual: 1.2, target: 2, color: "#ec4899" },
  { label: "Small Biz", certClass: "certSmall", actual: 0.5, target: 2, color: "#86909C" },
];

/* ── Top Diverse Suppliers ──────────────────────────────────────────────────── */

interface DiverseSupplier {
  name: string;
  spend: string;
  certs: { label: string; className: string }[];
}

const TOP_DIVERSE: DiverseSupplier[] = [
  { name: "Apex Minority Holdings", spend: "$2.4M", certs: [{ label: "MBE", className: styles.certMBE }] },
  { name: "WomenFirst Consulting", spend: "$1.8M", certs: [{ label: "WBE", className: styles.certWBE }] },
  { name: "VetBridge Services", spend: "$1.6M", certs: [{ label: "SDVOSB", className: styles.certSDVOSB }] },
  { name: "Unity Tech Partners", spend: "$1.2M", certs: [{ label: "MBE", className: styles.certMBE }, { label: "LGBTBE", className: styles.certLGBTBE }] },
  { name: "Greenfield Rural Co-op", spend: "$0.9M", certs: [{ label: "HUBZone", className: styles.certHUBZone }] },
  { name: "Heritage Craft Works", spend: "$0.8M", certs: [{ label: "MBE", className: styles.certMBE }, { label: "Small Biz", className: styles.certSmall }] },
  { name: "EqualPath Logistics", spend: "$0.7M", certs: [{ label: "WBE", className: styles.certWBE }, { label: "SDVOSB", className: styles.certSDVOSB }] },
  { name: "NextGen Supplies LLC", spend: "$0.6M", certs: [{ label: "HUBZone", className: styles.certHUBZone }, { label: "Small Biz", className: styles.certSmall }] },
];

/* ── ESG Scores ─────────────────────────────────────────────────────────────── */

interface ESGSupplier {
  name: string;
  environmental: number;
  social: number;
  governance: number;
  overall: number;
  trend: "up" | "down" | "flat";
}

const ESG_SUPPLIERS: ESGSupplier[] = [
  { name: "EuroSupply GmbH", environmental: 88, social: 82, governance: 90, overall: 86, trend: "up" },
  { name: "Nordic Supply AS", environmental: 92, social: 78, governance: 84, overall: 84, trend: "up" },
  { name: "TechVantage Inc", environmental: 74, social: 86, governance: 88, overall: 82, trend: "up" },
  { name: "Cloudbridge Solutions", environmental: 80, social: 76, governance: 82, overall: 79, trend: "flat" },
  { name: "SilverLine Packaging", environmental: 72, social: 80, governance: 78, overall: 76, trend: "up" },
  { name: "Pacific Freight Co", environmental: 68, social: 72, governance: 74, overall: 71, trend: "down" },
  { name: "Atlas Building Materials", environmental: 64, social: 74, governance: 70, overall: 69, trend: "flat" },
  { name: "Meridian Logistics", environmental: 58, social: 68, governance: 72, overall: 66, trend: "down" },
  { name: "Quantum Electronics", environmental: 62, social: 56, governance: 64, overall: 60, trend: "down" },
  { name: "GreenTech Solutions", environmental: 86, social: 48, governance: 52, overall: 58, trend: "down" },
];

/* ── Certifications ─────────────────────────────────────────────────────────── */

interface Certification {
  supplier: string;
  certType: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  status: "Active" | "Expiring" | "Expired";
  daysToExpiry: number | null;
}

const CERTIFICATIONS: Certification[] = [
  { supplier: "Apex Minority Holdings", certType: "MBE", issuer: "NMSDC", validFrom: "2024-03-15", validTo: "2027-03-14", status: "Active", daysToExpiry: 408 },
  { supplier: "WomenFirst Consulting", certType: "WBE", issuer: "WBENC", validFrom: "2024-06-01", validTo: "2026-05-31", status: "Expiring", daysToExpiry: 120 },
  { supplier: "VetBridge Services", certType: "SDVOSB", issuer: "VA CVE", validFrom: "2023-09-01", validTo: "2026-08-31", status: "Expiring", daysToExpiry: 212 },
  { supplier: "Unity Tech Partners", certType: "MBE", issuer: "NMSDC", validFrom: "2025-01-10", validTo: "2028-01-09", status: "Active", daysToExpiry: 708 },
  { supplier: "Unity Tech Partners", certType: "LGBTBE", issuer: "NGLCC", validFrom: "2024-11-01", validTo: "2026-10-31", status: "Expiring", daysToExpiry: 273 },
  { supplier: "Greenfield Rural Co-op", certType: "HUBZone", issuer: "SBA", validFrom: "2024-04-01", validTo: "2027-03-31", status: "Active", daysToExpiry: 424 },
  { supplier: "Heritage Craft Works", certType: "MBE", issuer: "NMSDC", validFrom: "2023-07-01", validTo: "2026-06-30", status: "Expiring", daysToExpiry: 150 },
  { supplier: "Heritage Craft Works", certType: "Small Biz", issuer: "SBA", validFrom: "2023-12-01", validTo: "2025-11-30", status: "Expired", daysToExpiry: null },
  { supplier: "EqualPath Logistics", certType: "WBE", issuer: "WBENC", validFrom: "2024-08-15", validTo: "2026-08-14", status: "Expiring", daysToExpiry: 195 },
  { supplier: "EqualPath Logistics", certType: "SDVOSB", issuer: "VA CVE", validFrom: "2025-02-01", validTo: "2028-01-31", status: "Active", daysToExpiry: 730 },
  { supplier: "NextGen Supplies LLC", certType: "HUBZone", issuer: "SBA", validFrom: "2024-01-15", validTo: "2025-12-31", status: "Expired", daysToExpiry: null },
  { supplier: "NextGen Supplies LLC", certType: "Small Biz", issuer: "SBA", validFrom: "2025-03-01", validTo: "2028-02-28", status: "Active", daysToExpiry: 759 },
];

/* ── Regulatory Cards ───────────────────────────────────────────────────────── */

interface Regulation {
  name: string;
  status: "Compliant" | "In Progress";
  statusClass: string;
  auditDate: string;
  nextDeadline: string;
  description: string;
}

const REGULATIONS: Regulation[] = [
  { name: "FAR Subpart 19.7", status: "Compliant", statusClass: styles.regCompliant, auditDate: "2025-11-15", nextDeadline: "2026-11-15", description: "Federal Acquisition Regulation small business subcontracting plan requirements." },
  { name: "Executive Order 13985", status: "In Progress", statusClass: styles.regInProgress, auditDate: "2025-09-01", nextDeadline: "2026-03-31", description: "Advancing Racial Equity and Support for Underserved Communities Through the Federal Government." },
  { name: "EU CSRD", status: "In Progress", statusClass: styles.regInProgress, auditDate: "2025-12-01", nextDeadline: "2026-06-30", description: "Corporate Sustainability Reporting Directive — ESG disclosure requirements for EU operations." },
  { name: "UK Modern Slavery Act", status: "Compliant", statusClass: styles.regCompliant, auditDate: "2025-10-01", nextDeadline: "2026-10-01", description: "Annual modern slavery statement and supply chain transparency reporting." },
];

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function getESGClass(score: number) {
  if (score >= 80) return styles.scoreHigh;
  if (score >= 65) return styles.scoreMid;
  return styles.scoreLow;
}

function getTrendArrow(trend: string) {
  if (trend === "up") return { symbol: "\u2191", className: styles.trendUp };
  if (trend === "down") return { symbol: "\u2193", className: styles.trendDown };
  return { symbol: "\u2192", className: styles.trendFlat };
}

function getStatusClass(status: string) {
  const map: Record<string, string> = {
    Active: styles.statusActive,
    Expiring: styles.statusExpiring,
    Expired: styles.statusExpired,
  };
  return map[status] || styles.statusActive;
}

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function DiversityPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<"diversity" | "esg" | "certifications" | "regulatory">("diversity");

  return (
    <div className={styles.container}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t("supplierDiversity.title")}</h1>
          <p>{t("supplierDiversity.subtitle")}</p>
        </div>
        <button className={styles.reportBtn}>{t("supplierDiversity.generateReport")}</button>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────────────── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("supplierDiversity.diverseSuppliers")}</div>
          <div className={styles.statValue}>127</div>
          <div className={styles.statSub}>23.2% of supplier base</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("supplierDiversity.diversitySpend")}</div>
          <div className={styles.statValue}>$11.2M</div>
          <div className={styles.statWarn}>18.4% vs 25% target</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("supplierDiversity.avgEsgScore")}</div>
          <div className={styles.statValue}>72.8<span style={{ fontSize: "1rem", color: "#4E5969" }}>/100</span></div>
          <div className={styles.statChange}>+4.1 YoY</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("supplierDiversity.certificationsTracked")}</div>
          <div className={styles.statValue}>342</div>
          <div className={styles.statWarn}>12 expiring soon</div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === "diversity" ? styles.tabActive : ""}`} onClick={() => setActiveTab("diversity")}>
          {t("supplierDiversity.diversityDashboard")}
        </button>
        <button className={`${styles.tab} ${activeTab === "esg" ? styles.tabActive : ""}`} onClick={() => setActiveTab("esg")}>
          {t("supplierDiversity.esgScores")}
        </button>
        <button className={`${styles.tab} ${activeTab === "certifications" ? styles.tabActive : ""}`} onClick={() => setActiveTab("certifications")}>
          {t("supplierDiversity.certifications")}
        </button>
        <button className={`${styles.tab} ${activeTab === "regulatory" ? styles.tabActive : ""}`} onClick={() => setActiveTab("regulatory")}>
          {t("supplierDiversity.regulatory")}
        </button>
      </div>

      {/* ── Tab: Diversity Dashboard ───────────────────────────────────────── */}
      {activeTab === "diversity" && (
        <>
          <div className={styles.targetsSection}>
            {DIVERSITY_TARGETS.map((dt) => {
              const maxPct = Math.max(dt.target, dt.actual);
              const trackMax = maxPct + 2; // a little headroom
              return (
                <div key={dt.label} className={styles.targetRow}>
                  <span className={styles.targetLabel}>{dt.label}</span>
                  <div className={styles.targetTrack}>
                    <div
                      className={styles.targetFill}
                      style={{ width: `${(dt.actual / trackMax) * 100}%`, background: dt.color }}
                    />
                    <div
                      className={styles.targetMarker}
                      style={{ left: `${(dt.target / trackMax) * 100}%` }}
                      title={`Target: ${dt.target}%`}
                    />
                  </div>
                  <div className={styles.targetValues}>
                    <span className={`${styles.targetActual} ${dt.actual >= dt.target ? styles.targetMet : styles.targetNotMet}`}>
                      {dt.actual}%
                    </span>
                    {" / "}
                    {dt.target}% target
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.miniTableSection}>
            <div className={styles.miniTableTitle}>{t("supplierDiversity.topDiverseSuppliers")}</div>
            <table className={styles.miniTable}>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Annual Spend</th>
                  <th>Certifications</th>
                </tr>
              </thead>
              <tbody>
                {TOP_DIVERSE.map((s) => (
                  <tr key={s.name}>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td style={{ fontFamily: "monospace" }}>{s.spend}</td>
                    <td>
                      {s.certs.map((c) => (
                        <span key={c.label} className={`${styles.certBadge} ${c.className}`}>{c.label}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Insight */}
          <div className={styles.aiInsight}>
            <div className={styles.aiLabel}>Medius AI — Diversity Insight</div>
            <div className={styles.aiText}>
              Current diversity spend is at 18.4% against the 25% enterprise target, leaving a 6.6 percentage point gap ($4.0M).
            </div>
            <ul className={styles.aiBullets}>
              <li><strong>HUBZone shortfall</strong> is the largest gap (1.9% vs 3% target). Only 2 active HUBZone suppliers in the network — recommend sourcing 5-8 additional HUBZone vendors in IT Services and Facilities categories.</li>
              <li><strong>Small Business</strong> category at 0.5% vs 2% target. Large spend concentration with enterprise suppliers is the primary driver. Recommend set-aside program for orders under $50K.</li>
              <li><strong>12 certifications expiring</strong> in the next 180 days. 2 have already expired (Heritage Craft Works Small Biz, NextGen HUBZone). Automated renewal campaigns should be triggered immediately.</li>
              <li><strong>Positive trend:</strong> MBE and WBE categories are approaching targets. Unity Tech Partners and Apex Minority Holdings have grown spend 34% YoY — model for expansion.</li>
            </ul>
          </div>
        </>
      )}

      {/* ── Tab: ESG Scores ────────────────────────────────────────────────── */}
      {activeTab === "esg" && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Environmental</th>
                <th>Social</th>
                <th>Governance</th>
                <th>Overall</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {ESG_SUPPLIERS.map((s) => {
                const arrow = getTrendArrow(s.trend);
                return (
                  <tr key={s.name}>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td><span className={getESGClass(s.environmental)}>{s.environmental}</span></td>
                    <td><span className={getESGClass(s.social)}>{s.social}</span></td>
                    <td><span className={getESGClass(s.governance)}>{s.governance}</span></td>
                    <td><span className={getESGClass(s.overall)}>{s.overall}</span></td>
                    <td><span className={arrow.className} style={{ fontSize: "1rem" }}>{arrow.symbol}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: Certifications ────────────────────────────────────────────── */}
      {activeTab === "certifications" && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Cert Type</th>
                <th>Issuer</th>
                <th>Valid From</th>
                <th>Valid To</th>
                <th>Status</th>
                <th>Days to Expiry</th>
              </tr>
            </thead>
            <tbody>
              {CERTIFICATIONS.map((c, i) => (
                <tr key={`${c.supplier}-${c.certType}-${i}`}>
                  <td style={{ fontWeight: 500 }}>{c.supplier}</td>
                  <td>{c.certType}</td>
                  <td style={{ fontSize: "0.75rem", color: "#4E5969" }}>{c.issuer}</td>
                  <td style={{ fontSize: "0.75rem", color: "#4E5969" }}>{c.validFrom}</td>
                  <td style={{ fontSize: "0.75rem", color: "#4E5969" }}>{c.validTo}</td>
                  <td><span className={`${styles.statusBadge} ${getStatusClass(c.status)}`}>{c.status}</span></td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                    {c.daysToExpiry !== null ? `${c.daysToExpiry}d` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: Regulatory ────────────────────────────────────────────────── */}
      {activeTab === "regulatory" && (
        <div className={styles.regulatoryGrid}>
          {REGULATIONS.map((reg) => (
            <div key={reg.name} className={styles.regCard}>
              <div className={styles.regTitle}>{reg.name}</div>
              <div className={`${styles.regStatus} ${reg.statusClass}`}>{reg.status}</div>
              <div className={styles.regMeta}>
                <div><span className={styles.regMetaLabel}>Last Audit:</span> {reg.auditDate}</div>
                <div><span className={styles.regMetaLabel}>Next Deadline:</span> {reg.nextDeadline}</div>
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#4E5969", marginTop: "0.75rem", lineHeight: 1.5 }}>
                {reg.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
