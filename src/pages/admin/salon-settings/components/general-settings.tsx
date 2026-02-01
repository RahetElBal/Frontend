import { useTranslation } from "react-i18next";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SettingsSectionProps } from "../types";

const CURRENCIES = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "DZD", symbol: "د.ج", name: "Algerian Dinar" },
];

const TIMEZONES = [
  "Europe/Paris",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Africa/Algiers",
];

export function GeneralSettings({ formData, updateField }: SettingsSectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {t("salonSettings.tabs.general")}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("salonSettings.currency")}</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => updateField("currency", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} - {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("salonSettings.timezone")}</Label>
          <Select
            value={formData.timezone}
            onValueChange={(value) => updateField("timezone", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("salonSettings.dateFormat")}</Label>
          <Select
            value={formData.dateFormat}
            onValueChange={(value) => updateField("dateFormat", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">
                DD/MM/YYYY (31/12/2024)
              </SelectItem>
              <SelectItem value="MM/DD/YYYY">
                MM/DD/YYYY (12/31/2024)
              </SelectItem>
              <SelectItem value="YYYY-MM-DD">
                YYYY-MM-DD (2024-12-31)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("salonSettings.timeFormat")}</Label>
          <Select
            value={formData.timeFormat}
            onValueChange={(value) =>
              updateField("timeFormat", value as "12h" | "24h")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24h (14:00)</SelectItem>
              <SelectItem value="12h">12h (2:00 PM)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
