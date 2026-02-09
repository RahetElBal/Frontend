import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/table/data-table";
import { useTable } from "@/hooks/useTable";
import { useLanguage } from "@/hooks/useLanguage";
import type { Appointment } from "@/types/entities";
import { AppointmentStatus } from "@/types/entities";
import {
  getAppointmentDisplayStatus,
  normalizeTime,
  statusColors,
} from "../utils";
import { translateServiceName } from "@/common/service-translations";

type HistoryStatusFilter = "all" | AppointmentStatus;

interface HistoryViewProps {
  appointments: Appointment[];
  isLoading?: boolean;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  statusFilter: HistoryStatusFilter;
  onStatusChange: (value: HistoryStatusFilter) => void;
  staffId: string | null;
  staffOptions: Array<{ id: string; label: string }>;
  onStaffChange: (value: string) => void;
  onSelectAppointment?: (appointment: Appointment) => void;
}

type AppointmentHistoryRow = Appointment & {
  clientName: string;
  serviceName: string;
  staffName: string;
  timeRange: string;
  displayStatus: AppointmentStatus;
  statusLabel: string;
  paymentLabel: string;
  priceValue: number;
  dateTimeSort: number;
};

const getDisplayPrice = (appointment: Appointment) =>
  Number(
    appointment.price ??
      appointment.customPrice ??
      appointment.basePrice ??
      appointment.service?.price ??
      0,
  );

const getStaffLabel = (
  appointment: Appointment,
  staffLabelById: Map<string, string>,
  fallback: string,
): string => {
  if (appointment.staff) {
    const fullName = `${appointment.staff.firstName || ""} ${
      appointment.staff.lastName || ""
    }`.trim();
    if (fullName) return fullName;
    return appointment.staff.name || appointment.staff.email || fallback;
  }
  if (appointment.staffId) {
    const label = staffLabelById.get(appointment.staffId);
    if (label) return label;
  }
  return fallback;
};

