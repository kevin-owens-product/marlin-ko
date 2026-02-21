'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import styles from './CopyButton.module.css';

export type CopyButtonSize = 'sm' | 'md';

export interface CopyButtonProps {
  text: string;
  label?: string;
  size?: CopyButtonSize;
  onCopy?: () => void;
}

export function CopyButton({
  text,
  label = 'Copy',
  size = 'md',
  onCopy,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        onCopy?.();

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch {
        // Copy failed silently
      }
      document.body.removeChild(textarea);
    }
  }, [text, onCopy]);

  const classes = [styles.button, styles[size], copied ? styles.copied : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.container}>
      <button
        className={classes}
        onClick={handleCopy}
        type="button"
        aria-label={copied ? 'Copied to clipboard' : `${label}`}
        title={copied ? 'Copied!' : label}
      >
        {copied ? (
          <svg
            width={size === 'sm' ? 12 : 14}
            height={size === 'sm' ? 12 : 14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width={size === 'sm' ? 12 : 14}
            height={size === 'sm' ? 12 : 14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
        {label && <span className={styles.label}>{copied ? 'Copied!' : label}</span>}
      </button>
      {copied && (
        <div className={styles.tooltip} role="status" aria-live="polite">
          Copied!
        </div>
      )}
    </div>
  );
}
