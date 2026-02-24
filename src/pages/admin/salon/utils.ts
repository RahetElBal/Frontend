import type { User, Salon, Service, Client, Sale } from "@/types/entities";
import type { PaginatedResponse } from "@/types";

export type SalonModalState = {
  salonId: string | "create";
  mode: "view" | "edit" | "delete";
} | null;

/**
 * Checks if a user can modify a salon
 */
export const canModifySalon = (salon: Salon, user: User | null): boolean => {
  if (!user) return false;

  if (user.role === "superadmin") return true;
  if (user.role === "admin" && salon.ownerId === user.id) return true;

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
 * Extracts data array from various response formats
 */
export const extractDataArray = <T>(
  response: PaginatedResponse<T> | { data: T[] } | T[] | undefined,
): T[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  return response.data || [];
};

/**
 * Calculates total number of salons
 */
export const calculateTotalSalons = (salons: Salon[]): number => {
  return salons.length;
};

/**
 * Calculates number of active salons
 */
export const calculateActiveSalons = (salons: Salon[]): number => {
  return salons.filter((s) => s.isActive).length;
};

/**
 * Calculates total users based on role
 */
export const calculateTotalUsers = (
  isSuperadmin: boolean,
  allUsers: User[],
  currentSalon: Salon | null,
): number => {
  if (isSuperadmin) {
    return allUsers.length;
  }
  return allUsers.filter((u) => u.salon?.id === currentSalon?.id).length;
};

/**
 * Calculates active users based on role
 */
export const calculateActiveUsers = (
  isSuperadmin: boolean,
  allUsers: User[],
  currentSalon: Salon | null,
): number => {
  if (isSuperadmin) {
    return allUsers.filter((u) => u.isActive).length;
  }
  return allUsers.filter((u) => u.salon?.id === currentSalon?.id && u.isActive)
    .length;
};

/**
 * Calculates total admins (only for superadmin)
 */
export const calculateTotalAdmins = (
  isSuperadmin: boolean,
  admins: User[],
): number => {
  return isSuperadmin ? admins.length : 0;
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
 * Calculates total services count
 */
export const calculateTotalServices = (
  servicesResponse: PaginatedResponse<Service> | undefined,
  servicesData: Service[],
): number => {
  return servicesResponse?.meta?.total ?? servicesData.length;
};

/**
 * Calculates total clients count
 */
export const calculateTotalClients = (clientsData: Client[]): number => {
  return clientsData.length;
};

/**
 * Calculates total revenue from sales
 */
export const calculateTotalRevenue = (salesData: Sale[]): number => {
  return salesData.reduce((sum, sale) => sum + sale.total, 0);
};

/**
 * Filters sales by current month
 */
export const filterSalesByCurrentMonth = (salesData: Sale[]): Sale[] => {
  const now = new Date();
  return salesData.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    return (
      saleDate.getMonth() === now.getMonth() &&
      saleDate.getFullYear() === now.getFullYear()
    );
  });
};

/**
 * Calculates monthly revenue
 */
export const calculateMonthlyRevenue = (salesData: Sale[]): number => {
  const monthlySales = filterSalesByCurrentMonth(salesData);
  return calculateTotalRevenue(monthlySales);
};

/**
 * Gets dashboard description based on role and salon
 */
export const getDashboardDescription = (
  isSuperadmin: boolean,
  currentSalon: Salon | null,
  superadminDescription: string,
  fallbackDescription: string = "Gérez votre salon",
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
 * Complete stats calculation object
 */
export interface SalonStats {
  totalSalons: number;
  activeSalons: number;
  totalUsers: number;
  activeUsers: number;
  totalAdmins: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalServices: number;
  totalClients: number;
}

/**
 * Calculates all salon statistics at once
 */
export const calculateAllStats = (
  isSuperadmin: boolean,
  salons: Salon[],
  allUsers: User[],
  admins: User[],
  currentSalon: Salon | null,
  servicesResponse: PaginatedResponse<Service> | undefined,
  servicesData: Service[],
  clientsData: Client[],
  salesData: Sale[],
): SalonStats => {
  return {
    totalSalons: calculateTotalSalons(salons),
    activeSalons: calculateActiveSalons(salons),
    totalUsers: calculateTotalUsers(isSuperadmin, allUsers, currentSalon),
    activeUsers: calculateActiveUsers(isSuperadmin, allUsers, currentSalon),
    totalAdmins: calculateTotalAdmins(isSuperadmin, admins),
    totalRevenue: calculateTotalRevenue(salesData),
    monthlyRevenue: calculateMonthlyRevenue(salesData),
    totalServices: calculateTotalServices(servicesResponse, servicesData),
    totalClients: calculateTotalClients(clientsData),
  };
};
