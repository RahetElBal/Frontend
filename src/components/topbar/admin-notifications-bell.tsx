import { useEffect, useMemo, useState } from "react";
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
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";
import { useGet, withParams } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useUser } from "@/hooks/useUser";
import { AUTH_STORAGE_KEY } from "@/constants/auth";
import { API_BASE_URL } from "@/lib/http";
import type { PaginatedResponse } from "@/types";
import type { AdminNotification } from "@/types/entities";

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
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const canShow = isAdmin || isSuperadmin;
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
  const unreadCount = unreadData?.count ?? 0;

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

  if (!canShow) {
    return null;
  }

  const isLoading = isNotificationsLoading || isUnreadLoading;
  const hasUnread = unreadCount > 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t("settings.notifications")}
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
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-96" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t("settings.notifications")}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
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
              return (
                <DropdownMenuItem
                  key={notification.id}
                  onSelect={() => {
                    if (isUnread) {
                      markRead({ id: notification.id });
                    }
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
                    <p className="text-sm font-semibold truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-4 mt-1">
                      {notification.message}
                    </p>
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
