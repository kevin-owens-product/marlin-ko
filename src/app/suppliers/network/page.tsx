"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/locale-context";
import styles from "./network.module.css";

/* ── Stats ──────────────────────────────────────────────────────────────────── */

const STATS = [
  { labelKey: "supplierNetwork.totalSuppliers", value: "547,823", change: "+12,841 this quarter" },
  { labelKey: "supplierNetwork.connectedBuyers", value: "4,218", change: "+186 this quarter" },
  { labelKey: "supplierNetwork.processedAnnually", value: "$48.2B", change: "+8.6% YoY" },
  { labelKey: "supplierNetwork.healthScore", value: "94.2", change: "/100" },
];

/* ── Geographic Regions ─────────────────────────────────────────────────────── */

interface Region {
  name: string;
  suppliers: string;
  spend: string;
  growth: string;
  intensity: number; // 0-1 opacity
}

const REGIONS: Region[] = [
  { name: "North America", suppliers: "186,420", spend: "$18.4B", growth: "+6.2%", intensity: 0.9 },
  { name: "Western Europe", suppliers: "142,310", spend: "$12.8B", growth: "+4.8%", intensity: 0.75 },
  { name: "Nordics", suppliers: "68,540", spend: "$5.2B", growth: "+3.1%", intensity: 0.5 },
  { name: "APAC", suppliers: "62,180", spend: "$4.8B", growth: "+14.2%", intensity: 0.45 },
  { name: "UK & Ireland", suppliers: "41,290", spend: "$3.6B", growth: "+5.4%", intensity: 0.35 },
  { name: "DACH", suppliers: "28,430", spend: "$2.1B", growth: "+7.8%", intensity: 0.25 },
  { name: "Latin America", suppliers: "12,150", spend: "$0.9B", growth: "+18.6%", intensity: 0.15 },
  { name: "MEA", suppliers: "6,503", spend: "$0.4B", growth: "+22.1%", intensity: 0.1 },
];

/* ── Spend Concentration ────────────────────────────────────────────────────── */

interface SpendCategory {
  name: string;
  pct: number;
}

const SPEND_CATEGORIES: SpendCategory[] = [
  { name: "IT Services", pct: 26.6 },
  { name: "Professional Services", pct: 17.4 },
  { name: "Manufacturing", pct: 14.9 },
  { name: "Logistics", pct: 11.6 },
  { name: "Office Supplies", pct: 8.5 },
  { name: "Facilities", pct: 7.9 },
  { name: "Marketing", pct: 6.6 },
  { name: "Other", pct: 6.5 },
];

/* ── Network Growth ─────────────────────────────────────────────────────────── */

interface GrowthQuarter {
  label: string;
  count: number;
}

const GROWTH_DATA: GrowthQuarter[] = [
  { label: "Q1 2025", count: 489200 },
  { label: "Q2 2025", count: 504600 },
  { label: "Q3 2025", count: 518900 },
  { label: "Q4 2025", count: 534982 },
  { label: "Q1 2026", count: 547823 },
];

const maxGrowth = Math.max(...GROWTH_DATA.map((d) => d.count));

/* ── Top Clusters ───────────────────────────────────────────────────────────── */

interface Cluster {
  name: string;
  members: number;
}

const CLUSTERS: Cluster[] = [
  { name: "SAP Ecosystem", members: 2840 },
  { name: "Cloud Infrastructure", members: 1920 },
  { name: "Manufacturing DACH", members: 1540 },
  { name: "Logistics APAC", members: 1280 },
  { name: "Healthcare", members: 980 },
];

