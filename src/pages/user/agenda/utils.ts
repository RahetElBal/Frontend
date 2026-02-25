import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { agendaStatusColors } from "../utils";
import { AppointmentStatus, type Appointment } from "@/types/entities";

export const localizer = momentLocalizer(moment);

export const statusColors = agendaStatusColors;

export type AppointmentDisplayStatus = AppointmentStatus;

export function isAppointmentLate(
  appointment: Appointment,
  referenceDate: Date = new Date(),
): boolean {
  if (appointment.status === AppointmentStatus.OVERDUE) {
    return true;
  }
  if (
    appointment.status === AppointmentStatus.CANCELLED ||
    appointment.status === AppointmentStatus.COMPLETED ||
    appointment.status === AppointmentStatus.NO_SHOW
  ) {
    return false;
  }
  const today = getLocalDateString(referenceDate);
  const currentTime = `${referenceDate
    .getHours()
    .toString()
    .padStart(2, "0")}:${referenceDate
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  const endTime = normalizeTime(appointment.endTime || appointment.startTime);
  const isPastDate = appointment.date < today;
  const isPastTime = appointment.date === today && endTime < currentTime;
  return isPastDate || isPastTime;
}

export function getAppointmentDisplayStatus(
  appointment: Appointment,
  referenceDate: Date = new Date(),
): AppointmentDisplayStatus {
  return isAppointmentLate(appointment, referenceDate)
    ? AppointmentStatus.OVERDUE
    : appointment.status;
}

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

export const DEFAULT_OPEN_TIME = "09:00";
export const DEFAULT_CLOSE_TIME = "19:00";
export const DEFAULT_SLOT_MINUTES = 30;

const dayKeys = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

type WorkingHoursEntry = {
  isOpen?: boolean;
  openTime?: string;
  closeTime?: string;
  breakStart?: string;
  breakEnd?: string;
  open?: string;
  close?: string;
  closed?: boolean;
};

export function getDayKeyFromDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  return dayKeys[dateObj.getDay()] || "monday";
}

const normalizeTimeValue = (
  value: string | undefined,
  fallback: string,
): string => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

export function getWorkingHoursForDate(
  settings: { workingHours?: Record<string, WorkingHoursEntry> } | undefined,
  date: string,
) {
  const dayKey = getDayKeyFromDate(date);
  const dayConfig = settings?.workingHours?.[dayKey];

  const isOpen =
    dayConfig?.isOpen !== undefined
      ? !!dayConfig.isOpen
      : !(dayConfig as WorkingHoursEntry | undefined)?.closed;

  const openTime = normalizeTimeValue(
    dayConfig?.openTime ?? dayConfig?.open,
    DEFAULT_OPEN_TIME,
  );
  const closeTime = normalizeTimeValue(
    dayConfig?.closeTime ?? dayConfig?.close,
    DEFAULT_CLOSE_TIME,
  );

  return {
    isOpen,
    openTime,
    closeTime,
    breakStart: normalizeTimeValue(dayConfig?.breakStart, ""),
    breakEnd: normalizeTimeValue(dayConfig?.breakEnd, ""),
  };
}

export function timeToMinutes(time: string): number {
  const normalized = normalizeTime(time);
  const [hours, minutes] = normalized.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const safeMinutes = Math.max(0, totalMinutes);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

export function addMinutesToTime(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}

export function getGreatestCommonDivisor(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}

export function resolveDynamicSlotMinutes(
  baseSlotMinutes: number,
  durationCandidates: number[],
): number {
  const safeBase =
    Number.isFinite(baseSlotMinutes) && baseSlotMinutes > 0
      ? Math.round(baseSlotMinutes)
      : DEFAULT_SLOT_MINUTES;
  let nextMinutes = safeBase;

  durationCandidates.forEach((candidate) => {
    if (!Number.isFinite(candidate) || candidate <= 0) return;
    nextMinutes = getGreatestCommonDivisor(nextMinutes, candidate);
  });

  return Math.max(5, Math.min(safeBase, nextMinutes));
}

export function buildTimeSlotsForHours(options: {
  openTime: string;
  closeTime: string;
  slotMinutes: number;
  breakStart?: string;
  breakEnd?: string;
}) {
  const slotMinutes = Math.max(5, Math.min(120, options.slotMinutes || 30));
  const openMinutes = timeToMinutes(options.openTime);
  const closeMinutes = timeToMinutes(options.closeTime);
  const breakStartMinutes = options.breakStart
    ? timeToMinutes(options.breakStart)
    : null;
  const breakEndMinutes = options.breakEnd
    ? timeToMinutes(options.breakEnd)
    : null;

  if (!Number.isFinite(openMinutes) || !Number.isFinite(closeMinutes)) {
    return { slots: [] as string[], blocked: new Set<string>() };
  }

  const slots: string[] = [];
  const blocked = new Set<string>();
  for (let minutes = openMinutes; minutes < closeMinutes; minutes += slotMinutes) {
    const time = minutesToTime(minutes);
    slots.push(time);

    if (
      breakStartMinutes !== null &&
      breakEndMinutes !== null &&
      minutes >= breakStartMinutes &&
      minutes < breakEndMinutes
    ) {
      blocked.add(time);
    }
  }

  return { slots, blocked };
}

export function isTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  if (aEnd <= aStart || bEnd <= bStart) return false;
  return aStart < bEnd && bStart < aEnd;
}

export function findConflictingAppointment(
  appointments: Appointment[],
  options: {
    date: string;
    startTime: string;
    endTime?: string;
    excludeId?: string | null;
    staffId?: string | null;
  },
): Appointment | null {
  const { date, startTime, endTime, excludeId, staffId } = options;
  const normalizedStart = normalizeTime(startTime);
  const normalizedEnd = endTime ? normalizeTime(endTime) : "";

  return (
    appointments.find((appointment) => {
      if (appointment.status === AppointmentStatus.CANCELLED) return false;
      if (excludeId && appointment.id === excludeId) return false;
      if (appointment.date !== date) return false;
      if (staffId && appointment.staffId !== staffId) return false;
      const appointmentStart = normalizeTime(appointment.startTime);
      const appointmentEnd = normalizeTime(appointment.endTime);

      if (normalizedEnd) {
        if (
          appointmentEnd === normalizedStart ||
          appointmentStart === normalizedEnd
        ) {
          return false;
        }
        return isTimeOverlap(
          normalizedStart,
          normalizedEnd,
          appointmentStart,
          appointmentEnd,
        );
      }

      return appointmentStart === normalizedStart;
    }) || null
  );
}

export const ALL_STAFF_ID = "all";

export function getNextSelectedStaffId(options: {
  currentId: string | null;
  userId?: string | null;
  viewMode: "day" | "month";
  canSelectStaff: boolean;
  allStaffId?: string;
}): string | null {
  const {
    currentId,
    userId,
    viewMode,
    canSelectStaff,
    allStaffId = ALL_STAFF_ID,
  } = options;
  if (!userId) return null;
  if (!currentId) {
    return viewMode === "month" && canSelectStaff ? allStaffId : userId;
  }
  if (!canSelectStaff) return currentId;
  if (viewMode === "month" && currentId === userId) return allStaffId;
  if (viewMode === "day" && currentId === allStaffId) return userId;
  return currentId;
}

export function buildStaffOptions(options: {
  user?: {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    email?: string | null;
  } | null;
  staffMembers: Array<{
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    email?: string | null;
  }>;
  includeAll?: boolean;
  allStaffId?: string;
  allLabel?: string;
}): Array<{ id: string; label: string }> {
  const {
    user,
    staffMembers,
    includeAll,
    allStaffId = ALL_STAFF_ID,
    allLabel = "All",
  } = options;
  const items: Array<{ id: string; label: string }> = [];

  if (includeAll) {
    items.push({ id: allStaffId, label: allLabel });
  }

  if (user?.id) {
    const label =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.name ||
      user.email ||
      "Me";
    items.push({ id: user.id, label });
  }

  const deduped = new Set(items.map((option) => option.id));
  staffMembers.forEach((staff) => {
    if (deduped.has(staff.id)) return;
    const label =
      `${staff.firstName || ""} ${staff.lastName || ""}`.trim() ||
      staff.name ||
      staff.email ||
      "Staff";
    items.push({ id: staff.id, label });
    deduped.add(staff.id);
  });

  return items;
}

export const isOptimisticAppointmentId = (appointmentId: string) =>
  appointmentId.startsWith("local-");

export const getAppointmentMatchKey = (appointment: Appointment) =>
  [
    appointment.date,
    normalizeTime(appointment.startTime),
    appointment.clientId,
    appointment.serviceId,
    appointment.staffId || "",
  ].join("|");

export function mergeAppointments(options: {
  current: Appointment[];
  incoming: Appointment[];
  deletedIds: Set<string>;
  isOptimisticId: (id: string) => boolean;
  getMatchKey: (appointment: Appointment) => string;
}): Appointment[] {
  const { current, incoming, deletedIds, isOptimisticId, getMatchKey } =
    options;
  const filteredIncoming = incoming.filter(
    (appointment) => !deletedIds.has(appointment.id),
  );
  const incomingById = new Map(
    filteredIncoming.map((appointment) => [appointment.id, appointment]),
  );
  const incomingByKey = new Map(
    filteredIncoming.map((appointment) => [getMatchKey(appointment), appointment]),
  );
  const currentById = new Map(
    current.map((appointment) => [appointment.id, appointment]),
  );

  const merged = filteredIncoming.map((incomingItem) => {
    const existing = currentById.get(incomingItem.id);
    if (!existing) return incomingItem;
    const existingUpdatedAt = Date.parse(existing.updatedAt || "");
    const incomingUpdatedAt = Date.parse(incomingItem.updatedAt || "");
    if (Number.isFinite(existingUpdatedAt) && Number.isFinite(incomingUpdatedAt)) {
      return existingUpdatedAt >= incomingUpdatedAt ? existing : incomingItem;
    }
    return Number.isFinite(existingUpdatedAt) ? existing : incomingItem;
  });

  current.forEach((appointment) => {
    if (deletedIds.has(appointment.id)) return;
    if (incomingById.has(appointment.id)) return;
    if (isOptimisticId(appointment.id)) {
      const match = incomingByKey.get(getMatchKey(appointment));
      if (match) return;
    }
    merged.push(appointment);
  });

  return merged;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

export function appointmentToCalendarEvent(
  appointment: Appointment,
): CalendarEvent {
  const startDateTime = new Date(
    `${appointment.date}T${appointment.startTime}`,
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
  const baseDate = date || getLocalDateString();
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

export function isAppointmentOverdue(
  appointment: Appointment,
  referenceDate: Date = new Date(),
): boolean {
  if (appointment.status === AppointmentStatus.CANCELLED || appointment.paid) {
    return false;
  }
  if (appointment.status === AppointmentStatus.OVERDUE) {
    return true;
  }
  const today = getLocalDateString(referenceDate);
  const currentTime = `${referenceDate
    .getHours()
    .toString()
    .padStart(2, "0")}:${referenceDate
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  const isPastDate = appointment.date < today;
  const isPastTime =
    appointment.date === today && appointment.endTime < currentTime;
  return isPastDate || isPastTime;
}
