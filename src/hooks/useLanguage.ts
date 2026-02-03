import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
  LANGUAGE_CURRENCIES,
  AVAILABLE_CURRENCIES,
  CURRENCY_STORAGE_KEY,
  type SupportedLanguage,
  type CurrencyConfig,
} from '@/constants/i18n';
import { changeLanguage as loadAndChangeLanguage } from '@/i18n';
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
  availableCurrencies: CurrencyConfig[];
  changeCurrency: (currencyCode: string) => void;
  formatCurrency: (value: number) => string;
}

export function useLanguage(): UseLanguageReturn {
  const { t, i18n } = useTranslation();
  const { direction, isRTL, isLTR } = useDirection();

  const currentLanguage = (i18n.language || 'en') as SupportedLanguage;

  // Initialize currency from localStorage or language default
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored && AVAILABLE_CURRENCIES.find(c => c.code === stored)) {
      return stored;
    }
    return LANGUAGE_CURRENCIES[currentLanguage]?.code || 'EUR';
  });

  const languages: LanguageOption[] = Object.values(SUPPORTED_LANGUAGES).map((code) => ({
    code,
    name: LANGUAGE_NAMES[code],
    nativeName: t(`languages.${code}`),
    flag: LANGUAGE_FLAGS[code],
  }));

  const changeLanguage = useCallback(
    (language: SupportedLanguage) => {
      if (Object.values(SUPPORTED_LANGUAGES).includes(language)) {
        void loadAndChangeLanguage(language);
      }
    },
    [i18n]
  );

  // Change currency
  const changeCurrency = useCallback((code: string) => {
    const found = AVAILABLE_CURRENCIES.find(c => c.code === code);
    if (found) {
      setCurrencyCode(code);
      localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    }
  }, []);

  // Get currency config
  const currency = useMemo(() => {
    return AVAILABLE_CURRENCIES.find(c => c.code === currencyCode) || LANGUAGE_CURRENCIES[currentLanguage] || AVAILABLE_CURRENCIES[0];
  }, [currencyCode, currentLanguage]);

  // Format currency based on selected currency
  const formatCurrency = useCallback(
    (value: number): string => {
      const safeValue = Number.isFinite(value) ? value : 0;
      try {
        // Use no decimal places for DZD, MAD, TND
        const noDecimalCurrencies = ['DZD', 'MAD', 'TND'];
        const decimals = noDecimalCurrencies.includes(currency.code) ? 0 : 2;
        
        return new Intl.NumberFormat(currency.locale, {
          style: 'currency',
          currency: currency.code,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(safeValue);
      } catch {
        // Fallback if locale not supported
        return `${currency.symbol}${safeValue.toFixed(2)}`;
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
    availableCurrencies: AVAILABLE_CURRENCIES,
    changeCurrency,
    formatCurrency,
  };
}
