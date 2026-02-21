'use client';

import React, { useState, useId } from 'react';
import styles from './ColorPicker.module.css';

const DEFAULT_PRESETS = [
  '#165DFF', '#0E42D2', '#00B42A', '#FF7D00', '#F53F3F',
  '#722ED1', '#14C9C9', '#1D2129', '#4E5969', '#86909C',
];

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  presets?: string[];
}

export function ColorPicker({
  value,
  onChange,
  label,
  presets = DEFAULT_PRESETS,
}: ColorPickerProps) {
  const id = useId();
  const [inputValue, setInputValue] = useState(value.replace('#', ''));

  const isValidHex = (hex: string): boolean => {
    return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
    setInputValue(raw);
    if (isValidHex(raw)) {
      const normalized = raw.length === 3
        ? raw.split('').map((c) => c + c).join('')
        : raw;
      onChange(`#${normalized}`);
    }
  };

  const handleBlur = () => {
    if (isValidHex(inputValue)) {
      const normalized = inputValue.length === 3
        ? inputValue.split('').map((c) => c + c).join('')
        : inputValue;
      setInputValue(normalized);
      onChange(`#${normalized}`);
    } else {
      setInputValue(value.replace('#', ''));
    }
  };

  const handlePresetClick = (color: string) => {
    const hex = color.replace('#', '');
    setInputValue(hex);
    onChange(color);
  };

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label} htmlFor={`${id}-input`}>
          {label}
        </label>
      )}
      <div className={styles.inputRow}>
        <div
          className={styles.swatch}
          style={{ backgroundColor: isValidHex(inputValue) ? `#${inputValue}` : value }}
          aria-hidden="true"
        />
        <div className={styles.inputWrapper}>
          <span className={styles.hashPrefix} aria-hidden="true">
            #
          </span>
          <input
            id={`${id}-input`}
            className={styles.input}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            maxLength={6}
            placeholder="000000"
            aria-label={label ? `${label} hex color value` : 'Hex color value'}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
      {presets.length > 0 && (
        <div className={styles.presets} role="listbox" aria-label="Color presets">
          {presets.map((color) => (
            <button
              key={color}
              className={[
                styles.presetBtn,
                value.toLowerCase() === color.toLowerCase() ? styles.presetActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ backgroundColor: color }}
              onClick={() => handlePresetClick(color)}
              type="button"
              role="option"
              aria-selected={value.toLowerCase() === color.toLowerCase()}
              aria-label={`Select color ${color}`}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
