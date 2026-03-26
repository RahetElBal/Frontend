export const PromotionType = {
  PERCENTAGE: "percentage",
  FIXED_AMOUNT: "fixed_amount",
  BUY_X_GET_Y: "buy_x_get_y",
  FREE_SERVICE: "free_service",
  FREE_PRODUCT: "free_product",
  BUNDLE: "bundle",
} as const;

export type PromotionType = (typeof PromotionType)[keyof typeof PromotionType];

export const PromotionStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

export type PromotionStatus =
  (typeof PromotionStatus)[keyof typeof PromotionStatus];

export const PromotionAppliesTo = {
  ALL: "all",
  SERVICES: "services",
  PRODUCTS: "products",
  SPECIFIC_ITEMS: "specific_items",
  CATEGORIES: "categories",
} as const;

export type PromotionAppliesTo =
  (typeof PromotionAppliesTo)[keyof typeof PromotionAppliesTo];
