'use client';

import { useState, useCallback } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { useCRUD } from '@/lib/hooks/use-crud';
import { useInlineEdit } from '@/lib/hooks/use-inline-edit';
import { useToast } from '@/components/ui/Toast';
import { EditableCell } from '@/components/inline-edit/EditableCell';
import { RowActions } from '@/components/inline-edit/RowActions';
import styles from './scf.module.css';

interface SCFProgram {
  id: string;
  tenantId: string;
  funder: string;
  programSize: number;
  utilization: number;
  rateRangeMin: number;
  rateRangeMax: number;
  suppliers: number;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Paused', value: 'PAUSED' },
  { label: 'Closed', value: 'CLOSED' },
];

const pendingApprovals = [
  { supplier: 'Acme Corp', invoice: 'INV-8901', amount: '$45,200', requestedAccel: '30 days', fee: '$678', program: 'Taulia', status: 'Approved' },
  { supplier: 'Global Logistics Inc', invoice: 'INV-8902', amount: '$128,400', requestedAccel: '45 days', fee: '$2,568', program: 'C2FO', status: 'In Review' },
  { supplier: 'TechParts Ltd', invoice: 'INV-8903', amount: '$22,800', requestedAccel: '20 days', fee: '$228', program: 'PrimeRevenue', status: 'Approved' },
  { supplier: 'Metro Freight', invoice: 'INV-8904', amount: '$67,500', requestedAccel: '35 days', fee: '$1,013', program: 'Taulia', status: 'Submitted' },
  { supplier: 'EuroParts GmbH', invoice: 'INV-8905', amount: '$34,600', requestedAccel: '25 days', fee: '$433', program: 'C2FO', status: 'Approved' },
  { supplier: 'NorthStar Logistics', invoice: 'INV-8906', amount: '$89,300', requestedAccel: '40 days', fee: '$1,607', program: 'Orbian', status: 'In Review' },
  { supplier: 'DataFlow Systems', invoice: 'INV-8907', amount: '$15,600', requestedAccel: '15 days', fee: '$117', program: 'PrimeRevenue', status: 'Approved' },
  { supplier: 'Precision Tools Inc', invoice: 'INV-8908', amount: '$52,100', requestedAccel: '30 days', fee: '$781', program: 'Taulia', status: 'Submitted' },
  { supplier: 'Pacific Imports', invoice: 'INV-8909', amount: '$41,200', requestedAccel: '45 days', fee: '$824', program: 'C2FO', status: 'In Review' },
  { supplier: 'CoreTech Industries', invoice: 'INV-8910', amount: '$76,800', requestedAccel: '30 days', fee: '$1,152', program: 'Greensill Capital', status: 'Approved' },
];

const supplierOnboarding = [
  { supplier: 'Atlas Manufacturing', stages: ['Invited', 'Documents', 'KYC', 'Active'], currentStage: 3, program: 'Taulia' },
  { supplier: 'Summit Marketing', stages: ['Invited', 'Documents', 'KYC', 'Active'], currentStage: 1, program: 'C2FO' },
  { supplier: 'Henderson Legal', stages: ['Invited', 'Documents', 'KYC', 'Active'], currentStage: 0, program: 'PrimeRevenue' },
  { supplier: 'BlueWave Media', stages: ['Invited', 'Documents', 'KYC', 'Active'], currentStage: 2, program: 'Taulia' },
  { supplier: 'Quantum Research', stages: ['Invited', 'Documents', 'KYC', 'Active'], currentStage: 1, program: 'Orbian' },
  { supplier: 'Silverline Distributors', stages: ['Invited', 'Documents', 'KYC', 'Active'], currentStage: 3, program: 'C2FO' },
  { supplier: 'ClearView Analytics', stages: ['Invited', 'Documents', 'KYC', 'Active'], currentStage: 2, program: 'PrimeRevenue' },
  { supplier: 'GreenEnergy Solutions', stages: ['Invited', 'Documents', 'KYC', 'Active'], currentStage: 3, program: 'Taulia' },
];

const wcBefore = [
  { label: 'DPO (Days Payable)', value: '30 days' },
  { label: 'Cash Position', value: '$12.8M' },
  { label: 'Cost of Financing', value: '4.8%' },
  { label: 'Working Capital', value: '$9.5M' },
  { label: 'Supplier Satisfaction', value: '72%' },
];

