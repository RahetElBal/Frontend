/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { buildUrl, get } from "@/lib/http";
import type { Client, Sale } from "@/types/entities";
import type { PaginatedResponse } from "@/types/api";
import { normalizeSale } from "@/utils/normalize-sales";

const CLIENTS_TTL_MS = 1000 * 60 * 5;
const SALES_TTL_MS = 1000 * 60;

type DataMap<T> = Record<string, T[]>;
type LoadingMap = Record<string, boolean>;
type ErrorMap = Record<string, string | null>;
type TimestampMap = Record<string, number>;

interface LoyaltyContextValue {
  clientsBySalon: DataMap<Client>;
  salesBySalon: DataMap<Sale>;
  clientsLoadingBySalon: LoadingMap;
  salesLoadingBySalon: LoadingMap;
  clientsErrorBySalon: ErrorMap;
  salesErrorBySalon: ErrorMap;
  ensureLoyaltyData: (
    salonId: string,
    options?: { force?: boolean; includeClients?: boolean; includeSales?: boolean },
  ) => Promise<{ clients: Client[]; sales: Sale[] }>;
  invalidateLoyaltyData: (salonId?: string) => void;
}

interface LoyaltyProviderProps {
  children: ReactNode;
}

interface UseSalonLoyaltyDataOptions {
  enabled?: boolean;
  includeClients?: boolean;
  includeSales?: boolean;
}

type ListResponse<T> = PaginatedResponse<T> | T[];

const LoyaltyContext = createContext<LoyaltyContextValue | undefined>(undefined);

const extractArray = <T,>(response: ListResponse<T> | null | undefined): T[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  return Array.isArray(response.data) ? response.data : [];
};

const omitKey = <T extends Record<string, unknown>>(obj: T, key: string): T => {
  const { [key]: _unused, ...rest } = obj;
  return rest as T;
};

