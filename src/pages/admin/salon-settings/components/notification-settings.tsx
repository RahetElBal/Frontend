import { useTranslation } from "react-i18next";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const reminderOptions = [1, 2, 4, 6, 12, 24, 48];

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
            checked={Boolean(formData.sendAppointmentConfirmation)}
            onCheckedChange={(checked) =>
              updateField("sendAppointmentConfirmation", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">
              {t("salonSettings.appointmentConfirmationReminder")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.appointmentConfirmationReminderDescription")}
            </p>
          </div>
          <Switch
            checked={Boolean(formData.sendAppointmentConfirmationReminder)}
            onCheckedChange={(checked) =>
              updateField("sendAppointmentConfirmationReminder", checked)
            }
          />
        </div>

        {formData.sendAppointmentConfirmationReminder && (
          <div className="ps-4 space-y-2">
            <Label>{t("salonSettings.confirmationReminderTiming")}</Label>
            <Select
              value={String(formData.confirmationReminderHoursBefore ?? 24)}
              onValueChange={(value) =>
                updateField("confirmationReminderHoursBefore", parseInt(value))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reminderOptions.map((hours) => (
                  <SelectItem key={hours} value={String(hours)}>
                    {hours}{" "}
                    {hours === 1 ? t("common.hour") : t("common.hours")}{" "}
                    {t("common.before")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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
            checked={Boolean(formData.sendAppointmentReminder)}
            onCheckedChange={(checked) =>
              updateField("sendAppointmentReminder", checked)
            }
          />
        </div>

        {formData.sendAppointmentReminder && (
          <div className="ps-4 space-y-2">
            <Label>{t("salonSettings.reminderTiming")}</Label>
            <Select
              value={String(formData.reminderHoursBefore ?? 2)}
              onValueChange={(value) =>
                updateField("reminderHoursBefore", parseInt(value))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reminderOptions.map((hours) => (
                  <SelectItem key={hours} value={String(hours)}>
                    {hours}{" "}
                    {hours === 1 ? t("common.hour") : t("common.hours")}{" "}
                    {t("common.before")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">
              {t("salonSettings.appointmentConfirmationPdf")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.appointmentConfirmationPdfDescription")}
            </p>
          </div>
          <Switch
            checked={Boolean(formData.sendAppointmentConfirmationPdf)}
            onCheckedChange={(checked) =>
              updateField("sendAppointmentConfirmationPdf", checked)
            }
          />
        </div>

        {formData.sendAppointmentConfirmationPdf && (
          <div className="ps-4 space-y-2">
            <Label>{t("salonSettings.appointmentPdfBackgroundImage")}</Label>
            <Input
              value={formData.appointmentPdfBackgroundImage ?? ""}
              onChange={(event) =>
                updateField("appointmentPdfBackgroundImage", event.target.value)
              }
              placeholder={t(
                "salonSettings.appointmentPdfBackgroundImagePlaceholder",
              )}
            />
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.appointmentPdfBackgroundImageDescription")}
            </p>
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
            checked={Boolean(formData.sendBirthdayGreeting)}
            onCheckedChange={(checked) =>
              updateField("sendBirthdayGreeting", checked)
            }
          />
        </div>
      </div>
    </Card>
  );
}
