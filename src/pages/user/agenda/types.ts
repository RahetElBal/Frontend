import type { BaseEntity } from "@/constants/types";
import type { Salon } from "@/pages/admin/salon/types";
import type { User } from "@/pages/admin/users/types";
import type { Client } from "@/pages/user/clients/types";
import type { Service } from "@/pages/user/services/types";
import type { AppointmentStatus } from "./enum";

export interface Appointment extends BaseEntity {
  clientId: string;
  client?: Client;
  serviceId: string;
  service?: Service;
  staffId?: string;
  staff?: User;
  salonId: string;
  salon?: Salon;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  paid?: boolean;
  notes?: string;
  basePrice?: number;
  customPrice?: number | null;
  discount?: number;
  price: number;
  reminderSent: boolean;
}

export type AppointmentModalState = {
  appointmentId: string | "create";
  mode: "view" | "edit" | "delete";
  prefillTime?: string;
  prefillDate?: string;
  prefillStaffId?: string;
  nonce?: number;
} | null;
