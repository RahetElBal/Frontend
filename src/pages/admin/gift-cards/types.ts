import type { BaseEntity } from "@/constants/types";
import type { Salon } from "@/pages/admin/salon/types";
import type { Client } from "@/pages/user/clients/types";
import type { GiftCardStatus } from "./enum";

export interface GiftCard extends BaseEntity {
  code: string;
  initialValue: number;
  currentValue: number;
  status: GiftCardStatus;
  purchasedById?: string;
  purchasedBy?: Client;
  redeemedById?: string;
  redeemedBy?: Client;
  expiresAt?: string;
  salonId: string;
  salon?: Salon;
}
