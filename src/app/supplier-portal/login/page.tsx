'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/locale-context';
import styles from './portal-login.module.css';

/* ───────── Component ───────── */

export default function SupplierPortalLogin() {
  const t = useT();
  const router = useRouter();

  /* Magic link state */
  const [magicEmail, setMagicEmail] = useState('');
  const [magicSending, setMagicSending] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  /* Password login state */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  /* Validation */
  const [magicError, setMagicError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  /* Send magic link */
  const handleSendMagicLink = useCallback(() => {
    setMagicError('');
    if (!magicEmail.trim() || !isValidEmail(magicEmail)) {
      setMagicError('Please enter a valid email address');
      return;
    }
    setMagicSending(true);
    setTimeout(() => {
      setMagicSending(false);
      setMagicSent(true);
    }, 1200);
  }, [magicEmail]);

  /* Password login */
  const handleSignIn = useCallback(() => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setLoginError('');

    if (!email.trim() || !isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      valid = false;
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    }
    if (!valid) return;

    setSigningIn(true);
    setTimeout(() => {
      setSigningIn(false);
      /* Accept demo credentials or navigate */
      if (email === 'supplier@acmecorp.com' && password === 'demo') {
        router.push('/supplier-portal');
      } else {
        /* For demo, always allow login */
        router.push('/supplier-portal');
      }
    }, 1000);
  }, [email, password, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* ── Logo + Title ── */}
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <span className={styles.logoText}>M</span>
          </div>
          <h1 className={styles.heading}>{t('supplierPortal.login.heading')}</h1>
          <p className={styles.subheading}>{t('supplierPortal.login.subheading')}</p>
        </div>

        {/* ── Magic Link Section ── */}
        <div className={styles.magicLinkSection}>
          {magicSent && (
            <div className={styles.successMessage}>
              <span className={styles.successIcon}>&#10003;</span>
              <span className={styles.successText}>{t('supplierPortal.login.linkSent')}</span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('supplierPortal.login.emailLabel')}</label>
            <input
              className={styles.formInput}
              type="email"
              placeholder={t('supplierPortal.login.emailPlaceholder')}
              value={magicEmail}
              onChange={(e) => { setMagicEmail(e.target.value); setMagicError(''); setMagicSent(false); }}
              aria-label={t('supplierPortal.login.emailLabel')}
            />
            {magicError && <span className={styles.formError}>{magicError}</span>}
          </div>

          <button
            className={styles.magicLinkButton}
            onClick={handleSendMagicLink}
            disabled={magicSending}
          >
            {magicSending ? t('common.loading') : t('supplierPortal.login.sendLoginLink')}
          </button>
        </div>

        {/* ── Divider ── */}
        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>{t('supplierPortal.login.orDivider')}</span>
          <div className={styles.dividerLine} />
        </div>

        {/* ── Password Login Section ── */}
        <div className={styles.passwordSection}>
          {loginError && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>&#10007;</span>
              <span className={styles.errorText}>{loginError}</span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('supplierPortal.login.emailLabel')}</label>
            <input
              className={styles.formInput}
              type="email"
              placeholder={t('supplierPortal.login.emailPlaceholder')}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); setLoginError(''); }}
              onKeyDown={handleKeyDown}
              aria-label={t('supplierPortal.login.emailLabel')}
            />
            {emailError && <span className={styles.formError}>{emailError}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('supplierPortal.login.passwordLabel')}</label>
            <input
              className={styles.formInput}
              type="password"
              placeholder={t('supplierPortal.login.passwordPlaceholder')}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(''); setLoginError(''); }}
              onKeyDown={handleKeyDown}
              aria-label={t('supplierPortal.login.passwordLabel')}
            />
            {passwordError && <span className={styles.formError}>{passwordError}</span>}
          </div>

          <button className={styles.forgotLink}>
            {t('supplierPortal.login.forgotPassword')}
          </button>

          <button
            className={styles.signInButton}
            onClick={handleSignIn}
            disabled={signingIn}
          >
            {signingIn ? t('common.loading') : t('supplierPortal.login.signIn')}
          </button>
        </div>

        {/* ── Footer Links ── */}
        <div className={styles.footerLinks}>
          <button className={styles.registerLink}>
            {t('supplierPortal.login.firstTime')}
          </button>
          <p className={styles.helpText}>
            {t('supplierPortal.login.needAccess')}
          </p>
        </div>
      </div>
    </div>
  );
}
