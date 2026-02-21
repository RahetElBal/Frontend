// Role type that includes superadmin (determined by backend)
export type AppRole = "superadmin" | "admin" | "user";

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

// Full user type from database (not superadmin)
export interface User extends AuthUser {
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  googleId?: string;
  lastLoginAt?: string;
  salon: Salon;
}

// Salon type
export interface Salon {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  isActive: boolean;
  planTier?: "standard" | "pro";
  planStatus?: "active" | "inactive" | "expired" | "paused";
  planUserLimit?: number;
  planStartAt?: string | null;
  planEndAt?: string | null;
  planUpdatedAt?: string | null;
  planUpdatedById?: string | null;
  planNotes?: string | null;
  slaAcceptedAt?: string | null;
  slaAcceptedById?: string | null;
  slaAcceptedVersion?: number | null;
  staffLockActive?: boolean;
  staffLockActivatedAt?: string | null;
  staffLockClearedAt?: string | null;
  staffLockReason?: string | null;
  ownerId: string; // Required - every salon must have an owner admin
  owner?: User;
  staff?: User[];
  createdBySuperadmin?: boolean;
  settings?: SalonSettings;
  createdAt: string;
  updatedAt: string;
}

export interface SalonSettings {
  currency?: string;
  timezone?: string;
  language?: string;
  workingHours?: WorkingHours;
  loyaltyEnabled?: boolean;
  loyaltyPointsPerCurrency?: number;
  loyaltyPointValue?: number;
  loyaltyMinimumRedemption?: number;
  loyaltyRewardServiceId?: string;
  loyaltyRewardDiscountType?: "percent" | "fixed";
  loyaltyRewardDiscountValue?: number;
  socialPublishingEnabled?: boolean;
}

export interface WorkingHours {
  [day: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
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

// Re-export UserRole for backwards compatibility
export const UserRole = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
