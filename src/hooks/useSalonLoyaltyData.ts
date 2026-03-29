import { useCallback } from "react";
import { selectCollectionData } from "@/common/utils";
import { useGet } from "@/hooks/useGet";
import type { Client } from "@/pages/user/clients/types";
import type { Sale } from "@/pages/user/sales/types";
import { normalizeSale } from "@/utils/normalize-sales";

interface UseSalonLoyaltyDataOptions {
  enabled?: boolean;
  includeClients?: boolean;
  includeSales?: boolean;
}

const CLIENTS_STALE_TIME = 1000 * 60 * 5;
const SALES_STALE_TIME = 1000 * 60;

export function useSalonLoyaltyData(
  salonId: string | null | undefined,
  options: UseSalonLoyaltyDataOptions = {},
) {
  const normalizedSalonId = salonId?.trim() || "";
  const enabled = options.enabled !== false && !!normalizedSalonId;
  const includeClients = options.includeClients !== false;
  const includeSales = options.includeSales !== false;

  const clientsQuery = useGet<Client[]>({
    path: "clients",
    query: {
      salonId: normalizedSalonId || undefined,
      perPage: 10,
    },
    options: {
      enabled: enabled && includeClients,
      staleTime: CLIENTS_STALE_TIME,
      select: (response) =>
        selectCollectionData(response as { data?: Client[] } | Client[]),
    },
  });

  const salesQuery = useGet<Sale[]>({
    path: "sales",
    query: {
      salonId: normalizedSalonId || undefined,
      perPage: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      compact: true,
    },
    options: {
      enabled: enabled && includeSales,
      staleTime: SALES_STALE_TIME,
      select: (response) =>
        selectCollectionData(response as { data?: Sale[] } | Sale[]).map(normalizeSale),
    },
  });

  const refresh = useCallback(async () => {
    const [clientsResult, salesResult] = await Promise.all([
      includeClients && enabled
        ? clientsQuery.refetch()
        : Promise.resolve({ data: [] as Client[] }),
      includeSales && enabled
        ? salesQuery.refetch()
        : Promise.resolve({ data: [] as Sale[] }),
    ]);

    return {
      clients: clientsResult.data ?? [],
      sales: salesResult.data ?? [],
    };
  }, [clientsQuery, enabled, includeClients, includeSales, salesQuery]);

  return {
    clients: clientsQuery.data ?? [],
    sales: salesQuery.data ?? [],
    isClientsLoading: clientsQuery.isLoading,
    isSalesLoading: salesQuery.isLoading,
    clientsError: clientsQuery.error?.message ?? null,
    salesError: salesQuery.error?.message ?? null,
    refresh,
  };
}
