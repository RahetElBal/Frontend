import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/useUser";
import { Spinner } from "@/components/spinner";
import { PageHeader } from "@/components/page-header";
import { TodaysAppointments } from "./components/todays-appointments";
import { TopServices } from "./components/top-services";
import { StatsGrid } from "./components/stats-grid";
import type {
  Appointment,
  Client,
  PaginatedResponse,
  RevenueData,
} from "@/types";
import { useGet } from "@/hooks/useGet";
import { getLocalDateString } from "./utils";

export function DashboardPage() {
  const { t } = useTranslation();
  const { user, isLoading, isUser } = useUser();

  const salonId = user?.salon?.id;
  const today = useMemo(() => getLocalDateString(), []);
  const appointmentsParams = useMemo(
    () => ({
      salonId,
      perPage: 100,
      date: today,
      staffId: isUser ? user?.id : undefined,
    }),
    [salonId, today, isUser, user?.id],
  );

  const { data: todaysRevenue } = useGet<RevenueData>("sales/today/revenue", {
    params: { salonId },
    enabled: !!salonId,
  });

  const { data: lastWeekRevenue } = useGet<RevenueData>(
    "sales/last-week/revenue",
    {
      params: { salonId },
      enabled: !!salonId,
    },
  );

  const { data: appointmentsData } = useGet<PaginatedResponse<Appointment>>(
    "appointments",
    {
      params: appointmentsParams,
      enabled: !!salonId && !!today,
    },
  );

  const { data: clientsData } = useGet<PaginatedResponse<Client>>("clients", {
    params: { salonId, perPage: 100 },
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
  const clients = clientsData?.data || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("common.welcome", { name: displayName })}
        description={t("nav.dashboard")}
      />
      <StatsGrid
        todaysRevenue={todaysRevenue}
        lastWeekRevenue={lastWeekRevenue}
        clients={clients}
      />

      <TodaysAppointments appointments={appointmentsData} />
      <TopServices />
    </div>
  );
}
