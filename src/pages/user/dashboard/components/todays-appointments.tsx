import { useTranslation } from "react-i18next";
import { Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import { type Appointment } from "@/types/entities";
import type { PaginatedResponse } from "@/types";
import { getTodaysAppointments, statusColors } from "../utils";

interface TodaysAppointmentsProps {
  appointments?: PaginatedResponse<Appointment>;
}
export function TodaysAppointments({ appointments }: TodaysAppointmentsProps) {
  const { t } = useTranslation();

  const allAppointments = appointments?.data || [];
  const todaysAppointments = getTodaysAppointments(allAppointments);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {t("dashboard.todaysAppointments")}
        </h2>
        <Button variant="ghost" size="sm" className="gap-1">
          {t("common.viewAll")}
          <ArrowRight className="h-4 w-4" />
        </Button>
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
                <p className="font-medium">{apt.startTime}</p>
                <Badge variant={statusColors[apt.status]}>{apt.status}</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
