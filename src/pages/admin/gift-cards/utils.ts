import { GiftCardStatus } from "@/types/entities";

export const giftCardStatusColors: Record<
  GiftCardStatus,
  "default" | "success" | "warning" | "error"
> = {
  [GiftCardStatus.ACTIVE]: "success",
  [GiftCardStatus.REDEEMED]: "default",
  [GiftCardStatus.EXPIRED]: "error",
  [GiftCardStatus.CANCELLED]: "error",
};
