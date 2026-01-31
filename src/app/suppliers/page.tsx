"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/locale-context";
import { useCRUD } from "@/lib/hooks/use-crud";
import { useInlineEdit } from "@/lib/hooks/use-inline-edit";
import { useToast } from "@/components/ui/Toast";
import { EditableCell } from "@/components/inline-edit/EditableCell";
import { RowActions } from "@/components/inline-edit/RowActions";
import styles from "./suppliers.module.css";

interface Supplier {
  id: string;
  name: string;
  email: string;
  taxId: string;
  category: string;
  riskScore: number;
  complianceStatus: string;
  paymentTerms: string;
  discountTerms: string;
  address: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const COMPLIANCE_OPTIONS = [
  { label: "Compliant", value: "compliant" },
  { label: "Non-Compliant", value: "non_compliant" },
  { label: "Pending", value: "pending" },
];

const CATEGORY_OPTIONS = [
  { label: "IT Services", value: "IT_SERVICES" },
  { label: "Office Supplies", value: "OFFICE_SUPPLIES" },
  { label: "Professional Services", value: "PROFESSIONAL_SERVICES" },
  { label: "Manufacturing", value: "MANUFACTURING" },
  { label: "Logistics", value: "LOGISTICS" },
];

function getRiskClass(score: number) {
  if (score <= 30) return styles.riskLow;
  if (score <= 60) return styles.riskMedium;
  return styles.riskHigh;
}

function getRiskColor(score: number) {
  if (score <= 30) return "#23C343";
  if (score <= 60) return "#FF9A2E";
  return "#F76560";
}

function getComplianceLabel(status: string) {
  const map: Record<string, string> = {
    compliant: "Compliant",
    non_compliant: "Non-Compliant",
    pending: "Pending",
  };
  return map[status] || status;
}

function getComplianceClass(status: string) {
  const map: Record<string, string> = {
    compliant: styles.complianceCompliant,
    non_compliant: styles.complianceNonCompliant,
    pending: styles.compliancePending,
    Compliant: styles.complianceCompliant,
    Partial: styles.compliancePartial,
    "Non-Compliant": styles.complianceNonCompliant,
    Pending: styles.compliancePending,
  };
  return map[status] || styles.compliancePending;
}

function getStatusLabel(isActive: boolean) {
  return isActive ? "Active" : "Inactive";
}

function getStatusClass(isActive: boolean) {
  return isActive ? styles.statusActive : styles.statusInactive;
}

function getCategoryLabel(category: string) {
  const map: Record<string, string> = {
    IT_SERVICES: "IT Services",
    OFFICE_SUPPLIES: "Office Supplies",
    PROFESSIONAL_SERVICES: "Professional Services",
    MANUFACTURING: "Manufacturing",
    LOGISTICS: "Logistics",
  };
  return map[category] || category;
}

const NEW_SUPPLIER_DEFAULTS: Partial<Supplier> = {
  name: "",
  email: "",
  taxId: "",
  category: "IT_SERVICES",
  riskScore: 0,
  complianceStatus: "pending",
  paymentTerms: "Net 30",
  discountTerms: "",
  address: "",
  phone: "",
  isActive: true,
};

export default function SuppliersPage() {
  const t = useT();
  const { addToast } = useToast();
  const crud = useCRUD<Supplier>({ endpoint: "/api/suppliers" });
  const inline = useInlineEdit<Supplier>();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search - re-fetch from API when search changes
  const doFetch = useCallback(
    (searchQuery: string, category: string) => {
      const params: Record<string, string> = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (category !== "All") params.category = category;
      crud.fetchAll(params);
    },
    [crud.fetchAll]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doFetch(search, filterCategory);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, filterCategory, doFetch]);

  // Build category list from fetched data
  const categories = [
    "All",
    ...Array.from(new Set(crud.data.map((s) => s.category).filter(Boolean))),
  ];

  // --- Handlers ---

  const handleSave = async () => {
    const result = await crud.update(inline.editingId!, inline.editDraft);
    if (result) {
      inline.cancelEdit();
      addToast({ type: "success", title: t("common.updateSuccess") });
    } else {
      addToast({ type: "error", title: t("common.errorSaving") });
    }
  };

