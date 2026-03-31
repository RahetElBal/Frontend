import type { TFunction } from "i18next";
import { AdminNotificationType } from "./enum";
import type { AdminNotification } from "./types";

type NotificationBadgeVariant = "success" | "warning" | "info" | "error";

export type NotificationPayload = {
  clientName?: string;
  serviceName?: string;
  salonName?: string;
  date?: string;
  time?: string;
  staffId?: string;
  appointmentId?: string;
  saleId?: string;
  total?: number | string;
  paymentStatus?: string;
  status?: string;
  actorName?: string;
  ticketId?: string;
  thresholdHours?: number | string;
};

const normalizeNotificationStatus = (value?: string | null) => {
  const normalized = value?.trim().toLowerCase();
  return normalized || null;
};

const getFallbackStatus = (notification: AdminNotification) => {
  switch (notification.type) {
    case AdminNotificationType.APPOINTMENT_CONFIRMATION_PENDING:
      return "pending";
    case AdminNotificationType.APPOINTMENT_CANCELLED:
      return "cancelled";
    case AdminNotificationType.APPOINTMENT_OVERDUE:
      return "overdue";
    case AdminNotificationType.APPOINTMENT_PAYMENT_RECORDED:
    case AdminNotificationType.SALE_COMPLETED:
      return "paid";
    case AdminNotificationType.SALE_REFUNDED:
      return "refunded";
    default:
      return null;
  }
};

const getStatusTranslationKey = (status: string) =>
  status === "reimbursed" ? "refunded" : status;

export const getNotificationStatusLabel = (
  t: TFunction,
  rawStatus?: string | null,
) => {
  const normalized = normalizeNotificationStatus(rawStatus);
  if (!normalized) return null;

  return t(`notifications.statuses.${getStatusTranslationKey(normalized)}`, {
    defaultValue: String(rawStatus),
  });
};

export const getNotificationStatusBadge = (
  t: TFunction,
  notification: AdminNotification,
  payload: NotificationPayload,
) => {
  const normalized =
    normalizeNotificationStatus(payload.paymentStatus || payload.status) ??
    getFallbackStatus(notification);

  if (!normalized) return null;

  const label = getNotificationStatusLabel(t, normalized);
  if (!label) return null;

  let variant: NotificationBadgeVariant | null = null;

  switch (normalized) {
    case "paid":
    case "confirmed":
    case "completed":
      variant = "success";
      break;
    case "pending":
      variant = "warning";
      break;
    case "in_progress":
      variant = "info";
      break;
    case "cancelled":
    case "overdue":
    case "refunded":
    case "reimbursed":
      variant = "error";
      break;
    default:
      variant = null;
  }

  if (!variant) return null;

  return { label, variant };
};
