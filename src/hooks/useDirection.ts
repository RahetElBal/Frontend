import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES, type SupportedLanguage } from '@/i18n';

export type Direction = 'ltr' | 'rtl';

interface UseDirectionReturn {
  direction: Direction;
  isRTL: boolean;
  isLTR: boolean;
}

const getDirection = (language: string): Direction => {
  const isRTL = RTL_LANGUAGES.includes(language as SupportedLanguage);
  if (isRTL) {
    return 'rtl';
  }

  return 'ltr';
};

export function useDirection(): UseDirectionReturn {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language;
  const direction = getDirection(language);
  const isRTL = direction === 'rtl';
  const isLTR = direction === 'ltr';

  return {
    direction,
    isRTL,
    isLTR,
  };
}
