'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { Button, Modal, Input, Select, Skeleton } from '@/components/ui';
import styles from './feature-flags.module.css';

/* ---------- Types ---------- */
interface TenantOverride {
  tenantId: string;
  tenantName: string;
  enabled: boolean;
}

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  minPlan: 'Free' | 'Starter' | 'Professional' | 'Enterprise';
  overrides: TenantOverride[];
}

/* ---------- Plan Levels ---------- */
const PLAN_LEVELS = ['Free', 'Starter', 'Professional', 'Enterprise'] as const;

/* ---------- Mock Data ---------- */
const mockFlags: FeatureFlag[] = [
  {
    id: 'f1', key: 'ai_copilot', name: 'AI Copilot', description: 'Natural language AI assistant for invoice queries and actions',
    enabled: true, minPlan: 'Professional',
    overrides: [
      { tenantId: 't7', tenantName: 'StartupXYZ', enabled: true },
      { tenantId: 't10', tenantName: 'FreshFoods Inc', enabled: false },
    ],
  },
  {
    id: 'f2', key: 'ai_copilot_v2', name: 'AI Copilot V2', description: 'Next-gen copilot with multi-modal understanding and proactive insights',
    enabled: true, minPlan: 'Enterprise',
    overrides: [
      { tenantId: 't2', tenantName: 'NordicTech AB', enabled: true },
    ],
  },
  {
    id: 'f3', key: 'dynamic_discounting', name: 'Dynamic Discounting', description: 'Automated early payment discount optimization with supplier negotiation',
    enabled: true, minPlan: 'Professional',
    overrides: [],
  },
  {
    id: 'f4', key: 'virtual_cards', name: 'Virtual Cards', description: 'Generate virtual credit cards for one-time or recurring payments',
    enabled: true, minPlan: 'Professional',
    overrides: [
      { tenantId: 't11', tenantName: 'TechParts Ltd', enabled: true },
    ],
  },
  {
    id: 'f5', key: 'supply_chain_finance', name: 'Supply Chain Finance', description: 'Multi-funder SCF programs with reverse factoring and early payments',
    enabled: true, minPlan: 'Enterprise',
    overrides: [],
  },
  {
    id: 'f6', key: 'treasury_module', name: 'Treasury Management', description: 'Cash pooling, FX management, and investment tracking',
    enabled: true, minPlan: 'Enterprise',
    overrides: [],
  },
  {
    id: 'f7', key: 'compliance_hub', name: 'Compliance Hub', description: 'Global tax compliance, e-invoicing mandates, and regulatory monitoring',
    enabled: true, minPlan: 'Professional',
    overrides: [
      { tenantId: 't9', tenantName: 'MedTech Solutions', enabled: true },
      { tenantId: 't7', tenantName: 'StartupXYZ', enabled: false },
    ],
  },
  {
    id: 'f8', key: 'risk_dashboard', name: 'Risk Dashboard', description: 'Real-time risk monitoring with AI-powered anomaly detection',
    enabled: true, minPlan: 'Starter',
    overrides: [],
  },
  {
    id: 'f9', key: 'agent_studio', name: 'Agent Studio', description: 'Visual builder for custom AI agent workflows and automations',
    enabled: true, minPlan: 'Enterprise',
    overrides: [
      { tenantId: 't3', tenantName: 'CloudHost Services', enabled: true },
    ],
  },
  {
    id: 'f10', key: 'benchmarks', name: 'Industry Benchmarks', description: 'Compare AP metrics against anonymized industry benchmarks',
    enabled: true, minPlan: 'Professional',
    overrides: [],
  },
  {
    id: 'f11', key: 'supplier_network_map', name: 'Supplier Network Map', description: 'Visual supply chain mapping with risk heat overlay',
    enabled: false, minPlan: 'Enterprise',
    overrides: [],
  },
  {
    id: 'f12', key: 'cpo_portal', name: 'CPO Strategy Portal', description: 'Strategic procurement insights and transformation roadmap',
    enabled: true, minPlan: 'Enterprise',
    overrides: [],
  },
  {
    id: 'f13', key: 'expense_mgmt', name: 'Expense Management', description: 'Employee expense submission, OCR receipt scanning, and policy enforcement',
    enabled: true, minPlan: 'Starter',
    overrides: [],
  },
  {
    id: 'f14', key: 'api_webhooks', name: 'API Webhooks', description: 'Real-time webhook notifications for invoice, payment, and approval events',
    enabled: true, minPlan: 'Starter',
    overrides: [
      { tenantId: 't10', tenantName: 'FreshFoods Inc', enabled: true },
    ],
  },
  {
    id: 'f15', key: 'sso_integration', name: 'SSO Integration', description: 'SAML 2.0 and OIDC single sign-on with identity provider federation',
    enabled: true, minPlan: 'Professional',
    overrides: [],
  },
];

