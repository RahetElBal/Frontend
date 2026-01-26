import { z } from "zod";
import {
  requiredString,
  emailField,
  optionalString,
} from "@/common/validator/zodI18n";

export const userFormSchema = z
  .object({
    name: requiredString("Nom"),
    email: emailField("Email"),
    role: z.enum(["user", "admin"] as const),
    salonId: optionalString(),
    managedById: optionalString(),
  })
  .refine(
    (data) => {
      if (data.role === "user") {
        return !!data.salonId && data.salonId.length > 0;
      }
      return true;
    },
    {
      message: "Un salon est requis pour les utilisateurs (staff)",
      path: ["salonId"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "user") {
        return !!data.managedById && data.managedById.length > 0;
      }
      return true;
    },
    {
      message: "Un administrateur est requis pour les utilisateurs (staff)",
      path: ["managedById"],
    },
  );

export type UserFormData = z.infer<typeof userFormSchema>;
