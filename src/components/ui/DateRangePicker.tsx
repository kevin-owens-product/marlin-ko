'use client';

import React, { useId, useMemo } from 'react';
import styles from './DateRangePicker.module.css';

export interface DateRangePreset {
  label: string;
  start: string;
  end: string;
}

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  presets?: DateRangePreset[];
}

function getDefaultPresets(): DateRangePreset[] {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };

  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
  const firstOfQuarter = new Date(today.getFullYear(), quarterMonth, 1);

  return [
    { label: 'Last 7 days', start: fmt(daysAgo(7)), end: fmt(today) },
    { label: 'Last 30 days', start: fmt(daysAgo(30)), end: fmt(today) },
    { label: 'This month', start: fmt(firstOfMonth), end: fmt(today) },
    { label: 'Last month', start: fmt(firstOfLastMonth), end: fmt(lastOfLastMonth) },
    { label: 'This quarter', start: fmt(firstOfQuarter), end: fmt(today) },
  ];
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  presets,
}: DateRangePickerProps) {
  const id = useId();
  const resolvedPresets = useMemo(() => presets ?? getDefaultPresets(), [presets]);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value, endDate);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(startDate, e.target.value);
  };

  const handlePreset = (preset: DateRangePreset) => {
    onChange(preset.start, preset.end);
  };

  const handleClear = () => {
    onChange('', '');
  };

  const hasValue = startDate !== '' || endDate !== '';

  return (
    <div className={styles.container}>
      <div className={styles.inputs}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-start`}>
            From
          </label>
          <input
            id={`${id}-start`}
            type="date"
            className={styles.input}
            value={startDate}
            onChange={handleStartChange}
            max={endDate || undefined}
            aria-label="Start date"
          />
        </div>
        <div className={styles.separator} aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-end`}>
            To
          </label>
          <input
            id={`${id}-end`}
            type="date"
            className={styles.input}
            value={endDate}
            onChange={handleEndChange}
            min={startDate || undefined}
            aria-label="End date"
          />
        </div>
        {hasValue && (
          <button
            className={styles.clearBtn}
            onClick={handleClear}
            type="button"
            aria-label="Clear date range"
            title="Clear"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      {resolvedPresets.length > 0 && (
        <div className={styles.presets} role="group" aria-label="Quick date presets">
          {resolvedPresets.map((preset) => (
            <button
              key={preset.label}
              className={[
                styles.presetBtn,
                startDate === preset.start && endDate === preset.end
                  ? styles.presetActive
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handlePreset(preset)}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
