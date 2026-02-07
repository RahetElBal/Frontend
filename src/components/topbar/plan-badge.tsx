import { useTranslation } from "react-i18next";

import { useAuthContext } from "@/contexts/AuthProvider";
import { cn } from "@/lib/utils";

const PLAN_STYLES: Record<string, string> = {
  standard: "border-accent-pink-200 bg-accent-pink-50 text-accent-pink-500",
  pro: "border-accent-blue-200 bg-accent-blue-50 text-accent-blue-500",
};

export function PlanBadge() {
  const { t } = useTranslation();
  const { user } = useAuthContext();

  const planTier = user?.salon?.planTier ?? "standard";
  const planLabel = t(`plans.${planTier}`, planTier);

  if (!user?.salon) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        PLAN_STYLES[planTier] ?? "border-border bg-muted text-muted-foreground",
      )}
    >
      {t("plans.badge", { plan: planLabel })}
    </span>
  );
}
