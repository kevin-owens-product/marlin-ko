'use client';

import { useState, useEffect, useCallback } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { SUPPORTED_LOCALES } from '@/lib/i18n/types';
import styles from './profile.module.css';

/* ───────── Types ───────── */

type ProfileTab = 'company' | 'banking' | 'contacts' | 'compliance' | 'preferences';

interface Contact {
  id: string;
  titleKey: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface BankChange {
  id: string;
  event: string;
  date: string;
  status: 'completed' | 'pending';
}

/* ───────── Mock Data ───────── */

const companyData = {
  companyName: 'Acme Corp',
  taxId: '84-1234567',
  street: '123 Innovation Drive',
  city: 'Austin',
  stateProvince: 'TX',
  country: 'US',
  postalCode: '78701',
  industry: 'Technology',
  category: 'IT Services',
  website: 'https://acmecorp.com',
  phone: '+1 (555) 234-8901',
};

const bankData = {
  bankName: 'JPMorgan Chase',
  accountType: 'Checking',
  accountNumber: '**** **** 4821',
  routingNumber: '****2109',
  iban: '',
  swift: 'CHAS****',
};

const bankChanges: BankChange[] = [
  { id: 'bc-1', event: 'Bank account verified', date: 'Jan 10, 2026', status: 'completed' },
  { id: 'bc-2', event: 'Routing number updated', date: 'Nov 15, 2025', status: 'completed' },
  { id: 'bc-3', event: 'Initial bank details submitted', date: 'Jan 15, 2021', status: 'completed' },
];

const initialContacts: Contact[] = [
  { id: 'c-1', titleKey: 'supplierPortal.profile.primaryContact', name: 'Sarah Mitchell', email: 's.mitchell@acmecorp.com', phone: '+1 (555) 234-8901', role: 'VP Finance' },
  { id: 'c-2', titleKey: 'supplierPortal.profile.billingContact', name: 'Robert Chen', email: 'r.chen@acmecorp.com', phone: '+1 (555) 234-8902', role: 'Billing Manager' },
  { id: 'c-3', titleKey: 'supplierPortal.profile.technicalContact', name: 'Emily Park', email: 'e.park@acmecorp.com', phone: '+1 (555) 234-8903', role: 'IT Director' },
];

type DocStatus = 'Verified' | 'Uploaded' | 'Expired' | 'Missing';

interface ComplianceDoc {
  id: string;
  name: string;
  nameKey: string;
  status: DocStatus;
  uploadDate: string;
  expiryDate: string;
}

const complianceDocs: ComplianceDoc[] = [
  { id: 'cd-1', name: 'W-9 Form', nameKey: 'supplierPortal.profile.docW9', status: 'Verified', uploadDate: 'Jan 15, 2026', expiryDate: 'N/A' },
  { id: 'cd-2', name: 'Insurance Certificate', nameKey: 'supplierPortal.profile.docInsurance', status: 'Uploaded', uploadDate: 'Dec 10, 2025', expiryDate: 'Dec 10, 2026' },
  { id: 'cd-3', name: 'Compliance Certificate', nameKey: 'supplierPortal.profile.docCompliance', status: 'Expired', uploadDate: 'Jan 05, 2025', expiryDate: 'Jan 05, 2026' },
  { id: 'cd-4', name: 'Business License', nameKey: 'supplierPortal.profile.docBusinessLicense', status: 'Missing', uploadDate: '--', expiryDate: '--' },
];

const docStatusClassMap: Record<DocStatus, string> = {
  Verified: 'docStatusVerified',
  Uploaded: 'docStatusUploaded',
  Expired: 'docStatusExpired',
  Missing: 'docStatusMissing',
};

/* ───────── Component ───────── */

export default function SupplierPortalProfile() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('company');
  const [saving, setSaving] = useState(false);

  /* Company form */
  const [company, setCompany] = useState(companyData);

  /* Contacts */
  const [contacts, setContacts] = useState(initialContacts);

