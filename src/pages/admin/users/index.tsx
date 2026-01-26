import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus, UserCog } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { useTable } from "@/hooks/useTable";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { toast } from "@/lib/toast";
import type { User, Salon } from "@/types/entities";
import { StatsGrid } from "./components/stats-grid";
import { useUser } from "@/hooks/useUser";
import type { PaginatedResponse } from "@/types";
import { useColumns } from "./list/columns";
import { UserDialog } from "./components/dialog/cu-user";

type UserModalState = {
  userId: string | "create";
  mode: "view" | "edit" | "delete";
  initialRole?: "user" | "admin";
} | null;

export function AdminUsersPage() {
  const { t } = useTranslation();

  const [modalState, setModalState] = useState<UserModalState>(null);
  const [toggleUserId, setToggleUserId] = useState<string>("");

  const { isSuperadmin, user: currentUser } = useUser();

  // Fetch data
  const { data: usersResponse, refetch } = useGet<PaginatedResponse<User>>(
    "users",
    {
      retry: 1,
    },
  );
  const allUsers = usersResponse?.data || [];

  // Filter users based on role
  const users = isSuperadmin
    ? allUsers // Superadmin sees everyone
    : allUsers.filter(
        (user) =>
          user.id === currentUser?.id || // Admin sees themselves
          user.managedById === currentUser?.id, // Admin sees their staff
      );

  // Salons for the current user (admin sees their salons, superadmin sees all)
  const { data: salons = [] } = useGet<Salon[]>("salons", {
    retry: 1,
  });

  // Only superadmin can fetch list of admins (for assigning salon ownership)
  const { data: admins = [] } = useGet<User[]>("users/admins", {
    retry: 1,
    enabled: isSuperadmin,
  });

  const getSelectedUser = (): User | null => {
    if (!modalState || modalState.userId === "create") return null;
    return users.find((u) => u.id === modalState.userId) || null;
  };

  const selectedUser = getSelectedUser();

  const { mutate: toggleStatus } = usePost<User, void>("users", {
    id: toggleUserId ? `${toggleUserId}/toggle-status` : "",
    method: "PATCH",
    onSuccess: () => {
      toast.success(t("common.success"));
      setToggleUserId("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
      setToggleUserId("");
    },
  });

  const table = useTable<User>({
    data: users,
    searchKeys: ["name", "email"],
  });

  // Handlers
  const handleView = (user: User) => {
    setModalState({ userId: user.id, mode: "view" });
  };

  const handleEdit = (user: User) => {
    setModalState({ userId: user.id, mode: "edit" });
  };

  const handleDelete = (user: User) => {
    setModalState({ userId: user.id, mode: "delete" });
  };

  const handleToggleStatus = (user: User) => {
    setToggleUserId(user.id);
    toggleStatus();
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

  // Generate columns with handlers
  const columns = useColumns({
    t,
    currentUserIsSuperadmin: isSuperadmin,
    currentUserId: currentUser?.id || "",
    handleView,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.admin.users")}
        description={t("admin.users.description", { count: users.length })}
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
            <Button
              className="gap-2"
              onClick={handleCreateUser}
              disabled={salons.length === 0}
              title={salons.length === 0 ? "Créez d'abord un salon" : undefined}
            >
              <UserPlus className="h-4 w-4" />
              Ajouter un utilisateur
            </Button>
          )
        }
      />

      {users.length > 0 && <StatsGrid users={users} />}

      <DataTable
        table={table}
        columns={columns}
        selectable
        searchPlaceholder={t("admin.users.searchPlaceholder")}
        emptyMessage={t("admin.users.noUsers")}
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
