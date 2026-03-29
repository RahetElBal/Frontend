export type DateTimeValue = Date | number | string;

export interface DateTimeDisplayOptions {
  language?: string | null;
  timezone?: string | null;
  dateFormat?: string | null;
  timeFormat?: "12h" | "24h" | null;
}

export interface ResolvedDateTimeDisplayOptions {
  language: string;
  locale: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
}

export const DEFAULT_SALON_LANGUAGE = "fr";
export const DEFAULT_SALON_LOCALE = "fr-FR";
export const DEFAULT_SALON_TIMEZONE = "Africa/Algiers";
export const DEFAULT_SALON_DATE_FORMAT = "DD/MM/YYYY";
export const DEFAULT_SALON_TIME_FORMAT = "24h";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_ONLY_PATTERN = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

const LOCALE_BY_LANGUAGE: Record<string, string> = {
  ar: "ar-DZ",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getCachedFormatter(
  key: string,
  createFormatter: () => Intl.DateTimeFormat,
) {
  const existing = formatterCache.get(key);
  if (existing) {
    return existing;
  }

  const formatter = createFormatter();
  formatterCache.set(key, formatter);
  return formatter;
}

function resolveLanguage(value?: string | null) {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed) {
    return DEFAULT_SALON_LANGUAGE;
  }

  const [baseLanguage] = trimmed.split("-");
  return LOCALE_BY_LANGUAGE[baseLanguage] ? baseLanguage : DEFAULT_SALON_LANGUAGE;
}

function resolveLocale(value?: string | null) {
  const language = resolveLanguage(value);
  return LOCALE_BY_LANGUAGE[language] || DEFAULT_SALON_LOCALE;
}

function resolveTimezone(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return DEFAULT_SALON_TIMEZONE;
  }

  try {
    Intl.DateTimeFormat("en-US", { timeZone: trimmed }).format(new Date());
    return trimmed;
  } catch {
    return DEFAULT_SALON_TIMEZONE;
  }
}

function resolveDateFormat(value?: string | null) {
  if (value === "MM/DD/YYYY" || value === "YYYY-MM-DD") {
    return value;
  }

  return DEFAULT_SALON_DATE_FORMAT;
}

function resolveTimeFormat(value?: string | null) {
  if (value === "12h" || value === "24h") {
    return value;
  }

  return DEFAULT_SALON_TIME_FORMAT;
}

function getDatePartsFormatter(locale: string, timeZone: string) {
  const key = `date|${locale}|${timeZone}`;
  return getCachedFormatter(key, () => {
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  });
}

function getTimePartsFormatter(
  locale: string,
  timeZone: string,
  timeFormat: "12h" | "24h",
) {
  const key = `time|${locale}|${timeZone}|${timeFormat}`;
  return getCachedFormatter(key, () => {
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      hour: timeFormat === "12h" ? "numeric" : "2-digit",
      minute: "2-digit",
      hour12: timeFormat === "12h",
    });
  });
}

function getWallTimeFormatter(locale: string, timeFormat: "12h" | "24h") {
  const key = `wall-time|${locale}|${timeFormat}`;
  return getCachedFormatter(key, () => {
    return new Intl.DateTimeFormat(locale, {
      timeZone: "UTC",
      hour: timeFormat === "12h" ? "numeric" : "2-digit",
      minute: "2-digit",
      hour12: timeFormat === "12h",
    });
  });
}

function getNowFormatter(timeZone: string) {
  const key = `now|${timeZone}`;
  return getCachedFormatter(key, () => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      hourCycle: "h23",
    });
  });
}

function getPartsMap(formatter: Intl.DateTimeFormat, value: Date) {
  const parts = formatter.formatToParts(value);
  return new Map(parts.map((part) => [part.type, part.value]));
}

function buildUtcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function toDate(value: DateTimeValue) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getLocalizedDateParts(
  value: DateTimeValue,
  options: ResolvedDateTimeDisplayOptions,
) {
  if (typeof value === "string") {
    const dateOnlyMatch = value.trim().match(DATE_ONLY_PATTERN);
    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1]);
      const month = Number(dateOnlyMatch[2]);
      const day = Number(dateOnlyMatch[3]);
      const date = buildUtcDate(year, month, day);
      const formatter = getDatePartsFormatter(options.locale, "UTC");
      const parts = getPartsMap(formatter, date);
      return {
        year: parts.get("year") || dateOnlyMatch[1],
        month: parts.get("month") || dateOnlyMatch[2],
        day: parts.get("day") || dateOnlyMatch[3],
      };
    }
  }

  const date = toDate(value);
  if (!date) {
    return null;
  }

  const formatter = getDatePartsFormatter(options.locale, options.timezone);
  const parts = getPartsMap(formatter, date);

  return {
    year: parts.get("year") || "",
    month: parts.get("month") || "",
    day: parts.get("day") || "",
  };
}

function formatOrderedDate(
  parts: { year: string; month: string; day: string },
  dateFormat: string,
) {
  if (dateFormat === "MM/DD/YYYY") {
    return `${parts.month}/${parts.day}/${parts.year}`;
  }

  if (dateFormat === "YYYY-MM-DD") {
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  return `${parts.day}/${parts.month}/${parts.year}`;
}

export function resolveDateTimeDisplayOptions(
  options: DateTimeDisplayOptions = {},
) {
  const language = resolveLanguage(options.language);

  return {
    language,
    locale: resolveLocale(language),
    timezone: resolveTimezone(options.timezone),
    dateFormat: resolveDateFormat(options.dateFormat),
    timeFormat: resolveTimeFormat(options.timeFormat),
  } satisfies ResolvedDateTimeDisplayOptions;
}

export function formatDateValue(
  value: DateTimeValue | null | undefined,
  options: DateTimeDisplayOptions = {},
) {
  if (!value) {
    return "";
  }

  const resolvedOptions = resolveDateTimeDisplayOptions(options);
  const parts = getLocalizedDateParts(value, resolvedOptions);

  if (!parts) {
    return typeof value === "string" ? value : "";
  }

  return formatOrderedDate(parts, resolvedOptions.dateFormat);
}

export function formatTimeValue(
  value: DateTimeValue | null | undefined,
  options: DateTimeDisplayOptions = {},
) {
  if (!value) {
    return "";
  }

  const resolvedOptions = resolveDateTimeDisplayOptions(options);

  if (typeof value === "string") {
    const timeOnlyMatch = value.trim().match(TIME_ONLY_PATTERN);
    if (timeOnlyMatch) {
      const hours = Number(timeOnlyMatch[1]);
      const minutes = Number(timeOnlyMatch[2]);
      const seconds = Number(timeOnlyMatch[3] || 0);
      const date = new Date(Date.UTC(2000, 0, 1, hours, minutes, seconds));
      const formatter = getWallTimeFormatter(
        resolvedOptions.locale,
        resolvedOptions.timeFormat,
      );
      return formatter.format(date);
    }
  }

  const date = toDate(value);
  if (!date) {
    return typeof value === "string" ? value : "";
  }

  const formatter = getTimePartsFormatter(
    resolvedOptions.locale,
    resolvedOptions.timezone,
    resolvedOptions.timeFormat,
  );

  return formatter.format(date);
}

export function formatDateTimeValue(
  value: DateTimeValue | null | undefined,
  options: DateTimeDisplayOptions = {},
) {
  if (!value) {
    return "";
  }

  const formattedDate = formatDateValue(value, options);
  const formattedTime = formatTimeValue(value, options);

  if (!formattedDate) {
    return formattedTime;
  }

  if (!formattedTime) {
    return formattedDate;
  }

  return `${formattedDate} ${formattedTime}`;
}

export function getDateTimeContext(
  value: DateTimeValue = new Date(),
  timezone?: string | null,
) {
  const resolvedTimezone = resolveTimezone(timezone);
  const formatter = getNowFormatter(resolvedTimezone);
  const date = toDate(value) ?? new Date();
  const parts = getPartsMap(formatter, date);
  const year = parts.get("year") || "1970";
  const month = parts.get("month") || "01";
  const day = parts.get("day") || "01";
  const rawHour = Number(parts.get("hour") || "0");
  const hour = rawHour === 24 ? 0 : rawHour;
  const minute = Number(parts.get("minute") || "0");

  return {
    date: `${year}-${month}-${day}`,
    hour,
    minute,
    totalMinutes: hour * 60 + minute,
  };
}

export function getCurrentDateTimeInTimeZone(timezone?: string | null) {
  return getDateTimeContext(new Date(), timezone);
}
