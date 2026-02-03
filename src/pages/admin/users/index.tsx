import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus, UserCog } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { useTable } from "@/hooks/useTable";
import { useGet } from "@/hooks/useGet";
import { usePostAction } from "@/hooks/usePostAction";
import type { User, Salon } from "@/types/entities";
import { StatsGrid } from "./components/stats-grid";
import { useUser } from "@/hooks/useUser";
import type { PaginatedResponse } from "@/types";
import { useUsersColumns } from "./list/columns";
import { UserDialog } from "./components/dialog/cu-user";

type UserModalState = {
  userId: string | "create";
  mode: "view" | "edit" | "delete";
  initialRole?: "user" | "admin";
  user?: User;
} | null;

export function AdminUsersPage() {
  const { t } = useTranslation();

  const [modalState, setModalState] = useState<UserModalState>(null);

  const { isSuperadmin, user: currentUser } = useUser();

  // Fetch all users
  const {
    data: usersResponse,
    refetch,
    isLoading: usersLoading,
  } = useGet<PaginatedResponse<User>>("users", {
    retry: 1,
  });

  // Filter users based on role
  const allUsers = usersResponse?.data || [];
  const users = isSuperadmin
    ? allUsers
    : allUsers.filter((user) => user.managedById === currentUser?.id);

  // Salons - superadmin fetches all, admin uses their own from useUser
  const { data: allSalons = [] } = useGet<Salon[]>("salons", {
    retry: 1,
    enabled: isSuperadmin,
  });

  const salons = isSuperadmin
    ? allSalons
    : (currentUser?.salon as unknown as Salon[]) || [];

  // Only superadmin can fetch list of admins (for assigning salon ownership)
  const { data: admins = [] } = useGet<User[]>("users/admins", {
    retry: 1,
    enabled: isSuperadmin,
  });

  const getSelectedUser = (): User | null => {
    if (!modalState || modalState.userId === "create") return null;
    if (modalState.user) return modalState.user;
    return users.find((u) => u.id === modalState.userId) || null;
  };

  const selectedUser = getSelectedUser();

  const table = useTable<User>({
    data: users,
    searchKeys: ["name", "email"],
  });

  // Handlers
  const handleView = (user: User) => {
    setModalState({ userId: user.id, mode: "view", user });
  };

  const handleEdit = (user: User) => {
    setModalState({ userId: user.id, mode: "edit", user });
  };

  const handleDelete = (user: User) => {
    setModalState({ userId: user.id, mode: "delete", user });
  };

  const handleCreateAdmin = () => {
    setModalState({
      userId: "create",
      mode: "edit",
      initialRole: "admin",
    });
  };

  const handleCreateUser = () => {
    setModalState({
      userId: "create",
      mode: "edit",
      initialRole: "user",
    });
  };

  const handleSuccess = () => {
    refetch();
  };

  const { mutate: updateUserStatus, isPending: isUpdatingStatus } =
    usePostAction<User, { id: string; isActive: boolean }>("users", {
      id: (variables) => variables.id,
      action: "status",
      method: "PATCH",
      body: ({ isActive }) => ({ isActive }),
      invalidateQueries: ["users"],
      showSuccessToast: true,
      successMessage: t("common.statusUpdated"),
    });

  // Generate columns with handlers using the hook
  const columns = useUsersColumns({
    currentUser: currentUser as User | null,
    isSuperadmin,
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onToggleActive: (user) =>
      updateUserStatus({ id: user.id, isActive: !user.isActive }),
    isTogglingActive: isUpdatingStatus,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.admin.users")}
        description={
          !isSuperadmin && (currentUser?.salon as unknown as Salon[])?.[0]
            ? `Utilisateurs de ${(currentUser?.salon as unknown as Salon[])[0].name} (${users.length})`
            : undefined
        }
        actions={
          isSuperadmin ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleCreateAdmin}
              >
                <UserCog className="h-4 w-4" />
                Ajouter un admin
              </Button>
            </div>
          ) : (
            <Button className="gap-2" onClick={handleCreateUser}>
              <UserPlus className="h-4 w-4" />
              Ajouter un utilisateur
            </Button>
          )
        }
      />

      {users.length > 0 && (
        <StatsGrid users={users} isSuperadmin={isSuperadmin} />
      )}

      <DataTable
        table={table}
        columns={columns}
        selectable
        searchPlaceholder={t("admin.users.searchPlaceholder")}
        emptyMessage={t("admin.users.noUsers")}
        loading={usersLoading}
      />

      <UserDialog
        open={!!modalState}
        onOpenChange={(open) => !open && setModalState(null)}
        mode={
          modalState?.userId === "create"
            ? "create"
            : modalState?.mode || "view"
        }
        user={selectedUser}
        initialRole={modalState?.initialRole}
        salons={salons}
        admins={admins}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
