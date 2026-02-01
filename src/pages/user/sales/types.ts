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
