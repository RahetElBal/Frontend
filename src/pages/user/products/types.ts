import type { BaseEntity } from "@/constants/types";
import type { Salon } from "@/pages/admin/salon/types";
import type { Category } from "@/pages/user/services/types";

export interface Product extends BaseEntity {
  name: string;
  description?: string;
  sku?: string;
  reference?: string;
  barcode?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  categoryId?: string;
  category?: Category | string;
  brand?: string;
  image?: string;
  isActive: boolean;
  salonId: string;
  salon?: Salon;
}
