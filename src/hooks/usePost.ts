import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { post, put, patch, del } from "@/lib/http";
import type { ApiError } from "@/types/api";

type Method = "POST" | "PUT" | "PATCH" | "DELETE";

interface UsePostOptions<TData, TVariables> extends
  Omit<UseMutationOptions<TData, ApiError, TVariables>, "mutationFn"> {
  /** HTTP method. Defaults to "POST". */
  method?: Method;
  /** Query keys to invalidate on success. */
  invalidate?: string[];
}

const methodMap = {
  POST: post,
  PUT: put,
  PATCH: patch,
  DELETE: del,
} as const;

/**
 * Simple hook for mutations (POST / PUT / PATCH / DELETE).
 *
 * @param path - Full API path, or a function that builds the path from variables.
 * @param options - method, invalidate, plus standard React Query mutation options
 *
 * @example
 * // Create
 * const create = usePost<Client, CreateDto>("clients");
 *
 * @example
 * // Update with static path
 * const update = usePost<Client, UpdateDto>(`clients/${id}`, { method: "PATCH" });
 *
 * @example
 * // Delete with dynamic path
 * const remove = usePost<void, { id: string }>(
 *   (v) => `clients/${v.id}`,
 *   { method: "DELETE" },
 * );
 */
export function usePost<TData, TVariables = void>(
  path: string | ((variables: TVariables) => string),
  options?: UsePostOptions<TData, TVariables>,
): UseMutationResult<TData, ApiError, TVariables> {
  const queryClient = useQueryClient();
  const { method = "POST", invalidate, onSuccess, ...rest } = options || {};
  const basePath = typeof path === "string" ? path : "";

  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      const resolvedPath = typeof path === "function" ? path(variables) : path;
      const fn = methodMap[method];
      if (method === "DELETE") {
        return (fn as typeof del)<TData>(resolvedPath);
      }
      return (fn as typeof post)<TData, TVariables>(resolvedPath, variables);
    },
    onSuccess: (data, variables, context) => {
      const base = typeof path === "function" ? path(variables) : path;
      const keys = invalidate || [base.split("/")[0] || base];
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      onSuccess?.(data, variables, context);
    },
    ...rest,
  });
}
