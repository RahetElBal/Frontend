import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import type { Appointment } from "@/pages/user/agenda/types";
import { getTodaysAppointments, statusColors } from "./utils";

interface TodaysAppointmentsProps {
  appointments?: Appointment[];
  formatTime: (value: string | Date) => string;
}
export function TodaysAppointments({
  appointments,
  formatTime,
}: TodaysAppointmentsProps) {
  const { t } = useTranslation();

  const allAppointments = appointments || [];
  const todaysAppointments = getTodaysAppointments(allAppointments);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {t("dashboard.todaysAppointments")}
        </h2>
      </div>
      <div className="space-y-3">
        {todaysAppointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t("dashboard.noAppointments")}
          </p>
        ) : (
          todaysAppointments.slice(0, 5).map((apt) => (
            <div
              key={apt.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-accent-pink/10 text-accent-pink">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">
                    {apt.client?.firstName} {apt.client?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {apt.service?.name}
                  </p>
                </div>
              </div>
              <div className="text-end">
                <p className="font-medium">{formatTime(apt.startTime)}</p>
                <Badge variant={statusColors[apt.status]}>{apt.status}</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
