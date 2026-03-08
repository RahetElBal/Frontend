import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/spinner";
import { useLanguage } from "@/hooks/useLanguage";
import type { Appointment } from "@/types/entities";
import { AppointmentStatus } from "@/types/entities";
import {
  getAppointmentDisplayStatus,
  normalizeTime,
  statusColors,
} from "./utils";
import { translateServiceName } from "@/common/service-translations";

type HistoryStatusFilter = "all" | AppointmentStatus;

interface HistoryViewProps {
  appointments: Appointment[];
  isLoading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  statusFilter: HistoryStatusFilter;
  onStatusChange: (value: HistoryStatusFilter) => void;
  staffId: string | null;
  staffOptions: Array<{ id: string; label: string }>;
  onStaffChange: (value: string) => void;
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
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
  search,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  statusFilter,
  onStatusChange,
  staffId,
  staffOptions,
  onStaffChange,
  page,
  perPage,
  totalItems,
  totalPages,
  onPageChange,
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

  const rows = useMemo<AppointmentHistoryRow[]>(() => {
    return appointments.map((appointment) => {
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
      };
    });
  }, [appointments, staffLabelById, t]);

  const showingFrom = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const showingTo = totalItems === 0 ? 0 : Math.min(page * perPage, totalItems);
  const canPrevPage = page > 1;
  const canNextPage = page < totalPages;

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

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("common.search")}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="ps-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("fields.date")}</TableHead>
                <TableHead>{t("fields.time")}</TableHead>
                <TableHead>{t("fields.client")}</TableHead>
                <TableHead>{t("fields.service")}</TableHead>
                <TableHead>{t("fields.staff")}</TableHead>
                <TableHead className="min-w-[140px] whitespace-nowrap">
                  {t("fields.status")}
                </TableHead>
                <TableHead>{t("agenda.paymentStatus")}</TableHead>
                <TableHead className="text-right">{t("fields.total")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Spinner size="sm" />
                      <span className="text-sm">{t("common.loading")}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    {t("common.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={onSelectAppointment ? "cursor-pointer" : undefined}
                    onClick={() => onSelectAppointment?.(row)}
                  >
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.timeRange}</TableCell>
                    <TableCell>{row.clientName}</TableCell>
                    <TableCell>{row.serviceName}</TableCell>
                    <TableCell>{row.staffName}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[row.displayStatus]}>
                        {row.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.paid ? "success" : "warning"}>
                        {row.paymentLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.priceValue)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("common.showingCount", {
              from: showingFrom,
              to: showingTo,
              total: totalItems,
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={!canPrevPage}
            >
              {t("common.previous")}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t("common.pageOf", { page, total: totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={!canNextPage}
            >
              {t("common.next")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
