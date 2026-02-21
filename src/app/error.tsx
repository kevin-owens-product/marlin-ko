'use client';

import Link from 'next/link';
import styles from './error.module.css';

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  // Sanitize error message - never expose stack traces to users
  const getSafeMessage = (): string => {
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return 'A network error occurred. Please check your connection and try again.';
    }
    if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      return 'The request timed out. Please try again in a moment.';
    }
    if (error.message?.includes('ChunkLoadError')) {
      return 'A new version is available. Please refresh the page.';
    }
    return 'An unexpected error occurred. Our team has been notified.';
  };

  return (
    <div className={styles.container}>
      <div className={styles.bgGradient} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.message}>{getSafeMessage()}</p>
        {error.digest && (
          <p className={styles.errorId}>
            Error ID: <code className={styles.digest}>{error.digest}</code>
          </p>
        )}
        <div className={styles.actions}>
          <button
            className={styles.retryButton}
            onClick={reset}
            type="button"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Try Again
          </button>
          <Link href="/" className={styles.dashboardLink}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
