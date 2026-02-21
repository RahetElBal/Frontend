import { z } from "zod";
import { isValidPhoneForAllowedCountries } from "@/common/phone";

export const createSalonFormSchema = (
  t: (key: string, options?: Record<string, string>) => string,
) =>
  z.object({
    name: z
      .string()
      .min(1, t("validation.required", { field: t("fields.name") })),
    address: z.string().optional(),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || isValidPhoneForAllowedCountries(val), {
        message: t("validation.custom.phoneInvalid"),
      }),
    email: z
      .string()
      .optional()
      .refine(
        (val) => !val || z.string().email().safeParse(val).success,
        t("validation.email"),
      ),
    logo: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          z.string().url().safeParse(val).success ||
          val.startsWith("/"),
        t("validation.url"),
      ),
    planTier: z.enum(["standard", "pro"]).optional(),
  });

export type SalonFormData = z.infer<ReturnType<typeof createSalonFormSchema>>;
