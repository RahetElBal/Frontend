import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './locales/en';

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
};

const localeLoaders: Record<
  SupportedLanguage,
  () => Promise<{ translation: Record<string, unknown> }>
> = {
  en: async () => ({ translation: en }),
  fr: async () => {
    const module = await import('./locales/fr');
    return { translation: module.fr };
  },
  es: async () => {
    const module = await import('./locales/es');
    return { translation: module.es };
  },
  ar: async () => {
    const module = await import('./locales/ar');
    return { translation: module.ar };
  },
};

// Get saved language or fall back to the app default.
const getSavedLanguage = (): SupportedLanguage => {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage | null;
  if (saved && Object.values(SUPPORTED_LANGUAGES).includes(saved)) {
    return saved;
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

const ensureLanguageResources = async (language: SupportedLanguage) => {
  if (i18n.hasResourceBundle(language, 'translation')) {
    return;
  }

  const loader = localeLoaders[language];
  if (!loader) return;

  const { translation } = await loader();
  i18n.addResourceBundle(language, 'translation', translation, true, true);
};

export const changeLanguage = async (language: SupportedLanguage) => {
  await ensureLanguageResources(language);
  await i18n.changeLanguage(language);
};

export const initI18n = async () => {
  // Initialize with default language only to keep the initial bundle small
  await i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANGUAGE,
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

  // Load initial language resources (if not default) before switching
  await changeLanguage(initialLanguage);

  // Set initial direction
  updateDocumentDirection(initialLanguage);

  // Listen for language changes
  i18n.on('languageChanged', (lng) => {
    const language = lng as SupportedLanguage;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    updateDocumentDirection(language);
    void ensureLanguageResources(language);
  });
};

export default i18n;
