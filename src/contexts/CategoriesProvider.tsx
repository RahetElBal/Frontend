/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { buildUrl, get } from "@/lib/http";

const CATEGORIES_CACHE_TTL_MS = 1000 * 60 * 30;

type CategoriesMap = Record<string, string[]>;
type LoadingMap = Record<string, boolean>;
type ErrorMap = Record<string, string | null>;
type TimestampMap = Record<string, number>;

interface CategoriesContextValue {
  serviceCategoriesBySalon: CategoriesMap;
  productCategoriesBySalon: CategoriesMap;
  serviceLoadingBySalon: LoadingMap;
  productLoadingBySalon: LoadingMap;
  serviceErrorBySalon: ErrorMap;
  productErrorBySalon: ErrorMap;
  ensureCategories: (
    salonId: string,
    options?: {
      force?: boolean;
      includeServices?: boolean;
      includeProducts?: boolean;
    },
  ) => Promise<{ serviceCategories: string[]; productCategories: string[] }>;
  invalidateCategories: (salonId?: string) => void;
}

interface CategoriesProviderProps {
  children: ReactNode;
}

interface UseSalonCategoriesOptions {
  enabled?: boolean;
  includeServices?: boolean;
  includeProducts?: boolean;
}

type ServiceCategoriesResponse = Array<{ category?: string; name?: string } | string>;
type ProductCategoriesResponse = string[];

const CategoriesContext = createContext<CategoriesContextValue | undefined>(
  undefined,
);

const omitKey = <T extends Record<string, unknown>>(obj: T, key: string): T => {
  const { [key]: _unused, ...rest } = obj;
  return rest as T;
};

