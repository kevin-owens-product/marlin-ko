"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useT } from "@/lib/i18n/locale-context";
import { useCRUD } from "@/lib/hooks/use-crud";
import { useBulkSelect } from "@/lib/hooks/use-bulk-select";
import { useInlineEdit } from "@/lib/hooks/use-inline-edit";
import { useColumnResize } from "@/lib/hooks/use-column-resize";
import { useToast } from "@/components/ui/Toast";
import { EditableCell } from "@/components/inline-edit/EditableCell";
import { RowActions } from "@/components/inline-edit/RowActions";
import styles from "./purchase-orders.module.css";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  totalAmount: number;
  currency: string;
  status: string;
  description: string;
  lineItems: any[];
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

const STATUS_OPTIONS = [
  { label: "Draft", value: "Draft" },
  { label: "Approved", value: "Approved" },
  { label: "Partially Received", value: "Partially Received" },
  { label: "Received", value: "Received" },
  { label: "Closed", value: "Closed" },
  { label: "Cancelled", value: "Cancelled" },
];

const COLUMNS = [
  { key: "poNumber", minWidth: 100, initialWidth: 160 },
  { key: "supplier", minWidth: 100, initialWidth: 150 },
  { key: "description", minWidth: 120, initialWidth: 200 },
  { key: "amount", minWidth: 80, initialWidth: 120 },
  { key: "status", minWidth: 90, initialWidth: 140 },
  { key: "orderDate", minWidth: 80, initialWidth: 110 },
  { key: "received", minWidth: 80, initialWidth: 110 },
  { key: "actions", minWidth: 90, initialWidth: 100 },
];

function getStatusClass(status: string) {
  const map: Record<string, string> = {
    Draft: styles.statusDraft,
    Approved: styles.statusApproved,
    "Partially Received": styles.statusPartial,
    Received: styles.statusReceived,
    Closed: styles.statusClosed,
    Cancelled: styles.statusCancelled,
  };
  return map[status] || styles.statusDraft;
}

function getBarColor(pct: number) {
  if (pct === 0) return "#E5E6EB";
  if (pct < 50) return "#FF9A2E";
  if (pct < 100) return "#165DFF";
  return "#23C343";
}

function receivedPercent(status: string): number {
  switch (status) {
    case "Received":
    case "Closed":
      return 100;
    case "Partially Received":
      return 50;
    default:
      return 0;
  }
}

