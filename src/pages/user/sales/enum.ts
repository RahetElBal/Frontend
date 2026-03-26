export const SaleItemType = {
  SERVICE: "service",
  PRODUCT: "product",
} as const;

export type SaleItemType = (typeof SaleItemType)[keyof typeof SaleItemType];

export const PaymentMethod = {
  CASH: "cash",
  CARD: "card",
  BANK_TRANSFER: "bank_transfer",
  OTHER: "other",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: "pending",
  PARTIAL: "partial",
  PAID: "paid",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const SaleStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
} as const;

export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];
