"use client";

import React, { useState } from "react";
import { useT } from "@/lib/i18n/locale-context";
import styles from "./onboarding-pipeline.module.css";

/* ── Pipeline Stages ────────────────────────────────────────────────────────── */

interface Stage {
  label: string;
  count: number;
  rate: string;
  colorClass: string;
}

const STAGES: Stage[] = [
  { label: "Invited", count: 284, rate: "", colorClass: styles.stageGray },
  { label: "Documents", count: 198, rate: "69.7%", colorClass: styles.stageBlue },
  { label: "Verification", count: 156, rate: "78.8%", colorClass: styles.stagePurple },
  { label: "Compliance", count: 134, rate: "85.9%", colorClass: styles.stageOrange },
  { label: "Active", count: 118, rate: "88.1%", colorClass: styles.stageGreen },
];

/* ── Funnel Data ────────────────────────────────────────────────────────────── */

const FUNNEL = [
  { label: "Invited — 284", widthPct: 100, colorClass: styles.funnelBarGray },
  { label: "Documents — 198 (69.7%)", widthPct: 69.7, colorClass: styles.funnelBarBlue },
  { label: "Verification — 156 (54.9%)", widthPct: 54.9, colorClass: styles.funnelBarPurple },
  { label: "Compliance — 134 (47.2%)", widthPct: 47.2, colorClass: styles.funnelBarOrange },
  { label: "Active — 118 (41.5%)", widthPct: 41.5, colorClass: styles.funnelBarGreen },
];

/* ── In-Flight Onboardees ───────────────────────────────────────────────────── */

interface Onboardee {
  name: string;
  contact: string;
  stage: string;
  stageBadge: string;
  daysInStage: number;
  totalDays: number;
  blocker: string | null;
  invitedBy: string;
}

const IN_FLIGHT: Onboardee[] = [
  { name: "Vertex Consulting Group", contact: "j.mueller@vertex.com", stage: "Documents", stageBadge: "badgeDocuments", daysInStage: 3, totalDays: 5, blocker: null, invitedBy: "Sarah Chen" },
  { name: "Meridian Logistics", contact: "ops@meridianlog.com", stage: "Documents", stageBadge: "badgeDocuments", daysInStage: 8, totalDays: 12, blocker: "Missing W-9", invitedBy: "James Park" },
  { name: "Nordic Supply AS", contact: "info@nordicsupply.no", stage: "Verification", stageBadge: "badgeVerification", daysInStage: 2, totalDays: 14, blocker: null, invitedBy: "Anna Lindgren" },
  { name: "Apex Manufacturing Ltd", contact: "procurement@apex.co.uk", stage: "Verification", stageBadge: "badgeVerification", daysInStage: 15, totalDays: 22, blocker: "Bank verification pending", invitedBy: "Tom Wilson" },
  { name: "SolarEdge Partners", contact: "onboard@solaredge.de", stage: "Documents", stageBadge: "badgeDocuments", daysInStage: 1, totalDays: 3, blocker: null, invitedBy: "Michael Schmidt" },
  { name: "Pacific Freight Co", contact: "vendor@pacificfreight.com", stage: "Compliance", stageBadge: "badgeCompliance", daysInStage: 6, totalDays: 18, blocker: null, invitedBy: "Sarah Chen" },
  { name: "Quantum Electronics", contact: "supply@quantum-elec.com", stage: "Compliance", stageBadge: "badgeCompliance", daysInStage: 11, totalDays: 28, blocker: "Insurance certificate expired", invitedBy: "James Park" },
  { name: "GreenTech Solutions", contact: "admin@greentech.eu", stage: "Documents", stageBadge: "badgeDocuments", daysInStage: 16, totalDays: 20, blocker: "Tax ID mismatch", invitedBy: "Anna Lindgren" },
  { name: "Atlas Building Materials", contact: "sales@atlasbm.com", stage: "Verification", stageBadge: "badgeVerification", daysInStage: 4, totalDays: 10, blocker: null, invitedBy: "Tom Wilson" },
  { name: "DataStream Analytics", contact: "hello@datastream.io", stage: "Compliance", stageBadge: "badgeCompliance", daysInStage: 9, totalDays: 24, blocker: "GDPR DPA review", invitedBy: "Michael Schmidt" },
  { name: "FastTrack Couriers", contact: "join@fasttrack.com", stage: "Documents", stageBadge: "badgeDocuments", daysInStage: 5, totalDays: 7, blocker: null, invitedBy: "Sarah Chen" },
  { name: "NovaPharma Ltd", contact: "compliance@novapharma.com", stage: "Verification", stageBadge: "badgeVerification", daysInStage: 7, totalDays: 16, blocker: null, invitedBy: "James Park" },
];

