import { useTranslation } from "react-i18next";
import { DollarSign, Calendar, Users, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { useLanguage } from "@/hooks/useLanguage";
import type { RevenueData } from "@/types";

type StatsGridProps = {
  weeklyRevenue?: RevenueData;
  todaysRevenu?: RevenueData;
};

export function StatsGrid({ weeklyRevenue, todaysRevenu }: StatsGridProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  const todayRevenue = todaysRevenu?.revenue ?? 0;
  const lastWeekRevenu = weeklyRevenue?.revenue ?? 0;

  // Calculate percentage change
  const revenueChange =
    lastWeekRevenu > 0
      ? ((todayRevenue - lastWeekRevenu) / lastWeekRevenu) * 100
      : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title={t("dashboard.todayRevenue")}
        value={formatCurrency(todayRevenue)}
        change={revenueChange}
        changeLabel={t("dashboard.vsLastWeek")}
        icon={DollarSign}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
      />
      <StatsCard
        title={t("dashboard.todayAppointments")}
        value={0}
        change={0}
        changeLabel={t("dashboard.vsLastWeek")}
        icon={Calendar}
        iconColor="text-accent-blue"
        iconBgColor="bg-accent-blue/10"
      />
      <StatsCard
        title={t("dashboard.newClients")}
        value={0}
        change={0}
        changeLabel={t("dashboard.vsLastWeek")}
        icon={Users}
        iconColor="text-accent-pink"
        iconBgColor="bg-accent-pink/10"
      />
      <StatsCard
        title={t("dashboard.averageTicket")}
        value={formatCurrency(0)}
        change={0}
        changeLabel={t("dashboard.vsLastWeek")}
        icon={TrendingUp}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100"
      />
    </div>
  );
}