  const handleCreate = async () => {
    const result = await crud.create(inline.createDraft);
    if (result) {
      inline.cancelCreate();
      addToast({ type: "success", title: t("common.createSuccess") });
    } else {
      addToast({ type: "error", title: t("common.errorSaving") });
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await crud.remove(id);
    inline.cancelDelete();
    addToast({
      type: ok ? "success" : "error",
      title: t(ok ? "common.deleteSuccess" : "common.errorDeleting"),
    });
  };

  // --- Rendering helpers ---

  const renderRow = (s: Supplier) => {
    const isEditing = inline.editingId === s.id;
    const isDeleting = inline.deleteConfirmId === s.id;

    return (
      <tr key={s.id}>
        {/* Name */}
        <td>
          <EditableCell
            editing={isEditing}
            value={isEditing ? inline.editDraft.name : s.name}
            onChange={(v) => inline.updateEditField("name", v)}
            placeholder="Supplier name"
            displayRender={(val) =>
              <Link href={`/suppliers/${s.id}`} className={styles.supplierName}>
                {val}
              </Link>
            }
          />
        </td>
        {/* Email */}
        <td>
          <EditableCell
            editing={isEditing}
            value={isEditing ? inline.editDraft.email : s.email}
            onChange={(v) => inline.updateEditField("email", v)}
            placeholder="email@example.com"
            displayRender={(val) => <span className={styles.supplierId}>{val || "—"}</span>}
          />
        </td>
        {/* Category */}
        <td>
          <EditableCell
            editing={isEditing}
            value={isEditing ? inline.editDraft.category : s.category}
            onChange={(v) => inline.updateEditField("category", v)}
            type="select"
            options={CATEGORY_OPTIONS}
            displayRender={(val) => (
              <span className={styles.categoryBadge}>{getCategoryLabel(val)}</span>
            )}
          />
        </td>
        {/* Risk Score */}
        <td>
          <EditableCell
            editing={isEditing}
            value={isEditing ? inline.editDraft.riskScore : s.riskScore}
            onChange={(v) => inline.updateEditField("riskScore", v)}
            type="number"
            displayRender={(val) => (
              <span className={`${styles.riskScore} ${getRiskClass(val)}`}>
                <span className={styles.riskDot} style={{ background: getRiskColor(val) }} />
                {val}
              </span>
            )}
          />
        </td>
        {/* Compliance */}
        <td>
          <EditableCell
            editing={isEditing}
            value={isEditing ? inline.editDraft.complianceStatus : s.complianceStatus}
            onChange={(v) => inline.updateEditField("complianceStatus", v)}
            type="select"
            options={COMPLIANCE_OPTIONS}
            displayRender={(val) => (
              <span className={`${styles.complianceBadge} ${getComplianceClass(val)}`}>
                {getComplianceLabel(val)}
              </span>
            )}
          />
        </td>
        {/* Payment Terms */}
        <td>
          <EditableCell
            editing={isEditing}
            value={isEditing ? inline.editDraft.paymentTerms : s.paymentTerms}
            onChange={(v) => inline.updateEditField("paymentTerms", v)}
            placeholder="Net 30"
          />
        </td>
        {/* Phone */}
        <td>
          <EditableCell
            editing={isEditing}
            value={isEditing ? inline.editDraft.phone : s.phone}
            onChange={(v) => inline.updateEditField("phone", v)}
            placeholder="+1 555-0100"
            displayRender={(val) => <span>{val || "—"}</span>}
          />
        </td>
        {/* Status */}
        <td>
          <span className={`${styles.statusBadge} ${getStatusClass(s.isActive)}`}>
            {getStatusLabel(s.isActive)}
          </span>
        </td>
        {/* Actions */}
        <td className={styles.actionsCell}>
          <RowActions
            mode={isDeleting ? "deleting" : isEditing ? "editing" : "read"}
            onEdit={() => inline.startEdit(s.id, s)}
            onDelete={() => inline.requestDelete(s.id)}
            onSave={handleSave}
            onCancel={() => inline.cancelEdit()}
            onConfirmDelete={() => handleDelete(s.id)}
            onCancelDelete={() => inline.cancelDelete()}
          />
        </td>
      </tr>
    );
  };

  const renderCreateRow = () => {
    if (!inline.isCreating) return null;

    return (
      <tr>
        {/* Name */}
        <td>
          <EditableCell
            editing
            value={inline.createDraft.name}
            onChange={(v) => inline.updateCreateField("name", v)}
            placeholder="Supplier name"
          />
        </td>
        {/* Email */}
        <td>
          <EditableCell
            editing
            value={inline.createDraft.email}
            onChange={(v) => inline.updateCreateField("email", v)}
            placeholder="email@example.com"
          />
        </td>
        {/* Category */}
        <td>
          <EditableCell
            editing
            value={inline.createDraft.category}
            onChange={(v) => inline.updateCreateField("category", v)}
            type="select"
            options={CATEGORY_OPTIONS}
          />
        </td>
        {/* Risk Score */}
        <td>
          <EditableCell
            editing
            value={inline.createDraft.riskScore}
            onChange={(v) => inline.updateCreateField("riskScore", v)}
            type="number"
            placeholder="0"
          />
        </td>
        {/* Compliance */}
        <td>
          <EditableCell
            editing
            value={inline.createDraft.complianceStatus}
            onChange={(v) => inline.updateCreateField("complianceStatus", v)}
            type="select"
            options={COMPLIANCE_OPTIONS}
          />
        </td>
        {/* Payment Terms */}
        <td>
          <EditableCell
            editing
            value={inline.createDraft.paymentTerms}
            onChange={(v) => inline.updateCreateField("paymentTerms", v)}
            placeholder="Net 30"
          />
        </td>
        {/* Phone */}
        <td>
          <EditableCell
            editing
            value={inline.createDraft.phone}
            onChange={(v) => inline.updateCreateField("phone", v)}
            placeholder="+1 555-0100"
          />
        </td>
        {/* Status */}
        <td>
          <span className={`${styles.statusBadge} ${styles.statusNew}`}>New</span>
        </td>
        {/* Actions */}
        <td className={styles.actionsCell}>
          <RowActions
            mode="creating"
            onSave={handleCreate}
            onCancel={() => inline.cancelCreate()}
          />
        </td>
      </tr>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t("suppliers.title")}</h1>
          <p>{t("suppliers.subtitle")}</p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => inline.startCreate(NEW_SUPPLIER_DEFAULTS)}
        >
          {t("suppliers.addSupplier")}
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("suppliers.totalSuppliers")}</div>
          <div className={styles.statValue}>{crud.pagination.totalCount}</div>
          <div className={`${styles.statChange} ${styles.statUp}`}>+5.2% from last quarter</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t("common.active")}</div>
          <div className={styles.statValue}>
            {crud.data.filter((s) => s.isActive).length}
          </div>
          <div className={`${styles.statChange} ${styles.statUp}`}>
            {crud.pagination.totalCount > 0
              ? `${((crud.data.filter((s) => s.isActive).length / Math.max(crud.data.length, 1)) * 100).toFixed(1)}% of page`
              : "—"}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>At Risk</div>
          <div className={styles.statValue} style={{ color: "#F76560" }}>
            {crud.data.filter((s) => s.riskScore > 60).length}
          </div>
          <div className={`${styles.statChange} ${styles.statDown}`}>High risk score (&gt;60)</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Non-Compliant</div>
          <div className={styles.statValue} style={{ color: "#165DFF" }}>
            {crud.data.filter((s) => s.complianceStatus === "non_compliant").length}
          </div>
          <div className={`${styles.statChange} ${styles.statDown}`}>Requires attention</div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>&#128269;</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search suppliers by name, email, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.filterButton}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ appearance: "auto" }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All" : getCategoryLabel(c)}
            </option>
          ))}
        </select>
        <button className={styles.filterButton}>{t("common.export")}</button>
      </div>

      {crud.error && (
        <div style={{ color: "#F76560", marginBottom: "1rem", fontSize: "0.875rem" }}>
          {crud.error}
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("common.name")}</th>
              <th>{t("common.email")}</th>
              <th>{t("suppliers.category")}</th>
              <th>{t("suppliers.riskScore")}</th>
              <th>Compliance</th>
              <th>Payment Terms</th>
              <th>Phone</th>
              <th>{t("common.status")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {renderCreateRow()}
            {crud.loading && crud.data.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "2rem" }}>
                  {t("common.loading")}
                </td>
              </tr>
            ) : crud.data.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "2rem" }}>
                  {t("common.noData")}
                </td>
              </tr>
            ) : (
              crud.data.map(renderRow)
            )}
          </tbody>
        </table>
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            {t("common.showingOf", {
              count: String(crud.data.length),
              total: String(crud.pagination.totalCount),
            })}{" "}
            suppliers
          </span>
          <div className={styles.paginationButtons}>
            <button
              className={styles.pageButton}
              disabled={!crud.pagination.hasPrevious}
              onClick={() =>
                crud.fetchAll({
                  page: String(crud.pagination.page - 1),
                  ...(search.trim() ? { search: search.trim() } : {}),
                  ...(filterCategory !== "All" ? { category: filterCategory } : {}),
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
                  ...(search.trim() ? { search: search.trim() } : {}),
                  ...(filterCategory !== "All" ? { category: filterCategory } : {}),
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
