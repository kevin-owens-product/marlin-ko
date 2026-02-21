'use client';

import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.bgPattern} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.logo} aria-hidden="true">
          <span className={styles.logoIcon}>M</span>
          <span className={styles.logoText}>Medius</span>
        </div>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primaryAction}>
            Go to Dashboard
          </Link>
          <button
            className={styles.secondaryAction}
            onClick={() => window.history.back()}
            type="button"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
