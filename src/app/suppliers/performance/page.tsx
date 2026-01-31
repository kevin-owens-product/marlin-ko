"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/locale-context";
import styles from "./performance.module.css";

/* ── Scoring Dimensions ─────────────────────────────────────────────────────── */

interface Dimension {
  name: string;
  weight: string;
  avg: number;
  color: string;
}

const DIMENSIONS: Dimension[] = [
  { name: "Delivery", weight: "25%", avg: 82.1, color: "#165DFF" },
  { name: "Quality", weight: "25%", avg: 76.8, color: "#a855f7" },
  { name: "Responsiveness", weight: "20%", avg: 71.4, color: "#FF9A2E" },
  { name: "Compliance", weight: "15%", avg: 84.2, color: "#23C343" },
  { name: "Cost", weight: "15%", avg: 77.9, color: "#ec4899" },
];

/* ── Supplier Scorecards ────────────────────────────────────────────────────── */

interface SupplierScore {
  name: string;
  overall: number;
  delivery: number;
  quality: number;
  responsiveness: number;
  compliance: number;
  cost: number;
  trend: number[]; // 5 data points
  quartile: 1 | 2 | 3 | 4;
}

const SUPPLIERS: SupplierScore[] = [
  { name: "TechVantage Inc", overall: 94, delivery: 96, quality: 92, responsiveness: 94, compliance: 98, cost: 88, trend: [88, 90, 91, 93, 94], quartile: 1 },
  { name: "EuroSupply GmbH", overall: 92, delivery: 90, quality: 94, responsiveness: 90, compliance: 96, cost: 90, trend: [86, 88, 90, 91, 92], quartile: 1 },
  { name: "Cloudbridge Solutions", overall: 91, delivery: 88, quality: 92, responsiveness: 96, compliance: 90, cost: 86, trend: [84, 86, 89, 90, 91], quartile: 1 },
  { name: "SilverLine Packaging", overall: 90, delivery: 94, quality: 88, responsiveness: 86, compliance: 92, cost: 90, trend: [82, 85, 87, 89, 90], quartile: 1 },
  { name: "Precision Tools AG", overall: 88, delivery: 86, quality: 90, responsiveness: 88, compliance: 88, cost: 86, trend: [80, 83, 85, 87, 88], quartile: 1 },
  { name: "Nordic Supply AS", overall: 87, delivery: 90, quality: 84, responsiveness: 82, compliance: 90, cost: 88, trend: [82, 84, 85, 86, 87], quartile: 1 },
  { name: "Pacific Freight Co", overall: 78, delivery: 82, quality: 76, responsiveness: 74, compliance: 80, cost: 78, trend: [72, 74, 75, 77, 78], quartile: 2 },
  { name: "Atlas Building Materials", overall: 74, delivery: 78, quality: 72, responsiveness: 68, compliance: 76, cost: 76, trend: [68, 70, 72, 73, 74], quartile: 2 },
  { name: "Meridian Logistics", overall: 71, delivery: 68, quality: 74, responsiveness: 72, compliance: 70, cost: 74, trend: [70, 71, 71, 72, 71], quartile: 3 },
  { name: "Quantum Electronics", overall: 65, delivery: 62, quality: 70, responsiveness: 58, compliance: 68, cost: 72, trend: [72, 70, 68, 66, 65], quartile: 3 },
  { name: "GreenTech Solutions", overall: 58, delivery: 54, quality: 62, responsiveness: 52, compliance: 64, cost: 60, trend: [64, 62, 60, 59, 58], quartile: 4 },
  { name: "Apex Manufacturing Ltd", overall: 52, delivery: 48, quality: 56, responsiveness: 44, compliance: 58, cost: 54, trend: [58, 56, 54, 53, 52], quartile: 4 },
];

/* ── AI Recommendations ─────────────────────────────────────────────────────── */

