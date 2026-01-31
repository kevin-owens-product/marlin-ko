"use client";

import styles from './SuggestionChips.module.css';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className={styles.chipRow}>
      {suggestions.map((s) => (
        <button
          key={s}
          className={styles.chip}
          onClick={() => onSelect(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
