import type { BaseEntity } from "@/constants/types";
import type {
  PromotionAppliesTo,
  PromotionStatus,
  PromotionType,
} from "./enum";

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

export interface Promotion extends BaseEntity {
  salonId: string;
  name: string;
  description?: string;
  code?: string;
  type: PromotionType;
  status: PromotionStatus;
  appliesTo: PromotionAppliesTo;
  discountValue?: number;
  minimumPurchase?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageLimitPerClient?: number;
  timesUsed: number;
  startDate: string;
  endDate: string;
  applicableServiceIds?: string[];
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  isFirstTimeOnly: boolean;
  isBirthdayOnly: boolean;
  validDays?: string[];
  validTimeStart?: string;
  validTimeEnd?: string;
}
