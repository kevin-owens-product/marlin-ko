"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useT } from "@/lib/i18n/locale-context";
import { useCRUD } from "@/lib/hooks/use-crud";
import { useInlineEdit } from "@/lib/hooks/use-inline-edit";
import { useColumnResize } from "@/lib/hooks/use-column-resize";
import { useBulkSelect } from "@/lib/hooks/use-bulk-select";
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
  { label: "Active", value: "ACTIVE" },
  { label: "Expiring", value: "EXPIRING" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Terminated", value: "TERMINATED" },
];

const FILTER_TABS = ["All", "ACTIVE", "EXPIRING", "DRAFT", "EXPIRED", "TERMINATED"];

const TAB_LABELS: Record<string, string> = {
  All: "All",
  ACTIVE: "Active",
  EXPIRING: "Expiring",
  DRAFT: "Draft",
  EXPIRED: "Expired",
  TERMINATED: "Terminated",
};

const COLUMNS = [
  { key: "title", minWidth: 120, initialWidth: 180 },
  { key: "supplier", minWidth: 100, initialWidth: 140 },
  { key: "value", minWidth: 80, initialWidth: 110 },
  { key: "currency", minWidth: 60, initialWidth: 80 },
  { key: "startDate", minWidth: 80, initialWidth: 110 },
  { key: "endDate", minWidth: 80, initialWidth: 110 },
  { key: "status", minWidth: 80, initialWidth: 110 },
  { key: "autoRenew", minWidth: 70, initialWidth: 90 },
  { key: "actions", minWidth: 90, initialWidth: 100 },
];

