import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/useUser";
import { Spinner } from "@/components/spinner";
import { PageHeader } from "@/components/page-header";
import { useSalonBusinessSummary } from "@/contexts/BusinessSummaryProvider";
import { TodaysAppointments } from "./components/todays-appointments";
import { TopServices } from "./components/top-services";
import { StatsGrid } from "./components/stats-grid";
import type { PaginatedResponse } from "@/types/api";
import type { Appointment } from "@/pages/user/agenda/types";
import type { Client } from "@/pages/user/clients/types";
import { useGet, withParams } from "@/hooks/useGet";
import { getLocalDateString } from "./components/utils";

export function DashboardPage() {
  const { t } = useTranslation();
  const { user, isLoading, isUser } = useUser();

  const salonId = user?.salon?.id;
  const today = useMemo(() => getLocalDateString(), []);
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
        grossRevenue={summary.grossRevenue}
        netRevenue={summary.netRevenue}
        clients={clients}
        loading={statsLoading}
      />

      <TodaysAppointments appointments={appointmentsData} />
      <TopServices />
    </div>
  );
}
