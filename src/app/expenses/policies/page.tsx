'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { useCRUD } from '@/lib/hooks/use-crud';
import { useInlineEdit } from '@/lib/hooks/use-inline-edit';
import { useToast } from '@/components/ui/Toast';
import { EditableCell } from '@/components/inline-edit/EditableCell';
import { RowActions } from '@/components/inline-edit/RowActions';
import styles from './expense-policies.module.css';

interface ExpensePolicy {
  id: string;
  tenantId: string;
  name: string;
  rules: string;
  isActive: boolean;
  createdAt: string;
}

/* ---------- Vertical Intelligence Data ---------- */

const verticalPatterns = [
  { vertical: 'Technology', pattern: 'SaaS subscription auto-renewal detection', accuracy: 96.8, learned: '2,847 transactions', trend: [88, 91, 93, 95, 96, 96.8], status: 'Active' as const },
  { vertical: 'Manufacturing', pattern: 'Raw material price variance flagging', accuracy: 94.2, learned: '1,923 transactions', trend: [82, 86, 89, 92, 93, 94.2], status: 'Active' as const },
  { vertical: 'Professional Services', pattern: 'Hourly rate cap enforcement by seniority', accuracy: 97.1, learned: '3,412 transactions', trend: [90, 92, 94, 95, 96, 97.1], status: 'Active' as const },
  { vertical: 'Healthcare', pattern: 'HIPAA-compliant vendor verification', accuracy: 91.5, learned: '1,204 transactions', trend: [78, 82, 85, 88, 90, 91.5], status: 'Active' as const },
  { vertical: 'Financial Services', pattern: 'Regulatory gift & entertainment limits', accuracy: 98.3, learned: '4,156 transactions', trend: [93, 95, 96, 97, 98, 98.3], status: 'Active' as const },
  { vertical: 'Retail', pattern: 'Seasonal procurement budget auto-adjustment', accuracy: 89.7, learned: '856 transactions', trend: [72, 77, 81, 85, 88, 89.7], status: 'Learning' as const },
];

const policyEffectiveness = [
  { name: 'Travel Expense Policy', violations30d: 12, violations90d: 47, reductionRate: 34, autoResolved: 78, avgResolutionHrs: 4.2 },
  { name: 'Meals & Entertainment Policy', violations30d: 8, violations90d: 31, reductionRate: 22, autoResolved: 85, avgResolutionHrs: 2.1 },
  { name: 'Software & Subscriptions Policy', violations30d: 5, violations90d: 28, reductionRate: 46, autoResolved: 62, avgResolutionHrs: 8.4 },
  { name: 'Office Supplies Policy', violations30d: 3, violations90d: 15, reductionRate: 41, autoResolved: 91, avgResolutionHrs: 1.3 },
  { name: 'Professional Services Policy', violations30d: 2, violations90d: 12, reductionRate: 55, autoResolved: 70, avgResolutionHrs: 6.8 },
];

const adaptiveRules = [
  { rule: 'Hotel rate cap increased to $300 in NYC, SF, London', trigger: 'Detected 68% override rate in high-cost cities', confidence: 94, applied: 'Jan 15, 2026' },
  { rule: 'Meal per-person limit adjusted by team size', trigger: 'Groups >6 systematically exceeded flat cap', confidence: 91, applied: 'Jan 8, 2026' },
  { rule: 'IT approval auto-routed for renewals under $500', trigger: 'Low-risk renewals consumed 40% of IT approval queue', confidence: 97, applied: 'Dec 20, 2025' },
  { rule: 'Conference travel pre-approved for speaker roles', trigger: 'Speaker travel requests had 99% approval rate', confidence: 99, applied: 'Dec 12, 2025' },
  { rule: 'Vendor diversity bonus scoring for underrepresented categories', trigger: 'Diversity spend gap identified in 3 categories', confidence: 88, applied: 'Nov 28, 2025' },
];