export function HistoryView({
  appointments,
  isLoading = false,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  statusFilter,
  onStatusChange,
  staffId,
  staffOptions,
  onStaffChange,
  onSelectAppointment,
}: HistoryViewProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const staffLabelById = useMemo(() => {
    const map = new Map<string, string>();
    staffOptions.forEach((staff) => {
      if (!staff.id || staff.id === "all") return;
      map.set(staff.id, staff.label);
    });
    return map;
  }, [staffOptions]);

  const filteredAppointments = useMemo(() => {
    if (statusFilter === "all") return appointments;
    return appointments.filter(
      (appointment) =>
        getAppointmentDisplayStatus(appointment) === statusFilter,
    );
  }, [appointments, statusFilter]);

  const rows = useMemo<AppointmentHistoryRow[]>(() => {
    return filteredAppointments.map((appointment) => {
      const clientName = appointment.client
        ? `${appointment.client.firstName || ""} ${
            appointment.client.lastName || ""
          }`.trim() ||
          appointment.client.email ||
          appointment.client.phone ||
          ""
        : "";
      const serviceName = appointment.service
        ? translateServiceName(t, appointment.service)
        : "";
      const staffName = getStaffLabel(appointment, staffLabelById, "");
      const timeRange = `${normalizeTime(appointment.startTime)} - ${normalizeTime(
        appointment.endTime,
      )}`;
      const displayStatus = getAppointmentDisplayStatus(appointment);
      const statusLabel = t(`agenda.statuses.${displayStatus}`, {
        defaultValue: displayStatus,
      });
      const paymentLabel = appointment.paid
        ? t("agenda.paymentPaid")
        : t("agenda.paymentUnpaid");
      const priceValue = getDisplayPrice(appointment);
      const dateTimeSort = new Date(
        `${appointment.date}T${normalizeTime(appointment.startTime) || "00:00"}`,
      ).getTime();

      return {
        ...appointment,
        clientName: clientName || t("common.unknown"),
        serviceName: serviceName || t("common.unknown"),
        staffName: staffName || t("common.unknown"),
        timeRange,
        displayStatus,
        statusLabel,
        paymentLabel,
        priceValue,
        dateTimeSort,
      };
    });
  }, [filteredAppointments, staffLabelById, t]);

  const table = useTable<AppointmentHistoryRow>({
    data: rows,
    initialPerPage: 20,
    initialSort: { key: "dateTimeSort", direction: "desc" },
    searchKeys: [
      "clientName",
      "serviceName",
      "staffName",
      "date",
      "timeRange",
      "statusLabel",
      "paymentLabel",
    ],
  });

  const columns = useMemo<Column<AppointmentHistoryRow>[]>(
    () => [
      {
        key: "dateTimeSort",
        header: t("fields.date"),
        sortable: true,
        render: (row) => row.date,
      },
      {
        key: "timeRange",
        header: t("fields.time"),
        render: (row) => row.timeRange,
      },
      {
        key: "clientName",
        header: t("fields.client"),
        sortable: true,
      },
      {
        key: "serviceName",
        header: t("fields.service"),
        sortable: true,
      },
      {
        key: "staffName",
        header: t("fields.staff"),
        sortable: true,
      },
      {
        key: "displayStatus",
        header: t("fields.status"),
        sortable: true,
        className: "min-w-[140px] whitespace-nowrap",
        render: (row) => (
          <Badge variant={statusColors[row.displayStatus]}>
            {row.statusLabel}
          </Badge>
        ),
      },
      {
        key: "paymentLabel",
        header: t("agenda.paymentStatus"),
        sortable: true,
        render: (row) => (
          <Badge variant={row.paid ? "success" : "warning"}>
            {row.paymentLabel}
          </Badge>
        ),
      },
      {
        key: "priceValue",
        header: t("fields.total"),
        sortable: true,
        className: "text-right",
        render: (row) => formatCurrency(row.priceValue),
      },
    ],
    [t, formatCurrency],
  );

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">
              {t("fields.startDate")}
            </span>
            <Input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => onDateFromChange(event.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">
              {t("fields.endDate")}
            </span>
            <Input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => onDateToChange(event.target.value)}
              className="w-40"
            />
          </div>
          {staffOptions.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">
                {t("fields.staff")}
              </span>
              <Select
                value={staffId || ""}
                onValueChange={(value) => onStaffChange(value)}
              >
                <SelectTrigger className="w-56 bg-white text-black">
                  <SelectValue placeholder={t("fields.staff")} />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  {staffOptions.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">
              {t("fields.status")}
            </span>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                onStatusChange(value as HistoryStatusFilter)
              }
            >
              <SelectTrigger className="w-44 bg-white text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white text-black">
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value={AppointmentStatus.CONFIRMED}>
                  {t("agenda.statuses.confirmed")}
                </SelectItem>
                <SelectItem value={AppointmentStatus.PENDING}>
                  {t("agenda.statuses.pending")}
                </SelectItem>
                <SelectItem value={AppointmentStatus.IN_PROGRESS}>
                  {t("agenda.statuses.in_progress")}
                </SelectItem>
                <SelectItem value={AppointmentStatus.COMPLETED}>
                  {t("agenda.statuses.completed")}
                </SelectItem>
                <SelectItem value={AppointmentStatus.CANCELLED}>
                  {t("agenda.statuses.cancelled")}
                </SelectItem>
                <SelectItem value={AppointmentStatus.NO_SHOW}>
                  {t("agenda.statuses.no_show")}
                </SelectItem>
                <SelectItem value={AppointmentStatus.OVERDUE}>
                  {t("agenda.statuses.overdue")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <DataTable
        table={table}
        columns={columns}
        onRowClick={
          onSelectAppointment ? (row) => onSelectAppointment(row) : undefined
        }
        searchPlaceholder={t("common.search")}
        emptyMessage={t("common.noResults")}
        loading={isLoading}
      />
    </div>
  );
}
