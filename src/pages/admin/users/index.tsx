import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus, UserCog } from "lucide-react";

import { AppRole } from "@/constants/enum";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ServerDataTable } from "@/components/table";
import { useGet, withParams } from "@/hooks/useGet";
import { usePostAction } from "@/hooks/usePostAction";

import type { User, Salon } from "@/types/entities";
import { StatsGrid } from "./components/stats-grid";
import { useUser } from "@/hooks/useUser";
import type { PaginatedResponse } from "@/types";
import { useUsersColumns } from "./components/list/columns";
import { UserDialog } from "./components/dialog/cu-user";
import {
  createUserModalHandlers,
  getPageDescription,
  getSalonsByPermission,
  getSelectedUser,
  type UserModalState,
} from "./components/utils";
import { useServerTableState } from "@/hooks/useServerTableState";

const USERS_PAGE_SIZE = 20;

export function AdminUsersPage() {
  const { t } = useTranslation();

  const [modalState, setModalState] = useState<UserModalState>(null);

  const { isSuperadmin, user: currentUser } = useUser();
  const { page, setPage, search, searchInput, setSearchInput } =
    useServerTableState();

  const usersParams = {
    search: search || undefined,
    skip: (page - 1) * USERS_PAGE_SIZE,
    limit: USERS_PAGE_SIZE,
  };
  const usersCountParams = {
    limit: 1,
  };

  // Fetch all users
  const {
    data: usersResponse,
    refetch,
    isLoading: usersLoading,
    isFetching: isUsersFetching,
  } = useGet<PaginatedResponse<User>>(withParams("users", usersParams), {
    retry: 1,
  });
  const { data: usersCountResponse } = useGet<PaginatedResponse<User>>(
    withParams("users", usersCountParams),
    {
      retry: 1,
    },
  );
  const { data: adminsCountResponse } = useGet<PaginatedResponse<User>>(
    withParams("users", {
      limit: 1,
      role: AppRole.ADMIN,
    }),
    {
      retry: 1,
      enabled: isSuperadmin,
    },
  );

  const allUsers = usersResponse?.data || [];
  const users = allUsers;
  const usersMeta = usersResponse?.meta;
  const totalUsers = usersCountResponse?.meta.total ?? 0;
  const totalAdmins = adminsCountResponse?.meta.total ?? 0;
  const showUsersLoading = (usersLoading || isUsersFetching) && users.length === 0;

  useEffect(() => {
    if (!usersMeta) return;

    const lastPage = usersMeta.total > 0 ? Math.max(1, usersMeta.lastPage) : 1;
    if (page > lastPage) {
      setPage(lastPage);
    }
  }, [page, setPage, usersMeta]);

  // Salons - superadmin fetches all, admin uses their own from useUser
  const { data: allSalons = [] } = useGet<Salon[]>("salons", {
    retry: 1,
    enabled: isSuperadmin,
  });

  const adminSalon = !isSuperadmin
    ? (currentUser?.salon as Salon | null)
    : null;
  const salons = getSalonsByPermission(isSuperadmin, allSalons, adminSalon);

  // Only superadmin can fetch list of admins (for assigning salon ownership)
  const { data: admins = [] } = useGet<User[]>("users/admins", {
    retry: 1,
    enabled: isSuperadmin,
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
    refetch();
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
        search={searchInput}
        onSearchChange={setSearchInput}
        page={page}
        perPage={usersMeta?.perPage ?? USERS_PAGE_SIZE}
        totalItems={usersMeta?.total ?? 0}
        totalPages={Math.max(usersMeta?.lastPage ?? 0, 1)}
        onPageChange={setPage}
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
