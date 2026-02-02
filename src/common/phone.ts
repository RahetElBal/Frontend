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

const stripToDigits = (value: string) => value.replace(/[^\d]/g, "");

export const normalizePhone = (
  value?: string,
  defaultCountry: DefaultCountry = getDefaultCountry()
): string => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (parsed && parsed.isValid()) {
    if (parsed.country === "DZ") {
      const national = parsed.nationalNumber;
      return national.startsWith("0") ? national : `0${national}`;
    }
    return parsed.number; // E.164 for non-DZ
  }

  const digits = stripToDigits(trimmed);
  if (defaultCountry === "DZ") {
    if (digits.length === 9) return `0${digits}`;
    if (digits.length === 10 && digits.startsWith("0")) return digits;
  }

  return digits || trimmed;
};
