import type { Sale, SaleItem } from "@/types/entities";

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const normalizeSaleItem = (item: SaleItem): SaleItem => ({
  ...item,
  quantity: toNumber(item.quantity, 0),
  price: toNumber(item.price),
  unitPrice:
    item.unitPrice !== undefined ? toNumber(item.unitPrice) : undefined,
  discount:
    item.discount !== undefined ? toNumber(item.discount) : undefined,
  total: toNumber(item.total),
});

export const normalizeSale = (sale: Sale): Sale => ({
  ...sale,
  subtotal: toNumber(sale.subtotal),
  discount: toNumber(sale.discount),
  tax: toNumber(sale.tax),
  total: toNumber(sale.total),
  redeemedPoints:
    sale.redeemedPoints !== undefined && sale.redeemedPoints !== null
      ? toNumber(sale.redeemedPoints)
      : sale.redeemedPoints,
  items: Array.isArray(sale.items) ? sale.items.map(normalizeSaleItem) : [],
});

export const normalizeSalesResponse = <T extends { data?: Sale[] }>(
  response: T,
): T => {
  if (!response || !Array.isArray(response.data)) return response;
  return {
    ...response,
    data: response.data.map(normalizeSale),
  };
};
