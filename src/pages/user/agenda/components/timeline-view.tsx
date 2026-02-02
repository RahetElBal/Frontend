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
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types/entities";
import { AppointmentStatus } from "@/types/entities";
import {
  timeSlots,
  statusColors,
  getCurrentTimeString,
  normalizeTime,
  getLocalDateString,
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
  onTimeSlotClick: (time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onRecordPayment?: (appointment: Appointment) => void;
  isRecordingPayment?: boolean;
}

export function TimelineView({
  appointments,
  selectedDate,
  isLoading,
  onTimeSlotClick,
  onAppointmentClick,
  onRecordPayment,
  isRecordingPayment = false,
}: TimelineViewProps) {
  const { t } = useTranslation();
  const currentTimeString = getCurrentTimeString();
  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();

  // FIX: Use getLocalDateString instead of toISOString to avoid timezone shifts
  const selectedDateStr = getLocalDateString(selectedDate);
  const dayAppointments = appointments.filter(
    (apt) => apt.date === selectedDateStr,
  );

  if (isLoading) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        {t("common.loading")}
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-150">
          <div className="relative">
            {timeSlots.map((time) => {
              const isCurrentTime = time === currentTimeString;
              const isPastTime = time < currentTimeString;
              const appointment = dayAppointments.find(
                (apt) => normalizeTime(apt.startTime) === time,
              );

              return (
                <div
                  key={time}
                  className={cn(
                    "flex border-b relative",
                    isCurrentTime && "bg-accent-pink/5",
                    isPastTime && "opacity-60",
                  )}
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
                      "flex-1 min-h-15 p-2 hover:bg-muted/30 cursor-pointer transition-colors",
                      !appointment &&
                        "border-l-4 border-l-transparent hover:border-l-accent-pink/30",
                    )}
                    onClick={() => {
                      if (!appointment) {
                        onTimeSlotClick(time);
                      } else {
                        onAppointmentClick(appointment);
                      }
                    }}
                  >
                    {appointment ? (
                      <div
                        className={cn(
                          "rounded-lg p-3 h-full cursor-pointer hover:shadow-md transition-all",
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
                      >
                        <div className="flex items-start justify-between gap-2">
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
                            {!appointment.paid &&
                              appointment.status !==
                                AppointmentStatus.CANCELLED &&
                              onRecordPayment && (
                                <div className="pt-1">
                                  <Button
                                    size="sm"
                                    className="h-7 px-2 text-xs"
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
                                </div>
                              )}
                          </div>
                          <Badge
                            variant={statusColors[appointment.status]}
                            className="text-xs shrink-0"
                          >
                            {t(`agenda.statuses.${appointment.status}`, {
                              defaultValue: appointment.status,
                            })}
                          </Badge>
                        </div>
                      </div>
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

            {currentHour >= 9 && currentHour < 19 && (
              <div
                className="absolute left-0 right-0 h-0.5 bg-accent-pink z-10 pointer-events-none"
                style={{
                  top: `${
                    ((currentHour - 9) * 2 + (currentMinutes >= 30 ? 1 : 0)) *
                      60 +
                    (currentMinutes % 30) * 2
                  }px`,
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
