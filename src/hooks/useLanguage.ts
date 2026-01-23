import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
  LANGUAGE_CURRENCIES,
  type SupportedLanguage,
  type CurrencyConfig,
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
  // Currency
  currency: CurrencyConfig;
  formatCurrency: (value: number) => string;
}

export function useLanguage(): UseLanguageReturn {
  const { t, i18n } = useTranslation();
  const { direction, isRTL, isLTR } = useDirection();

  const currentLanguage = (i18n.language || 'en') as SupportedLanguage;

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

  // Get currency config for current language
  const currency = useMemo(() => {
    return LANGUAGE_CURRENCIES[currentLanguage] || LANGUAGE_CURRENCIES.en;
  }, [currentLanguage]);

  // Format currency based on current language
  const formatCurrency = useCallback(
    (value: number): string => {
      try {
        return new Intl.NumberFormat(currency.locale, {
          style: 'currency',
          currency: currency.code,
          minimumFractionDigits: currency.code === 'DZD' ? 0 : 2,
          maximumFractionDigits: currency.code === 'DZD' ? 0 : 2,
        }).format(value);
      } catch {
        // Fallback if locale not supported
        return `${currency.symbol}${value.toFixed(currency.code === 'DZD' ? 0 : 2)}`;
      }
    },
    [currency]
  );

  return {
    currentLanguage,
    direction,
    isRTL,
    isLTR,
    languages,
    changeLanguage,
    t,
    currency,
    formatCurrency,
  };
}
