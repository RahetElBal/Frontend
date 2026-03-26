export const AUTH_STORAGE_KEY = "auth_token";
export const AUTH_ROUTES = {
  LOGIN: "/login",
  CALLBACK: "/auth/callback",
  DASHBOARD: "/dashboard",
  ADMIN_DASHBOARD: "/admin",
} as const;

export const CONTACT_INFO = {
  PHONE: "07 79 37 86 20",
  EMAIL: "contact@beautysalon.com",
} as const;

// API endpoints for auth
export const AUTH_ENDPOINTS = {
  GOOGLE: "/auth/google",
  CALLBACK: "/auth/google/callback",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
} as const;
