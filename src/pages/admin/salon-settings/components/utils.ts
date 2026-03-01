import type { SalonSettingsExtended } from "@/types/entities";

export const defaultSettings: Partial<SalonSettingsExtended> = {
  currency: "EUR",
  timezone: "Europe/Paris",
  language: "fr",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  sendAppointmentConfirmation: true,
  sendAppointmentReminder: true,
  reminderHoursBefore: 2,
  sendBirthdayGreeting: false,
  sendReviewRequest: false,
  reviewRequestHoursAfter: 24,
  taxEnabled: true,
  taxRate: 20,
  pricesIncludeTax: true,
  taxNumber: "",
  loyaltyEnabled: false,
  loyaltyPointsPerCurrency: 1,
  loyaltyPointValue: 0.01,
  loyaltyMinimumRedemption: 100,
  loyaltyRewardServiceId: "",
  loyaltyRewardDiscountType: "percent",
  loyaltyRewardDiscountValue: 10,
  receiptHeader: "",
  receiptFooter: "",
  showStaffOnReceipt: true,
  invoicePrefix: "INV-",
  invoiceNextNumber: 1,
  workingHours: {
    monday: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
    tuesday: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
    wednesday: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
    thursday: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
    friday: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
    saturday: { isOpen: true, openTime: "09:00", closeTime: "17:00" },
    sunday: { isOpen: false, openTime: "09:00", closeTime: "18:00" },
  },
};

/**
 * Merges default settings with current salon settings
 */
export function mergeWithDefaultSettings(
  settings?: SalonSettingsExtended,
): Partial<SalonSettingsExtended> {
  const mergedWorkingHours = {
    ...defaultSettings.workingHours,
    ...(settings?.workingHours ?? {}),
  };
  return {
    ...defaultSettings,
    ...(settings ?? {}),
    workingHours: mergedWorkingHours,
  };
}

/**
 * Creates a field update handler for salon settings
 */
export function createFieldUpdater(
  setDraftSettings: React.Dispatch<
    React.SetStateAction<Partial<SalonSettingsExtended>>
  >,
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>,
) {
  return <K extends keyof SalonSettingsExtended>(
    field: K,
    value: SalonSettingsExtended[K],
  ) => {
    setDraftSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };
}

/**
 * Creates a working hours update handler
 */
export function createWorkingHoursUpdater(
  setDraftSettings: React.Dispatch<
    React.SetStateAction<Partial<SalonSettingsExtended>>
  >,
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>,
  baseSettings: Partial<SalonSettingsExtended>,
  formData: Partial<SalonSettingsExtended>,
) {
  return (day: string, field: string, value: string | boolean) => {
    const currentDayHours = formData.workingHours?.[day] || {
      isOpen: false,
      openTime: "09:00",
      closeTime: "18:00",
    };
    setDraftSettings((prev) => ({
      ...prev,
      workingHours: {
        ...baseSettings.workingHours,
        ...(prev.workingHours ?? {}),
        [day]: {
          isOpen: currentDayHours.isOpen,
          openTime: currentDayHours.openTime,
          closeTime: currentDayHours.closeTime,
          breakStart: currentDayHours.breakStart,
          breakEnd: currentDayHours.breakEnd,
          [field]: value,
        },
      },
    }));
    setHasChanges(true);
  };
}

/**
 * Merges base settings with draft settings
 */
export function mergeFormData(
  baseSettings: Partial<SalonSettingsExtended>,
  draftSettings: Partial<SalonSettingsExtended>,
): Partial<SalonSettingsExtended> {
  return {
    ...baseSettings,
    ...draftSettings,
    workingHours: {
      ...baseSettings.workingHours,
      ...(draftSettings.workingHours ?? {}),
    },
  };
}