const wcAfter = [
  { label: 'DPO (Days Payable)', value: '42 days', improved: true },
  { label: 'Cash Position', value: '$15.2M', improved: true },
  { label: 'Cost of Financing', value: '3.2%', improved: true },
  { label: 'Working Capital', value: '$12.1M', improved: true },
  { label: 'Supplier Satisfaction', value: '89%', improved: true },
];

function getApprovalBadgeClass(status: string) {
  const map: Record<string, string> = {
    Approved: styles.badgeApproved,
    'In Review': styles.badgeInReview,
    Submitted: styles.badgeSubmitted,
  };
  return `${styles.badge} ${map[status] || ''}`;
}

function getStatusBadgeClass(status: string) {
  const map: Record<string, string> = {
    ACTIVE: styles.badgeApproved,
    PAUSED: styles.badgeInReview,
    CLOSED: styles.badgeSubmitted,
  };
  return `${styles.badge} ${map[status] || ''}`;
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'Active',
    PAUSED: 'Paused',
    CLOSED: 'Closed',
  };
  return map[status] || status;
}

function getStageDotClass(stageIndex: number, currentStage: number) {
  if (stageIndex < currentStage) return styles.stageDotComplete;
  if (stageIndex === currentStage) return styles.stageDotCurrent;
  return styles.stageDotPending;
}