interface Recommendation {
  supplier: string;
  dimension: string;
  currentScore: number;
  recommendation: string;
  impact: "High" | "Medium" | "Low";
  expectedImprovement: string;
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    supplier: "Apex Manufacturing Ltd",
    dimension: "Responsiveness",
    currentScore: 44,
    recommendation: "Response time averages 6.2 days vs 2.1 day benchmark. Implement dedicated account manager and SLA escalation framework. Consider probationary status if no improvement in 60 days.",
    impact: "High",
    expectedImprovement: "+18 points to 62",
  },
  {
    supplier: "GreenTech Solutions",
    dimension: "Delivery",
    currentScore: 54,
    recommendation: "4 late deliveries in last quarter. Root cause: capacity constraints at primary facility. Recommend requiring secondary fulfillment facility or splitting orders across multiple suppliers.",
    impact: "High",
    expectedImprovement: "+12 points to 66",
  },
  {
    supplier: "Quantum Electronics",
    dimension: "Responsiveness",
    currentScore: 58,
    recommendation: "Declining trend over 5 quarters. Contact point turnover is a contributing factor. Request dedicated team assignment and weekly status calls for critical orders.",
    impact: "Medium",
    expectedImprovement: "+10 points to 68",
  },
  {
    supplier: "Meridian Logistics",
    dimension: "Delivery",
    currentScore: 68,
    recommendation: "On-time delivery at 78% vs 95% target. Weather-related delays account for 40%. Recommend pre-positioning inventory at regional hubs during peak seasons.",
    impact: "Medium",
    expectedImprovement: "+8 points to 76",
  },
  {
    supplier: "Atlas Building Materials",
    dimension: "Responsiveness",
    currentScore: 68,
    recommendation: "Quote turnaround averaging 5 days. Industry benchmark is 2 days. Suggest implementing digital RFQ portal to streamline quoting process.",
    impact: "Low",
    expectedImprovement: "+6 points to 74",
  },
];

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function getScoreClass(score: number) {
  if (score >= 85) return styles.scoreHigh;
  if (score >= 70) return styles.scoreMid;
  if (score >= 60) return styles.scoreLow;
  return styles.scoreVeryLow;
}

function getQuartileClass(q: number) {
  const map: Record<number, string> = { 1: styles.q1, 2: styles.q2, 3: styles.q3, 4: styles.q4 };
  return map[q] || styles.q2;
}

