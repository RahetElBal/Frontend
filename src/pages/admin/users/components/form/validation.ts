import { z } from "zod";
import {
  requiredString,
  emailField,
  optionalString,
} from "@/common/validator/zodI18n";

export const userFormSchema = z.object({
  name: requiredString("Nom"),
  email: emailField("Email"),
  phone: requiredString("Numéro de téléphone"),
  role: z.enum(["user", "admin"] as const),
  salonId: optionalString(),
  managedById: optionalString(),
});

export type UserFormData = z.infer<typeof userFormSchema>;
