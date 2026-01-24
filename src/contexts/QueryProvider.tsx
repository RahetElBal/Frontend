/* eslint-disable react-refresh/only-export-components */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import type { ApiError } from '@/types/api';

// Default error handler
const defaultErrorHandler = (error: ApiError) => {
  // In development, log errors to console
  if (import.meta.env.DEV) {
    console.error('[Query Error]', error);
  }
  
  // TODO: When toast system is implemented, show error toast
  // toast.error(error.message || 'An error occurred');
};

// Create query client with default options
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
        retry: (failureCount, error) => {
          const apiError = error as ApiError;
          // Don't retry on 4xx errors (client errors)
          if (apiError.status && apiError.status >= 400 && apiError.status < 500) {
            return false;
          }
          // Retry up to 2 times for other errors
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
        onError: (error) => {
          defaultErrorHandler(error as ApiError);
        },
      },
    },
  });

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Use useState to ensure client is created only once per app instance
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Export for testing purposes
export { createQueryClient };
