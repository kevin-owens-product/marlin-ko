'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/locale-context';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import styles from './api-keys.module.css';

/* ---------- Types ---------- */

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked' | 'expired';
  expiration: string;
  requestsToday: number;
  requestsThisMonth: number;
  rateLimit: string;
  [key: string]: unknown;
}

/* ---------- Constants ---------- */

const SCOPE_GROUPS: { group: string; scopes: string[] }[] = [
  { group: 'Invoices', scopes: ['invoices:read', 'invoices:write'] },
  { group: 'Suppliers', scopes: ['suppliers:read', 'suppliers:write'] },
  { group: 'Payments', scopes: ['payments:read', 'payments:write'] },
  { group: 'Reports', scopes: ['reports:read'] },
  { group: 'Webhooks', scopes: ['webhooks:manage'] },
];

const ALL_SCOPES = SCOPE_GROUPS.flatMap((g) => g.scopes);

const EXPIRATION_OPTIONS = [
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
  { label: '1 year', value: '365' },
  { label: 'Never', value: 'never' },
];

const generateApiKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'mk_';
  for (let i = 0; i < 48; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

/* ---------- Mock Data ---------- */

const MOCK_KEYS: ApiKey[] = [
  {
    id: 'k1',
    name: 'Production API',
    prefix: 'mk_****abcd',
    scopes: ['invoices:read', 'invoices:write', 'suppliers:read', 'payments:read', 'reports:read'],
    createdAt: 'Jan 15, 2026',
    lastUsed: '2 min ago',
    status: 'active',
    expiration: 'Never',
    requestsToday: 1247,
    requestsThisMonth: 34892,
    rateLimit: '10,000/hr',
  },
  {
    id: 'k2',
    name: 'Staging API',
    prefix: 'mk_****3k2m',
    scopes: ['invoices:read', 'invoices:write', 'suppliers:read', 'suppliers:write', 'payments:read', 'payments:write', 'reports:read'],
    createdAt: 'Dec 1, 2025',
    lastUsed: 'Yesterday',
    status: 'active',
    expiration: '90 days',
    requestsToday: 86,
    requestsThisMonth: 2104,
    rateLimit: '5,000/hr',
  },
  {
    id: 'k3',
    name: 'CI/CD Pipeline',
    prefix: 'mk_****9p4q',
    scopes: ['invoices:read', 'suppliers:read'],
    createdAt: 'Feb 5, 2026',
    lastUsed: '1 hour ago',
    status: 'active',
    expiration: '30 days',
    requestsToday: 412,
    requestsThisMonth: 8923,
    rateLimit: '1,000/hr',
  },
  {
    id: 'k4',
    name: 'Legacy Integration',
    prefix: 'mk_****2w1e',
    scopes: ['invoices:read'],
    createdAt: 'Jun 20, 2025',
    lastUsed: '3 months ago',
    status: 'expired',
    expiration: 'Expired',
    requestsToday: 0,
    requestsThisMonth: 0,
    rateLimit: 'N/A',
  },
];

/* ---------- Component ---------- */

export default function ApiKeysPage() {
  const t = useT();
  const router = useRouter();
  const { addToast } = useToast();

  const [apiKeys, setApiKeys] = useState<ApiKey[]>(MOCK_KEYS);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formScopes, setFormScopes] = useState<Set<string>>(new Set());
  const [formExpiration, setFormExpiration] = useState('90');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* ---- Validation ---- */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = t('tenantAdmin.apiKeysPage.keyNameRequired');
    if (formScopes.size === 0) errors.scopes = t('tenantAdmin.apiKeysPage.selectAtLeastOne');
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---- Create ---- */
  const openCreateModal = useCallback(() => {
    setFormName('');
    setFormScopes(new Set());
    setFormExpiration('90');
    setFormErrors({});
    setGeneratedKey(null);
    setCreateModalOpen(true);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!validateForm()) return;

    const fullKey = generateApiKey();
    const prefix = `mk_****${fullKey.slice(-4)}`;
    const expirationLabel = EXPIRATION_OPTIONS.find((o) => o.value === formExpiration)?.label || formExpiration;

    const newKey: ApiKey = {
      id: `k${Date.now()}`,
      name: formName,
      prefix,
      scopes: Array.from(formScopes),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastUsed: 'Never',
      status: 'active',
      expiration: expirationLabel,
      requestsToday: 0,
      requestsThisMonth: 0,
      rateLimit: '5,000/hr',
    };

    setApiKeys((prev) => [newKey, ...prev]);
    setGeneratedKey(fullKey);
    addToast({ type: 'success', title: t('tenantAdmin.apiKeysPage.keyGenerated') });
  }, [formName, formScopes, formExpiration, addToast, t]);

  const handleCloseModal = useCallback(() => {
    setCreateModalOpen(false);
    setGeneratedKey(null);
  }, []);

  /* ---- Actions ---- */
  const openRevokeConfirmation = useCallback((id: string) => {
    setRevokingKeyId(id);
    setRevokeModalOpen(true);
  }, []);

  const handleConfirmRevoke = useCallback(() => {
    if (revokingKeyId) {
      setApiKeys((prev) =>
        prev.map((k) => (k.id === revokingKeyId ? { ...k, status: 'revoked' as const } : k))
      );
      addToast({ type: 'success', title: t('tenantAdmin.apiKeysPage.keyRevoked') });
    }
    setRevokeModalOpen(false);
    setRevokingKeyId(null);
  }, [revokingKeyId, addToast, t]);

  const handleRegenerate = useCallback((id: string) => {
    void id;
    addToast({ type: 'success', title: t('tenantAdmin.apiKeysPage.keyRegenerated') });
  }, [addToast, t]);

  const handleCopyKey = useCallback(() => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      addToast({ type: 'success', title: t('tenantAdmin.apiKeysPage.keyCopied') });
    }
  }, [generatedKey, addToast, t]);

  const toggleScope = useCallback((scope: string) => {
    setFormScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scope)) next.delete(scope);
      else next.add(scope);
      return next;
    });
  }, []);

  /* ---- Table Columns ---- */
  const columns: DataTableColumn<ApiKey>[] = [
    {
      key: 'name',
      header: t('tenantAdmin.apiKeysPage.name'),
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{String(val)}</div>
          <div className={styles.usageStats}>
            <span className={styles.usageStat}>
              <span className={styles.usageStatValue}>{row.requestsToday.toLocaleString()}</span>
              {t('tenantAdmin.apiKeysPage.requestsToday')}
            </span>
            <span className={styles.usageStat}>
              <span className={styles.usageStatValue}>{row.requestsThisMonth.toLocaleString()}</span>
              {t('tenantAdmin.apiKeysPage.requestsThisMonth')}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'prefix',
      header: t('tenantAdmin.apiKeysPage.key'),
      render: (val) => <span className={styles.keyPrefix}>{String(val)}</span>,
    },
    {
      key: 'scopes',
      header: t('tenantAdmin.apiKeysPage.permissions'),
      render: (_val, row) => (
        <div className={styles.scopesList}>
          {row.scopes.slice(0, 3).map((scope) => (
            <span key={scope} className={styles.scopeBadge}>{scope}</span>
          ))}
          {row.scopes.length > 3 && (
            <span className={styles.scopeBadge}>+{row.scopes.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'lastUsed',
      header: t('tenantAdmin.apiKeysPage.lastUsed'),
      sortable: true,
      render: (val) => <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{String(val)}</span>,
    },
    {
      key: 'expiration',
      header: t('tenantAdmin.apiKeysPage.expires'),
      sortable: true,
      render: (val, row) => {
        if (row.status === 'expired') {
          return <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Expired</span>;
        }
        return <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{String(val)}</span>;
      },
    },
    {
      key: 'rateLimit',
      header: t('tenantAdmin.apiKeysPage.rateLimit'),
      render: (val) => <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>{String(val)}</span>,
    },
    {
      key: 'status',
      header: t('tenantAdmin.apiKeysPage.status'),
      sortable: true,
      render: (_val, row) => {
        if (row.status === 'active') {
          return <span className={styles.statusActive}><span className={styles.statusDot} />{t('common.active')}</span>;
        }
        if (row.status === 'revoked') {
          return <span className={styles.statusRevoked}><span className={styles.statusDot} />{t('tenantAdmin.apiKeysPage.revoked')}</span>;
        }
        return <span className={styles.statusExpired}><span className={styles.statusDot} />{t('tenantAdmin.apiKeysPage.expired')}</span>;
      },
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      render: (_val, row) => {
        if (row.status !== 'active') return null;
        const items: DropdownItem[] = [
          { label: t('tenantAdmin.apiKeysPage.editScopes'), onClick: () => {} },
          { label: t('tenantAdmin.apiKeysPage.regenerate'), onClick: () => handleRegenerate(row.id) },
          { type: 'separator' },
          { label: t('tenantAdmin.apiKeysPage.revoke'), onClick: () => openRevokeConfirmation(row.id), danger: true },
        ];
        return (
          <Dropdown
            trigger={<span className={styles.actionDots}>&#8943;</span>}
            items={items}
            align="right"
          />
        );
      },
    },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backLink} onClick={() => router.push('/settings/admin')}>
            &#8592; {t('tenantAdmin.title')}
          </button>
          <h1 className={styles.headerTitle}>{t('tenantAdmin.apiKeysPage.title')}</h1>
          <p className={styles.headerSubtitle}>{t('tenantAdmin.apiKeysPage.subtitle')}</p>
        </div>
        <Button variant="primary" icon={<span>+</span>} onClick={openCreateModal}>
          {t('tenantAdmin.apiKeysPage.generateKey')}
        </Button>
      </div>

      {/* Security Warning Banner */}
      <div className={styles.warningBanner}>
        <span className={styles.warningIcon}>&#9888;</span>
        <div className={styles.warningContent}>
          <span className={styles.warningTitle}>{t('tenantAdmin.apiKeysPage.securityWarningTitle')}</span>
          <span className={styles.warningText}>{t('tenantAdmin.apiKeysPage.securityWarningDesc')}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tableCard}>
          <DataTable<ApiKey>
            columns={columns}
            data={apiKeys}
            keyExtractor={(row) => row.id}
            searchable
            searchPlaceholder={t('tenantAdmin.apiKeysPage.searchPlaceholder')}
            searchKeys={['name', 'prefix']}
            emptyTitle={t('tenantAdmin.apiKeysPage.noKeys')}
            emptyDescription={t('tenantAdmin.apiKeysPage.noKeysDesc')}
          />
        </div>
      </div>

      {/* Generate Key Modal */}
      <Modal
        open={createModalOpen}
        onClose={handleCloseModal}
        title={generatedKey ? t('tenantAdmin.apiKeysPage.keyCreated') : t('tenantAdmin.apiKeysPage.createTitle')}
        size="md"
        footer={
          generatedKey ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={handleCloseModal}>{t('common.close')}</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={handleCloseModal}>{t('common.cancel')}</Button>
              <Button variant="primary" onClick={handleGenerate}>
                {t('tenantAdmin.apiKeysPage.generate')}
              </Button>
            </div>
          )
        }
      >
        {generatedKey ? (
          <div className={styles.keyGeneratedBox}>
            <div className={styles.keyDisplayBox}>
              <span className={styles.keyValue}>{generatedKey}</span>
              <Button variant="ghost" size="sm" onClick={handleCopyKey}>
                {t('tenantAdmin.apiKeysPage.copyKey')}
              </Button>
            </div>
            <div className={styles.keyWarning}>
              &#9888; {t('tenantAdmin.apiKeysPage.keyWarning')}
            </div>
          </div>
        ) : (
          <div className={styles.form}>
            <Input
              label={t('tenantAdmin.apiKeysPage.keyName')}
              placeholder={t('tenantAdmin.apiKeysPage.keyNamePlaceholder')}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              error={formErrors.name}
              required
            />

            <div>
              <div className={styles.sectionLabel}>{t('tenantAdmin.apiKeysPage.selectScopes')}</div>
              {formErrors.scopes && (
                <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)' }} role="alert">{formErrors.scopes}</span>
              )}
              {SCOPE_GROUPS.map((group) => (
                <div key={group.group} className={styles.scopeGroup}>
                  <div className={styles.scopeGroupTitle}>{group.group}</div>
                  <div className={styles.scopeGrid}>
                    {group.scopes.map((scope) => (
                      <label key={scope} className={styles.scopeCheckbox}>
                        <input
                          type="checkbox"
                          className={styles.scopeCheckboxInput}
                          checked={formScopes.has(scope)}
                          onChange={() => toggleScope(scope)}
                        />
                        <span className={styles.scopeLabel}>{scope}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Select
              label={t('tenantAdmin.apiKeysPage.expiration')}
              options={EXPIRATION_OPTIONS}
              value={formExpiration}
              onChange={(e) => setFormExpiration(e.target.value)}
            />
          </div>
        )}
      </Modal>

      {/* Revoke Confirmation Modal */}
      <Modal
        open={revokeModalOpen}
        onClose={() => { setRevokeModalOpen(false); setRevokingKeyId(null); }}
        title={t('tenantAdmin.apiKeysPage.revokeConfirmTitle')}
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => { setRevokeModalOpen(false); setRevokingKeyId(null); }}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleConfirmRevoke}>
              {t('tenantAdmin.apiKeysPage.confirmRevoke')}
            </Button>
          </div>
        }
      >
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          {t('tenantAdmin.apiKeysPage.revokeConfirmDesc')}
        </p>
      </Modal>
    </div>
  );
}
