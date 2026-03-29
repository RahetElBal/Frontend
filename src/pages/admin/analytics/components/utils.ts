import type { TFunction } from "i18next";
import type {
  Category,
  Service,
} from "@/pages/user/services/types";
import type { Product } from "@/pages/user/products/types";
import type { Appointment } from "@/pages/user/agenda/types";
import type { Client } from "@/pages/user/clients/types";
import type { Sale } from "@/pages/user/sales/types";
import {
  translateServiceCategory,
  translateServiceName,
} from "@/common/service-translations";

export interface AggregatedItem {
  name: string;
  count: number;
  revenue: number;
  itemId?: string;
  type?: "service" | "product";
}

export interface AnalyticsDisplayItem extends AggregatedItem {
  displayName: string;
  percent: number;
}

export type AnalyticsPeriod = "daily" | "weekly" | "monthly";

interface BusinessSummaryLike {
  grossRevenue: number;
  netRevenue: number;
  transactionCount: number;
  canceledCount: number;
  refundedCount: number;
  refundedRevenueImpact: number;
  updatedAt: number;
}

export interface AnalyticsViewModel {
  totalNetRevenue: number;
  totalGrossRevenue: number;
  totalTransactions: number;
  refundedPaymentsCount: number;
  refundedRevenueAmount: number;
  averageTicket: number;
  serviceRevenue: number;
  totalAppointments: number;
  newClients: number;
  marriedClientsCount: number;
  packRevenue: number;
  packCount: number;
  packShare: number;
  serviceShare: number;
  hasData: boolean;
  bestSeller: AnalyticsDisplayItem | null;
  topCategories: AnalyticsDisplayItem[];
  topServices: AnalyticsDisplayItem[];
  topPacks: AnalyticsDisplayItem[];
}

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

const buildPackItems = (
  sales: Sale[],
  packServices: Service[],
  packServiceIds: Set<string>,
  t: TFunction,
) => {
  if (packServiceIds.size === 0) {
    return [];
  }

  const totals: Record<
    string,
    { name: string; count: number; revenue: number; itemId: string; type: "service" }
  > = {};

  sales.forEach((sale) => {
    const items = Array.isArray(sale.items) ? sale.items : [];

    items.forEach((item) => {
      if (item.type !== "service") {
        return;
      }

      if (!packServiceIds.has(item.itemId)) {
        return;
      }

      const quantity = Math.max(1, toNumber(item.quantity));
      const unitPrice = toNumber(
        item.unitPrice ??
          item.price ??
          (item.total ? item.total / quantity : 0),
      );
      const lineTotal = toNumber(item.total ?? unitPrice * quantity);

      if (!totals[item.itemId]) {
        const packName =
          item.name ||
          packServices.find((service) => service.id === item.itemId)?.name ||
          t("services.pack");

        totals[item.itemId] = {
          name: packName,
          count: 0,
          revenue: 0,
          itemId: item.itemId,
          type: "service",
        };
      }

      totals[item.itemId].count += quantity;
      totals[item.itemId].revenue += lineTotal;
    });
  });

  return Object.values(totals);
};

const getDisplayName = (
  item: AggregatedItem,
  t: TFunction,
  serviceLookup: Map<string, Service>,
) => {
  if (item.type !== "service" || !item.itemId) {
    return item.name;
  }

  const service = serviceLookup.get(item.itemId);

  if (!service) {
    return item.name;
  }

  return translateServiceName(t, service);
};

const toDisplayItems = (
  items: AggregatedItem[],
  metric: "count" | "revenue",
  t: TFunction,
  serviceLookup: Map<string, Service>,
) => {
  const maxValue = items[0]?.[metric] || 1;

  return items.map((item) => {
    const percent = (item[metric] / maxValue) * 100;

    return {
      ...item,
      displayName: getDisplayName(item, t, serviceLookup),
      percent,
    };
  });
};

