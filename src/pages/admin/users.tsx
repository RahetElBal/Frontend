import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Shield,
  Users,
  Building2,
  Mail,
  Calendar,
  Crown,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { z } from "zod";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/table/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTable } from "@/hooks/useTable";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useForm } from "@/hooks/useForm";
import { useAuthContext } from "@/contexts/AuthProvider";
import { toast } from "@/lib/toast";
import { UserRole } from "@/types/entities";
import type { User, Salon } from "@/types/entities";

const SUPERADMIN_EMAIL = "sofianelaghouatipro@gmail.com";

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

// Single modal state type
type UserModalState = {
  userId: string | "create";
  mode: "view" | "edit" | "delete";
} | null;

// Zod schema for user form
const userFormSchema = z.object({
  name: z.string().min(1, "validation.required"),
  email: z.string().email("validation.email"),
  role: z.enum(["user", "admin"] as const),
  salonId: z.string().min(1, "validation.required"),
});

type UserFormData = z.infer<typeof userFormSchema>;

export function AdminUsersPage() {
  const { t } = useTranslation();
  const { user: authUser } = useAuthContext();

  // Single state for all modal operations
  const [modalState, setModalState] = useState<UserModalState>(null);
  const [toggleUserId, setToggleUserId] = useState<string>("");

  // Fetch data
  const {
    data: usersResponse,
    isLoading,
    refetch,
  } = useGet<PaginatedResponse<User>>("users");
  const users = usersResponse?.data || [];
  const { data: salons = [] } = useGet<Salon[]>(
    authUser?.id ? (`salons/user/${authUser.id}` as string) : "",
  );

  // Helper functions
  const isSuperAdmin = (user: User) => user.email === SUPERADMIN_EMAIL;

  const getDisplayName = (user: User): string => {
    const userName = (user as User & { name?: string }).name;
    return (
      userName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "N/A"
    );
  };

  const getInitials = (user: User) => {
    const name = getDisplayName(user);
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Get current user being operated on
  const getSelectedUser = (): User | null => {
    if (!modalState || modalState.userId === "create") return null;
    return users.find((u) => u.id === modalState.userId) || null;
  };

  const selectedUser = getSelectedUser();
  const isCreateMode = modalState?.userId === "create";
  const isEditMode = modalState?.mode === "edit" && !isCreateMode;
  const isViewMode = modalState?.mode === "view";
  const isDeleteMode = modalState?.mode === "delete";

  // Form setup
  const form = useForm<UserFormData>({
    schema: userFormSchema,
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      salonId: "",
    },
  });

  // Reset form when modal state changes
  useEffect(() => {
    if (isCreateMode) {
      form.reset({
        name: "",
        email: "",
        role: "user",
        salonId: "",
      });
    } else if (selectedUser && isEditMode) {
      form.reset({
        name: getDisplayName(selectedUser),
        email: selectedUser.email,
        role: selectedUser.role,
        salonId: selectedUser.salonId || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState, selectedUser, isCreateMode, isEditMode]);

  // API mutations
  const { mutate: createUser, isPending: isCreating } = usePost<
    User,
    UserFormData
  >("users", {
    onSuccess: () => {
      toast.success(t("admin.users.addUser") + " - " + t("common.success"));
      setModalState(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const { mutate: updateUser, isPending: isUpdating } = usePost<
    User,
    UserFormData
  >("users", {
    id: selectedUser?.id,
    method: "PATCH",
    onSuccess: () => {
      toast.success(t("common.edit") + " - " + t("common.success"));
      setModalState(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const { mutate: deleteUserApi, isPending: isDeleting } = usePost<void, void>(
    "users",
    {
      id: selectedUser?.id,
      method: "DELETE",
      onSuccess: () => {
        toast.success(t("common.delete") + " - " + t("common.success"));
        setModalState(null);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("common.error"));
      },
    },
  );

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
    if (isSuperAdmin(user)) {
      toast.error("Le super-administrateur ne peut pas être modifié");
      return;
    }
    setModalState({ userId: user.id, mode: "edit" });
  };

  const handleDelete = (user: User) => {
    if (isSuperAdmin(user)) {
      toast.error("Le super-administrateur ne peut pas être supprimé");
      return;
    }
    setModalState({ userId: user.id, mode: "delete" });
  };

  const handleToggleStatus = (user: User) => {
    if (isSuperAdmin(user)) {
      toast.error("Le statut du super-administrateur ne peut pas être modifié");
      return;
    }
    setToggleUserId(user.id);
    toggleStatus();
  };

  const handleSubmit = (data: UserFormData) => {
    if (isEditMode) {
      updateUser(data);
    } else {
      createUser(data);
    }
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      header: t("fields.name"),
      sortable: true,
      render: (user) => {
        const displayName = getDisplayName(user);
        const initials = getInitials(user);
        const isSuper = isSuperAdmin(user);

        return (
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${isSuper ? "bg-yellow-100" : "bg-accent-pink/10"}`}
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={displayName}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <span
                  className={`font-medium ${isSuper ? "text-yellow-600" : "text-accent-pink"}`}
                >
                  {initials}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{displayName}</p>
                {isSuper && <Crown className="h-4 w-4 text-yellow-500" />}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "salon",
      header: t("fields.salon"),
      render: (user) => (
        <div className="flex items-center gap-2">
          {user.salon ? (
            <>
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{user.salon.name}</span>
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
        const isSuper = isSuperAdmin(user);

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
                disabled={isSuper}
                className={isSuper ? "opacity-50" : ""}
              >
                <Edit className="h-4 w-4 me-2" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleToggleStatus(user)}
                disabled={isSuper}
                className={isSuper ? "opacity-50" : ""}
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
                disabled={isSuper}
                className={`text-destructive ${isSuper ? "opacity-50" : ""}`}
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
          <Button
            className="gap-2"
            onClick={() => setModalState({ userId: "create", mode: "edit" })}
          >
            <Plus className="h-4 w-4" />
            {t("admin.users.addUser")}
          </Button>
        }
      />

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("common.loading")}
        </div>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t("admin.users.noUsers")}
          </h3>
          <p className="text-muted-foreground mb-4">
            Aucun utilisateur pour le moment
          </p>
          <Button
            onClick={() => setModalState({ userId: "create", mode: "edit" })}
          >
            <Plus className="h-4 w-4 me-2" />
            {t("admin.users.addUser")}
          </Button>
        </Card>
      ) : (
        <DataTable
          table={table}
          columns={columns}
          selectable
          searchPlaceholder={t("admin.users.searchPlaceholder")}
          emptyMessage={t("admin.users.noUsers")}
        />
      )}

      {/* Create/Edit User Modal */}
      <Dialog
        open={isEditMode || isCreateMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode
                ? t("admin.users.addUser")
                : "Modifier l'utilisateur"}
            </DialogTitle>
            {isEditMode && selectedUser && (
              <DialogDescription>
                Modifier les informations de {getDisplayName(selectedUser)}
              </DialogDescription>
            )}
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fields.fullName")} *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Jean Dupont"
                />
                {form.hasError("name") && (
                  <p className="text-sm text-destructive">
                    {form.getError("name")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("fields.email")} *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="jean@example.com"
                />
                {form.hasError("email") && (
                  <p className="text-sm text-destructive">
                    {form.getError("email")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t("fields.role")}</Label>
                <Select
                  value={form.watch("role")}
                  onValueChange={(value) =>
                    form.setValue("role", value as "user" | "admin")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salon">{t("fields.salon")} *</Label>
                <Select
                  value={form.watch("salonId")}
                  onValueChange={(value) => form.setValue("salonId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un salon" />
                  </SelectTrigger>
                  <SelectContent>
                    {salons.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground text-sm">
                        Aucun salon disponible. Vous devez d'abord créer un
                        salon.
                      </div>
                    ) : (
                      salons.map((salon) => (
                        <SelectItem key={salon.id} value={salon.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {salon.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {form.hasError("salonId") && (
                  <p className="text-sm text-destructive">
                    {form.getError("salonId")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  L'utilisateur aura accès uniquement à vos salons
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalState(null)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={
                  form.isSubmitting ||
                  isCreating ||
                  isUpdating ||
                  salons.length === 0
                }
              >
                {form.isSubmitting || isCreating || isUpdating
                  ? t("common.loading")
                  : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog
        open={isViewMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div
                  className={`h-16 w-16 rounded-full flex items-center justify-center ${isSuperAdmin(selectedUser) ? "bg-yellow-100" : "bg-accent-pink/10"}`}
                >
                  {selectedUser.picture ? (
                    <img
                      src={selectedUser.picture}
                      alt={getDisplayName(selectedUser)}
                      className="h-16 w-16 rounded-full"
                    />
                  ) : (
                    <span
                      className={`text-2xl font-bold ${isSuperAdmin(selectedUser) ? "text-yellow-600" : "text-accent-pink"}`}
                    >
                      {getInitials(selectedUser)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">
                      {getDisplayName(selectedUser)}
                    </h3>
                    {isSuperAdmin(selectedUser) && (
                      <Badge variant="warning" className="gap-1">
                        <Crown className="h-3 w-3" />
                        Super Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.email")}
                    </p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.role")}
                    </p>
                    <Badge
                      variant={
                        selectedUser.role === UserRole.ADMIN
                          ? "info"
                          : "default"
                      }
                    >
                      {selectedUser.role === UserRole.ADMIN
                        ? "Administrateur"
                        : "Utilisateur"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.salon")}
                    </p>
                    <p className="font-medium">
                      {selectedUser.salon?.name || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.createdAt")}
                    </p>
                    <p className="font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {selectedUser.isActive ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("fields.status")}
                      </p>
                      <Badge
                        variant={selectedUser.isActive ? "success" : "error"}
                      >
                        {selectedUser.isActive
                          ? t("common.active")
                          : t("common.inactive")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalState(null)}>
              Fermer
            </Button>
            {selectedUser && !isSuperAdmin(selectedUser) && (
              <Button
                onClick={() =>
                  setModalState({ userId: selectedUser.id, mode: "edit" })
                }
              >
                <Edit className="h-4 w-4 me-2" />
                {t("common.edit")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong>
                {selectedUser ? getDisplayName(selectedUser) : ""}
              </strong>{" "}
              ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserApi()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
