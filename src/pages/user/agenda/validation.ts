import { z } from "zod";
import { requiredString, optionalString } from "@/common/validator/zodI18n";

export const appointmentFormSchema = z
  .object({
    clientId: optionalString(),
    serviceId: requiredString("Service"),
    date: requiredString("Date"),
    startTime: requiredString("Heure"),
    notes: optionalString(),
    salonId: z.string().uuid().optional(),
    walkInEnabled: z.boolean().optional(),
    walkInName: optionalString(),
    walkInPhone: optionalString(),
    price: optionalString(),
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
