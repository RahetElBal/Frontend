import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";
import { useGet, withParams } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import { ROUTES } from "@/constants/navigation";
import type { PaginatedResponse } from "@/types/api";
import { AdminNotificationType } from "./enum";
import type { AdminNotification } from "./types";

type NotificationPayload = {
  clientName?: string;
  serviceName?: string;
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
};

const formatNotificationTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

export function NotificationsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { user, isAdmin, isSuperadmin } = useUser();
  const navigate = useNavigate();
  const canViewAmounts = isAdmin || isSuperadmin;

  const salonId = user?.salon?.id;
  const notificationsParams = useMemo(
    () => ({ perPage: 30, sortOrder: "desc", salonId, includeUnreadCount: true }),
    [salonId],
  );

  const { data: notificationsData, isLoading } =
    useGet<PaginatedResponse<AdminNotification>>(
      withParams("notifications", notificationsParams),
      {
        enabled: !!salonId,
        staleTime: 1000 * 30,
        refetchOnMount: "always",
      },
    );

  const notifications = notificationsData?.data ?? [];
  const unreadCount = notifications.reduce(
    (count, notification) => count + (notification.readAt ? 0 : 1),
    0,
  );

  const { mutate: markRead } = usePost<void, { id: string }>(
    (vars) => `notifications/${vars.id}/read`,
    {
      method: "PATCH",
      invalidate: ["notifications"],
    },
  );

  const { mutate: markAllRead, isPending: isMarkingAll } = usePost<
    void,
    { salonId?: string }
  >("notifications/read-all", {
    invalidate: ["notifications"],
  });

  const toPayload = (notification: AdminNotification): NotificationPayload =>
    (notification.payload || {}) as NotificationPayload;

  const formatAmount = (value?: number | string) => {
    if (!canViewAmounts) return "";
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return "";
    return formatCurrency(parsed);
  };

  const getStatusBadge = (payload: NotificationPayload) => {
    const rawStatus = payload.paymentStatus || payload.status;
    if (!rawStatus) return null;
    const normalized = String(rawStatus).toLowerCase();
    if (normalized === "paid") {
      return {
        label: t("notifications.statuses.paid"),
        variant: "success" as const,
      };
    }
    if (normalized === "pending") {
      return {
        label: t("notifications.statuses.pending"),
        variant: "warning" as const,
      };
    }
    if (normalized === "in_progress") {
      return {
        label: t("notifications.statuses.in_progress"),
        variant: "info" as const,
      };
    }
    if (normalized === "cancelled") {
      return {
        label: t("notifications.statuses.cancelled"),
        variant: "error" as const,
      };
    }
    if (normalized === "overdue") {
      return {
        label: t("notifications.statuses.overdue"),
        variant: "error" as const,
      };
    }
    if (normalized === "completed") {
      return {
        label: t("notifications.statuses.completed"),
        variant: "success" as const,
      };
    }
    return null;
  };

  const getNotificationContent = (notification: AdminNotification) => {
    const payload = toPayload(notification);
    const hasPayload =
      notification.payload &&
      typeof notification.payload === "object" &&
      Object.keys(notification.payload).length > 0;
    if (!hasPayload) {
      return {
        title: notification.title,
        message: notification.message,
      };
    }
    const clientName = payload.clientName || t("fields.client");
    const serviceName = payload.serviceName || t("fields.service");
    const date = payload.date || "";
    const time = payload.time || "";
    const amount = formatAmount(payload.total);
    const statusLabel =
      payload.status &&
      t(`notifications.statuses.${String(payload.status).toLowerCase()}`, {
        defaultValue: String(payload.status),
      });

    switch (notification.type) {
      case AdminNotificationType.APPOINTMENT_CREATED:
        return {
          title: t("notifications.types.appointmentCreated.title"),
          message: t("notifications.types.appointmentCreated.message", {
            client: clientName,
            service: serviceName,
            date,
            time,
          }),
        };
      case AdminNotificationType.APPOINTMENT_CANCELLED:
        return {
          title: t("notifications.types.appointmentCancelled.title"),
          message: t("notifications.types.appointmentCancelled.message", {
            client: clientName,
            service: serviceName,
            date,
            time,
          }),
        };
      case AdminNotificationType.APPOINTMENT_REMINDER:
        return {
          title: t("notifications.types.appointmentReminder.title"),
          message: t("notifications.types.appointmentReminder.message", {
            client: clientName,
            service: serviceName,
            date,
            time,
          }),
        };
      case AdminNotificationType.APPOINTMENT_ASSIGNED:
        return {
          title: t("notifications.types.appointmentAssigned.title"),
          message: t("notifications.types.appointmentAssigned.message", {
            client: clientName,
            service: serviceName,
            date,
            time,
          }),
        };
      case AdminNotificationType.APPOINTMENT_STATUS_UPDATED:
        return {
          title: t("notifications.types.appointmentStatusUpdated.title"),
          message: t("notifications.types.appointmentStatusUpdated.message", {
            client: clientName,
            service: serviceName,
            status: statusLabel || payload.status || "",
          }),
        };
      case AdminNotificationType.APPOINTMENT_OVERDUE:
        return {
          title: t("notifications.types.appointmentOverdue.title"),
          message: t("notifications.types.appointmentOverdue.message", {
            client: clientName,
            service: serviceName,
            date,
            time,
          }),
        };
      case AdminNotificationType.APPOINTMENT_PAYMENT_RECORDED:
        return {
          title: t("notifications.types.appointmentPaymentRecorded.title"),
          message: t("notifications.types.appointmentPaymentRecorded.message", {
            client: clientName,
            service: serviceName,
            date,
            time,
          }),
        };
      case AdminNotificationType.SALE_CREATED:
        return {
          title: t("notifications.types.saleCreated.title"),
          message: canViewAmounts
            ? t("notifications.types.saleCreated.message", {
                client: clientName,
                amount,
              })
            : clientName,
        };
      case AdminNotificationType.SALE_COMPLETED:
        return {
          title: t("notifications.types.saleCompleted.title"),
          message: canViewAmounts
            ? t("notifications.types.saleCompleted.message", {
                client: clientName,
                amount,
              })
            : clientName,
        };
      case AdminNotificationType.SALE_REFUNDED:
        return {
          title: notification.title,
          message: canViewAmounts ? notification.message : clientName,
        };
      case AdminNotificationType.WHATSAPP_CONFIRMATION_SENT:
        return {
          title: t("notifications.types.whatsappConfirmationSent.title"),
          message: t("notifications.types.whatsappConfirmationSent.message", {
            client: clientName,
            service: serviceName,
          }),
        };
      default:
        return {
          title: notification.title,
          message: notification.message,
        };
    }
  };

  const handleNotificationNavigation = (notification: AdminNotification) => {
    const payload = toPayload(notification);
    const isSupportTicketNotification =
      notification.type === AdminNotificationType.SUPPORT_TICKET_CREATED ||
      notification.type === AdminNotificationType.SUPPORT_TICKET_CLOSED;
    if (isSupportTicketNotification) {
      const target = isSuperadmin
        ? payload.ticketId
          ? `${ROUTES.ADMIN_REPORT}?ticketId=${encodeURIComponent(payload.ticketId)}`
          : ROUTES.ADMIN_REPORT
        : ROUTES.REPORT;
      navigate(target);
      return;
    }

    const isPayment =
      (notification.type === AdminNotificationType.SALE_CREATED ||
        notification.type === AdminNotificationType.SALE_COMPLETED ||
        notification.type === AdminNotificationType.APPOINTMENT_PAYMENT_RECORDED ||
        notification.type === AdminNotificationType.SALE_REFUNDED ||
        String(payload.paymentStatus || "").toLowerCase() === "paid") &&
      canViewAmounts;

    if (isPayment) {
      const params = new URLSearchParams();
      if (payload.saleId) {
        params.set("saleId", payload.saleId);
      }
      if (notification.id) {
        params.set("focus", "notification");
      }
      const target = params.toString()
        ? `${ROUTES.SALES}?${params.toString()}`
        : ROUTES.SALES;
      navigate(target);
      return;
    }

    const params = new URLSearchParams();
    if (payload.date) {
      params.set("date", payload.date);
    }
    if (payload.staffId) {
      params.set("staffId", payload.staffId);
    }
    if (payload.time) {
      params.set("time", payload.time);
    }
    if (payload.appointmentId) {
      params.set("appointmentId", payload.appointmentId);
      params.set("modal", "view");
    }
    params.set("view", "day");
    params.set("focus", "notification");

    const target = params.toString()
      ? `${ROUTES.AGENDA}?${params.toString()}`
      : ROUTES.AGENDA;

    navigate(target);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.notifications")}
        description={t("settings.notificationsDescription")}
        actions={
          <Button
            variant="default"
            size="sm"
            onClick={() => markAllRead({ salonId })}
            disabled={isMarkingAll || unreadCount === 0}
          >
            {t("common.markAllRead")}
          </Button>
        }
      />

      <Card className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner size="sm" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t("common.noNotifications")}
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification, index) => {
              const isUnread = !notification.readAt;
              const payload = toPayload(notification);
              const actorName =
                typeof payload.actorName === "string" && payload.actorName.trim()
                  ? payload.actorName.trim()
                  : null;
              const statusBadge = getStatusBadge(payload);
              const content = getNotificationContent(notification);

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    if (isUnread) {
                      markRead({ id: notification.id });
                    }
                    handleNotificationNavigation(notification);
                  }}
                  className={cn(
                    "w-full text-left flex items-start gap-3 py-4 transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-1",
                    isUnread && "bg-accent-pink/5",
                  )}
                  style={{
                    animationDelay: `${Math.min(index, 12) * 20}ms`,
                    animationDuration: "220ms",
                    animationFillMode: "both",
                  }}
                >
                  <span
                    className={cn(
                      "mt-1 h-2 w-2 rounded-full shrink-0",
                      isUnread ? "bg-accent-pink" : "bg-transparent",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">
                        {content.title}
                      </p>
                      {statusBadge && (
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-4 mt-1">
                      {content.message}
                    </p>
                    {actorName && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {t("notifications.actor", { name: actorName })}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-2">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