function getStatusClass(status: string) {
  const map: Record<string, string> = {
    ACTIVE: styles.statusActive,
    EXPIRING: styles.statusExpiring,
    EXPIRED: styles.statusExpired,
    DRAFT: styles.statusDraft,
    TERMINATED: styles.statusTerminated,
  };
  return map[status] || styles.statusDraft;
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    ACTIVE: "Active",
    EXPIRING: "Expiring",
    EXPIRED: "Expired",
    DRAFT: "Draft",
    TERMINATED: "Terminated",
  };
  return map[status] || status;
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

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ContractsPage() {
  const t = useT();
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const crud = useCRUD<Contract>({ endpoint: "/api/contracts", autoFetch: false });
  const inline = useInlineEdit<Contract>();
  const bulk = useBulkSelect();
  const { addToast } = useToast();
  const { widths, onMouseDown } = useColumnResize(COLUMNS);
  const checkboxRef = useRef<HTMLInputElement>(null);

  // Fetch data when filter or search changes
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filter !== "All") params.status = filter;
    if (searchQuery) params.search = searchQuery;
    crud.fetchAll(params);
  }, [filter, searchQuery, crud.fetchAll]);

  const visibleIds = crud.data.map((c) => c.id);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = bulk.someSelected && !bulk.allSelected(visibleIds);
    }
  }, [bulk.someSelected, bulk.allSelected, visibleIds]);

  // ------- Save handler for editing -------
  const handleSaveEdit = useCallback(async () => {
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
  }, [inline, crud, addToast]);

  // ------- Save handler for creating -------
  const handleSaveCreate = useCallback(async () => {
    const draft = inline.createDraft;
    if (!draft.title || !draft.supplierId || !draft.value || !draft.startDate || !draft.endDate) {
      addToast({ type: "warning", title: "Missing required fields", message: "Title, supplier, value, start date, and end date are required." });
      return;
    }
    setSaving(true);
    const result = await crud.create({
      title: draft.title,
      supplierId: draft.supplierId,
      value: draft.value,
      currency: draft.currency ?? "USD",
      startDate: draft.startDate,
      endDate: draft.endDate,
      status: draft.status ?? "DRAFT",
      autoRenew: draft.autoRenew ?? false,
      tenantId: "default_tenant",
    } as Partial<Contract>);
    setSaving(false);
    if (result) {
      addToast({ type: "success", title: "Contract created" });
      inline.cancelCreate();
    } else {
      addToast({ type: "error", title: "Failed to create contract", message: crud.error ?? undefined });
    }
  }, [inline, crud, addToast]);

  // ------- Delete handler -------
  const handleConfirmDelete = useCallback(async () => {
    if (!inline.deleteConfirmId) return;
    setSaving(true);
    const ok = await crud.remove(inline.deleteConfirmId);
    setSaving(false);
    if (ok) {
      inline.cancelDelete();
      addToast({ type: "success", title: "Contract deleted" });
    } else {
      addToast({ type: "error", title: "Failed to delete contract", message: crud.error ?? undefined });
    }
  }, [inline, crud, addToast]);

  // ------- Add new contract -------
  const handleAddNew = useCallback(() => {
    inline.startCreate({ status: "DRAFT", currency: "USD", autoRenew: false } as Partial<Contract>);
  }, [inline]);

  const contracts = crud.data;
  const statusParam = filter === "All" ? undefined : filter;

  // ------- Derived stats -------
  const totalContracts = crud.pagination.totalCount || contracts.length;
  const activeContracts = contracts.filter((c) => c.status === "ACTIVE").length;
  const totalValue = contracts.reduce((sum, c) => sum + (c.value || 0), 0);
  const expiringContracts = contracts.filter((c) => c.status === "EXPIRING").length;

  function thStyle(key: string) {
    return widths[key] ? { width: widths[key], position: "relative" as const } : { position: "relative" as const };
  }

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
          <div className={styles.statLabel}>{t("contracts.totalContracts")}</div>
          <div className={styles.statValue}>{totalContracts}</div>
          <div className={styles.statSub}>Across all suppliers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("contracts.activeContracts")}</div>
          <div className={styles.statValue} style={{ color: "#23C343" }}>
            {activeContracts}
          </div>
          <div className={styles.statSub}>Currently active</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("contracts.totalValue")}</div>
          <div className={styles.statValue}>
            {formatCurrency(totalValue)}
          </div>
          <div className={styles.statSub}>Filtered contract value</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("contracts.expiringThisMonth")}</div>
          <div className={styles.statValue} style={{ color: "#FF9A2E" }}>
            {expiringContracts}
          </div>
          <div className={`${styles.statSub} ${styles.statWarning}`}>Action needed</div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.mainPanel}>
          {/* Bulk action bar */}
          {bulk.count > 0 && (
            <div className={styles.bulkBar}>
              <span className={styles.bulkCount}>{bulk.count} selected</span>
              <button className={styles.bulkBtn} onClick={() => {}}>Export</button>
              <button className={`${styles.bulkBtn} ${styles.bulkBtnDanger}`} onClick={() => {}}>Delete</button>
              <button className={styles.bulkBtnClear} onClick={bulk.clear}>Clear</button>
            </div>
          )}

          {/* Contracts table */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <span>Contracts</span>
              <span className={styles.cardCount}>{contracts.length}</span>
            </div>

            {/* Controls: filter tabs + search */}
            <div className={styles.controls}>
              <div className={styles.filterTabs}>
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab}
                    className={filter === tab ? styles.filterTabActive : styles.filterTab}
                    onClick={() => setFilter(tab)}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                ))}
              </div>
              <div className={styles.searchBar}>
                <span className={styles.searchIcon}>&#128269;</span>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search contracts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {crud.loading && contracts.length === 0 && (
              <div style={{ padding: "2rem", textAlign: "center", color: "#86909C", fontSize: "0.875rem" }}>
                Loading contracts...
              </div>
            )}

            {crud.error && !crud.loading && contracts.length === 0 && (
              <div style={{ padding: "1rem 1.25rem", color: "#F76560", fontSize: "0.8125rem" }}>
                Error: {crud.error}
              </div>
            )}

            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      ref={checkboxRef}
                      checked={bulk.allSelected(visibleIds)}
                      onChange={() => bulk.toggleAll(visibleIds)}
                    />
                  </th>
                  <th style={thStyle("title")}>
                    Title
                    <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("title", 120, e)} />
                  </th>
                  <th style={thStyle("supplier")}>
                    {t("contracts.supplier")}
                    <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("supplier", 100, e)} />
                  </th>
                  <th style={thStyle("value")}>
                    {t("contracts.value")}
                    <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("value", 80, e)} />
                  </th>
                  <th style={thStyle("currency")}>
                    Currency
                    <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("currency", 60, e)} />
                  </th>
                  <th style={thStyle("startDate")}>
                    {t("contracts.startDate")}
                    <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("startDate", 80, e)} />
                  </th>
                  <th style={thStyle("endDate")}>
                    {t("contracts.endDate")}
                    <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("endDate", 80, e)} />
                  </th>
                  <th style={thStyle("status")}>
                    {t("contracts.status")}
                    <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("status", 80, e)} />
                  </th>
                  <th style={thStyle("autoRenew")}>
                    Auto-Renew
                    <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("autoRenew", 70, e)} />
                  </th>
                  <th style={thStyle("actions")}>
                    {t("contracts.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* --- Create row --- */}
                {inline.isCreating && (
                  <tr>
                    <td />
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
                        value={inline.createDraft.supplierId ?? ""}
                        onChange={(v) => inline.updateCreateField("supplierId", v)}
                        placeholder="Supplier ID"
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
                        value={inline.createDraft.currency ?? "USD"}
                        onChange={(v) => inline.updateCreateField("currency", v)}
                        placeholder="USD"
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
                        value={inline.createDraft.status ?? "DRAFT"}
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
                      <td><input type="checkbox" checked={bulk.selected.has(c.id)} onChange={() => bulk.toggle(c.id)} /></td>
                      <td>
                        <EditableCell
                          editing={isEditing}
                          value={isEditing ? inline.editDraft.title : c.title}
                          onChange={(v) => inline.updateEditField("title", v)}
                          displayRender={(v) => <span className={styles.contractTitle}>{v}</span>}
                        />
                      </td>
                      <td>
                        <EditableCell
                          editing={isEditing}
                          value={isEditing ? inline.editDraft.supplierId : c.supplierId}
                          onChange={(v) => inline.updateEditField("supplierId", v)}
                          displayRender={(v) => <span className={styles.supplierName}>{v}</span>}
                        />
                      </td>
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
                      <td>
                        <EditableCell
                          editing={isEditing}
                          value={isEditing ? inline.editDraft.currency : c.currency}
                          onChange={(v) => inline.updateEditField("currency", v)}
                        />
                      </td>
                      <td>
                        <EditableCell
                          editing={isEditing}
                          type="date"
                          value={isEditing ? inline.editDraft.startDate : c.startDate}
                          onChange={(v) => inline.updateEditField("startDate", v)}
                          displayRender={(v) => (
                            <span style={{ fontSize: "0.75rem", color: "#86909C" }}>{formatDate(v)}</span>
                          )}
                        />
                      </td>
                      <td>
                        <EditableCell
                          editing={isEditing}
                          type="date"
                          value={isEditing ? inline.editDraft.endDate : c.endDate}
                          onChange={(v) => inline.updateEditField("endDate", v)}
                          displayRender={(v) => (
                            <span style={{ fontSize: "0.75rem", color: "#86909C" }}>{formatDate(v)}</span>
                          )}
                        />
                      </td>
                      <td>
                        <EditableCell
                          editing={isEditing}
                          type="select"
                          value={isEditing ? inline.editDraft.status : c.status}
                          onChange={(v) => inline.updateEditField("status", v)}
                          options={STATUS_OPTIONS}
                          displayRender={(v) => (
                            <span className={`${styles.statusBadge} ${getStatusClass(v)}`}>{getStatusLabel(v)}</span>
                          )}
                        />
                      </td>
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
                      <td>
                        <RowActions
                          mode={isDeleting ? "deleting" : isEditing ? "editing" : "read"}
                          onEdit={() => inline.startEdit(c.id, c)}
                          onDelete={() => inline.requestDelete(c.id)}
                          onSave={handleSaveEdit}
                          onCancel={inline.cancelEdit}
                          onConfirmDelete={handleConfirmDelete}
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
                    <td colSpan={10} style={{ textAlign: "center", padding: "2rem", color: "#86909C", fontSize: "0.875rem" }}>
                      No contracts found. Click &quot;{t("contracts.createContract")}&quot; to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className={styles.pagination}>
              <span className={styles.paginationInfo}>
                Showing {contracts.length} of {totalContracts} contracts
              </span>
              <div className={styles.paginationButtons}>
                <button
                  className={styles.pageButton}
                  disabled={!crud.pagination.hasPrevious}
                  onClick={() =>
                    crud.fetchAll({
                      page: String(crud.pagination.page - 1),
                      ...(statusParam ? { status: statusParam } : {}),
                      ...(searchQuery ? { search: searchQuery } : {}),
                    })
                  }
                >
                  Prev
                </button>
                <button className={`${styles.pageButton} ${styles.pageButtonActive}`}>
                  {crud.pagination.page}
                </button>
                <button
                  className={styles.pageButton}
                  disabled={!crud.pagination.hasNext}
                  onClick={() =>
                    crud.fetchAll({
                      page: String(crud.pagination.page + 1),
                      ...(statusParam ? { status: statusParam } : {}),
                      ...(searchQuery ? { search: searchQuery } : {}),
                    })
                  }
                >
                  Next
                </button>
              </div>
            </div>
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
