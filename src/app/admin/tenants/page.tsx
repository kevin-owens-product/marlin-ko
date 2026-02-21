'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { Button, Modal, Input, Select, Skeleton } from '@/components/ui';
import styles from './tenants.module.css';

/* ---------- Types ---------- */
interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'Free' | 'Starter' | 'Professional' | 'Enterprise';
  users: number;
  invoices: number;
  status: 'Active' | 'Suspended';
  created: string;
  storageUsed: string;
  apiCallsMonth: string;
  features: string[];
  recentActivity: string[];
}

/* ---------- Mock Data ---------- */
const mockTenants: Tenant[] = [
  { id: 't1', name: 'Acme Corporation', slug: 'acme-corp', plan: 'Enterprise', users: 245, invoices: 12450, status: 'Active', created: '2024-03-15', storageUsed: '48.2 GB', apiCallsMonth: '342K', features: ['AI Copilot', 'SCF', 'Treasury', 'Virtual Cards'], recentActivity: ['Invoice batch processed (142 items)', 'New user added: j.doe@acme.com', 'Plan reviewed — no changes'] },
  { id: 't2', name: 'NordicTech AB', slug: 'nordictech', plan: 'Professional', users: 87, invoices: 5230, status: 'Active', created: '2024-06-01', storageUsed: '18.7 GB', apiCallsMonth: '128K', features: ['AI Copilot', 'Dynamic Discounting', 'Analytics'], recentActivity: ['Monthly report generated', 'API key rotated', 'User role updated'] },
  { id: 't3', name: 'CloudHost Services', slug: 'cloudhost', plan: 'Professional', users: 62, invoices: 3100, status: 'Active', created: '2024-08-20', storageUsed: '12.4 GB', apiCallsMonth: '95K', features: ['AI Copilot', 'Expense Management', 'Approvals'], recentActivity: ['Expense policy updated', 'Workflow modified', 'New department added'] },
  { id: 't4', name: 'GlobalLogistics Inc', slug: 'globallogistics', plan: 'Enterprise', users: 312, invoices: 28900, status: 'Active', created: '2023-11-10', storageUsed: '82.1 GB', apiCallsMonth: '890K', features: ['AI Copilot', 'SCF', 'Treasury', 'Virtual Cards', 'Compliance Hub'], recentActivity: ['Compliance check passed', 'Payment batch: $1.2M', 'New supplier onboarded'] },
  { id: 't5', name: 'Demo Corp', slug: 'demo-corp', plan: 'Free', users: 3, invoices: 45, status: 'Suspended', created: '2025-01-05', storageUsed: '0.2 GB', apiCallsMonth: '1.2K', features: ['Basic Invoicing'], recentActivity: ['Account suspended — non-payment', 'Warning email sent', 'Grace period expired'] },
  { id: 't6', name: 'BigRetail Inc', slug: 'bigretail', plan: 'Enterprise', users: 198, invoices: 15600, status: 'Active', created: '2024-01-20', storageUsed: '55.8 GB', apiCallsMonth: '456K', features: ['AI Copilot', 'SCF', 'Virtual Cards', 'Benchmarks'], recentActivity: ['Bulk password reset', 'New admin assigned', 'SSO configuration updated'] },
  { id: 't7', name: 'StartupXYZ', slug: 'startupxyz', plan: 'Starter', users: 8, invoices: 230, status: 'Active', created: '2025-09-12', storageUsed: '1.1 GB', apiCallsMonth: '12K', features: ['Basic Invoicing', 'Approvals'], recentActivity: ['First invoice uploaded', 'Admin onboarding completed', 'Integration connected'] },
  { id: 't8', name: 'FinanceHub Ltd', slug: 'financehub', plan: 'Professional', users: 45, invoices: 8900, status: 'Active', created: '2024-04-18', storageUsed: '22.3 GB', apiCallsMonth: '210K', features: ['AI Copilot', 'Analytics', 'Cash Flow'], recentActivity: ['Cash flow forecast generated', 'API rate limit increased', 'Report exported'] },
  { id: 't9', name: 'MedTech Solutions', slug: 'medtech', plan: 'Professional', users: 34, invoices: 2100, status: 'Active', created: '2024-07-22', storageUsed: '8.5 GB', apiCallsMonth: '67K', features: ['AI Copilot', 'Compliance Hub', 'Approvals'], recentActivity: ['Compliance audit completed', 'New approval workflow', 'User training session'] },
  { id: 't10', name: 'FreshFoods Inc', slug: 'freshfoods', plan: 'Free', users: 2, invoices: 12, status: 'Active', created: '2026-02-18', storageUsed: '0.1 GB', apiCallsMonth: '0.3K', features: ['Basic Invoicing'], recentActivity: ['Account created', 'First user invited', 'Getting started guide viewed'] },
  { id: 't11', name: 'TechParts Ltd', slug: 'techparts', plan: 'Starter', users: 15, invoices: 890, status: 'Active', created: '2025-05-30', storageUsed: '3.2 GB', apiCallsMonth: '34K', features: ['Basic Invoicing', 'Approvals', 'Matching'], recentActivity: ['PO matching enabled', 'New vendor registered', 'Monthly summary sent'] },
  { id: 't12', name: 'FastShip International', slug: 'fastship', plan: 'Starter', users: 22, invoices: 1540, status: 'Active', created: '2025-03-08', storageUsed: '5.6 GB', apiCallsMonth: '48K', features: ['Basic Invoicing', 'Approvals', 'Expense Management'], recentActivity: ['Expense report submitted', 'New category added', 'Policy update published'] },
];

