export type SalonModalState = {
  salonId: string | "create";
  mode: "view" | "edit" | "delete";
} | null;

import type { User, Salon } from "@/types/entities";

export const isSuperadmin = (user: User | null): boolean => {
  return user?.isSuperadmin || user?.role === "superadmin";
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === "admin";
};

export const canModifySalon = (salon: Salon, user: User | null): boolean => {
  if (!user) return false;
  if (isSuperadmin(user)) return true;
  if (isAdmin(user) && salon.ownerId === user.id) return true;
  return false;
};
