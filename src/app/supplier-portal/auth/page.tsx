'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/locale-context';
import { useLocale } from '@/lib/i18n/locale-context';
import { SUPPORTED_LOCALES, Locale } from '@/lib/i18n/types';
import styles from './auth.module.css';

/* ───────── Types ───────── */

type AuthMethod = 'accessCode' | 'password';
type CodeStep = 'email' | 'verify';

/* ───────── Component ───────── */

export default function SupplierPortalAuth() {
  const t = useT();
  const router = useRouter();
  const { locale, setLocale } = useLocale();

  /* Auth method toggle */
  const [authMethod, setAuthMethod] = useState<AuthMethod>('accessCode');

  /* Access Code flow */
  const [codeStep, setCodeStep] = useState<CodeStep>('email');
  const [codeEmail, setCodeEmail] = useState('');
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [codeSending, setCodeSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerifying, setCodeVerifying] = useState(false);
  const [codeEmailError, setCodeEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* Password flow */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  /* Send access code */
  const handleSendCode = useCallback(() => {
    setCodeEmailError('');
    if (!codeEmail.trim() || !isValidEmail(codeEmail)) {
      setCodeEmailError(t('supplierPortal.auth.invalidEmail'));
      return;
    }
    setCodeSending(true);
    setTimeout(() => {
      setCodeSending(false);
      setCodeSent(true);
      setCodeStep('verify');
    }, 1200);
  }, [codeEmail, t]);

  /* Handle code digit input */
  const handleDigitChange = useCallback((index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...codeDigits];
    newDigits[index] = value;
    setCodeDigits(newDigits);
    setCodeError('');

    if (value && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  }, [codeDigits]);

  const handleDigitKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  }, [codeDigits]);

  /* Verify access code */
  const handleVerifyCode = useCallback(() => {
    const code = codeDigits.join('');
    if (code.length !== 6) {
      setCodeError(t('supplierPortal.auth.enterFullCode'));
      return;
    }
    setCodeVerifying(true);
    setTimeout(() => {
      setCodeVerifying(false);
      router.push('/supplier-portal');
    }, 1000);
  }, [codeDigits, router, t]);

  /* Password sign in */
  const handleSignIn = useCallback(() => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setLoginError('');

    if (!email.trim() || !isValidEmail(email)) {
      setEmailError(t('supplierPortal.auth.invalidEmail'));
      valid = false;
    }
    if (!password.trim()) {
      setPasswordError(t('supplierPortal.auth.passwordRequired'));
      valid = false;
    }
    if (!valid) return;

    setSigningIn(true);
    setTimeout(() => {
      setSigningIn(false);
      router.push('/supplier-portal');
    }, 1000);
  }, [email, password, router, t]);

  const handlePasswordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  /* Resend code */
  const handleResendCode = useCallback(() => {
    setCodeDigits(['', '', '', '', '', '']);
    setCodeError('');
    setCodeSending(true);
    setTimeout(() => {
      setCodeSending(false);
      setCodeSent(true);
    }, 1200);
  }, []);

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
            {t('supplierPortal.auth.signInTitle')}
          </h2>
          <p className={styles.formSubtitle}>
            {t('supplierPortal.auth.signInSubtitle')}
          </p>

          {/* ── Auth Method Tabs ── */}
          <div className={styles.authTabs}>
            <button
              className={`${styles.authTab} ${authMethod === 'accessCode' ? styles.authTabActive : ''}`}
              onClick={() => {
                setAuthMethod('accessCode');
                setLoginError('');
              }}
            >
              {t('supplierPortal.auth.tabAccessCode')}
            </button>
            <button
              className={`${styles.authTab} ${authMethod === 'password' ? styles.authTabActive : ''}`}
              onClick={() => {
                setAuthMethod('password');
                setCodeError('');
              }}
            >
              {t('supplierPortal.auth.tabPassword')}
            </button>
          </div>

          {/* ── Access Code Flow ── */}
          {authMethod === 'accessCode' && (
            <>
              {codeStep === 'email' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {t('supplierPortal.auth.emailLabel')}
                    </label>
                    <input
                      className={styles.formInput}
                      type="email"
                      placeholder={t('supplierPortal.auth.emailPlaceholder')}
                      value={codeEmail}
                      onChange={(e) => {
                        setCodeEmail(e.target.value);
                        setCodeEmailError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendCode();
                      }}
                      aria-label={t('supplierPortal.auth.emailLabel')}
                    />
                    {codeEmailError && (
                      <span className={styles.formError}>{codeEmailError}</span>
                    )}
                  </div>
                  <button
                    className={styles.sendCodeButton}
                    onClick={handleSendCode}
                    disabled={codeSending}
                  >
                    {codeSending
                      ? t('supplierPortal.auth.sendingCode')
                      : t('supplierPortal.auth.sendAccessCode')}
                  </button>
                </>
              )}

              {codeStep === 'verify' && (
                <>
                  {codeSent && (
                    <div className={styles.successMessage}>
                      <span className={styles.successIcon}>&#10003;</span>
                      <span className={styles.successText}>
                        {t('supplierPortal.auth.codeSentTo', { email: codeEmail })}
                      </span>
                    </div>
                  )}

                  {codeError && (
                    <div className={styles.errorMessage}>
                      <span className={styles.errorIcon}>&#10007;</span>
                      <span className={styles.errorText}>{codeError}</span>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {t('supplierPortal.auth.enterAccessCode')}
                    </label>
                    <div className={styles.codeInputGroup}>
                      {codeDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { digitRefs.current[idx] = el; }}
                          className={styles.codeDigit}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                          aria-label={`${t('supplierPortal.auth.digit')} ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    className={styles.verifyButton}
                    onClick={handleVerifyCode}
                    disabled={codeVerifying || codeDigits.join('').length !== 6}
                  >
                    {codeVerifying
                      ? t('supplierPortal.auth.verifying')
                      : t('supplierPortal.auth.verifyAndSignIn')}
                  </button>

                  <div className={styles.resendRow}>
                    <button
                      className={styles.resendLink}
                      onClick={handleResendCode}
                      disabled={codeSending}
                    >
                      {t('supplierPortal.auth.resendCode')}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Password Flow ── */}
          {authMethod === 'password' && (
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                    setLoginError('');
                  }}
                  onKeyDown={handlePasswordKeyDown}
                  aria-label={t('supplierPortal.auth.emailLabel')}
                />
                {emailError && (
                  <span className={styles.formError}>{emailError}</span>
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                    setLoginError('');
                  }}
                  onKeyDown={handlePasswordKeyDown}
                  aria-label={t('supplierPortal.auth.passwordLabel')}
                />
                {passwordError && (
                  <span className={styles.formError}>{passwordError}</span>
                )}
              </div>

              <button className={styles.forgotLink}>
                {t('supplierPortal.auth.forgotPassword')}
              </button>

              <button
                className={styles.signInButton}
                onClick={handleSignIn}
                disabled={signingIn}
              >
                {signingIn
                  ? t('supplierPortal.auth.signingIn')
                  : t('supplierPortal.auth.signIn')}
              </button>
            </>
          )}

          {/* ── Footer Links ── */}
          <div className={styles.formFooter}>
            <button className={styles.registerLink}>
              {t('supplierPortal.auth.firstTimeRegister')}
            </button>
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
