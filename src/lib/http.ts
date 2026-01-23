import ky, { type KyInstance, type Options, HTTPError } from 'ky';
import { AUTH_STORAGE_KEY } from '@/constants/auth';
import type { ApiError } from '@/types/api';

// ============================================
// API CONFIGURATION
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 30000; // 30 seconds

// ============================================
// ERROR PARSING
// ============================================

export async function parseError(error: unknown): Promise<ApiError> {
  if (error instanceof HTTPError) {
    try {
      const errorBody = await error.response.json();
      return {
        message: errorBody.message || error.message,
        code: errorBody.code,
        status: error.response.status,
        errors: errorBody.errors,
      };
    } catch {
      return {
        message: error.message,
        status: error.response.status,
      };
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unexpected error occurred',
  };
}

// ============================================
// AUTH TOKEN HELPERS
// ============================================

function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_STORAGE_KEY);
}

function clearAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem('user');
  // Redirect to login
  window.location.href = '/login';
}

// ============================================
// KY INSTANCE
// ============================================

const createHttpClient = (): KyInstance => {
  return ky.create({
    prefixUrl: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
    hooks: {
      beforeRequest: [
        (request) => {
          const token = getAuthToken();
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        },
      ],
      afterResponse: [
        async (_request, _options, response) => {
          // Handle 401 Unauthorized - clear auth and redirect
          if (response.status === 401) {
            clearAuth();
          }
          return response;
        },
      ],
      beforeError: [
        async (error) => {
          // Log errors in development
          if (import.meta.env.DEV) {
            console.error('[HTTP Error]', {
              status: error.response?.status,
              url: error.request?.url,
            });
          }
          return error;
        },
      ],
    },
    retry: {
      limit: 2,
      methods: ['get'],
      statusCodes: [408, 413, 429, 500, 502, 503, 504],
    },
  });
};

// Export singleton instance
export const http = createHttpClient();

// ============================================
// TYPED HTTP METHODS
// ============================================

export async function get<T>(
  url: string,
  options?: Options
): Promise<T> {
  try {
    return await http.get(url, options).json<T>();
  } catch (error) {
    throw await parseError(error);
  }
}

export async function post<T, D = unknown>(
  url: string,
  data?: D,
  options?: Options
): Promise<T> {
  try {
    return await http
      .post(url, { json: data, ...options })
      .json<T>();
  } catch (error) {
    throw await parseError(error);
  }
}

export async function put<T, D = unknown>(
  url: string,
  data?: D,
  options?: Options
): Promise<T> {
  try {
    return await http
      .put(url, { json: data, ...options })
      .json<T>();
  } catch (error) {
    throw await parseError(error);
  }
}

export async function patch<T, D = unknown>(
  url: string,
  data?: D,
  options?: Options
): Promise<T> {
  try {
    return await http
      .patch(url, { json: data, ...options })
      .json<T>();
  } catch (error) {
    throw await parseError(error);
  }
}

export async function del<T>(
  url: string,
  options?: Options
): Promise<T> {
  try {
    return await http.delete(url, options).json<T>();
  } catch (error) {
    throw await parseError(error);
  }
}

// ============================================
// FILE UPLOAD
// ============================================

export async function uploadFile<T>(
  url: string,
  file: File,
  fieldName = 'file'
): Promise<T> {
  const formData = new FormData();
  formData.append(fieldName, file);

  try {
    return await http
      .post(url, { body: formData, headers: {} })
      .json<T>();
  } catch (error) {
    throw await parseError(error);
  }
}

export async function uploadFiles<T>(
  url: string,
  files: File[],
  fieldName = 'files'
): Promise<T> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append(fieldName, file);
  });

  try {
    return await http
      .post(url, { body: formData, headers: {} })
      .json<T>();
  } catch (error) {
    throw await parseError(error);
  }
}

// ============================================
// URL BUILDER HELPER
// ============================================

export function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return path;

  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}