const violations = [
  { id: 'VIO-041', date: '2026-01-29', employee: 'David Kim', policy: 'Travel Expense Policy', rule: 'Hotel rate exceeded $250 cap ($380/night)', severity: 'High', status: 'Open' },
  { id: 'VIO-040', date: '2026-01-28', employee: 'Lisa Park', policy: 'Meals & Entertainment Policy', rule: 'Client dinner exceeded $100 per person ($140)', severity: 'Medium', status: 'Open' },
  { id: 'VIO-039', date: '2026-01-25', employee: 'Maria Rodriguez', policy: 'Software & Subscriptions Policy', rule: 'Purchased software without IT approval ($2,400)', severity: 'High', status: 'Open' },
  { id: 'VIO-038', date: '2026-01-22', employee: 'Kevin Brooks', policy: 'Meals & Entertainment Policy', rule: 'Missing receipt for $89 lunch expense', severity: 'Low', status: 'Resolved' },
  { id: 'VIO-037', date: '2026-01-20', employee: 'Robert Taylor', policy: 'Travel Expense Policy', rule: 'Booked first class domestic flight', severity: 'High', status: 'Resolved' },
  { id: 'VIO-036', date: '2026-01-18', employee: 'Anna Martinez', policy: 'Office Supplies Policy', rule: 'Purchased from non-approved vendor ($340)', severity: 'Medium', status: 'Resolved' },
  { id: 'VIO-035', date: '2026-01-15', employee: 'James Wilson', policy: 'Meals & Entertainment Policy', rule: 'Exceeded team meal per-person limit ($92)', severity: 'Low', status: 'Resolved' },
];

function getSeverityBadge(severity: string) {
  const map: Record<string, string> = {
    High: styles.badgeHigh,
    Medium: styles.badgeMedium,
    Low: styles.badgeLow,
  };
  return `${styles.badge} ${map[severity] || ''}`;
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    Resolved: styles.badgeResolved,
    Open: styles.badgeOpen,
  };
  return `${styles.badge} ${map[status] || ''}`;
}

