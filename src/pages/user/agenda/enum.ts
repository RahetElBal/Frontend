export const AppointmentStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];
