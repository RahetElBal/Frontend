export const GiftCardStatus = {
  ACTIVE: "active",
  REDEEMED: "redeemed",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

export type GiftCardStatus = (typeof GiftCardStatus)[keyof typeof GiftCardStatus];
