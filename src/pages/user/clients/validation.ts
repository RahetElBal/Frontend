import { z } from "zod";
import {
  requiredString,
  optionalString,
  optionalEmailField,
} from "@/common/validator/zodI18n";
import { isValidPhoneForAllowedCountries } from "@/common/phone";

export const clientFormSchema = z.object({
  firstName: requiredString("Prénom"),
  lastName: requiredString("Nom"),
  email: optionalEmailField(),
  phone: optionalString().refine(
    (val) => !val || isValidPhoneForAllowedCountries(val),
    {
      message: "validation.custom.phoneInvalid",
    },
  ),
  salonId: z.string().uuid().optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
