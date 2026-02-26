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
import type { PaginatedResponse } from "@/types/api";
import type { Salon, User } from "@/types/entities";
import type { AuthUser } from "@/types/user";

const STAFF_CACHE_TTL_MS = 1000 * 60 * 10;

type StaffMap = Record<string, User[]>;
type LoadingMap = Record<string, boolean>;
type ErrorMap = Record<string, string | null>;
type TimestampMap = Record<string, number>;

interface StaffContextValue {
  staffBySalon: StaffMap;
  loadingBySalon: LoadingMap;
  errorBySalon: ErrorMap;
  ensureStaff: (
    salonId: string,
    options?: { force?: boolean },
  ) => Promise<User[]>;
  invalidateStaff: (salonId?: string) => void;
}

interface StaffProviderProps {
  children: ReactNode;
}

interface UseSalonStaffOptions {
  enabled?: boolean;
}

type StaffApiResponse = PaginatedResponse<User> | User[];

const StaffContext = createContext<StaffContextValue | undefined>(undefined);

const extractStaff = (response: StaffApiResponse | null | undefined) => {
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

export function StaffProvider({ children }: StaffProviderProps) {
  const { user, isAuthenticated } = useAuthContext();
  const [staffBySalon, setStaffBySalon] = useState<StaffMap>({});
  const [loadingBySalon, setLoadingBySalon] = useState<LoadingMap>({});
  const [errorBySalon, setErrorBySalon] = useState<ErrorMap>({});
  const [fetchedAtBySalon, setFetchedAtBySalon] = useState<TimestampMap>({});
  const inFlightRef = useRef<Map<string, Promise<User[]>>>(new Map());

  const staffBySalonRef = useRef<StaffMap>({});
  const fetchedAtBySalonRef = useRef<TimestampMap>({});

  useEffect(() => {
    staffBySalonRef.current = staffBySalon;
  }, [staffBySalon]);

  useEffect(() => {
    fetchedAtBySalonRef.current = fetchedAtBySalon;
  }, [fetchedAtBySalon]);

  const ensureStaff = useCallback(
    async (salonId: string, options?: { force?: boolean }) => {
      const normalizedSalonId = salonId?.trim();
      if (!normalizedSalonId) return [];

      const force = options?.force === true;
      const now = Date.now();
      const lastFetchedAt = fetchedAtBySalonRef.current[normalizedSalonId] ?? 0;
      const cached = staffBySalonRef.current[normalizedSalonId];

      if (!force && cached && now - lastFetchedAt < STAFF_CACHE_TTL_MS) {
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
          const response = await get<StaffApiResponse>(
            buildUrl("users", {
              salonId: normalizedSalonId,
              role: "user",
              perPage: 100,
            }),
          );
          const staff = extractStaff(response);

          setStaffBySalon((prev) => ({ ...prev, [normalizedSalonId]: staff }));
          setFetchedAtBySalon((prev) => ({
            ...prev,
            [normalizedSalonId]: Date.now(),
          }));
          setErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: null }));

          return staff;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to load staff";
          setErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: message }));
          return staffBySalonRef.current[normalizedSalonId] ?? [];
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

  const invalidateStaff = useCallback((salonId?: string) => {
    const normalizedSalonId = salonId?.trim();

    if (!normalizedSalonId) {
      setStaffBySalon({});
      setLoadingBySalon({});
      setErrorBySalon({});
      setFetchedAtBySalon({});
      inFlightRef.current.clear();
      return;
    }

    setStaffBySalon((prev) => omitKey(prev, normalizedSalonId));
    setLoadingBySalon((prev) => omitKey(prev, normalizedSalonId));
    setErrorBySalon((prev) => omitKey(prev, normalizedSalonId));
    setFetchedAtBySalon((prev) => omitKey(prev, normalizedSalonId));
    inFlightRef.current.delete(normalizedSalonId);
  }, []);

  const primarySalonId = useMemo(() => resolvePrimarySalonId(user), [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      invalidateStaff();
      return;
    }
    if (!primarySalonId) return;
    void ensureStaff(primarySalonId);
  }, [isAuthenticated, primarySalonId, ensureStaff, invalidateStaff]);

  const value = useMemo<StaffContextValue>(
    () => ({
      staffBySalon,
      loadingBySalon,
      errorBySalon,
      ensureStaff,
      invalidateStaff,
    }),
    [staffBySalon, loadingBySalon, errorBySalon, ensureStaff, invalidateStaff],
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
}

export function useStaffContext() {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaffContext must be used within a StaffProvider");
  }
  return context;
}

export function useSalonStaff(
  salonId: string | null | undefined,
  options: UseSalonStaffOptions = {},
) {
  const { enabled = true } = options;
  const { staffBySalon, loadingBySalon, errorBySalon, ensureStaff } =
    useStaffContext();
  const normalizedSalonId = salonId?.trim() || null;

  useEffect(() => {
    if (!enabled || !normalizedSalonId) return;
    void ensureStaff(normalizedSalonId);
  }, [enabled, normalizedSalonId, ensureStaff]);

  const staff = normalizedSalonId ? staffBySalon[normalizedSalonId] ?? [] : [];
  const isLoading = normalizedSalonId
    ? loadingBySalon[normalizedSalonId] ?? false
    : false;
  const error = normalizedSalonId ? errorBySalon[normalizedSalonId] ?? null : null;

  const refresh = useCallback(async () => {
    if (!normalizedSalonId) return [];
    return ensureStaff(normalizedSalonId, { force: true });
  }, [ensureStaff, normalizedSalonId]);

  return { staff, isLoading, error, refresh };
}

