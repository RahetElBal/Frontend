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
import { useAuthContext } from "@/contexts/AuthProvider";
import { buildUrl, get } from "@/lib/http";
import type { Salon } from "@/pages/admin/salon/types";
import type { AuthUser } from "@/types/user";

const SUMMARY_CACHE_TTL_MS = 1000 * 60;

type SummaryMap = Record<string, BusinessSummary>;
type LoadingMap = Record<string, boolean>;
type ErrorMap = Record<string, string | null>;
type TimestampMap = Record<string, number>;

interface BusinessSummaryApiResponse {
  grossRevenue?: number | string;
  netRevenue?: number | string;
  monthlyRevenue?: number | string;
  transactionCount?: number | string;
  canceledCount?: number | string;
  canceledRevenueImpact?: number | string;
  refundedCount?: number | string;
  refundedRevenueImpact?: number | string;
  todayRevenue?: number | string;
  lastWeekRevenue?: number | string;
  updatedAt?: string;
}

export interface BusinessSummary {
  grossRevenue: number;
  netRevenue: number;
  monthlyRevenue: number;
  transactionCount: number;
  canceledCount: number;
  canceledRevenueImpact: number;
  refundedCount: number;
  refundedRevenueImpact: number;
  todayRevenue: number;
  lastWeekRevenue: number;
  updatedAt: number;
}

interface BusinessSummaryContextValue {
  summaryBySalon: SummaryMap;
  loadingBySalon: LoadingMap;
  errorBySalon: ErrorMap;
  ensureBusinessSummary: (
    salonId: string,
    options?: { force?: boolean },
  ) => Promise<BusinessSummary>;
  invalidateBusinessSummary: (salonId?: string) => void;
}

interface BusinessSummaryProviderProps {
  children: ReactNode;
}

interface UseSalonBusinessSummaryOptions {
  enabled?: boolean;
}

const BusinessSummaryContext = createContext<BusinessSummaryContextValue | undefined>(
  undefined,
);

