import * as React from "react";
import PhoneInput from "react-phone-number-input";
import type { Props as PhoneInputProps } from "react-phone-number-input";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sanitizePhoneInput } from "@/common/phone";

type PhoneNumberInputProps = Omit<
  PhoneInputProps<React.InputHTMLAttributes<HTMLInputElement>>,
  "value" | "onChange" | "inputComponent"
> & {
  value?: string;
  onChange?: (value: string) => void;
};

const PhoneNumberTextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, onChange, ...props }, ref) => {
  const sanitizedValue =
    typeof props.value === "string"
      ? sanitizePhoneInput(props.value)
      : props.value;

  return (
    <Input
      {...props}
      ref={ref}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      pattern="\\+?\\d*"
      className={cn("PhoneInputInput", className)}
      value={sanitizedValue}
      onChange={(event) => {
        const sanitized = sanitizePhoneInput(event.target.value);
        if (sanitized !== event.target.value) {
          event.target.value = sanitized;
        }
        onChange?.(event);
      }}
    />
  );
});

PhoneNumberTextInput.displayName = "PhoneNumberTextInput";

export function PhoneNumberInput({
  value,
  onChange,
  className,
  defaultCountry,
  ...props
}: PhoneNumberInputProps) {
  return (
    <PhoneInput
      {...props}
      international
      countryCallingCodeEditable={false}
      focusInputOnCountrySelection
      defaultCountry={defaultCountry ?? "DZ"}
      className={cn("phone-input", className)}
      value={value || ""}
      onChange={(nextValue) => onChange?.(nextValue ?? "")}
      inputComponent={PhoneNumberTextInput}
    />
  );
}
