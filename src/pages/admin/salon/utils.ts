export type SalonModalState = {
  salonId: string | "create";
  mode: "view" | "edit" | "delete";
} | null;

import type { User, Salon } from "@/types/entities";

export const canModifySalon = (salon: Salon, user: User | null): boolean => {
  if (!user) return false;

  if (user.role === "superadmin") return true;
  if (user.role === "admin" && salon.ownerId === user.id) return true;

  return false;
};
