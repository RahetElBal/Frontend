export const LANGUAGE_STORAGE_KEY = 'language';

export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  FR: 'fr',
  ES: 'es',
  AR: 'ar',
} as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[keyof typeof SUPPORTED_LANGUAGES];

export const RTL_LANGUAGES: SupportedLanguage[] = ['ar'];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  ar: 'العربية',
};

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  es: '🇪🇸',
  ar: '🇩🇿',
};

export const DEFAULT_LANGUAGE: SupportedLanguage = SUPPORTED_LANGUAGES.EN;

// ============================================
// CURRENCY CONFIGURATION
// ============================================

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  name: string;
}

export const LANGUAGE_CURRENCIES: Record<SupportedLanguage, CurrencyConfig> = {
  en: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    name: 'US Dollar',
  },
  fr: {
    code: 'EUR',
    symbol: '€',
    locale: 'fr-FR',
    name: 'Euro',
  },
  es: {
    code: 'EUR',
    symbol: '€',
    locale: 'es-ES',
    name: 'Euro',
  },
  ar: {
    code: 'DZD',
    symbol: 'د.ج',
    locale: 'ar-DZ',
    name: 'Dinar Algérien',
  },
};
