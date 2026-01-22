import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './locales/en';
import { fr } from './locales/fr';
import { es } from './locales/es';
import { ar } from './locales/ar';

import {
  SUPPORTED_LANGUAGES,
  RTL_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  type SupportedLanguage,
} from '@/constants/i18n';

// Re-export for convenience
export { SUPPORTED_LANGUAGES, RTL_LANGUAGES, type SupportedLanguage };

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  ar: { translation: ar },
};

// Get saved or browser language
const getSavedLanguage = (): SupportedLanguage => {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage | null;
  if (saved && Object.values(SUPPORTED_LANGUAGES).includes(saved)) {
    return saved;
  }
  
  const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
  if (Object.values(SUPPORTED_LANGUAGES).includes(browserLang)) {
    return browserLang;
  }
  
  return DEFAULT_LANGUAGE;
};

const initialLanguage = getSavedLanguage();

// Update document direction and attributes
const updateDocumentDirection = (language: SupportedLanguage) => {
  const isRTL = RTL_LANGUAGES.includes(language);
  const direction = isRTL ? 'rtl' : 'ltr';
  
  document.documentElement.dir = direction;
  document.documentElement.lang = language;
  
  // Update body classes for CSS targeting
  document.body.classList.remove('ltr', 'rtl');
  document.body.classList.add(direction);
};

// Initialize i18next
i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
  // Enable nested keys
  keySeparator: '.',
  // Return key if translation not found (useful for debugging)
  returnNull: false,
  returnEmptyString: false,
});

// Set initial direction
updateDocumentDirection(initialLanguage);

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  updateDocumentDirection(lng as SupportedLanguage);
});

export default i18n;
