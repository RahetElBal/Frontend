import { useCallback } from "react";
import { useGet } from "@/hooks/useGet";

interface UseSalonCategoriesOptions {
  enabled?: boolean;
  includeServices?: boolean;
  includeProducts?: boolean;
}

type ServiceCategoriesResponse = Array<{ category?: string; name?: string } | string>;

const CATEGORIES_STALE_TIME = 1000 * 60 * 30;

const normalizeCategoryList = (values: string[]) => {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean))).sort(
    (left, right) => left.localeCompare(right),
  );
};

const extractServiceCategories = (
  response: ServiceCategoriesResponse | null | undefined,
) => {
  if (!Array.isArray(response)) {
    return [];
  }

  return normalizeCategoryList(
    response.map((item) => {
      if (typeof item === "string") {
        return item;
      }

      return item?.category || item?.name || "";
    }),
  );
};

const extractProductCategories = (response: string[] | null | undefined) => {
  if (!Array.isArray(response)) {
    return [];
  }

  return normalizeCategoryList(response);
};

export function useSalonCategories(
  salonId: string | null | undefined,
  options: UseSalonCategoriesOptions = {},
) {
  const normalizedSalonId = salonId?.trim() || "";
  const enabled = options.enabled !== false && !!normalizedSalonId;
  const includeServices = options.includeServices !== false;
  const includeProducts = options.includeProducts !== false;

  const serviceCategoriesQuery = useGet<string[]>({
    path: "services/categories",
    query: {
      salonId: normalizedSalonId || undefined,
    },
    options: {
      enabled: enabled && includeServices,
      staleTime: CATEGORIES_STALE_TIME,
      select: (response) =>
        extractServiceCategories(response as ServiceCategoriesResponse | null | undefined),
    },
  });

  const productCategoriesQuery = useGet<string[]>({
    path: "products/categories",
    query: {
      salonId: normalizedSalonId || undefined,
    },
    options: {
      enabled: enabled && includeProducts,
      staleTime: CATEGORIES_STALE_TIME,
      select: (response) =>
        extractProductCategories(response as string[] | null | undefined),
    },
  });

  const refresh = useCallback(async () => {
    const [serviceResult, productResult] = await Promise.all([
      includeServices && enabled
        ? serviceCategoriesQuery.refetch()
        : Promise.resolve({ data: [] as string[] }),
      includeProducts && enabled
        ? productCategoriesQuery.refetch()
        : Promise.resolve({ data: [] as string[] }),
    ]);

    return {
      serviceCategories: serviceResult.data ?? [],
      productCategories: productResult.data ?? [],
    };
  }, [enabled, includeProducts, includeServices, productCategoriesQuery, serviceCategoriesQuery]);

  return {
    serviceCategories: serviceCategoriesQuery.data ?? [],
    productCategories: productCategoriesQuery.data ?? [],
    isServiceCategoriesLoading: serviceCategoriesQuery.isLoading,
    isProductCategoriesLoading: productCategoriesQuery.isLoading,
    serviceCategoriesError: serviceCategoriesQuery.error?.message ?? null,
    productCategoriesError: productCategoriesQuery.error?.message ?? null,
    refresh,
  };
}
