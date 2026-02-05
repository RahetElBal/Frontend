import type { SaleStatus } from "@/types/entities";

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

export const saleStatusColors: Record<
  SaleStatus,
  "default" | "success" | "warning" | "error"
> = {
  completed: "success",
  pending: "warning",
  refunded: "error",
  cancelled: "error",
};
