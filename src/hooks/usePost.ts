import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { post, put, patch, del } from '@/lib/http';
import type { ApiError } from '@/types/api';

type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface UsePostOptions<TData, TVariables> {
  id?: string | ((variables: TVariables) => string);
  method?: HttpMethod;
  invalidateQueries?: string[];
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: ApiError | null, variables: TVariables) => void;
}

/**
 * Generic hook for POST/PUT/PATCH/DELETE requests using React Query
 * 
 * @param endpoint - API endpoint name (e.g., 'clients', 'products')
 * @param options - Mutation options including method, id, and callbacks
 * 
 * @example
 * // Create a new client
 * const createClient = usePost<Client, CreateClientDto>('clients');
 * createClient.mutate({ firstName: 'John', lastName: 'Doe' });
 * 
 * @example
 * // Update a client
 * const updateClient = usePost<Client, UpdateClientDto>('clients', {
 *   id: '123',
 *   method: 'PATCH',
 * });
 * 
 * @example
 * // Update with dynamic ID from variables
 * const updateClient = usePost<Client, { id: string; name: string }>('clients', {
 *   id: (vars) => vars.id,
 *   method: 'PATCH',
 * });
 * 
 * @example
 * // Delete a client
 * const deleteClient = usePost<void, string>('clients', {
 *   id: (id) => id,
 *   method: 'DELETE',
 * });
 */
export function usePost<TData, TVariables = void>(
  endpoint: string,
  options?: UsePostOptions<TData, TVariables>
): UseMutationResult<TData, ApiError, TVariables> {
  const queryClient = useQueryClient();
  const {
    id,
    method = 'POST',
    invalidateQueries,
    onSuccess,
    onError,
    onSettled,
  } = options || {};

  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      // Build URL: /{endpoint} or /{endpoint}/{id}
      const resolvedId = typeof id === 'function' ? id(variables) : id;
      const url = resolvedId ? `${endpoint}/${resolvedId}` : endpoint;

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
      // Invalidate specified queries
      const queriesToInvalidate = invalidateQueries || [endpoint];
      queriesToInvalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
      
      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
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
}
