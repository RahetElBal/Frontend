import type { TFunction } from "i18next";
import { Percent, Tag } from "lucide-react";
import { Badge } from "@/components/badge";
import type {
  Promotion,
} from "../types";
import type { PromotionStatus, PromotionType } from "../enum";
import { StatusBadge } from "../../components/status-badge";

export const copyPromotionCode = (
  code: string,
  onCopied?: () => void,
) => {
  navigator.clipboard.writeText(code);
  onCopied?.();
};

export const getPromotionStatusBadge = (
  t: TFunction,
  status: PromotionStatus,
) => {
  switch (status) {
    case "active":
      return <StatusBadge variant="success" label={t("promotions.active")} />;
    case "draft":
      return <StatusBadge variant="default" label={t("promotions.draft")} />;
    case "paused":
      return <StatusBadge variant="warning" label={t("promotions.paused")} />;
    case "expired":
      return <StatusBadge variant="error" label={t("promotions.expired")} />;
    case "cancelled":
      return <Badge>{t("promotions.cancelled")}</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const getPromotionTypeIcon = (type: PromotionType) => {
  switch (type) {
    case "percentage":
      return <Percent className="h-5 w-5" />;
    case "fixed_amount":
      return <Tag className="h-5 w-5" />;
    default:
      return <Tag className="h-5 w-5" />;
  }
};

export const formatPromotionDiscountValue = (
  promo: Promotion,
  formatCurrency: (value: number) => string,
) => {
  if (promo.type === "percentage") {
    return `-${promo.discountValue}%`;
  }
  if (promo.type === "fixed_amount") {
    return `-${formatCurrency(promo.discountValue || 0)}`;
  }
  return promo.type;
};

export const generatePromotionCode = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
