import { type Appointment, type Client } from "@/types/entities";
import { dashboardStatusColors } from "../utils";

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
