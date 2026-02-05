import { useTranslation } from "react-i18next";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SettingsSectionProps } from "../types";

export function NotificationSettings({
  formData,
  updateField,
}: SettingsSectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {t("salonSettings.tabs.notifications")}
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">
              {t("salonSettings.appointmentConfirmation")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.appointmentConfirmationDescription")}
            </p>
          </div>
          <Switch
            checked={formData.sendAppointmentConfirmation}
            onCheckedChange={(checked) =>
              updateField("sendAppointmentConfirmation", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">
              {t("salonSettings.appointmentReminder")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.appointmentReminderDescription")}
            </p>
          </div>
          <Switch
            checked={formData.sendAppointmentReminder}
            onCheckedChange={(checked) =>
              updateField("sendAppointmentReminder", checked)
            }
          />
        </div>

        {formData.sendAppointmentReminder && (
          <div className="ps-4 space-y-2">
            <Label>{t("salonSettings.reminderTiming")}</Label>
            <Select
              value={String(formData.reminderHoursBefore)}
              onValueChange={(value) =>
                updateField("reminderHoursBefore", parseInt(value))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">
                  1 {t("common.hour")} {t("common.before")}
                </SelectItem>
                <SelectItem value="2">
                  2 {t("common.hours")} {t("common.before")}
                </SelectItem>
                <SelectItem value="24">
                  24 {t("common.hours")} {t("common.before")}
                </SelectItem>
                <SelectItem value="48">
                  48 {t("common.hours")} {t("common.before")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">{t("salonSettings.birthdayGreeting")}</p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.birthdayGreetingDescription")}
            </p>
          </div>
          <Switch
            checked={formData.sendBirthdayGreeting}
            onCheckedChange={(checked) =>
              updateField("sendBirthdayGreeting", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">{t("salonSettings.reviewRequest")}</p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.reviewRequestDescription")}
            </p>
          </div>
          <Switch
            checked={formData.sendReviewRequest}
            onCheckedChange={(checked) =>
              updateField("sendReviewRequest", checked)
            }
          />
        </div>
      </div>
    </Card>
  );
}