  /* Preferences */
  const [prefs, setPrefs] = useState({
    paymentMethod: 'ACH',
    emailNotifications: true,
    portalNotifications: true,
    language: 'en',
    earlyPayment: false,
  });

  /* Notification preferences */
  const [notifPrefs, setNotifPrefs] = useState({
    paymentReceived: true,
    invoiceStatusChange: true,
    newDispute: true,
    scfOffers: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  }, []);

  const addContact = useCallback(() => {
    const newId = `c-${Date.now()}`;
    setContacts((prev) => [
      ...prev,
      { id: newId, titleKey: '', name: '', email: '', phone: '', role: '' },
    ]);
  }, []);

  const removeContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateContact = useCallback((id: string, field: keyof Contact, value: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }, []);

  const tabs: { key: ProfileTab; labelKey: string }[] = [
    { key: 'company', labelKey: 'supplierPortal.profile.tabCompanyInfo' },
    { key: 'banking', labelKey: 'supplierPortal.profile.tabBanking' },
    { key: 'contacts', labelKey: 'supplierPortal.profile.tabContacts' },
    { key: 'compliance', labelKey: 'supplierPortal.profile.tabCompliance' },
    { key: 'preferences', labelKey: 'supplierPortal.profile.tabPreferences' },
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={`${styles.skeleton} ${styles.skeletonTabs}`} />
        <div className={`${styles.skeleton} ${styles.skeletonContent}`} />
      </div>
    );
  }

  return (
    <>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t('supplierPortal.profile.title')}</h1>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* ── Company Info Tab ── */}
      {activeTab === 'company' && (
        <div className={styles.contentCard}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.companyName')}</label>
              <input
                className={styles.formInput}
                type="text"
                value={company.companyName}
                onChange={(e) => setCompany((p) => ({ ...p, companyName: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.taxId')}</label>
              <input
                className={styles.formInput}
                type="text"
                value={company.taxId}
                onChange={(e) => setCompany((p) => ({ ...p, taxId: e.target.value }))}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.street')}</label>
              <input
                className={styles.formInput}
                type="text"
                value={company.street}
                onChange={(e) => setCompany((p) => ({ ...p, street: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.city')}</label>
              <input
                className={styles.formInput}
                type="text"
                value={company.city}
                onChange={(e) => setCompany((p) => ({ ...p, city: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.stateProvince')}</label>
              <input
                className={styles.formInput}
                type="text"
                value={company.stateProvince}
                onChange={(e) => setCompany((p) => ({ ...p, stateProvince: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.country')}</label>
              <select
                className={styles.formSelect}
                value={company.country}
                onChange={(e) => setCompany((p) => ({ ...p, country: e.target.value }))}
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="SE">Sweden</option>
                <option value="NO">Norway</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.postalCode')}</label>
              <input
                className={styles.formInput}
                type="text"
                value={company.postalCode}
                onChange={(e) => setCompany((p) => ({ ...p, postalCode: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.industry')}</label>
              <select
                className={styles.formSelect}
                value={company.industry}
                onChange={(e) => setCompany((p) => ({ ...p, industry: e.target.value }))}
              >
                <option value="Technology">Technology</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Consulting">Consulting</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.category')}</label>
              <input
                className={styles.formInput}
                type="text"
                value={company.category}
                onChange={(e) => setCompany((p) => ({ ...p, category: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.website')}</label>
              <input
                className={styles.formInput}
                type="url"
                value={company.website}
                onChange={(e) => setCompany((p) => ({ ...p, website: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.phone')}</label>
              <input
                className={styles.formInput}
                type="tel"
                value={company.phone}
                onChange={(e) => setCompany((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className={styles.saveArea}>
            <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
              {saving ? t('supplierPortal.profile.saving') : t('supplierPortal.profile.saveChanges')}
            </button>
          </div>
        </div>
      )}

      {/* ── Banking Tab ── */}
      {activeTab === 'banking' && (
        <div className={styles.contentCard}>
          <div className={styles.bankNote}>
            <span className={styles.bankNoteIcon}>&#9888;</span>
            <span className={styles.bankNoteText}>
              {t('supplierPortal.profile.bankChangeNote')}
            </span>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.bankName')}</label>
              <input className={styles.formInput} type="text" value={bankData.bankName} disabled />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.accountType')}</label>
              <input className={styles.formInput} type="text" value={bankData.accountType} disabled />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.accountNumber')}</label>
              <input
                className={`${styles.formInput} ${styles.maskedValue}`}
                type="text"
                value={bankData.accountNumber}
                disabled
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.routingNumber')}</label>
              <input
                className={`${styles.formInput} ${styles.maskedValue}`}
                type="text"
                value={bankData.routingNumber}
                disabled
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.iban')}</label>
              <input
                className={styles.formInput}
                type="text"
                value={bankData.iban || 'N/A'}
                disabled
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('supplierPortal.profile.swift')}</label>
              <input
                className={`${styles.formInput} ${styles.maskedValue}`}
                type="text"
                value={bankData.swift}
                disabled
              />
            </div>
          </div>

          <div className={styles.saveArea}>
            <button className={styles.requestChangeButton}>
              &#9998; {t('supplierPortal.profile.requestChange')}
            </button>
          </div>

          {/* Change History */}
          <div className={styles.changeHistory}>
            <div className={styles.changeHistoryTitle}>{t('supplierPortal.profile.changeHistory')}</div>
            {bankChanges.map((change) => (
              <div key={change.id} className={styles.changeItem}>
                <div className={styles.changeInfo}>
                  <span className={styles.changeEvent}>{change.event}</span>
                  <span className={styles.changeDate}>{change.date}</span>
                </div>
                <span
                  className={`${styles.changeBadge} ${
                    change.status === 'completed'
                      ? styles.changeBadgeCompleted
                      : styles.changeBadgePending
                  }`}
                >
                  {change.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Contacts Tab ── */}
      {activeTab === 'contacts' && (
        <div className={styles.contentCard}>
          <div className={styles.contactsGrid}>
            {contacts.map((contact) => (
              <div key={contact.id} className={styles.contactCard}>
                <div className={styles.contactCardHeader}>
                  <span className={styles.contactCardTitle}>
                    {contact.titleKey ? t(contact.titleKey) : 'New Contact'}
                  </span>
                  <button
                    className={styles.removeContactButton}
                    onClick={() => removeContact(contact.id)}
                  >
                    {t('supplierPortal.profile.removeContact')}
                  </button>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('supplierPortal.profile.contactName')}</label>
                    <input
                      className={styles.formInput}
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('supplierPortal.profile.contactEmail')}</label>
                    <input
                      className={styles.formInput}
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('supplierPortal.profile.contactPhone')}</label>
                    <input
                      className={styles.formInput}
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('supplierPortal.profile.contactRole')}</label>
                    <input
                      className={styles.formInput}
                      type="text"
                      value={contact.role}
                      onChange={(e) => updateContact(contact.id, 'role', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className={styles.addContactButton} onClick={addContact}>
              &#10010; {t('supplierPortal.profile.addContact')}
            </button>
          </div>

          <div className={styles.saveArea}>
            <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
              {saving ? t('supplierPortal.profile.saving') : t('supplierPortal.profile.saveChanges')}
            </button>
          </div>
        </div>
      )}

      {/* ── Compliance Documents Tab ── */}
      {activeTab === 'compliance' && (
        <div className={styles.contentCard}>
          <p className={styles.complianceIntro}>
            {t('supplierPortal.profile.complianceIntro')}
          </p>
          <div className={styles.complianceTable}>
            <div className={styles.complianceHeader}>
              <span className={styles.complianceHeaderCell}>{t('supplierPortal.profile.document')}</span>
              <span className={styles.complianceHeaderCell}>{t('supplierPortal.profile.docStatus')}</span>
              <span className={styles.complianceHeaderCell}>{t('supplierPortal.profile.uploadedDate')}</span>
              <span className={styles.complianceHeaderCell}>{t('supplierPortal.profile.expiryDate')}</span>
              <span className={styles.complianceHeaderCell}>{t('supplierPortal.profile.docActions')}</span>
            </div>
            {complianceDocs.map((doc) => (
              <div key={doc.id} className={styles.complianceRow}>
                <span className={styles.complianceDocName}>{t(doc.nameKey)}</span>
                <span>
                  <span className={`${styles.docStatusBadge} ${styles[docStatusClassMap[doc.status]]}`}>
                    {doc.status}
                  </span>
                </span>
                <span className={styles.complianceDate}>{doc.uploadDate}</span>
                <span className={styles.complianceDate}>{doc.expiryDate}</span>
                <span>
                  <button className={styles.uploadDocButton}>
                    {doc.status === 'Missing' || doc.status === 'Expired'
                      ? t('supplierPortal.profile.upload')
                      : t('supplierPortal.profile.replace')}
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Preferences Tab ── */}
      {activeTab === 'preferences' && (
        <div className={styles.contentCard}>
          {/* Payment Method */}
          <div className={styles.preferenceSection}>
            <div className={styles.preferenceSectionTitle}>
              {t('supplierPortal.profile.preferredPaymentMethod')}
            </div>
            <div className={styles.formGroup}>
              <select
                className={styles.formSelect}
                value={prefs.paymentMethod}
                onChange={(e) => setPrefs((p) => ({ ...p, paymentMethod: e.target.value }))}
              >
                <option value="ACH">ACH Transfer</option>
                <option value="Wire">Wire Transfer</option>
                <option value="Check">Check</option>
                <option value="VirtualCard">Virtual Card</option>
              </select>
            </div>
          </div>

          {/* Communication Preferences */}
          <div className={styles.preferenceSection}>
            <div className={styles.preferenceSectionTitle}>
              {t('supplierPortal.profile.communicationPreferences')}
            </div>
            <div className={styles.preferenceRow}>
              <div className={styles.preferenceInfo}>
                <span className={styles.preferenceLabel}>
                  {t('supplierPortal.profile.emailNotifications')}
                </span>
                <span className={styles.preferenceDesc}>
                  Receive invoice status updates, payment notifications, and dispute alerts via email
                </span>
              </div>
              <button
                className={`${styles.toggle} ${prefs.emailNotifications ? styles.toggleActive : ''}`}
                onClick={() => setPrefs((p) => ({ ...p, emailNotifications: !p.emailNotifications }))}
                role="switch"
                aria-checked={prefs.emailNotifications}
                aria-label={t('supplierPortal.profile.emailNotifications')}
              />
            </div>
            <div className={styles.preferenceRow}>
              <div className={styles.preferenceInfo}>
                <span className={styles.preferenceLabel}>
                  {t('supplierPortal.profile.portalNotifications')}
                </span>
                <span className={styles.preferenceDesc}>
                  Show in-app notifications for important events and updates
                </span>
              </div>
              <button
                className={`${styles.toggle} ${prefs.portalNotifications ? styles.toggleActive : ''}`}
                onClick={() => setPrefs((p) => ({ ...p, portalNotifications: !p.portalNotifications }))}
                role="switch"
                aria-checked={prefs.portalNotifications}
                aria-label={t('supplierPortal.profile.portalNotifications')}
              />
            </div>
          </div>

          {/* Language */}
          <div className={styles.preferenceSection}>
            <div className={styles.preferenceSectionTitle}>
              {t('supplierPortal.profile.languagePreference')}
            </div>
            <div className={styles.formGroup}>
              <select
                className={styles.formSelect}
                value={prefs.language}
                onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
              >
                {SUPPORTED_LOCALES.map((locale) => (
                  <option key={locale.code} value={locale.code}>
                    {locale.flag} {locale.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Early Payment Discount */}
          <div className={styles.preferenceSection}>
            <div className={styles.preferenceRow}>
              <div className={styles.preferenceInfo}>
                <span className={styles.preferenceLabel}>
                  {t('supplierPortal.profile.earlyPaymentDiscount')}
                </span>
                <span className={styles.preferenceDesc}>
                  {t('supplierPortal.profile.earlyPaymentDesc')}
                </span>
              </div>
              <button
                className={`${styles.toggle} ${prefs.earlyPayment ? styles.toggleActive : ''}`}
                onClick={() => setPrefs((p) => ({ ...p, earlyPayment: !p.earlyPayment }))}
                role="switch"
                aria-checked={prefs.earlyPayment}
                aria-label={t('supplierPortal.profile.earlyPaymentDiscount')}
              />
            </div>
          </div>

          {/* Notification Preferences */}
          <div className={styles.preferenceSection}>
            <div className={styles.preferenceSectionTitle}>
              {t('supplierPortal.profile.notificationPreferences')}
            </div>
            <div className={styles.preferenceRow}>
              <div className={styles.preferenceInfo}>
                <span className={styles.preferenceLabel}>{t('supplierPortal.profile.notifPaymentReceived')}</span>
                <span className={styles.preferenceDesc}>{t('supplierPortal.profile.notifPaymentReceivedDesc')}</span>
              </div>
              <button
                className={`${styles.toggle} ${notifPrefs.paymentReceived ? styles.toggleActive : ''}`}
                onClick={() => setNotifPrefs((p) => ({ ...p, paymentReceived: !p.paymentReceived }))}
                role="switch"
                aria-checked={notifPrefs.paymentReceived}
              />
            </div>
            <div className={styles.preferenceRow}>
              <div className={styles.preferenceInfo}>
                <span className={styles.preferenceLabel}>{t('supplierPortal.profile.notifInvoiceStatus')}</span>
                <span className={styles.preferenceDesc}>{t('supplierPortal.profile.notifInvoiceStatusDesc')}</span>
              </div>
              <button
                className={`${styles.toggle} ${notifPrefs.invoiceStatusChange ? styles.toggleActive : ''}`}
                onClick={() => setNotifPrefs((p) => ({ ...p, invoiceStatusChange: !p.invoiceStatusChange }))}
                role="switch"
                aria-checked={notifPrefs.invoiceStatusChange}
              />
            </div>
            <div className={styles.preferenceRow}>
              <div className={styles.preferenceInfo}>
                <span className={styles.preferenceLabel}>{t('supplierPortal.profile.notifNewDispute')}</span>
                <span className={styles.preferenceDesc}>{t('supplierPortal.profile.notifNewDisputeDesc')}</span>
              </div>
              <button
                className={`${styles.toggle} ${notifPrefs.newDispute ? styles.toggleActive : ''}`}
                onClick={() => setNotifPrefs((p) => ({ ...p, newDispute: !p.newDispute }))}
                role="switch"
                aria-checked={notifPrefs.newDispute}
              />
            </div>
            <div className={styles.preferenceRow}>
              <div className={styles.preferenceInfo}>
                <span className={styles.preferenceLabel}>{t('supplierPortal.profile.notifScfOffers')}</span>
                <span className={styles.preferenceDesc}>{t('supplierPortal.profile.notifScfOffersDesc')}</span>
              </div>
              <button
                className={`${styles.toggle} ${notifPrefs.scfOffers ? styles.toggleActive : ''}`}
                onClick={() => setNotifPrefs((p) => ({ ...p, scfOffers: !p.scfOffers }))}
                role="switch"
                aria-checked={notifPrefs.scfOffers}
              />
            </div>
          </div>

          <div className={styles.saveArea}>
            <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
              {saving ? t('supplierPortal.profile.saving') : t('supplierPortal.profile.saveChanges')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
