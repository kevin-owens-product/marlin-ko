"use client";

import { useState, useEffect, useCallback } from "react";
import { useT } from "@/lib/i18n/locale-context";
import { useCRUD } from "@/lib/hooks/use-crud";
import { useInlineEdit } from "@/lib/hooks/use-inline-edit";
import { useToast } from "@/components/ui/Toast";
import { EditableCell } from "@/components/inline-edit/EditableCell";
import { RowActions } from "@/components/inline-edit/RowActions";
import styles from "./contracts.module.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Contract {
  id: string;
  tenantId: string;
  supplierId: string;
  title: string;
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: string;
  autoRenew: boolean;
  terms: string;
  documentUrl: string;
  createdAt: string;
  updatedAt: string;
  // Populated by API join / virtual field
  supplierName?: string;
}

// ---------------------------------------------------------------------------
// Static sidebar data
// ---------------------------------------------------------------------------

const upcomingRenewals = [
  { title: "Raw Materials Supply", supplier: "EcoSupply Partners", date: "Feb 28, 2026", daysLeft: 29, urgency: "urgent" },
  { title: "Cloud Migration Services", supplier: "TechVault Solutions", date: "Mar 14, 2026", daysLeft: 43, urgency: "soon" },
  { title: "Strategy Consulting", supplier: "Vertex Consulting", date: "Mar 31, 2026", daysLeft: 60, urgency: "soon" },
  { title: "Freight & Logistics MSA", supplier: "Global Logistics Inc", date: "May 31, 2026", daysLeft: 121, urgency: "normal" },
  { title: "Electronics Components", supplier: "Quantum Electronics", date: "Jun 30, 2026", daysLeft: 151, urgency: "normal" },
  { title: "Construction Materials", supplier: "Atlas Building Materials", date: "Aug 31, 2026", daysLeft: 213, urgency: "normal" },
];

const sourcingEvents = [
  { title: "Office Furniture Procurement", sub: "RFP - 5 suppliers invited", status: "Active", statusClass: "sourcingActive" },
  { title: "IT Managed Services", sub: "Vendor evaluation phase", status: "Evaluation", statusClass: "sourcingEval" },
  { title: "Janitorial Services", sub: "Contract awarded to CleanPro", status: "Complete", statusClass: "sourcingComplete" },
  { title: "Fleet Vehicle Leasing", sub: "RFI responses due Feb 15", status: "Active", statusClass: "sourcingActive" },
];

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Expiring", value: "Expiring" },
  { label: "Expired", value: "Expired" },
  { label: "Renewal", value: "Renewal" },
  { label: "Draft", value: "Draft" },
];

function getStatusClass(status: string) {
  const map: Record<string, string> = {
    Active: styles.statusActive,
    Expiring: styles.statusExpiring,
    Expired: styles.statusExpired,
    Draft: styles.statusDraft,
    Renewal: styles.statusRenewal,
  };
  return map[status] || styles.statusDraft;
}

function getUrgencyClass(urgency: string) {
  const map: Record<string, string> = {
    urgent: styles.timelineUrgent,
    soon: styles.timelineSoon,
    normal: styles.timelineNormal,
  };
  return map[urgency] || styles.timelineNormal;
}

function getSourcingStatusClass(cls: string) {
  const map: Record<string, string> = {
    sourcingActive: styles.sourcingActive,
    sourcingEval: styles.sourcingEval,
    sourcingComplete: styles.sourcingComplete,
  };
  return map[cls] || styles.sourcingActive;
}