/* ── Recently Activated ─────────────────────────────────────────────────────── */

interface Activated {
  name: string;
  completedDate: string;
  totalDays: number;
  invitedBy: string;
}

const RECENTLY_ACTIVATED: Activated[] = [
  { name: "TechVantage Inc", completedDate: "2026-01-29", totalDays: 8, invitedBy: "Sarah Chen" },
  { name: "EuroSupply GmbH", completedDate: "2026-01-28", totalDays: 11, invitedBy: "Michael Schmidt" },
  { name: "Cloudbridge Solutions", completedDate: "2026-01-27", totalDays: 9, invitedBy: "Anna Lindgren" },
  { name: "SilverLine Packaging", completedDate: "2026-01-26", totalDays: 14, invitedBy: "Tom Wilson" },
  { name: "Precision Tools AG", completedDate: "2026-01-25", totalDays: 10, invitedBy: "James Park" },
  { name: "ClearView Analytics", completedDate: "2026-01-24", totalDays: 7, invitedBy: "Sarah Chen" },
  { name: "OmniTech Hardware", completedDate: "2026-01-23", totalDays: 16, invitedBy: "Michael Schmidt" },
  { name: "BrightPath Consulting", completedDate: "2026-01-22", totalDays: 12, invitedBy: "Anna Lindgren" },
  { name: "Nordic Digital AS", completedDate: "2026-01-21", totalDays: 13, invitedBy: "Tom Wilson" },
  { name: "FreshFields Catering", completedDate: "2026-01-20", totalDays: 9, invitedBy: "James Park" },
];

/* ── Helper ─────────────────────────────────────────────────────────────────── */

function getDaysClass(days: number) {
  if (days > 14) return styles.daysCritical;
  if (days > 7) return styles.daysWarning;
  return styles.daysNormal;
}

