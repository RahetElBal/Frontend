import { useCallback } from "react";
import { selectCollectionData } from "@/common/utils";
import { AppRole } from "@/constants/enum";
import { useGet } from "@/hooks/useGet";
import type { User } from "@/pages/admin/users/types";

interface UseSalonStaffOptions {
  enabled?: boolean;
}

const STAFF_STALE_TIME = 1000 * 60 * 10;

export function useSalonStaff(
  salonId: string | null | undefined,
  options: UseSalonStaffOptions = {},
) {
  const normalizedSalonId = salonId?.trim() || "";
  const enabled = options.enabled !== false && !!normalizedSalonId;
  const query = useGet<User[]>({
    path: "users",
    query: {
      salonId: normalizedSalonId || undefined,
      role: AppRole.USER,
      perPage: 100,
    },
    options: {
      enabled,
      staleTime: STAFF_STALE_TIME,
      select: (response) =>
        selectCollectionData(response as { data?: User[] } | User[]),
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
    staff: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ?? null,
    refresh,
  };
}
