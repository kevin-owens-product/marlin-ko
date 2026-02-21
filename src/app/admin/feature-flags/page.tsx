'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  description: string;
  enabled: boolean;
  scope: 'global' | 'tenant' | 'plan';
  updated: string;
  overrides: TenantOverride[];
}

/* ---------- Mock Data (spec-required flags) ---------- */
const mockFlags: FeatureFlag[] = [
  {
    id: 'f1', key: 'dynamic_discounting', description: 'Enable dynamic discounting module',
    enabled: true, scope: 'plan', updated: '2 days ago',
    overrides: [
      { tenantId: 't7', tenantName: 'StartupXYZ', enabled: true },
    ],
  },
  {
    id: 'f2', key: 'virtual_cards', description: 'Enable virtual card payments',
    enabled: true, scope: 'plan', updated: '5 days ago',
    overrides: [
      { tenantId: 't11', tenantName: 'TechParts Ltd', enabled: true },
    ],
  },
  {
    id: 'f3', key: 'supply_chain_finance', description: 'Enable SCF programs',
    enabled: true, scope: 'plan', updated: '1 week ago',
    overrides: [],
  },
  {
    id: 'f4', key: 'ai_copilot', description: 'Enable AI copilot assistant',
    enabled: true, scope: 'plan', updated: '3 days ago',
    overrides: [
      { tenantId: 't10', tenantName: 'FreshFoods Inc', enabled: false },
      { tenantId: 't7', tenantName: 'StartupXYZ', enabled: true },
    ],
  },
  {
    id: 'f5', key: 'supplier_portal', description: 'Enable supplier self-service portal',
    enabled: true, scope: 'global', updated: '1 day ago',
    overrides: [],
  },
  {
    id: 'f6', key: 'advanced_analytics', description: 'Enable advanced analytics dashboard',
    enabled: true, scope: 'plan', updated: '4 days ago',
    overrides: [
      { tenantId: 't9', tenantName: 'MedTech Solutions', enabled: true },
    ],
  },
  {
    id: 'f7', key: 'multi_currency', description: 'Enable multi-currency support',
    enabled: false, scope: 'tenant', updated: '1 week ago',
    overrides: [
      { tenantId: 't4', tenantName: 'GlobalLogistics Inc', enabled: true },
      { tenantId: 't2', tenantName: 'NordicTech AB', enabled: true },
    ],
  },
  {
    id: 'f8', key: 'api_access', description: 'Enable API access for integrations',
    enabled: true, scope: 'plan', updated: '2 weeks ago',
    overrides: [
      { tenantId: 't10', tenantName: 'FreshFoods Inc', enabled: true },
    ],
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

const scopeClassMap: Record<string, string> = {
  global: styles.scopeGlobal,
  tenant: styles.scopeTenant,
  plan: styles.scopePlan,
};

export default function FeatureFlagsPage() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<FeatureFlag[]>(mockFlags);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form state
  const [formKey, setFormKey] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formScope, setFormScope] = useState('global');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return flags.filter((flag) => {
      if (statusFilter === 'enabled' && !flag.enabled) return false;
      if (statusFilter === 'disabled' && flag.enabled) return false;
      if (scopeFilter !== 'all' && flag.scope !== scopeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          flag.key.toLowerCase().includes(q) ||
          flag.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [flags, search, statusFilter, scopeFilter]);

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

  const handleCreateSubmit = () => {
    setCreateModalOpen(false);
    setFormKey('');
    setFormDescription('');
    setFormEnabled(true);
    setFormScope('global');
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
              <Skeleton width={140} height={14} />
              <Skeleton width={200} height={14} />
              <Skeleton width={44} height={24} variant="rect" />
              <Skeleton width={80} height={14} />
              <Skeleton width={70} height={14} />
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
        <select className={styles.filterSelect} value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)}>
          <option value="all">{t('admin.featureFlags.allScopes')}</option>
          <option value="global">{t('admin.featureFlags.scopeGlobal')}</option>
          <option value="tenant">{t('admin.featureFlags.scopeTenant')}</option>
          <option value="plan">{t('admin.featureFlags.scopePlan')}</option>
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('admin.featureFlags.key')}</th>
              <th>{t('admin.featureFlags.descriptionCol')}</th>
              <th>{t('admin.featureFlags.statusCol')}</th>
              <th>{t('admin.featureFlags.scope')}</th>
              <th>{t('admin.featureFlags.updated')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', cursor: 'default' }}>
                  {t('admin.featureFlags.noResults')}
                </td>
              </tr>
            ) : (
              filtered.map((flag) => (
                <React.Fragment key={flag.id}>
                  <tr
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
                      <span className={`${styles.scopeBadge} ${scopeClassMap[flag.scope]}`}>
                        {flag.scope}
                      </span>
                    </td>
                    <td>
                      <span className={styles.updatedText}>{flag.updated}</span>
                    </td>
                  </tr>
                  {expandedId === flag.id && (
                    <tr className={styles.expandedRow}>
                      <td colSpan={5}>
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
                                      <button className={styles.removeBtn} type="button">
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
                </React.Fragment>
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
          <Input
            label={t('admin.featureFlags.flagKey')}
            placeholder="e.g. new_feature_name"
            value={formKey}
            onChange={(e) => setFormKey(e.target.value)}
            required
            helperText={t('admin.featureFlags.keyHelper')}
          />
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
              label={t('admin.featureFlags.scope')}
              options={[
                { label: 'Global', value: 'global' },
                { label: 'Tenant', value: 'tenant' },
                { label: 'Plan', value: 'plan' },
              ]}
              value={formScope}
              onChange={(e) => setFormScope(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
