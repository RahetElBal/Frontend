import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useAuthContext } from "@/contexts/AuthProvider";
import { cn } from "@/lib/utils";

const WARNING_WINDOW_DAYS = 14;
const URGENT_WINDOW_DAYS = 7;

export function PlanExpiryBanner() {
  const { t } = useTranslation();
  const { user, isAdmin, isSuperadmin } = useAuthContext();
  const canManage = isAdmin || isSuperadmin;

  const { daysRemaining, isUrgent } = useMemo(() => {
    const salon = user?.salon;
    if (!salon?.planEndAt) return { daysRemaining: null, isUrgent: false };

    const endDate = new Date(salon.planEndAt);
    if (Number.isNaN(endDate.getTime())) {
      return { daysRemaining: null, isUrgent: false };
    }

    const now = new Date();
    const diffMs = endDate.getTime() - now.getTime();
    const remaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (remaining <= 0 || remaining > WARNING_WINDOW_DAYS) {
      return { daysRemaining: null, isUrgent: false };
    }

    return {
      daysRemaining: remaining,
      isUrgent: remaining <= URGENT_WINDOW_DAYS,
    };
  }, [user?.salon?.planEndAt]);

  if (!user?.salon || !canManage || daysRemaining === null) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm flex flex-col gap-2 md:flex-row md:items-center md:justify-between",
        isUrgent
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-amber-200 bg-amber-50 text-amber-800",
      )}
    >
      <div className="space-y-1">
        <p className="font-semibold">{t("planWarning.title")}</p>
        <p className="text-sm">
          {t("planWarning.message", { days: daysRemaining })}
        </p>
      </div>
      <span className="text-xs text-muted-foreground">
        {t("planWarning.note")}
      </span>
    </div>
  );
}
