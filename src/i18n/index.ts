import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './locales/en';
import { fr } from './locales/fr';
import { es } from './locales/es';
import { ar } from './locales/ar';

export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  FR: 'fr',
  ES: 'es',
  AR: 'ar',
} as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[keyof typeof SUPPORTED_LANGUAGES];

export const RTL_LANGUAGES: SupportedLanguage[] = ['ar'];

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  ar: { translation: ar },
};

const savedLanguage = localStorage.getItem('language') as SupportedLanguage | null;
const browserLanguage = navigator.language.split('-')[0] as SupportedLanguage;
const defaultLanguage = savedLanguage || (Object.values(SUPPORTED_LANGUAGES).includes(browserLanguage) ? browserLanguage : SUPPORTED_LANGUAGES.EN);

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: SUPPORTED_LANGUAGES.EN,
  interpolation: {
    escapeValue: false,
  },
});

// Update document direction based on language
const updateDocumentDirection = (language: SupportedLanguage) => {
  const isRTL = RTL_LANGUAGES.includes(language);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};

// Set initial direction
updateDocumentDirection(defaultLanguage);

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  updateDocumentDirection(lng as SupportedLanguage);
});

export default i18n;
