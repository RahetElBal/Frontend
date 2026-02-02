import type { Appointment } from "@/types/entities";
import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { agendaStatusColors } from "../utils";

export const localizer = momentLocalizer(moment);

export const statusColors = agendaStatusColors;

export const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

export function appointmentToCalendarEvent(
  appointment: Appointment
): CalendarEvent {
  const startDateTime = new Date(
    `${appointment.date}T${appointment.startTime}`
  );
  const endDateTime = new Date(`${appointment.date}T${appointment.endTime}`);

  return {
    id: appointment.id,
    title: appointment.client
      ? `${appointment.client.firstName} ${appointment.client.lastName} - ${
          appointment.service?.name || ""
        }`
      : appointment.service?.name || "Appointment",
    start: startDateTime,
    end: endDateTime,
    resource: appointment,
  };
}

export function timeToDate(time: string, date?: string): Date {
  const baseDate = date || new Date().toISOString().split("T")[0];
  return new Date(`${baseDate}T${time}`);
}

export function normalizeTime(value?: string): string {
  if (!value) return "";
  const parts = value.split(":");
  if (parts.length < 2) return value;
  const hours = parts[0].padStart(2, "0");
  const minutes = parts[1].padStart(2, "0");
  return `${hours}:${minutes}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeExtractArray<T>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.items && Array.isArray(data.items)) return data.items;
  return [];
}
export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return `${hours.toString().padStart(2, "0")}:${minutes >= 30 ? "30" : "00"}`;
}
