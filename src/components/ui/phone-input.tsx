import * as React from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ALLOWED_PHONE_COUNTRIES,
  PHONE_COUNTRY_CONFIG,
  clampNationalNumber,
  getAllowedPhoneCountry,
  getCountryCallingCodeFor,
  sanitizePhoneInput,
  toDisplayNationalFromE164,
  toE164FromNational,
  type AllowedPhoneCountry,
} from "@/common/phone";

interface PhoneNumberInputProps {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  defaultCountry?: AllowedPhoneCountry;
}

const normalizeInternationalPrefix = (value: string) =>
  value.startsWith("00") ? `+${value.slice(2)}` : value;

export function PhoneNumberInput({
  id,
  value,
  onChange,
  onBlur,
  className,
  disabled,
  placeholder,
  defaultCountry = "DZ",
}: PhoneNumberInputProps) {
  const [country, setCountry] =
    React.useState<AllowedPhoneCountry>(defaultCountry);
  const [national, setNational] = React.useState("");

  React.useEffect(() => {
    if (!value) {
      setNational("");
      return;
    }

    const parsed = parsePhoneNumberFromString(value);
    const parsedCountry = parsed?.country
      ? getAllowedPhoneCountry(parsed.country)
      : undefined;

    if (parsed && parsedCountry) {
      setCountry(parsedCountry);
      setNational(
        clampNationalNumber(
          parsedCountry,
          toDisplayNationalFromE164(parsedCountry, parsed.number),
        ),
      );
      return;
    }

    const sanitized = sanitizePhoneInput(value);
    if (!sanitized) {
      setNational("");
      return;
    }

    const normalized = normalizeInternationalPrefix(sanitized);
    if (normalized.startsWith("+")) {
      const parsedInternational = parsePhoneNumberFromString(normalized);
      const parsedInternationalCountry = parsedInternational?.country
        ? getAllowedPhoneCountry(parsedInternational.country)
        : undefined;
      if (parsedInternational && parsedInternationalCountry) {
        setCountry(parsedInternationalCountry);
        setNational(
          clampNationalNumber(
            parsedInternationalCountry,
            toDisplayNationalFromE164(
              parsedInternationalCountry,
              parsedInternational.number,
            ),
          ),
        );
        return;
      }
    }

    const digitsOnly = normalized.replace(/\D/g, "");
    const callingCode = getCountryCallingCodeFor(country).replace("+", "");
    const nationalDigits = digitsOnly.startsWith(callingCode)
      ? digitsOnly.slice(callingCode.length)
      : digitsOnly;
    setNational(clampNationalNumber(country, nationalDigits));
  }, [value]);

  const handleCountryChange = (next: AllowedPhoneCountry) => {
    setCountry(next);
    const clamped = clampNationalNumber(next, national);
    setNational(clamped);
    onChange?.(clamped ? toE164FromNational(next, clamped) : "");
  };

  const handleNationalChange = (rawValue: string) => {
    const sanitized = sanitizePhoneInput(rawValue);
    if (!sanitized) {
      setNational("");
      onChange?.("");
      return;
    }

    const normalized = normalizeInternationalPrefix(sanitized);
    if (normalized.startsWith("+")) {
      const parsed = parsePhoneNumberFromString(normalized);
      const parsedCountry = parsed?.country
        ? getAllowedPhoneCountry(parsed.country)
        : undefined;
      if (parsed && parsedCountry) {
        setCountry(parsedCountry);
        const display = clampNationalNumber(
          parsedCountry,
          toDisplayNationalFromE164(parsedCountry, parsed.number),
        );
        setNational(display);
        onChange?.(parsed.number);
        return;
      }
    }

    const digitsOnly = normalized.replace(/\D/g, "");
    const clamped = clampNationalNumber(country, digitsOnly);
    setNational(clamped);
    onChange?.(clamped ? toE164FromNational(country, clamped) : "");
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (national) {
      const e164 = toE164FromNational(country, national);
      const display = clampNationalNumber(
        country,
        toDisplayNationalFromE164(country, e164),
      );
      setNational(display);
      onChange?.(display ? toE164FromNational(country, display) : "");
    }
    onBlur?.(event);
  };

  return (
    <div className={cn("phone-input w-full", className)}>
      <select
        value={country}
        onChange={(event) =>
          handleCountryChange(event.target.value as AllowedPhoneCountry)
        }
        className={cn(
          "h-10 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        disabled={disabled}
      >
        {ALLOWED_PHONE_COUNTRIES.map((countryCode) => (
          <option key={countryCode} value={countryCode}>
            {PHONE_COUNTRY_CONFIG[countryCode].label}
          </option>
        ))}
      </select>

      <Input
        value={getCountryCallingCodeFor(country)}
        readOnly
        aria-hidden="true"
        tabIndex={-1}
        className="w-20 text-center"
      />

      <Input
        id={id}
        value={national}
        onChange={(event) => handleNationalChange(event.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        pattern="\\d*"
        maxLength={PHONE_COUNTRY_CONFIG[country].displayLength}
        className="flex-1 min-w-0"
      />
    </div>
  );
}
