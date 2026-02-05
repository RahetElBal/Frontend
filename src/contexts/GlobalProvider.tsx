/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { changeLanguage as loadAndChangeLanguage, type SupportedLanguage } from '@/i18n';
import { useTranslation } from 'react-i18next';

interface GlobalContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

const GlobalContext = createContext<GlobalContextValue | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<SupportedLanguage>(
    i18n.language as SupportedLanguage
  );

  const setLanguage = (lang: SupportedLanguage) => {
    void loadAndChangeLanguage(lang);
    setLanguageState(lang);
  };

  const value: GlobalContextValue = {
    language,
    setLanguage,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
}