function formatCurrency(value: number | undefined, currency?: string) {
  if (value == null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ContractsPage() {
  const t = useT();
  const [filter, setFilter] = useState("All");
  const [saving, setSaving] = useState(false);

  const crud = useCRUD<Contract>({ endpoint: "/api/contracts", autoFetch: false });
  const inline = useInlineEdit<Contract>();
  const { addToast } = useToast();

  const statuses = ["All", "Active", "Expiring", "Renewal", "Draft"];

  // Fetch data when filter changes
  const loadContracts = useCallback(() => {
    const params: Record<string, string> = {};
    if (filter !== "All") {
      params.status = filter;
    }
    crud.fetchAll(params);
  }, [filter, crud.fetchAll]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  // ------- Save handler for editing -------
  const handleSaveEdit = async () => {
    if (!inline.editingId) return;
    setSaving(true);
    const result = await crud.update(inline.editingId, inline.editDraft);
    setSaving(false);
    if (result) {
      addToast({ type: "success", title: "Contract updated" });
      inline.cancelEdit();
    } else {
      addToast({ type: "error", title: "Failed to update contract", message: crud.error ?? undefined });
    }
  };

  // ------- Save handler for creating -------
  const handleSaveCreate = async () => {
    const draft = inline.createDraft;
    if (!draft.title || !draft.supplierId || !draft.value || !draft.startDate || !draft.endDate || !draft.tenantId) {
      addToast({ type: "warning", title: "Missing required fields", message: "Title, supplier, value, start date, end date, and tenant are required." });
      return;
    }
    setSaving(true);
    const result = await crud.create(draft);
    setSaving(false);
    if (result) {
      addToast({ type: "success", title: "Contract created" });
      inline.cancelCreate();
    } else {
      addToast({ type: "error", title: "Failed to create contract", message: crud.error ?? undefined });
    }
  };

  // ------- Delete handler -------
  const handleConfirmDelete = async (id: string) => {
    const success = await crud.remove(id);
    if (success) {
      addToast({ type: "success", title: "Contract deleted" });
      inline.cancelDelete();
    } else {
      addToast({ type: "error", title: "Failed to delete contract", message: crud.error ?? undefined });
    }
  };

  // ------- Add new contract -------
  const handleAddNew = () => {
    inline.startCreate({ status: "Draft", currency: "USD", autoRenew: false } as Partial<Contract>);
  };

  const contracts = crud.data;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t("contracts.title")}</h1>
          <p>{t("contracts.subtitle")}</p>
        </div>
        <button className={styles.newBtn} onClick={handleAddNew}>
          {t("contracts.createContract")}
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("contracts.activeContracts")}</div>
          <div className={styles.statValue}>{crud.pagination.totalCount || contracts.length}</div>
          <div className={styles.statSub}>Across all suppliers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("contracts.totalValue")}</div>
          <div className={styles.statValue}>
            {formatCurrency(contracts.reduce((sum, c) => sum + (c.value || 0), 0))}
          </div>
          <div className={styles.statSub}>Filtered contract value</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("contracts.expiringThisMonth")}</div>
          <div className={styles.statValue} style={{ color: "#FF9A2E" }}>
            {contracts.filter((c) => c.status === "Expiring").length}
          </div>
          <div className={`${styles.statSub} ${styles.statWarning}`}>Action needed</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Pending Renewal</div>
          <div className={styles.statValue} style={{ color: "#165DFF" }}>
            {contracts.filter((c) => c.status === "Renewal").length}
          </div>
          <div className={styles.statSub}>In negotiation</div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.mainPanel}>
          {/* Contracts table */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <span>Contracts</span>
              <span className={styles.cardCount}>{contracts.length}</span>
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "0.25rem", padding: "0.75rem 1.25rem", borderBottom: "1px solid #E5E6EB" }}>
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  style={{
                    padding: "0.375rem 0.75rem",
                    borderRadius: "9999px",
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: filter === s ? 600 : 400,
                    background: filter === s ? "#165DFF" : "transparent",
                    color: filter === s ? "#fff" : "#86909C",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {crud.loading && (
              <div style={{ padding: "2rem", textAlign: "center", color: "#86909C", fontSize: "0.875rem" }}>
                Loading contracts...
              </div>
            )}

            {crud.error && !crud.loading && (
              <div style={{ padding: "1rem 1.25rem", color: "#F76560", fontSize: "0.8125rem" }}>
                Error: {crud.error}
              </div>
            )}

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>{t("contracts.supplier")}</th>
                  <th>{t("contracts.value")}</th>
                  <th>{t("contracts.startDate")}</th>
                  <th>{t("contracts.endDate")}</th>
                  <th>{t("contracts.status")}</th>
                  <th>Auto-Renew</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* --- Create row --- */}
                {inline.isCreating && (
                  <tr>
                    <td>
                      <EditableCell
                        editing
                        value={inline.createDraft.title ?? ""}
                        onChange={(v) => inline.updateCreateField("title", v)}
                        placeholder="Contract title"
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing
                        value={(inline.createDraft as any).supplierName ?? ""}
                        onChange={(v) => inline.updateCreateField("supplierName" as keyof Contract, v)}
                        placeholder="Supplier name"
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing
                        type="number"
                        value={inline.createDraft.value ?? ""}
                        onChange={(v) => inline.updateCreateField("value", v)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing
                        type="date"
                        value={inline.createDraft.startDate ?? ""}
                        onChange={(v) => inline.updateCreateField("startDate", v)}
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing
                        type="date"
                        value={inline.createDraft.endDate ?? ""}
                        onChange={(v) => inline.updateCreateField("endDate", v)}
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing
                        type="select"
                        value={inline.createDraft.status ?? "Draft"}
                        onChange={(v) => inline.updateCreateField("status", v)}
                        options={STATUS_OPTIONS}
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing
                        type="select"
                        value={inline.createDraft.autoRenew ? "true" : "false"}
                        onChange={(v) => inline.updateCreateField("autoRenew", v === "true")}
                        options={[
                          { label: "Yes", value: "true" },
                          { label: "No", value: "false" },
                        ]}
                      />
                    </td>
                    <td>
                      <RowActions
                        mode="creating"
                        onSave={handleSaveCreate}
                        onCancel={inline.cancelCreate}
                        saving={saving}
                      />
                    </td>
                  </tr>
                )}

                {/* --- Data rows --- */}
                {contracts.map((c) => {
                  const isEditing = inline.editingId === c.id;
                  const isDeleting = inline.deleteConfirmId === c.id;

                  return (
                    <tr key={c.id}>
                      {/* Title */}
                      <td>
                        <EditableCell
                          editing={isEditing}
                          value={isEditing ? inline.editDraft.title : c.title}
                          onChange={(v) => inline.updateEditField("title", v)}
                          displayRender={(v) => <span className={styles.contractTitle}>{v}</span>}
                        />
                      </td>

                      {/* Supplier */}
                      <td>
                        <EditableCell
                          editing={isEditing}
                          value={isEditing ? (inline.editDraft as any).supplierName ?? "" : c.supplierName ?? ""}
                          onChange={(v) => inline.updateEditField("supplierName" as keyof Contract, v)}
                          displayRender={(v) => <span className={styles.supplierName}>{v}</span>}
                        />
                      </td>

                      {/* Value */}
                      <td>
                        <EditableCell
                          editing={isEditing}
                          type="number"
                          value={isEditing ? inline.editDraft.value : c.value}
                          onChange={(v) => inline.updateEditField("value", v)}
                          displayRender={(v) => (
                            <span className={styles.contractValue}>{formatCurrency(v, c.currency)}</span>
                          )}
                        />
                      </td>

                      {/* Start date */}
                      <td>
                        <EditableCell
                          editing={isEditing}
                          type="date"
                          value={isEditing ? inline.editDraft.startDate : c.startDate}
                          onChange={(v) => inline.updateEditField("startDate", v)}
                          displayRender={(v) => (
                            <span style={{ fontSize: "0.75rem", color: "#86909C" }}>{v}</span>
                          )}
                        />
                      </td>

                      {/* End date */}
                      <td>
                        <EditableCell
                          editing={isEditing}
                          type="date"
                          value={isEditing ? inline.editDraft.endDate : c.endDate}
                          onChange={(v) => inline.updateEditField("endDate", v)}
                          displayRender={(v) => (
                            <span style={{ fontSize: "0.75rem", color: "#86909C" }}>{v}</span>
                          )}
                        />
                      </td>

                      {/* Status */}
                      <td>
                        <EditableCell
                          editing={isEditing}
                          type="select"
                          value={isEditing ? inline.editDraft.status : c.status}
                          onChange={(v) => inline.updateEditField("status", v)}
                          options={STATUS_OPTIONS}
                          displayRender={(v) => (
                            <span className={`${styles.statusBadge} ${getStatusClass(v)}`}>{v}</span>
                          )}
                        />
                      </td>

                      {/* Auto-renew */}
                      <td>
                        <EditableCell
                          editing={isEditing}
                          type="select"
                          value={isEditing ? (inline.editDraft.autoRenew ? "true" : "false") : (c.autoRenew ? "true" : "false")}
                          onChange={(v) => inline.updateEditField("autoRenew", v === "true")}
                          options={[
                            { label: "Yes", value: "true" },
                            { label: "No", value: "false" },
                          ]}
                          displayRender={(v) => (
                            <span className={`${styles.autoRenew} ${v === "true" ? styles.autoYes : styles.autoNo}`}>
                              {v === "true" ? "Yes" : "No"}
                            </span>
                          )}
                        />
                      </td>

                      {/* Actions */}
                      <td>
                        <RowActions
                          mode={isDeleting ? "deleting" : isEditing ? "editing" : "read"}
                          onEdit={() => inline.startEdit(c.id, c)}
                          onDelete={() => inline.requestDelete(c.id)}
                          onSave={handleSaveEdit}
                          onCancel={inline.cancelEdit}
                          onConfirmDelete={() => handleConfirmDelete(c.id)}
                          onCancelDelete={inline.cancelDelete}
                          saving={saving}
                        />
                      </td>
                    </tr>
                  );
                })}

                {/* Empty state */}
                {!crud.loading && contracts.length === 0 && !inline.isCreating && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#86909C", fontSize: "0.875rem" }}>
                      No contracts found. Click &quot;{t("contracts.createContract")}&quot; to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Sourcing Events */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <span>Sourcing Events</span>
              <span className={styles.cardCount}>{sourcingEvents.length}</span>
            </div>
            <div className={styles.sourcingSection}>
              {sourcingEvents.map((event, i) => (
                <div key={i} className={styles.sourcingItem}>
                  <div>
                    <div className={styles.sourcingTitle}>{event.title}</div>
                    <div className={styles.sourcingSub}>{event.sub}</div>
                  </div>
                  <span className={`${styles.sourcingStatus} ${getSourcingStatusClass(event.statusClass)}`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sidePanel}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Upcoming Renewals</div>
            <div className={styles.timeline}>
              {upcomingRenewals.map((renewal, i) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={`${styles.timelineDot} ${getUrgencyClass(renewal.urgency)}`} />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineTitle}>{renewal.title}</div>
                    <div className={styles.timelineMeta}>{renewal.supplier}</div>
                    <div className={styles.timelineDate}>{renewal.date} ({renewal.daysLeft} days)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.aiInsight}>
              <div className={styles.aiLabel}>Medius AI Contract Insights</div>
              <div className={styles.aiText}>
                3 contracts expiring in the next 60 days represent $1.87M in annual spend. EcoSupply Partners renewal is highest priority due to elevated risk score (55). Recommend initiating parallel sourcing for alternative raw materials suppliers while negotiating renewal terms. TechVault migration contract completion is at 78% - consider extending 3 months to avoid scope gaps.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
