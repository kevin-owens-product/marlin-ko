"use client";

import { useState, useCallback } from "react";
import { useT } from "@/lib/i18n/locale-context";
import { useCRUD } from "@/lib/hooks/use-crud";
import { useInlineEdit } from "@/lib/hooks/use-inline-edit";
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
  const [saving, setSaving] = useState(false);

  const tabs = ["All", "Draft", "Approved", "Partially Received", "Received", "Closed"];

  const statusParam = activeTab === "All" ? undefined : activeTab;

  const crud = useCRUD<PurchaseOrder>({
    endpoint: "/api/purchase-orders",
    defaultParams: statusParam ? { status: statusParam } : {},
  });

  const inline = useInlineEdit<PurchaseOrder>();
  const { addToast } = useToast();

  // Re-fetch when tab changes
  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      const params: Record<string, string> = tab === "All" ? {} : { status: tab };
      crud.fetchAll(params);
    },
    [crud],
  );

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
          <div className={`${styles.statSub}`}>${totalValue.toLocaleString()} total value</div>
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

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? styles.tabActive : styles.tab}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.tableWrapper}>
        {crud.loading && crud.data.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#86909C" }}>Loading...</div>
        ) : crud.error && crud.data.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#F76560" }}>{crud.error}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("purchaseOrders.poNumber")}</th>
                <th>{t("purchaseOrders.supplier")}</th>
                <th>{t("common.description")}</th>
                <th>{t("purchaseOrders.amount")}</th>
                <th>{t("purchaseOrders.status")}</th>
                <th>{t("purchaseOrders.orderDate")}</th>
                <th>Received</th>
                <th>{t("purchaseOrders.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {/* --- Create row --- */}
              {inline.isCreating && (
                <tr>
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
                    {/* PO Number */}
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? inline.editDraft.poNumber : po.poNumber}
                        onChange={(v) => inline.updateEditField("poNumber", v)}
                        displayRender={(val) => <span className={styles.poNumber}>{val}</span>}
                      />
                    </td>

                    {/* Supplier */}
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? inline.editDraft.supplierId : po.supplierId}
                        onChange={(v) => inline.updateEditField("supplierId", v)}
                        displayRender={(val) => <span className={styles.supplierName}>{val}</span>}
                      />
                    </td>

                    {/* Description */}
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? inline.editDraft.description : po.description}
                        onChange={(v) => inline.updateEditField("description", v)}
                      />
                    </td>

                    {/* Amount */}
                    <td>
                      <EditableCell
                        editing={isEditing}
                        type="number"
                        value={isEditing ? inline.editDraft.totalAmount : po.totalAmount}
                        onChange={(v) => inline.updateEditField("totalAmount", v)}
                        displayRender={(val) => (
                          <span className={styles.amount}>
                            ${(val ?? 0).toLocaleString()}
                          </span>
                        )}
                      />
                    </td>

                    {/* Status */}
                    <td>
                      <EditableCell
                        editing={isEditing}
                        type="select"
                        value={isEditing ? inline.editDraft.status : po.status}
                        onChange={(v) => inline.updateEditField("status", v)}
                        options={STATUS_OPTIONS}
                        displayRender={(val) => (
                          <span className={`${styles.statusBadge} ${getStatusClass(val)}`}>
                            {val}
                          </span>
                        )}
                      />
                    </td>

                    {/* Order Date */}
                    <td style={{ fontSize: "0.8125rem", color: "#86909C" }}>
                      {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : "--"}
                    </td>

                    {/* Received progress */}
                    <td>
                      <div className={styles.receivedBar}>
                        <div className={styles.barTrack}>
                          <div
                            className={styles.barFill}
                            style={{
                              width: `${pct}%`,
                              background: getBarColor(pct),
                            }}
                          />
                        </div>
                        <span className={styles.barLabel}>{pct}%</span>
                      </div>
                    </td>

                    {/* Actions */}
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
