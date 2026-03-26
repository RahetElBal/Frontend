import type { AppRole } from "@/constants/enum";
import type { BaseEntity } from "@/constants/types";
import type { Salon } from "@/pages/admin/salon/types";

export interface User extends BaseEntity {
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  role: AppRole;
  isActive: boolean;
  googleId?: string;
  lastLoginAt?: string;
  isSuperadmin?: boolean;
  salon: Salon;
  managedById?: string;
  managedBy?: User;
  phone: string;
}
