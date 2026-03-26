import type { AppRole } from "@/constants/enum";
import type { Salon } from "@/pages/admin/salon/types";

// Base user type for authentication
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  role: AppRole;
  isSuperadmin: boolean;
  salon?: Salon;
  isActive?: boolean;
}

// Auth state for context
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Auth response from backend
export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

