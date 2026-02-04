import { parsePhoneNumberFromString } from "libphonenumber-js";

export type DefaultCountry = "DZ" | "FR" | "ES" | "US" | "GB" | "DE" | "IT";

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
  defaultCountry?: DefaultCountry
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
