import {
  keepPreviousData,
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { get } from "@/lib/http";
import { buildUrl } from "@/lib/http";
import type { ApiError } from "@/types/api";

/**
 * Represents a path that may carry query-param metadata for cache-key splitting.
 * Created by `withParams()`, but a plain string also works.
 */
export interface ParamPath {
  /** The full URL sent to the API (e.g. "clients?salonId=abc&perPage=100"). */
  url: string;
  /** The base resource name used as the first element of the React Query key. */
  base: string;
  /** The params object (used as the second element of the query key for granularity). */
  params: Record<string, string | number | boolean | undefined>;
}

/**
 * Simple hook for GET requests using React Query.
 *
 * @param path - A plain string (e.g. "clients") or a `ParamPath` from `withParams()`.
 * @param options - Standard React Query options (enabled, staleTime, select, etc.)
 *
 * @example
 * // Simple fetch
 * const { data } = useGet<Client[]>("clients");
 *
 * @example
 * // Fetch by ID
 * const { data } = useGet<Client>(`clients/${id}`);
 *
 * @example
 * // With query params (cache key splits on base + params)
 * const { data } = useGet<Client[]>(withParams("clients", { salonId }));
 *
 * @example
 * // With options
 * const { data } = useGet<Client[]>(withParams("clients", { salonId }), { enabled: !!salonId });
 */
export function useGet<TData, TSelect = TData>(
  path: string | ParamPath,
  options?: Omit<UseQueryOptions<TData, ApiError, TSelect>, "queryKey" | "queryFn">,
): UseQueryResult<TSelect, ApiError> {
  const isParam = typeof path !== "string" && "url" in path;
  const url = isParam ? path.url : path;
  const queryKey: unknown[] = isParam ? [path.base, path.params] : [path];

  return useQuery<TData, ApiError, TSelect>({
    queryKey,
    queryFn: () => get<TData>(url),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/**
 * Helper to build a path with query params for useGet.
 * Produces a `ParamPath` so that the query key is `[base, params]`, which lets
 * `invalidateQueries({ queryKey: ["clients"] })` match all client queries
 * regardless of their params.
 *
 * @example
 * const { data } = useGet<Client[]>(withParams("clients", { salonId, perPage: 100 }));
 */
export function withParams(
  base: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): ParamPath {
  const filtered: Record<string, string | number | boolean | undefined> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        filtered[key] = value as string | number | boolean;
      }
    }
  }
  return {
    url: buildUrl(base, filtered),
    base,
    params: filtered,
  };
}
