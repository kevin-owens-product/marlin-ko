'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/locale-context';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import styles from './data-export.module.css';

/* ---------- Types ---------- */

type ExportFormat = 'csv' | 'excel' | 'pdf';
type DatePreset = 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'custom';
type ScheduleFrequency = 'daily' | 'weekly' | 'monthly';

interface ExportCategory {
  key: string;
  icon: string;
  titleKey: string;
  formats: ExportFormat[];
  columns: string[];
  filters: ExportFilter[];
}

interface ExportFilter {
  key: string;
  labelKey: string;
  options: { label: string; value: string }[];
}

interface RecentExport {
  id: string;
  fileName: string;
  type: string;
  format: ExportFormat;
  dateRange: string;
  size: string;
  status: 'completed' | 'processing' | 'failed';
  createdBy: string;
  date: string;
}

interface ScheduledExport {
  id: string;
  name: string;
  type: string;
  format: string;
  frequency: ScheduleFrequency;
  recipients: string;
  status: 'active' | 'paused';
  nextRun: string;
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
    titleKey: 'tenantAdmin.dataExport.invoices',
    formats: ['csv', 'excel', 'pdf'],
    columns: ['Invoice #', 'Vendor', 'Amount', 'Status', 'Due Date', 'PO #', 'GL Code', 'Approver'],
    filters: [
      { key: 'status', labelKey: 'tenantAdmin.dataExport.statusFilter', options: [{ label: 'All', value: 'all' }, { label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }, { label: 'Paid', value: 'paid' }] },
    ],
  },
  {
    key: 'payments',
    icon: '\u{1F4B3}',
    titleKey: 'tenantAdmin.dataExport.payments',
    formats: ['csv', 'excel'],
    columns: ['Payment #', 'Vendor', 'Amount', 'Method', 'Status', 'Date', 'Reference'],
    filters: [
      { key: 'method', labelKey: 'tenantAdmin.dataExport.methodFilter', options: [{ label: 'All', value: 'all' }, { label: 'ACH', value: 'ach' }, { label: 'Wire', value: 'wire' }, { label: 'Check', value: 'check' }, { label: 'Virtual Card', value: 'vcard' }] },
    ],
  },
  {
    key: 'suppliers',
    icon: '\u{1F3E2}',
    titleKey: 'tenantAdmin.dataExport.suppliers',
    formats: ['csv', 'excel'],
    columns: ['Name', 'Contact', 'Email', 'Category', 'Status', 'Payment Terms', 'Tax ID'],
    filters: [
      { key: 'category', labelKey: 'tenantAdmin.dataExport.categoryFilter', options: [{ label: 'All', value: 'all' }, { label: 'Services', value: 'services' }, { label: 'Materials', value: 'materials' }, { label: 'Technology', value: 'technology' }, { label: 'Logistics', value: 'logistics' }] },
    ],
  },
  {
    key: 'expenses',
    icon: '\u{1F4CA}',
    titleKey: 'tenantAdmin.dataExport.expenses',
    formats: ['csv', 'excel', 'pdf'],
    columns: ['Expense #', 'Employee', 'Category', 'Amount', 'Status', 'Date', 'Receipt'],
    filters: [
      { key: 'status', labelKey: 'tenantAdmin.dataExport.statusFilter', options: [{ label: 'All', value: 'all' }, { label: 'Submitted', value: 'submitted' }, { label: 'Approved', value: 'approved' }, { label: 'Reimbursed', value: 'reimbursed' }] },
    ],
  },
  {
    key: 'contracts',
    icon: '\u{1F4DD}',
    titleKey: 'tenantAdmin.dataExport.contracts',
    formats: ['csv', 'excel', 'pdf'],
    columns: ['Contract #', 'Vendor', 'Value', 'Start Date', 'End Date', 'Status', 'Category'],
    filters: [
      { key: 'status', labelKey: 'tenantAdmin.dataExport.statusFilter', options: [{ label: 'All', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Expired', value: 'expired' }, { label: 'Pending', value: 'pending' }] },
    ],
  },
  {
    key: 'audit',
    icon: '\u{1F4CB}',
    titleKey: 'tenantAdmin.dataExport.auditLogs',
    formats: ['csv', 'excel'],
    columns: ['Timestamp', 'User', 'Action', 'Resource', 'Details', 'IP Address'],
    filters: [
      { key: 'actionType', labelKey: 'tenantAdmin.dataExport.actionTypeFilter', options: [{ label: 'All', value: 'all' }, { label: 'Create', value: 'create' }, { label: 'Update', value: 'update' }, { label: 'Delete', value: 'delete' }, { label: 'Login', value: 'login' }, { label: 'Export', value: 'export' }] },
    ],
  },
  {
    key: 'purchase_orders',
    icon: '\u{1F4E6}',
    titleKey: 'tenantAdmin.dataExport.purchaseOrders',
    formats: ['csv', 'excel', 'pdf'],
    columns: ['PO #', 'Vendor', 'Amount', 'Status', 'Created', 'Delivery Date', 'Requester'],
    filters: [
      { key: 'status', labelKey: 'tenantAdmin.dataExport.statusFilter', options: [{ label: 'All', value: 'all' }, { label: 'Open', value: 'open' }, { label: 'Fulfilled', value: 'fulfilled' }, { label: 'Cancelled', value: 'cancelled' }] },
    ],
  },
];

const MOCK_EXPORTS: RecentExport[] = [
  { id: 'e1', fileName: 'invoices_feb_2026.csv', type: 'Invoices', format: 'csv', dateRange: 'Feb 1-21, 2026', size: '2.4 MB', status: 'completed', createdBy: 'Sarah Johnson', date: 'Feb 20, 2026' },
  { id: 'e2', fileName: 'payments_q1_2026.xlsx', type: 'Payments', format: 'excel', dateRange: 'Jan 1 - Mar 31, 2026', size: '1.1 MB', status: 'completed', createdBy: 'Marcus Chen', date: 'Feb 18, 2026' },
  { id: 'e3', fileName: 'suppliers_all.csv', type: 'Suppliers', format: 'csv', dateRange: 'All time', size: '890 KB', status: 'completed', createdBy: 'Sarah Johnson', date: 'Feb 15, 2026' },
  { id: 'e4', fileName: 'audit_log_jan_2026.csv', type: 'Audit Logs', format: 'csv', dateRange: 'Jan 1-31, 2026', size: '5.7 MB', status: 'completed', createdBy: 'Admin', date: 'Feb 1, 2026' },
  { id: 'e5', fileName: 'expenses_2025.pdf', type: 'Expenses', format: 'pdf', dateRange: 'Jan 1 - Dec 31, 2025', size: '3.2 MB', status: 'completed', createdBy: 'Elena Rodriguez', date: 'Jan 31, 2026' },
];

const MOCK_SCHEDULES: ScheduledExport[] = [
  { id: 's1', name: 'Monthly Invoice Report', type: 'Invoices', format: 'CSV', frequency: 'monthly', recipients: 'finance@medius.com', status: 'active', nextRun: 'Mar 1, 2026' },
  { id: 's2', name: 'Weekly Payment Summary', type: 'Payments', format: 'Excel', frequency: 'weekly', recipients: 'treasury@medius.com', status: 'active', nextRun: 'Feb 24, 2026' },
  { id: 's3', name: 'Daily Audit Log', type: 'Audit Logs', format: 'CSV', frequency: 'daily', recipients: 'compliance@medius.com', status: 'paused', nextRun: 'Paused' },
];

const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const TYPE_OPTIONS = CATEGORIES.map((c) => ({ label: c.key.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()), value: c.key }));

const FORMAT_OPTIONS = [
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'excel' },
  { label: 'PDF', value: 'pdf' },
];

