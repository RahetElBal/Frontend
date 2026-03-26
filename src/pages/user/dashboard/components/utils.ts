import type { Appointment } from "@/pages/user/agenda/types";
import type { Client } from "@/pages/user/clients/types";
import { dashboardStatusColors } from "../../utils";

/**
 * Gets the local date string in YYYY-MM-DD format without timezone conversion.
 * This prevents issues with toISOString() shifting dates based on timezone.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

export function filterClientsByDateRange(
  clients: Client[],
  start: Date,
  end: Date,
): Client[] {
  return clients.filter((client) => {
    const createdDate = new Date(client.createdAt);
    return createdDate >= start && createdDate < end;
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

export function getTodaysNewClients(clients: Client[]): Client[] {
  const { start, end } = getTodayRange();
  return filterClientsByDateRange(clients, start, end);
}

export function getLastWeekNewClients(clients: Client[]): Client[] {
  const { start, end } = getLastWeekRange();
  return filterClientsByDateRange(clients, start, end);
}

export const statusColors = dashboardStatusColors;
