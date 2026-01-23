import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES, type SupportedLanguage } from '@/i18n';

export type Direction = 'ltr' | 'rtl';

interface UseDirectionReturn {
  direction: Direction;
  isRTL: boolean;
  isLTR: boolean;
}

export function useDirection(): UseDirectionReturn {
  const { i18n } = useTranslation();
  const [direction, setDirection] = useState<Direction>(() => {
    return RTL_LANGUAGES.includes(i18n.language as SupportedLanguage) ? 'rtl' : 'ltr';
  });

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const isRTL = RTL_LANGUAGES.includes(lng as SupportedLanguage);
      const newDirection: Direction = isRTL ? 'rtl' : 'ltr';
      setDirection(newDirection);
      
      // Update document attributes
      document.documentElement.dir = newDirection;
      document.documentElement.lang = lng;
      
      // Update body class for potential CSS targeting
      document.body.classList.remove('ltr', 'rtl');
      document.body.classList.add(newDirection);
    };

    // Set initial direction
    handleLanguageChange(i18n.language);

    // Listen for language changes
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return {
    direction,
    isRTL: direction === 'rtl',
    isLTR: direction === 'ltr',
  };
}
