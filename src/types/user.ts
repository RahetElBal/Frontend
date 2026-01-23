// Re-export from entities for backwards compatibility
export { UserRole } from './entities';
export type { User, Salon, SalonSettings, WorkingHours } from './entities';

export interface AuthState {
  user: import('./entities').User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Auth response from backend
export interface AuthResponse {
  access_token: string;
  user: import('./entities').User;
}
