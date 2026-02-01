import type { TFunction } from "i18next";
import { AppointmentStatus } from "@/types/entities";
import { parseValidationMsg } from "@/common/validator/zodI18n";

export const getValidationErrorMessage = (
  t: TFunction,
  message?: string,
): string | undefined => {
  if (!message) return undefined;
  if (message.startsWith("validation.") || message.startsWith("errors.")) {
    const { key, params } = parseValidationMsg(message);
    return t(key, params);
  }
  return message;
};

export const agendaStatusColors: Record<
  string,
  "default" | "success" | "warning" | "info" | "error"
> = {
  [AppointmentStatus.CONFIRMED]: "success",
  [AppointmentStatus.PENDING]: "warning",
  [AppointmentStatus.IN_PROGRESS]: "info",
  [AppointmentStatus.COMPLETED]: "default",
  [AppointmentStatus.CANCELLED]: "error",
  [AppointmentStatus.NO_SHOW]: "error",
};

export const dashboardStatusColors: Record<
  string,
  "default" | "success" | "warning" | "info"
> = {
  [AppointmentStatus.CONFIRMED]: "success",
  [AppointmentStatus.PENDING]: "warning",
  [AppointmentStatus.IN_PROGRESS]: "info",
  [AppointmentStatus.COMPLETED]: "default",
  [AppointmentStatus.CANCELLED]: "default",
  [AppointmentStatus.NO_SHOW]: "default",
};
