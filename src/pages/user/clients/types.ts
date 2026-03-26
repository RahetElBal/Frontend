import type { BaseEntity } from "@/constants/types";
import type { Salon } from "@/pages/admin/salon/types";
import type { Appointment } from "@/pages/user/agenda/types";
import type { Sale } from "@/pages/user/sales/types";
import type { Gender } from "./enum";

export type ClientModalState = {
  clientId: string | "create";
  mode: "view" | "edit" | "delete";
} | null;

export interface Client extends BaseEntity {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: Gender;
  address?: string;
  notes?: string;
  isMarried?: boolean;
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
  lastVisit?: string;
  isActive: boolean;
  salonId: string;
  salon?: Salon;
  appointments?: Appointment[];
  sales?: Sale[];
}
