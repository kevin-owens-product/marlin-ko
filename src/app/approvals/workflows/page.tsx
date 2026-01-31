'use client';

import { useState, useCallback } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { useCRUD } from '@/lib/hooks/use-crud';
import { useInlineEdit } from '@/lib/hooks/use-inline-edit';
import { useToast } from '@/components/ui/Toast';
import { EditableCell } from '@/components/inline-edit/EditableCell';
import { RowActions } from '@/components/inline-edit/RowActions';
import styles from './workflows.module.css';

interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  rules: string; // JSON string
  isActive: boolean;
  createdAt: string;
}

interface ParsedRules {
  conditions: { field: string; operator: string; value: string }[];
  steps: { approver: string; role: string; timeout: string; escalation: string }[];
}

function parseRules(rules: string): ParsedRules {
  try {
    const parsed = JSON.parse(rules);
    return {
      conditions: Array.isArray(parsed.conditions) ? parsed.conditions : [],
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    };
  } catch {
    return { conditions: [], steps: [] };
  }
}

function stringifyRules(rules: ParsedRules): string {
  return JSON.stringify(rules);
}

const templates = [
  { name: 'Standard 2-Step', desc: 'Manager then Finance Controller. For routine purchases under threshold.' },
  { name: 'High Value 3-Step', desc: 'Manager, Finance Director, VP. For significant expenditures.' },
  { name: 'Department Head', desc: 'Single-step for low-risk, low-value items approved by AI pre-screening.' },
  { name: 'Executive', desc: 'Multi-tier executive approval for major commitments.' },
];

const DEFAULT_TENANT_ID = 'default';