function getStageBadgeClass(badge: string): string {
  const map: Record<string, string> = {
    badgeDocuments: styles.badgeDocuments,
    badgeVerification: styles.badgeVerification,
    badgeCompliance: styles.badgeCompliance,
    badgeActive: styles.badgeActive,
    badgeInvited: styles.badgeInvited,
  };
  return map[badge] || styles.badgeInvited;
}

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function OnboardingPipelinePage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<"inflight" | "activated" | "bottleneck">("inflight");

  return (
    <div className={styles.container}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t("supplierOnboarding.title")}</h1>
          <p>{t("supplierOnboarding.subtitle")}</p>
        </div>
        <button className={styles.inviteBtn}>{t("supplierOnboarding.inviteSuppliers")}</button>
      </div>

      {/* ── Pipeline Stage Cards ───────────────────────────────────────────── */}
      <div className={styles.pipelineRow}>
        {STAGES.map((stage, i) => (
          <React.Fragment key={stage.label}>
            {i > 0 && <div className={styles.stageArrow}>&rarr;</div>}
            <div className={`${styles.stageCard} ${stage.colorClass}`}>
              <div className={styles.stageLabel}>{stage.label}</div>
              <div className={styles.stageValue}>{stage.count}</div>
              {stage.rate && <div className={styles.stageRate}>{stage.rate}</div>}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── Funnel Visualization ───────────────────────────────────────────── */}
      <div className={styles.funnelSection}>
        <div className={styles.funnelTitle}>{t("supplierOnboarding.conversionFunnel")}</div>
        <div className={styles.funnel}>
          {FUNNEL.map((step) => (
            <div
              key={step.label}
              className={`${styles.funnelBar} ${step.colorClass}`}
              style={{ width: `${step.widthPct}%` }}
            >
              {step.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Metrics Row ────────────────────────────────────────────────────── */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>{t("supplierOnboarding.overallConversion")}</div>
          <div className={styles.metricValue}>41.5%</div>
          <div className={styles.metricSub}>of invited suppliers activated</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>{t("supplierOnboarding.avgTimeToActivate")}</div>
          <div className={styles.metricValue}>12.4 days</div>
          <div className={styles.metricSub}>down from 18.2 days</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>{t("supplierOnboarding.stuckInPipeline")}</div>
          <div className={styles.metricValue}>14</div>
          <div className={styles.metricSubWarn}>&gt;30 days in pipeline</div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === "inflight" ? styles.tabActive : ""}`} onClick={() => setActiveTab("inflight")}>
          {t("supplierOnboarding.inFlight")}
        </button>
        <button className={`${styles.tab} ${activeTab === "activated" ? styles.tabActive : ""}`} onClick={() => setActiveTab("activated")}>
          {t("supplierOnboarding.recentlyActivated")}
        </button>
        <button className={`${styles.tab} ${activeTab === "bottleneck" ? styles.tabActive : ""}`} onClick={() => setActiveTab("bottleneck")}>
          {t("supplierOnboarding.bottleneckAnalysis")}
        </button>
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────────── */}
      {activeTab === "inflight" && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Contact</th>
                <th>Stage</th>
                <th>Days in Stage</th>
                <th>Total Days</th>
                <th>Blocker</th>
                <th>Invited By</th>
              </tr>
            </thead>
            <tbody>
              {IN_FLIGHT.map((row) => (
                <tr key={row.name}>
                  <td style={{ fontWeight: 500 }}>{row.name}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#4E5969" }}>{row.contact}</td>
                  <td>
                    <span className={`${styles.stageBadge} ${getStageBadgeClass(row.stageBadge)}`}>{row.stage}</span>
                  </td>
                  <td>
                    <span className={getDaysClass(row.daysInStage)}>{row.daysInStage}d</span>
                  </td>
                  <td>{row.totalDays}d</td>
                  <td>
                    {row.blocker ? (
                      <span className={styles.blockerBadge}>{row.blocker}</span>
                    ) : (
                      <span className={styles.noBlocker}>--</span>
                    )}
                  </td>
                  <td>{row.invitedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "activated" && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Completed</th>
                <th>Total Days</th>
                <th>Status</th>
                <th>Invited By</th>
              </tr>
            </thead>
            <tbody>
              {RECENTLY_ACTIVATED.map((row) => (
                <tr key={row.name}>
                  <td style={{ fontWeight: 500 }}>{row.name}</td>
                  <td style={{ fontSize: "0.75rem", color: "#4E5969" }}>{row.completedDate}</td>
                  <td><span className={styles.completedDays}>{row.totalDays}d</span></td>
                  <td><span className={styles.completedBadge}>Activated</span></td>
                  <td>{row.invitedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "bottleneck" && (
        <div className={styles.aiInsight}>
          <div className={styles.aiLabel}>Medius AI — Bottleneck Analysis</div>
          <div className={styles.aiText}>
            Analysis of 284 supplier onboarding journeys reveals key friction points in the activation pipeline. The overall conversion rate of 41.5% has improved from 34.8% last quarter, but significant optimization opportunities remain.
          </div>
          <ul className={styles.aiBullets}>
            <li><strong>Documents stage (30.3% drop-off)</strong> is the largest bottleneck. 62% of drop-offs cite &quot;complex document requirements.&quot; Recommend simplifying the W-9 and tax ID collection flow.</li>
            <li><strong>Verification stage</strong> averages 4.8 days — bank verification accounts for 78% of delays. Integrating with a real-time bank validation API could reduce this to &lt;1 day.</li>
            <li><strong>Compliance stage</strong> shows 85.9% pass-through but 3 suppliers have been stuck &gt;20 days due to expired insurance certificates. Automated renewal reminders would prevent this.</li>
            <li><strong>GreenTech Solutions</strong> and <strong>Quantum Electronics</strong> are critical — both are &gt;20 total days and have active blockers. Recommend manual outreach within 24 hours.</li>
            <li><strong>Top performer:</strong> Sarah Chen&apos;s invitees activate 2.3 days faster on average — consider sharing her onboarding communication templates team-wide.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
