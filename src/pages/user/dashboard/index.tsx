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
import { useGet, withParams } from "@/hooks/useGet";
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

  const { data: todaysRevenue, isLoading: isRevenueLoading } = useGet<RevenueData>(
    withParams("sales/today/revenue", { salonId }),
    { enabled: !!salonId },
  );

  const { data: lastWeekRevenue, isLoading: isLastWeekLoading } = useGet<RevenueData>(
    withParams("sales/last-week/revenue", { salonId }),
    { enabled: !!salonId },
  );

  const { data: appointmentsData } = useGet<PaginatedResponse<Appointment>>(
    withParams("appointments", appointmentsParams),
    { enabled: !!salonId && !!today },
  );

  const { data: clientsData, isLoading: isClientsLoading } = useGet<PaginatedResponse<Client>>(
    withParams("clients", { salonId, perPage: 100 }),
    { enabled: !!salonId },
  );

  const statsLoading = isRevenueLoading || isLastWeekLoading || isClientsLoading;

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
        loading={statsLoading}
      />

      <TodaysAppointments appointments={appointmentsData} />
      <TopServices />
    </div>
  );
}
