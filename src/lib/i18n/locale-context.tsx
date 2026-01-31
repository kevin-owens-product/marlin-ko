"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Locale, DEFAULT_LOCALE, Dictionary } from './types';
import { getDictionary } from './dictionaries';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dictionary: Dictionary;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const STORAGE_KEY = 'medius_locale';

function resolveKey(dict: Dictionary, key: string): string {
  const parts = key.split('.');
  let current: unknown = dict;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return key;
    }
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current === 'string') return current;
  return key;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const val = params[k];
    return val !== undefined ? String(val) : `{{${k}}}`;
  });
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [dictionary, setDictionary] = useState<Dictionary>(getDictionary(DEFAULT_LOCALE));

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && getDictionary(stored)) {
        setLocaleState(stored);
        setDictionary(getDictionary(stored));
        document.documentElement.lang = stored;
      }
    } catch {
      // ignore
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setDictionary(getDictionary(newLocale));
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, dictionary }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

export function useT() {
  const { dictionary } = useLocale();
  return useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const resolved = resolveKey(dictionary, key);
      return interpolate(resolved, params);
    },
    [dictionary]
  );
}
