import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { PromotionType, PromotionAppliesTo } from "@/types/entities";
import type { CreatePromotionDto } from "../../types";

const PROMOTION_TYPES: PromotionType[] = [
  "percentage",
  "fixed_amount",
  "buy_x_get_y",
  "free_service",
  "free_product",
  "bundle",
];

const APPLIES_TO_OPTIONS: PromotionAppliesTo[] = [
  "all",
  "services",
  "products",
  "specific_items",
  "categories",
];

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePromotionDto) => void;
  isLoading: boolean;
}

export function PromotionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: PromotionModalProps) {
  const { t } = useTranslation();

  // Compute initial dates once
  const initialDates = useMemo(() => {
    const today = new Date();
    const thirtyDaysLater = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    return {
      startDate: today.toISOString().split("T")[0],
      endDate: thirtyDaysLater.toISOString().split("T")[0],
    };
  }, []);

  const [formData, setFormData] = useState<CreatePromotionDto>({
    name: "",
    description: "",
    code: "",
    type: "percentage",
    appliesTo: "all",
    discountValue: 10,
    minimumPurchase: undefined,
    maximumDiscount: undefined,
    usageLimit: undefined,
    usageLimitPerClient: undefined,
    startDate: initialDates.startDate,
    endDate: initialDates.endDate,
    isFirstTimeOnly: false,
    isBirthdayOnly: false,
  });

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("promotions.create")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label>{t("fields.name")} *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("promotions.namePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t("fields.description")}</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t("promotions.descriptionPlaceholder")}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("promotions.promoCode")}</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.code || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="SUMMER20"
                  className="font-mono"
                />
                <Button type="button" variant="outline" onClick={generateCode}>
                  {t("promotions.generate")}
                </Button>
              </div>
            </div>

            {/* Discount Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("promotions.type")} *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as PromotionType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMOTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`promotions.types.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {formData.type === "percentage"
                    ? t("promotions.percentage")
                    : t("promotions.amount")}{" "}
                  *
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step={formData.type === "percentage" ? "1" : "0.01"}
                    max={formData.type === "percentage" ? "100" : undefined}
                    value={formData.discountValue || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {formData.type === "percentage" ? "%" : "€"}
                  </span>
                </div>
              </div>
            </div>

            {/* Applies To */}
            <div className="space-y-2">
              <Label>{t("promotions.appliesTo")}</Label>
              <Select
                value={formData.appliesTo}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    appliesTo: value as PromotionAppliesTo,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLIES_TO_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {t(`promotions.appliesTo.${option}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("promotions.startDate")} *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("promotions.endDate")} *</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("promotions.minimumPurchase")}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimumPurchase || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumPurchase: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("promotions.maxDiscount")}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maximumDiscount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maximumDiscount: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="∞"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("promotions.usageLimit")}</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.usageLimit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usageLimit: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="∞"
                />
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-3 pt-2">
              <Label className="text-base">{t("promotions.conditions")}</Label>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("promotions.firstTimeOnly")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("promotions.firstTimeOnlyDescription")}
                  </p>
                </div>
                <Switch
                  checked={formData.isFirstTimeOnly}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFirstTimeOnly: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("promotions.birthdayOnly")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("promotions.birthdayOnlyDescription")}
                  </p>
                </div>
                <Switch
                  checked={formData.isBirthdayOnly}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isBirthdayOnly: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("promotions.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
