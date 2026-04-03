import type { BaseEntity } from "@/constants/types";
import type { User } from "@/pages/admin/users/types";
import type {
  LoyaltyRewardDiscountType,
  PlanStatus,
  PlanTier,
} from "./enum";

export interface WorkingHours {
  [day: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

export interface SalonSettings {
  currency: string;
  timezone: string;
  language: string;
  workingHours?: WorkingHours;
  loyaltyEnabled?: boolean;
  loyaltyPointsPerCurrency?: number;
  loyaltyPointValue?: number;
  loyaltyMinimumRedemption?: number;
  loyaltyRewardServiceId?: string;
  loyaltyRewardDiscountType?: LoyaltyRewardDiscountType;
  loyaltyRewardDiscountValue?: number;
  sendAppointmentConfirmation?: boolean;
  sendAppointmentReminder?: boolean;
  reminderHoursBefore?: number;
  sendAppointmentConfirmationReminder?: boolean;
  confirmationReminderHoursBefore?: number;
  sendAppointmentConfirmationPdf?: boolean;
  appointmentPdfBackgroundImage?: string;
  sendBirthdayGreeting?: boolean;
}

export interface Salon extends BaseEntity {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  isActive: boolean;
  planTier?: PlanTier;
  planStatus?: PlanStatus;
  planUserLimit?: number;
  planStartAt?: string | null;
  planEndAt?: string | null;
  planUpdatedAt?: string | null;
  planUpdatedById?: string | null;
  planNotes?: string | null;
  hasUsedFreeTrial?: boolean;
  isOnFreeTrial?: boolean;
  freeTrialStartAt?: string | null;
  freeTrialEndAt?: string | null;
  slaAcceptedAt?: string | null;
  slaAcceptedById?: string | null;
  slaAcceptedVersion?: number | null;
  staffLockActive?: boolean;
  staffLockActivatedAt?: string | null;
  staffLockClearedAt?: string | null;
  staffLockReason?: string | null;
  ownerId: string;
  owner?: User;
  settings?: SalonSettings;
  staff?: User[];
  createdBySuperadmin?: boolean;
}
