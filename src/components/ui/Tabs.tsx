'use client';

import React, { useState, useId } from 'react';
import styles from './Tabs.module.css';

export interface TabItem {
  label: string;
  value: string;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children?: (activeValue: string) => React.ReactNode;
  className?: string;
}

export function Tabs({
  items,
  value: controlledValue,
  defaultValue,
  onChange,
  children,
  className,
}: TabsProps) {
  const baseId = useId();
  const [internalValue, setInternalValue] = useState(
    defaultValue || items[0]?.value || ''
  );

  const activeValue = controlledValue !== undefined ? controlledValue : internalValue;

  const handleTabClick = (tabValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(tabValue);
    }
    onChange?.(tabValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledItems = items.filter((item) => !item.disabled);
    const currentIndex = enabledItems.findIndex((item) => item.value === items[index].value);

    let newIndex = -1;
    if (e.key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % enabledItems.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = enabledItems.length - 1;
    }

    if (newIndex !== -1) {
      e.preventDefault();
      const newTab = enabledItems[newIndex];
      handleTabClick(newTab.value);
      const tabEl = document.getElementById(`${baseId}-tab-${newTab.value}`);
      tabEl?.focus();
    }
  };

  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      <div className={styles.tabList} role="tablist" aria-label="Tabs">
        {items.map((item, index) => {
          const isActive = activeValue === item.value;
          return (
            <button
              key={item.value}
              id={`${baseId}-tab-${item.value}`}
              className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${item.value}`}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => handleTabClick(item.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              type="button"
            >
              {item.label}
              {item.count !== undefined && (
                <span className={styles.tabCount}>{item.count}</span>
              )}
            </button>
          );
        })}
      </div>
      {children && (
        <div
          id={`${baseId}-panel-${activeValue}`}
          className={styles.tabPanel}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeValue}`}
          tabIndex={0}
        >
          {children(activeValue)}
        </div>
      )}
    </div>
  );
}
