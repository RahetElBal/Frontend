import { z } from "zod";
import { requiredString, optionalString } from "@/common/validator/zodI18n";

export const appointmentFormSchema = z.object({
  clientId: requiredString("Client"),
  serviceId: requiredString("Service"),
  date: requiredString("Date"),
  startTime: requiredString("Heure"),
  notes: optionalString(),
  salonId: z.string().uuid().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;
