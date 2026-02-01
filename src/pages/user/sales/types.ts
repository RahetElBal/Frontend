import type { PaymentMethod } from "@/types/entities";

export interface SaleItem {
  id: string;
  name: string;
  type: "service" | "product";
  price: number;
  quantity: number;
}

export interface CreateSaleDto {
  salonId: string;
  clientId?: string;
  items: {
    type: "service" | "product";
    itemId: string;
    quantity: number;
    price: number;
  }[];
  total?: number;
  paymentMethod: PaymentMethod;
  discount?: number;
  notes?: string;
}
