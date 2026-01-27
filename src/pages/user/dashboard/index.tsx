import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/useUser";
import { Spinner } from "@/components/spinner";
import { PageHeader } from "@/components/page-header";
import { TodaysAppointments } from "./components/todays-appointments";
import { TopServices } from "./components/top-services";
import { StatsGrid } from "./components/stats-grid";
import type { RevenueData } from "@/types";
import { useGet } from "@/hooks/useGet";

export function DashboardPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useUser();

  const salonId = user?.salon?.[0]?.id;
  console.log("salonId:", salonId);
  console.log("user:", user);
  const { data: weeklyRevenue } = useGet<RevenueData>(
    "sales/last-week/revenue",
    {
      params: { salonId },
      enabled: !!salonId,
    },
  );
  const { data: todaysRevenu } = useGet<RevenueData>("sales/today/revenue", {
    params: { salonId },
    enabled: !!salonId,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const displayName = user?.name ?? user?.email;

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("common.welcome", { name: displayName })}
        description={t("nav.dashboard")}
      />

      <StatsGrid weeklyRevenue={weeklyRevenue} todaysRevenu={todaysRevenu} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TodaysAppointments />
        <TopServices />
      </div>
    </div>
  );
}
