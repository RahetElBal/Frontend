import { z } from "zod";
import {
  requiredString,
  optionalString,
  optionalEmailField,
} from "@/common/validator/zodI18n";
import { isValidPhoneForAllowedCountries } from "@/common/phone";

export const appointmentFormSchema = z
  .object({
    clientId: optionalString(),
    serviceId: requiredString("Service"),
    date: requiredString("Date"),
    startTime: requiredString("Heure"),
    notes: optionalString(),
    salonId: z.string().uuid().optional(),
    staffId: optionalString(),
    walkInEnabled: z.boolean().optional(),
    walkInName: optionalString(),
    walkInPhone: optionalString().refine(
      (val) => !val || isValidPhoneForAllowedCountries(val),
      {
        message: "validation.custom.phoneInvalid",
      }
    ),
    walkInEmail: optionalEmailField(),
    price: optionalString(),
    discount: optionalString(),
    priceOverrideEnabled: z.boolean().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.walkInEnabled) {
      if (!values.walkInPhone?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "validation.requiredField",
          path: ["walkInPhone"],
        });
      }
    } else if (!values.clientId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "agenda.selectClient",
        path: ["clientId"],
      });
    }
  });

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;
