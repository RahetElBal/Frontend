import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/useUser";
import { Spinner } from "@/components/spinner";
import { PageHeader } from "@/components/page-header";
import { useSalonBusinessSummary } from "@/contexts/BusinessSummaryProvider";
import { TodaysAppointments } from "./components/todays-appointments";
import { TopServices } from "./components/top-services";
import { StatsGrid } from "./components/stats-grid";
import type {
  Appointment,
  Client,
  PaginatedResponse,
} from "@/types";
import { useGet, withParams } from "@/hooks/useGet";
import { getLocalDateString } from "./utils";

export function DashboardPage() {
  const { t } = useTranslation();
  const { user, isLoading, isUser } = useUser();

  const salonId = user?.salon?.id;
  const today = useMemo(() => getLocalDateString(), []);
  const lastWeekDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return getLocalDateString(date);
  }, []);
  const appointmentsParams = useMemo(
    () => ({
      salonId,
      perPage: 10,
      date: today,
      staffId: isUser ? user?.id : undefined,
    }),
    [salonId, today, isUser, user?.id],
  );
  const { summary, isLoading: isSummaryLoading } = useSalonBusinessSummary(
    salonId,
    { enabled: !!salonId },
  );

  const todaysRevenue = useMemo(
    () => ({
      date: today,
      revenue: summary.todayRevenue,
      appointments: 0,
    }),
    [today, summary.todayRevenue],
  );
  const lastWeekRevenue = useMemo(
    () => ({
      date: lastWeekDate,
      revenue: summary.lastWeekRevenue,
      appointments: 0,
    }),
    [lastWeekDate, summary.lastWeekRevenue],
  );

  const { data: appointmentsData } = useGet<PaginatedResponse<Appointment>>(
    withParams("appointments", appointmentsParams),
    { enabled: !!salonId && !!today },
  );

  const { data: clientsData, isLoading: isClientsLoading } = useGet<PaginatedResponse<Client>>(
    withParams("clients", { salonId, perPage: 10 }),
    { enabled: !!salonId },
  );

  const statsLoading = isSummaryLoading || isClientsLoading;

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
