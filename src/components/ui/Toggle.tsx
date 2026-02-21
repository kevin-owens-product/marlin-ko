'use client';

import React, { useId } from 'react';
import styles from './Toggle.module.css';

export type ToggleSize = 'sm' | 'md' | 'lg';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: ToggleSize;
  label?: string;
  id?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  id: providedId,
}: ToggleProps) {
  const generatedId = useId();
  const toggleId = providedId || generatedId;

  const classes = [
    styles.track,
    styles[size],
    checked ? styles.checked : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  return (
    <div className={styles.container}>
      <button
        id={toggleId}
        className={classes}
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        aria-label={label || undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        type="button"
      >
        <span className={styles.thumb} />
      </button>
      {label && (
        <label className={styles.label} htmlFor={toggleId}>
          {label}
        </label>
      )}
    </div>
  );
}
