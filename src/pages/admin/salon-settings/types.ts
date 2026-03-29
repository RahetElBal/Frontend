import type { BaseEntity } from "@/constants/types";
import type { LoyaltyRewardDiscountType } from "@/pages/admin/salon/enum";
import type { TimeFormat } from "./enum";

export interface SalonSettingsExtended extends BaseEntity {
  salonId: string;
  currency: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: TimeFormat;
  bookingSlotDuration?: number;
  bookingLeadTime?: number;
  bookingWindowDays?: number;
  cancellationDeadline?: number;
  allowOnlineBooking?: boolean;
  requireDeposit?: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  sendAppointmentConfirmation: boolean;
  sendAppointmentReminder: boolean;
  reminderHoursBefore: number;
  sendBirthdayGreeting: boolean;
  taxEnabled: boolean;
  taxRate: number;
  pricesIncludeTax: boolean;
  taxNumber?: string;
  loyaltyEnabled: boolean;
  loyaltyPointsPerCurrency: number;
  loyaltyPointValue: number;
  loyaltyMinimumRedemption: number;
  loyaltyRewardServiceId?: string;
  loyaltyRewardDiscountType?: LoyaltyRewardDiscountType;
  loyaltyRewardDiscountValue?: number;
  receiptHeader?: string;
  receiptFooter?: string;
  showStaffOnReceipt: boolean;
  invoicePrefix?: string;
  invoiceNextNumber: number;
  workingHours?: {
    [day: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
      breakStart?: string;
      breakEnd?: string;
    };
  };
}

export interface SettingsSectionProps {
  formData: Partial<SalonSettingsExtended>;
  updateField: <K extends keyof SalonSettingsExtended>(
    field: K,
    value: SalonSettingsExtended[K],
  ) => void;
}

export interface WorkingHoursSettingsProps {
  formData: Partial<SalonSettingsExtended>;
  updateWorkingHours: (
    day: string,
    field: string,
    value: string | boolean,
  ) => void;
}
