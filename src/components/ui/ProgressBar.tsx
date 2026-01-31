'use client';

import React from 'react';
import styles from './ProgressBar.module.css';

export type ProgressBarVariant = 'default' | 'success' | 'warning' | 'danger';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  valueFormat?: (value: number, max: number) => string;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  animated?: boolean;
  className?: string;
}

const fillVariantClass: Record<ProgressBarVariant, string> = {
  default: styles.fillDefault,
  success: styles.fillSuccess,
  warning: styles.fillWarning,
  danger: styles.fillDanger,
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  valueFormat,
  variant = 'default',
  size = 'md',
  animated = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const displayValue = valueFormat
    ? valueFormat(value, max)
    : `${Math.round(percentage)}%`;

  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      {(label || showValue) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && <span className={styles.valueText}>{displayValue}</span>}
        </div>
      )}
      <div
        className={`${styles.track} ${styles[size]} ${animated ? styles.animated : ''}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <div
          className={`${styles.fill} ${fillVariantClass[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
