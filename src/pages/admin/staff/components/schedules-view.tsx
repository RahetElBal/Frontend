import { useTranslation } from "react-i18next";
import { User } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/pages/admin/users/types";
import type { StaffSchedule } from "../types";
import type { DayOfWeek } from "../enum";

const DAYS_OF_WEEK: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

interface SchedulesViewProps {
  staffMembers: UserType[];
  selectedStaff: string | null;
  getStaffScheduleForDay: (
    staffId: string,
    day: string,
  ) => StaffSchedule | undefined;
  onEditSchedule: (schedule: StaffSchedule) => void;
}

export function SchedulesView({
  staffMembers,
  selectedStaff,
  getStaffScheduleForDay,
  onEditSchedule,
}: SchedulesViewProps) {
  const { t } = useTranslation();

  const displayStaff = selectedStaff
    ? staffMembers.filter((s) => s.id === selectedStaff)
    : staffMembers;

  if (displayStaff.length === 0) {
    return (
      <Card className="p-8 text-center">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">{t("staff.noStaff")}</h3>
        <p className="text-muted-foreground">{t("staff.noStaffDescription")}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {displayStaff.map((staff) => (
        <Card key={staff.id} className="overflow-hidden">
          <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
            {staff.picture ? (
              <img
                src={staff.picture}
                alt={staff.firstName}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-accent-pink/20 flex items-center justify-center">
                <span className="font-semibold text-accent-pink">
                  {staff.firstName?.[0]}
                  {staff.lastName?.[0]}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold">
                {staff.firstName} {staff.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{staff.email}</p>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-7">
              {DAYS_OF_WEEK.map((day) => {
                const schedule = getStaffScheduleForDay(staff.id, day);
                return (
                  <div
                    key={day}
                    className={cn(
                      "p-3 rounded-lg border text-center cursor-pointer transition-colors hover:border-accent-pink",
                      schedule?.isWorking
                        ? "bg-green-50 border-green-200"
                        : "bg-muted/50",
                    )}
                    onClick={() => schedule && onEditSchedule(schedule)}
                  >
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                      {t(`days.${day}`)}
                    </p>
                    {schedule?.isWorking ? (
                      <>
                        <p className="text-sm font-semibold text-green-700">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                        {schedule.breakStartTime && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("staff.break")}: {schedule.breakStartTime} -{" "}
                            {schedule.breakEndTime}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t("staff.dayOff")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