function getImpactClass(impact: string) {
  const map: Record<string, string> = { High: styles.impactHigh, Medium: styles.impactMedium, Low: styles.impactLow };
  return map[impact] || styles.impactLow;
}

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function PerformancePage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<"scorecards" | "rankings" | "recommendations">("scorecards");

  const topPerformers = SUPPLIERS.filter((s) => s.overall >= 90).length;
  const needsImprovement = SUPPLIERS.filter((s) => s.overall < 60).length;

  const quartileGroups = [
    { label: "Q1 — Top Performers (90+)", headerClass: styles.quartileHeaderQ1, suppliers: SUPPLIERS.filter((s) => s.quartile === 1) },
    { label: "Q2 — Good (70-89)", headerClass: styles.quartileHeaderQ2, suppliers: SUPPLIERS.filter((s) => s.quartile === 2) },
    { label: "Q3 — Fair (60-69)", headerClass: styles.quartileHeaderQ3, suppliers: SUPPLIERS.filter((s) => s.quartile === 3) },
    { label: "Q4 — Needs Improvement (<60)", headerClass: styles.quartileHeaderQ4, suppliers: SUPPLIERS.filter((s) => s.quartile === 4) },
  ];

  return (
    <div className={styles.container}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t("supplierPerformance.title")}</h1>
          <p>{t("supplierPerformance.subtitle")}</p>
        </div>
        <button className={styles.downloadBtn}>{t("supplierPerformance.downloadReport")}</button>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────────────── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("supplierPerformance.avgScore")}</div>
          <div className={styles.statValue}>78.4<span style={{ fontSize: "1rem", color: "#4E5969" }}>/100</span></div>
          <div className={styles.statChange}>+3.2 from last quarter</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("supplierPerformance.topPerformers")}</div>
          <div className={styles.statValue}>{topPerformers}</div>
          <div className={styles.statChange}>score &gt;90</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("supplierPerformance.needsImprovement")}</div>
          <div className={styles.statValue}>
            <span className={styles.statHighlight}>{needsImprovement}</span>
          </div>
          <div className={styles.statChange} style={{ color: "#FF9A2E" }}>score &lt;60</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("supplierPerformance.aiRecommendations")}</div>
          <div className={styles.statValue}>{RECOMMENDATIONS.length}</div>
          <div className={styles.statChange}>actionable insights</div>
        </div>
      </div>

      {/* ── Scoring Dimensions ─────────────────────────────────────────────── */}
      <div className={styles.dimensionsPanel}>
        <div className={styles.dimensionsTitle}>{t("supplierPerformance.scoringDimensions")}</div>
        {DIMENSIONS.map((dim) => (
          <div key={dim.name} className={styles.dimensionRow}>
            <span className={styles.dimensionLabel}>{dim.name}</span>
            <span className={styles.dimensionWeight}>{dim.weight}</span>
            <div className={styles.dimensionTrack}>
              <div
                className={styles.dimensionFill}
                style={{ width: `${dim.avg}%`, background: dim.color }}
              >
                <span className={styles.dimensionScore}>{dim.avg}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === "scorecards" ? styles.tabActive : ""}`} onClick={() => setActiveTab("scorecards")}>
          {t("supplierPerformance.supplierScorecards")}
        </button>
        <button className={`${styles.tab} ${activeTab === "rankings" ? styles.tabActive : ""}`} onClick={() => setActiveTab("rankings")}>
          {t("supplierPerformance.peerRankings")}
        </button>
        <button className={`${styles.tab} ${activeTab === "recommendations" ? styles.tabActive : ""}`} onClick={() => setActiveTab("recommendations")}>
          {t("supplierPerformance.aiRecommendationsTab")}
        </button>
      </div>

      {/* ── Tab: Scorecards ────────────────────────────────────────────────── */}
      {activeTab === "scorecards" && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Overall</th>
                <th>Delivery</th>
                <th>Quality</th>
                <th>Responsive</th>
                <th>Compliance</th>
                <th>Cost</th>
                <th>Trend</th>
                <th>Quartile</th>
              </tr>
            </thead>
            <tbody>
              {SUPPLIERS.map((s) => {
                const maxTrend = Math.max(...s.trend);
                return (
                  <tr key={s.name}>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td><span className={`${styles.scoreCell} ${getScoreClass(s.overall)}`}>{s.overall}</span></td>
                    <td><span className={`${styles.scoreCell} ${getScoreClass(s.delivery)}`}>{s.delivery}</span></td>
                    <td><span className={`${styles.scoreCell} ${getScoreClass(s.quality)}`}>{s.quality}</span></td>
                    <td><span className={`${styles.scoreCell} ${getScoreClass(s.responsiveness)}`}>{s.responsiveness}</span></td>
                    <td><span className={`${styles.scoreCell} ${getScoreClass(s.compliance)}`}>{s.compliance}</span></td>
                    <td><span className={`${styles.scoreCell} ${getScoreClass(s.cost)}`}>{s.cost}</span></td>
                    <td>
                      <div className={styles.sparkline}>
                        {s.trend.map((v, i) => (
                          <div
                            key={i}
                            className={styles.sparkBar}
                            style={{ height: `${(v / maxTrend) * 20}px` }}
                          />
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.quartileBadge} ${getQuartileClass(s.quartile)}`}>
                        Q{s.quartile}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: Peer Rankings ─────────────────────────────────────────────── */}
      {activeTab === "rankings" && (
        <div>
          {quartileGroups.map((group) => (
            <div key={group.label} className={styles.quartileGroup}>
              <div className={`${styles.quartileHeader} ${group.headerClass}`}>
                {group.label}
              </div>
              {group.suppliers.map((s) => (
                <div key={s.name} className={styles.rankItem}>
                  <span className={styles.rankName}>{s.name}</span>
                  <span className={`${styles.rankScore} ${getScoreClass(s.overall)}`}>{s.overall}/100</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: AI Recommendations ────────────────────────────────────────── */}
      {activeTab === "recommendations" && (
        <div className={styles.recsGrid}>
          {RECOMMENDATIONS.map((rec, i) => (
            <div key={i} className={styles.recCard}>
              <div className={styles.recHeader}>
                <span className={styles.recSupplier}>{rec.supplier}</span>
                <span className={`${styles.recImpact} ${getImpactClass(rec.impact)}`}>{rec.impact} Impact</span>
              </div>
              <div className={styles.recDimension}>
                {rec.dimension} &mdash; Current Score: <strong>{rec.currentScore}</strong>
              </div>
              <div className={styles.recText}>{rec.recommendation}</div>
              <div className={styles.recImprovement}>Expected improvement: {rec.expectedImprovement}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
