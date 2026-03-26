import { AppRole } from "@/constants/enum";
import type { Salon, User } from "@/types";
import type { AuthUser } from "@/types/user";

/**
 * Gets the most recent items from a list based on createdAt timestamp
 */
export const getRecentItems = <T extends { createdAt: string }>(
  items: T[],
  limit: number,
) =>
  [...items]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);

/**
 * Gets display name from user object, falling back to email if name is not available
 */
export const getUserDisplayName = (user: AuthUser | User | null): string => {
  if (!user) return "";
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
  );
};

/**
 * Extracts admin's salons from user object
 * Note: salon field is typed as Salon | null but actually Salon[] at runtime
 */
export const getAdminSalons = (user: AuthUser | User | null): Salon[] => {
  if (!user?.salon) return [];
  const salonData = user.salon as unknown;
  if (Array.isArray(salonData)) {
    return salonData as Salon[];
  }
  if (typeof salonData === "object" && salonData !== null) {
    return [salonData as Salon];
  }
  return [];
};

/**
 * Determines which salons to display based on user role
 */
export const getSalonsToDisplay = (
  isSuperadmin: boolean,
  allSalons: Salon[] | undefined,
  adminSalons: Salon[],
): Salon[] | undefined => {
  if (isSuperadmin) {
    return allSalons;
  }
  return adminSalons.length > 0 ? adminSalons : undefined;
};

/**
 * Filters users based on the current user's role
 * - Superadmin: shows all admins and users
 * - Admin: shows only users they manage
 */
export const getFilteredUsers = (
  users: User[] | undefined,
  isSuperadmin: boolean,
  currentUserId: string | undefined,
): User[] => {
  if (!users) return [];

  if (isSuperadmin) {
    return users.filter(
      (u) => u.role === AppRole.ADMIN || u.role === AppRole.USER,
    );
  }

  return users.filter((u) => u.managedById === currentUserId);
};

/**
 * Gets the dashboard description text based on user role and salon
 */
export const getDashboardDescription = (
  isSuperadmin: boolean,
  displayName: string,
  adminSalon: Salon | undefined,
  welcomeText: string,
): string => {
  if (isSuperadmin) {
    return welcomeText.replace("{name}", displayName);
  }

  if (adminSalon) {
    return `Tableau de bord - ${adminSalon.name}`;
  }

  return welcomeText.replace("{name}", displayName);
};
