export const DayOfWeek = {
  MONDAY: "monday",
  TUESDAY: "tuesday",
  WEDNESDAY: "wednesday",
  THURSDAY: "thursday",
  FRIDAY: "friday",
  SATURDAY: "saturday",
  SUNDAY: "sunday",
} as const;

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

export const TimeOffType = {
  VACATION: "vacation",
  SICK_LEAVE: "sick_leave",
  PERSONAL: "personal",
  MATERNITY: "maternity",
  PATERNITY: "paternity",
  BEREAVEMENT: "bereavement",
  UNPAID: "unpaid",
  OTHER: "other",
} as const;

export type TimeOffType = (typeof TimeOffType)[keyof typeof TimeOffType];

export const TimeOffStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export type TimeOffStatus = (typeof TimeOffStatus)[keyof typeof TimeOffStatus];

export const HalfDayPeriod = {
  MORNING: "morning",
  AFTERNOON: "afternoon",
} as const;

export type HalfDayPeriod = (typeof HalfDayPeriod)[keyof typeof HalfDayPeriod];