export const buildAnalyticsViewModel = ({
  sales,
  appointments,
  clients,
  services,
  businessSummary,
  period,
  t,
}: {
  sales: Sale[];
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  businessSummary: BusinessSummaryLike;
  period: AnalyticsPeriod;
  t: TFunction;
}): AnalyticsViewModel => {
  const { start, end } = getPeriodRange(period);
  const serviceLookup = new Map(services.map((service) => [service.id, service]));
  const packServices = services.filter((service) => service.isPack);
  const packServiceIds = new Set(packServices.map((service) => service.id));
  const salesInRange = filterSalesByRange(sales, start, end);
  const completedSalesInRange = salesInRange.filter(
    (sale) => sale.status === "completed",
  );
  const appointmentsInRange = filterAppointmentsByRange(appointments, start, end);
  const clientsInRange = filterClientsByRange(clients, start, end);
  const marriedClientsCount = clientsInRange.filter(
    (client) => client.isMarried,
  ).length;
  const packItems = buildPackItems(
    completedSalesInRange,
    packServices,
    packServiceIds,
    t,
  );

  const periodRevenue = salesInRange.reduce((sum, sale) => {
    if (sale.status === "completed" || sale.status === "refunded") {
      return sum + toNumber(sale.total);
    }

    return sum;
  }, 0);
  const periodCanceledRevenueImpact = salesInRange.reduce((sum, sale) => {
    if (sale.status === "cancelled") {
      return sum - Math.abs(toNumber(sale.total));
    }

    return sum;
  }, 0);
  const periodRefundedRevenueImpact = salesInRange.reduce((sum, sale) => {
    if (sale.status === "refunded") {
      return sum - Math.abs(toNumber(sale.total));
    }

    return sum;
  }, 0);
  const periodNetRevenue = Math.max(
    0,
    periodRevenue + periodCanceledRevenueImpact + periodRefundedRevenueImpact,
  );
  const periodTransactions = salesInRange.filter(
    (sale) => sale.status === "completed",
  ).length;
  const periodRefundedCount = salesInRange.filter(
    (sale) => sale.status === "refunded",
  ).length;
  const periodRefundedAmount = Math.abs(periodRefundedRevenueImpact);
  const hasBusinessSummary =
    businessSummary.updatedAt > 0 ||
    businessSummary.grossRevenue !== 0 ||
    businessSummary.netRevenue !== 0 ||
    businessSummary.transactionCount !== 0 ||
    businessSummary.canceledCount !== 0 ||
    businessSummary.refundedCount !== 0;
  const totalNetRevenue = hasBusinessSummary
    ? businessSummary.netRevenue
    : periodNetRevenue;
  const totalGrossRevenue = hasBusinessSummary
    ? businessSummary.grossRevenue
    : periodRevenue;
  const totalTransactions = hasBusinessSummary
    ? businessSummary.transactionCount
    : periodTransactions;
  const refundedPaymentsCount = hasBusinessSummary
    ? businessSummary.refundedCount
    : periodRefundedCount;
  const refundedRevenueAmount = Math.abs(
    hasBusinessSummary
      ? businessSummary.refundedRevenueImpact
      : periodRefundedAmount,
  );
  const averageTicket =
    totalTransactions > 0 ? totalNetRevenue / totalTransactions : 0;
  const allServiceItems = aggregateSalesItems(completedSalesInRange, "service");
  const topServices = toDisplayItems(
    getTopItemsBy(allServiceItems, "count", 5),
    "revenue",
    t,
    serviceLookup,
  );
  const topCategories = getTopItemsBy(
    aggregateCategorySales(
      completedSalesInRange,
      services,
      [],
      t("common.other"),
      "service",
    ).map((item) => ({
      ...item,
      displayName: translateServiceCategory(t, item.name),
    })),
    "revenue",
    5,
  ).map((item, _index, items) => {
    const totalRevenue = items.reduce((sum, currentItem) => {
      return sum + currentItem.revenue;
    }, 0);

    return {
      ...item,
      displayName: translateServiceCategory(t, item.name),
      percent: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
    };
  });
  const topPacks = toDisplayItems(
    getTopItemsBy(packItems, "revenue", 5),
    "revenue",
    t,
    serviceLookup,
  );
  const safeServiceRevenue = allServiceItems.reduce((sum, item) => {
    return sum + item.revenue;
  }, 0);
  const packRevenue = packItems.reduce((sum, item) => {
    return sum + item.revenue;
  }, 0);
  const packCount = packItems.reduce((sum, item) => {
    return sum + item.count;
  }, 0);
  const bestSellerRaw = getTopItemsBy(allServiceItems, "count", 1)[0];

  return {
    totalNetRevenue,
    totalGrossRevenue,
    totalTransactions,
    refundedPaymentsCount,
    refundedRevenueAmount,
    averageTicket,
    serviceRevenue: safeServiceRevenue,
    totalAppointments: appointmentsInRange.length,
    newClients: clientsInRange.length,
    marriedClientsCount,
    packRevenue,
    packCount,
    packShare: safeServiceRevenue > 0 ? (packRevenue / safeServiceRevenue) * 100 : 0,
    serviceShare: safeServiceRevenue > 0 ? 100 : 0,
    hasData:
      completedSalesInRange.length > 0 ||
      appointmentsInRange.length > 0 ||
      clientsInRange.length > 0,
    bestSeller: bestSellerRaw
      ? {
          ...bestSellerRaw,
          displayName: getDisplayName(bestSellerRaw, t, serviceLookup),
          percent: 100,
        }
      : null,
    topCategories,
    topServices,
    topPacks,
  };
};