const maxCluster = Math.max(...CLUSTERS.map((c) => c.members));

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function NetworkPage() {
  const t = useT();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t("supplierNetwork.title")}</h1>
          <p>{t("supplierNetwork.subtitle")}</p>
        </div>
        <button className={styles.exportBtn}>{t("supplierNetwork.exportReport")}</button>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────────────── */}
      <div className={styles.statsGrid}>
        {STATS.map((stat) => (
          <div key={stat.labelKey} className={styles.statCard}>
            <div className={styles.statLabel}>{t(stat.labelKey)}</div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statChange}>{stat.change}</div>
          </div>
        ))}
      </div>

      {/* ── Two Column: Heat Map + Spend Bars ──────────────────────────────── */}
      <div className={styles.twoColumn}>
        {/* Left — Geographic Heat Map */}
        <div className={styles.panel}>
          <div className={styles.panelTitle}>{t("supplierNetwork.geographicReach")}</div>
          <div className={styles.heatMapGrid}>
            {REGIONS.map((region) => (
              <div
                key={region.name}
                className={styles.regionTile}
                style={{ background: `rgba(22,93,255,${region.intensity})` }}
                onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
              >
                <div className={styles.regionName} style={{ color: region.intensity > 0.5 ? "#fff" : "#1D2129" }}>
                  {region.name}
                </div>
                <div className={styles.regionStats}>
                  <div className={styles.regionStat}>
                    <span style={{ color: region.intensity > 0.5 ? "rgba(255,255,255,0.8)" : undefined }}>Suppliers</span>
                    <span className={styles.regionStatValue} style={{ color: region.intensity > 0.5 ? "#fff" : undefined }}>{region.suppliers}</span>
                  </div>
                  <div className={styles.regionStat}>
                    <span style={{ color: region.intensity > 0.5 ? "rgba(255,255,255,0.8)" : undefined }}>Spend</span>
                    <span className={styles.regionStatValue} style={{ color: region.intensity > 0.5 ? "#fff" : undefined }}>{region.spend}</span>
                  </div>
                </div>
                <div className={styles.regionGrowth} style={{ color: region.intensity > 0.5 ? "#a3e635" : "#23C343" }}>
                  {region.growth}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Spend Concentration */}
        <div className={styles.panel}>
          <div className={styles.panelTitle}>{t("supplierNetwork.spendConcentration")}</div>
          {SPEND_CATEGORIES.map((cat) => (
            <div key={cat.name} className={styles.spendBar}>
              <span className={styles.spendLabel}>{cat.name}</span>
              <div className={styles.spendTrack}>
                <div className={styles.spendFill} style={{ width: `${(cat.pct / 26.6) * 100}%` }}>
                  <span className={styles.spendPct}>{cat.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom 3-Column Grid ───────────────────────────────────────────── */}
      <div className={styles.bottomGrid}>
        {/* Network Growth */}
        <div className={styles.panel}>
          <div className={styles.panelTitle}>{t("supplierNetwork.networkGrowth")}</div>
          <div className={styles.barChart}>
            {GROWTH_DATA.map((q) => {
              const pct = (q.count / maxGrowth) * 100;
              return (
                <div key={q.label} className={styles.barGroup}>
                  <div className={styles.barValue}>{(q.count / 1000).toFixed(0)}K</div>
                  <div className={styles.bar} style={{ height: `${pct}%` }} />
                  <div className={styles.barLabel}>{q.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Supplier Clusters */}
        <div className={styles.panel}>
          <div className={styles.panelTitle}>{t("supplierNetwork.topClusters")}</div>
          <div className={styles.clusterList}>
            {CLUSTERS.map((cluster) => (
              <div key={cluster.name} className={styles.clusterItem}>
                <div>
                  <div className={styles.clusterName}>{cluster.name}</div>
                  <div className={styles.clusterMembers}>{cluster.members.toLocaleString()} members</div>
                </div>
                <div className={styles.clusterBar}>
                  <div className={styles.clusterBarFill} style={{ width: `${(cluster.members / maxCluster) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Network Intelligence */}
        <div className={styles.panel}>
          <div className={styles.panelTitle}>{t("supplierNetwork.aiInsights")}</div>
          <div className={styles.aiInsight}>
            <div className={styles.aiLabel}>Medius AI — Network Intelligence</div>
            <div className={styles.aiText}>
              The supplier network flywheel is accelerating. Each new buyer connection adds an average of 34 suppliers to the ecosystem, creating compounding data advantages.
            </div>
            <ul className={styles.aiBullets}>
              <li><strong>APAC growth (+14.2%)</strong> is outpacing all other regions — consider expanding APAC-specific onboarding resources.</li>
              <li><strong>Concentration risk:</strong> IT Services at 26.6% of spend exceeds the 25% diversification threshold. Recommend rebalancing.</li>
              <li><strong>SAP Ecosystem cluster</strong> (2,840 members) shows highest cross-buyer transaction density — a key network moat.</li>
              <li><strong>Recommendation:</strong> Prioritize Latin America and MEA supplier acquisition to capture high-growth emerging markets.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
