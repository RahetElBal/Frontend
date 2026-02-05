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

export function BookingSettings({ formData, updateField }: SettingsSectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {t("salonSettings.tabs.booking")}
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">
              {t("salonSettings.allowOnlineBooking")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.allowOnlineBookingDescription")}
            </p>
          </div>
          <Switch
            checked={formData.allowOnlineBooking}
            onCheckedChange={(checked) =>
              updateField("allowOnlineBooking", checked)
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("salonSettings.slotDuration")}</Label>
            <Select
              value={String(formData.bookingSlotDuration)}
              onValueChange={(value) =>
                updateField("bookingSlotDuration", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("salonSettings.leadTime")}</Label>
            <Select
              value={String(formData.bookingLeadTime)}
              onValueChange={(value) =>
                updateField("bookingLeadTime", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">
                  {t("salonSettings.noLeadTime")}
                </SelectItem>
                <SelectItem value="1">1 {t("common.hour")}</SelectItem>
                <SelectItem value="2">2 {t("common.hours")}</SelectItem>
                <SelectItem value="24">24 {t("common.hours")}</SelectItem>
                <SelectItem value="48">48 {t("common.hours")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("salonSettings.bookingWindow")}</Label>
            <Select
              value={String(formData.bookingWindowDays)}
              onValueChange={(value) =>
                updateField("bookingWindowDays", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 {t("common.days")}</SelectItem>
                <SelectItem value="14">14 {t("common.days")}</SelectItem>
                <SelectItem value="30">30 {t("common.days")}</SelectItem>
                <SelectItem value="60">60 {t("common.days")}</SelectItem>
                <SelectItem value="90">90 {t("common.days")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("salonSettings.cancellationDeadline")}</Label>
            <Select
              value={String(formData.cancellationDeadline)}
              onValueChange={(value) =>
                updateField("cancellationDeadline", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("salonSettings.anytime")}</SelectItem>
                <SelectItem value="2">2 {t("common.hours")}</SelectItem>
                <SelectItem value="12">12 {t("common.hours")}</SelectItem>
                <SelectItem value="24">24 {t("common.hours")}</SelectItem>
                <SelectItem value="48">48 {t("common.hours")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">{t("salonSettings.requireDeposit")}</p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.requireDepositDescription")}
            </p>
          </div>
          <Switch
            checked={formData.requireDeposit}
            onCheckedChange={(checked) =>
              updateField("requireDeposit", checked)
            }
          />
        </div>

        {formData.requireDeposit && (
          <div className="grid gap-4 sm:grid-cols-2 ps-4">
            <div className="space-y-2">
              <Label>{t("salonSettings.depositAmount")}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.depositAmount || ""}
                onChange={(e) =>
                  updateField(
                    "depositAmount",
                    parseFloat(e.target.value) || undefined,
                  )
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("salonSettings.depositPercentage")}</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.depositPercentage || ""}
                onChange={(e) =>
                  updateField(
                    "depositPercentage",
                    parseInt(e.target.value) || undefined,
                  )
                }
                placeholder="0"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
