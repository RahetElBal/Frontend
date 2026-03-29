import { useMemo, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/spinner";
import { useGet } from "@/hooks/useGet";
import { useTable } from "@/hooks/useTable";
import { useSalonStaff } from "@/hooks/useSalonStaff";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/navigation";
import type { Appointment } from "@/pages/user/agenda/types";
import { AppointmentStatus } from "@/pages/user/agenda/enum";

import { HistoryView } from "../agenda/components/history-view";
import {
  ALL_STAFF_ID,
  buildStaffOptions,
  getLocalDateString,
} from "../agenda/components/utils";

const HISTORY_PAGE_SIZE = 20;

interface AppointmentHistorySummary {
  total: number;
  completed: number;
  unpaid: number;
  noShow: number;
  revenue: number;
  averageTicket: number;
}

const EMPTY_HISTORY_SUMMARY: AppointmentHistorySummary = {
  total: 0,
  completed: 0,
  unpaid: 0,
  noShow: 0,
  revenue: 0,
  averageTicket: 0,
};

export function AgendaHistoryPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { user, isAdmin, isSuperadmin } = useUser();

  if (!user || !isAdmin || isSuperadmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const salonId = user?.salon?.id;
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return getLocalDateString(date);
  });
  const [dateTo, setDateTo] = useState(() => getLocalDateString());
  const [status, setStatus] = useState<"all" | AppointmentStatus>("all");
  const [staffId, setStaffId] = useState<string | null>(ALL_STAFF_ID);

  const staffFilterId = staffId === ALL_STAFF_ID ? null : staffId;
  const historyQuery = useMemo(() => {
    return {
      salonId,
      staffId: staffFilterId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      status: status === "all" ? undefined : status,
      compact: true,
      includeStaff: true,
      sortBy: "date",
      sortOrder: "desc",
    };
  }, [salonId, staffFilterId, dateFrom, dateTo, status]);

  const appointmentsTable = useTable<Appointment>({
    path: "appointments",
    query: historyQuery,
    enabled: !!salonId,
    initialPerPage: HISTORY_PAGE_SIZE,
    options: {
      staleTime: 1000 * 30,
    },
  });
  const {
    data: historySummary,
    isLoading: isHistorySummaryLoading,
    isFetching: isHistorySummaryFetching,
  } = useGet<AppointmentHistorySummary>({
    path: "appointments/history-summary",
    query: {
      salonId,
      staffId: staffFilterId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      status: status === "all" ? undefined : status,
      search: appointmentsTable.search || undefined,
    },
    options: {
      enabled: !!salonId,
      staleTime: 1000 * 30,
    },
  });

  const appointments = appointmentsTable.items;
  const { staff: staffMembers } = useSalonStaff(salonId, {
    enabled: !!salonId,
  });

  const staffOptions = useMemo(
    () =>
      buildStaffOptions({
        user,
        staffMembers,
        includeAll: true,
        allStaffId: ALL_STAFF_ID,
        allLabel: t("common.all"),
      }),
    [user, staffMembers, t],
  );

  const stats = historySummary ?? EMPTY_HISTORY_SUMMARY;
  const showStatsLoading =
    (isHistorySummaryLoading || isHistorySummaryFetching) && !historySummary;
  const showTableLoading =
    (appointmentsTable.isLoading || appointmentsTable.isFetching) &&
    appointments.length === 0;

  const handleDateFromChange = useCallback(
    (nextValue: string) => {
      appointmentsTable.resetPage();
      setDateFrom(nextValue);
      if (dateTo && nextValue && nextValue > dateTo) {
        setDateTo(nextValue);
      }
    },
    [appointmentsTable, dateTo],
  );

  const handleDateToChange = useCallback(
    (nextValue: string) => {
      appointmentsTable.resetPage();
      setDateTo(nextValue);
      if (dateFrom && nextValue && nextValue < dateFrom) {
        setDateFrom(nextValue);
      }
    },
    [appointmentsTable, dateFrom],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.history")}
        description={t("history.description")}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("history.totalAppointments")}
          </p>
          {showStatsLoading ? (
            <div className="flex items-center h-7">
              <Spinner size="sm" />
            </div>
          ) : (
            <p className="text-2xl font-bold">{stats.total}</p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("history.completedAppointments")}
          </p>
          {showStatsLoading ? (
            <div className="flex items-center h-7">
              <Spinner size="sm" />
            </div>
          ) : (
            <p className="text-2xl font-bold text-emerald-600">
              {stats.completed}
            </p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("history.unpaidAppointments")}
          </p>
          {showStatsLoading ? (
            <div className="flex items-center h-7">
              <Spinner size="sm" />
            </div>
          ) : (
            <p className="text-2xl font-bold text-amber-600">
              {stats.unpaid}
            </p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("history.totalRevenue")}
          </p>
          {showStatsLoading ? (
            <div className="flex items-center h-7">
              <Spinner size="sm" />
            </div>
          ) : (
            <p className="text-2xl font-bold text-accent-pink">
              {formatCurrency(stats.revenue)}
            </p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("history.averageTicket")}
          </p>
          {showStatsLoading ? (
            <div className="flex items-center h-7">
              <Spinner size="sm" />
            </div>
          ) : (
            <p className="text-2xl font-bold">
              {formatCurrency(stats.averageTicket)}
            </p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("history.noShowAppointments")}
          </p>
          {showStatsLoading ? (
            <div className="flex items-center h-7">
              <Spinner size="sm" />
            </div>
          ) : (
            <p className="text-2xl font-bold text-rose-600">
              {stats.noShow}
            </p>
          )}
        </Card>
      </div>

      <HistoryView
        appointments={appointments}
        isLoading={showTableLoading}
        search={appointmentsTable.searchInput}
        onSearchChange={appointmentsTable.setSearchInput}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        statusFilter={status}
        onStatusChange={(value) => {
          appointmentsTable.resetPage();
          setStatus(value);
        }}
        staffId={staffId}
        staffOptions={staffOptions}
        onStaffChange={(value) => {
          appointmentsTable.resetPage();
          setStaffId(value);
        }}
        page={appointmentsTable.page}
        perPage={appointmentsTable.perPage}
        totalItems={appointmentsTable.totalItems}
        totalPages={appointmentsTable.totalPages}
        onPageChange={appointmentsTable.setPage}
      />
    </div>
  );
}
