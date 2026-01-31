export type Locale = 'en' | 'fr' | 'de' | 'es' | 'it' | 'pt' | 'sv' | 'no' | 'da' | 'fi' | 'nl';

export interface LocaleInfo {
  code: Locale;
  name: string;
  flag: string;
}

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
];

export const DEFAULT_LOCALE: Locale = 'en';

export type Dictionary = Record<string, unknown>;
