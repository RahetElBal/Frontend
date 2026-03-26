import { AppRole } from "@/constants/enum";
import type { User, Salon } from "@/types/entities";
import type { UserFormData } from "./form/validation";

export type UserModalState = {
  userId: string | "create";
  mode: "view" | "edit" | "delete";
  initialRole?: UserFormData["role"];
  user?: User;
} | null;

/**
 * Filters users based on current user's role and permissions
 */
export function filterUsersByPermission(
  allUsers: User[],
  isSuperadmin: boolean,
  currentUserId?: string,
): User[] {
  if (isSuperadmin) {
    return allUsers;
  }
  return allUsers.filter((user) => user.managedById === currentUserId);
}

/**
 * Gets the list of salons based on user role and permissions
 */
export function getSalonsByPermission(
  isSuperadmin: boolean,
  allSalons: Salon[],
  adminSalon: Salon | null,
): Salon[] {
  if (isSuperadmin) {
    return allSalons;
  }
  return adminSalon ? [adminSalon] : [];
}

/**
 * Finds the selected user from the modal state
 */
export function getSelectedUser(
  modalState: UserModalState,
  users: User[],
): User | null {
  if (!modalState || modalState.userId === "create") return null;
  if (modalState.user) return modalState.user;
  return users.find((u) => u.id === modalState.userId) || null;
}

/**
 * Creates modal state handlers for user management
 */
export function createUserModalHandlers(
  setModalState: React.Dispatch<React.SetStateAction<UserModalState>>,
) {
  return {
    handleView: (user: User) => {
      setModalState({ userId: user.id, mode: "view", user });
    },

    handleEdit: (user: User) => {
      setModalState({ userId: user.id, mode: "edit", user });
    },

    handleDelete: (user: User) => {
      setModalState({ userId: user.id, mode: "delete", user });
    },

    handleCreateAdmin: () => {
      setModalState({
        userId: "create",
        mode: "edit",
        initialRole: AppRole.ADMIN,
      });
    },

    handleCreateUser: () => {
      setModalState({
        userId: "create",
        mode: "edit",
        initialRole: AppRole.USER,
      });
    },

    handleClose: () => {
      setModalState(null);
    },
  };
}

/**
 * Generates page description based on context
 */
export function getPageDescription(
  isSuperadmin: boolean,
  adminSalon: Salon | null,
  userCount: number,
): string | undefined {
  if (!isSuperadmin && adminSalon) {
    return `Utilisateurs de ${adminSalon.name} (${userCount})`;
  }
  return undefined;
}
