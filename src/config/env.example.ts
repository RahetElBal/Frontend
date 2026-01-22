/**
 * Environment Configuration Example
 * 
 * Create a .env file in the project root with these variables:
 * 
 * # API Configuration
 * VITE_API_URL=http://localhost:3000/api
 * 
 * # Google OAuth Configuration
 * VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
 * VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
 * 
 * # App Configuration
 * VITE_APP_NAME=Beautiq
 * VITE_APP_URL=http://localhost:5173
 * 
 * # Feature Flags (optional)
 * VITE_ENABLE_MOCK_API=true
 * VITE_ENABLE_DEV_TOOLS=true
 */

// Environment variables with defaults
export const env = {
  // API
  API_URL: import.meta.env.VITE_API_URL || '/api',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  GOOGLE_REDIRECT_URI: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`,
  
  // App
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Beautiq',
  APP_URL: import.meta.env.VITE_APP_URL || window.location.origin,
  
  // Feature flags
  ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
  ENABLE_DEV_TOOLS: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' || import.meta.env.DEV,
  
  // Environment
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

// Type for environment variables
export type Env = typeof env;
