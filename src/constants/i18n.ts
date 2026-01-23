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

export const CURRENCY_STORAGE_KEY = 'currency';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  name: string;
  flag: string;
}

// All available currencies
export const AVAILABLE_CURRENCIES: CurrencyConfig[] = [
  {
    code: 'EUR',
    symbol: '€',
    locale: 'fr-FR',
    name: 'Euro',
    flag: '🇪🇺',
  },
  {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    name: 'US Dollar',
    flag: '🇺🇸',
  },
  {
    code: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    name: 'British Pound',
    flag: '🇬🇧',
  },
  {
    code: 'DZD',
    symbol: 'د.ج',
    locale: 'ar-DZ',
    name: 'Dinar Algérien',
    flag: '🇩🇿',
  },
  {
    code: 'MAD',
    symbol: 'د.م.',
    locale: 'ar-MA',
    name: 'Dirham Marocain',
    flag: '🇲🇦',
  },
  {
    code: 'TND',
    symbol: 'د.ت',
    locale: 'ar-TN',
    name: 'Dinar Tunisien',
    flag: '🇹🇳',
  },
  {
    code: 'CAD',
    symbol: 'C$',
    locale: 'fr-CA',
    name: 'Dollar Canadien',
    flag: '🇨🇦',
  },
  {
    code: 'CHF',
    symbol: 'CHF',
    locale: 'fr-CH',
    name: 'Franc Suisse',
    flag: '🇨🇭',
  },
];

// Default currency per language (for initial setting)
export const LANGUAGE_CURRENCIES: Record<SupportedLanguage, CurrencyConfig> = {
  en: AVAILABLE_CURRENCIES.find(c => c.code === 'USD')!,
  fr: AVAILABLE_CURRENCIES.find(c => c.code === 'EUR')!,
  es: AVAILABLE_CURRENCIES.find(c => c.code === 'EUR')!,
  ar: AVAILABLE_CURRENCIES.find(c => c.code === 'DZD')!,
};
