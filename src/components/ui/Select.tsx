'use client';

import React, { useId } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  wrapperClassName?: string;
}

export function Select({
  label,
  options,
  placeholder,
  error,
  helperText,
  required,
  wrapperClassName,
  className,
  id: externalId,
  value,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = externalId || generatedId;
  const errorId = error ? `${selectId}-error` : undefined;
  const helperId = helperText && !error ? `${selectId}-helper` : undefined;

  const selectClasses = [
    styles.select,
    error ? styles.selectError : '',
    !value && placeholder ? styles.placeholder : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${styles.wrapper} ${wrapperClassName || ''}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}
      <div className={styles.selectContainer}>
        <select
          id={selectId}
          className={selectClasses}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId || helperId || undefined}
          aria-required={required || undefined}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true">&#9660;</span>
      </div>
      {error && (
        <span id={errorId} className={styles.errorText} role="alert">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span id={helperId} className={styles.helperText}>
          {helperText}
        </span>
      )}
    </div>
  );
}
