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
import { get } from "@/lib/http";
import type { Salon, SalonSettings, SalonSettingsExtended } from "@/types/entities";
import type { AuthUser } from "@/types/user";

const SALON_SETTINGS_CACHE_TTL_MS = 1000 * 60 * 10;
const DEFAULT_BOOKING_SLOT_MINUTES = 15;

type SalonMap = Record<string, Salon>;
type LoadingMap = Record<string, boolean>;
type ErrorMap = Record<string, string | null>;
type TimestampMap = Record<string, number>;

type SalonSettingsLike = SalonSettings & Partial<SalonSettingsExtended>;

export interface SalonSettingsSnapshot {
  timezone: string;
  bookingSlotDuration: number;
  loyalty: {
    enabled: boolean;
    pointsPerCurrency: number;
    pointValue: number;
    minimumRedemption: number;
    rewardServiceId?: string;
    rewardDiscountType?: "percent" | "fixed";
    rewardDiscountValue?: number;
  };
  reminders: {
    sendAppointmentConfirmation: boolean;
    sendAppointmentReminder: boolean;
    reminderHoursBefore: number;
    sendBirthdayGreeting: boolean;
  };
}

interface SalonSettingsContextValue {
  salonsById: SalonMap;
  loadingBySalon: LoadingMap;
  errorBySalon: ErrorMap;
  ensureSalonSettings: (
    salonId: string,
    options?: { force?: boolean },
  ) => Promise<Salon | null>;
  setSalonInCache: (salon: Salon) => void;
  updateSalonSettingsInCache: (
    salonId: string,
    settings: Partial<SalonSettingsExtended>,
  ) => void;
  invalidateSalonSettings: (salonId?: string) => void;
}

interface SalonSettingsProviderProps {
  children: ReactNode;
}

interface UseSalonSettingsOptions {
  enabled?: boolean;
}

const SalonSettingsContext = createContext<SalonSettingsContextValue | undefined>(
  undefined,
);

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

const extractUserSalons = (user: AuthUser | null): Salon[] => {
  if (!user?.salon) return [];
  const salonValue = user.salon as unknown;
  if (Array.isArray(salonValue)) {
    return salonValue.filter(Boolean) as Salon[];
  }
  if (typeof salonValue === "object" && salonValue !== null) {
    return [salonValue as Salon];
  }
  return [];
};

const resolvePrimarySalonId = (user: AuthUser | null): string | null => {
  const salons = extractUserSalons(user);
  return salons[0]?.id ?? null;
};

export const buildSalonSettingsSnapshot = (
  settings: SalonSettingsLike | undefined,
): SalonSettingsSnapshot => {
  const bookingSlotDuration = Math.max(
    1,
    toNumber(settings?.bookingSlotDuration, DEFAULT_BOOKING_SLOT_MINUTES),
  );

  return {
    timezone: settings?.timezone || "UTC",
    bookingSlotDuration,
    loyalty: {
      enabled: !!settings?.loyaltyEnabled,
      pointsPerCurrency: Math.max(0, toNumber(settings?.loyaltyPointsPerCurrency, 1)),
      pointValue: Math.max(0, toNumber(settings?.loyaltyPointValue, 0.01)),
      minimumRedemption: Math.max(
        0,
        toNumber(settings?.loyaltyMinimumRedemption, 100),
      ),
      rewardServiceId: settings?.loyaltyRewardServiceId,
      rewardDiscountType: settings?.loyaltyRewardDiscountType,
      rewardDiscountValue: settings?.loyaltyRewardDiscountValue,
    },
    reminders: {
      sendAppointmentConfirmation: !!settings?.sendAppointmentConfirmation,
      sendAppointmentReminder: !!settings?.sendAppointmentReminder,
      reminderHoursBefore: Math.max(
        0,
        toNumber(settings?.reminderHoursBefore, 24),
      ),
      sendBirthdayGreeting: !!settings?.sendBirthdayGreeting,
    },
  };
};

