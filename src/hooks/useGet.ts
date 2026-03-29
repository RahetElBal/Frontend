import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient, parseError } from "@/lib/http";

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UseGetQueryOptions<TData> = Omit<UseQueryOptions<any, Error, TData>, "queryKey" | "queryFn">;

export interface UseGetProps<TData = unknown> {
  path: string;
  query?: QueryParams;
  options?: Partial<UseGetQueryOptions<TData>>;
  defaultOperation?: "blob" | "json" | "text" | "arrayBuffer";
  skip?: number;
}

const normalizeQuery = (
  query?: QueryParams,
  skip?: number,
): Record<string, string | number | boolean> => {
  const nextQuery: QueryParams = {
    ...(query ?? {}),
    ...(skip !== undefined ? { skip } : {}),
  };

  return Object.fromEntries(
    Object.entries(nextQuery).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  ) as Record<string, string | number | boolean>;
};

export const useGet = <TData,>({
  path,
  skip,
  query = skip === undefined ? {} : { skip: 0 },
  options,
  defaultOperation = "json",
}: UseGetProps<TData>) => {
  const normalizedQuery = normalizeQuery(query, skip);
  const pathParts = path.split("/").filter(Boolean);
  const haveParams = Object.keys(normalizedQuery).length > 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQuery<any, Error, TData>({
    queryKey: [...pathParts, normalizedQuery],
    retry: 1,
    queryFn: async () => {
      try {
        const response = await apiClient.get(path, {
          searchParams: haveParams ? normalizedQuery : undefined,
        });

        if (defaultOperation === "blob") {
          return (await response.blob()) as TData;
        }

        if (defaultOperation === "text") {
          return (await response.text()) as TData;
        }

        if (defaultOperation === "arrayBuffer") {
          return (await response.arrayBuffer()) as TData;
        }

        return (await response.json()) as TData;
      } catch (error) {
        const parsedError = await parseError(error);
        const queryError = new Error(parsedError.message);
        Object.assign(queryError, parsedError);
        throw queryError;
      }
    },
    ...options,
  });
};
