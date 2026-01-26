import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Shield,
  Building2,
  Crown,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  UserCog,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import { DataTable, type Column } from "@/components/table/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTable } from "@/hooks/useTable";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useAuthContext } from "@/contexts/AuthProvider";
import { toast } from "@/lib/toast";
import { UserRole } from "@/types/entities";
import type { User, Salon } from "@/types/entities";

import { CreateUpdateUserDialog } from "./components/dialog/cu-user";
import { ViewUserDialog } from "./components/dialog/view-user";
import { DeleteUserDialog } from "./components/dialog/delete-user";
import { EmptyState } from "./components/empty-state";
import { StatsGrid } from "./components/stats-grid";
import { useUser } from "@/hooks/useUser";
import { getDisplayName, getInitials } from "@/common/utils";
import type { PaginatedResponse } from "@/types";

type UserModalState = {
  userId: string | "create";
  mode: "view" | "edit" | "delete";
  initialRole?: "user" | "admin";
} | null;

export function AdminUsersPage() {
  const { user: currentUser } = useAuthContext();
  const { t } = useTranslation();

  const [modalState, setModalState] = useState<UserModalState>(null);
  const [toggleUserId, setToggleUserId] = useState<string>("");

  // Fetch data
  const {
    data: usersResponse,
    isLoading,
    refetch,
  } = useGet<PaginatedResponse<User>>("users", {
    retry: 1,
  });
  const users = usersResponse?.data || [];
  const { data: salons = [] } = useGet<Salon[]>("salons/my-salons", {
    retry: 1,
  });
  const { data: admins = [] } = useGet<User[]>("users/admins", { retry: 1 });

  const getSelectedUser = (): User | null => {
    if (!modalState || modalState.userId === "create") return null;
    return users.find((u) => u.id === modalState.userId) || null;
  };

  const { isSuperadmin } = useUser();

  const selectedUser = getSelectedUser();
  const isCreateMode = modalState?.userId === "create";
  const isEditMode = modalState?.mode === "edit" && !isCreateMode;
  const isViewMode = modalState?.mode === "view";
  const isDeleteMode = modalState?.mode === "delete";

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
    if (isSuperadmin) {
      toast.error("Le super-administrateur ne peut pas être modifié");
      return;
    }
    setModalState({ userId: user.id, mode: "edit" });
  };

  const handleDelete = (user: User) => {
    if (isSuperadmin) {
      toast.error("Le super-administrateur ne peut pas être supprimé");
      return;
    }
    setModalState({ userId: user.id, mode: "delete" });
  };

  const handleToggleStatus = (user: User) => {
    if (isSuperadmin) {
      toast.error("Le statut du super-administrateur ne peut pas être modifié");
      return;
    }
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

  const columns: Column<User>[] = [
    {
      key: "name",
      header: t("fields.name"),
      sortable: true,
      render: (user) => {
        const displayName = getDisplayName(user);
        const initials = getInitials(user);

        return (
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${isSuperadmin ? "bg-yellow-100" : "bg-accent-pink/10"}`}
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={displayName}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <span
                  className={`font-medium ${isSuperadmin ? "text-yellow-600" : "text-accent-pink"}`}
                >
                  {initials}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{displayName}</p>
                {isSuperadmin && <Crown className="h-4 w-4 text-yellow-500" />}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "managedBy",
      header: "Géré par",
      render: (user) => (
        <div className="flex items-center gap-2">
          {user.managedBy ? (
            <>
              <UserCog className="h-4 w-4 text-accent-pink" />
              <span>{user.managedBy.name || user.managedBy.email}</span>
            </>
          ) : user.role === UserRole.ADMIN ? (
            <span className="text-muted-foreground text-sm">-</span>
          ) : (
            <span className="text-muted-foreground text-sm">Non assigné</span>
          )}
        </div>
      ),
    },
    {
      key: "salon",
      header: t("fields.salon"),
      render: (user) => (
        <div className="flex items-center gap-2">
          {user.workingSalons?.[0] ? (
            <>
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{user.workingSalons[0].name}</span>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      key: "role",
      header: t("fields.role"),
      render: (user) => (
        <Badge variant={user.role === UserRole.ADMIN ? "info" : "default"}>
          <Shield className="h-3 w-3 me-1" />
          {user.role === UserRole.ADMIN ? "Admin" : "Utilisateur"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: t("fields.status"),
      render: (user) => (
        <Badge variant={user.isActive ? "success" : "error"}>
          {user.isActive ? t("common.active") : t("common.inactive")}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: t("fields.createdAt"),
      sortable: true,
      render: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (user) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(user)}>
                <Eye className="h-4 w-4 me-2" />
                {t("common.view")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEdit(user)}
                disabled={isSuperadmin}
                className={isSuperadmin ? "opacity-50" : ""}
              >
                <Edit className="h-4 w-4 me-2" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleToggleStatus(user)}
                disabled={isSuperadmin}
                className={isSuperadmin ? "opacity-50" : ""}
              >
                {user.isActive ? (
                  <>
                    <ToggleLeft className="h-4 w-4 me-2" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <ToggleRight className="h-4 w-4 me-2" />
                    Activer
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(user)}
                disabled={isSuperadmin}
                className={`text-destructive ${isSuperadmin ? "opacity-50" : ""}`}
              >
                <Trash2 className="h-4 w-4 me-2" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.admin.users")}
        description={t("admin.users.description", { count: users.length })}
        actions={
          currentUser?.isSuperadmin ? (
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
              disabled={salons.length === 0 || admins.length === 0}
              title={
                salons.length === 0 || admins.length === 0
                  ? "Créez d'abord un admin et un salon"
                  : undefined
              }
            >
              <UserPlus className="h-4 w-4" />
              Ajouter un utilisateur
            </Button>
          )
        }
      />

      {users.length > 0 && <StatsGrid users={users} />}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("common.loading")}
        </div>
      ) : users.length === 0 ? (
        <EmptyState onCreateAdmin={handleCreateAdmin} />
      ) : (
        <DataTable
          table={table}
          columns={columns}
          selectable
          searchPlaceholder={t("admin.users.searchPlaceholder")}
          emptyMessage={t("admin.users.noUsers")}
        />
      )}

      <CreateUpdateUserDialog
        open={isEditMode || isCreateMode}
        onOpenChange={(open) => !open && setModalState(null)}
        user={selectedUser}
        isCreateMode={isCreateMode}
        initialRole={modalState?.initialRole}
        salons={salons}
        admins={admins}
        onSuccess={handleSuccess}
      />

      <ViewUserDialog
        open={isViewMode}
        onOpenChange={(open) => !open && setModalState(null)}
        user={selectedUser}
        onEdit={() => selectedUser && handleEdit(selectedUser)}
      />

      <DeleteUserDialog
        open={isDeleteMode}
        onOpenChange={(open) => !open && setModalState(null)}
        user={selectedUser}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
