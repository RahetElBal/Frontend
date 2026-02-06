import { useTranslation } from "react-i18next";
import { Plus, Bell, BellRing, Calendar, List, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import { Card } from "@/components/ui/card";

interface CalendarToolbarProps {
  notificationsEnabled: boolean;
  onNotificationToggle: () => void;
  onNewAppointment: () => void;
  confirmedCount: number;
  pendingCount: number;
  totalCount: number;
  isNewAppointmentDisabled?: boolean;
  newAppointmentDisabledReason?: string;
}

export function CalendarToolbar({
  notificationsEnabled,
  onNotificationToggle,
  onNewAppointment,
  confirmedCount,
  pendingCount,
  totalCount,
  isNewAppointmentDisabled = false,
  newAppointmentDisabledReason,
}: CalendarToolbarProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="success" className="gap-1">
            <Calendar className="h-3 w-3" />
            {confirmedCount} {t("agenda.confirmed")}
          </Badge>
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            {pendingCount} {t("agenda.pending")}
          </Badge>
          <Badge variant="default" className="gap-1">
            <List className="h-3 w-3" />
            {totalCount} {t("common.total")}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={notificationsEnabled ? "default" : "outline"}
            size="icon"
            onClick={onNotificationToggle}
            title={
              notificationsEnabled
                ? t("agenda.notificationsOn")
                : t("agenda.enableNotifications")
            }
          >
            {notificationsEnabled ? (
              <BellRing className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
          </Button>
          <Button
            className="gap-2"
            onClick={onNewAppointment}
            disabled={isNewAppointmentDisabled}
            title={
              isNewAppointmentDisabled ? newAppointmentDisabledReason : undefined
            }
          >
            <Plus className="h-4 w-4" />
            {t("agenda.newAppointment")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
