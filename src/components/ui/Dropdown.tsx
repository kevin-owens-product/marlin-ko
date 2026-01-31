'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Dropdown.module.css';

export interface DropdownItem {
  type?: 'item' | 'separator' | 'label';
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = 'right',
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, close]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    const focusableItems = menuRef.current?.querySelectorAll<HTMLButtonElement>(
      'button:not([disabled])'
    );
    if (!focusableItems?.length) return;

    const focused = document.activeElement;
    const index = Array.from(focusableItems).indexOf(focused as HTMLButtonElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = index < focusableItems.length - 1 ? index + 1 : 0;
      focusableItems[next].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = index > 0 ? index - 1 : focusableItems.length - 1;
      focusableItems[prev].focus();
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick?.();
    close();
  };

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} ${className || ''}`} onKeyDown={handleKeyDown}>
      <div
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((prev) => !prev);
          }
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </div>

      {open && (
        <div
          ref={menuRef}
          className={`${styles.menu} ${align === 'left' ? styles.menuLeft : ''}`}
          role="menu"
          aria-label="Dropdown menu"
        >
          {items.map((item, idx) => {
            if (item.type === 'separator') {
              return <div key={`sep-${idx}`} className={styles.separator} role="separator" />;
            }
            if (item.type === 'label') {
              return (
                <div key={`label-${idx}`} className={styles.label} role="presentation">
                  {item.label}
                </div>
              );
            }
            return (
              <button
                key={`item-${idx}`}
                className={`${styles.item} ${item.danger ? styles.itemDanger : ''} ${item.disabled ? styles.itemDisabled : ''}`}
                role="menuitem"
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                type="button"
              >
                {item.icon && <span className={styles.itemIcon} aria-hidden="true">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
