import { parsePhoneNumberFromString } from "libphonenumber-js";

type DefaultCountry = "DZ" | "FR" | "ES" | "US" | "GB" | "DE" | "IT";

const supportedCountries: DefaultCountry[] = [
  "DZ",
  "FR",
  "ES",
  "US",
  "GB",
  "DE",
  "IT",
];

const getDefaultCountry = (): DefaultCountry => {
  if (typeof navigator === "undefined") return "DZ";
  const locale =
    Intl.DateTimeFormat().resolvedOptions().locale || navigator.language;
  const parts = locale.split("-");
  const region = (parts[1] || "DZ").toUpperCase() as DefaultCountry;
  return supportedCountries.includes(region) ? region : "DZ";
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
  defaultCountry: DefaultCountry = getDefaultCountry()
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
