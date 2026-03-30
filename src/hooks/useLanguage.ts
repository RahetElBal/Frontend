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
import { useAuthContext } from '@/contexts/AuthProvider';

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
  isCurrencyLocked: boolean;
}

const supportedLanguages = Object.values(SUPPORTED_LANGUAGES);
const noDecimalCurrencies = ['DZD', 'MAD', 'TND'];

export function useLanguage(): UseLanguageReturn {
  const { t, i18n } = useTranslation();
  const { direction, isRTL, isLTR } = useDirection();
  const { user } = useAuthContext();

  const currentLanguage = (i18n.language || 'en') as SupportedLanguage;
  const salonCurrencyCode = useMemo(() => {
    const value = user?.salon?.settings?.currency;
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim().toUpperCase();
    if (!normalized) {
      return null;
    }

    return AVAILABLE_CURRENCIES.some((currency) => currency.code === normalized)
      ? normalized
      : null;
  }, [user?.salon?.settings?.currency]);

  // Initialize currency from localStorage or language default
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored && AVAILABLE_CURRENCIES.find((currency) => currency.code === stored)) {
      return stored;
    }

    return LANGUAGE_CURRENCIES[currentLanguage]?.code || 'EUR';
  });

  const languages = useMemo<LanguageOption[]>(() => {
    return supportedLanguages.map((code) => ({
      code,
      name: LANGUAGE_NAMES[code],
      nativeName: t(`languages.${code}`),
      flag: LANGUAGE_FLAGS[code],
    }));
  }, [t]);

  const changeLanguage = useCallback(
    (language: SupportedLanguage) => {
      if (supportedLanguages.includes(language)) {
        void loadAndChangeLanguage(language);
      }
    },
    []
  );

  const changeCurrency = useCallback((code: string) => {
    if (salonCurrencyCode) {
      return;
    }

    const found = AVAILABLE_CURRENCIES.find((currency) => currency.code === code);
    if (found) {
      setCurrencyCode(code);
      localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    }
  }, [salonCurrencyCode]);

  const currency = useMemo(() => {
    if (salonCurrencyCode) {
      const salonCurrency = AVAILABLE_CURRENCIES.find(
        (availableCurrency) => availableCurrency.code === salonCurrencyCode
      );

      if (salonCurrency) {
        return salonCurrency;
      }
    }

    const matchedCurrency = AVAILABLE_CURRENCIES.find(
      (availableCurrency) => availableCurrency.code === currencyCode
    );
    if (matchedCurrency) {
      return matchedCurrency;
    }

    return LANGUAGE_CURRENCIES[currentLanguage] || AVAILABLE_CURRENCIES[0];
  }, [currencyCode, currentLanguage, salonCurrencyCode]);

  const formatCurrency = useCallback(
    (value: number): string => {
      const safeValue = Number.isFinite(value) ? value : 0;
      try {
        let decimals = 2;
        if (noDecimalCurrencies.includes(currency.code)) {
          decimals = 0;
        }

        return new Intl.NumberFormat(currency.locale, {
          style: 'currency',
          currency: currency.code,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(safeValue);
      } catch {
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
    isCurrencyLocked: !!salonCurrencyCode,
  };
}