export function SalonSettingsProvider({ children }: SalonSettingsProviderProps) {
  const { user, isAuthenticated } = useAuthContext();
  const [salonsById, setSalonsById] = useState<SalonMap>({});
  const [loadingBySalon, setLoadingBySalon] = useState<LoadingMap>({});
  const [errorBySalon, setErrorBySalon] = useState<ErrorMap>({});
  const [fetchedAtBySalon, setFetchedAtBySalon] = useState<TimestampMap>({});
  const inFlightRef = useRef<Map<string, Promise<Salon | null>>>(new Map());

  const salonsByIdRef = useRef<SalonMap>({});
  const fetchedAtBySalonRef = useRef<TimestampMap>({});

  useEffect(() => {
    salonsByIdRef.current = salonsById;
  }, [salonsById]);

  useEffect(() => {
    fetchedAtBySalonRef.current = fetchedAtBySalon;
  }, [fetchedAtBySalon]);

  const setSalonInCache = useCallback((salon: Salon) => {
    if (!salon?.id) return;
    setSalonsById((prev) => ({ ...prev, [salon.id]: salon }));
    setFetchedAtBySalon((prev) => ({ ...prev, [salon.id]: Date.now() }));
    setErrorBySalon((prev) => ({ ...prev, [salon.id]: null }));
  }, []);

  const ensureSalonSettings = useCallback(
    async (salonId: string, options?: { force?: boolean }) => {
      const normalizedSalonId = salonId?.trim();
      if (!normalizedSalonId) return null;

      const force = options?.force === true;
      const now = Date.now();
      const cached = salonsByIdRef.current[normalizedSalonId];
      const fetchedAt = fetchedAtBySalonRef.current[normalizedSalonId] ?? 0;

      if (!force && cached && now - fetchedAt < SALON_SETTINGS_CACHE_TTL_MS) {
        return cached;
      }

      const inFlightRequest = inFlightRef.current.get(normalizedSalonId);
      if (inFlightRequest) return inFlightRequest;

      setLoadingBySalon((prev) => ({ ...prev, [normalizedSalonId]: true }));
      setErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: null }));

      const request = (async () => {
        try {
          const salon = await get<Salon>(`salons/${normalizedSalonId}`);
          if (salon?.id) {
            setSalonInCache(salon);
            return salon;
          }
          return null;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to load salon settings";
          setErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: message }));
          return salonsByIdRef.current[normalizedSalonId] ?? null;
        } finally {
          setLoadingBySalon((prev) => ({ ...prev, [normalizedSalonId]: false }));
          inFlightRef.current.delete(normalizedSalonId);
        }
      })();

      inFlightRef.current.set(normalizedSalonId, request);
      return request;
    },
    [setSalonInCache],
  );

  const updateSalonSettingsInCache = useCallback(
    (salonId: string, settings: Partial<SalonSettingsExtended>) => {
      const normalizedSalonId = salonId?.trim();
      if (!normalizedSalonId) return;

      setSalonsById((prev) => {
        const existingSalon = prev[normalizedSalonId];
        if (!existingSalon) return prev;
        return {
          ...prev,
          [normalizedSalonId]: {
            ...existingSalon,
            settings: {
              ...(existingSalon.settings || {}),
              ...settings,
            } as Salon["settings"],
          },
        };
      });
      setFetchedAtBySalon((prev) => ({ ...prev, [normalizedSalonId]: Date.now() }));
      setErrorBySalon((prev) => ({ ...prev, [normalizedSalonId]: null }));
    },
    [],
  );

  const invalidateSalonSettings = useCallback((salonId?: string) => {
    const normalizedSalonId = salonId?.trim();
    if (!normalizedSalonId) {
      setSalonsById({});
      setLoadingBySalon({});
      setErrorBySalon({});
      setFetchedAtBySalon({});
      inFlightRef.current.clear();
      return;
    }

    setSalonsById((prev) => omitKey(prev, normalizedSalonId));
    setLoadingBySalon((prev) => omitKey(prev, normalizedSalonId));
    setErrorBySalon((prev) => omitKey(prev, normalizedSalonId));
    setFetchedAtBySalon((prev) => omitKey(prev, normalizedSalonId));
    inFlightRef.current.delete(normalizedSalonId);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      invalidateSalonSettings();
      return;
    }

    const userSalons = extractUserSalons(user);
    if (userSalons.length === 0) return;

    setSalonsById((prev) => {
      const next = { ...prev };
      userSalons.forEach((salon) => {
        if (!salon?.id) return;
        next[salon.id] = {
          ...prev[salon.id],
          ...salon,
        };
      });
      return next;
    });
    setFetchedAtBySalon((prev) => {
      const next = { ...prev };
      const now = Date.now();
      userSalons.forEach((salon) => {
        if (!salon?.id) return;
        next[salon.id] = now;
      });
      return next;
    });
  }, [isAuthenticated, user, invalidateSalonSettings]);

  const primarySalonId = useMemo(() => resolvePrimarySalonId(user), [user]);

  useEffect(() => {
    if (!isAuthenticated || !primarySalonId) return;
    void ensureSalonSettings(primarySalonId);
  }, [isAuthenticated, primarySalonId, ensureSalonSettings]);

  const value = useMemo<SalonSettingsContextValue>(
    () => ({
      salonsById,
      loadingBySalon,
      errorBySalon,
      ensureSalonSettings,
      setSalonInCache,
      updateSalonSettingsInCache,
      invalidateSalonSettings,
    }),
    [
      salonsById,
      loadingBySalon,
      errorBySalon,
      ensureSalonSettings,
      setSalonInCache,
      updateSalonSettingsInCache,
      invalidateSalonSettings,
    ],
  );

  return (
    <SalonSettingsContext.Provider value={value}>
      {children}
    </SalonSettingsContext.Provider>
  );
}

