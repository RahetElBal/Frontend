import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { post, put, patch, del } from '@/lib/http';
import type { ApiError } from '@/types/api';

type ActionMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface UsePostActionOptions<TData, TVariables> {
  action?: string;
  id?: string | ((variables: TVariables) => string);
  method?: ActionMethod;
  invalidateQueries?: string[];
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: ApiError | null, variables: TVariables) => void;
}

/**
 * Hook for performing actions (mutations) with built-in toast notifications
 * Extends usePost with automatic success/error toast handling
 * 
 * @param endpoint - API endpoint name (e.g., 'clients', 'products')
 * @param options - Action options including method, id, action, and toast settings
 * 
 * @example
 * // Archive a client: POST /api/clients/{id}/archive
 * const archiveClient = usePostAction<void, string>('clients', {
 *   id: (clientId) => clientId,
 *   action: 'archive',
 *   showSuccessToast: true,
 *   successMessage: 'Client archived successfully',
 * });
 * archiveClient.mutate('client-123');
 * 
 * @example
 * // Toggle status: POST /api/clients/{id}/toggle
 * const toggleClient = usePostAction<Client, { id: string; isActive: boolean }>('clients', {
 *   id: (vars) => vars.id,
 *   action: 'toggle',
 * });
 * 
 * @example
 * // Bulk delete: POST /api/clients/bulk-delete
 * const bulkDelete = usePostAction<void, { ids: string[] }>('clients', {
 *   action: 'bulk-delete',
 * });
 */
export function usePostAction<TData, TVariables = void>(
  endpoint: string,
  options?: UsePostActionOptions<TData, TVariables>
): UseMutationResult<TData, ApiError, TVariables> & {
  isSubmitting: boolean;
} {
  const queryClient = useQueryClient();
  const {
    action,
    id,
    method = 'POST',
    invalidateQueries,
    showSuccessToast: _showSuccessToast = false,
    showErrorToast: _showErrorToast = true,
    successMessage: _successMessage,
    onSuccess,
    onError,
    onSettled,
  } = options || {};

  const mutation = useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      // Build URL: /api/{endpoint}/{id?}/{action?}
      const resolvedId = typeof id === 'function' ? id(variables) : id;
      let url = `/api/${endpoint}`;
      if (resolvedId) url += `/${resolvedId}`;
      if (action) url += `/${action}`;

      switch (method) {
        case 'POST':
          return post<TData, TVariables>(url, variables);
        case 'PUT':
          return put<TData, TVariables>(url, variables);
        case 'PATCH':
          return patch<TData, TVariables>(url, variables);
        case 'DELETE':
          return del<TData>(url);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate specified queries or default to endpoint
      const queriesToInvalidate = invalidateQueries || [endpoint];
      queriesToInvalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });

      // Show success toast (when toast system is implemented)
      // if (showSuccessToast) {
      //   toast.success(successMessage || 'Action completed successfully');
      // }

      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      // Show error toast (when toast system is implemented)
      // if (showErrorToast) {
      //   toast.error(error.message || 'An error occurred');
      // }

      if (onError) {
        onError(error, variables);
      }
    },
    onSettled: (data, error, variables) => {
      if (onSettled) {
        onSettled(data, error, variables);
      }
    },
  });

  return {
    ...mutation,
    isSubmitting: mutation.isPending,
  };
}

/**
 * Hook for toggle actions (e.g., activate/deactivate)
 * 
 * @example
 * const toggleStatus = useToggleAction<Client>('clients', 'toggle');
 * toggleStatus.mutate('client-123');
 */
export function useToggleAction<TData = void>(
  endpoint: string,
  action = 'toggle',
  options?: Omit<UsePostActionOptions<TData, string>, 'id' | 'action'>
): UseMutationResult<TData, ApiError, string> & {
  isSubmitting: boolean;
} {
  return usePostAction<TData, string>(endpoint, {
    id: (itemId) => itemId,
    action,
    ...options,
  });
}

/**
 * Hook for bulk actions on multiple items
 * 
 * @example
 * const bulkDelete = useBulkAction('clients', 'bulk-delete');
 * bulkDelete.mutate({ ids: ['1', '2', '3'] });
 */
export function useBulkAction<TData = void, TVariables = { ids: string[] }>(
  endpoint: string,
  action: string,
  options?: Omit<UsePostActionOptions<TData, TVariables>, 'action'>
): UseMutationResult<TData, ApiError, TVariables> & {
  isSubmitting: boolean;
} {
  return usePostAction<TData, TVariables>(endpoint, {
    action,
    showSuccessToast: true,
    ...options,
  });
}
