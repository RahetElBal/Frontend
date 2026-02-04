import { getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";

export const ALLOWED_PHONE_COUNTRIES = ["DZ", "FR", "ES"] as const;
export type AllowedPhoneCountry = (typeof ALLOWED_PHONE_COUNTRIES)[number];

export const PHONE_COUNTRY_CONFIG: Record<
  AllowedPhoneCountry,
  {
    label: string;
    nationalLength: number;
    format: number[];
    stripLeadingZero: boolean;
  }
> = {
  DZ: {
    label: "Algeria",
    nationalLength: 9,
    format: [1, 2, 2, 2, 2],
    stripLeadingZero: true,
  },
  FR: {
    label: "France",
    nationalLength: 9,
    format: [1, 2, 2, 2, 2],
    stripLeadingZero: true,
  },
  ES: {
    label: "Spain",
    nationalLength: 9,
    format: [3, 3, 3],
    stripLeadingZero: false,
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
  return digits.slice(0, config.nationalLength);
};

export const normalizeNationalDigits = (
  country: AllowedPhoneCountry,
  digits: string
) => {
  const config = PHONE_COUNTRY_CONFIG[country];
  let normalized = digits.replace(/\D/g, "");
  if (config.stripLeadingZero) {
    normalized = normalized.replace(/^0+/, "");
  }
  return normalized.slice(0, config.nationalLength);
};

export const getCountryCallingCodeFor = (country: AllowedPhoneCountry) =>
  `+${getCountryCallingCode(country)}`;

export const toE164FromNational = (
  country: AllowedPhoneCountry,
  nationalDigits: string
) => {
  const normalized = normalizeNationalDigits(country, nationalDigits);
  if (!normalized) return "";
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
  return clampNationalNumber(country, parsed.nationalNumber.toString());
};

export const formatNationalNumber = (
  country: AllowedPhoneCountry,
  digits: string
) => {
  const config = PHONE_COUNTRY_CONFIG[country];
  const clean = digits.replace(/\D/g, "").slice(0, config.nationalLength);
  if (!clean) return "";

  const parts: string[] = [];
  let index = 0;
  for (const size of config.format) {
    if (index >= clean.length) break;
    parts.push(clean.slice(index, index + size));
    index += size;
  }
  if (index < clean.length) {
    parts.push(clean.slice(index));
  }
  return parts.join(" ");
};

export const getNationalPlaceholder = (country: AllowedPhoneCountry) => {
  const config = PHONE_COUNTRY_CONFIG[country];
  return config.format.map((size) => "X".repeat(size)).join(" ");
};

export const getNationalMaxLength = (country: AllowedPhoneCountry) => {
  const config = PHONE_COUNTRY_CONFIG[country];
  const spaceCount = Math.max(0, config.format.length - 1);
  return config.nationalLength + spaceCount;
};

export const isValidPhoneForAllowedCountries = (value?: string) => {
  const sanitized = sanitizePhoneInput(value);
  if (!sanitized) return false;
  const parsed = parsePhoneNumberFromString(sanitized);
  if (!parsed || !parsed.isValid()) return false;
  return !!getAllowedPhoneCountry(parsed.country);
};
