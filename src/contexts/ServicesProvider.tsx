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
import type { Service } from "@/pages/user/services/types";
import type { Salon } from "@/pages/admin/salon/types";
import type { PaginatedResponse } from "@/types/api";
import type { AuthUser } from "@/types/user";

const SERVICES_CACHE_TTL_MS = 1000 * 60 * 30;

type ServicesMap = Record<string, Service[]>;
type LoadingMap = Record<string, boolean>;
type ErrorMap = Record<string, string | null>;
type TimestampMap = Record<string, number>;

interface ServicesContextValue {
  servicesBySalon: ServicesMap;
  loadingBySalon: LoadingMap;
  errorBySalon: ErrorMap;
  ensureServices: (
    salonId: string,
    options?: { force?: boolean },
  ) => Promise<Service[]>;
  invalidateServices: (salonId?: string) => void;
}

interface ServicesProviderProps {
  children: ReactNode;
}

interface UseSalonServicesOptions {
  enabled?: boolean;
}

const ServicesContext = createContext<ServicesContextValue | undefined>(
  undefined,
);

type ServicesApiResponse = PaginatedResponse<Service> | Service[];

const extractServices = (response: ServicesApiResponse | null | undefined) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
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

export function ServicesProvider({ children }: ServicesProviderProps) {
  const { user, isAuthenticated } = useAuthContext();
  const [servicesBySalon, setServicesBySalon] = useState<ServicesMap>({});
  const [loadingBySalon, setLoadingBySalon] = useState<LoadingMap>({});
  const [errorBySalon, setErrorBySalon] = useState<ErrorMap>({});
  const [fetchedAtBySalon, setFetchedAtBySalon] = useState<TimestampMap>({});
  const inFlightRef = useRef<Map<string, Promise<Service[]>>>(new Map());

  const servicesBySalonRef = useRef<ServicesMap>({});
  const fetchedAtBySalonRef = useRef<TimestampMap>({});

  useEffect(() => {
    servicesBySalonRef.current = servicesBySalon;
  }, [servicesBySalon]);

  useEffect(() => {
    fetchedAtBySalonRef.current = fetchedAtBySalon;
  }, [fetchedAtBySalon]);

  const ensureServices = useCallback(
    async (salonId: string, options?: { force?: boolean }) => {
      const normalizedSalonId = salonId?.trim();
      if (!normalizedSalonId) return [];

      const force = options?.force === true;
      const now = Date.now();
      const lastFetchedAt = fetchedAtBySalonRef.current[normalizedSalonId] ?? 0;
      const cached = servicesBySalonRef.current[normalizedSalonId];

      if (!force && cached && now - lastFetchedAt < SERVICES_CACHE_TTL_MS) {
        return cached;
      }

      const inFlightRequest = inFlightRef.current.get(normalizedSalonId);
      if (inFlightRequest) {
        return inFlightRequest;
      }

      setLoadingBySalon((prev) => ({ ...prev, [normalizedSalonId]: true }));
      setErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: null }));

      const request = (async () => {
        try {
          const response = await get<ServicesApiResponse>(
            buildUrl("services", {
              salonId: normalizedSalonId,
              perPage: 100,
              compact: true,
            }),
          );
          const services = extractServices(response);

          setServicesBySalon((prev) => ({ ...prev, [normalizedSalonId]: services }));
          setFetchedAtBySalon((prev) => ({ ...prev, [normalizedSalonId]: Date.now() }));
          setErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: null }));

          return services;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to load services";
          setErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: message }));
          return servicesBySalonRef.current[normalizedSalonId] ?? [];
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

  const invalidateServices = useCallback((salonId?: string) => {
    const normalizedSalonId = salonId?.trim();

    if (!normalizedSalonId) {
      setServicesBySalon({});
      setLoadingBySalon({});
      setErrorBySalon({});
      setFetchedAtBySalon({});
      inFlightRef.current.clear();
      return;
    }

    setServicesBySalon((prev) => omitKey(prev, normalizedSalonId));
    setLoadingBySalon((prev) => omitKey(prev, normalizedSalonId));
    setErrorBySalon((prev) => omitKey(prev, normalizedSalonId));
    setFetchedAtBySalon((prev) => omitKey(prev, normalizedSalonId));
    inFlightRef.current.delete(normalizedSalonId);
  }, []);

  const primarySalonId = useMemo(
    () => resolvePrimarySalonId(user),
    [user],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      invalidateServices();
      return;
    }

    if (!primarySalonId) return;
    void ensureServices(primarySalonId);
  }, [isAuthenticated, primarySalonId, ensureServices, invalidateServices]);

  const value = useMemo<ServicesContextValue>(
    () => ({
      servicesBySalon,
      loadingBySalon,
      errorBySalon,
      ensureServices,
      invalidateServices,
    }),
    [servicesBySalon, loadingBySalon, errorBySalon, ensureServices, invalidateServices],
  );

  return (
    <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>
  );
}

export function useServicesContext() {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error("useServicesContext must be used within a ServicesProvider");
  }
  return context;
}

export function useSalonServices(
  salonId: string | null | undefined,
  options: UseSalonServicesOptions = {},
) {
  const { enabled = true } = options;
  const { servicesBySalon, loadingBySalon, errorBySalon, ensureServices } =
    useServicesContext();
  const normalizedSalonId = salonId?.trim() || null;

  useEffect(() => {
    if (!enabled || !normalizedSalonId) return;
    void ensureServices(normalizedSalonId);
  }, [enabled, normalizedSalonId, ensureServices]);

  const services = normalizedSalonId ? servicesBySalon[normalizedSalonId] ?? [] : [];
  const isLoading = normalizedSalonId ? loadingBySalon[normalizedSalonId] ?? false : false;
  const error = normalizedSalonId ? errorBySalon[normalizedSalonId] ?? null : null;
  const refresh = useCallback(async () => {
    if (!normalizedSalonId) return [];
    return ensureServices(normalizedSalonId, { force: true });
  }, [ensureServices, normalizedSalonId]);

  return { services, isLoading, error, refresh };
}
