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
  ar: '🇸🇦',
};

export const DEFAULT_LANGUAGE: SupportedLanguage = SUPPORTED_LANGUAGES.EN;
