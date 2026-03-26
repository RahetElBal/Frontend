import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/useUser";
import { Spinner } from "@/components/spinner";
import { PageHeader } from "@/components/page-header";
import { useSalonBusinessSummary } from "@/contexts/BusinessSummaryProvider";
import { TodaysAppointments } from "./components/todays-appointments";
import { TopServices } from "./components/top-services";
import { StatsGrid } from "./components/stats-grid";
import type { Appointment } from "@/pages/user/agenda/types";
import type { Client } from "@/pages/user/clients/types";
import { useGet } from "@/hooks/useGet";
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

  const { data: appointments = [] } = useGet<Appointment[]>({
    path: "appointments",
    query: appointmentsParams,
    options: {
      enabled: !!salonId && !!today,
      select: (response) => {
        const normalizedResponse = response as
          | { data?: Appointment[] }
          | Appointment[];

        if (Array.isArray(normalizedResponse)) {
          return normalizedResponse;
        }

        return Array.isArray(normalizedResponse?.data)
          ? normalizedResponse.data
          : [];
      },
    },
  });

  const { data: clients = [], isLoading: isClientsLoading } = useGet<Client[]>({
    path: "clients",
    query: { salonId, perPage: 10 },
    options: {
      enabled: !!salonId,
      select: (response) => {
        const normalizedResponse = response as { data?: Client[] } | Client[];

        if (Array.isArray(normalizedResponse)) {
          return normalizedResponse;
        }

        return Array.isArray(normalizedResponse?.data)
          ? normalizedResponse.data
          : [];
      },
    },
  });

  const statsLoading = isSummaryLoading || isClientsLoading;

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
      <StatsGrid
        grossRevenue={summary.grossRevenue}
        netRevenue={summary.netRevenue}
        clients={clients}
        loading={statsLoading}
      />

      <TodaysAppointments appointments={appointments} />
      <TopServices />
    </div>
  );
}
