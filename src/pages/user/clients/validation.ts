import { z } from "zod";
import {
  requiredString,
  optionalString,
  optionalEmailField,
} from "@/common/validator/zodI18n";

export const clientFormSchema = z.object({
  firstName: requiredString("Prénom"),
  lastName: requiredString("Nom"),
  email: optionalEmailField(),
  phone: optionalString(),
  salonId: z.string().uuid().optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
