/**
 * Environment Configuration Example
 * 
 * Create a .env file in the project root with these variables:
 * 
 * # API Configuration
 * VITE_API_URL=http://localhost:3000
 * 
 * # App Configuration
 * VITE_APP_NAME=Beautiq
 * VITE_APP_URL=http://localhost:5173
 * 
 * # Feature Flags (optional)
 * VITE_ENABLE_MOCK_API=false
 * VITE_ENABLE_DEV_TOOLS=true
 */

// Environment variables with defaults
export const env = {
  // API - Backend URL (NestJS server)
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
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
