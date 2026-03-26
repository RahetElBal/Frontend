import type { TFunction } from "i18next";

import type { PaymentStatus, SaleStatus } from "../enum";

export const formatSaleDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR");
};

export const formatSaleTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

export const saleStatusColors: Record<
  SaleStatus,
  "default" | "success" | "warning" | "error"
> = {
  completed: "success",
  pending: "warning",
  refunded: "error",
  cancelled: "error",
};