export function LoyaltyProvider({ children }: LoyaltyProviderProps) {
  const [clientsBySalon, setClientsBySalon] = useState<DataMap<Client>>({});
  const [salesBySalon, setSalesBySalon] = useState<DataMap<Sale>>({});
  const [clientsLoadingBySalon, setClientsLoadingBySalon] = useState<LoadingMap>(
    {},
  );
  const [salesLoadingBySalon, setSalesLoadingBySalon] = useState<LoadingMap>({});
  const [clientsErrorBySalon, setClientsErrorBySalon] = useState<ErrorMap>({});
  const [salesErrorBySalon, setSalesErrorBySalon] = useState<ErrorMap>({});
  const [clientsFetchedAtBySalon, setClientsFetchedAtBySalon] =
    useState<TimestampMap>({});
  const [salesFetchedAtBySalon, setSalesFetchedAtBySalon] =
    useState<TimestampMap>({});

  const clientsBySalonRef = useRef<DataMap<Client>>({});
  const salesBySalonRef = useRef<DataMap<Sale>>({});
  const clientsFetchedAtBySalonRef = useRef<TimestampMap>({});
  const salesFetchedAtBySalonRef = useRef<TimestampMap>({});
  const inFlightClientsRef = useRef<Map<string, Promise<Client[]>>>(new Map());
  const inFlightSalesRef = useRef<Map<string, Promise<Sale[]>>>(new Map());

  useEffect(() => {
    clientsBySalonRef.current = clientsBySalon;
  }, [clientsBySalon]);

  useEffect(() => {
    salesBySalonRef.current = salesBySalon;
  }, [salesBySalon]);

  useEffect(() => {
    clientsFetchedAtBySalonRef.current = clientsFetchedAtBySalon;
  }, [clientsFetchedAtBySalon]);

  useEffect(() => {
    salesFetchedAtBySalonRef.current = salesFetchedAtBySalon;
  }, [salesFetchedAtBySalon]);

  const fetchClients = useCallback(async (salonId: string, force = false) => {
    const normalizedSalonId = salonId.trim();
    const now = Date.now();
    const cached = clientsBySalonRef.current[normalizedSalonId];
    const fetchedAt = clientsFetchedAtBySalonRef.current[normalizedSalonId] ?? 0;

    if (!force && cached && now - fetchedAt < CLIENTS_TTL_MS) {
      return cached;
    }

    const inFlight = inFlightClientsRef.current.get(normalizedSalonId);
    if (inFlight) return inFlight;

    setClientsLoadingBySalon((prev) => ({ ...prev, [normalizedSalonId]: true }));
    setClientsErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: null }));

    const request = (async () => {
      try {
        const response = await get<ListResponse<Client>>(
          buildUrl("clients", { salonId: normalizedSalonId, perPage: 10 }),
        );
        const clients = extractArray(response);
        setClientsBySalon((prev) => ({ ...prev, [normalizedSalonId]: clients }));
        setClientsFetchedAtBySalon((prev) => ({
          ...prev,
          [normalizedSalonId]: Date.now(),
        }));
        return clients;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load clients";
        setClientsErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: message }));
        return clientsBySalonRef.current[normalizedSalonId] ?? [];
      } finally {
        setClientsLoadingBySalon((prev) => ({ ...prev, [normalizedSalonId]: false }));
        inFlightClientsRef.current.delete(normalizedSalonId);
      }
    })();

    inFlightClientsRef.current.set(normalizedSalonId, request);
    return request;
  }, []);

  const fetchSales = useCallback(async (salonId: string, force = false) => {
    const normalizedSalonId = salonId.trim();
    const now = Date.now();
    const cached = salesBySalonRef.current[normalizedSalonId];
    const fetchedAt = salesFetchedAtBySalonRef.current[normalizedSalonId] ?? 0;

    if (!force && cached && now - fetchedAt < SALES_TTL_MS) {
      return cached;
    }

    const inFlight = inFlightSalesRef.current.get(normalizedSalonId);
    if (inFlight) return inFlight;

    setSalesLoadingBySalon((prev) => ({ ...prev, [normalizedSalonId]: true }));
    setSalesErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: null }));

    const request = (async () => {
      try {
        const response = await get<ListResponse<Sale>>(
          buildUrl("sales", {
            salonId: normalizedSalonId,
            perPage: 10,
            sortBy: "createdAt",
            sortOrder: "desc",
            compact: true,
          }),
        );
        const sales = extractArray(response).map(normalizeSale);
        setSalesBySalon((prev) => ({ ...prev, [normalizedSalonId]: sales }));
        setSalesFetchedAtBySalon((prev) => ({
          ...prev,
          [normalizedSalonId]: Date.now(),
        }));
        return sales;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load sales";
        setSalesErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: message }));
        return salesBySalonRef.current[normalizedSalonId] ?? [];
      } finally {
        setSalesLoadingBySalon((prev) => ({ ...prev, [normalizedSalonId]: false }));
        inFlightSalesRef.current.delete(normalizedSalonId);
      }
    })();

    inFlightSalesRef.current.set(normalizedSalonId, request);
    return request;
  }, []);

  const ensureLoyaltyData = useCallback(
    async (
      salonId: string,
      options: { force?: boolean; includeClients?: boolean; includeSales?: boolean } = {},
    ) => {
      const normalizedSalonId = salonId?.trim();
      if (!normalizedSalonId) return { clients: [], sales: [] };

      const force = options.force === true;
      const includeClients = options.includeClients !== false;
      const includeSales = options.includeSales !== false;

      const [clients, sales] = await Promise.all([
        includeClients ? fetchClients(normalizedSalonId, force) : Promise.resolve([]),
        includeSales ? fetchSales(normalizedSalonId, force) : Promise.resolve([]),
      ]);

      return { clients, sales };
    },
    [fetchClients, fetchSales],
  );

  const invalidateLoyaltyData = useCallback((salonId?: string) => {
    const normalizedSalonId = salonId?.trim();
    if (!normalizedSalonId) {
      setClientsBySalon({});
      setSalesBySalon({});
      setClientsLoadingBySalon({});
      setSalesLoadingBySalon({});
      setClientsErrorBySalon({});
      setSalesErrorBySalon({});
      setClientsFetchedAtBySalon({});
      setSalesFetchedAtBySalon({});
      inFlightClientsRef.current.clear();
      inFlightSalesRef.current.clear();
      return;
    }

    setClientsBySalon((prev) => omitKey(prev, normalizedSalonId));
    setSalesBySalon((prev) => omitKey(prev, normalizedSalonId));
    setClientsLoadingBySalon((prev) => omitKey(prev, normalizedSalonId));
    setSalesLoadingBySalon((prev) => omitKey(prev, normalizedSalonId));
    setClientsErrorBySalon((prev) => omitKey(prev, normalizedSalonId));
    setSalesErrorBySalon((prev) => omitKey(prev, normalizedSalonId));
    setClientsFetchedAtBySalon((prev) => omitKey(prev, normalizedSalonId));
    setSalesFetchedAtBySalon((prev) => omitKey(prev, normalizedSalonId));
    inFlightClientsRef.current.delete(normalizedSalonId);
    inFlightSalesRef.current.delete(normalizedSalonId);
  }, []);

  const value = useMemo<LoyaltyContextValue>(
    () => ({
      clientsBySalon,
      salesBySalon,
      clientsLoadingBySalon,
      salesLoadingBySalon,
      clientsErrorBySalon,
      salesErrorBySalon,
      ensureLoyaltyData,
      invalidateLoyaltyData,
    }),
    [
      clientsBySalon,
      salesBySalon,
      clientsLoadingBySalon,
      salesLoadingBySalon,
      clientsErrorBySalon,
      salesErrorBySalon,
      ensureLoyaltyData,
      invalidateLoyaltyData,
    ],
  );

  return (
    <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>
  );
}

