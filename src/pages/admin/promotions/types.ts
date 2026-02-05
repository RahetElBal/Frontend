import type { PromotionType, PromotionAppliesTo } from "@/types/entities";

export interface CreatePromotionDto {
  name: string;
  description?: string;
  code?: string;
  type: PromotionType;
  appliesTo: PromotionAppliesTo;
  discountValue?: number;
  minimumPurchase?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageLimitPerClient?: number;
  startDate: string;
  endDate: string;
  isFirstTimeOnly: boolean;
  isBirthdayOnly: boolean;
}
