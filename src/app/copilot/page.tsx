'use client';

import { useEffect } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { useCopilot } from '@/lib/copilot/copilot-context';
import styles from './copilot.module.css';

export default function CopilotPage() {
  const t = useT();
  const { open } = useCopilot();

  // Auto-open the copilot drawer when visiting this page
  useEffect(() => {
    open();
  }, [open]);

  return (
    <div className={styles.page}>
      <div className={styles.landing}>
        <div className={styles.landingIcon}>AI</div>
        <h1 className={styles.landingTitle}>{t('copilot.title')}</h1>
        <p className={styles.landingSubtitle}>{t('copilot.subtitle')}</p>
        <div className={styles.landingFeatures}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>{'\u2699'}</div>
            <div className={styles.featureTitle}>Query Any Module</div>
            <div className={styles.featureDesc}>Ask about invoices, POs, contracts, expenses, suppliers, payments, risk, and cash flow.</div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>{'\u2615'}</div>
            <div className={styles.featureTitle}>Real-Time Data</div>
            <div className={styles.featureDesc}>Get live counts, summaries, and tables directly from your database.</div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>{'\u2316'}</div>
            <div className={styles.featureTitle}>Context-Aware</div>
            <div className={styles.featureDesc}>Suggestions adapt to the page you are on. Navigate to any module and the copilot follows.</div>
          </div>
        </div>
        <p className={styles.landingHint}>
          Press <kbd>{'\u2318'}</kbd><kbd>{'\u21E7'}</kbd><kbd>I</kbd> from any page to toggle the copilot drawer.
        </p>
      </div>
    </div>
  );
}
