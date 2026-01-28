import { z } from "zod";

export const createUserFormSchema = (
  t: (key: string, options?: Record<string, string>) => string,
) =>
  z.object({
    name: z
      .string()
      .min(1, t("validation.required", { field: t("fields.name") })),
    email: z
      .string()
      .min(1, t("validation.required", { field: t("fields.email") }))
      .email(t("validation.email")),
    phone: z
      .string()
      .min(1, t("validation.required", { field: t("fields.phone") })),
    role: z.enum(["user", "admin"] as const),
    salonId: z.string().optional(),
    managedById: z.string().optional(),
  });

export type UserFormData = z.infer<ReturnType<typeof createUserFormSchema>>;
