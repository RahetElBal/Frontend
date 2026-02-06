import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { get } from "@/lib/http";
import { buildUrl } from "@/lib/http";
import type { ApiError } from "@/types/api";

/**
 * Simple hook for GET requests using React Query.
 *
 * @param path - Full API path (e.g. "clients", "clients/123", "products?salonId=abc")
 * @param options - Standard React Query options (enabled, staleTime, select, etc.)
 *
 * @example
 * // Fetch all clients
 * const { data } = useGet<Client[]>("clients");
 *
 * @example
 * // Fetch a single client
 * const { data } = useGet<Client>("clients/123");
 *
 * @example
 * // With query params
 * const { data } = useGet<Client[]>(`clients?salonId=${salonId}`);
 *
 * @example
 * // With options
 * const { data } = useGet<Client[]>("clients", { enabled: !!salonId, staleTime: 60_000 });
 */
export function useGet<TData, TSelect = TData>(
  path: string,
  options?: Omit<UseQueryOptions<TData, ApiError, TSelect>, "queryKey" | "queryFn">,
): UseQueryResult<TSelect, ApiError> {
  return useQuery<TData, ApiError, TSelect>({
    queryKey: [path],
    queryFn: () => get<TData>(path),
    ...options,
  });
}

/**
 * Helper to build a path with query params for useGet.
 *
 * @example
 * const path = withParams("clients", { salonId, perPage: 100 });
 * const { data } = useGet<Client[]>(path);
 */
export function withParams(
  base: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!params) return base;
  const filtered: Record<string, string | number | boolean | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      filtered[key] = value as string | number | boolean;
    }
  }
  return buildUrl(base, filtered);
}
