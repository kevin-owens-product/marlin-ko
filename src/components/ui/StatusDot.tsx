'use client';

import React from 'react';
import styles from './StatusDot.module.css';

export type StatusType = 'online' | 'offline' | 'warning' | 'error' | 'idle';
export type StatusDotSize = 'sm' | 'md' | 'lg';

export interface StatusDotProps {
  status: StatusType;
  pulse?: boolean;
  size?: StatusDotSize;
  label?: string;
}

const STATUS_LABELS: Record<StatusType, string> = {
  online: 'Online',
  offline: 'Offline',
  warning: 'Warning',
  error: 'Error',
  idle: 'Idle',
};

export function StatusDot({
  status,
  pulse = false,
  size = 'md',
  label,
}: StatusDotProps) {
  const classes = [
    styles.dot,
    styles[status],
    styles[size],
    pulse ? styles.pulse : '',
  ]
    .filter(Boolean)
    .join(' ');

  const accessibleLabel = label || STATUS_LABELS[status];

  return (
    <span
      className={styles.container}
      role="status"
      aria-label={accessibleLabel}
    >
      <span className={classes} aria-hidden="true" />
      {label && <span className={styles.label}>{label}</span>}
    </span>
  );
}
