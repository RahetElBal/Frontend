import {
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';
import { get } from '@/lib/http';
import type { ApiError } from '@/types/api';

interface UseGetOptions<TData> {
  id?: string;
  params?: Record<string, string | number | boolean | undefined>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnMount?: boolean | 'always';
  refetchOnWindowFocus?: boolean | 'always';
  refetchInterval?: number | false;
  retry?: boolean | number;
  onSuccess?: (data: TData) => void;
  onError?: (error: ApiError) => void;
}

/**
 * Generic hook for GET requests using React Query
 * 
 * @param endpoint - API endpoint name (e.g., 'clients', 'products', 'appointments')
 * @param options - Query options including id for single item fetch
 * 
 * @example
 * // Fetch all clients
 * const { data } = useGet<Client[]>('clients');
 * 
 * @example
 * // Fetch single client by ID
 * const { data } = useGet<Client>('clients', { id: '123' });
 * 
 * @example
 * // Fetch with filters
 * const { data } = useGet<Client[]>('clients', { 
 *   params: { status: 'active', page: 1 } 
 * });
 * 
 * @example
 * // Conditional fetch
 * const { data } = useGet<Client>('clients', { 
 *   id: clientId, 
 *   enabled: !!clientId 
 * });
 */
export function useGet<TData>(
  endpoint: string,
  options?: UseGetOptions<TData>
): UseQueryResult<TData, ApiError> {
  const {
    id,
    params,
    enabled = true,
    staleTime,
    cacheTime,
    refetchOnMount,
    refetchOnWindowFocus,
    refetchInterval,
    retry,
    onSuccess,
    onError,
  } = options || {};

  // Build URL: /api/{endpoint} or /api/{endpoint}/{id}
  const url = id ? `/api/${endpoint}/${id}` : `/api/${endpoint}`;

  // Build query key
  const queryKey = id 
    ? [endpoint, id, params].filter(Boolean) 
    : [endpoint, params].filter(Boolean);

  // Build URL with params
  const buildUrlWithParams = (baseUrl: string, queryParams?: Record<string, string | number | boolean | undefined>) => {
    if (!queryParams) return baseUrl;
    
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
      const fullUrl = buildUrlWithParams(url, params);
      const data = await get<TData>(fullUrl);
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      return data;
    },
    enabled,
    staleTime,
    gcTime: cacheTime,
    refetchOnMount,
    refetchOnWindowFocus,
    refetchInterval,
    retry,
    throwOnError: false,
    meta: {
      onError,
    },
  });
}
