'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/locale-context';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import styles from './webhooks.module.css';

/* ---------- Types ---------- */

interface Webhook {
  id: string;
  url: string;
  description: string;
  events: string[];
  enabled: boolean;
  lastDelivered: string;
  failCount: number;
  createdAt: string;
  secret: string;
  [key: string]: unknown;
}

interface DeliveryLog {
  id: string;
  timestamp: string;
  event: string;
  statusCode: number;
  response: string;
  success: boolean;
}

/* ---------- Constants ---------- */

const EVENT_GROUPS: { group: string; events: string[] }[] = [
  {
    group: 'Invoices',
    events: ['invoice.created', 'invoice.approved', 'invoice.rejected', 'invoice.paid'],
  },
  {
    group: 'Payments',
    events: ['payment.created', 'payment.completed', 'payment.failed'],
  },
  {
    group: 'Approvals',
    events: ['approval.requested', 'approval.completed'],
  },
  {
    group: 'Suppliers',
    events: ['supplier.created', 'supplier.updated'],
  },
  {
    group: 'Expenses',
    events: ['expense.submitted', 'expense.approved'],
  },
];

const ALL_EVENTS = EVENT_GROUPS.flatMap((g) => g.events);

const generateSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'whsec_';
  for (let i = 0; i < 32; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

/* ---------- Mock Data ---------- */

const MOCK_WEBHOOKS: Webhook[] = [
  {
    id: 'wh1',
    url: 'https://api.erp-system.com/webhooks/medius',
    description: 'ERP system sync for invoices and payments',
    events: ['invoice.created', 'invoice.approved', 'invoice.paid', 'payment.completed'],
    enabled: true,
    lastDelivered: '2 min ago',
    failCount: 0,
    createdAt: 'Jan 10, 2026',
    secret: 'whsec_****************************abcd',
  },
  {
    id: 'wh2',
    url: 'https://hooks.slack.com/services/T00/B00/xxxx',
    description: 'Slack notifications for approvals and alerts',
    events: ['invoice.approved', 'payment.completed', 'expense.approved'],
    enabled: true,
    lastDelivered: '15 min ago',
    failCount: 2,
    createdAt: 'Feb 1, 2026',
    secret: 'whsec_****************************efgh',
  },
  {
    id: 'wh3',
    url: 'https://analytics.internal.company.io/ingest',
    description: 'Analytics data pipeline',
    events: ['invoice.created', 'invoice.approved', 'invoice.rejected', 'invoice.paid', 'payment.created', 'payment.completed', 'payment.failed'],
    enabled: false,
    lastDelivered: '3 days ago',
    failCount: 7,
    createdAt: 'Dec 15, 2025',
    secret: 'whsec_****************************ijkl',
  },
];

const MOCK_DELIVERIES: Record<string, DeliveryLog[]> = {
  wh1: [
    { id: 'd1', timestamp: 'Feb 21, 2026 10:32:15', event: 'invoice.approved', statusCode: 200, response: '{"ok": true}', success: true },
    { id: 'd2', timestamp: 'Feb 21, 2026 10:28:42', event: 'payment.completed', statusCode: 200, response: '{"ok": true}', success: true },
    { id: 'd3', timestamp: 'Feb 21, 2026 09:15:08', event: 'invoice.created', statusCode: 200, response: '{"ok": true}', success: true },
  ],
  wh2: [
    { id: 'd4', timestamp: 'Feb 21, 2026 10:15:33', event: 'expense.approved', statusCode: 200, response: 'ok', success: true },
    { id: 'd5', timestamp: 'Feb 21, 2026 09:45:12', event: 'invoice.approved', statusCode: 500, response: 'Internal Server Error', success: false },
    { id: 'd6', timestamp: 'Feb 20, 2026 16:22:01', event: 'payment.completed', statusCode: 500, response: 'timeout', success: false },
  ],
  wh3: [
    { id: 'd7', timestamp: 'Feb 18, 2026 14:10:22', event: 'invoice.created', statusCode: 500, response: 'Connection refused', success: false },
    { id: 'd8', timestamp: 'Feb 18, 2026 14:08:11', event: 'payment.failed', statusCode: 500, response: 'Connection refused', success: false },
  ],
};

/* ---------- Component ---------- */

export default function WebhooksPage() {
  const t = useT();
  const router = useRouter();
  const { addToast } = useToast();

  const [webhooks, setWebhooks] = useState<Webhook[]>(MOCK_WEBHOOKS);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [expandedWebhookId, setExpandedWebhookId] = useState<string | null>(null);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());

  const [formUrl, setFormUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEvents, setFormEvents] = useState<Set<string>>(new Set());
  const [formEnabled, setFormEnabled] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* ---- Form Validation ---- */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formUrl.trim()) {
      errors.url = t('tenantAdmin.webhooks.urlRequired');
    } else {
      try { new URL(formUrl); } catch { errors.url = t('tenantAdmin.webhooks.urlInvalid'); }
    }
    if (formEvents.size === 0) {
      errors.events = t('tenantAdmin.webhooks.selectAtLeastOne');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---- Create/Edit ---- */
  const openCreateModal = useCallback(() => {
    setFormUrl('');
    setFormDescription('');
    setFormEvents(new Set());
    setFormEnabled(true);
    setFormErrors({});
    setEditingWebhook(null);
    setGeneratedSecret(null);
    setCreateModalOpen(true);
  }, []);

  const openEditModal = useCallback((webhook: Webhook) => {
    setFormUrl(webhook.url);
    setFormDescription(webhook.description);
    setFormEvents(new Set(webhook.events));
    setFormEnabled(webhook.enabled);
    setFormErrors({});
    setEditingWebhook(webhook);
    setGeneratedSecret(null);
    setCreateModalOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!validateForm()) return;

    if (editingWebhook) {
      setWebhooks((prev) =>
        prev.map((wh) =>
          wh.id === editingWebhook.id
            ? { ...wh, url: formUrl, description: formDescription, events: Array.from(formEvents), enabled: formEnabled }
            : wh
        )
      );
      setCreateModalOpen(false);
      addToast({ type: 'success', title: t('tenantAdmin.webhooks.updated') });
    } else {
      const secret = generateSecret();
      setGeneratedSecret(secret);
      const newWebhook: Webhook = {
        id: `wh${Date.now()}`,
        url: formUrl,
        description: formDescription,
        events: Array.from(formEvents),
        enabled: formEnabled,
        lastDelivered: 'Never',
        failCount: 0,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        secret: `whsec_****...${secret.slice(-4)}`,
      };
      setWebhooks((prev) => [newWebhook, ...prev]);
      addToast({ type: 'success', title: t('tenantAdmin.webhooks.created') });
    }
  }, [editingWebhook, formUrl, formDescription, formEvents, formEnabled, addToast, t]);

  const handleCloseModal = useCallback(() => {
    setCreateModalOpen(false);
    setGeneratedSecret(null);
    setEditingWebhook(null);
  }, []);

  /* ---- Toggle/Delete/Test ---- */
  const handleToggle = useCallback((id: string) => {
    setWebhooks((prev) =>
      prev.map((wh) => (wh.id === id ? { ...wh, enabled: !wh.enabled } : wh))
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
    addToast({ type: 'success', title: t('tenantAdmin.webhooks.deleted') });
  }, [addToast, t]);

  const handleTest = useCallback((id: string) => {
    void id;
    addToast({ type: 'success', title: t('tenantAdmin.webhooks.testSent') });
  }, [addToast, t]);

  const handleCopySecret = useCallback(() => {
    if (generatedSecret) {
      navigator.clipboard.writeText(generatedSecret);
      addToast({ type: 'success', title: t('tenantAdmin.webhooks.secretCopied') });
    }
  }, [generatedSecret, addToast, t]);

  const toggleEvent = useCallback((event: string) => {
    setFormEvents((prev) => {
      const next = new Set(prev);
      if (next.has(event)) next.delete(event);
      else next.add(event);
      return next;
    });
  }, []);

  const toggleRevealSecret = useCallback((id: string) => {
    setRevealedSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* ---- Status Helper ---- */
  const getStatusInfo = (webhook: Webhook) => {
    if (webhook.failCount === 0) {
      return { className: styles.statusHealthy, label: t('tenantAdmin.webhooks.healthy') };
    }
    if (webhook.failCount <= 3) {
      return { className: styles.statusDegraded, label: t('tenantAdmin.webhooks.degraded') };
    }
    return { className: styles.statusFailing, label: t('tenantAdmin.webhooks.failing') };
  };

  /* ---- Table Columns ---- */
  const columns: DataTableColumn<Webhook>[] = [
    {
      key: 'url',
      header: t('tenantAdmin.webhooks.url'),
      sortable: true,
      render: (_val, row) => (
        <div>
          <span className={styles.urlCell} title={row.url}>{row.url}</span>
          {row.description && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'events',
      header: t('tenantAdmin.webhooks.events'),
      render: (_val, row) => (
        <div className={styles.eventBadges}>
          {row.events.slice(0, 2).map((ev) => (
            <Badge key={ev} variant="info" size="sm">{ev}</Badge>
          ))}
          {row.events.length > 2 && (
            <Badge variant="neutral" size="sm">+{row.events.length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'enabled',
      header: t('tenantAdmin.webhooks.active'),
      width: '80px',
      render: (_val, row) => (
        <button
          className={`${styles.toggleSwitch} ${row.enabled ? styles.toggleSwitchActive : ''}`}
          onClick={(e) => { e.stopPropagation(); handleToggle(row.id); }}
          aria-label={row.enabled ? t('tenantAdmin.webhooks.enabled') : t('tenantAdmin.webhooks.disabled')}
        >
          <div className={`${styles.toggleDot} ${row.enabled ? styles.toggleDotActive : ''}`} />
        </button>
      ),
    },
    {
      key: 'lastDelivered',
      header: t('tenantAdmin.webhooks.lastTriggered'),
      sortable: true,
      render: (val) => <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{String(val)}</span>,
    },
    {
      key: 'failCount',
      header: t('tenantAdmin.webhooks.failures'),
      sortable: true,
      render: (_val, row) => {
        const status = getStatusInfo(row);
        return (
          <span className={status.className}>
            <span className={styles.statusDot} />
            {status.label} ({row.failCount})
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (_val, row) => {
        const items: DropdownItem[] = [
          { label: t('tenantAdmin.webhooks.edit'), onClick: () => openEditModal(row) },
          { label: t('tenantAdmin.webhooks.test'), onClick: () => handleTest(row.id) },
          {
            label: t('tenantAdmin.webhooks.viewDeliveries'),
            onClick: () => setExpandedWebhookId(expandedWebhookId === row.id ? null : row.id),
          },
          { type: 'separator' },
          { label: t('tenantAdmin.webhooks.delete'), onClick: () => handleDelete(row.id), danger: true },
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
          <h1 className={styles.headerTitle}>{t('tenantAdmin.webhooks.title')}</h1>
          <p className={styles.headerSubtitle}>{t('tenantAdmin.webhooks.subtitle')}</p>
        </div>
        <Button variant="primary" icon={<span>+</span>} onClick={openCreateModal}>
          {t('tenantAdmin.webhooks.addWebhook')}
        </Button>
      </div>

      <div className={styles.content}>
        {/* Webhooks Table */}
        <div className={styles.tableCard}>
          <DataTable<Webhook>
            columns={columns}
            data={webhooks}
            keyExtractor={(row) => row.id}
            searchable
            searchPlaceholder={t('tenantAdmin.webhooks.searchPlaceholder')}
            searchKeys={['url', 'description']}
            emptyTitle={t('tenantAdmin.webhooks.noWebhooks')}
            emptyDescription={t('tenantAdmin.webhooks.noWebhooksDesc')}
          />
        </div>

        {/* Delivery Log (expanded) */}
        {expandedWebhookId && (
          <div className={styles.deliveryLog}>
            <div className={styles.deliveryLogHeader}>
              <span className={styles.deliveryLogTitle}>{t('tenantAdmin.webhooks.deliveryLog')}</span>
              <button className={styles.expandButton} onClick={() => setExpandedWebhookId(null)}>
                {t('common.close')}
              </button>
            </div>
            <div className={styles.deliveryLogLabels}>
              <span>{t('tenantAdmin.webhooks.timestamp')}</span>
              <span>{t('tenantAdmin.webhooks.event')}</span>
              <span>{t('tenantAdmin.webhooks.statusCode')}</span>
              <span>{t('tenantAdmin.webhooks.response')}</span>
              <span>{t('tenantAdmin.webhooks.result')}</span>
              <span></span>
            </div>
            {(MOCK_DELIVERIES[expandedWebhookId] || []).map((delivery) => (
              <div key={delivery.id} className={styles.deliveryItem}>
                <span className={styles.deliveryTimestamp}>{delivery.timestamp}</span>
                <span className={styles.deliveryEvent}>{delivery.event}</span>
                <span className={delivery.statusCode < 400 ? styles.deliveryStatus200 : styles.deliveryStatus500}>
                  {delivery.statusCode}
                </span>
                <span className={styles.deliveryResponse} title={delivery.response}>{delivery.response}</span>
                <span>
                  {delivery.success ? (
                    <Badge variant="success" size="sm">{t('tenantAdmin.webhooks.success')}</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">{t('tenantAdmin.webhooks.failure')}</Badge>
                  )}
                </span>
                <button className={styles.retryBtn} onClick={() => addToast({ type: 'info', title: t('tenantAdmin.webhooks.retrying') })}>
                  {t('tenantAdmin.webhooks.retry')}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Webhook Secret Display */}
        {webhooks.length > 0 && (
          <div className={styles.secretSection}>
            <h3 className={styles.secretSectionTitle}>{t('tenantAdmin.webhooks.secrets')}</h3>
            {webhooks.map((wh) => (
              <div key={wh.id} className={styles.secretRow}>
                <span className={styles.secretUrl} title={wh.url}>{wh.url}</span>
                <span className={styles.secretValueMasked}>
                  {revealedSecrets.has(wh.id) ? wh.secret : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                </span>
                <button
                  className={styles.secretRevealBtn}
                  onClick={() => toggleRevealSecret(wh.id)}
                >
                  {revealedSecrets.has(wh.id) ? t('tenantAdmin.webhooks.hide') : t('tenantAdmin.webhooks.reveal')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={createModalOpen}
        onClose={handleCloseModal}
        title={editingWebhook ? t('tenantAdmin.webhooks.editTitle') : t('tenantAdmin.webhooks.createTitle')}
        size="lg"
        footer={
          generatedSecret ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={handleCloseModal}>{t('common.close')}</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={handleCloseModal}>{t('common.cancel')}</Button>
              <Button variant="primary" onClick={handleSave}>
                {editingWebhook ? t('tenantAdmin.webhooks.save') : t('tenantAdmin.webhooks.create')}
              </Button>
            </div>
          )
        }
      >
        {generatedSecret ? (
          <div className={styles.form}>
            <div>
              <div className={styles.sectionLabel}>{t('tenantAdmin.webhooks.secret')}</div>
              <div className={styles.secretBox}>
                <span className={styles.secretValue}>{generatedSecret}</span>
                <Button variant="ghost" size="sm" onClick={handleCopySecret}>
                  {t('tenantAdmin.webhooks.copySecret')}
                </Button>
              </div>
              <div className={styles.secretWarning}>
                &#9888; {t('tenantAdmin.webhooks.secretGenerated')}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.form}>
            <Input
              label={t('tenantAdmin.webhooks.endpointUrl')}
              placeholder="https://api.example.com/webhooks"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              error={formErrors.url}
              required
            />

            <Input
              label={t('tenantAdmin.webhooks.description')}
              placeholder={t('tenantAdmin.webhooks.descriptionPlaceholder')}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />

            <div className={styles.activeToggleRow}>
              <span className={styles.sectionLabel} style={{ marginBottom: 0 }}>{t('tenantAdmin.webhooks.activeOnCreate')}</span>
              <button
                className={`${styles.toggleSwitch} ${formEnabled ? styles.toggleSwitchActive : ''}`}
                onClick={() => setFormEnabled((prev) => !prev)}
                aria-label={t('tenantAdmin.webhooks.toggleActive')}
              >
                <div className={`${styles.toggleDot} ${formEnabled ? styles.toggleDotActive : ''}`} />
              </button>
            </div>

            <div>
              <div className={styles.sectionLabel}>{t('tenantAdmin.webhooks.selectEvents')}</div>
              {formErrors.events && (
                <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)' }} role="alert">{formErrors.events}</span>
              )}
              {EVENT_GROUPS.map((group) => (
                <div key={group.group} className={styles.eventGroup}>
                  <div className={styles.eventGroupTitle}>{group.group}</div>
                  <div className={styles.eventGrid}>
                    {group.events.map((event) => (
                      <label key={event} className={styles.eventCheckbox}>
                        <input
                          type="checkbox"
                          className={styles.eventCheckboxInput}
                          checked={formEvents.has(event)}
                          onChange={() => toggleEvent(event)}
                        />
                        <span className={styles.eventLabel}>{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
