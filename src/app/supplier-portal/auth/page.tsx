'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useT, useLocale } from '@/lib/i18n/locale-context';
import { SUPPORTED_LOCALES, Locale } from '@/lib/i18n/types';
import styles from './auth.module.css';

/* ───────── Types ───────── */

type AuthTab = 'login' | 'register';

/* ───────── Component ───────── */

export default function SupplierPortalAuth() {
  const t = useT();
  const router = useRouter();
  const { locale, setLocale } = useLocale();

  /* Tab state */
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  /* Login form */
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginEmailError, setLoginEmailError] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');

  /* Register form */
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regContactName, setRegContactName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regTaxId, setRegTaxId] = useState('');
  const [regCountry, setRegCountry] = useState('');
  const [regCategory, setRegCategory] = useState('');
  const [registering, setRegistering] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  /* Login handler */
  const handleLogin = useCallback(() => {
    let valid = true;
    setLoginEmailError('');
    setLoginPasswordError('');
    setLoginError('');

    if (!loginEmail.trim() || !isValidEmail(loginEmail)) {
      setLoginEmailError(t('supplierPortal.auth.invalidEmail'));
      valid = false;
    }
    if (!loginPassword.trim()) {
      setLoginPasswordError(t('supplierPortal.auth.passwordRequired'));
      valid = false;
    }
    if (!valid) return;

    setSigningIn(true);
    setTimeout(() => {
      setSigningIn(false);
      router.push('/supplier-portal/dashboard');
    }, 1000);
  }, [loginEmail, loginPassword, router, t]);

  /* Register handler */
  const handleRegister = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!regCompanyName.trim()) errors.companyName = t('supplierPortal.auth.fieldRequired');
    if (!regContactName.trim()) errors.contactName = t('supplierPortal.auth.fieldRequired');
    if (!regEmail.trim() || !isValidEmail(regEmail)) errors.email = t('supplierPortal.auth.invalidEmail');
    if (!regPassword.trim() || regPassword.length < 8) errors.password = t('supplierPortal.auth.passwordMinLength');
    if (regPassword !== regConfirmPassword) errors.confirmPassword = t('supplierPortal.auth.passwordMismatch');
    if (!regTaxId.trim()) errors.taxId = t('supplierPortal.auth.fieldRequired');
    if (!regCountry) errors.country = t('supplierPortal.auth.fieldRequired');
    if (!regCategory) errors.category = t('supplierPortal.auth.fieldRequired');

    setRegErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setRegistering(true);
    setTimeout(() => {
      setRegistering(false);
      router.push('/supplier-portal/dashboard');
    }, 1200);
  }, [regCompanyName, regContactName, regEmail, regPassword, regConfirmPassword, regTaxId, regCountry, regCategory, router, t]);

  const handleLoginKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className={styles.page}>
      {/* ── Left Branding Panel ── */}
      <div className={styles.brandingPanel}>
        <div className={styles.brandingLogo}>
          <div className={styles.brandingLogoMark}>
            <span className={styles.brandingLogoLetter}>M</span>
          </div>
          <span className={styles.brandingLogoName}>Medius</span>
        </div>

        <h1 className={styles.brandingTagline}>
          {t('supplierPortal.auth.brandingTagline')}
        </h1>

        <p className={styles.brandingSubtitle}>
          {t('supplierPortal.auth.accessSubtitle')}
        </p>

        <div className={styles.benefitsList}>
          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>&#128200;</div>
            <div className={styles.benefitContent}>
              <div className={styles.benefitTitle}>
                {t('supplierPortal.auth.benefit1Title')}
              </div>
              <div className={styles.benefitDesc}>
                {t('supplierPortal.auth.benefit1Desc')}
              </div>
            </div>
          </div>

          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>&#128196;</div>
            <div className={styles.benefitContent}>
              <div className={styles.benefitTitle}>
                {t('supplierPortal.auth.benefit2Title')}
              </div>
              <div className={styles.benefitDesc}>
                {t('supplierPortal.auth.benefit2Desc')}
              </div>
            </div>
          </div>

          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>&#128176;</div>
            <div className={styles.benefitContent}>
              <div className={styles.benefitTitle}>
                {t('supplierPortal.auth.benefit3Title')}
              </div>
              <div className={styles.benefitDesc}>
                {t('supplierPortal.auth.benefit3Desc')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {activeTab === 'login'
              ? t('supplierPortal.auth.signInTitle')
              : t('supplierPortal.auth.registerTitle')}
          </h2>
          <p className={styles.formSubtitle}>
            {activeTab === 'login'
              ? t('supplierPortal.auth.signInSubtitle')
              : t('supplierPortal.auth.registerSubtitle')}
          </p>

          {/* ── Tab Toggle ── */}
          <div className={styles.authTabs}>
            <button
              className={`${styles.authTab} ${activeTab === 'login' ? styles.authTabActive : ''}`}
              onClick={() => { setActiveTab('login'); setLoginError(''); }}
            >
              {t('supplierPortal.auth.tabLogin')}
            </button>
            <button
              className={`${styles.authTab} ${activeTab === 'register' ? styles.authTabActive : ''}`}
              onClick={() => { setActiveTab('register'); setRegErrors({}); }}
            >
              {t('supplierPortal.auth.tabRegister')}
            </button>
          </div>

          {/* ── Login Form ── */}
          {activeTab === 'login' && (
            <>
              {loginError && (
                <div className={styles.errorMessage}>
                  <span className={styles.errorIcon}>&#10007;</span>
                  <span className={styles.errorText}>{loginError}</span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('supplierPortal.auth.emailLabel')}
                </label>
                <input
                  className={styles.formInput}
                  type="email"
                  placeholder={t('supplierPortal.auth.emailPlaceholder')}
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setLoginEmailError('');
                    setLoginError('');
                  }}
                  onKeyDown={handleLoginKeyDown}
                  aria-label={t('supplierPortal.auth.emailLabel')}
                />
                {loginEmailError && (
                  <span className={styles.formError}>{loginEmailError}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('supplierPortal.auth.passwordLabel')}
                </label>
                <input
                  className={styles.formInput}
                  type="password"
                  placeholder={t('supplierPortal.auth.passwordPlaceholder')}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginPasswordError('');
                    setLoginError('');
                  }}
                  onKeyDown={handleLoginKeyDown}
                  aria-label={t('supplierPortal.auth.passwordLabel')}
                />
                {loginPasswordError && (
                  <span className={styles.formError}>{loginPasswordError}</span>
                )}
              </div>

              <div className={styles.formRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  {t('supplierPortal.auth.rememberMe')}
                </label>
                <button className={styles.forgotLink}>
                  {t('supplierPortal.auth.forgotPassword')}
                </button>
              </div>

              <button
                className={styles.signInButton}
                onClick={handleLogin}
                disabled={signingIn}
              >
                {signingIn
                  ? t('supplierPortal.auth.signingIn')
                  : t('supplierPortal.auth.signIn')}
              </button>

              {/* Demo credentials hint */}
              <div className={styles.demoHint}>
                <div className={styles.demoHintTitle}>{t('supplierPortal.auth.demoCredentials')}</div>
                <div className={styles.demoHintText}>
                  {t('supplierPortal.auth.demoEmail')}: demo@acmecorp.com
                </div>
                <div className={styles.demoHintText}>
                  {t('supplierPortal.auth.demoPassword')}: password123
                </div>
              </div>
            </>
          )}

          {/* ── Register Form ── */}
          {activeTab === 'register' && (
            <>
              <div className={styles.formGroupRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('supplierPortal.auth.companyName')} *
                  </label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder={t('supplierPortal.auth.companyNamePlaceholder')}
                    value={regCompanyName}
                    onChange={(e) => setRegCompanyName(e.target.value)}
                  />
                  {regErrors.companyName && (
                    <span className={styles.formError}>{regErrors.companyName}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('supplierPortal.auth.contactName')} *
                  </label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder={t('supplierPortal.auth.contactNamePlaceholder')}
                    value={regContactName}
                    onChange={(e) => setRegContactName(e.target.value)}
                  />
                  {regErrors.contactName && (
                    <span className={styles.formError}>{regErrors.contactName}</span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('supplierPortal.auth.emailLabel')} *
                </label>
                <input
                  className={styles.formInput}
                  type="email"
                  placeholder={t('supplierPortal.auth.emailPlaceholder')}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
                {regErrors.email && (
                  <span className={styles.formError}>{regErrors.email}</span>
                )}
              </div>

              <div className={styles.formGroupRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('supplierPortal.auth.passwordLabel')} *
                  </label>
                  <input
                    className={styles.formInput}
                    type="password"
                    placeholder={t('supplierPortal.auth.createPasswordPlaceholder')}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                  {regErrors.password && (
                    <span className={styles.formError}>{regErrors.password}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('supplierPortal.auth.confirmPassword')} *
                  </label>
                  <input
                    className={styles.formInput}
                    type="password"
                    placeholder={t('supplierPortal.auth.confirmPasswordPlaceholder')}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                  />
                  {regErrors.confirmPassword && (
                    <span className={styles.formError}>{regErrors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('supplierPortal.auth.taxId')} *
                </label>
                <input
                  className={styles.formInput}
                  type="text"
                  placeholder={t('supplierPortal.auth.taxIdPlaceholder')}
                  value={regTaxId}
                  onChange={(e) => setRegTaxId(e.target.value)}
                />
                {regErrors.taxId && (
                  <span className={styles.formError}>{regErrors.taxId}</span>
                )}
              </div>

              <div className={styles.formGroupRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('supplierPortal.auth.country')} *
                  </label>
                  <select
                    className={styles.formSelect}
                    value={regCountry}
                    onChange={(e) => setRegCountry(e.target.value)}
                  >
                    <option value="" disabled>{t('supplierPortal.auth.selectCountry')}</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="SE">Sweden</option>
                    <option value="NO">Norway</option>
                    <option value="FR">France</option>
                    <option value="AU">Australia</option>
                    <option value="JP">Japan</option>
                  </select>
                  {regErrors.country && (
                    <span className={styles.formError}>{regErrors.country}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('supplierPortal.auth.category')} *
                  </label>
                  <select
                    className={styles.formSelect}
                    value={regCategory}
                    onChange={(e) => setRegCategory(e.target.value)}
                  >
                    <option value="" disabled>{t('supplierPortal.auth.selectCategory')}</option>
                    <option value="it_services">IT Services</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="consulting">Consulting</option>
                    <option value="logistics">Logistics</option>
                    <option value="raw_materials">Raw Materials</option>
                    <option value="office_supplies">Office Supplies</option>
                    <option value="professional_services">Professional Services</option>
                    <option value="other">Other</option>
                  </select>
                  {regErrors.category && (
                    <span className={styles.formError}>{regErrors.category}</span>
                  )}
                </div>
              </div>

              <button
                className={styles.registerButton}
                onClick={handleRegister}
                disabled={registering}
              >
                {registering
                  ? t('supplierPortal.auth.registering')
                  : t('supplierPortal.auth.createAccount')}
              </button>
            </>
          )}

          {/* ── Footer ── */}
          <div className={styles.formFooter}>
            <p className={styles.helpText}>
              {t('supplierPortal.auth.needHelp')}
            </p>
          </div>

          {/* ── Language Selector ── */}
          <div className={styles.languageSection}>
            <select
              className={styles.languageSelect}
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              aria-label={t('supplierPortal.auth.selectLanguage')}
            >
              {SUPPORTED_LOCALES.map((loc) => (
                <option key={loc.code} value={loc.code}>
                  {loc.flag} {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