const normalizeCategoryList = (values: string[]) =>
  Array.from(new Set(values.map((item) => item.trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );

const extractServiceCategories = (
  response: ServiceCategoriesResponse | null | undefined,
) => {
  if (!Array.isArray(response)) return [];
  return normalizeCategoryList(
    response.map((item) => {
      if (typeof item === "string") return item;
      return item?.category || item?.name || "";
    }),
  );
};

const extractProductCategories = (
  response: ProductCategoriesResponse | null | undefined,
) => {
  if (!Array.isArray(response)) return [];
  return normalizeCategoryList(response);
};

export function CategoriesProvider({ children }: CategoriesProviderProps) {
  const [serviceCategoriesBySalon, setServiceCategoriesBySalon] =
    useState<CategoriesMap>({});
  const [productCategoriesBySalon, setProductCategoriesBySalon] =
    useState<CategoriesMap>({});
  const [serviceLoadingBySalon, setServiceLoadingBySalon] = useState<LoadingMap>(
    {},
  );
  const [productLoadingBySalon, setProductLoadingBySalon] = useState<LoadingMap>(
    {},
  );
  const [serviceErrorBySalon, setServiceErrorBySalon] = useState<ErrorMap>({});
  const [productErrorBySalon, setProductErrorBySalon] = useState<ErrorMap>({});
  const [serviceFetchedAtBySalon, setServiceFetchedAtBySalon] =
    useState<TimestampMap>({});
  const [productFetchedAtBySalon, setProductFetchedAtBySalon] =
    useState<TimestampMap>({});

  const serviceCategoriesBySalonRef = useRef<CategoriesMap>({});
  const productCategoriesBySalonRef = useRef<CategoriesMap>({});
  const serviceFetchedAtBySalonRef = useRef<TimestampMap>({});
  const productFetchedAtBySalonRef = useRef<TimestampMap>({});

  const inFlightServiceRef = useRef<Map<string, Promise<string[]>>>(new Map());
  const inFlightProductRef = useRef<Map<string, Promise<string[]>>>(new Map());

  useEffect(() => {
    serviceCategoriesBySalonRef.current = serviceCategoriesBySalon;
  }, [serviceCategoriesBySalon]);

  useEffect(() => {
    productCategoriesBySalonRef.current = productCategoriesBySalon;
  }, [productCategoriesBySalon]);

  useEffect(() => {
    serviceFetchedAtBySalonRef.current = serviceFetchedAtBySalon;
  }, [serviceFetchedAtBySalon]);

  useEffect(() => {
    productFetchedAtBySalonRef.current = productFetchedAtBySalon;
  }, [productFetchedAtBySalon]);

  const fetchServiceCategories = useCallback(
    async (salonId: string, force = false) => {
      const normalizedSalonId = salonId.trim();
      const cached = serviceCategoriesBySalonRef.current[normalizedSalonId];
      const fetchedAt = serviceFetchedAtBySalonRef.current[normalizedSalonId] ?? 0;
      const now = Date.now();

      if (!force && cached && now - fetchedAt < CATEGORIES_CACHE_TTL_MS) {
        return cached;
      }

      const inFlight = inFlightServiceRef.current.get(normalizedSalonId);
      if (inFlight) return inFlight;

      setServiceLoadingBySalon((prev) => ({ ...prev, [normalizedSalonId]: true }));
      setServiceErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: null }));

      const request = (async () => {
        try {
          const response = await get<ServiceCategoriesResponse>(
            buildUrl("services/categories", { salonId: normalizedSalonId }),
          );
          const categories = extractServiceCategories(response);
          setServiceCategoriesBySalon((prev) => ({
            ...prev,
            [normalizedSalonId]: categories,
          }));
          setServiceFetchedAtBySalon((prev) => ({
            ...prev,
            [normalizedSalonId]: Date.now(),
          }));
          return categories;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load service categories";
          setServiceErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: message }));
          return serviceCategoriesBySalonRef.current[normalizedSalonId] ?? [];
        } finally {
          setServiceLoadingBySalon((prev) => ({ ...prev, [normalizedSalonId]: false }));
          inFlightServiceRef.current.delete(normalizedSalonId);
        }
      })();

      inFlightServiceRef.current.set(normalizedSalonId, request);
      return request;
    },
    [],
  );

  const fetchProductCategories = useCallback(
    async (salonId: string, force = false) => {
      const normalizedSalonId = salonId.trim();
      const cached = productCategoriesBySalonRef.current[normalizedSalonId];
      const fetchedAt = productFetchedAtBySalonRef.current[normalizedSalonId] ?? 0;
      const now = Date.now();

      if (!force && cached && now - fetchedAt < CATEGORIES_CACHE_TTL_MS) {
        return cached;
      }

      const inFlight = inFlightProductRef.current.get(normalizedSalonId);
      if (inFlight) return inFlight;

      setProductLoadingBySalon((prev) => ({ ...prev, [normalizedSalonId]: true }));
      setProductErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: null }));

      const request = (async () => {
        try {
          const response = await get<ProductCategoriesResponse>(
            buildUrl("products/categories", { salonId: normalizedSalonId }),
          );
          const categories = extractProductCategories(response);
          setProductCategoriesBySalon((prev) => ({
            ...prev,
            [normalizedSalonId]: categories,
          }));
          setProductFetchedAtBySalon((prev) => ({
            ...prev,
            [normalizedSalonId]: Date.now(),
          }));
          return categories;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load product categories";
          setProductErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: message }));
          return productCategoriesBySalonRef.current[normalizedSalonId] ?? [];
        } finally {
          setProductLoadingBySalon((prev) => ({ ...prev, [normalizedSalonId]: false }));
          inFlightProductRef.current.delete(normalizedSalonId);
        }
      })();

      inFlightProductRef.current.set(normalizedSalonId, request);
      return request;
    },
    [],
  );

  const ensureCategories = useCallback(
    async (
      salonId: string,
      options: {
        force?: boolean;
        includeServices?: boolean;
        includeProducts?: boolean;
      } = {},
    ) => {
      const normalizedSalonId = salonId?.trim();
      if (!normalizedSalonId) {
        return { serviceCategories: [], productCategories: [] };
      }

      const force = options.force === true;
      const includeServices = options.includeServices !== false;
      const includeProducts = options.includeProducts !== false;

      const [serviceCategories, productCategories] = await Promise.all([
        includeServices
          ? fetchServiceCategories(normalizedSalonId, force)
          : Promise.resolve([]),
        includeProducts
          ? fetchProductCategories(normalizedSalonId, force)
          : Promise.resolve([]),
      ]);

      return { serviceCategories, productCategories };
    },
    [fetchServiceCategories, fetchProductCategories],
  );

  const invalidateCategories = useCallback((salonId?: string) => {
    const normalizedSalonId = salonId?.trim();
    if (!normalizedSalonId) {
      setServiceCategoriesBySalon({});
      setProductCategoriesBySalon({});
      setServiceLoadingBySalon({});
      setProductLoadingBySalon({});
      setServiceErrorBySalon({});
      setProductErrorBySalon({});
      setServiceFetchedAtBySalon({});
      setProductFetchedAtBySalon({});
      inFlightServiceRef.current.clear();
      inFlightProductRef.current.clear();
      return;
    }

    setServiceCategoriesBySalon((prev) => omitKey(prev, normalizedSalonId));
    setProductCategoriesBySalon((prev) => omitKey(prev, normalizedSalonId));
    setServiceLoadingBySalon((prev) => omitKey(prev, normalizedSalonId));
    setProductLoadingBySalon((prev) => omitKey(prev, normalizedSalonId));
    setServiceErrorBySalon((prev) => omitKey(prev, normalizedSalonId));
    setProductErrorBySalon((prev) => omitKey(prev, normalizedSalonId));
    setServiceFetchedAtBySalon((prev) => omitKey(prev, normalizedSalonId));
    setProductFetchedAtBySalon((prev) => omitKey(prev, normalizedSalonId));
    inFlightServiceRef.current.delete(normalizedSalonId);
    inFlightProductRef.current.delete(normalizedSalonId);
  }, []);

  const value = useMemo<CategoriesContextValue>(
    () => ({
      serviceCategoriesBySalon,
      productCategoriesBySalon,
      serviceLoadingBySalon,
      productLoadingBySalon,
      serviceErrorBySalon,
      productErrorBySalon,
      ensureCategories,
      invalidateCategories,
    }),
    [
      serviceCategoriesBySalon,
      productCategoriesBySalon,
      serviceLoadingBySalon,
      productLoadingBySalon,
      serviceErrorBySalon,
      productErrorBySalon,
      ensureCategories,
      invalidateCategories,
    ],
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategoriesContext() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error(
      "useCategoriesContext must be used within a CategoriesProvider",
    );
  }
  return context;
}

