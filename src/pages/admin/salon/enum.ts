export const PlanTier = {
  PRO: "pro",
} as const;

export type PlanTier = (typeof PlanTier)[keyof typeof PlanTier];

export const PlanStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  EXPIRED: "expired",
  PAUSED: "paused",
} as const;

export type PlanStatus = (typeof PlanStatus)[keyof typeof PlanStatus];

export const LoyaltyRewardDiscountType = {
  PERCENT: "percent",
  FIXED: "fixed",
} as const;

export type LoyaltyRewardDiscountType =
  (typeof LoyaltyRewardDiscountType)[keyof typeof LoyaltyRewardDiscountType];
