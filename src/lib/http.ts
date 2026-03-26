import ky, { type KyInstance, type Options, HTTPError } from 'ky';
import { AUTH_STORAGE_KEY } from '@/constants/auth';
import type { ApiError } from '@/types/api';

// ============================================
// API CONFIGURATION
// ============================================

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 30000; // 30 seconds

// ============================================
// ETAG CACHE (IN-MEMORY)
// ============================================

type EtagEntry = {
  etag: string;
  body: unknown;
  timestamp: number;
};

const etagCache = new Map<string, EtagEntry>();
const inflightGetRequests = new Map<string, Promise<unknown>>();

const isAbsoluteUrl = (url: string): boolean =>
  /^[a-z][a-z\d+\-.]*:\/\//i.test(url);

const buildEtagCacheKey = (url: string): string => {
  if (isAbsoluteUrl(url)) {
    return url;
  }
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = url.replace(/^\//, '');
  return `${base}/${path}`;
};

const isApiRequestUrl = (url: string): boolean => {
  try {
    const apiUrl = new URL(API_BASE_URL);
    const requestUrl = new URL(url, API_BASE_URL);
    const apiPath = apiUrl.pathname.replace(/\/$/, "");
    const requestPath = requestUrl.pathname;

    return (
      requestUrl.origin === apiUrl.origin &&
      (apiPath === "" ||
        requestPath === apiPath ||
        requestPath.startsWith(`${apiPath}/`))
    );
  } catch {
    return !isAbsoluteUrl(url);
  }
};

const buildHeadersKey = (headers?: Options['headers']): string => {
  if (!headers) return '';
  const entries: Array<[string, string]> = [];

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      entries.push([key, value]);
    });
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      if (value !== undefined) {
        entries.push([key, String(value)]);
      }
    });
  } else {
    Object.entries(headers).forEach(([key, value]) => {
      if (value !== undefined) {
        entries.push([key, String(value)]);
      }
    });
  }

  entries.sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([key, value]) => `${key}:${value}`).join('|');
};

const buildInflightKey = (url: string, options?: Options): string => {
  const cacheKey = buildEtagCacheKey(url);
  const token = getAuthToken() || '';
  const headersKey = buildHeadersKey(options?.headers);
  return `${cacheKey}|token:${token}|headers:${headersKey}`;
};

// ============================================
// ERROR PARSING
// ============================================

const ERROR_CODE_MESSAGES: Record<string, string> = {
  FOREIGN_KEY_CONSTRAINT: 'errors.db.foreignKey',
  UNIQUE_CONSTRAINT: 'errors.db.unique',
  NOT_NULL_CONSTRAINT: 'errors.db.notNull',
  CHECK_CONSTRAINT: 'errors.db.check',
  INVALID_DATA: 'errors.db.invalidData',
  UNKNOWN_DB_ERROR: 'errors.db.unknown',
};

export async function parseError(error: unknown): Promise<ApiError> {
  if (error instanceof HTTPError) {
    try {
      const errorBody = await error.response.json();
      const mappedMessage =
        errorBody?.code && ERROR_CODE_MESSAGES[errorBody.code];
      return {
        message: mappedMessage || errorBody.message || error.message,
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
  etagCache.clear();
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
    headers: {},
    hooks: {
      beforeRequest: [
        (request) => {
          const token = getAuthToken();
          if (token && isApiRequestUrl(request.url)) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        },
      ],
      afterResponse: [
        async (_request, _options, response) => {
          // Handle 401 Unauthorized - clear auth and redirect
          if (response.status === 401 && isApiRequestUrl(response.url)) {
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
      limit: 1,
      methods: ['get'],
      statusCodes: [502, 503, 504],
      delay: (attemptCount) => Math.min(1000 * attemptCount, 5000),
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
  const inflightKey = buildInflightKey(url, options);
  const existingRequest = inflightGetRequests.get(inflightKey);
  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  const requestPromise = (async () => {
  const cacheKey = buildEtagCacheKey(url);
  const cached = etagCache.get(cacheKey);
  const headers = new Headers();

  if (options?.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers.set(key, value);
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        if (value !== undefined) {
          headers.set(key, value);
        }
      });
    } else {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (value !== undefined) {
          headers.set(key, value);
        }
      });
    }
  }

  if (cached?.etag) {
    headers.set('If-None-Match', cached.etag);
  }

  try {
    const response = await http.get(url, { ...options, headers });
    const data = await response.json<T>();
    const etag = response.headers.get('ETag');

    if (etag) {
      etagCache.set(cacheKey, {
        etag,
        body: data,
        timestamp: Date.now(),
      });
    }

    return data;
  } catch (error) {
    if (
      error instanceof HTTPError &&
      error.response?.status === 304 &&
      cached
    ) {
      return cached.body as T;
    }
    throw await parseError(error);
  }
  })();

  inflightGetRequests.set(inflightKey, requestPromise);
  try {
    return await requestPromise;
  } finally {
    inflightGetRequests.delete(inflightKey);
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
