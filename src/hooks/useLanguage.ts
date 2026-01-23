import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
  type SupportedLanguage,
} from '@/constants/i18n';
import { useDirection, type Direction } from './useDirection';

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

interface UseLanguageReturn {
  currentLanguage: SupportedLanguage;
  direction: Direction;
  isRTL: boolean;
  isLTR: boolean;
  languages: LanguageOption[];
  changeLanguage: (language: SupportedLanguage) => void;
  t: ReturnType<typeof useTranslation>['t'];
}

export function useLanguage(): UseLanguageReturn {
  const { t, i18n } = useTranslation();
  const { direction, isRTL, isLTR } = useDirection();

  const currentLanguage = i18n.language as SupportedLanguage;

  const languages: LanguageOption[] = Object.values(SUPPORTED_LANGUAGES).map((code) => ({
    code,
    name: LANGUAGE_NAMES[code],
    nativeName: t(`languages.${code}`),
    flag: LANGUAGE_FLAGS[code],
  }));

  const changeLanguage = useCallback(
    (language: SupportedLanguage) => {
      if (Object.values(SUPPORTED_LANGUAGES).includes(language)) {
        i18n.changeLanguage(language);
      }
    },
    [i18n]
  );

  return {
    currentLanguage,
    direction,
    isRTL,
    isLTR,
    languages,
    changeLanguage,
    t,
  };
}