export function useSalonCategories(
  salonId: string | null | undefined,
  options: UseSalonCategoriesOptions = {},
) {
  const {
    serviceCategoriesBySalon,
    productCategoriesBySalon,
    serviceLoadingBySalon,
    productLoadingBySalon,
    serviceErrorBySalon,
    productErrorBySalon,
    ensureCategories,
  } = useCategoriesContext();

  const enabled = options.enabled !== false;
  const includeServices = options.includeServices !== false;
  const includeProducts = options.includeProducts !== false;
  const normalizedSalonId = salonId?.trim() || null;

  useEffect(() => {
    if (!enabled || !normalizedSalonId) return;
    void ensureCategories(normalizedSalonId, {
      includeServices,
      includeProducts,
    });
  }, [
    enabled,
    normalizedSalonId,
    includeServices,
    includeProducts,
    ensureCategories,
  ]);

  const serviceCategories = normalizedSalonId
    ? serviceCategoriesBySalon[normalizedSalonId] ?? []
    : [];
  const productCategories = normalizedSalonId
    ? productCategoriesBySalon[normalizedSalonId] ?? []
    : [];
  const isServiceCategoriesLoading = normalizedSalonId
    ? serviceLoadingBySalon[normalizedSalonId] ?? false
    : false;
  const isProductCategoriesLoading = normalizedSalonId
    ? productLoadingBySalon[normalizedSalonId] ?? false
    : false;
  const serviceCategoriesError = normalizedSalonId
    ? serviceErrorBySalon[normalizedSalonId] ?? null
    : null;
  const productCategoriesError = normalizedSalonId
    ? productErrorBySalon[normalizedSalonId] ?? null
    : null;

  const refresh = useCallback(async () => {
    if (!normalizedSalonId) {
      return { serviceCategories: [], productCategories: [] };
    }
    return ensureCategories(normalizedSalonId, {
      force: true,
      includeServices,
      includeProducts,
    });
  }, [ensureCategories, normalizedSalonId, includeServices, includeProducts]);

  return {
    serviceCategories,
    productCategories,
    isServiceCategoriesLoading,
    isProductCategoriesLoading,
    serviceCategoriesError,
    productCategoriesError,
    refresh,
  };
}

