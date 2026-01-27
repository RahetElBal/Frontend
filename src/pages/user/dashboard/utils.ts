import { AppointmentStatus, type Appointment } from "@/types/entities";

export function getTodayRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { start: today, end: tomorrow };
}

export function getLastWeekRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekEnd = new Date(lastWeek);
  lastWeekEnd.setDate(lastWeekEnd.getDate() + 1);
  return { start: lastWeek, end: lastWeekEnd };
}

export function filterAppointmentsByDateRange(
  appointments: Appointment[],
  start: Date,
  end: Date,
): Appointment[] {
  return appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    return aptDate >= start && aptDate < end;
  });
}

export function getTodaysAppointments(
  appointments: Appointment[],
): Appointment[] {
  const { start, end } = getTodayRange();
  return filterAppointmentsByDateRange(appointments, start, end);
}

export function getLastWeekAppointments(
  appointments: Appointment[],
): Appointment[] {
  const { start, end } = getLastWeekRange();
  return filterAppointmentsByDateRange(appointments, start, end);
}

export const statusColors: Record<
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
