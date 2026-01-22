export const AUTH_STORAGE_KEY = 'auth_token';

export const AUTH_ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin',
} as const;

export const GOOGLE_OAUTH = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  REDIRECT_URI: import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin,
  SCOPE: 'openid email profile',
} as const;

export const CONTACT_INFO = {
  PHONE: '+33 1 23 45 67 89',
  EMAIL: 'contact@beautysalon.com',
} as const;
