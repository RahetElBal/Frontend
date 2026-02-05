import { useTranslation } from "react-i18next";
import { DollarSign } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { useLanguage } from "@/hooks/useLanguage";
import type { RevenueData } from "@/types";
import { getChangeDisplay } from "@/common/utils";

interface RevenueStatsProps {
  todaysRevenue?: RevenueData;
  lastWeekRevenue?: RevenueData;
}

export function RevenueStats({
  todaysRevenue,
  lastWeekRevenue,
}: RevenueStatsProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  const todayValue = todaysRevenue?.revenue ?? 0;
  const lastWeekValue = lastWeekRevenue?.revenue ?? 0;
  const change = getChangeDisplay(todayValue, lastWeekValue);

  return (
    <StatsCard
      title={t("dashboard.todayRevenue")}
      value={formatCurrency(todayValue)}
      change={change.value}
      changeText={change.text ? t("common.new") : undefined}
      changeIsPositive={change.isPositive}
      changeLabel={t("dashboard.vsLastWeek")}
      icon={DollarSign}
      iconColor="text-green-600"
      iconBgColor="bg-green-100"
    />
  );
}