/* ---------- Component ---------- */

export default function DataExportPage() {
  const t = useT();
  const router = useRouter();
  const { addToast } = useToast();

  const [recentExports, setRecentExports] = useState<RecentExport[]>(MOCK_EXPORTS);
  const [schedules, setSchedules] = useState<ScheduledExport[]>(MOCK_SCHEDULES);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ name: '', type: 'invoices', format: 'csv', frequency: 'monthly' as ScheduleFrequency, recipients: '' });

  const [exportState, setExportState] = useState<Record<string, {
    datePreset: DatePreset;
    startDate: string;
    endDate: string;
    format: ExportFormat;
    filters: Record<string, string>;
    selectedColumns: Set<string>;
    exporting: boolean;
    progress: number;
  }>>({});

  const getState = (key: string) => {
    const category = CATEGORIES.find((c) => c.key === key);
    return exportState[key] || {
      datePreset: 'this_month' as DatePreset,
      startDate: '',
      endDate: '',
      format: 'csv' as ExportFormat,
      filters: {},
      selectedColumns: new Set(category?.columns || []),
      exporting: false,
      progress: 0,
    };
  };

  const updateState = useCallback((key: string, updates: Record<string, unknown>) => {
    setExportState((prev) => ({
      ...prev,
      [key]: { ...getState(key), ...updates } as typeof prev[string],
    }));
  }, [exportState]);

  const toggleColumn = useCallback((categoryKey: string, column: string) => {
    setExportState((prev) => {
      const current = getState(categoryKey);
      const next = new Set(current.selectedColumns);
      if (next.has(column)) next.delete(column);
      else next.add(column);
      return { ...prev, [categoryKey]: { ...current, selectedColumns: next } };
    });
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
          const ext = state.format === 'excel' ? 'xlsx' : state.format;
          const newExport: RecentExport = {
            id: `e${Date.now()}`,
            fileName: `${categoryKey}_export_${Date.now()}.${ext}`,
            type: category ? t(category.titleKey) : categoryKey,
            format: state.format,
            dateRange: 'Feb 2026',
            size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
            status: 'completed',
            createdBy: 'Current User',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
          setRecentExports((re) => [newExport, ...re]);
          addToast({ type: 'success', title: t('tenantAdmin.dataExport.exportComplete') });
          return { ...prev, [categoryKey]: { ...current, exporting: false, progress: 100 } };
        }
        return { ...prev, [categoryKey]: { ...current, progress: newProgress } };
      });
    }, 400);
  }, [exportState, addToast, t]);

  const handleCreateSchedule = useCallback(() => {
    const newSchedule: ScheduledExport = {
      id: `s${Date.now()}`,
      name: scheduleForm.name,
      type: scheduleForm.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      format: scheduleForm.format.toUpperCase(),
      frequency: scheduleForm.frequency,
      recipients: scheduleForm.recipients,
      status: 'active',
      nextRun: 'Mar 1, 2026',
    };
    setSchedules((prev) => [newSchedule, ...prev]);
    setScheduleModalOpen(false);
    setScheduleForm({ name: '', type: 'invoices', format: 'csv', frequency: 'monthly', recipients: '' });
    addToast({ type: 'success', title: t('tenantAdmin.dataExport.scheduleCreated') });
  }, [scheduleForm, addToast, t]);

  const handleDeleteSchedule = useCallback((id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    addToast({ type: 'info', title: t('tenantAdmin.dataExport.scheduleDeleted') });
  }, [addToast, t]);

  const handleToggleSchedule = useCallback((id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'active' ? 'paused' as const : 'active' as const } : s))
    );
  }, []);

  const formatTypeClass = (format: ExportFormat) => {
    if (format === 'csv') return styles.fileTypeCsv;
    if (format === 'excel') return styles.fileTypeExcel;
    return styles.fileTypePdf;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backLink} onClick={() => router.push('/settings/admin')}>
          &#8592; {t('tenantAdmin.title')}
        </button>
        <h1 className={styles.headerTitle}>{t('tenantAdmin.dataExport.title')}</h1>
        <p className={styles.headerSubtitle}>{t('tenantAdmin.dataExport.subtitle')}</p>
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
                    <span className={styles.filterLabel}>{t('tenantAdmin.dataExport.dateRange')}</span>
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
                        <span className={styles.filterLabel}>{t('tenantAdmin.dataExport.startDate')}</span>
                        <input
                          type="date"
                          className={styles.dateInput}
                          value={state.startDate}
                          onChange={(e) => updateState(category.key, { startDate: e.target.value })}
                        />
                      </div>
                      <div className={styles.filterRow}>
                        <span className={styles.filterLabel}>{t('tenantAdmin.dataExport.endDate')}</span>
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
                        {filter.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  {/* Column Selection */}
                  <div className={styles.filterRow}>
                    <span className={styles.filterLabel}>{t('tenantAdmin.dataExport.columns')}</span>
                    <div className={styles.columnGrid}>
                      {category.columns.map((col) => (
                        <label key={col} className={styles.columnCheckbox}>
                          <input
                            type="checkbox"
                            className={styles.columnCheckboxInput}
                            checked={state.selectedColumns.has(col)}
                            onChange={() => toggleColumn(category.key, col)}
                          />
                          <span>{col}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Format Selection */}
                  <div className={styles.filterRow}>
                    <span className={styles.filterLabel}>{t('tenantAdmin.dataExport.format')}</span>
                    <div className={styles.formatRow}>
                      {category.formats.map((fmt) => (
                        <button
                          key={fmt}
                          className={`${styles.formatButton} ${state.format === fmt ? styles.formatButtonActive : ''}`}
                          onClick={() => updateState(category.key, { format: fmt })}
                        >
                          {fmt === 'excel' ? 'Excel' : fmt.toUpperCase()}
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
                          label={t('tenantAdmin.dataExport.exporting')}
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
                        {t('tenantAdmin.dataExport.exportBtn')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scheduled Exports */}
        <div className={styles.scheduledCard}>
          <div className={styles.scheduledHeader}>
            <h3 className={styles.scheduledTitle}>{t('tenantAdmin.dataExport.scheduledExports')}</h3>
            <Button variant="secondary" size="sm" onClick={() => setScheduleModalOpen(true)}>
              {t('tenantAdmin.dataExport.createSchedule')}
            </Button>
          </div>
          <div className={styles.scheduledList}>
            {schedules.map((schedule) => (
              <div key={schedule.id} className={styles.scheduledItem}>
                <div className={styles.scheduledInfo}>
                  <span className={styles.scheduledName}>{schedule.name}</span>
                  <span className={styles.scheduledMeta}>
                    {schedule.type} &middot; {schedule.format} &middot; {schedule.frequency} &middot; {schedule.recipients}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span className={`${styles.scheduledBadge} ${schedule.status === 'active' ? styles.scheduledBadgeActive : styles.scheduledBadgePaused}`}>
                    {schedule.status === 'active' ? t('common.active') : t('tenantAdmin.dataExport.paused')}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {t('tenantAdmin.dataExport.nextRun')}: {schedule.nextRun}
                  </span>
                  <div className={styles.scheduledActions}>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleSchedule(schedule.id)}>
                      {schedule.status === 'active' ? t('tenantAdmin.dataExport.pause') : t('tenantAdmin.dataExport.resume')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSchedule(schedule.id)}>
                      {t('tenantAdmin.dataExport.delete')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export History */}
        <div className={styles.historyCard}>
          <h3 className={styles.historyTitle}>{t('tenantAdmin.dataExport.exportHistory')}</h3>
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>{t('tenantAdmin.dataExport.fileName')}</th>
                <th>{t('tenantAdmin.dataExport.type')}</th>
                <th>{t('tenantAdmin.dataExport.format')}</th>
                <th>{t('tenantAdmin.dataExport.dateRangeColumn')}</th>
                <th>{t('tenantAdmin.dataExport.size')}</th>
                <th>{t('tenantAdmin.dataExport.createdBy')}</th>
                <th>{t('tenantAdmin.dataExport.date')}</th>
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
                      {exp.format === 'excel' ? 'XLSX' : exp.format.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{exp.dateRange}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{exp.size}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{exp.createdBy}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{exp.date}</td>
                  <td>
                    <button
                      className={styles.downloadLink}
                      onClick={() => addToast({ type: 'info', title: t('tenantAdmin.dataExport.downloadStarted') })}
                    >
                      {t('tenantAdmin.dataExport.download')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Data Retention Notice */}
        <div className={styles.retentionNotice}>
          <span className={styles.retentionIcon}>&#128197;</span>
          <span>{t('tenantAdmin.dataExport.retentionNotice')}</span>
        </div>
      </div>

      {/* Create Schedule Modal */}
      <Modal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title={t('tenantAdmin.dataExport.createScheduleTitle')}
        size="md"
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setScheduleModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleCreateSchedule}>
              {t('tenantAdmin.dataExport.createScheduleBtn')}
            </Button>
          </div>
        }
      >
        <div className={styles.scheduleForm}>
          <Input
            label={t('tenantAdmin.dataExport.scheduleName')}
            placeholder="e.g., Monthly Invoice Report"
            value={scheduleForm.name}
            onChange={(e) => setScheduleForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Select
            label={t('tenantAdmin.dataExport.exportType')}
            options={TYPE_OPTIONS}
            value={scheduleForm.type}
            onChange={(e) => setScheduleForm((prev) => ({ ...prev, type: e.target.value }))}
          />
          <Select
            label={t('tenantAdmin.dataExport.format')}
            options={FORMAT_OPTIONS}
            value={scheduleForm.format}
            onChange={(e) => setScheduleForm((prev) => ({ ...prev, format: e.target.value }))}
          />
          <Select
            label={t('tenantAdmin.dataExport.frequency')}
            options={FREQUENCY_OPTIONS}
            value={scheduleForm.frequency}
            onChange={(e) => setScheduleForm((prev) => ({ ...prev, frequency: e.target.value as ScheduleFrequency }))}
          />
          <Input
            label={t('tenantAdmin.dataExport.recipients')}
            placeholder="email@example.com"
            value={scheduleForm.recipients}
            onChange={(e) => setScheduleForm((prev) => ({ ...prev, recipients: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