function parseRulesDescription(rules: string): string {
  try {
    const parsed = JSON.parse(rules);
    if (Array.isArray(parsed)) return parsed.join('; ');
    if (typeof parsed === 'object' && parsed.description) return parsed.description;
    return String(rules);
  } catch {
    return rules || '';
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const STATUS_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

export default function ExpensePoliciesPage() {
  const t = useT();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const crud = useCRUD<ExpensePolicy>({ endpoint: '/api/expense-policies' });
  const inline = useInlineEdit<ExpensePolicy>();

  // --- Handlers ---

  async function handleSaveEdit() {
    if (!inline.editingId) return;
    setSaving(true);
    const payload: Partial<ExpensePolicy> = {
      name: inline.editDraft.name,
      rules: inline.editDraft.rules,
      isActive: inline.editDraft.isActive,
    };
    const result = await crud.update(inline.editingId, payload);
    setSaving(false);
    if (result) {
      toast.addToast({ type: 'success', title: 'Policy updated' });
      inline.cancelEdit();
    } else {
      toast.addToast({ type: 'error', title: 'Failed to update policy', message: crud.error ?? undefined });
    }
  }

  async function handleSaveCreate() {
    const name = (inline.createDraft.name ?? '').trim();
    if (!name) {
      toast.addToast({ type: 'warning', title: 'Name is required' });
      return;
    }
    setSaving(true);
    const payload: Partial<ExpensePolicy> = {
      name,
      tenantId: 'default-tenant',
      rules: inline.createDraft.rules ?? '',
      isActive: inline.createDraft.isActive ?? true,
    };
    const result = await crud.create(payload);
    setSaving(false);
    if (result) {
      toast.addToast({ type: 'success', title: 'Policy created' });
      inline.cancelCreate();
    } else {
      toast.addToast({ type: 'error', title: 'Failed to create policy', message: crud.error ?? undefined });
    }
  }

  async function handleConfirmDelete() {
    if (!inline.deleteConfirmId) return;
    setSaving(true);
    const ok = await crud.remove(inline.deleteConfirmId);
    setSaving(false);
    if (ok) {
      toast.addToast({ type: 'success', title: 'Policy deleted' });
      inline.cancelDelete();
    } else {
      toast.addToast({ type: 'error', title: 'Failed to delete policy', message: crud.error ?? undefined });
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t('expensePolicies.title')}</h1>
          <p>{t('expensePolicies.subtitle')}</p>
        </div>
        <button className={styles.createBtn} onClick={() => inline.startCreate({ isActive: true })}>
          {t('expensePolicies.createPolicy')}
        </button>
      </div>

      {/* Policy Table */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Policies</div>
        {crud.loading && !crud.data.length && <p>Loading...</p>}
        {crud.error && !crud.data.length && <p style={{ color: '#F76560' }}>{crud.error}</p>}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('expensePolicies.policyName')}</th>
                <th>{t('expensePolicies.status')}</th>
                <th>Description</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Inline create row */}
              {inline.isCreating && (
                <tr>
                  <td>
                    <EditableCell
                      editing
                      value={inline.createDraft.name ?? ''}
                      onChange={(v) => inline.updateCreateField('name', v)}
                      placeholder="Policy name"
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={String(inline.createDraft.isActive ?? true)}
                      onChange={(v) => inline.updateCreateField('isActive', v === 'true')}
                      type="select"
                      options={STATUS_OPTIONS}
                    />
                  </td>
                  <td>
                    <EditableCell
                      editing
                      value={inline.createDraft.rules ?? ''}
                      onChange={(v) => inline.updateCreateField('rules', v)}
                      placeholder="Rules / description"
                    />
                  </td>
                  <td>-</td>
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

              {/* Data rows */}
              {crud.data.map((policy) => {
                const isEditing = inline.editingId === policy.id;
                const isDeleting = inline.deleteConfirmId === policy.id;
                const draft = isEditing ? inline.editDraft : policy;

                return (
                  <tr key={policy.id}>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? draft.name : policy.name}
                        onChange={(v) => inline.updateEditField('name', v)}
                        placeholder="Policy name"
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? String(draft.isActive) : String(policy.isActive)}
                        onChange={(v) => inline.updateEditField('isActive', v === 'true')}
                        type="select"
                        options={STATUS_OPTIONS}
                        displayRender={(v) => (
                          <span
                            className={`${styles.policyBadge} ${
                              v === 'true' ? styles.badgeActive : styles.badgeDraft
                            }`}
                          >
                            {v === 'true' ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      />
                    </td>
                    <td>
                      <EditableCell
                        editing={isEditing}
                        value={isEditing ? draft.rules : policy.rules}
                        onChange={(v) => inline.updateEditField('rules', v)}
                        placeholder="Rules / description"
                        displayRender={(v) => (
                          <span title={v}>{parseRulesDescription(v)}</span>
                        )}
                      />
                    </td>
                    <td>{formatDate(policy.createdAt)}</td>
                    <td>
                      <RowActions
                        mode={isDeleting ? 'deleting' : isEditing ? 'editing' : 'read'}
                        onEdit={() => inline.startEdit(policy.id, policy)}
                        onDelete={() => inline.requestDelete(policy.id)}
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

              {!crud.loading && !crud.data.length && !inline.isCreating && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#86909C', padding: '2rem' }}>
                    No policies found. Click &quot;Create Policy&quot; to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Violation Log */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Violation Log</div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('common.date')}</th>
                <th>{t('expenses.employee')}</th>
                <th>Policy</th>
                <th>Rule Violated</th>
                <th>Severity</th>
                <th>{t('expensePolicies.status')}</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.date}</td>
                  <td>{v.employee}</td>
                  <td>{v.policy}</td>
                  <td>{v.rule}</td>
                  <td>
                    <span className={getSeverityBadge(v.severity)}>{v.severity}</span>
                  </td>
                  <td>
                    <span className={getStatusBadge(v.status)}>{v.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vertical Intelligence — Industry-Specific Patterns */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>Vertical Intelligence</div>
          <span className={styles.aiBadge}>ML-Powered</span>
        </div>
        <p className={styles.sectionDesc}>
          Policy rules that learn industry-specific patterns from transaction data. Accuracy improves with every transaction processed across the network.
        </p>
        <div className={styles.verticalGrid}>
          {verticalPatterns.map((vp) => (
            <div key={vp.vertical} className={styles.verticalCard}>
              <div className={styles.verticalCardHeader}>
                <span className={styles.verticalName}>{vp.vertical}</span>
                <span className={`${styles.verticalStatus} ${vp.status === 'Active' ? styles.statusActive : styles.statusLearning}`}>
                  {vp.status}
                </span>
              </div>
              <div className={styles.verticalPattern}>{vp.pattern}</div>
              <div className={styles.verticalAccuracy}>
                <div className={styles.accuracyBarTrack}>
                  <div className={styles.accuracyBarFill} style={{ width: `${vp.accuracy}%` }} />
                </div>
                <span className={styles.accuracyValue}>{vp.accuracy}%</span>
              </div>
              <div className={styles.verticalSparkline}>
                {vp.trend.map((val, i) => (
                  <div key={i} className={styles.sparkBar} style={{ height: `${(val / 100) * 28}px`, background: i === vp.trend.length - 1 ? '#165DFF' : '#C9CDD4' }} />
                ))}
              </div>
              <div className={styles.verticalMeta}>Trained on {vp.learned}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Policy Effectiveness — Trend & Auto-Resolution */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>Policy Effectiveness</div>
          <span className={styles.aiBadge}>Tracking</span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Policy</th>
                <th>Violations (30d)</th>
                <th>Violations (90d)</th>
                <th>Reduction Rate</th>
                <th>Auto-Resolved</th>
                <th>Avg Resolution</th>
              </tr>
            </thead>
            <tbody>
              {policyEffectiveness.map((pe) => (
                <tr key={pe.name}>
                  <td style={{ fontWeight: 500 }}>{pe.name}</td>
                  <td>{pe.violations30d}</td>
                  <td style={{ color: '#86909C' }}>{pe.violations90d}</td>
                  <td>
                    <span style={{ color: '#23C343', fontWeight: 600 }}>-{pe.reductionRate}%</span>
                  </td>
                  <td>
                    <div className={styles.accuracyBarTrack} style={{ width: 80, display: 'inline-flex', verticalAlign: 'middle', marginRight: 6 }}>
                      <div className={styles.accuracyBarFill} style={{ width: `${pe.autoResolved}%`, background: pe.autoResolved > 80 ? '#23C343' : pe.autoResolved > 60 ? '#FF9A2E' : '#F76560' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#4E5969' }}>{pe.autoResolved}%</span>
                  </td>
                  <td style={{ color: '#4E5969' }}>{pe.avgResolutionHrs}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adaptive Rules — ML-Driven Policy Adjustments */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>Adaptive Rules</div>
          <span className={styles.aiBadge}>Auto-Tuned</span>
        </div>
        <p className={styles.sectionDesc}>
          Rules automatically adjusted based on override patterns and approval data. Each adjustment is logged with the trigger pattern and confidence score.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rule Adjustment</th>
                <th>Trigger Pattern</th>
                <th>Confidence</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {adaptiveRules.map((ar) => (
                <tr key={ar.rule}>
                  <td style={{ fontWeight: 500 }}>{ar.rule}</td>
                  <td style={{ color: '#4E5969', fontSize: '0.75rem' }}>{ar.trigger}</td>
                  <td>
                    <span style={{
                      fontWeight: 600,
                      color: ar.confidence >= 95 ? '#23C343' : ar.confidence >= 90 ? '#165DFF' : '#FF9A2E',
                    }}>
                      {ar.confidence}%
                    </span>
                  </td>
                  <td style={{ color: '#86909C', fontSize: '0.75rem' }}>{ar.applied}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
