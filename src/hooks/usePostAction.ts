import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { post, put, patch, del } from "@/lib/http";
import { toast } from "@/lib/toast";
import type { ApiError } from "@/types/api";

type Method = "POST" | "PUT" | "PATCH" | "DELETE";

interface UsePostActionOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, ApiError, TVariables>, "mutationFn"> {
  /** HTTP method. Defaults to "POST". */
  method?: Method;
  /** Transform variables into the request body. */
  body?: (variables: TVariables) => unknown;
  /** Query keys to invalidate on success. */
  invalidate?: string[];
  /** Show a success toast. Default: false. */
  successToast?: string | boolean;
  /** Show an error toast. Default: true. */
  errorToast?: string | boolean;
}

const methodMap = { POST: post, PUT: put, PATCH: patch, DELETE: del } as const;

/**
 * Mutation hook with built-in toast notifications.
 *
 * @param path - Full API path, or a function that builds the path from variables.
 * @param options - method, body, invalidate, toasts, plus standard mutation options
 *
 * @example
 * // Static path
 * const archive = usePostAction<void, void>("clients/123/archive", {
 *   successToast: "Client archived",
 *   invalidate: ["clients"],
 * });
 *
 * @example
 * // Dynamic path
 * const updateStatus = usePostAction<User, { id: string; isActive: boolean }>(
 *   (v) => `users/${v.id}/status`,
 *   { method: "PATCH", body: (v) => ({ isActive: v.isActive }), invalidate: ["users"] },
 * );
 */
export function usePostAction<TData, TVariables = void>(
  path: string | ((variables: TVariables) => string),
  options?: UsePostActionOptions<TData, TVariables>,
): UseMutationResult<TData, ApiError, TVariables> & { isSubmitting: boolean } {
  const queryClient = useQueryClient();
  const {
    method = "POST",
    body,
    invalidate,
    successToast = false,
    errorToast = true,
    onSuccess,
    onError,
    ...rest
  } = options || {};

  const mutation = useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      const resolvedPath = typeof path === "function" ? path(variables) : path;
      const payload = body ? body(variables) : variables;
      const fn = methodMap[method];
      if (method === "DELETE") return (fn as typeof del)<TData>(resolvedPath);
      return (fn as typeof post)<TData, typeof payload>(resolvedPath, payload);
    },
    onSuccess: (data, variables, ...args) => {
      const resolvedPath = typeof path === "function" ? path(variables) : path;
      const keys = invalidate || [resolvedPath.split("/")[0] || resolvedPath];
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      if (successToast) {
        toast.success(typeof successToast === "string" ? successToast : "Action completed successfully");
      }
      onSuccess?.(data, variables, ...args);
    },
    onError: (error, variables, ...args) => {
      if (errorToast) {
        toast.error(typeof errorToast === "string" ? errorToast : error.message || "An error occurred");
      }
      onError?.(error, variables, ...args);
    },
    ...rest,
  });

  return { ...mutation, isSubmitting: mutation.isPending };
}