export default function WorkflowsPage() {
  const t = useT();
  const { addToast } = useToast();

  const {
    data: workflows,
    loading,
    error,
    create,
    update,
    remove,
  } = useCRUD<ApprovalWorkflow>({ endpoint: '/api/approval-workflows' });

  const {
    editingId,
    editDraft,
    isCreating,
    createDraft,
    deleteConfirmId,
    startEdit,
    updateEditField,
    cancelEdit,
    startCreate,
    updateCreateField,
    cancelCreate,
    requestDelete,
    cancelDelete,
  } = useInlineEdit<ApprovalWorkflow>();

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Builder state for editing rules (conditions/steps) in the right panel
  const [builderRules, setBuilderRules] = useState<ParsedRules>({ conditions: [], steps: [] });

  const selected = workflows.find((w) => w.id === selectedWorkflowId) ?? workflows[0] ?? null;
  const isEditingSelected = editingId != null && editingId === selected?.id;

  // --- Handlers ---

  const handleSelectWorkflow = useCallback((id: string) => {
    setSelectedWorkflowId(id);
    const wf = workflows.find((w) => w.id === id);
    if (wf) {
      setBuilderRules(parseRules(wf.rules));
    }
  }, [workflows]);

  const handleStartEdit = useCallback((wf: ApprovalWorkflow) => {
    startEdit(wf.id, wf);
    setSelectedWorkflowId(wf.id);
    setBuilderRules(parseRules(wf.rules));
  }, [startEdit]);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;
    setSaving(true);
    const payload: Partial<ApprovalWorkflow> = {
      name: editDraft.name,
      description: editDraft.description,
      isActive: editDraft.isActive,
      rules: stringifyRules(builderRules),
    };
    const result = await update(editingId, payload);
    setSaving(false);
    if (result) {
      addToast({ type: 'success', title: 'Workflow updated' });
      cancelEdit();
    } else {
      addToast({ type: 'error', title: 'Failed to update workflow' });
    }
  }, [editingId, editDraft, builderRules, update, addToast, cancelEdit]);

  const handleCancelEdit = useCallback(() => {
    cancelEdit();
    if (selected) {
      setBuilderRules(parseRules(selected.rules));
    }
  }, [cancelEdit, selected]);

  const handleStartCreate = useCallback(() => {
    startCreate({
      name: '',
      description: '',
      tenantId: DEFAULT_TENANT_ID,
      rules: stringifyRules({ conditions: [], steps: [] }),
      isActive: true,
    } as Partial<ApprovalWorkflow>);
    setBuilderRules({ conditions: [], steps: [] });
  }, [startCreate]);

  const handleSaveCreate = useCallback(async () => {
    if (!createDraft.name?.trim()) {
      addToast({ type: 'warning', title: 'Name is required' });
      return;
    }
    setSaving(true);
    const payload: Partial<ApprovalWorkflow> = {
      name: createDraft.name,
      description: createDraft.description ?? '',
      tenantId: createDraft.tenantId || DEFAULT_TENANT_ID,
      rules: stringifyRules(builderRules),
      isActive: createDraft.isActive ?? true,
    };
    const result = await create(payload);
    setSaving(false);
    if (result) {
      addToast({ type: 'success', title: 'Workflow created' });
      cancelCreate();
      setSelectedWorkflowId(result.id);
      setBuilderRules(parseRules(result.rules));
    } else {
      addToast({ type: 'error', title: 'Failed to create workflow' });
    }
  }, [createDraft, builderRules, create, addToast, cancelCreate]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmId) return;
    const ok = await remove(deleteConfirmId);
    if (ok) {
      addToast({ type: 'success', title: 'Workflow deleted' });
      if (selectedWorkflowId === deleteConfirmId) {
        setSelectedWorkflowId(null);
      }
    } else {
      addToast({ type: 'error', title: 'Failed to delete workflow' });
    }
    cancelDelete();
  }, [deleteConfirmId, remove, addToast, selectedWorkflowId, cancelDelete]);

  const handleToggleActive = useCallback(async (wf: ApprovalWorkflow) => {
    const result = await update(wf.id, { isActive: !wf.isActive });
    if (result) {
      addToast({ type: 'success', title: `Workflow ${result.isActive ? 'activated' : 'deactivated'}` });
    }
  }, [update, addToast]);

  // --- Builder rule helpers ---

  const updateCondition = useCallback((idx: number, field: string, value: string) => {
    setBuilderRules((prev) => {
      const conditions = [...prev.conditions];
      conditions[idx] = { ...conditions[idx], [field]: value };
      return { ...prev, conditions };
    });
  }, []);

  const addCondition = useCallback(() => {
    setBuilderRules((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { field: 'amount', operator: '=', value: '' }],
    }));
  }, []);

  const updateStep = useCallback((idx: number, field: string, value: string) => {
    setBuilderRules((prev) => {
      const steps = [...prev.steps];
      steps[idx] = { ...steps[idx], [field]: value };
      return { ...prev, steps };
    });
  }, []);

  const addStep = useCallback(() => {
    setBuilderRules((prev) => ({
      ...prev,
      steps: [...prev.steps, { approver: '', role: 'Auto-assigned', timeout: '24h', escalation: '' }],
    }));
  }, []);

  const removeStep = useCallback((idx: number) => {
    setBuilderRules((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== idx),
    }));
  }, []);

  // --- Determine the workflow shown in the builder ---

  const builderWorkflow = isCreating ? null : selected;
  const builderName = isCreating
    ? (createDraft.name ?? '')
    : isEditingSelected
      ? (editDraft.name ?? selected?.name ?? '')
      : (selected?.name ?? '');
  const builderDescription = isCreating
    ? (createDraft.description ?? '')
    : isEditingSelected
      ? (editDraft.description ?? selected?.description ?? '')
      : (selected?.description ?? '');
  const builderEditable = isCreating || isEditingSelected;

  // If selected changes and we are not editing, sync builder rules
  const displayRules = builderEditable ? builderRules : (selected ? parseRules(selected.rules) : { conditions: [], steps: [] });

  // --- Render ---

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{t('approvalWorkflows.title')}</h1>
          <p className={styles.subtitle}>{t('approvalWorkflows.subtitle')}</p>
        </div>
        <button className={styles.createBtn} onClick={handleStartCreate} disabled={isCreating}>
          {t('approvalWorkflows.createWorkflow')}
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: '#FFF1F0', border: '1px solid #FDCDC5', borderRadius: '0.375rem', color: '#F76560', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <div className={styles.twoCol}>
        {/* Left: Workflow List */}
        <div>
          <div className={styles.listSection}>
            <div className={styles.sectionTitle}>Active Workflows</div>

            {/* Inline Create Form */}
            {isCreating && (
              <div className={styles.workflowCardActive} style={{ borderColor: '#23C343' }}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardName}>New Workflow</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className={styles.formLabel}>{t('approvalWorkflows.workflowName')}</label>
                    <EditableCell
                      editing
                      value={createDraft.name ?? ''}
                      onChange={(v) => updateCreateField('name' as keyof ApprovalWorkflow, v)}
                      placeholder="Workflow name"
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>Description</label>
                    <EditableCell
                      editing
                      value={createDraft.description ?? ''}
                      onChange={(v) => updateCreateField('description' as keyof ApprovalWorkflow, v)}
                      placeholder="Description"
                    />
                  </div>
                </div>
                <RowActions
                  mode="creating"
                  onSave={handleSaveCreate}
                  onCancel={cancelCreate}
                  saving={saving}
                />
              </div>
            )}

            {loading && workflows.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#86909C', fontSize: '0.85rem' }}>
                {t('common.loading')}
              </div>
            )}

            {workflows.map((wf) => {
              const rules = parseRules(wf.rules);
              const isSelected = selected?.id === wf.id;
              const isDeleting = deleteConfirmId === wf.id;
              const isEditing = editingId === wf.id;

              return (
                <div
                  key={wf.id}
                  className={isSelected ? styles.workflowCardActive : styles.workflowCard}
                  onClick={() => handleSelectWorkflow(wf.id)}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.cardName}>
                      {isEditing ? (
                        <EditableCell
                          editing
                          value={editDraft.name ?? ''}
                          onChange={(v) => updateEditField('name' as keyof ApprovalWorkflow, v)}
                          placeholder="Workflow name"
                        />
                      ) : (
                        wf.name
                      )}
                    </span>
                    <button
                      className={`${styles.toggle} ${wf.isActive ? styles.toggleOn : styles.toggleOff}`}
                      onClick={(e) => { e.stopPropagation(); handleToggleActive(wf); }}
                    >
                      <span className={`${styles.toggleDot} ${wf.isActive ? styles.toggleDotOn : styles.toggleDotOff}`} />
                    </button>
                  </div>

                  {isEditing && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.7rem', color: '#86909C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Description</label>
                      <EditableCell
                        editing
                        value={editDraft.description ?? ''}
                        onChange={(v) => updateEditField('description' as keyof ApprovalWorkflow, v)}
                        placeholder="Description"
                      />
                    </div>
                  )}

                  {!isEditing && wf.description && (
                    <div style={{ fontSize: '0.8rem', color: '#4E5969', marginBottom: '0.5rem' }}>
                      {wf.description}
                    </div>
                  )}

                  <div className={styles.cardConditions}>
                    <div className={styles.conditionLabel}>Conditions</div>
                    <div className={styles.conditionList}>
                      {rules.conditions.length > 0 ? (
                        rules.conditions.map((c, idx) => (
                          <span key={idx} className={styles.condition}>
                            IF {c.field} {c.operator} {c.value}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#86909C' }}>No conditions</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardSteps}>
                    {rules.steps.length > 0 ? (
                      rules.steps.map((s, idx) => (
                        <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={styles.stepChip}>{s.approver || 'Unassigned'}</span>
                          {idx < rules.steps.length - 1 && <span className={styles.stepArrow}>&rarr;</span>}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#86909C' }}>No steps</span>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.cardStat}>
                      Created: <span className={styles.cardStatValue}>{wf.createdAt ? new Date(wf.createdAt).toLocaleDateString() : '-'}</span>
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                      {isDeleting ? (
                        <RowActions
                          mode="deleting"
                          onConfirmDelete={handleConfirmDelete}
                          onCancelDelete={cancelDelete}
                        />
                      ) : isEditing ? (
                        <RowActions
                          mode="editing"
                          onSave={handleSaveEdit}
                          onCancel={handleCancelEdit}
                          saving={saving}
                        />
                      ) : (
                        <RowActions
                          mode="read"
                          onEdit={() => handleStartEdit(wf)}
                          onDelete={() => requestDelete(wf.id)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.templateSection}>
            <div className={styles.sectionTitle}>Templates</div>
            <div className={styles.templateGrid}>
              {templates.map((tmpl, idx) => (
                <div key={idx} className={styles.templateCard}>
                  <div className={styles.templateName}>{tmpl.name}</div>
                  <div className={styles.templateDesc}>{tmpl.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Workflow Builder */}
        <div className={styles.builderSection}>
          {!selected && !isCreating ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#86909C', fontSize: '0.9rem' }}>
              {workflows.length === 0 ? 'No workflows yet. Create one to get started.' : 'Select a workflow to view details.'}
            </div>
          ) : (
            <>
              <div className={styles.builderTitle}>
                {isCreating ? 'New Workflow' : `${builderEditable ? 'Edit' : 'View'} Workflow: ${builderName}`}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('approvalWorkflows.workflowName')}</label>
                {builderEditable ? (
                  <input
                    className={styles.formInput}
                    value={builderName}
                    onChange={(e) => {
                      if (isCreating) {
                        updateCreateField('name' as keyof ApprovalWorkflow, e.target.value);
                      } else {
                        updateEditField('name' as keyof ApprovalWorkflow, e.target.value);
                      }
                    }}
                    placeholder="Workflow name"
                  />
                ) : (
                  <input className={styles.formInput} value={builderName} readOnly />
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                {builderEditable ? (
                  <input
                    className={styles.formInput}
                    value={builderDescription}
                    onChange={(e) => {
                      if (isCreating) {
                        updateCreateField('description' as keyof ApprovalWorkflow, e.target.value);
                      } else {
                        updateEditField('description' as keyof ApprovalWorkflow, e.target.value);
                      }
                    }}
                    placeholder="Description"
                  />
                ) : (
                  <input className={styles.formInput} value={builderDescription} readOnly />
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('approvalWorkflows.trigger')}</label>
                <div className={styles.conditionsBuilder}>
                  {displayRules.conditions.map((c, idx) => (
                    <div key={idx} className={styles.conditionRow}>
                      <span style={{ fontSize: '0.75rem', color: '#4E5969', minWidth: '20px' }}>{idx === 0 ? 'IF' : 'AND'}</span>
                      {builderEditable ? (
                        <>
                          <select
                            className={styles.conditionSelect}
                            value={c.field}
                            onChange={(e) => updateCondition(idx, 'field', e.target.value)}
                          >
                            <option value="amount">Amount</option>
                            <option value="vendor_status">Vendor Status</option>
                            <option value="department">Department</option>
                            <option value="ai_risk_score">AI Risk Score</option>
                            <option value="vendor_invoices">Vendor Invoices</option>
                            <option value="category">Category</option>
                          </select>
                          <select
                            className={styles.conditionSelect}
                            value={c.operator}
                            onChange={(e) => updateCondition(idx, 'operator', e.target.value)}
                          >
                            <option value="=">=</option>
                            <option value="!=">!=</option>
                            <option value=">">&gt;</option>
                            <option value="<">&lt;</option>
                            <option value=">=">&gt;=</option>
                            <option value="<=">&lt;=</option>
                          </select>
                          <input
                            className={styles.conditionInput}
                            value={c.value}
                            onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                          />
                        </>
                      ) : (
                        <>
                          <select className={styles.conditionSelect} defaultValue={c.field} disabled>
                            <option value="amount">Amount</option>
                            <option value="vendor_status">Vendor Status</option>
                            <option value="department">Department</option>
                            <option value="ai_risk_score">AI Risk Score</option>
                            <option value="vendor_invoices">Vendor Invoices</option>
                            <option value="category">Category</option>
                          </select>
                          <select className={styles.conditionSelect} defaultValue={c.operator} disabled>
                            <option value="=">=</option>
                            <option value="!=">!=</option>
                            <option value=">">&gt;</option>
                            <option value="<">&lt;</option>
                            <option value=">=">&gt;=</option>
                            <option value="<=">&lt;=</option>
                          </select>
                          <input className={styles.conditionInput} defaultValue={c.value} readOnly />
                        </>
                      )}
                    </div>
                  ))}
                  {builderEditable && (
                    <button className={styles.addConditionBtn} onClick={addCondition}>+ Add Condition</button>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('approvalWorkflows.steps')}</label>
                <div className={styles.stepsBuilder}>
                  {displayRules.steps.map((s, idx) => (
                    <div key={idx} className={styles.stepCard}>
                      <div className={styles.stepHeader}>
                        <span className={styles.stepNumber}>Step {idx + 1}</span>
                        {builderEditable && idx > 0 && (
                          <button className={styles.removeBtn} onClick={() => removeStep(idx)}>Remove</button>
                        )}
                      </div>
                      <div className={styles.stepFields}>
                        <div className={styles.stepField}>
                          <span className={styles.stepFieldLabel}>Approver</span>
                          {builderEditable ? (
                            <input
                              className={styles.stepFieldInput}
                              value={s.approver}
                              onChange={(e) => updateStep(idx, 'approver', e.target.value)}
                            />
                          ) : (
                            <input className={styles.stepFieldInput} defaultValue={s.approver} readOnly />
                          )}
                        </div>
                        <div className={styles.stepField}>
                          <span className={styles.stepFieldLabel}>Assigned To</span>
                          {builderEditable ? (
                            <input
                              className={styles.stepFieldInput}
                              value={s.role}
                              onChange={(e) => updateStep(idx, 'role', e.target.value)}
                            />
                          ) : (
                            <input className={styles.stepFieldInput} defaultValue={s.role} readOnly />
                          )}
                        </div>
                        <div className={styles.stepField}>
                          <span className={styles.stepFieldLabel}>Timeout</span>
                          {builderEditable ? (
                            <input
                              className={styles.stepFieldInput}
                              value={s.timeout}
                              onChange={(e) => updateStep(idx, 'timeout', e.target.value)}
                            />
                          ) : (
                            <input className={styles.stepFieldInput} defaultValue={s.timeout} readOnly />
                          )}
                        </div>
                        <div className={styles.stepField}>
                          <span className={styles.stepFieldLabel}>Escalation</span>
                          {builderEditable ? (
                            <input
                              className={styles.stepFieldInput}
                              value={s.escalation}
                              onChange={(e) => updateStep(idx, 'escalation', e.target.value)}
                            />
                          ) : (
                            <input className={styles.stepFieldInput} defaultValue={s.escalation} readOnly />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {builderEditable && (
                    <button className={styles.addStepBtn} onClick={addStep}>+ Add Step</button>
                  )}
                </div>
              </div>

              {builderEditable && (
                <div className={styles.builderActions}>
                  <button
                    className={styles.saveBtn}
                    onClick={isCreating ? handleSaveCreate : handleSaveEdit}
                    disabled={saving}
                  >
                    {saving ? t('common.saving') : t('common.save')}
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={isCreating ? cancelCreate : handleCancelEdit}
                    disabled={saving}
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