const planOptions = [
  { label: 'All Plans', value: 'all' },
  { label: 'Free', value: 'Free' },
  { label: 'Starter', value: 'Starter' },
  { label: 'Professional', value: 'Professional' },
  { label: 'Enterprise', value: 'Enterprise' },
];

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'Active' },
  { label: 'Suspended', value: 'Suspended' },
];

const planClassMap: Record<string, string> = {
  Free: styles.planFree,
  Starter: styles.planStarter,
  Professional: styles.planProfessional,
  Enterprise: styles.planEnterprise,
};

export default function TenantsPage() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formPlan, setFormPlan] = useState('Starter');
  const [formEmail, setFormEmail] = useState('');
  const [newPlan, setNewPlan] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return mockTenants.filter((tenant) => {
      if (planFilter !== 'all' && tenant.plan !== planFilter) return false;
      if (statusFilter !== 'all' && tenant.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          tenant.name.toLowerCase().includes(q) ||
          tenant.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, planFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCreateSubmit = () => {
    setCreateModalOpen(false);
    setFormName('');
    setFormSlug('');
    setFormPlan('Starter');
    setFormEmail('');
  };

  const handlePlanChange = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setNewPlan(tenant.plan);
    setPlanModalOpen(true);
  };

  const handlePlanSubmit = () => {
    setPlanModalOpen(false);
    setSelectedTenant(null);
    setNewPlan('');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Skeleton width={200} height={28} />
            <Skeleton width={300} height={16} />
          </div>
          <Skeleton width={140} height={36} />
        </div>
        <div className={styles.tableCard}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '16px' }}>
              <Skeleton width={150} height={14} />
              <Skeleton width={80} height={14} />
              <Skeleton width={70} height={14} />
              <Skeleton width={60} height={14} />
              <Skeleton width={50} height={14} />
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
          <h1 className={styles.title}>{t('admin.tenants.title')}</h1>
          <p className={styles.subtitle}>{t('admin.tenants.subtitle')}</p>
        </div>
        <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
          {t('admin.tenants.createTenant')}
        </Button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder={t('admin.tenants.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
        <select
          className={styles.filterSelect}
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
        >
          {planOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('admin.tenants.name')}</th>
              <th>{t('admin.tenants.slug')}</th>
              <th>{t('admin.tenants.plan')}</th>
              <th>{t('admin.tenants.users')}</th>
              <th>{t('admin.tenants.invoices')}</th>
              <th>{t('admin.tenants.status')}</th>
              <th>{t('admin.tenants.created')}</th>
              <th>{t('admin.tenants.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                  {t('admin.tenants.noResults')}
                </td>
              </tr>
            ) : (
              paginated.map((tenant) => (
                <React.Fragment key={tenant.id}>
                  <tr>
                    <td>
                      <div className={styles.tenantName}>{tenant.name}</div>
                    </td>
                    <td>
                      <span className={styles.tenantSlug}>{tenant.slug}</span>
                    </td>
                    <td>
                      <span className={`${styles.planBadge} ${planClassMap[tenant.plan]}`}>
                        {tenant.plan}
                      </span>
                    </td>
                    <td>{tenant.users.toLocaleString()}</td>
                    <td>{tenant.invoices.toLocaleString()}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          tenant.status === 'Active' ? styles.statusActive : styles.statusSuspended
                        }`}
                      >
                        <span className={styles.statusDot} />
                        {tenant.status}
                      </span>
                    </td>
                    <td>{tenant.created}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => setExpandedId(expandedId === tenant.id ? null : tenant.id)}
                          type="button"
                        >
                          {expandedId === tenant.id ? t('admin.tenants.collapse') : t('admin.tenants.view')}
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handlePlanChange(tenant)}
                          type="button"
                        >
                          {t('admin.tenants.editPlan')}
                        </button>
                        <button className={styles.actionBtn} type="button">
                          {tenant.status === 'Active' ? t('admin.tenants.suspend') : t('admin.tenants.activate')}
                        </button>
                        <button className={styles.actionBtn} type="button">
                          {t('admin.tenants.impersonate')}
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} type="button">
                          {t('admin.tenants.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === tenant.id && (
                    <tr className={styles.expandedRow}>
                      <td colSpan={8}>
                        <div className={styles.expandedContent}>
                          <div className={styles.expandedGrid}>
                            <div className={styles.expandedSection}>
                              <div className={styles.expandedLabel}>{t('admin.tenants.usageStats')}</div>
                              <div className={styles.expandedList}>
                                <div className={styles.expandedListItem}>{t('admin.tenants.storage')}: {tenant.storageUsed}</div>
                                <div className={styles.expandedListItem}>{t('admin.tenants.apiCallsLabel')}: {tenant.apiCallsMonth}</div>
                                <div className={styles.expandedListItem}>{t('admin.tenants.usersLabel')}: {tenant.users} / {tenant.plan === 'Enterprise' ? t('admin.tenants.unlimited') : tenant.plan === 'Professional' ? '25' : tenant.plan === 'Starter' ? '5' : '1'}</div>
                              </div>
                            </div>
                            <div className={styles.expandedSection}>
                              <div className={styles.expandedLabel}>{t('admin.tenants.activeFeatures')}</div>
                              <div className={styles.expandedList}>
                                {tenant.features.map((f) => (
                                  <div key={f} className={styles.expandedListItem}>
                                    {'\u2713'} {f}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className={styles.expandedSection}>
                              <div className={styles.expandedLabel}>{t('admin.tenants.recentActivity')}</div>
                              <div className={styles.expandedList}>
                                {tenant.recentActivity.map((a, i) => (
                                  <div key={i} className={styles.expandedListItem}>
                                    {'\u2022'} {a}
                                  </div>
                                ))}
                              </div>
                            </div>
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

        {/* Pagination */}
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            {t('admin.tenants.showing', {
              start: String(Math.min((currentPage - 1) * pageSize + 1, filtered.length)),
              end: String(Math.min(currentPage * pageSize, filtered.length)),
              total: String(filtered.length),
            })}
          </div>
          <div className={styles.pageControls}>
            <button
              className={styles.pageBtn}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              type="button"
            >
              {'\u2039'}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageBtn} ${page === currentPage ? styles.pageBtnActive : ''}`}
                onClick={() => setCurrentPage(page)}
                type="button"
              >
                {page}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              type="button"
            >
              {'\u203A'}
            </button>
          </div>
        </div>
      </div>

      {/* Create Tenant Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t('admin.tenants.createTenant')}
        size="md"
        footer={
          <div className={styles.formActions}>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              {t('admin.common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleCreateSubmit}>
              {t('admin.tenants.createTenant')}
            </Button>
          </div>
        }
      >
        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <Input
              label={t('admin.tenants.tenantName')}
              placeholder="e.g. Acme Corporation"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <Input
              label={t('admin.tenants.tenantSlug')}
              placeholder="e.g. acme-corp"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              required
              helperText={t('admin.tenants.slugHelper')}
            />
          </div>
          <div className={styles.formRow}>
            <Select
              label={t('admin.tenants.plan')}
              options={[
                { label: 'Free', value: 'Free' },
                { label: 'Starter', value: 'Starter' },
                { label: 'Professional', value: 'Professional' },
                { label: 'Enterprise', value: 'Enterprise' },
              ]}
              value={formPlan}
              onChange={(e) => setFormPlan(e.target.value)}
              required
            />
            <Input
              label={t('admin.tenants.adminEmail')}
              type="email"
              placeholder="admin@company.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal>

      {/* Plan Change Modal */}
      <Modal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title={t('admin.tenants.changePlan')}
        size="sm"
        footer={
          <div className={styles.formActions}>
            <Button variant="secondary" onClick={() => setPlanModalOpen(false)}>
              {t('admin.common.cancel')}
            </Button>
            <Button variant="primary" onClick={handlePlanSubmit}>
              {t('admin.tenants.updatePlan')}
            </Button>
          </div>
        }
      >
        <div className={styles.formGrid}>
          {selectedTenant && (
            <>
              <Input
                label={t('admin.tenants.tenantName')}
                value={selectedTenant.name}
                disabled
              />
              <Select
                label={t('admin.tenants.currentPlan')}
                value={selectedTenant.plan}
                options={[{ label: selectedTenant.plan, value: selectedTenant.plan }]}
                disabled
              />
              <Select
                label={t('admin.tenants.newPlan')}
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                options={[
                  { label: 'Free', value: 'Free' },
                  { label: 'Starter', value: 'Starter' },
                  { label: 'Professional', value: 'Professional' },
                  { label: 'Enterprise', value: 'Enterprise' },
                ]}
                required
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
