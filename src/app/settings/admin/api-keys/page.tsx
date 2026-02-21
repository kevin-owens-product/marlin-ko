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
  [key: string]: unknown;
}

/* ---------- Constants ---------- */

const ALL_SCOPES = [
  'read:invoices',
  'write:invoices',
  'read:suppliers',
  'write:suppliers',
  'read:payments',
  'write:payments',
  'read:reports',
  'admin',
];

const EXPIRATION_OPTIONS = [
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
  { label: '1 year', value: '365' },
  { label: 'Never', value: 'never' },
];

const generateApiKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'msk_';
  for (let i = 0; i < 48; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

/* ---------- Mock Data ---------- */

const MOCK_KEYS: ApiKey[] = [
  {
    id: 'k1',
    name: 'Production API',
    prefix: 'msk_live_****...7x9f',
    scopes: ['read:invoices', 'write:invoices', 'read:suppliers', 'read:payments', 'read:reports'],
    createdAt: 'Jan 15, 2026',
    lastUsed: '2 min ago',
    status: 'active',
    expiration: 'Never',
    requestsToday: 1247,
    requestsThisMonth: 34892,
  },
  {
    id: 'k2',
    name: 'Staging API',
    prefix: 'msk_test_****...3k2m',
    scopes: ['read:invoices', 'write:invoices', 'read:suppliers', 'write:suppliers', 'read:payments', 'write:payments', 'read:reports'],
    createdAt: 'Dec 1, 2025',
    lastUsed: 'Yesterday',
    status: 'active',
    expiration: '90 days',
    requestsToday: 86,
    requestsThisMonth: 2104,
  },
  {
    id: 'k3',
    name: 'CI/CD Pipeline',
    prefix: 'msk_ci_****...9p4q',
    scopes: ['read:invoices', 'read:suppliers'],
    createdAt: 'Feb 5, 2026',
    lastUsed: '1 hour ago',
    status: 'active',
    expiration: '30 days',
    requestsToday: 412,
    requestsThisMonth: 8923,
  },
  {
    id: 'k4',
    name: 'Legacy Integration',
    prefix: 'msk_old_****...2w1e',
    scopes: ['read:invoices'],
    createdAt: 'Jun 20, 2025',
    lastUsed: '3 months ago',
    status: 'expired',
    expiration: 'Expired',
    requestsToday: 0,
    requestsThisMonth: 0,
  },
];

/* ---------- Component ---------- */

export default function ApiKeysPage() {
  const t = useT();
  const router = useRouter();
  const { addToast } = useToast();

  const [apiKeys, setApiKeys] = useState<ApiKey[]>(MOCK_KEYS);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formScopes, setFormScopes] = useState<Set<string>>(new Set());
  const [formExpiration, setFormExpiration] = useState('90');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* ---- Validation ---- */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = t('tenantAdmin.apiKeysPage.keyNameRequired');
    if (formScopes.size === 0) errors.scopes = 'Select at least one scope';
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
    const prefix = `msk_${formName.toLowerCase().replace(/\s+/g, '_').slice(0, 4)}_****...${fullKey.slice(-4)}`;

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
  const handleRevoke = useCallback((id: string) => {
    setApiKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k))
    );
    addToast({ type: 'success', title: t('tenantAdmin.apiKeysPage.keyRevoked') });
  }, [addToast, t]);

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
          <div style={{ fontWeight: 500, color: '#1D2129' }}>{String(val)}</div>
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
      header: t('tenantAdmin.apiKeysPage.keyPrefix'),
      render: (val) => <span className={styles.keyPrefix}>{String(val)}</span>,
    },
    {
      key: 'scopes',
      header: t('tenantAdmin.apiKeysPage.scopes'),
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
      key: 'createdAt',
      header: t('tenantAdmin.apiKeysPage.created'),
      sortable: true,
      render: (val) => <span style={{ color: '#86909C', fontSize: '0.8125rem' }}>{String(val)}</span>,
    },
    {
      key: 'lastUsed',
      header: t('tenantAdmin.apiKeysPage.lastUsed'),
      sortable: true,
      render: (val) => <span style={{ color: '#86909C', fontSize: '0.8125rem' }}>{String(val)}</span>,
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
          return <span className={styles.statusRevoked}><span className={styles.statusDot} />Revoked</span>;
        }
        return <span className={styles.statusExpired}><span className={styles.statusDot} />Expired</span>;
      },
    },
    {
      key: 'actions',
      header: t('tenantAdmin.apiKeysPage.actions'),
      width: '60px',
      render: (_val, row) => {
        if (row.status !== 'active') return null;
        const items: DropdownItem[] = [
          { label: t('tenantAdmin.apiKeysPage.editScopes'), onClick: () => {} },
          { label: t('tenantAdmin.apiKeysPage.regenerate'), onClick: () => handleRegenerate(row.id) },
          { type: 'separator' },
          { label: t('tenantAdmin.apiKeysPage.revoke'), onClick: () => handleRevoke(row.id), danger: true },
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

      <div className={styles.content}>
        <div className={styles.tableCard}>
          <DataTable<ApiKey>
            columns={columns}
            data={apiKeys}
            keyExtractor={(row) => row.id}
            searchable
            searchPlaceholder="Search API keys..."
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
        title={generatedKey ? t('tenantAdmin.apiKeysPage.keyGenerated') : t('tenantAdmin.apiKeysPage.createTitle')}
        size="md"
        footer={
          generatedKey ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={handleCloseModal}>{t('common.close')}</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
                <span style={{ color: '#F53F3F', fontSize: '0.75rem' }} role="alert">{formErrors.scopes}</span>
              )}
              <div className={styles.scopeGrid}>
                {ALL_SCOPES.map((scope) => (
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

            <Select
              label={t('tenantAdmin.apiKeysPage.expiration')}
              options={EXPIRATION_OPTIONS}
              value={formExpiration}
              onChange={(e) => setFormExpiration(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
