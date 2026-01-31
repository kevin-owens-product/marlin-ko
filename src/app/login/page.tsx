"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/i18n/locale-context';
import { UserRole } from '@/lib/auth';
import styles from './login.module.css';

const DEMO_ACCOUNTS: { role: UserRole; labelKey: string; color: string }[] = [
  { role: 'ADMIN', labelKey: 'login.admin', color: '#165DFF' },
  { role: 'APPROVER', labelKey: 'login.approver', color: '#00B42A' },
  { role: 'AP_CLERK', labelKey: 'login.apClerk', color: '#FF7D00' },
  { role: 'VIEWER', labelKey: 'login.viewer', color: '#4E5969' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, loginWithCredentials } = useAuth();
  const t = useT();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = loginWithCredentials(email, password);
    if (success) {
      router.push('/');
    } else {
      setError(t('login.invalidCredentials'));
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    login(role);
    router.push('/');
  };

  return (
    <div className={styles.container}>
      {/* Left Brand Panel */}
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>
            <span>M</span>
          </div>
          <h1 className={styles.brandTitle}>Medius</h1>
          <p className={styles.brandTagline}>
            {t('login.brandTagline').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
          <div className={styles.statBadges}>
            <div className={styles.statBadge}>
              <span className={styles.statValue}>94%</span>
              <span className={styles.statLabel}>{t('login.touchlessRate')}</span>
            </div>
            <div className={styles.statBadge}>
              <span className={styles.statValue}>2x</span>
              <span className={styles.statLabel}>{t('login.fasterProcessing')}</span>
            </div>
            <div className={styles.statBadge}>
              <span className={styles.statValue}>$2.4M</span>
              <span className={styles.statLabel}>{t('login.savedAnnually')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.welcomeTitle}>{t('login.welcomeBack')}</h2>
            <p className={styles.welcomeSubtitle}>{t('login.signInSubtitle')}</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">{t('login.emailLabel')}</label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">{t('login.passwordLabel')}</label>
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submitBtn}>
              {t('login.signIn')}
            </button>
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerText}>{t('login.orDemoAccount')}</span>
          </div>

          <div className={styles.demoSection}>
            <div className={styles.demoGrid}>
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  className={styles.demoBtn}
                  onClick={() => handleDemoLogin(account.role)}
                >
                  <span
                    className={styles.demoDot}
                    style={{ backgroundColor: account.color }}
                  />
                  <span>{t(account.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
