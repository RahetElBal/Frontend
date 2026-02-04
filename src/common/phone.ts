import { getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";

export const ALLOWED_PHONE_COUNTRIES = ["DZ", "FR", "ES"] as const;
export type AllowedPhoneCountry = (typeof ALLOWED_PHONE_COUNTRIES)[number];

export const PHONE_COUNTRY_CONFIG: Record<
  AllowedPhoneCountry,
  {
    label: string;
    displayLength: number;
    addLeadingZeroOnDisplay: boolean;
    dropLeadingZeroOnE164: boolean;
  }
> = {
  DZ: {
    label: "Algeria",
    displayLength: 10,
    addLeadingZeroOnDisplay: true,
    dropLeadingZeroOnE164: true,
  },
  FR: {
    label: "France",
    displayLength: 10,
    addLeadingZeroOnDisplay: true,
    dropLeadingZeroOnE164: true,
  },
  ES: {
    label: "Spain",
    displayLength: 9,
    addLeadingZeroOnDisplay: false,
    dropLeadingZeroOnE164: false,
  },
};

export const PHONE_INPUT_REGEX = /^\+?\d+$/;

export const sanitizePhoneInput = (value?: string): string => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  let result = "";
  for (const char of trimmed) {
    if (char >= "0" && char <= "9") {
      result += char;
      continue;
    }
    if (char === "+" && result.length === 0) {
      result = "+";
    }
  }

  return result;
};

const normalizeInternationalPrefix = (value: string) =>
  value.startsWith("00") ? `+${value.slice(2)}` : value;

export const normalizePhone = (
  value?: string,
  defaultCountry?: AllowedPhoneCountry
): string => {
  const sanitized = sanitizePhoneInput(value);
  if (!sanitized || !/\d/.test(sanitized)) return "";

  const normalizedInput = normalizeInternationalPrefix(sanitized);
  const parsed = parsePhoneNumberFromString(
    normalizedInput,
    normalizedInput.startsWith("+") ? undefined : defaultCountry
  );

  if (parsed && parsed.isValid()) {
    return parsed.number; // E.164
  }

  return normalizedInput;
};

export const getAllowedPhoneCountry = (
  country?: string
): AllowedPhoneCountry | undefined =>
  ALLOWED_PHONE_COUNTRIES.includes(country as AllowedPhoneCountry)
    ? (country as AllowedPhoneCountry)
    : undefined;

export const clampNationalNumber = (
  country: AllowedPhoneCountry,
  digits: string
) => {
  const config = PHONE_COUNTRY_CONFIG[country];
  return digits.slice(0, config.displayLength);
};

export const getCountryCallingCodeFor = (country: AllowedPhoneCountry) =>
  `+${getCountryCallingCode(country)}`;

export const toE164FromNational = (
  country: AllowedPhoneCountry,
  nationalDigits: string
) => {
  if (!nationalDigits) return "";
  const config = PHONE_COUNTRY_CONFIG[country];
  let normalized = nationalDigits;
  if (
    config.dropLeadingZeroOnE164 &&
    normalized.length === config.displayLength &&
    normalized.startsWith("0")
  ) {
    normalized = normalized.slice(1);
  }
  const callingCode = getCountryCallingCode(country);
  return `+${callingCode}${normalized}`;
};

export const toDisplayNationalFromE164 = (
  country: AllowedPhoneCountry,
  e164?: string
) => {
  if (!e164) return "";
  const parsed = parsePhoneNumberFromString(e164);
  if (!parsed) return "";
  let national = parsed.nationalNumber.toString();
  const config = PHONE_COUNTRY_CONFIG[country];
  if (
    config.addLeadingZeroOnDisplay &&
    national.length === config.displayLength - 1
  ) {
    national = `0${national}`;
  }
  return national;
};

export const isValidPhoneForAllowedCountries = (value?: string) => {
  const sanitized = sanitizePhoneInput(value);
  if (!sanitized) return false;
  const parsed = parsePhoneNumberFromString(sanitized);
  if (!parsed || !parsed.isValid()) return false;
  return !!getAllowedPhoneCountry(parsed.country);
};
