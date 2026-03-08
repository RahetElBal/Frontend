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
  birthDate: z
    .string()
    .optional()
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "validation.date.invalid",
    }),
  isMarried: z.boolean().optional(),
  salonId: z.string().uuid().optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
