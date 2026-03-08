import { useMemo, useState, useCallback, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/spinner";
import { useGet, withParams } from "@/hooks/useGet";
import { useSalonStaff } from "@/contexts/StaffProvider";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/navigation";
import type { Appointment, PaginatedResponse } from "@/types";
import { AppointmentStatus } from "@/types/entities";

import { HistoryView } from "../agenda/components/history-view";
import {
  ALL_STAFF_ID,
  buildStaffOptions,
  getLocalDateString,
  safeExtractArray,
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
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const normalizedSearch = searchInput.trim();
    const timeoutId = window.setTimeout(() => {
      setSearch((previousSearch) =>
        previousSearch === normalizedSearch
          ? previousSearch
          : normalizedSearch,
      );
      setPage((previousPage) => (previousPage === 1 ? previousPage : 1));
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const staffFilterId = staffId === ALL_STAFF_ID ? null : staffId;
  const historyFilters = useMemo(() => {
    return {
      salonId,
      staffId: staffFilterId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      status: status === "all" ? undefined : status,
      search: search || undefined,
    };
  }, [salonId, staffFilterId, dateFrom, dateTo, status, search]);

  const historyParams = useMemo(() => {
    return {
      ...historyFilters,
      skip: (page - 1) * HISTORY_PAGE_SIZE,
      limit: HISTORY_PAGE_SIZE,
      compact: true,
      includeStaff: true,
      sortBy: "date",
      sortOrder: "desc",
    };
  }, [historyFilters, page]);

  const {
    data: appointmentsData,
    isLoading: isAppointmentsLoading,
    isFetching: isAppointmentsFetching,
  } =
    useGet<PaginatedResponse<Appointment>>(
      withParams("appointments", historyParams),
      {
        enabled: !!salonId,
        staleTime: 1000 * 30,
      },
    );
  const {
    data: historySummary,
    isLoading: isHistorySummaryLoading,
    isFetching: isHistorySummaryFetching,
  } = useGet<AppointmentHistorySummary>(
    withParams("appointments/history-summary", historyFilters),
    {
      enabled: !!salonId,
      staleTime: 1000 * 30,
    },
  );

  const appointments = safeExtractArray<Appointment>(appointmentsData);
  const paginationMeta = appointmentsData?.meta;
  const { staff: staffMembers } = useSalonStaff(salonId, {
    enabled: !!salonId,
  });

  useEffect(() => {
    if (!paginationMeta) return;

    const lastPage =
      paginationMeta.total > 0 ? Math.max(1, paginationMeta.lastPage) : 1;
    if (page > lastPage) {
      setPage(lastPage);
    }
  }, [paginationMeta, page]);

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
    (isAppointmentsLoading || isAppointmentsFetching) &&
    appointments.length === 0;

  const handleDateFromChange = useCallback(
    (nextValue: string) => {
      setPage(1);
      setDateFrom(nextValue);
      if (dateTo && nextValue && nextValue > dateTo) {
        setDateTo(nextValue);
      }
    },
    [dateTo],
  );

  const handleDateToChange = useCallback(
    (nextValue: string) => {
      setPage(1);
      setDateTo(nextValue);
      if (dateFrom && nextValue && nextValue < dateFrom) {
        setDateFrom(nextValue);
      }
    },
    [dateFrom],
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
        search={searchInput}
        onSearchChange={setSearchInput}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        statusFilter={status}
        onStatusChange={(value) => {
          setPage(1);
          setStatus(value);
        }}
        staffId={staffId}
        staffOptions={staffOptions}
        onStaffChange={(value) => {
          setPage(1);
          setStaffId(value);
        }}
        page={page}
        perPage={paginationMeta?.perPage ?? HISTORY_PAGE_SIZE}
        totalItems={paginationMeta?.total ?? 0}
        totalPages={Math.max(paginationMeta?.lastPage ?? 0, 1)}
        onPageChange={setPage}
        newestFirst
      />
    </div>
  );
}
