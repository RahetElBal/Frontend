import { AppRole } from "@/constants/enum";
import type { User } from "@/pages/admin/users/types";
import type { Salon } from "../types";

export type SalonModalState = {
  salonId: string | "create";
  mode: "view" | "edit" | "delete";
} | null;

export interface SalonSummaryStats {
  totalSalons: number;
  activeSalons: number;
  totalUsers: number;
  activeUsers: number;
  totalAdmins: number;
  grossRevenue: number;
  netRevenue: number;
  totalRevenue: number;
  monthlyGrossRevenue: number;
  monthlyNetRevenue: number;
  monthlyRevenue: number;
  totalServices: number;
  totalClients: number;
}

export interface SalonStats {
  totalSalons: number;
  activeSalons: number;
  totalUsers: number;
  activeUsers: number;
  totalAdmins: number;
  grossRevenue: number;
  netRevenue: number;
  totalRevenue: number;
  monthlyGrossRevenue: number;
  monthlyNetRevenue: number;
  monthlyRevenue: number;
  totalServices: number;
  totalClients: number;
}

/**
 * Checks if a user can modify a salon
 */
export const canModifySalon = (salon: Salon, user: User | null): boolean => {
  if (!user) return false;

  if (user.role === AppRole.SUPER_ADMIN) return true;
  if (user.role === AppRole.ADMIN && salon.ownerId === user.id) return true;

  return false;
};

/**
 * Gets salons list based on user role
 * Superadmin sees all salons, admin sees only their own
 */
export const getSalonsList = (
  isSuperadmin: boolean,
  allSalons: Salon[],
  adminSalon: Salon | null,
): Salon[] => {
  return isSuperadmin ? allSalons : adminSalon ? [adminSalon] : [];
};

/**
 * Gets current salon for admin (returns null for superadmin)
 */
export const getCurrentSalon = (
  isSuperadmin: boolean,
  adminSalon: Salon | null,
): Salon | null => {
  return isSuperadmin ? null : adminSalon;
};

/**
 * Checks if admins data is properly loaded
 */
export const areAdminsLoaded = (
  isSuperadmin: boolean,
  isLoading: boolean,
  isError: boolean,
): boolean => {
  return isSuperadmin && !isLoading && !isError;
};

/**
 * Gets dashboard description based on role and salon
 */
export const getDashboardDescription = (
  isSuperadmin: boolean,
  currentSalon: Salon | null,
  superadminDescription: string,
  fallbackDescription: string = "Manage your salon",
): string => {
  if (isSuperadmin) {
    return superadminDescription;
  }
  if (currentSalon) {
    return `Tableau de bord - ${currentSalon.name}`;
  }
  return fallbackDescription;
};

/**
 * Calculates stats from backend summary and local fallbacks.
 */
export const calculateAllStats = (
  isSuperadmin: boolean,
  salons: Salon[],
  admins: User[],
  summary: SalonSummaryStats | undefined,
): SalonStats => {
  const totalSalons = summary?.totalSalons ?? salons.length;
  const activeSalons =
    summary?.activeSalons ?? salons.filter((salon) => salon.isActive).length;

  return {
    totalSalons,
    activeSalons,
    totalUsers: summary?.totalUsers ?? 0,
    activeUsers: summary?.activeUsers ?? 0,
    totalAdmins: isSuperadmin ? (summary?.totalAdmins ?? admins.length) : 0,
    grossRevenue: summary?.grossRevenue ?? summary?.totalRevenue ?? 0,
    netRevenue: summary?.netRevenue ?? summary?.totalRevenue ?? 0,
    totalRevenue: summary?.totalRevenue ?? 0,
    monthlyGrossRevenue: summary?.monthlyGrossRevenue ?? summary?.monthlyRevenue ?? 0,
    monthlyNetRevenue: summary?.monthlyNetRevenue ?? summary?.monthlyRevenue ?? 0,
    monthlyRevenue: summary?.monthlyRevenue ?? 0,
    totalServices: summary?.totalServices ?? 0,
    totalClients: summary?.totalClients ?? 0,
  };
};