const EMPTY_SUMMARY: BusinessSummary = {
  grossRevenue: 0,
  netRevenue: 0,
  monthlyRevenue: 0,
  transactionCount: 0,
  canceledCount: 0,
  canceledRevenueImpact: 0,
  refundedCount: 0,
  refundedRevenueImpact: 0,
  todayRevenue: 0,
  lastWeekRevenue: 0,
  updatedAt: 0,
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const omitKey = <T extends Record<string, unknown>>(obj: T, key: string): T => {
  const { [key]: _unused, ...rest } = obj;
  return rest as T;
};

const resolvePrimarySalonId = (user: AuthUser | null): string | null => {
  if (!user?.salon) return null;
  const salonValue = user.salon as unknown;

  if (Array.isArray(salonValue)) {
    return (salonValue[0] as Salon | undefined)?.id ?? null;
  }

  if (typeof salonValue === "object" && salonValue !== null) {
    return (salonValue as Salon).id ?? null;
  }

  return null;
};

export function BusinessSummaryProvider({ children }: BusinessSummaryProviderProps) {
  const { user, isAuthenticated } = useAuthContext();
  const [summaryBySalon, setSummaryBySalon] = useState<SummaryMap>({});
  const [loadingBySalon, setLoadingBySalon] = useState<LoadingMap>({});
  const [errorBySalon, setErrorBySalon] = useState<ErrorMap>({});
  const [fetchedAtBySalon, setFetchedAtBySalon] = useState<TimestampMap>({});
  const inFlightRef = useRef<Map<string, Promise<BusinessSummary>>>(new Map());

  const summaryBySalonRef = useRef<SummaryMap>({});
  const fetchedAtBySalonRef = useRef<TimestampMap>({});

  useEffect(() => {
    summaryBySalonRef.current = summaryBySalon;
  }, [summaryBySalon]);

  useEffect(() => {
    fetchedAtBySalonRef.current = fetchedAtBySalon;
  }, [fetchedAtBySalon]);

  const ensureBusinessSummary = useCallback(
    async (salonId: string, options?: { force?: boolean }) => {
      const normalizedSalonId = salonId?.trim();
      if (!normalizedSalonId) return EMPTY_SUMMARY;

      const force = options?.force === true;
      const now = Date.now();
      const cached = summaryBySalonRef.current[normalizedSalonId];
      const fetchedAt = fetchedAtBySalonRef.current[normalizedSalonId] ?? 0;
      if (!force && cached && now - fetchedAt < SUMMARY_CACHE_TTL_MS) {
        return cached;
      }

      const inFlight = inFlightRef.current.get(normalizedSalonId);
      if (inFlight) return inFlight;

      setLoadingBySalon((prev) => ({ ...prev, [normalizedSalonId]: true }));
      setErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: null }));

      const request = (async () => {
        try {
          const response = await get<BusinessSummaryApiResponse>(
            buildUrl("sales/business-summary", {
              salonId: normalizedSalonId,
            }),
          );

          const grossRevenue = toNumber(response?.grossRevenue);
          const netRevenue = toNumber(response?.netRevenue, grossRevenue);
          const monthlyRevenue = toNumber(response?.monthlyRevenue);
          const transactionCount = toNumber(response?.transactionCount);
          const canceledCount = toNumber(response?.canceledCount);
          const canceledRevenueImpact = toNumber(response?.canceledRevenueImpact);
          const refundedCount = toNumber(response?.refundedCount);
          const refundedRevenueImpact = toNumber(response?.refundedRevenueImpact);
          const todayRevenue = toNumber(response?.todayRevenue);
          const lastWeekRevenue = toNumber(response?.lastWeekRevenue);
          const updatedAt = response?.updatedAt
            ? Date.parse(response.updatedAt)
            : Date.now();

          const summary: BusinessSummary = {
            grossRevenue,
            netRevenue,
            monthlyRevenue,
            transactionCount,
            canceledCount,
            canceledRevenueImpact,
            refundedCount,
            refundedRevenueImpact,
            todayRevenue,
            lastWeekRevenue,
            updatedAt: Number.isFinite(updatedAt) ? updatedAt : Date.now(),
          };

          setSummaryBySalon((prev) => ({ ...prev, [normalizedSalonId]: summary }));
          setFetchedAtBySalon((prev) => ({
            ...prev,
            [normalizedSalonId]: Date.now(),
          }));
          setErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: null }));

          return summary;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to load business summary";
          setErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: message }));
          return summaryBySalonRef.current[normalizedSalonId] ?? EMPTY_SUMMARY;
        } finally {
          setLoadingBySalon((prev) => ({ ...prev, [normalizedSalonId]: false }));
          inFlightRef.current.delete(normalizedSalonId);
        }
      })();

      inFlightRef.current.set(normalizedSalonId, request);
      return request;
    },
    [],
  );

  const invalidateBusinessSummary = useCallback((salonId?: string) => {
    const normalizedSalonId = salonId?.trim();
    if (!normalizedSalonId) {
      setSummaryBySalon({});
      setLoadingBySalon({});
      setErrorBySalon({});
      setFetchedAtBySalon({});
      inFlightRef.current.clear();
      return;
    }

    setSummaryBySalon((prev) => omitKey(prev, normalizedSalonId));
    setLoadingBySalon((prev) => omitKey(prev, normalizedSalonId));
    setErrorBySalon((prev) => omitKey(prev, normalizedSalonId));
    setFetchedAtBySalon((prev) => omitKey(prev, normalizedSalonId));
    inFlightRef.current.delete(normalizedSalonId);
  }, []);

  const primarySalonId = useMemo(() => resolvePrimarySalonId(user), [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      invalidateBusinessSummary();
      return;
    }
    if (!primarySalonId) return;
    void ensureBusinessSummary(primarySalonId);
  }, [isAuthenticated, primarySalonId, ensureBusinessSummary, invalidateBusinessSummary]);

  const value = useMemo<BusinessSummaryContextValue>(
    () => ({
      summaryBySalon,
      loadingBySalon,
      errorBySalon,
      ensureBusinessSummary,
      invalidateBusinessSummary,
    }),
    [
      summaryBySalon,
      loadingBySalon,
      errorBySalon,
      ensureBusinessSummary,
      invalidateBusinessSummary,
    ],
  );

  return (
    <BusinessSummaryContext.Provider value={value}>
      {children}
    </BusinessSummaryContext.Provider>
  );
}

export function useBusinessSummaryContext() {
  const context = useContext(BusinessSummaryContext);
  if (!context) {
    throw new Error(
      "useBusinessSummaryContext must be used within a BusinessSummaryProvider",
    );
  }
  return context;
}

export function useSalonBusinessSummary(
  salonId: string | null | undefined,
  options: UseSalonBusinessSummaryOptions = {},
) {
  const { enabled = true } = options;
  const { summaryBySalon, loadingBySalon, errorBySalon, ensureBusinessSummary } =
    useBusinessSummaryContext();
  const normalizedSalonId = salonId?.trim() || null;

  useEffect(() => {
    if (!enabled || !normalizedSalonId) return;
    void ensureBusinessSummary(normalizedSalonId);
  }, [enabled, normalizedSalonId, ensureBusinessSummary]);

  const summary = normalizedSalonId
    ? summaryBySalon[normalizedSalonId] ?? EMPTY_SUMMARY
    : EMPTY_SUMMARY;
  const isLoading = normalizedSalonId
    ? loadingBySalon[normalizedSalonId] ?? false
    : false;
  const error = normalizedSalonId ? errorBySalon[normalizedSalonId] ?? null : null;

  const refresh = useCallback(async () => {
    if (!normalizedSalonId) return EMPTY_SUMMARY;
    return ensureBusinessSummary(normalizedSalonId, { force: true });
  }, [ensureBusinessSummary, normalizedSalonId]);

  return { summary, isLoading, error, refresh };
}
