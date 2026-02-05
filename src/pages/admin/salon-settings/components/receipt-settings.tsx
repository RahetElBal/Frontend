import { useTranslation } from "react-i18next";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { SettingsSectionProps } from "../types";

export function ReceiptSettings({ formData, updateField }: SettingsSectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {t("salonSettings.tabs.receipt")}
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t("salonSettings.receiptHeader")}</Label>
          <Textarea
            value={formData.receiptHeader || ""}
            onChange={(e) => updateField("receiptHeader", e.target.value)}
            rows={3}
            placeholder={t("salonSettings.receiptHeaderPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("salonSettings.receiptFooter")}</Label>
          <Textarea
            value={formData.receiptFooter || ""}
            onChange={(e) => updateField("receiptFooter", e.target.value)}
            rows={3}
            placeholder={t("salonSettings.receiptFooterPlaceholder")}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">
              {t("salonSettings.showStaffOnReceipt")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.showStaffOnReceiptDescription")}
            </p>
          </div>
          <Switch
            checked={formData.showStaffOnReceipt}
            onCheckedChange={(checked) =>
              updateField("showStaffOnReceipt", checked)
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("salonSettings.invoicePrefix")}</Label>
            <Input
              value={formData.invoicePrefix || ""}
              onChange={(e) => updateField("invoicePrefix", e.target.value)}
              placeholder="INV-"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("salonSettings.nextInvoiceNumber")}</Label>
            <Input
              type="number"
              min="1"
              value={formData.invoiceNextNumber || ""}
              onChange={(e) =>
                updateField("invoiceNextNumber", parseInt(e.target.value))
              }
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
