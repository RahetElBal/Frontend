import { useTranslation } from "react-i18next";
import {
  Plus,
  Calendar,
  User,
  Scissors,
  Clock,
  DollarSign,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { LoadingPanel } from "@/components/loading-panel";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types/entities";
import { AppointmentStatus } from "@/types/entities";
import {
  statusColors,
  getCurrentTimeString,
  normalizeTime,
  getLocalDateString,
  timeToMinutes,
} from "../utils";
import {
  getServiceImage,
  getServiceImageFallback,
  translateServiceName,
} from "@/common/service-translations";

interface TimelineViewProps {
  appointments: Appointment[];
  selectedDate: Date;
  isLoading: boolean;
  timeSlots: string[];
  blockedSlots?: Set<string>;
  isClosed?: boolean;
  onTimeSlotClick: (time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onRecordPayment?: (appointment: Appointment) => void;
  isRecordingPayment?: boolean;
}

export function TimelineView({
  appointments,
  selectedDate,
  isLoading,
  timeSlots,
  blockedSlots,
  isClosed = false,
  onTimeSlotClick,
  onAppointmentClick,
  onRecordPayment,
  isRecordingPayment = false,
}: TimelineViewProps) {
  const { t } = useTranslation();
  const currentTimeString = getCurrentTimeString();
  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinutes;
  const slotHeight = 60;
  const slotMinutes =
    timeSlots.length >= 2
      ? Math.max(
          5,
          timeToMinutes(timeSlots[1]) - timeToMinutes(timeSlots[0]),
        )
      : 30;
  const firstSlotMinutes = timeSlots.length
    ? timeToMinutes(timeSlots[0])
    : 0;
  const lastSlotMinutes =
    timeSlots.length > 0
      ? timeToMinutes(timeSlots[timeSlots.length - 1]) + slotMinutes
      : 0;
  const showCurrentLine =
    timeSlots.length > 0 &&
    currentTotalMinutes >= firstSlotMinutes &&
    currentTotalMinutes <= lastSlotMinutes;
  const currentLineTop = showCurrentLine
    ? ((currentTotalMinutes - firstSlotMinutes) / slotMinutes) * slotHeight
    : 0;

  // FIX: Use getLocalDateString instead of toISOString to avoid timezone shifts
  const selectedDateStr = getLocalDateString(selectedDate);
  const dayAppointments = appointments.filter(
    (apt) => apt.date === selectedDateStr,
  );

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingPanel label={t("common.loading")} />
      </Card>
    );
  }

  if (isClosed) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Calendar className="h-10 w-10 mx-auto mb-3" />
          <p className="text-sm font-medium">{t("agenda.closedDay")}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto overflow-y-visible">
        <div className="w-full min-w-full">
          <div className="relative">
            {timeSlots.map((time) => {
              const slotMinutesValue = timeToMinutes(time);
              const isCurrentTime = time === currentTimeString;
              const isPastTime = slotMinutesValue < currentTotalMinutes;
              const isBlocked = blockedSlots?.has(time) ?? false;
              const appointment = dayAppointments.find((apt) => {
                const start = timeToMinutes(normalizeTime(apt.startTime));
                const end = timeToMinutes(normalizeTime(apt.endTime));
                if (end <= start) {
                  return normalizeTime(apt.startTime) === time;
                }
                return slotMinutesValue >= start && slotMinutesValue < end;
              });
              const isStartSlot =
                appointment && normalizeTime(appointment.startTime) === time;
              const isOccupied = !!appointment && !isStartSlot;
              const durationMinutes = appointment
                ? Math.max(
                    slotMinutes,
                    timeToMinutes(normalizeTime(appointment.endTime)) -
                      timeToMinutes(normalizeTime(appointment.startTime)),
                  )
                : slotMinutes;
              const slotSpan = appointment
                ? Math.max(1, Math.ceil(durationMinutes / slotMinutes))
                : 1;
              const cellPadding = 8;
              const cardHeight = Math.max(
                slotHeight - cellPadding * 2,
                slotSpan * slotHeight - cellPadding * 2,
              );

              return (
                <div
                  key={time}
                  className={cn(
                    "flex border-b relative overflow-visible",
                    isCurrentTime && "bg-accent-pink/5",
                    isPastTime && "opacity-60",
                  )}
                  style={{ minHeight: `${slotHeight}px` }}
                >
                  <div
                    className={cn(
                      "w-20 shrink-0 py-4 px-3 text-sm font-medium border-r bg-muted/30",
                      isCurrentTime && "text-accent-pink font-bold",
                    )}
                  >
                    {time}
                  </div>

                  <div
                    className={cn(
                      "flex-1 min-h-15 p-2 hover:bg-muted/30 cursor-pointer transition-colors relative",
                      !appointment &&
                        !isBlocked &&
                        "border-l-4 border-l-transparent hover:border-l-accent-pink/30",
                      isBlocked && "bg-muted/40 cursor-not-allowed",
                      isOccupied && "bg-muted/20",
                    )}
                    onClick={() => {
                      if (isBlocked) return;
                      if (!appointment) {
                        onTimeSlotClick(time);
                      } else {
                        onAppointmentClick(appointment);
                      }
                    }}
                  >
                    {appointment && isStartSlot ? (
                      <div
                        className={cn(
                          "rounded-lg p-3 cursor-pointer hover:shadow-md transition-all absolute left-2 right-2 z-10",
                          "border-l-4",
                          appointment.status === AppointmentStatus.CONFIRMED &&
                            "bg-green-50 border-l-green-500",
                          appointment.status === AppointmentStatus.PENDING &&
                            "bg-yellow-50 border-l-yellow-500",
                          appointment.status ===
                            AppointmentStatus.IN_PROGRESS &&
                            "bg-blue-50 border-l-blue-500",
                          appointment.status === AppointmentStatus.COMPLETED &&
                            "bg-gray-50 border-l-gray-400",
                          appointment.status === AppointmentStatus.CANCELLED &&
                            "bg-red-50 border-l-red-500",
                        )}
                        style={{
                          top: `${cellPadding}px`,
                          height: `${cardHeight}px`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {appointment.client?.firstName}{" "}
                                {appointment.client?.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Scissors className="h-3 w-3" />
                              {appointment.service &&
                                getServiceImage(appointment.service) && (
                                  <img
                                    src={getServiceImage(appointment.service)}
                                    alt={translateServiceName(
                                      t,
                                      appointment.service,
                                    )}
                                    className="h-5 w-5 rounded object-cover"
                                    loading="lazy"
                                    onError={(event) => {
                                      const fallback = getServiceImageFallback(
                                        appointment.service!,
                                      );
                                      if (
                                        fallback &&
                                        event.currentTarget.src !== fallback
                                      ) {
                                        event.currentTarget.src = fallback;
                                      }
                                    }}
                                  />
                                )}
                              <span>
                                {appointment.service
                                  ? translateServiceName(t, appointment.service)
                                  : t("common.unknown")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {normalizeTime(appointment.startTime)} -{" "}
                                {normalizeTime(appointment.endTime)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <Badge
                              variant={statusColors[appointment.status]}
                              className="text-xs"
                            >
                              {t(`agenda.statuses.${appointment.status}`, {
                                defaultValue: appointment.status,
                              })}
                            </Badge>
                            {!appointment.paid &&
                              appointment.status !==
                                AppointmentStatus.CANCELLED &&
                              onRecordPayment && (
                                <Button
                                  size="sm"
                                  className="h-9 px-4 text-sm font-semibold whitespace-nowrap shadow-sm bg-red-600 text-white hover:bg-red-500"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onRecordPayment(appointment);
                                  }}
                                  disabled={isRecordingPayment}
                                >
                                  <DollarSign className="h-3 w-3 me-1" />
                                  {isRecordingPayment
                                    ? t("common.loading")
                                    : appointment.status ===
                                        AppointmentStatus.COMPLETED
                                      ? t("agenda.recordPayment")
                                      : t("agenda.completeAndPay")}
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    ) : isBlocked ? (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        {t("agenda.breakTime")}
                      </div>
                    ) : isOccupied ? (
                      <div className="h-full" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground/50 text-sm">
                        <Plus className="h-4 w-4 me-1" />
                        {t("agenda.addSlot")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {showCurrentLine && (
              <div
                className="absolute left-0 right-0 h-0.5 bg-accent-pink z-10 pointer-events-none"
                style={{
                  top: `${currentLineTop}px`,
                }}
              >
                <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-accent-pink" />
              </div>
            )}
          </div>
        </div>
      </div>

      {dayAppointments.length === 0 && (
        <div className="p-12 text-center border-t">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t("agenda.noAppointments")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t("agenda.noAppointmentsDescription")}
          </p>
        </div>
      )}
    </Card>
  );
}
