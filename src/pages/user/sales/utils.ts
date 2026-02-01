import type { SaleStatus } from "@/types/entities";

export const formatSaleTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
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
