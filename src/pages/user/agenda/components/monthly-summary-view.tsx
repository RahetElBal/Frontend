import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types/entities";
import { AppointmentStatus } from "@/types/entities";
import { getLocalDateString } from "./utils";

const dayKeys = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const monthKeys = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

interface MonthlySummaryViewProps {
  appointments: Appointment[];
  selectedDate: Date;
  onSelectDate: (date: string) => void;
}

type DayCounts = {
  pending: number;
  completed: number;
};

const isPendingStatus = (status: AppointmentStatus) =>
  status === AppointmentStatus.PENDING ||
  status === AppointmentStatus.CONFIRMED ||
  status === AppointmentStatus.IN_PROGRESS ||
  status === AppointmentStatus.OVERDUE;

export function MonthlySummaryView({
  appointments,
  selectedDate,
  onSelectDate,
}: MonthlySummaryViewProps) {
  const { t } = useTranslation();
  const selectedDateStr = getLocalDateString(selectedDate);
  const todayStr = getLocalDateString();

  const countsByDate = useMemo(() => {
    const map = new Map<string, DayCounts>();

    appointments.forEach((appointment) => {
      if (!appointment.date) return;
      if (
        appointment.status === AppointmentStatus.CANCELLED ||
        appointment.status === AppointmentStatus.NO_SHOW
      ) {
        return;
      }

      const entry = map.get(appointment.date) ?? { pending: 0, completed: 0 };
      if (appointment.status === AppointmentStatus.COMPLETED) {
        entry.completed += 1;
      } else if (isPendingStatus(appointment.status)) {
        entry.pending += 1;
      } else {
        entry.pending += 1;
      }
      map.set(appointment.date, entry);
    });

    return map;
  }, [appointments]);

  const monthStart = useMemo(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    [selectedDate],
  );

  const year = monthStart.getFullYear();
  const monthIndex = monthStart.getMonth();

  const monthLabel = t(`dateTime.months.${monthKeys[monthIndex]}`);

  const goToMonth = useCallback(
    (offset: number) => {
      const next = new Date(year, monthIndex + offset, 1);
      onSelectDate(getLocalDateString(next));
    },
    [year, monthIndex, onSelectDate],
  );

  const calendarCells = useMemo(() => {
    const firstWeekday = (monthStart.getDay() + 6) % 7; // Monday = 0
    const totalCells = 42;

    return Array.from({ length: totalCells }, (_, index) => {
      const dayOffset = index - firstWeekday;
      const date = new Date(year, monthIndex, dayOffset + 1);
      const dateStr = getLocalDateString(date);
      const inMonth = date.getMonth() === monthIndex;
      const counts = countsByDate.get(dateStr) ?? { pending: 0, completed: 0 };

      return {
        date,
        dateStr,
        inMonth,
        counts,
      };
    });
  }, [monthStart, year, monthIndex, countsByDate]);

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">
            {monthLabel} {year}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span>{t("agenda.statuses.pending")}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>{t("agenda.statuses.completed")}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToMonth(-1)}
            aria-label={t("common.previous")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToMonth(1)}
            aria-label={t("common.next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 text-xs font-medium text-muted-foreground">
        {dayKeys.map((key) => (
          <div key={key} className="px-2 py-1 uppercase tracking-wide">
            {t(`dateTime.daysShort.${key}`)}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-px rounded-lg bg-muted/30 overflow-hidden">
        {calendarCells.map((cell) => {
          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === selectedDateStr;
          const isPast = cell.dateStr < todayStr;
          const hasCounts =
            cell.counts.pending > 0 || cell.counts.completed > 0;

          return (
            <button
              key={cell.dateStr}
              type="button"
              onClick={() => onSelectDate(cell.dateStr)}
              className={cn(
                "min-h-[96px] p-2 text-left bg-white transition",
                "hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/50",
                !cell.inMonth && "bg-muted/10 text-muted-foreground",
                isSelected && "ring-2 ring-accent-pink ring-inset",
                isToday && "ring-1 ring-accent-pink/50 ring-inset",
                isPast && "text-muted-foreground",
              )}
              aria-label={`${cell.dateStr} ${cell.counts.pending} ${t(
                "agenda.statuses.pending",
              )} ${cell.counts.completed} ${t("agenda.statuses.completed")}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    !cell.inMonth && "opacity-60",
                  )}
                >
                  {cell.date.getDate()}
                </span>
                {isToday && (
                  <span
                    className="h-2 w-2 rounded-full bg-accent-pink"
                    title={t("dateTime.today")}
                  />
                )}
              </div>

              <div className="mt-auto flex items-center gap-2 pt-4">
                {hasCounts ? (
                  <>
                    {cell.counts.pending > 0 && (
                      <span
                        className="h-6 w-6 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold flex items-center justify-center"
                        title={`${cell.counts.pending} ${t(
                          "agenda.statuses.pending",
                        )}`}
                      >
                        {cell.counts.pending}
                      </span>
                    )}
                    {cell.counts.completed > 0 && (
                      <span
                        className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center"
                        title={`${cell.counts.completed} ${t(
                          "agenda.statuses.completed",
                        )}`}
                      >
                        {cell.counts.completed}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="h-6" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
