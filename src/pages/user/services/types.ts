import type { BaseEntity } from "@/constants/types";
import type { Salon } from "@/pages/admin/salon/types";
import type { Product } from "@/pages/user/products/types";

export interface Service extends BaseEntity {
  name: string;
  description?: string;
  duration: number;
  price: number;
  isPack?: boolean;
  packServiceIds?: string[];
  categoryId?: string;
  category?: Category | string;
  image?: string;
  isActive: boolean;
  salonId: string;
  salon?: Salon;
}

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  salonId: string;
  services?: Service[];
  products?: Product[];
}
