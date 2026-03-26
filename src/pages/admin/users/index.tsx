import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus, UserCog } from "lucide-react";

import { AppRole } from "@/constants/enum";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ServerDataTable } from "@/components/table";
import { useGet } from "@/hooks/useGet";
import { useTable } from "@/hooks/useTable";
import { usePostAction } from "@/hooks/usePostAction";

import type { User } from "./types";
import type { Salon } from "@/pages/admin/salon/types";
import { StatsGrid } from "./components/stats-grid";
import { useUser } from "@/hooks/useUser";
import { useUsersColumns } from "./components/list/columns";
import { UserDialog } from "./components/dialog/cu-user";
import {
  createUserModalHandlers,
  getPageDescription,
  getSalonsByPermission,
  getSelectedUser,
  type UserModalState,
} from "./components/utils";

const USERS_PAGE_SIZE = 20;

export function AdminUsersPage() {
  const { t } = useTranslation();

  const [modalState, setModalState] = useState<UserModalState>(null);

  const { isSuperadmin, user: currentUser } = useUser();
  const usersTable = useTable<User>({
    path: "users",
    initialPerPage: USERS_PAGE_SIZE,
  });

  const adminsTable = useTable<User>({
    path: "users",
    query: {
      role: AppRole.ADMIN,
    },
    enabled: isSuperadmin,
    initialPerPage: 1,
  });

  const users = usersTable.items;
  const totalUsers = usersTable.totalItems;
  const totalAdmins = adminsTable.totalItems;
  const showUsersLoading =
    (usersTable.isLoading || usersTable.isFetching) && users.length === 0;

  // Salons - superadmin fetches all, admin uses their own from useUser
  const { data: allSalons = [] } = useGet<Salon[]>({
    path: "salons",
    options: {
      enabled: isSuperadmin,
    },
  });

  const adminSalon = !isSuperadmin
    ? (currentUser?.salon as Salon | null)
    : null;
  const salons = getSalonsByPermission(isSuperadmin, allSalons, adminSalon);

  // Only superadmin can fetch list of admins (for assigning salon ownership)
  const { data: admins = [] } = useGet<User[]>({
    path: "users/admins",
    options: {
      enabled: isSuperadmin,
    },
  });

  const selectedUser = getSelectedUser(modalState, users);

  // Create modal handlers
  const {
    handleView,
    handleEdit,
    handleDelete,
    handleCreateAdmin,
    handleCreateUser,
    handleClose,
  } = createUserModalHandlers(setModalState);

  const handleSuccess = () => {
    void usersTable.refetch();
  };

  const { mutate: updateUserStatus, isPending: isUpdatingStatus } =
    usePostAction<User, { id: string; isActive: boolean }>(
      (variables) => `users/${variables.id}/status`,
      {
        method: "PATCH",
        body: ({ isActive }) => ({ isActive }),
        invalidate: ["users"],
        successToast: t("common.statusUpdated"),
      },
    );

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
        description={getPageDescription(isSuperadmin, adminSalon, totalUsers)}
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

      {totalUsers > 0 && (
        <StatsGrid
          totalUsers={totalUsers}
          totalAdmins={totalAdmins}
          isSuperadmin={isSuperadmin}
        />
      )}

      <ServerDataTable
        items={users}
        columns={columns}
        search={usersTable.searchInput}
        onSearchChange={usersTable.setSearchInput}
        page={usersTable.page}
        perPage={usersTable.perPage}
        totalItems={usersTable.totalItems}
        totalPages={usersTable.totalPages}
        onPageChange={usersTable.setPage}
        searchPlaceholder={t("admin.users.searchPlaceholder")}
        emptyMessage={t("admin.users.noUsers")}
        loading={showUsersLoading}
      />

      <UserDialog
        open={!!modalState}
        onOpenChange={(open) => !open && handleClose()}
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
