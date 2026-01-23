import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { get, post, put, patch, del } from '@/lib/http';
import { useSalon } from '@/contexts/SalonProvider';
import type { ApiError } from '@/types/api';

// ============================================
// SALON-SCOPED GET HOOK
// ============================================

interface UseSalonGetOptions<TData> {
  id?: string;
  params?: Record<string, string | number | boolean | undefined>;
  enabled?: boolean;
  staleTime?: number;
  refetchOnMount?: boolean | 'always';
  refetchOnWindowFocus?: boolean | 'always';
  onSuccess?: (data: TData) => void;
  onError?: (error: ApiError) => void;
}

/**
 * Hook for GET requests scoped to the current salon
 * Automatically includes salonId in the request
 * 
 * @example
 * const { data: clients } = useSalonGet<Client[]>('clients');
 * // Fetches: GET /clients?salonId=xxx
 */
export function useSalonGet<TData>(
  endpoint: string,
  options?: UseSalonGetOptions<TData>
): UseQueryResult<TData, ApiError> {
  const { currentSalon } = useSalon();
  const salonId = currentSalon?.id;

  const {
    id,
    params = {},
    enabled = true,
    staleTime,
    refetchOnMount,
    refetchOnWindowFocus,
    onSuccess,
    onError,
  } = options || {};

  // Build URL with salon-scoped path or params
  const url = id ? `${endpoint}/${id}` : endpoint;
  
  // Add salonId to params if available
  const salonParams = salonId ? { ...params, salonId } : params;

  // Build query key including salonId for cache separation
  const queryKey = salonId 
    ? [endpoint, salonId, id, params].filter(Boolean)
    : [endpoint, id, params].filter(Boolean);

  const buildUrlWithParams = (baseUrl: string, queryParams?: Record<string, string | number | boolean | undefined>) => {
    if (!queryParams || Object.keys(queryParams).length === 0) return baseUrl;
    
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  return useQuery<TData, ApiError>({
    queryKey,
    queryFn: async () => {
      const fullUrl = buildUrlWithParams(url, salonParams);
      const data = await get<TData>(fullUrl);
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      return data;
    },
    enabled: enabled && !!salonId,
    staleTime,
    refetchOnMount,
    refetchOnWindowFocus,
    throwOnError: false,
    meta: { onError },
  });
}

// ============================================
// SALON-SCOPED POST/MUTATION HOOK
// ============================================

type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface UseSalonPostOptions<TData, TVariables> {
  id?: string | ((variables: TVariables) => string);
  method?: HttpMethod;
  invalidateQueries?: string[];
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiError, variables: TVariables) => void;
}

/**
 * Hook for POST/PUT/PATCH/DELETE requests scoped to the current salon
 * Automatically includes salonId in the request body
 * 
 * @example
 * const createClient = useSalonPost<Client, CreateClientDto>('clients');
 * createClient.mutate({ firstName: 'John', lastName: 'Doe' });
 * // Sends: POST /clients with { firstName: 'John', lastName: 'Doe', salonId: 'xxx' }
 */
export function useSalonPost<TData, TVariables = void>(
  endpoint: string,
  options?: UseSalonPostOptions<TData, TVariables>
): UseMutationResult<TData, ApiError, TVariables> {
  const queryClient = useQueryClient();
  const { currentSalon } = useSalon();
  const salonId = currentSalon?.id;

  const {
    id,
    method = 'POST',
    invalidateQueries,
    onSuccess,
    onError,
  } = options || {};

  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      // Build URL
      const resolvedId = typeof id === 'function' ? id(variables) : id;
      const url = resolvedId ? `${endpoint}/${resolvedId}` : endpoint;

      // Add salonId to the variables for POST/PUT/PATCH
      const dataWithSalon = method !== 'DELETE' && salonId
        ? { ...(variables as object), salonId }
        : variables;

      switch (method) {
        case 'POST':
          return post<TData, typeof dataWithSalon>(url, dataWithSalon);
        case 'PUT':
          return put<TData, typeof dataWithSalon>(url, dataWithSalon);
        case 'PATCH':
          return patch<TData, typeof dataWithSalon>(url, dataWithSalon);
        case 'DELETE':
          return del<TData>(url);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate queries with salon key
      const queriesToInvalidate = invalidateQueries || [endpoint];
      queriesToInvalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey, salonId].filter(Boolean) });
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
  });
}
