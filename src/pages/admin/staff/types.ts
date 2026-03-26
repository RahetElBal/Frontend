import type { BaseEntity } from "@/constants/types";
import type { User } from "@/pages/admin/users/types";
import type {
  DayOfWeek,
  HalfDayPeriod,
  TimeOffStatus,
  TimeOffType,
} from "./enum";

export interface StaffSchedule extends BaseEntity {
  salonId: string;
  staffId: string;
  staff?: User;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  isWorking: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface StaffTimeOff extends BaseEntity {
  salonId: string;
  staffId: string;
  staff?: User;
  type: TimeOffType;
  status: TimeOffStatus;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDayPeriod?: HalfDayPeriod;
  reason?: string;
  approvedById?: string;
  approvedBy?: User;
  approvedAt?: string;
  approverNotes?: string;
}

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
  halfDayPeriod?: HalfDayPeriod;
}
