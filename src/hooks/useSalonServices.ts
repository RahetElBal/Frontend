import { useCallback } from "react";
import { selectCollectionData } from "@/common/utils";
import { useGet } from "@/hooks/useGet";
import type { Service } from "@/pages/user/services/types";

interface UseSalonServicesOptions {
  enabled?: boolean;
}

const SERVICES_STALE_TIME = 1000 * 60 * 30;

export function useSalonServices(
  salonId: string | null | undefined,
  options: UseSalonServicesOptions = {},
) {
  const normalizedSalonId = salonId?.trim() || "";
  const enabled = options.enabled !== false && !!normalizedSalonId;
  const query = useGet<Service[]>({
    path: "services",
    query: {
      salonId: normalizedSalonId || undefined,
      perPage: 100,
      compact: true,
    },
    options: {
      enabled,
      staleTime: SERVICES_STALE_TIME,
      select: (response) =>
        selectCollectionData(response as { data?: Service[] } | Service[]),
    },
  });

  const refresh = useCallback(async () => {
    if (!enabled) {
      return [];
    }

    const result = await query.refetch();
    return result.data ?? [];
  }, [enabled, query]);

  return {
    services: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ?? null,
    refresh,
  };
}