export function useSalonSettingsContext() {
  const context = useContext(SalonSettingsContext);
  if (!context) {
    throw new Error(
      "useSalonSettingsContext must be used within a SalonSettingsProvider",
    );
  }
  return context;
}

export function useSalonSettings(
  salonId: string | null | undefined,
  options: UseSalonSettingsOptions = {},
) {
  const { enabled = true } = options;
  const {
    salonsById,
    loadingBySalon,
    errorBySalon,
    ensureSalonSettings,
    updateSalonSettingsInCache,
  } = useSalonSettingsContext();
  const normalizedSalonId = salonId?.trim() || null;

  useEffect(() => {
    if (!enabled || !normalizedSalonId) return;
    void ensureSalonSettings(normalizedSalonId);
  }, [enabled, normalizedSalonId, ensureSalonSettings]);

  const salon = normalizedSalonId ? salonsById[normalizedSalonId] : undefined;
  const settings = useMemo(
    () => salon?.settings as SalonSettingsLike | undefined,
    [salon],
  );
  const snapshot = useMemo(
    () => buildSalonSettingsSnapshot(settings),
    [settings],
  );
  const isLoading = normalizedSalonId
    ? loadingBySalon[normalizedSalonId] ?? false
    : false;
  const error = normalizedSalonId ? errorBySalon[normalizedSalonId] ?? null : null;

  const refresh = useCallback(async () => {
    if (!normalizedSalonId) return null;
    return ensureSalonSettings(normalizedSalonId, { force: true });
  }, [ensureSalonSettings, normalizedSalonId]);

  const applyOptimisticSettings = useCallback(
    (nextSettings: Partial<SalonSettingsExtended>) => {
      if (!normalizedSalonId) return;
      updateSalonSettingsInCache(normalizedSalonId, nextSettings);
    },
    [normalizedSalonId, updateSalonSettingsInCache],
  );

  return {
    salon,
    settings,
    snapshot,
    isLoading,
    error,
    refresh,
    applyOptimisticSettings,
  };
}
