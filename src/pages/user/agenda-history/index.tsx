import { useMemo, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/spinner";
import { useGet, withParams } from "@/hooks/useGet";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/navigation";
import type { Appointment, PaginatedResponse, User } from "@/types";
import { AppointmentStatus } from "@/types/entities";

import { HistoryView } from "../agenda/components/history-view";
import {
  ALL_STAFF_ID,
  buildStaffOptions,
  getLocalDateString,
  safeExtractArray,
  getAppointmentDisplayStatus,
} from "../agenda/utils";

const getAppointmentAmount = (appointment: Appointment): number => {
  return Number(
    appointment.price ??
      appointment.customPrice ??
      appointment.basePrice ??
      appointment.service?.price ??
      0,
  );
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
  const historyParams = useMemo(() => {
    const statusParam =
      status === "all" || status === AppointmentStatus.OVERDUE
        ? undefined
        : status;
    return {
      salonId,
      perPage: 200,
      staffId: staffFilterId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      status: statusParam,
      sortBy: "date",
      sortOrder: "desc",
    };
  }, [salonId, staffFilterId, dateFrom, dateTo, status]);

  const { data: appointmentsData, isLoading: isAppointmentsLoading } =
    useGet<PaginatedResponse<Appointment>>(
      withParams("appointments", historyParams),
      {
        enabled: !!salonId,
        staleTime: 1000 * 30,
      },
    );

  const { data: staffResponse } = useGet<PaginatedResponse<User>>(
    withParams("users", { salonId, role: "user", perPage: 100 }),
    { enabled: !!salonId, staleTime: 1000 * 60 * 5 },
  );

  const appointments = safeExtractArray<Appointment>(appointmentsData);
  const staffMembers = safeExtractArray<User>(staffResponse);
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

  const statsAppointments = useMemo(() => {
    if (status === "all") return appointments;
    return appointments.filter(
      (appointment) => getAppointmentDisplayStatus(appointment) === status,
    );
  }, [appointments, status]);

  const stats = useMemo(() => {
    const base = {
      total: statsAppointments.length,
      completed: 0,
      unpaid: 0,
      noShow: 0,
      revenue: 0,
      averageTicket: 0,
    };

    if (statsAppointments.length === 0) return base;

    let paidCount = 0;

    statsAppointments.forEach((appointment) => {
      if (appointment.status === AppointmentStatus.COMPLETED) {
        base.completed += 1;
      }
      if (appointment.status === AppointmentStatus.NO_SHOW) {
        base.noShow += 1;
      }
      if (!appointment.paid) {
        base.unpaid += 1;
      }
      if (appointment.paid) {
        paidCount += 1;
        base.revenue += getAppointmentAmount(appointment);
      }
    });

    base.averageTicket = paidCount > 0 ? base.revenue / paidCount : 0;
    return base;
  }, [statsAppointments]);

  const showStatsLoading = isAppointmentsLoading && appointments.length === 0;

  const handleDateFromChange = useCallback(
    (nextValue: string) => {
      setDateFrom(nextValue);
      if (dateTo && nextValue && nextValue > dateTo) {
        setDateTo(nextValue);
      }
    },
    [dateTo],
  );

  const handleDateToChange = useCallback(
    (nextValue: string) => {
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
        isLoading={showStatsLoading}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        statusFilter={status}
        onStatusChange={(value) => setStatus(value)}
        staffId={staffId}
        staffOptions={staffOptions}
        onStaffChange={(value) => setStaffId(value)}
      />
    </div>
  );
}
