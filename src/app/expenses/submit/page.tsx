'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/lib/i18n/locale-context';
import styles from './submit-expense.module.css';

const categoryOptions = [
  'Travel',
  'Meals & Entertainment',
  'Office Supplies',
  'Software & Subscriptions',
  'Transportation',
  'Accommodation',
  'Professional Development',
  'Client Entertainment',
  'Equipment',
  'Other',
];

const currencyOptions = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

const projectOptions = [
  'General Operations',
  'Project Alpha',
  'Project Beta',
  'Marketing Campaign Q1',
  'Product Development',
  'Client - Meridian Corp',
  'Client - Apex Systems',
  'Infrastructure Upgrade',
];

const costCenterOptions = [
  'CC-100 Engineering',
  'CC-200 Marketing',
  'CC-300 Sales',
  'CC-400 Operations',
  'CC-500 Finance',
  'CC-600 Human Resources',
  'CC-700 Executive',
];

const aiAutoFill = [
  { label: 'Category', value: 'Meals & Entertainment' },
  { label: 'Amount', value: '$187.50' },
  { label: 'Currency', value: 'USD' },
  { label: 'Vendor', value: 'The Capital Grille' },
  { label: 'Date', value: '2026-01-29' },
  { label: 'Tax', value: '$16.50' },
];

const policyChecks = [
  { rule: 'Expense amount within daily meal limit ($250)', status: 'pass', label: 'Pass' },
  { rule: 'Receipt attached for expenses over $25', status: 'pass', label: 'Pass' },
  { rule: 'Expense submitted within 30-day window', status: 'pass', label: 'Pass' },
  { rule: 'Client entertainment pre-approved', status: 'warn', label: 'Needs approval' },
  { rule: 'Category matches receipt description', status: 'pass', label: 'Pass' },
];

export default function SubmitExpensePage() {
  const t = useT();
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [date, setDate] = useState('2026-01-30');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [costCenter, setCostCenter] = useState('');

  return (
    <div className={styles.container}>
      <Link href="/expenses" className={styles.backLink}>
        &larr; Back to Expenses
      </Link>
      <div className={styles.header}>
        <h1>{t('expenseSubmit.title')}</h1>
        <p>{t('expenseSubmit.subtitle')}</p>
      </div>

      {/* Receipt Upload */}
      <div className={styles.formCard}>
        <div className={styles.formTitle}>{t('expenseSubmit.attachReceipt')}</div>
        <div className={styles.uploadArea}>
          <div className={styles.uploadText}>
            Drop receipt image here or click to browse
          </div>
          <div className={styles.uploadHint}>
            Supports JPG, PNG, PDF up to 10MB
          </div>
        </div>
      </div>

      {/* AI Auto-fill Preview */}
      <div className={styles.aiPreview}>
        <div className={styles.aiHeader}>
          <div className={styles.aiIcon}>AI</div>
          <h3 className={styles.aiTitle}>AI Auto-Fill Preview</h3>
        </div>
        <div className={styles.aiFields}>
          {aiAutoFill.map((field) => (
            <div key={field.label} className={styles.aiField}>
              <div className={styles.aiFieldLabel}>{field.label}</div>
              <div className={styles.aiFieldValue}>{field.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Form */}
      <div className={styles.formCard}>
        <div className={styles.formTitle}>Expense Details</div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('expenseSubmit.category')}</label>
            <select
              className={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category...</option>
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('expenseSubmit.amount')}</label>
            <input
              type="text"
              className={styles.input}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Currency</label>
            <select
              className={styles.select}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {currencyOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('expenseSubmit.date')}</label>
            <input
              type="date"
              className={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Project</label>
            <select
              className={styles.select}
              value={project}
              onChange={(e) => setProject(e.target.value)}
            >
              <option value="">Select project...</option>
              {projectOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Cost Center</label>
            <select
              className={styles.select}
              value={costCenter}
              onChange={(e) => setCostCenter(e.target.value)}
            >
              <option value="">Select cost center...</option>
              {costCenterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>{t('expenseSubmit.description')}</label>
            <textarea
              className={styles.textarea}
              placeholder="Describe the expense purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Policy Compliance Checker */}
      <div className={styles.policyCard}>
        <div className={styles.policyTitle}>Policy Compliance Check</div>
        {policyChecks.map((check, i) => (
          <div key={i} className={styles.policyItem}>
            <span
              className={`${styles.policyDot} ${
                check.status === 'pass'
                  ? styles.policyPass
                  : check.status === 'warn'
                  ? styles.policyWarn
                  : styles.policyFail
              }`}
            />
            <span className={styles.policyText}>{check.rule}</span>
            <span
              className={`${styles.policyStatus} ${
                check.status === 'pass'
                  ? styles.statusPass
                  : check.status === 'warn'
                  ? styles.statusWarn
                  : styles.statusFail
              }`}
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <Link href="/expenses">
          <button className={styles.cancelBtn}>{t('common.cancel')}</button>
        </Link>
        <button className={styles.submitBtn}>{t('expenseSubmit.submit')}</button>
      </div>
    </div>
  );
}
