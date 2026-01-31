'use client';

import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, hoverable, onClick }: CardProps) {
  const classes = [
    styles.card,
    hoverable ? styles.cardHoverable : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Interactive card' : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, actions, className }: CardHeaderProps) {
  return (
    <div className={`${styles.header} ${className || ''}`}>
      <div className={styles.headerContent}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

export function CardBody({ children, noPadding, className }: CardBodyProps) {
  return (
    <div
      className={`${noPadding ? styles.bodyNoPadding : styles.body} ${className || ''}`}
    >
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={`${styles.footer} ${className || ''}`}>{children}</div>;
}
