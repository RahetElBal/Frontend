import type { DayOfWeek, TimeOffType } from "@/types/entities";

export interface CreateScheduleDto {
  salonId?: string;
  staffId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  isWorking: boolean;
}

export interface CreateTimeOffDto {
  salonId?: string;
  staffId: string;
  type: TimeOffType;
  startDate: string;
  endDate: string;
  reason?: string;
  isHalfDay: boolean;
  halfDayPeriod?: "morning" | "afternoon";
}
