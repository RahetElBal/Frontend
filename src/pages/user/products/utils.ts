import type { Product } from "./types";

export const PRODUCT_FORM_DEFAULTS = {
  name: "",
  reference: "",
  description: "",
  price: 0,
  stock: 0,
  alertThreshold: 5,
  category: "",
  brand: "",
  isActive: true,
};

export const getSelectedProductById = (
  products: Product[],
  productId: string | "create" | undefined,
) => {
  if (!productId || productId === "create") {
    return null;
  }

  return products.find((product) => product.id === productId) || null;
};

export const getProductCategoryValue = (product: Product) => {
  if (typeof product.category === "string") {
    return product.category;
  }

  return product.category?.name || "";
};

export const getStockAlertCounts = (products: Product[]) => {
  return products.reduce(
    (counts, product) => {
      if (product.stock === 0) {
        counts.outOfStockCount += 1;
        return counts;
      }

      if (product.stock > 0) {
        counts.lowStockCount += 1;
      }

      return counts;
    },
    {
      lowStockCount: 0,
      outOfStockCount: 0,
    },
  );
};