export function useLoyaltyContext() {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error("useLoyaltyContext must be used within a LoyaltyProvider");
  }
  return context;
}

export function useSalonLoyaltyData(
  salonId: string | null | undefined,
  options: UseSalonLoyaltyDataOptions = {},
) {
  const {
    clientsBySalon,
    salesBySalon,
    clientsLoadingBySalon,
    salesLoadingBySalon,
    clientsErrorBySalon,
    salesErrorBySalon,
    ensureLoyaltyData,
  } = useLoyaltyContext();

  const enabled = options.enabled !== false;
  const includeClients = options.includeClients !== false;
  const includeSales = options.includeSales !== false;
  const normalizedSalonId = salonId?.trim() || null;

  useEffect(() => {
    if (!enabled || !normalizedSalonId) return;
    void ensureLoyaltyData(normalizedSalonId, {
      includeClients,
      includeSales,
    });
  }, [
    enabled,
    normalizedSalonId,
    includeClients,
    includeSales,
    ensureLoyaltyData,
  ]);

  const clients = normalizedSalonId ? clientsBySalon[normalizedSalonId] ?? [] : [];
  const sales = normalizedSalonId ? salesBySalon[normalizedSalonId] ?? [] : [];
  const isClientsLoading = normalizedSalonId
    ? clientsLoadingBySalon[normalizedSalonId] ?? false
    : false;
  const isSalesLoading = normalizedSalonId
    ? salesLoadingBySalon[normalizedSalonId] ?? false
    : false;
  const clientsError = normalizedSalonId
    ? clientsErrorBySalon[normalizedSalonId] ?? null
    : null;
  const salesError = normalizedSalonId
    ? salesErrorBySalon[normalizedSalonId] ?? null
    : null;

  const refresh = useCallback(async () => {
    if (!normalizedSalonId) return { clients: [], sales: [] };
    return ensureLoyaltyData(normalizedSalonId, {
      force: true,
      includeClients,
      includeSales,
    });
  }, [ensureLoyaltyData, normalizedSalonId, includeClients, includeSales]);

  return {
    clients,
    sales,
    isClientsLoading,
    isSalesLoading,
    clientsError,
    salesError,
    refresh,
  };
}

