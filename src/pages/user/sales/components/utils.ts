import type { TFunction } from "i18next";

import type { PaymentStatus, SaleStatus } from "../enum";
import type { Sale, SaleItem } from "../types";

export const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const frenchSaleStatusLabels: Record<SaleStatus, string> = {
  pending: "En attente",
  completed: "Terminé",
  refunded: "Remboursé",
  cancelled: "Annulé",
};

const frenchPaymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "En attente",
  partial: "Partiel",
  paid: "Payé",
  refunded: "Remboursé",
};

const isFrenchLanguage = (t: TFunction) => {
  const i18n = (t as TFunction & { i18n?: { language?: string } }).i18n;
  return i18n?.language?.startsWith("fr");
};

export const getSaleStatusLabel = (t: TFunction, status?: SaleStatus) => {
  if (!status) return t("common.unknown");
  if (isFrenchLanguage(t)) {
    return frenchSaleStatusLabels[status] ?? status;
  }
  return t(`sales.statuses.${status}`, {
    defaultValue: status,
  });
};

export const getSalePaymentStatusLabel = (
  t: TFunction,
  status?: PaymentStatus | SaleStatus,
) => {
  if (!status) return t("common.unknown");
  if (isFrenchLanguage(t)) {
    return (
      (frenchPaymentStatusLabels as Partial<Record<PaymentStatus | SaleStatus, string>>)[
        status
      ] ??
      (frenchSaleStatusLabels as Partial<Record<PaymentStatus | SaleStatus, string>>)[
        status
      ] ??
      status
    );
  }
  return t(`sales.paymentStatuses.${status}`, {
    defaultValue: t(`sales.statuses.${status}`, {
      defaultValue: status,
    }),
  });
};

export const getPaymentMethodLabel = (t: TFunction, method?: string) => {
  if (method === "card") {
    return t("sales.card");
  }

  if (method === "bank_transfer") {
    return t("sales.bankTransfer");
  }

  if (method === "other") {
    return t("sales.other");
  }

  return t("sales.cash");
};

export const getSaleItemPricing = (item: SaleItem) => {
  const quantity = Math.max(1, toNumber(item.quantity, 1));
  const baseUnitPrice = toNumber(
    item.unitPrice ??
      item.price ??
      (item.total !== undefined ? toNumber(item.total) / quantity : undefined),
  );
  const baseLineTotal = baseUnitPrice * quantity;
  const lineTotal = toNumber(item.total ?? baseLineTotal);
  const discountFromLine = Math.max(0, baseLineTotal - lineTotal);
  const discountFromField = Math.max(0, toNumber(item.discount, 0));
  const shouldUseDiscountField =
    discountFromField > 0 && discountFromLine < 0.01;
  const discount = shouldUseDiscountField
    ? discountFromField
    : Math.max(discountFromLine, discountFromField);
  const finalLineTotal = Math.max(
    0,
    shouldUseDiscountField ? baseLineTotal - discount : lineTotal,
  );

  return {
    quantity,
    baseUnitPrice,
    finalUnitPrice: finalLineTotal / quantity,
    discount,
  };
};

export const getSaleDiscountSummary = (sale: Sale | null) => {
  if (!sale) {
    return {
      displayDiscount: 0,
      showDiscount: false,
    };
  }

  const itemDiscountTotal = (sale.items ?? []).reduce((sum, item) => {
    return sum + getSaleItemPricing(item).discount;
  }, 0);
  const saleDiscount = toNumber(sale.discount ?? 0);

  if (saleDiscount > 0) {
    return {
      displayDiscount: saleDiscount,
      showDiscount: saleDiscount > 0.009,
    };
  }

  return {
    displayDiscount: itemDiscountTotal,
    showDiscount: itemDiscountTotal > 0.009,
  };
};

export const saleStatusColors: Record<
  SaleStatus,
  "default" | "success" | "warning" | "error"
> = {
  completed: "success",
  pending: "warning",
  refunded: "error",
  cancelled: "error",
};
