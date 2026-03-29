import type { User } from "@/pages/admin/users/types";
import {
  DEFAULT_SALON_DATE_FORMAT,
  DEFAULT_SALON_LANGUAGE,
  DEFAULT_SALON_TIMEZONE,
  formatDateValue,
} from "@/common/date";

export const selectCollectionData = <T>(
  response: { data?: T[] } | T[] | null | undefined,
): T[] => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data;
};

export const formatDate = (date: string | Date): string => {
  return formatDateValue(date, {
    dateFormat: DEFAULT_SALON_DATE_FORMAT,
    language: DEFAULT_SALON_LANGUAGE,
    timezone: DEFAULT_SALON_TIMEZONE,
  });
};

export const getDisplayName = (user: User): string => {
  const userName = (user as User & { name?: string }).name;
  return (
    userName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A"
  );
};

/**
 * Get user initials for avatar
 */
export const getInitials = (user: User): string => {
  const name = getDisplayName(user);
  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export const formatCurrency = (value: number) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(safeValue);
};

export function calculatePercentageChange(
  current: number,
  previous: number,
): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function getChangeDisplay(current: number, previous: number): {
  value?: number;
  text?: "new";
  isPositive?: boolean;
} {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return {};
  }
  if (previous === 0) {
    if (current === 0) {
      return { value: 0, isPositive: true };
    }
    return { value: 100, text: "new", isPositive: true };
  }

  const rawChange = ((current - previous) / previous) * 100;
  const cappedChange = Math.max(Math.min(rawChange, 100), -100);
  return {
    value: cappedChange,
    isPositive: cappedChange >= 0,
  };
}
