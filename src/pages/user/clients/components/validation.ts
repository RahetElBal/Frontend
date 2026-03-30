import { z } from "zod";
import { requiredString, emailField } from "@/common/validator/zodI18n";
import { isValidPhoneForAllowedCountries } from "@/common/phone";

export const clientFormSchema = z.object({
  firstName: requiredString("Prenom"),
  lastName: requiredString("Nom"),
  email: emailField(),
  phone: requiredString("Telephone").refine(
    (val) => isValidPhoneForAllowedCountries(val),
    {
      message: "validation.custom.phoneInvalid",
    },
  ),
  isMarried: z.boolean().optional(),
  salonId: z.string().uuid().optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
