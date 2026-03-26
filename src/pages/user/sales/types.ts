import type { BaseEntity } from "@/constants/types";
import type { Salon } from "@/pages/admin/salon/types";
import type { User } from "@/pages/admin/users/types";
import type { Appointment } from "@/pages/user/agenda/types";
import type { Client } from "@/pages/user/clients/types";
import type {
  PaymentMethod,
  PaymentStatus,
  SaleItemType,
  SaleStatus,
} from "./enum";

export interface SaleItem {
  id: string;
  itemId: string;
  name: string;
  type: SaleItemType;
  price: number;
  quantity: number;
  unitPrice?: number;
  discount?: number;
  total: number;
}

export interface CreateSaleDto {
  salonId: string;
  clientId?: string;
  appointmentId?: string;
  items: {
    type: "service" | "product";
    itemId: string;
    quantity: number;
    price: number;
  }[];
  total?: number;
  notes?: string;
}

export interface Sale extends BaseEntity {
  clientId?: string;
  client?: Client;
  staffId?: string;
  staff?: User;
  salonId: string;
  salon?: Salon;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  redeemedPoints?: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: SaleStatus;
  notes?: string;
  appointmentId?: string;
  appointment?: Appointment;
}
