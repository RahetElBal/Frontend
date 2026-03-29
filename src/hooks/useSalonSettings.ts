import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGet } from "@/hooks/useGet";
import type { Salon, SalonSettings } from "@/pages/admin/salon/types";
import type { SalonSettingsExtended } from "@/pages/admin/salon-settings/types";

type SalonSettingsLike = SalonSettings & Partial<SalonSettingsExtended>;

interface UseSalonSettingsOptions {
  enabled?: boolean;
}

const SALON_SETTINGS_STALE_TIME = 1000 * 60 * 10;

export function useSalonSettings(
  salonId: string | null | undefined,
  options: UseSalonSettingsOptions = {},
) {
  const queryClient = useQueryClient();
  const normalizedSalonId = salonId?.trim() || "";
  const enabled = options.enabled !== false && !!normalizedSalonId;
  const query = useGet<Salon>({
    path: normalizedSalonId ? `salons/${normalizedSalonId}` : "salons",
    options: {
      enabled,
      staleTime: SALON_SETTINGS_STALE_TIME,
    },
  });

  const refresh = useCallback(async () => {
    if (!enabled) {
      return null;
    }

    const result = await query.refetch();
    return result.data ?? null;
  }, [enabled, query]);

  const applyOptimisticSettings = useCallback(
    (nextSettings: Partial<SalonSettingsExtended>) => {
      if (!normalizedSalonId) {
        return;
      }

      queryClient.setQueriesData<Salon | undefined>(
        { queryKey: ["salons", normalizedSalonId] },
        (currentSalon) => {
          if (!currentSalon) {
            return currentSalon;
          }

          const mergedSettings = {
            ...(currentSalon.settings || {}),
            ...nextSettings,
          } as SalonSettingsLike;

          return {
            ...currentSalon,
            settings: mergedSettings,
          };
        },
      );
    },
    [normalizedSalonId, queryClient],
  );

  return {
    salon: query.data,
    settings: query.data?.settings as SalonSettingsLike | undefined,
    isLoading: query.isLoading,
    error: query.error ?? null,
    refresh,
    applyOptimisticSettings,
  };
}
