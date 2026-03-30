import type { SalonSettingsExtended } from "../types";

function normalizeTimeValue(value?: string) {
  if (!value) return "";
  const [hours = "", minutes = ""] = value.split(":");
  if (!hours || !minutes) return value;
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

function isTimeEarlier(candidate?: string, reference?: string) {
  const normalizedCandidate = normalizeTimeValue(candidate);
  const normalizedReference = normalizeTimeValue(reference);

  if (!normalizedCandidate || !normalizedReference) return false;
  return normalizedCandidate < normalizedReference;
}

export const defaultSettings: Partial<SalonSettingsExtended> = {
  currency: "DZD",
  timezone: "Africa/Algiers",
  language: "fr",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  sendAppointmentConfirmation: true,
  sendAppointmentReminder: true,
  reminderHoursBefore: 2,
  sendBirthdayGreeting: false,
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

    const nextDayHours = {
      isOpen: currentDayHours.isOpen,
      openTime: currentDayHours.openTime,
      closeTime: currentDayHours.closeTime,
      breakStart: currentDayHours.breakStart,
      breakEnd: currentDayHours.breakEnd,
      [field]: value,
    };

    if (field === "openTime" && typeof value === "string") {
      nextDayHours.openTime = value;
      if (isTimeEarlier(nextDayHours.closeTime, value)) {
        nextDayHours.closeTime = value;
      }
    }

    if (field === "closeTime" && typeof value === "string") {
      nextDayHours.closeTime = isTimeEarlier(value, nextDayHours.openTime)
        ? nextDayHours.openTime
        : value;
    }

    setDraftSettings((prev) => ({
      ...prev,
      workingHours: {
        ...baseSettings.workingHours,
        ...(prev.workingHours ?? {}),
        [day]: nextDayHours,
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
