import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, User } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingPanel } from "@/components/loading-panel";
import type { Appointment, User as StaffUser } from "@/types/entities";
import { AppointmentStatus } from "@/types/entities";
import { getLocalDateString, normalizeTime, timeToMinutes } from "./utils";

interface AvailabilityViewProps {
  selectedDate: string;
  timeSlots: string[];
  blockedSlots?: Set<string>;
  isClosed?: boolean;
  appointments: Appointment[];
  staffMembers: StaffUser[];
  isLoading?: boolean;
  onMakeAppointment: (staffId: string, time: string) => void;
}

const getStaffLabel = (staff: StaffUser): string => {
  const fullName = `${staff.firstName || ""} ${staff.lastName || ""}`.trim();
  if (fullName) return fullName;
  if (staff.name) return staff.name;
  if (staff.email) return staff.email;
  return "Staff";
};

export function AvailabilityView({
  selectedDate,
  timeSlots,
  blockedSlots,
  isClosed = false,
  appointments,
  staffMembers,
  isLoading = false,
  onMakeAppointment,
}: AvailabilityViewProps) {
  const { t } = useTranslation();

  const now = new Date();
  const todayStr = getLocalDateString(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const availabilityByStaff = useMemo(() => {
    if (isLoading || isClosed || staffMembers.length === 0) {
      return [] as Array<{ staff: StaffUser; slots: string[] }>;
    }
    const appointmentsByStaff = new Map<string, Appointment[]>();

    appointments.forEach((appointment) => {
      if (appointment.status === AppointmentStatus.CANCELLED) return;
      if (appointment.date !== selectedDate) return;
      if (!appointment.staffId) return;
      const list = appointmentsByStaff.get(appointment.staffId) || [];
      list.push(appointment);
      appointmentsByStaff.set(appointment.staffId, list);
    });

    return staffMembers.map((staff) => {
      const staffAppointments = appointmentsByStaff.get(staff.id) || [];
      const slots = timeSlots.filter((time) => {
        if (blockedSlots?.has(time)) return false;
        if (selectedDate < todayStr) return false;
        const slotMinutes = timeToMinutes(time);
        if (selectedDate === todayStr && slotMinutes < currentMinutes) {
          return false;
        }
        return !staffAppointments.some((appointment) => {
          const start = timeToMinutes(normalizeTime(appointment.startTime));
          const end = timeToMinutes(normalizeTime(appointment.endTime));
          if (end <= start) {
            return normalizeTime(appointment.startTime) === time;
          }
          return slotMinutes >= start && slotMinutes < end;
        });
      });

      return { staff, slots };
    });
  }, [
    isLoading,
    isClosed,
    staffMembers.length,
    appointments,
    staffMembers,
    timeSlots,
    blockedSlots,
    selectedDate,
    todayStr,
    currentMinutes,
  ]);

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

  if (!staffMembers.length) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Calendar className="h-10 w-10 mx-auto mb-3" />
          <p className="text-sm font-medium">{t("agenda.noAvailability")}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {availabilityByStaff.map(({ staff, slots }) => (
        <Card key={staff.id} className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">{getStaffLabel(staff)}</p>
                <p className="text-xs text-muted-foreground">
                  {slots.length} {t("agenda.availableSlots")}
                </p>
              </div>
            </div>
          </div>

          {slots.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {t("agenda.noAvailability")}
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((time) => (
                <div
                  key={time}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{time}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onMakeAppointment(staff.id, time)}
                  >
                    {t("agenda.makeAppointment")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
