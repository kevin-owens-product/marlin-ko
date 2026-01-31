'use client';

import React from 'react';
import styles from './EditableCell.module.css';

export interface EditableCellProps {
  editing: boolean;
  value: any;
  onChange: (value: any) => void;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: { label: string; value: string }[];
  displayRender?: (value: any) => React.ReactNode;
  placeholder?: string;
}

export function EditableCell({
  editing,
  value,
  onChange,
  type = 'text',
  options,
  displayRender,
  placeholder,
}: EditableCellProps) {
  if (!editing) {
    if (displayRender) return <>{displayRender(value)}</>;
    return <span className={styles.displayText}>{value ?? ''}</span>;
  }

  if (type === 'select' && options) {
    return (
      <select
        className={styles.cellSelect}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      className={styles.cellInput}
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
      placeholder={placeholder}
      autoFocus
    />
  );
}