export default function PurchaseOrdersPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const tabs = ["All", "Draft", "Approved", "Partially Received", "Received", "Closed"];

  const crud = useCRUD<PurchaseOrder>({
    endpoint: "/api/purchase-orders",
    autoFetch: false,
  });

  const inline = useInlineEdit<PurchaseOrder>();
  const bulk = useBulkSelect();
  const { addToast } = useToast();
  const { widths, onMouseDown } = useColumnResize(COLUMNS);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const visibleIds = crud.data.map((po) => po.id);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = bulk.someSelected && !bulk.allSelected(visibleIds);
    }
  }, [bulk.someSelected, bulk.allSelected, visibleIds]);

  // Re-fetch when tab or search changes
  useEffect(() => {
    const params: Record<string, string> = {};
    if (activeTab !== "All") params.status = activeTab;
    if (searchQuery) params.search = searchQuery;
    crud.fetchAll(params);
  }, [activeTab, searchQuery, crud.fetchAll]);

  // --- Create ---
  const handleStartCreate = useCallback(() => {
    inline.startCreate({
      poNumber: "",
      supplierId: "",
      description: "",
      totalAmount: 0,
      status: "Draft",
      currency: "USD",
      tenantId: "default_tenant",
    } as Partial<PurchaseOrder>);
  }, [inline]);

  const handleSaveCreate = useCallback(async () => {
    const draft = inline.createDraft;
    if (!draft.poNumber || !draft.supplierId) {
      addToast({ type: "warning", title: "PO Number and Supplier are required" });
      return;
    }
    setSaving(true);
    const result = await crud.create({
      poNumber: draft.poNumber,
      supplierId: draft.supplierId,
      totalAmount: draft.totalAmount ?? 0,
      currency: draft.currency ?? "USD",
      status: draft.status ?? "Draft",
      description: draft.description ?? "",
      lineItems: draft.lineItems ?? [],
      tenantId: draft.tenantId ?? "default_tenant",
    });
    setSaving(false);
    if (result) {
      inline.cancelCreate();
      addToast({ type: "success", title: "Purchase order created" });
    } else {
      addToast({ type: "error", title: "Failed to create purchase order", message: crud.error ?? undefined });
    }
  }, [inline, crud, addToast]);

  // --- Update ---
  const handleSaveEdit = useCallback(async () => {
    if (!inline.editingId) return;
    setSaving(true);
    const result = await crud.update(inline.editingId, inline.editDraft);
    setSaving(false);
    if (result) {
      inline.cancelEdit();
      addToast({ type: "success", title: "Purchase order updated" });
    } else {
      addToast({ type: "error", title: "Failed to update purchase order", message: crud.error ?? undefined });
    }
  }, [inline, crud, addToast]);

  // --- Delete ---
  const handleConfirmDelete = useCallback(async () => {
    if (!inline.deleteConfirmId) return;
    setSaving(true);
    const ok = await crud.remove(inline.deleteConfirmId);
    setSaving(false);
    if (ok) {
      inline.cancelDelete();
      addToast({ type: "success", title: "Purchase order deleted" });
    } else {
      addToast({ type: "error", title: "Failed to delete purchase order", message: crud.error ?? undefined });
    }
  }, [inline, crud, addToast]);

  // --- Derived stats ---
  const totalPOs = crud.pagination.totalCount || crud.data.length;
  const openPOs = crud.data.filter((po) => po.status === "Approved" || po.status === "Draft").length;
  const partialPOs = crud.data.filter((po) => po.status === "Partially Received").length;
  const closedPOs = crud.data.filter((po) => po.status === "Closed" || po.status === "Received").length;
  const totalValue = crud.data.reduce((sum, po) => sum + (po.totalAmount ?? 0), 0);
  const statusParam = activeTab === "All" ? undefined : activeTab;

  function thStyle(key: string) {
    return widths[key] ? { width: widths[key], position: "relative" as const } : { position: "relative" as const };
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t("purchaseOrders.title")}</h1>
          <p>{t("purchaseOrders.subtitle")}</p>
        </div>
        <button className={styles.createBtn} onClick={handleStartCreate}>
          {t("purchaseOrders.createPO")}
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("purchaseOrders.totalPOs")}</div>
          <div className={styles.statValue}>{totalPOs}</div>
          <div className={styles.statSub}>${totalValue.toLocaleString()} total value</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("purchaseOrders.openPOs")}</div>
          <div className={styles.statValue} style={{ color: "#165DFF" }}>
            {openPOs}
          </div>
          <div className={styles.statSub}>Draft &amp; Approved</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Partially Received</div>
          <div className={styles.statValue} style={{ color: "#FF9A2E" }}>
            {partialPOs}
          </div>
          <div className={styles.statSub}>Awaiting completion</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Closed / Received</div>
          <div className={styles.statValue} style={{ color: "#23C343" }}>
            {closedPOs}
          </div>
          <div className={styles.statSub}>Fulfilled</div>
        </div>
      </div>

      {/* Controls: Tabs + Search */}
      <div className={styles.controls}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>&#128269;</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search PO number, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {bulk.count > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>{bulk.count} selected</span>
          <button className={styles.bulkBtn} onClick={() => {}}>Export</button>
          <button className={`${styles.bulkBtn} ${styles.bulkBtnDanger}`} onClick={() => {}}>Delete</button>
          <button className={styles.bulkBtnClear} onClick={bulk.clear}>Clear</button>
        </div>
      )}

      <div className={styles.tableWrapper}>
        {crud.loading && crud.data.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#86909C" }}>Loading...</div>
        ) : crud.error && crud.data.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#F76560" }}>{crud.error}</div>
        ) : (
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
                <th style={thStyle("poNumber")}>
                  {t("purchaseOrders.poNumber")}
                  <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("poNumber", 100, e)} />
                </th>
                <th style={thStyle("supplier")}>
                  {t("purchaseOrders.supplier")}
                  <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("supplier", 100, e)} />
                </th>
                <th style={thStyle("description")}>
                  {t("common.description")}
                  <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("description", 120, e)} />
                </th>
                <th style={thStyle("amount")}>
                  {t("purchaseOrders.amount")}
                  <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("amount", 80, e)} />
                </th>
                <th style={thStyle("status")}>
                  {t("purchaseOrders.status")}
                  <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("status", 90, e)} />
                </th>
                <th style={thStyle("orderDate")}>
                  {t("purchaseOrders.orderDate")}
                  <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("orderDate", 80, e)} />
                </th>
                <th style={thStyle("received")}>
                  Received
                  <span className={styles.resizeHandle} onMouseDown={(e) => onMouseDown("received", 80, e)} />
                </th>
                <th style={thStyle("actions")}>
                  {t("purchaseOrders.actions")}
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
                      value={inline.createDraft.poNumber ?? ""}
                      onChange={(v) => inline.updateCreateField("poNumber", v)}
                      placeholder="PO-2024-XXXX"
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
                      value={inline.createDraft.description ?? ""}
                      onChange={(v) => inline.updateCreateField("description", v)}
                      placeholder="Description"
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      type="number"
                      value={inline.createDraft.totalAmount ?? 0}
                      onChange={(v) => inline.updateCreateField("totalAmount", v)}
                      placeholder="0"
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
                  <td style={{ fontSize: "0.8125rem", color: "#86909C" }}>--</td>
                  <td>--</td>
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
              {crud.data.map((po) => {
                const isEditing = inline.editingId === po.id;
                const isDeleting = inline.deleteConfirmId === po.id;
                const pct = receivedPercent(po.status);

                return (
                  <tr key={po.id}>
                    <td><input type="checkbox" checked={bulk.selected.has(po.id)} onChange={() => bulk.toggle(po.id)} /></td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? inline.editDraft.poNumber : po.poNumber}
                        onChange={(v) => inline.updateEditField("poNumber", v)}
                        displayRender={(val) => <span className={styles.poNumber}>{val}</span>}
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? inline.editDraft.supplierId : po.supplierId}
                        onChange={(v) => inline.updateEditField("supplierId", v)}
                        displayRender={(val) => <span className={styles.supplierName}>{val}</span>}
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? inline.editDraft.description : po.description}
                        onChange={(v) => inline.updateEditField("description", v)}
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        type="number"
                        value={isEditing ? inline.editDraft.totalAmount : po.totalAmount}
                        onChange={(v) => inline.updateEditField("totalAmount", v)}
                        displayRender={(val) => (
                          <span className={styles.amount}>${(val ?? 0).toLocaleString()}</span>
                        )}
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        type="select"
                        value={isEditing ? inline.editDraft.status : po.status}
                        onChange={(v) => inline.updateEditField("status", v)}
                        options={STATUS_OPTIONS}
                        displayRender={(val) => (
                          <span className={`${styles.statusBadge} ${getStatusClass(val)}`}>{val}</span>
                        )}
                      />
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "#86909C" }}>
                      {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : "--"}
                    </td>
                    <td>
                      <div className={styles.receivedBar}>
                        <div className={styles.barTrack}>
                          <div
                            className={styles.barFill}
                            style={{ width: `${pct}%`, background: getBarColor(pct) }}
                          />
                        </div>
                        <span className={styles.barLabel}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <RowActions
                        mode={isDeleting ? "deleting" : isEditing ? "editing" : "read"}
                        onEdit={() => inline.startEdit(po.id, po)}
                        onDelete={() => inline.requestDelete(po.id)}
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
              {!crud.loading && crud.data.length === 0 && !inline.isCreating && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "#86909C", fontSize: "0.875rem" }}>
                    No purchase orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Showing {crud.data.length} of {totalPOs} purchase orders
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
    </div>
  );
}
