import type { SalonSettingsExtended } from "@/types/entities";

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