function getStageTextClass(stageIndex: number, currentStage: number) {
  if (stageIndex < currentStage) return styles.stageComplete;
  if (stageIndex === currentStage) return styles.stageCurrent;
  return styles.stagePending;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

export default function SupplyChainFinancePage() {
  const t = useT();
  const [saving, setSaving] = useState(false);

  const crud = useCRUD<SCFProgram>({
    endpoint: '/api/scf-programs',
  });

  const inline = useInlineEdit<SCFProgram>();
  const { addToast } = useToast();

  // --- Create ---
  const handleStartCreate = useCallback(() => {
    inline.startCreate({
      funder: '',
      programSize: 0,
      utilization: 0,
      rateRangeMin: 0,
      rateRangeMax: 0,
      suppliers: 0,
      status: 'ACTIVE',
      tenantId: 'default_tenant',
    } as Partial<SCFProgram>);
  }, [inline]);

  const handleSaveCreate = useCallback(async () => {
    const draft = inline.createDraft;
    if (!draft.funder || !draft.programSize || !draft.tenantId || draft.rateRangeMin == null || draft.rateRangeMax == null) {
      addToast({ type: 'warning', title: 'Funder, Program Size, Tenant, and Rate Range are required' });
      return;
    }
    setSaving(true);
    const result = await crud.create({
      funder: draft.funder,
      programSize: draft.programSize,
      utilization: draft.utilization ?? 0,
      rateRangeMin: draft.rateRangeMin,
      rateRangeMax: draft.rateRangeMax,
      suppliers: draft.suppliers ?? 0,
      status: draft.status ?? 'ACTIVE',
      tenantId: draft.tenantId ?? 'default_tenant',
    });
    setSaving(false);
    if (result) {
      inline.cancelCreate();
      addToast({ type: 'success', title: 'SCF program created' });
    } else {
      addToast({ type: 'error', title: 'Failed to create program', message: crud.error ?? undefined });
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
      addToast({ type: 'success', title: 'SCF program updated' });
    } else {
      addToast({ type: 'error', title: 'Failed to update program', message: crud.error ?? undefined });
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
      addToast({ type: 'success', title: 'SCF program deleted' });
    } else {
      addToast({ type: 'error', title: 'Failed to delete program', message: crud.error ?? undefined });
    }
  }, [inline, crud, addToast]);

  // --- Derived stats ---
  const totalProgramSize = crud.data.reduce((sum, p) => sum + (p.programSize ?? 0), 0);
  const activePrograms = crud.data.filter((p) => p.status === 'ACTIVE').length;
  const avgUtilization = crud.data.length > 0
    ? Math.round(crud.data.reduce((sum, p) => sum + (p.utilization ?? 0), 0) / crud.data.length)
    : 0;
  const totalSuppliers = crud.data.reduce((sum, p) => sum + (p.suppliers ?? 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t('scf.title')}</h1>
          <p>{t('scf.subtitle')}</p>
        </div>
        <button className={styles.createBtn} onClick={handleStartCreate}>
          Add Program
        </button>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('scf.programSize')}</div>
          <div className={styles.kpiValue}>{formatCurrency(totalProgramSize)}</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>+24.5% vs last quarter</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('scf.dsoImprovement')}</div>
          <div className={styles.kpiValue}>+12 days</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>30 to 42 days</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('scf.activeSuppliers')}</div>
          <div className={styles.kpiValue}>{totalSuppliers > 0 ? totalSuppliers : '28%'}</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>+8 new this quarter</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t('scf.avgFinancingRate')}</div>
          <div className={styles.kpiValue}>3.2%</div>
          <div className={`${styles.kpiSub} ${styles.kpiUp}`}>-0.3% vs benchmark</div>
        </div>
      </div>

      {/* Active SCF Programs - Table with inline editing */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('scf.programOverview')}</div>
        <div className={styles.tableWrap}>
          {crud.loading && crud.data.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#86909C' }}>Loading...</div>
          ) : crud.error && crud.data.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#F76560' }}>{crud.error}</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Funder</th>
                  <th>{t('scf.programSize')}</th>
                  <th>Utilization</th>
                  <th>Rate Range</th>
                  <th>Suppliers</th>
                  <th>{t('scf.status')}</th>
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
                        value={inline.createDraft.funder ?? ''}
                        onChange={(v) => inline.updateCreateField('funder', v)}
                        placeholder="Funder name"
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing
                        type="number"
                        value={inline.createDraft.programSize ?? 0}
                        onChange={(v) => inline.updateCreateField('programSize', v)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing
                        type="number"
                        value={inline.createDraft.utilization ?? 0}
                        onChange={(v) => inline.updateCreateField('utilization', v)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <EditableCell
                          editing
                          type="number"
                          value={inline.createDraft.rateRangeMin ?? 0}
                          onChange={(v) => inline.updateCreateField('rateRangeMin', v)}
                          placeholder="Min %"
                        />
                        <span style={{ color: '#86909C', fontSize: '0.75rem' }}>-</span>
                        <EditableCell
                          editing
                          type="number"
                          value={inline.createDraft.rateRangeMax ?? 0}
                          onChange={(v) => inline.updateCreateField('rateRangeMax', v)}
                          placeholder="Max %"
                        />
                      </div>
                    </td>
                    <td>
                      <EditableCell
                        editing
                        type="number"
                        value={inline.createDraft.suppliers ?? 0}
                        onChange={(v) => inline.updateCreateField('suppliers', v)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing
                        type="select"
                        value={inline.createDraft.status ?? 'ACTIVE'}
                        onChange={(v) => inline.updateCreateField('status', v)}
                        options={STATUS_OPTIONS}
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
                {crud.data.map((program) => {
                  const isEditing = inline.editingId === program.id;
                  const isDeleting = inline.deleteConfirmId === program.id;

                  return (
                    <tr key={program.id}>
                      {/* Funder */}
                      <td>
                        <EditableCell
                          editing={isEditing}
                          value={isEditing ? inline.editDraft.funder : program.funder}
                          onChange={(v) => inline.updateEditField('funder', v)}
                          displayRender={(val) => <span className={styles.programFunder}>{val}</span>}
                        />
                      </td>

                      {/* Program Size */}
                      <td>
                        <EditableCell
                          editing={isEditing}
                          type="number"
                          value={isEditing ? inline.editDraft.programSize : program.programSize}
                          onChange={(v) => inline.updateEditField('programSize', v)}
                          displayRender={(val) => (
                            <span className={styles.programMetaValue}>{formatCurrency(val ?? 0)}</span>
                          )}
                        />
                      </td>

                      {/* Utilization */}
                      <td>
                        <EditableCell
                          editing={isEditing}
                          type="number"
                          value={isEditing ? inline.editDraft.utilization : program.utilization}
                          onChange={(v) => inline.updateEditField('utilization', v)}
                          displayRender={(val) => (
                            <div>
                              <div className={styles.utilizationBarWrap}>
                                <div className={styles.utilizationBar} style={{ width: `${val ?? 0}%` }} />
                              </div>
                              <div className={styles.utilizationText}>{val ?? 0}%</div>
                            </div>
                          )}
                        />
                      </td>

                      {/* Rate Range */}
                      <td>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <EditableCell
                              editing
                              type="number"
                              value={inline.editDraft.rateRangeMin}
                              onChange={(v) => inline.updateEditField('rateRangeMin', v)}
                              placeholder="Min"
                            />
                            <span style={{ color: '#86909C', fontSize: '0.75rem' }}>-</span>
                            <EditableCell
                              editing
                              type="number"
                              value={inline.editDraft.rateRangeMax}
                              onChange={(v) => inline.updateEditField('rateRangeMax', v)}
                              placeholder="Max"
                            />
                          </div>
                        ) : (
                          <span>{program.rateRangeMin}% - {program.rateRangeMax}%</span>
                        )}
                      </td>

                      {/* Suppliers */}
                      <td>
                        <EditableCell
                          editing={isEditing}
                          type="number"
                          value={isEditing ? inline.editDraft.suppliers : program.suppliers}
                          onChange={(v) => inline.updateEditField('suppliers', v)}
                        />
                      </td>

                      {/* Status */}
                      <td>
                        <EditableCell
                          editing={isEditing}
                          type="select"
                          value={isEditing ? inline.editDraft.status : program.status}
                          onChange={(v) => inline.updateEditField('status', v)}
                          options={STATUS_OPTIONS}
                          displayRender={(val) => (
                            <span className={getStatusBadgeClass(val)}>{getStatusLabel(val)}</span>
                          )}
                        />
                      </td>

                      {/* Actions */}
                      <td>
                        <RowActions
                          mode={isDeleting ? 'deleting' : isEditing ? 'editing' : 'read'}
                          onEdit={() => inline.startEdit(program.id, program)}
                          onDelete={() => inline.requestDelete(program.id)}
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
        </div>
      </div>

      {/* Pending Approvals */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Pending SCF Approvals</div>
        <div className={styles.sectionSubtitle}>Invoices approved or awaiting approval for supply chain financing</div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('scf.supplierName')}</th>
                <th>Invoice</th>
                <th>{t('common.amount')}</th>
                <th>Requested Acceleration</th>
                <th>Fee</th>
                <th>Program</th>
                <th>{t('scf.status')}</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((a) => (
                <tr key={a.invoice}>
                  <td>{a.supplier}</td>
                  <td>{a.invoice}</td>
                  <td className={styles.amountValue}>{a.amount}</td>
                  <td>{a.requestedAccel}</td>
                  <td className={styles.feeValue}>{a.fee}</td>
                  <td>{a.program}</td>
                  <td><span className={getApprovalBadgeClass(a.status)}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.twoCol}>
        {/* Supplier Enrollment Tracker */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Supplier Enrollment Tracker</div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('scf.supplierName')}</th>
                  <th>Program</th>
                  <th>Onboarding Progress</th>
                </tr>
              </thead>
              <tbody>
                {supplierOnboarding.map((s) => (
                  <tr key={s.supplier}>
                    <td>{s.supplier}</td>
                    <td>{s.program}</td>
                    <td>
                      <div className={styles.stageTracker}>
                        {s.stages.map((stage, idx) => (
                          <div key={stage} className={styles.stageStep}>
                            {idx > 0 && <div className={styles.stageConnector} />}
                            <span className={`${styles.stageDot} ${getStageDotClass(idx, s.currentStage)}`} />
                            <span className={getStageTextClass(idx, s.currentStage)}>{stage}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Working Capital Impact */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Working Capital Impact</div>
          <div className={styles.sectionSubtitle}>Before vs After SCF Program Implementation</div>
          <div className={styles.wcComparison}>
            <div className={styles.wcPanel}>
              <div className={styles.wcPanelTitle}>Before SCF</div>
              {wcBefore.map((m) => (
                <div key={m.label} className={styles.wcMetricRow}>
                  <span className={styles.wcMetricLabel}>{m.label}</span>
                  <span className={styles.wcMetricValue}>{m.value}</span>
                </div>
              ))}
            </div>
            <div className={styles.wcArrow}>&#8594;</div>
            <div className={styles.wcPanel}>
              <div className={styles.wcPanelTitle}>After SCF</div>
              {wcAfter.map((m) => (
                <div key={m.label} className={styles.wcMetricRow}>
                  <span className={styles.wcMetricLabel}>{m.label}</span>
                  <span className={`${styles.wcMetricValue} ${m.improved ? styles.wcImproved : styles.wcNeutral}`}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
