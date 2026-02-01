import { useTranslation } from "react-i18next";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { SettingsSectionProps } from "../types";

export function TaxSettings({ formData, updateField }: SettingsSectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">{t("salonSettings.tabs.tax")}</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">{t("salonSettings.taxEnabled")}</p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.taxEnabledDescription")}
            </p>
          </div>
          <Switch
            checked={formData.taxEnabled}
            onCheckedChange={(checked) => updateField("taxEnabled", checked)}
          />
        </div>

        {formData.taxEnabled && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("salonSettings.taxRate")} (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.taxRate || ""}
                  onChange={(e) =>
                    updateField("taxRate", parseFloat(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("salonSettings.taxNumber")}</Label>
                <Input
                  value={formData.taxNumber || ""}
                  onChange={(e) => updateField("taxNumber", e.target.value)}
                  placeholder="FR12345678901"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">
                  {t("salonSettings.pricesIncludeTax")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("salonSettings.pricesIncludeTaxDescription")}
                </p>
              </div>
              <Switch
                checked={formData.pricesIncludeTax}
                onCheckedChange={(checked) =>
                  updateField("pricesIncludeTax", checked)
                }
              />
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
