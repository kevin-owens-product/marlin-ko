'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Log error - in production, this would report to an error tracking service
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private getErrorMessage(error: Error | null): string {
    if (!error) return 'An unexpected error occurred.';

    if (error.name === 'ChunkLoadError') {
      return 'A new version of the application is available. Please refresh the page.';
    }

    if (error.message?.includes('Network')) {
      return 'A network error occurred. Please check your connection and try again.';
    }

    if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      return 'The request timed out. Please try again.';
    }

    return 'Something went wrong while rendering this section.';
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const message = this.getErrorMessage(this.state.error);

      return (
        <div className={styles.container} role="alert" aria-live="assertive">
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.message}>{message}</p>
            <div className={styles.actions}>
              <button
                className={styles.retryButton}
                onClick={this.handleReset}
                type="button"
              >
                Try Again
              </button>
              <button
                className={styles.reloadButton}
                onClick={() => window.location.reload()}
                type="button"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
