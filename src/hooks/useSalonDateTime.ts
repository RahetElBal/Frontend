import { useTranslation } from "react-i18next";

import {
  formatDateTimeValue,
  formatDateValue,
  formatTimeValue,
  getCurrentDateTimeInTimeZone,
  resolveDateTimeDisplayOptions,
  type DateTimeDisplayOptions,
} from "@/common/date";
import { useUser } from "@/hooks/useUser";
import type { SalonSettings } from "@/pages/admin/salon/types";
import type { SalonSettingsExtended } from "@/pages/admin/salon-settings/types";

type SalonSettingsLike = Partial<SalonSettings & SalonSettingsExtended>;

interface UseSalonDateTimeOptions extends DateTimeDisplayOptions {
  settings?: SalonSettingsLike | null;
}

export function useSalonDateTime(options: UseSalonDateTimeOptions = {}) {
  const { i18n } = useTranslation();
  const { salon } = useUser();
  const settings = options.settings ?? ((salon?.settings || {}) as SalonSettingsLike);
  const resolvedOptions = resolveDateTimeDisplayOptions({
    language: settings?.language || i18n.language,
    timezone: settings?.timezone,
    dateFormat: settings?.dateFormat,
    timeFormat: settings?.timeFormat,
    ...options,
  });
  const now = getCurrentDateTimeInTimeZone(resolvedOptions.timezone);

  return {
    ...resolvedOptions,
    today: now.date,
    currentHour: now.hour,
    currentMinute: now.minute,
    currentMinutes: now.totalMinutes,
    formatDate: (value: Date | number | string | null | undefined) =>
      formatDateValue(value, resolvedOptions),
    formatTime: (value: Date | number | string | null | undefined) =>
      formatTimeValue(value, resolvedOptions),
    formatDateTime: (value: Date | number | string | null | undefined) =>
      formatDateTimeValue(value, resolvedOptions),
  };
}
