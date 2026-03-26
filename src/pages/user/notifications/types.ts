import type { BaseEntity } from "@/constants/types";
import type { AdminNotificationType } from "./enum";

export interface AdminNotification extends BaseEntity {
  recipientId: string;
  salonId: string;
  actorId?: string | null;
  type: AdminNotificationType;
  title: string;
  message: string;
  payload?: Record<string, unknown> | null;
  readAt?: string | null;
}
