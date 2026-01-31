'use client';

import React from 'react';
import styles from './StatCard.module.css';

export type StatCardVariant = 'default' | 'success' | 'warning' | 'danger';
export type TrendDirection = 'up' | 'down' | 'neutral';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: StatCardVariant;
  trend?: {
    direction: TrendDirection;
    value: string;
  };
  description?: string;
  className?: string;
}

const variantIconClass: Record<StatCardVariant, string> = {
  default: styles.iconDefault,
  success: styles.iconSuccess,
  warning: styles.iconWarning,
  danger: styles.iconDanger,
};

export function StatCard({
  title,
  value,
  icon,
  variant = 'default',
  trend,
  description,
  className,
}: StatCardProps) {
  const trendClass =
    trend?.direction === 'up'
      ? styles.trendUp
      : trend?.direction === 'down'
      ? styles.trendDown
      : styles.trendNeutral;

  const trendArrow =
    trend?.direction === 'up' ? '\u2191' : trend?.direction === 'down' ? '\u2193' : '';

  return (
    <div className={`${styles.card} ${className || ''}`} role="group" aria-label={title}>
      {icon && (
        <div className={`${styles.iconWrapper} ${variantIconClass[variant]}`} aria-hidden="true">
          {icon}
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.valueRow}>
          <span className={styles.value}>{value}</span>
          {trend && (
            <span className={`${styles.trend} ${trendClass}`} aria-label={`Trend ${trend.direction} ${trend.value}`}>
              {trendArrow && <span className={styles.trendArrow}>{trendArrow}</span>}
              {trend.value}
            </span>
          )}
        </div>
        {description && <div className={styles.description}>{description}</div>}
      </div>
    </div>
  );
}
