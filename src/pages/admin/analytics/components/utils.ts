import type {
  Category,
  Service,
} from "@/pages/user/services/types";
import type { Product } from "@/pages/user/products/types";
import type { Appointment } from "@/pages/user/agenda/types";
import type { Client } from "@/pages/user/clients/types";
import type { Sale } from "@/pages/user/sales/types";

export interface AggregatedItem {
  name: string;
  count: number;
  revenue: number;
  itemId?: string;
  type?: "service" | "product";
}

export type AnalyticsPeriod = "daily" | "weekly" | "monthly";

export const toNumber = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export const getPeriodRange = (
  period: AnalyticsPeriod,
  referenceDate: Date = new Date(),
) => {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);

  switch (period) {
    case "daily":
      end.setDate(end.getDate() + 1);
      break;
    case "weekly":
      start.setDate(start.getDate() - 6);
      end.setDate(end.getDate() + 1);
      break;
    case "monthly":
    default:
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 1);
      end.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
};

export const isWithinRange = (value: Date, start: Date, end: Date) =>
  value >= start && value < end;

export const filterSalesByRange = (sales: Sale[], start: Date, end: Date) =>
  sales.filter((sale) => {
    const createdAt = new Date(sale.createdAt);
    return isWithinRange(createdAt, start, end);
  });

export const filterAppointmentsByRange = (
  appointments: Appointment[],
  start: Date,
  end: Date,
) =>
  appointments.filter((appointment) => {
    // Prefer creation time for analytics period consistency with sales/clients.
    const createdAt = new Date(appointment.createdAt);
    if (!Number.isNaN(createdAt.getTime())) {
      return isWithinRange(createdAt, start, end);
    }

    const rawDate =
      typeof appointment.date === "string"
        ? appointment.date.split("T")[0]
        : "";
    const appointmentDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? new Date(`${rawDate}T12:00:00`)
      : new Date(rawDate);
    if (Number.isNaN(appointmentDate.getTime())) {
      return false;
    }
    return isWithinRange(appointmentDate, start, end);
  });

export const filterClientsByRange = (
  clients: Client[],
  start: Date,
  end: Date,
) =>
  clients.filter((client) => {
    const createdAt = new Date(client.createdAt);
    return isWithinRange(createdAt, start, end);
  });

const getSaleItemTotals = (item: Sale["items"][number]) => {
  const quantity = Math.max(1, toNumber(item.quantity));
  const unitPrice = toNumber(
    item.unitPrice ?? item.price ?? (item.total ? item.total / quantity : 0),
  );
  const lineTotal = item.total ?? unitPrice * quantity;
  return {
    quantity,
    lineTotal: toNumber(lineTotal),
  };
};

const getCategoryName = (
  category?: Category | string,
  fallbackLabel: string = "Other",
) => {
  if (!category) return fallbackLabel;
  if (typeof category === "string") return category;
  return category.name || fallbackLabel;
};

export const aggregateProductSales = (
  sales: Sale[],
  products: Product[],
): AggregatedItem[] => {
  const productSales: Record<string, AggregatedItem> = {};
  sales.forEach((sale) => {
    const items = Array.isArray(sale.items) ? sale.items : [];
    items.forEach((item) => {
      if (item.type !== "product") return;
      const product = products.find((p) => p.id === item.itemId);
      const name = product?.name || item.name || "Product";
      if (!productSales[item.itemId]) {
        productSales[item.itemId] = { name, count: 0, revenue: 0 };
      }
      const { quantity, lineTotal } = getSaleItemTotals(item);
      productSales[item.itemId].count += quantity;
      productSales[item.itemId].revenue += lineTotal;
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

export const aggregateSalesItems = (
  sales: Sale[],
  type?: "service" | "product",
): AggregatedItem[] => {
  const itemTotals: Record<string, AggregatedItem> = {};
  sales.forEach((sale) => {
    const items = Array.isArray(sale.items) ? sale.items : [];
    items.forEach((item) => {
      if (type && item.type !== type) return;
      const key = `${item.type}:${item.itemId}`;
      if (!itemTotals[key]) {
        itemTotals[key] = {
          name: item.name || "Item",
          count: 0,
          revenue: 0,
          itemId: item.itemId,
          type: item.type,
        };
      }
      const { quantity, lineTotal } = getSaleItemTotals(item);
      itemTotals[key].count += quantity;
      itemTotals[key].revenue += lineTotal;
    });
  });
  return Object.values(itemTotals);
};

export const aggregateCategorySales = (
  sales: Sale[],
  services: Service[],
  products: Product[],
  fallbackLabel: string,
  type?: "service" | "product",
): AggregatedItem[] => {
  const serviceCategories = new Map(
    services.map((service) => [
      service.id,
      getCategoryName(service.category, fallbackLabel),
    ]),
  );
  const productCategories = new Map(
    products.map((product) => [
      product.id,
      getCategoryName(product.category, fallbackLabel),
    ]),
  );
  const categoryTotals: Record<string, AggregatedItem> = {};

  sales.forEach((sale) => {
    const items = Array.isArray(sale.items) ? sale.items : [];
    items.forEach((item) => {
      if (type && item.type !== type) return;
      const categoryName =
        item.type === "service"
          ? serviceCategories.get(item.itemId)
          : productCategories.get(item.itemId);
      const name = categoryName || fallbackLabel;
      if (!categoryTotals[name]) {
        categoryTotals[name] = { name, count: 0, revenue: 0 };
      }
      const { quantity, lineTotal } = getSaleItemTotals(item);
      categoryTotals[name].count += quantity;
      categoryTotals[name].revenue += lineTotal;
    });
  });

  return Object.values(categoryTotals);
};

export const getTopItems = (items: AggregatedItem[], limit = 5) =>
  [...items].sort((a, b) => b.count - a.count).slice(0, limit);

export const getTopItemsBy = (
  items: AggregatedItem[],
  metric: "count" | "revenue",
  limit = 5,
) => [...items].sort((a, b) => b[metric] - a[metric]).slice(0, limit);
