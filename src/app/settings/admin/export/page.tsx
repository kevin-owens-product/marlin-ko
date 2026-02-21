'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/locale-context';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import styles from './export.module.css';

/* ---------- Types ---------- */

type ExportFormat = 'csv' | 'json' | 'pdf';
type DatePreset = 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'custom';

interface ExportCategory {
  key: string;
  icon: string;
  titleKey: string;
  formats: ExportFormat[];
  filters: ExportFilter[];
}

interface ExportFilter {
  key: string;
  labelKey: string;
  type: 'select' | 'daterange';
  options?: { label: string; value: string }[];
}

interface RecentExport {
  id: string;
  fileName: string;
  type: string;
  format: ExportFormat;
  date: string;
  size: string;
}

/* ---------- Constants ---------- */

const DATE_PRESETS: { label: string; value: DatePreset }[] = [
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'This Quarter', value: 'this_quarter' },
  { label: 'This Year', value: 'this_year' },
  { label: 'Custom', value: 'custom' },
];

const CATEGORIES: ExportCategory[] = [
  {
    key: 'invoices',
    icon: '\u{1F4C4}',
    titleKey: 'tenantAdmin.export.invoices',
    formats: ['csv', 'json', 'pdf'],
    filters: [
      {
        key: 'status',
        labelKey: 'tenantAdmin.export.statusFilter',
        type: 'select',
        options: [
          { label: 'All Statuses', value: 'all' },
          { label: 'Pending', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Paid', value: 'paid' },
        ],
      },
    ],
  },
  {
    key: 'payments',
    icon: '\u{1F4B3}',
    titleKey: 'tenantAdmin.export.payments',
    formats: ['csv', 'json'],
    filters: [
      {
        key: 'method',
        labelKey: 'tenantAdmin.export.methodFilter',
        type: 'select',
        options: [
          { label: 'All Methods', value: 'all' },
          { label: 'ACH', value: 'ach' },
          { label: 'Wire', value: 'wire' },
          { label: 'Check', value: 'check' },
          { label: 'Virtual Card', value: 'vcard' },
        ],
      },
    ],
  },
  {
    key: 'suppliers',
    icon: '\u{1F3E2}',
    titleKey: 'tenantAdmin.export.suppliers',
    formats: ['csv', 'json'],
    filters: [
      {
        key: 'category',
        labelKey: 'tenantAdmin.export.categoryFilter',
        type: 'select',
        options: [
          { label: 'All Categories', value: 'all' },
          { label: 'Services', value: 'services' },
          { label: 'Materials', value: 'materials' },
          { label: 'Technology', value: 'technology' },
          { label: 'Logistics', value: 'logistics' },
        ],
      },
    ],
  },
  {
    key: 'expenses',
    icon: '\u{1F4CA}',
    titleKey: 'tenantAdmin.export.expenses',
    formats: ['csv', 'json', 'pdf'],
    filters: [
      {
        key: 'status',
        labelKey: 'tenantAdmin.export.statusFilter',
        type: 'select',
        options: [
          { label: 'All Statuses', value: 'all' },
          { label: 'Submitted', value: 'submitted' },
          { label: 'Approved', value: 'approved' },
          { label: 'Reimbursed', value: 'reimbursed' },
        ],
      },
    ],
  },
  {
    key: 'audit',
    icon: '\u{1F4CB}',
    titleKey: 'tenantAdmin.export.auditLogs',
    formats: ['csv', 'json'],
    filters: [
      {
        key: 'actionType',
        labelKey: 'tenantAdmin.export.actionTypeFilter',
        type: 'select',
        options: [
          { label: 'All Action Types', value: 'all' },
          { label: 'Create', value: 'create' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
          { label: 'Login', value: 'login' },
          { label: 'Export', value: 'export' },
        ],
      },
    ],
  },
  {
    key: 'purchase_orders',
    icon: '\u{1F4E6}',
    titleKey: 'tenantAdmin.export.purchaseOrders',
    formats: ['csv', 'json', 'pdf'],
    filters: [
      {
        key: 'status',
        labelKey: 'tenantAdmin.export.statusFilter',
        type: 'select',
        options: [
          { label: 'All Statuses', value: 'all' },
          { label: 'Open', value: 'open' },
          { label: 'Fulfilled', value: 'fulfilled' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
      },
    ],
  },
];

const MOCK_EXPORTS: RecentExport[] = [
  { id: 'e1', fileName: 'invoices_feb_2026.csv', type: 'Invoices', format: 'csv', date: 'Feb 20, 2026', size: '2.4 MB' },
  { id: 'e2', fileName: 'payments_q1_2026.json', type: 'Payments', format: 'json', date: 'Feb 18, 2026', size: '1.1 MB' },
  { id: 'e3', fileName: 'suppliers_all.csv', type: 'Suppliers', format: 'csv', date: 'Feb 15, 2026', size: '890 KB' },
  { id: 'e4', fileName: 'audit_log_jan_2026.csv', type: 'Audit Logs', format: 'csv', date: 'Feb 1, 2026', size: '5.7 MB' },
  { id: 'e5', fileName: 'expenses_2025.pdf', type: 'Expenses', format: 'pdf', date: 'Jan 31, 2026', size: '3.2 MB' },
];

/* ---------- Component ---------- */

export default function ExportPage() {
  const t = useT();
  const router = useRouter();
  const { addToast } = useToast();

  const [recentExports, setRecentExports] = useState<RecentExport[]>(MOCK_EXPORTS);
  const [exportState, setExportState] = useState<Record<string, {
    datePreset: DatePreset;
    startDate: string;
    endDate: string;
    format: ExportFormat;
    filters: Record<string, string>;
    exporting: boolean;
    progress: number;
  }>>({});

  const getState = (key: string) =>
    exportState[key] || {
      datePreset: 'this_month' as DatePreset,
      startDate: '',
      endDate: '',
      format: 'csv' as ExportFormat,
      filters: {},
      exporting: false,
      progress: 0,
    };

  const updateState = useCallback((key: string, updates: Record<string, unknown>) => {
    setExportState((prev) => ({
      ...prev,
      [key]: { ...getState(key), ...updates } as typeof prev[string],
    }));
  }, [exportState]);

  const handleExport = useCallback((categoryKey: string) => {
    const state = getState(categoryKey);
    updateState(categoryKey, { exporting: true, progress: 0 });

    const interval = setInterval(() => {
      setExportState((prev) => {
        const current = prev[categoryKey];
        if (!current) return prev;
        const newProgress = current.progress + Math.random() * 30 + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          const category = CATEGORIES.find((c) => c.key === categoryKey);
          const newExport: RecentExport = {
            id: `e${Date.now()}`,
            fileName: `${categoryKey}_export_${Date.now()}.${state.format}`,
            type: category ? t(category.titleKey) : categoryKey,
            format: state.format,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
          };
          setRecentExports((re) => [newExport, ...re]);
          addToast({ type: 'success', title: t('tenantAdmin.export.exportComplete') });
          return { ...prev, [categoryKey]: { ...current, exporting: false, progress: 100 } };
        }
        return { ...prev, [categoryKey]: { ...current, progress: newProgress } };
      });
    }, 400);
  }, [exportState, addToast, t]);

  const formatTypeClass = (format: ExportFormat) => {
    if (format === 'csv') return styles.fileTypeCsv;
    if (format === 'json') return styles.fileTypeJson;
    return styles.fileTypePdf;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backLink} onClick={() => router.push('/settings/admin')}>
          &#8592; {t('tenantAdmin.title')}
        </button>
        <h1 className={styles.headerTitle}>{t('tenantAdmin.export.title')}</h1>
        <p className={styles.headerSubtitle}>{t('tenantAdmin.export.subtitle')}</p>
      </div>

      <div className={styles.content}>
        {/* Export Category Cards */}
        <div className={styles.categoryGrid}>
          {CATEGORIES.map((category) => {
            const state = getState(category.key);
            return (
              <div key={category.key} className={styles.categoryCard}>
                <div className={styles.categoryHeader}>
                  <div className={styles.categoryIcon}>{category.icon}</div>
                  <div className={styles.categoryTitle}>{t(category.titleKey)}</div>
                </div>

                <div className={styles.categoryBody}>
                  {/* Date Range */}
                  <div className={styles.filterRow}>
                    <span className={styles.filterLabel}>{t('tenantAdmin.export.dateRange')}</span>
                    <select
                      className={styles.filterSelect}
                      value={state.datePreset}
                      onChange={(e) => updateState(category.key, { datePreset: e.target.value })}
                    >
                      {DATE_PRESETS.map((preset) => (
                        <option key={preset.value} value={preset.value}>{preset.label}</option>
                      ))}
                    </select>
                  </div>

                  {state.datePreset === 'custom' && (
                    <div className={styles.dateRow}>
                      <div className={styles.filterRow}>
                        <span className={styles.filterLabel}>{t('tenantAdmin.export.startDate')}</span>
                        <input
                          type="date"
                          className={styles.dateInput}
                          value={state.startDate}
                          onChange={(e) => updateState(category.key, { startDate: e.target.value })}
                        />
                      </div>
                      <div className={styles.filterRow}>
                        <span className={styles.filterLabel}>{t('tenantAdmin.export.endDate')}</span>
                        <input
                          type="date"
                          className={styles.dateInput}
                          value={state.endDate}
                          onChange={(e) => updateState(category.key, { endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Category-specific Filters */}
                  {category.filters.map((filter) => (
                    <div key={filter.key} className={styles.filterRow}>
                      <span className={styles.filterLabel}>{t(filter.labelKey)}</span>
                      <select
                        className={styles.filterSelect}
                        value={state.filters[filter.key] || 'all'}
                        onChange={(e) =>
                          updateState(category.key, {
                            filters: { ...state.filters, [filter.key]: e.target.value },
                          })
                        }
                      >
                        {filter.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  {/* Format Selection */}
                  <div className={styles.filterRow}>
                    <span className={styles.filterLabel}>{t('tenantAdmin.export.format')}</span>
                    <div className={styles.formatRow}>
                      {category.formats.map((fmt) => (
                        <button
                          key={fmt}
                          className={`${styles.formatButton} ${state.format === fmt ? styles.formatButtonActive : ''}`}
                          onClick={() => updateState(category.key, { format: fmt })}
                        >
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Export Button & Progress */}
                  <div className={styles.exportButtonRow}>
                    {state.exporting ? (
                      <div className={styles.progressWrapper}>
                        <ProgressBar
                          value={state.progress}
                          max={100}
                          showValue
                          variant="default"
                          size="sm"
                          animated
                          label={t('tenantAdmin.export.exporting')}
                        />
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleExport(category.key)}
                        icon={<span>&#8595;</span>}
                      >
                        {t('tenantAdmin.export.exportBtn')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Exports */}
        <div className={styles.recentExportsCard}>
          <h3 className={styles.recentExportsTitle}>{t('tenantAdmin.export.recentExports')}</h3>
          <table className={styles.exportsTable}>
            <thead>
              <tr>
                <th>{t('tenantAdmin.export.fileName')}</th>
                <th>{t('tenantAdmin.export.type')}</th>
                <th>{t('tenantAdmin.export.format')}</th>
                <th>{t('tenantAdmin.export.date')}</th>
                <th>{t('tenantAdmin.export.size')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentExports.map((exp) => (
                <tr key={exp.id}>
                  <td>
                    <span className={styles.fileIcon}>
                      &#128196; {exp.fileName}
                    </span>
                  </td>
                  <td>{exp.type}</td>
                  <td>
                    <span className={`${styles.fileTypeTag} ${formatTypeClass(exp.format)}`}>
                      {exp.format.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: '#86909C' }}>{exp.date}</td>
                  <td style={{ color: '#86909C' }}>{exp.size}</td>
                  <td>
                    <button
                      className={styles.downloadLink}
                      onClick={() => addToast({ type: 'info', title: 'Download started' })}
                    >
                      {t('tenantAdmin.export.download')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