const tenantList = [
  { label: 'Acme Corporation', value: 'acme-corp' },
  { label: 'NordicTech AB', value: 'nordictech' },
  { label: 'CloudHost Services', value: 'cloudhost' },
  { label: 'GlobalLogistics Inc', value: 'globallogistics' },
  { label: 'Demo Corp', value: 'demo-corp' },
  { label: 'BigRetail Inc', value: 'bigretail' },
  { label: 'StartupXYZ', value: 'startupxyz' },
  { label: 'FinanceHub Ltd', value: 'financehub' },
  { label: 'MedTech Solutions', value: 'medtech' },
  { label: 'FreshFoods Inc', value: 'freshfoods' },
  { label: 'TechParts Ltd', value: 'techparts' },
  { label: 'FastShip International', value: 'fastship' },
];

const planClassMap: Record<string, string> = {
  Free: styles.planAll,
  Starter: styles.planStarter,
  Professional: styles.planProfessional,
  Enterprise: styles.planEnterprise,
};

export default function FeatureFlagsPage() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<FeatureFlag[]>(mockFlags);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form state
  const [formKey, setFormKey] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formMinPlan, setFormMinPlan] = useState<string>('Starter');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return flags.filter((flag) => {
      if (statusFilter === 'enabled' && !flag.enabled) return false;
      if (statusFilter === 'disabled' && flag.enabled) return false;
      if (planFilter !== 'all' && flag.minPlan !== planFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          flag.key.toLowerCase().includes(q) ||
          flag.name.toLowerCase().includes(q) ||
          flag.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [flags, search, statusFilter, planFilter]);

  const handleToggle = useCallback((flagId: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === flagId ? { ...f, enabled: !f.enabled } : f))
    );
  }, []);

  const handleOverrideToggle = useCallback((flagId: string, tenantId: string) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.id === flagId
          ? {
              ...f,
              overrides: f.overrides.map((o) =>
                o.tenantId === tenantId ? { ...o, enabled: !o.enabled } : o
              ),
            }
          : f
      )
    );
  }, []);

  const getPlanIndex = (plan: string) => PLAN_LEVELS.indexOf(plan as typeof PLAN_LEVELS[number]);

  const handleCreateSubmit = () => {
    setCreateModalOpen(false);
    setFormKey('');
    setFormName('');
    setFormDescription('');
    setFormEnabled(true);
    setFormMinPlan('Starter');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Skeleton width={220} height={28} />
            <Skeleton width={300} height={16} />
          </div>
        </div>
        <div className={styles.tableCard}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Skeleton width={100} height={14} />
              <Skeleton width={120} height={14} />
              <Skeleton width={200} height={14} />
              <Skeleton width={44} height={24} variant="rect" />
              <Skeleton width={80} height={14} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{t('admin.featureFlags.title')}</h1>
          <p className={styles.subtitle}>{t('admin.featureFlags.subtitle')}</p>
        </div>
        <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
          {t('admin.featureFlags.createFlag')}
        </Button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder={t('admin.featureFlags.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">{t('admin.featureFlags.allStatuses')}</option>
          <option value="enabled">{t('admin.featureFlags.enabled')}</option>
          <option value="disabled">{t('admin.featureFlags.disabled')}</option>
        </select>
        <select className={styles.filterSelect} value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
          <option value="all">{t('admin.featureFlags.allPlans')}</option>
          {PLAN_LEVELS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('admin.featureFlags.key')}</th>
              <th>{t('admin.featureFlags.nameCol')}</th>
              <th>{t('admin.featureFlags.globalStatus')}</th>
              <th>{t('admin.featureFlags.minPlan')}</th>
              <th>{t('admin.featureFlags.planLevels')}</th>
              <th>{t('admin.featureFlags.overrides')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', cursor: 'default' }}>
                  {t('admin.featureFlags.noResults')}
                </td>
              </tr>
            ) : (
              filtered.map((flag) => (
                <>
                  <tr
                    key={flag.id}
                    onClick={() => setExpandedId(expandedId === flag.id ? null : flag.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedId(expandedId === flag.id ? null : flag.id);
                      }
                    }}
                  >
                    <td>
                      <span className={styles.flagKey}>{flag.key}</span>
                    </td>
                    <td>
                      <div className={styles.flagName}>{flag.name}</div>
                      <div className={styles.flagDescription}>{flag.description}</div>
                    </td>
                    <td>
                      <div className={styles.toggleWrapper} onClick={(e) => e.stopPropagation()}>
                        <label className={styles.toggle}>
                          <input
                            type="checkbox"
                            className={styles.toggleInput}
                            checked={flag.enabled}
                            onChange={() => handleToggle(flag.id)}
                          />
                          <span className={styles.toggleTrack} />
                          <span className={styles.toggleKnob} />
                        </label>
                        <span className={`${styles.toggleLabel} ${flag.enabled ? styles.toggleLabelOn : styles.toggleLabelOff}`}>
                          {flag.enabled ? t('admin.featureFlags.on') : t('admin.featureFlags.off')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.planBadge} ${planClassMap[flag.minPlan]}`}>
                        {flag.minPlan}+
                      </span>
                    </td>
                    <td>
                      <div className={styles.planIndicator}>
                        {PLAN_LEVELS.map((plan, idx) => (
                          <span
                            key={plan}
                            className={`${styles.planDot} ${idx >= getPlanIndex(flag.minPlan) ? styles.planDotActive : ''}`}
                            title={plan}
                          />
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.overrideCount} ${flag.overrides.length > 0 ? styles.overrideCountActive : ''}`}>
                        {flag.overrides.length}
                      </span>
                    </td>
                  </tr>
                  {expandedId === flag.id && (
                    <tr key={`${flag.id}-expanded`} className={styles.expandedRow}>
                      <td colSpan={6}>
                        <div className={styles.expandedContent}>
                          <div className={styles.overrideHeader}>
                            <span className={styles.overrideTitle}>
                              {t('admin.featureFlags.tenantOverrides')} ({flag.overrides.length})
                            </span>
                          </div>

                          {flag.overrides.length === 0 ? (
                            <div className={styles.noOverrides}>
                              {t('admin.featureFlags.noOverrides')}
                            </div>
                          ) : (
                            <table className={styles.overrideTable}>
                              <thead>
                                <tr>
                                  <th>{t('admin.featureFlags.tenant')}</th>
                                  <th>{t('admin.featureFlags.overrideStatus')}</th>
                                  <th>{t('admin.featureFlags.action')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {flag.overrides.map((override) => (
                                  <tr key={override.tenantId}>
                                    <td>{override.tenantName}</td>
                                    <td>
                                      <div className={styles.toggleWrapper}>
                                        <label className={styles.toggle}>
                                          <input
                                            type="checkbox"
                                            className={styles.toggleInput}
                                            checked={override.enabled}
                                            onChange={() => handleOverrideToggle(flag.id, override.tenantId)}
                                          />
                                          <span className={styles.toggleTrack} />
                                          <span className={styles.toggleKnob} />
                                        </label>
                                        <span className={`${styles.toggleLabel} ${override.enabled ? styles.toggleLabelOn : styles.toggleLabelOff}`}>
                                          {override.enabled ? t('admin.featureFlags.enabled') : t('admin.featureFlags.disabled')}
                                        </span>
                                      </div>
                                    </td>
                                    <td>
                                      <button className={styles.removeBtn} type="button" style={{ fontSize: '12px', color: 'var(--color-error)', cursor: 'pointer' }}>
                                        {t('admin.featureFlags.remove')}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}

                          {/* Add Override */}
                          <div className={styles.addOverrideRow}>
                            <select className={styles.addOverrideSelect}>
                              <option value="">{t('admin.featureFlags.selectTenant')}</option>
                              {tenantList.map((tenant) => (
                                <option key={tenant.value} value={tenant.value}>{tenant.label}</option>
                              ))}
                            </select>
                            <Button variant="secondary" size="sm">
                              {t('admin.featureFlags.addOverride')}
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Flag Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t('admin.featureFlags.createFlag')}
        size="md"
        footer={
          <div className={styles.formActions}>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              {t('admin.common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleCreateSubmit}>
              {t('admin.featureFlags.createFlag')}
            </Button>
          </div>
        }
      >
        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <Input
              label={t('admin.featureFlags.flagKey')}
              placeholder="e.g. new_feature_name"
              value={formKey}
              onChange={(e) => setFormKey(e.target.value)}
              required
              helperText={t('admin.featureFlags.keyHelper')}
            />
            <Input
              label={t('admin.featureFlags.flagName')}
              placeholder="e.g. New Feature"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>
          <Input
            label={t('admin.featureFlags.flagDescription')}
            placeholder="Describe what this feature flag controls..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />
          <div className={styles.formRow}>
            <Select
              label={t('admin.featureFlags.defaultStatus')}
              options={[
                { label: 'Enabled', value: 'true' },
                { label: 'Disabled', value: 'false' },
              ]}
              value={String(formEnabled)}
              onChange={(e) => setFormEnabled(e.target.value === 'true')}
            />
            <Select
              label={t('admin.featureFlags.minPlanRequired')}
              options={PLAN_LEVELS.map((p) => ({ label: p, value: p }))}
              value={formMinPlan}
              onChange={(e) => setFormMinPlan(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
