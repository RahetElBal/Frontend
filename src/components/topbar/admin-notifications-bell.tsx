import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, BellRing, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/badge";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";
import {
  initAudio,
  playNotificationSound,
  primeNotificationSound,
} from "@/lib/notifications";
import { useGet, withParams } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import { AUTH_STORAGE_KEY } from "@/constants/auth";
import { ROUTES } from "@/constants/navigation";
import { API_BASE_URL } from "@/lib/http";
import type { PaginatedResponse } from "@/types";
import {
  AdminNotificationType,
  type AdminNotification,
} from "@/types/entities";

const NOTIFICATIONS_POLL_MS = 30000;
const UNREAD_POLL_MS = 15000;
const STREAM_RETRY_MS = 5000;

const buildStreamUrl = () => {
  const base = API_BASE_URL.replace(/\/$/, "");
  return `${base}/notifications/stream`;
};

const formatNotificationTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

export function AdminNotificationsBell() {
  const { t } = useTranslation();
  const { user, isAdmin, isSuperadmin } = useUser();
  const { formatCurrency } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showNewPill, setShowNewPill] = useState(false);
  const prevUnreadRef = useRef<number | null>(null);
  const pillTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canShow = !!user?.id;
  const canViewAmounts = isAdmin || isSuperadmin;
  const salonId = user?.salon?.id;

  const notificationsParams = useMemo(
    () => ({ perPage: 8, sortOrder: "desc", salonId }),
    [salonId],
  );
  const unreadParams = useMemo(() => ({ salonId }), [salonId]);

  const { data: notificationsData, isLoading: isNotificationsLoading } =
    useGet<PaginatedResponse<AdminNotification>>(
      withParams("notifications", notificationsParams),
      {
        enabled: canShow,
        staleTime: 5000,
        refetchInterval: NOTIFICATIONS_POLL_MS,
      },
    );

  const { data: unreadData, isLoading: isUnreadLoading } = useGet<{
    count: number;
  }>(withParams("notifications/unread-count", unreadParams), {
    enabled: canShow,
    staleTime: 5000,
    refetchInterval: UNREAD_POLL_MS,
  });

  const notifications = notificationsData?.data ?? [];
  const unreadCountFromList = notifications.reduce(
    (count, notification) => count + (notification.readAt ? 0 : 1),
    0,
  );
  const unreadCount = Math.max(unreadData?.count ?? 0, unreadCountFromList);

  const { mutate: markRead, isPending: isMarkingRead } = usePost<
    void,
    { id: string }
  >(
    (vars) => `notifications/${vars.id}/read`,
    {
      method: "PATCH",
      invalidate: ["notifications", "notifications/unread-count"],
    },
  );

  const { mutate: markAllRead, isPending: isMarkingAll } = usePost<
    void,
    { salonId?: string }
  >("notifications/read-all", {
    invalidate: ["notifications", "notifications/unread-count"],
  });

  useEffect(() => {
    if (!canShow) return;
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!token) return;

    let isActive = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let controller: AbortController | null = null;

    const connect = async () => {
      if (!isActive) return;
      controller = new AbortController();
      try {
        const response = await fetch(buildStreamUrl(), {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          throw new Error(`Stream failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (isActive) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let boundaryIndex = buffer.indexOf("\n\n");
          while (boundaryIndex !== -1) {
            const raw = buffer.slice(0, boundaryIndex);
            buffer = buffer.slice(boundaryIndex + 2);

            raw.split("\n").forEach((line) => {
              if (!line.startsWith("data:")) return;
              const payload = line.replace(/^data:\s*/, "");
              if (!payload) return;
              try {
                const parsed = JSON.parse(payload) as { type?: string };
                if (parsed?.type === "keepalive") return;
                queryClient.invalidateQueries({ queryKey: ["notifications"] });
                queryClient.invalidateQueries({
                  queryKey: ["notifications/unread-count"],
                });
              } catch {
                // ignore invalid payloads
              }
            });

            boundaryIndex = buffer.indexOf("\n\n");
          }
        }
      } catch {
        if (!isActive) return;
        retryTimer = setTimeout(connect, STREAM_RETRY_MS);
      }
    };

    connect();

    return () => {
      isActive = false;
      controller?.abort();
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [canShow, queryClient]);

  useEffect(() => {
    if (!canShow) {
      prevUnreadRef.current = null;
      if (pillTimerRef.current) {
        clearTimeout(pillTimerRef.current);
        pillTimerRef.current = null;
      }
      setShowNewPill(false);
      return;
    }
    if (isUnreadLoading) {
      return;
    }
    if (prevUnreadRef.current === null) {
      prevUnreadRef.current = unreadCount;
      if (unreadCount > 0) {
        setShowNewPill(true);
        playNotificationSound();
        if (pillTimerRef.current) {
          clearTimeout(pillTimerRef.current);
        }
        pillTimerRef.current = setTimeout(() => {
          setShowNewPill(false);
        }, 6000);
      }
      return;
    }

    if (unreadCount > prevUnreadRef.current) {
      setShowNewPill(true);
      playNotificationSound();
      if (pillTimerRef.current) {
        clearTimeout(pillTimerRef.current);
      }
      pillTimerRef.current = setTimeout(() => {
        setShowNewPill(false);
      }, 6000);
    }

    prevUnreadRef.current = unreadCount;
  }, [canShow, isUnreadLoading, unreadCount]);

  useEffect(() => {
    if (!canShow) return;
    primeNotificationSound();
  }, [canShow]);

  useEffect(() => {
    return () => {
      if (pillTimerRef.current) {
        clearTimeout(pillTimerRef.current);
      }
    };
  }, []);

  if (!canShow) {
    return null;
  }

  type NotificationPayload = {
    clientName?: string;
    serviceName?: string;
    date?: string;
    time?: string;
    staffId?: string;
    appointmentId?: string;
    total?: number | string;
    paymentStatus?: string;
    status?: string;
    actorName?: string;
  };

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
      return { label: t("notifications.statuses.paid"), variant: "success" as const };
    }
    if (normalized === "pending") {
      return { label: t("notifications.statuses.pending"), variant: "warning" as const };
    }
    if (normalized === "in_progress") {
      return { label: t("notifications.statuses.in_progress"), variant: "info" as const };
    }
    if (normalized === "cancelled") {
      return { label: t("notifications.statuses.cancelled"), variant: "error" as const };
    }
    if (normalized === "overdue") {
      return { label: t("notifications.statuses.overdue"), variant: "error" as const };
    }
    if (normalized === "completed") {
      return { label: t("notifications.statuses.completed"), variant: "success" as const };
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
      case AdminNotificationType.WHATSAPP_CONFIRMATION_SENT:
        return {
          title: t("notifications.types.whatsappConfirmationSent.title"),
          message: t("notifications.types.whatsappConfirmationSent.message", {
            client: clientName,
            service: serviceName,
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
      default:
        return {
          title: notification.title,
          message: notification.message,
        };
    }
  };

  const handleNotificationNavigation = (notification: AdminNotification) => {
    const payload = toPayload(notification);
    const isPayment =
      (notification.type === AdminNotificationType.SALE_CREATED ||
        notification.type === AdminNotificationType.SALE_COMPLETED ||
        String(payload.paymentStatus || "").toLowerCase() === "paid") &&
      notification.type !== AdminNotificationType.APPOINTMENT_PAYMENT_RECORDED;

    if (isPayment) {
      navigate(ROUTES.SALES);
      setOpen(false);
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
    }
    params.set("view", "day");
    params.set("focus", "notification");

    const target = params.toString()
      ? `${ROUTES.AGENDA}?${params.toString()}`
      : ROUTES.AGENDA;

    navigate(target);
    setOpen(false);
  };

  const isLoading = isNotificationsLoading || isUnreadLoading;
  const hasUnread = unreadCount > 0;
  const shouldShowPill = unreadCount > 0 && !open;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative overflow-visible"
          aria-label={t("settings.notifications")}
          onClick={() => {
            initAudio();
            primeNotificationSound();
          }}
        >
          {hasUnread ? (
            <BellRing className="h-5 w-5 text-accent-pink" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] rounded-full bg-accent-pink text-white text-[10px] font-semibold flex items-center justify-center px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          {shouldShowPill && (
            <Badge
              className={cn(
                "absolute right-12 top-1/2 -translate-y-1/2 bg-accent-pink-500 text-white text-[11px] font-semibold px-3 py-1 shadow-lg whitespace-nowrap uppercase tracking-wide ring-2 ring-white/70 z-30",
                showNewPill && "animate-pulse",
              )}
            >
              {t("notifications.newNotification")}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-96" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t("settings.notifications")}</span>
          <Button
            variant="default"
            size="sm"
            className="h-8 px-3 text-xs font-semibold bg-accent-pink-500 text-white hover:bg-accent-pink-400 shadow-sm border border-accent-pink-400"
            onClick={() => markAllRead({ salonId })}
            disabled={isMarkingAll || unreadCount === 0}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            {t("common.markAllRead")}
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner size="sm" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t("common.noNotifications")}
          </div>
        ) : (
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.map((notification) => {
              const isUnread = !notification.readAt;
              const payload = toPayload(notification);
              const actorName =
                typeof payload.actorName === "string" && payload.actorName.trim()
                  ? payload.actorName.trim()
                  : null;
              const statusBadge = getStatusBadge(payload);
              const content = getNotificationContent(notification);
              return (
                <DropdownMenuItem
                  key={notification.id}
                  onSelect={() => {
                    if (isUnread) {
                      markRead({ id: notification.id });
                    }
                    handleNotificationNavigation(notification);
                  }}
                  className={cn(
                    "items-start gap-3 whitespace-normal py-3",
                    isUnread && "bg-accent-pink/5",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1 h-2 w-2 rounded-full shrink-0",
                      isUnread ? "bg-accent-pink" : "bg-transparent",
                    )}
                  />
                  <div className="min-w-0">
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
                </DropdownMenuItem>
              );
            })}
          </div>
        )}

        {isMarkingRead && (
          <div className="px-4 py-2 text-xs text-muted-foreground">
            {t("common.loading")}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
