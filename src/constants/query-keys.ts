/**
 * Query keys for React Query cache management
 * Simple approach: endpoint name is the base key
 * 
 * @example
 * // All clients: ['clients']
 * // Single client: ['clients', '123']
 * // Clients with filters: ['clients', { status: 'active' }]
 */

// Helper to build query keys
export const queryKey = {
  all: (endpoint: string) => [endpoint] as const,
  detail: (endpoint: string, id: string) => [endpoint, id] as const,
  list: (endpoint: string, params?: Record<string, unknown>) => 
    params ? [endpoint, params] as const : [endpoint] as const,
};

// Pre-defined endpoints for type safety
export const ENDPOINTS = {
  // Auth
  AUTH: 'auth',
  
  // Core features
  CLIENTS: 'clients',
  SERVICES: 'services',
  PRODUCTS: 'products',
  APPOINTMENTS: 'appointments',
  SALES: 'sales',
  
  // Loyalty & Rewards
  LOYALTY: 'loyalty',
  GIFT_CARDS: 'gift-cards',
  REWARDS: 'rewards',
  
  // Marketing
  CAMPAIGNS: 'campaigns',
  
  // Analytics & Dashboard
  DASHBOARD: 'dashboard',
  ANALYTICS: 'analytics',
  
  // Admin
  USERS: 'users',
  SALONS: 'salons',
  
  // Settings
  SETTINGS: 'settings',
  CATEGORIES: 'categories',
} as const;

export type Endpoint = typeof ENDPOINTS[keyof typeof ENDPOINTS];
