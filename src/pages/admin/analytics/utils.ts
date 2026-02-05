import type { Appointment, Product, Sale } from "@/types/entities";

export interface AggregatedItem {
  name: string;
  count: number;
  revenue: number;
}

export const toNumber = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export const aggregateProductSales = (
  sales: Sale[],
  products: Product[],
): AggregatedItem[] => {
  const productSales: Record<string, AggregatedItem> = {};
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (item.type !== "product") return;
      const product = products.find((p) => p.id === item.itemId);
      if (!product) return;
      if (!productSales[item.itemId]) {
        productSales[item.itemId] = {
          name: product.name,
          count: 0,
          revenue: 0,
        };
      }
      productSales[item.itemId].count += item.quantity;
      productSales[item.itemId].revenue += item.price * item.quantity;
    });
  });
  return Object.values(productSales);
};

export const aggregateServiceBookings = (
  appointments: Appointment[],
): AggregatedItem[] => {
  const serviceBookings: Record<string, AggregatedItem> = {};
  appointments.forEach((apt) => {
    if (!apt.service) return;
    const id = apt.service.id;
    if (!serviceBookings[id]) {
      serviceBookings[id] = {
        name: apt.service.name,
        count: 0,
        revenue: 0,
      };
    }
    serviceBookings[id].count += 1;
    serviceBookings[id].revenue += apt.service.price;
  });
  return Object.values(serviceBookings);
};

export const getTopItems = (items: AggregatedItem[], limit = 5) =>
  [...items].sort((a, b) => b.count - a.count).slice(0, limit);
