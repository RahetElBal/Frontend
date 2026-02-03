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
import type { Service } from "@/types/entities";
import { translateServiceName } from "@/common/service-translations";
import type { SettingsSectionProps } from "../types";

interface LoyaltySettingsProps extends SettingsSectionProps {
  services: Service[];
  isLoading?: boolean;
}

export function LoyaltySettings({
  formData,
  updateField,
  services,
  isLoading = false,
}: LoyaltySettingsProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {t("salonSettings.tabs.loyalty")}
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">{t("salonSettings.loyaltyEnabled")}</p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.loyaltyEnabledDescription")}
            </p>
          </div>
          <Switch
            checked={formData.loyaltyEnabled}
            onCheckedChange={(checked) =>
              updateField("loyaltyEnabled", checked)
            }
          />
        </div>

        {formData.loyaltyEnabled && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("salonSettings.pointsPerCurrency")}</Label>
              <Input
                type="number"
                min="1"
                value={formData.loyaltyPointsPerCurrency || ""}
                onChange={(e) =>
                  updateField(
                    "loyaltyPointsPerCurrency",
                    parseInt(e.target.value)
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("salonSettings.pointsPerCurrencyDescription")}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("salonSettings.pointValue")}</Label>
              <Input
                type="number"
                min="0"
                step="0.001"
                value={formData.loyaltyPointValue || ""}
                onChange={(e) =>
                  updateField("loyaltyPointValue", parseFloat(e.target.value))
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("salonSettings.pointValueDescription")}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("salonSettings.minimumRedemption")}</Label>
              <Input
                type="number"
                min="1"
                value={formData.loyaltyMinimumRedemption || ""}
                onChange={(e) =>
                  updateField(
                    "loyaltyMinimumRedemption",
                    parseInt(e.target.value)
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("salonSettings.minimumRedemptionDescription")}
              </p>
            </div>
            <div className="space-y-2 sm:col-span-3">
              <Label>{t("salonSettings.loyaltyRewardService")}</Label>
              <Select
                value={formData.loyaltyRewardServiceId || "none"}
                onValueChange={(value) =>
                  updateField(
                    "loyaltyRewardServiceId",
                    value === "none" ? "" : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "salonSettings.loyaltyRewardServicePlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("common.none")}</SelectItem>
                  {isLoading ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      {t("common.loading")}
                    </div>
                  ) : services.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      {t("common.noResults")}
                    </div>
                  ) : (
                    services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {translateServiceName(t, service)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("salonSettings.loyaltyRewardServiceDescription")}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("salonSettings.loyaltyRewardDiscountType")}</Label>
              <Select
                value={formData.loyaltyRewardDiscountType || "percent"}
                onValueChange={(value) =>
                  updateField(
                    "loyaltyRewardDiscountType",
                    value as "percent" | "fixed"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">
                    {t("salonSettings.loyaltyRewardDiscountTypePercent")}
                  </SelectItem>
                  <SelectItem value="fixed">
                    {t("salonSettings.loyaltyRewardDiscountTypeFixed")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("salonSettings.loyaltyRewardDiscountValue")}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.loyaltyRewardDiscountValue ?? ""}
                onChange={(e) =>
                  updateField(
                    "loyaltyRewardDiscountValue",
                    parseFloat(e.target.value)
                  )
                }
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
