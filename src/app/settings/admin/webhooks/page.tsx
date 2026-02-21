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
  events: string[];
  enabled: boolean;
  lastDelivered: string;
  failCount: number;
  createdAt: string;
  [key: string]: unknown;
}

interface DeliveryLog {
  id: string;
  timestamp: string;
  event: string;
  statusCode: number;
  response: string;
}

/* ---------- Constants ---------- */

const ALL_EVENTS = [
  'invoice.created',
  'invoice.approved',
  'invoice.rejected',
  'invoice.paid',
  'payment.created',
  'payment.completed',
  'payment.failed',
  'approval.requested',
  'approval.completed',
  'supplier.created',
  'supplier.updated',
  'risk.alert_created',
];

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
    events: ['invoice.created', 'invoice.approved', 'invoice.paid', 'payment.completed'],
    enabled: true,
    lastDelivered: '2 min ago',
    failCount: 0,
    createdAt: 'Jan 10, 2026',
  },
  {
    id: 'wh2',
    url: 'https://hooks.slack.com/services/T00/B00/xxxx',
    events: ['invoice.approved', 'payment.completed', 'risk.alert_created'],
    enabled: true,
    lastDelivered: '15 min ago',
    failCount: 2,
    createdAt: 'Feb 1, 2026',
  },
  {
    id: 'wh3',
    url: 'https://analytics.internal.company.io/ingest',
    events: ['invoice.created', 'invoice.approved', 'invoice.rejected', 'invoice.paid', 'payment.created', 'payment.completed', 'payment.failed'],
    enabled: false,
    lastDelivered: '3 days ago',
    failCount: 7,
    createdAt: 'Dec 15, 2025',
  },
];

const MOCK_DELIVERIES: Record<string, DeliveryLog[]> = {
  wh1: [
    { id: 'd1', timestamp: 'Feb 21, 2026 10:32:15', event: 'invoice.approved', statusCode: 200, response: '{"ok": true}' },
    { id: 'd2', timestamp: 'Feb 21, 2026 10:28:42', event: 'payment.completed', statusCode: 200, response: '{"ok": true}' },
    { id: 'd3', timestamp: 'Feb 21, 2026 09:15:08', event: 'invoice.created', statusCode: 200, response: '{"ok": true}' },
  ],
  wh2: [
    { id: 'd4', timestamp: 'Feb 21, 2026 10:15:33', event: 'risk.alert_created', statusCode: 200, response: 'ok' },
    { id: 'd5', timestamp: 'Feb 21, 2026 09:45:12', event: 'invoice.approved', statusCode: 500, response: 'Internal Server Error' },
    { id: 'd6', timestamp: 'Feb 20, 2026 16:22:01', event: 'payment.completed', statusCode: 500, response: 'timeout' },
  ],
  wh3: [
    { id: 'd7', timestamp: 'Feb 18, 2026 14:10:22', event: 'invoice.created', statusCode: 500, response: 'Connection refused' },
    { id: 'd8', timestamp: 'Feb 18, 2026 14:08:11', event: 'payment.failed', statusCode: 500, response: 'Connection refused' },
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

  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<Set<string>>(new Set());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* ---- Form Validation ---- */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formUrl.trim()) {
      errors.url = t('tenantAdmin.webhooks.urlRequired');
    } else {
      try {
        new URL(formUrl);
      } catch {
        errors.url = t('tenantAdmin.webhooks.urlInvalid');
      }
    }
    if (formEvents.size === 0) {
      errors.events = 'Select at least one event';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---- Create/Edit ---- */
  const openCreateModal = useCallback(() => {
    setFormUrl('');
    setFormEvents(new Set());
    setFormErrors({});
    setEditingWebhook(null);
    setGeneratedSecret(null);
    setCreateModalOpen(true);
  }, []);

  const openEditModal = useCallback((webhook: Webhook) => {
    setFormUrl(webhook.url);
    setFormEvents(new Set(webhook.events));
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
            ? { ...wh, url: formUrl, events: Array.from(formEvents) }
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
        events: Array.from(formEvents),
        enabled: true,
        lastDelivered: 'Never',
        failCount: 0,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      setWebhooks((prev) => [newWebhook, ...prev]);
      addToast({ type: 'success', title: t('tenantAdmin.webhooks.created') });
    }
  }, [editingWebhook, formUrl, formEvents, addToast, t]);

  const handleCloseModal = useCallback(() => {
    setCreateModalOpen(false);
    setGeneratedSecret(null);
    setEditingWebhook(null);
  }, []);

  /* ---- Toggle/Delete ---- */
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
      render: (val) => <span className={styles.urlCell} title={String(val)}>{String(val)}</span>,
    },
    {
      key: 'events',
      header: t('tenantAdmin.webhooks.events'),
      render: (_val, row) => (
        <Badge variant="info" size="sm">{row.events.length} events</Badge>
      ),
    },
    {
      key: 'enabled',
      header: t('tenantAdmin.webhooks.status'),
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
      header: t('tenantAdmin.webhooks.lastDelivered'),
      sortable: true,
      render: (val) => <span style={{ color: '#86909C', fontSize: '0.8125rem' }}>{String(val)}</span>,
    },
    {
      key: 'failCount',
      header: t('tenantAdmin.webhooks.failCount'),
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
      header: t('tenantAdmin.webhooks.actions'),
      width: '120px',
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
            searchPlaceholder="Search webhooks..."
            searchKeys={['url']}
            emptyTitle={t('tenantAdmin.webhooks.noWebhooks')}
            emptyDescription={t('tenantAdmin.webhooks.noWebhooksDesc')}
          />
        </div>

        {/* Delivery Log (expanded) */}
        {expandedWebhookId && (
          <div className={styles.deliveryLog}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #E5E6EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1D2129' }}>{t('tenantAdmin.webhooks.deliveryLog')}</span>
              <button className={styles.expandButton} onClick={() => setExpandedWebhookId(null)}>
                {t('common.close')}
              </button>
            </div>
            {(MOCK_DELIVERIES[expandedWebhookId] || []).map((delivery) => (
              <div key={delivery.id} className={styles.deliveryItem}>
                <span className={styles.deliveryTimestamp}>{delivery.timestamp}</span>
                <span className={styles.deliveryEvent}>{delivery.event}</span>
                <span className={delivery.statusCode < 400 ? styles.deliveryStatus200 : styles.deliveryStatus500}>
                  {delivery.statusCode}
                </span>
                <span className={styles.deliveryResponse} title={delivery.response}>{delivery.response}</span>
                <button className={styles.retryBtn} onClick={() => addToast({ type: 'info', title: 'Retrying delivery...' })}>
                  {t('tenantAdmin.webhooks.retry')}
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
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={handleCloseModal}>{t('common.cancel')}</Button>
              <Button variant="primary" onClick={handleSave}>
                {t('tenantAdmin.webhooks.save')}
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
              label={t('tenantAdmin.webhooks.url')}
              placeholder={t('tenantAdmin.webhooks.urlPlaceholder')}
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              error={formErrors.url}
              required
            />

            <div>
              <div className={styles.sectionLabel}>{t('tenantAdmin.webhooks.selectEvents')}</div>
              {formErrors.events && (
                <span style={{ color: '#F53F3F', fontSize: '0.75rem' }} role="alert">{formErrors.events}</span>
              )}
              <div className={styles.eventGrid}>
                {ALL_EVENTS.map((event) => (
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
          </div>
        )}
      </Modal>
    </div>
  );
}
