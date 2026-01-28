import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Shield,
  Calendar,
  Crown,
  ToggleLeft,
  ToggleRight,
  Building2,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
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
import { usePost } from "@/hooks/usePost";
import { useForm } from "react-hook-form";
import { toast } from "@/lib/toast";
import { UserRole } from "@/types/entities";
import type { User, Salon } from "@/types/entities";
import { getDisplayName, getInitials } from "@/common/utils";
import { useUser } from "@/hooks/useUser";
import { UserForm } from "../form";
import { createUserFormSchema, type UserFormData } from "../form/validation";

type UserDialogMode = "view" | "edit" | "create" | "delete";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: UserDialogMode;
  user: User | null;
  initialRole?: "user" | "admin";
  salons: Salon[];
  admins: User[];
  onSuccess: () => void;
}

export function UserDialog({
  open,
  onOpenChange,
  mode,
  user,
  initialRole,
  salons,
  admins,
  onSuccess,
}: UserDialogProps) {
  const { t } = useTranslation();
  const { isSuperadmin: currentUserIsSuperadmin, user: currentUser } =
    useUser();

  // Derived state
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";
  const isDeleteMode = mode === "delete";
  const isFormMode = isCreateMode || isEditMode;

  const displayName = user ? getDisplayName(user) : "";
  const initials = user ? getInitials(user) : "";

  const userIsSuperadmin = user?.isSuperadmin === true;

  // Check if current user is trying to delete themselves
  const isDeletingSelf = currentUser?.id === user?.id;

  // Check delete permissions
  const canDelete = currentUserIsSuperadmin && !isDeletingSelf;

  const form = useForm<UserFormData>({
    resolver: zodResolver(createUserFormSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "user",
      salonId: "",
      managedById: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.clearErrors();
      return;
    }

    if (mode === "create") {
      const role = initialRole || (currentUserIsSuperadmin ? "admin" : "user");
      setTimeout(() => {
        form.reset(
          {
            name: "",
            email: "",
            phone: "",
            role,
            salonId: "",
            managedById: "",
          },
          {
            keepErrors: false,
            keepDirty: false,
            keepTouched: false,
            keepIsSubmitted: false,
          },
        );
      }, 0);
    } else if (user && mode === "edit") {
      const formRole =
        user.role === "superadmin" ? "admin" : (user.role as "user" | "admin");
      setTimeout(() => {
        form.reset(
          {
            name: displayName,
            email: user.email,
            phone: user.phone || "",
            role: formRole,
            salonId: user.salon?.id || "",
            managedById: user.managedById || "",
          },
          {
            keepErrors: false,
            keepDirty: false,
            keepTouched: false,
            keepIsSubmitted: false,
          },
        );
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, user?.id, initialRole, currentUserIsSuperadmin]);

  const { mutate: createUser, isPending: isCreating } = usePost<
    User,
    UserFormData
  >("users", {
    onSuccess: () => {
      toast.success(t("admin.users.addUser") + " - " + t("common.success"));
      onOpenChange(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const { mutate: updateUser, isPending: isUpdating } = usePost<
    User,
    UserFormData
  >("users", {
    id: user?.id,
    method: "PATCH",
    onSuccess: () => {
      toast.success(t("common.edit") + " - " + t("common.success"));
      onOpenChange(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const { mutate: deleteUser, isPending: isDeleting } = usePost<
    void,
    { userId: string }
  >("users", {
    id: (variables) => variables.userId,
    method: "DELETE",
    onSuccess: () => {
      toast.success(t("common.delete") + " - " + t("common.success"));
      onOpenChange(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const handleSubmit = (data: UserFormData) => {
    const role = isCreateMode
      ? currentUserIsSuperadmin
        ? "admin"
        : "user"
      : data.role;

    const cleanedData: Record<string, unknown> = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role,
    };

    // Handle salon assignment
    if (isCreateMode) {
      if (currentUserIsSuperadmin) {
        // Superadmin creating admin: salonId is required (validated by schema)
        if (data.salonId && data.salonId.trim() !== "") {
          cleanedData.salonId = data.salonId;
        }
      } else {
        // Admin creating user: auto-assign to their own salon
        const adminSalon = salons.find((s) => s.ownerId === currentUser?.id);
        if (adminSalon) {
          cleanedData.salonId = adminSalon.id;
        }
        // Auto-assign managedById to current admin
        cleanedData.managedById = currentUser?.id;
      }
    } else {
      // Edit mode: handle optional fields
      if (data.salonId && data.salonId.trim() !== "") {
        cleanedData.salonId = data.salonId;
      }
      if (data.managedById && data.managedById.trim() !== "") {
        cleanedData.managedById = data.managedById;
      }
    }

    if (isCreateMode) {
      createUser(cleanedData as UserFormData);
    } else {
      updateUser(cleanedData as UserFormData);
    }
  };

  const handleDelete = () => {
    if (!canDelete) {
      if (isDeletingSelf) {
        toast.error("Vous ne pouvez pas supprimer votre propre compte");
      } else {
        toast.error(
          "Vous n'avez pas la permission de supprimer cet utilisateur",
        );
      }
      onOpenChange(false);
      return;
    }
    if (!user?.id) {
      toast.error("Erreur: ID utilisateur manquant");
      onOpenChange(false);
      return;
    }

    deleteUser({ userId: user.id });
  };

  if (isDeleteMode) {
    if (!canDelete) {
      return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Action non autorisée</AlertDialogTitle>
              <AlertDialogDescription>
                {isDeletingSelf
                  ? "Vous ne pouvez pas supprimer votre propre compte."
                  : "Vous n'avez pas la permission de supprimer cet utilisateur."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => onOpenChange(false)}>
                Fermer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{displayName}</strong>{" "}
              ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Render view mode
  if (isViewMode && user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4">
              <div
                className={`h-16 w-16 rounded-full flex items-center justify-center ${userIsSuperadmin ? "bg-yellow-100" : "bg-accent-pink/10"}`}
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={displayName}
                    className="h-16 w-16 rounded-full"
                  />
                ) : (
                  <span
                    className={`text-2xl font-bold ${userIsSuperadmin ? "text-yellow-600" : "text-accent-pink"}`}
                  >
                    {initials}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{displayName}</h3>
                  {userIsSuperadmin && (
                    <Badge variant="warning" className="gap-1">
                      <Crown className="h-3 w-3" />
                      Super Admin
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("fields.email")}
                  </p>
                  <p className="font-medium">{user.email}</p>
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
                      user.role === UserRole.ADMIN || userIsSuperadmin
                        ? "info"
                        : "default"
                    }
                  >
                    {userIsSuperadmin
                      ? "Super Admin"
                      : user.role === UserRole.ADMIN
                        ? "Administrateur"
                        : "Utilisateur"}
                  </Badge>
                </div>
              </div>

              {user.role !== UserRole.ADMIN && !userIsSuperadmin && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <UserCog className="h-5 w-5 text-accent-pink" />
                  <div>
                    <p className="text-sm text-muted-foreground">Géré par</p>
                    <p className="font-medium">
                      {user.managedBy?.name ||
                        user.managedBy?.email ||
                        "Non assigné"}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("fields.salon")}
                  </p>
                  <p className="font-medium">
                    {user.salon?.name ||
                      (user.role === UserRole.ADMIN || userIsSuperadmin
                        ? "-"
                        : "Non assigné")}
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
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {user.isActive ? (
                    <ToggleRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.status")}
                    </p>
                    <Badge variant={user.isActive ? "success" : "error"}>
                      {user.isActive
                        ? t("common.active")
                        : t("common.inactive")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Render form mode (create/edit)
  if (isFormMode) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode
                ? currentUserIsSuperadmin
                  ? "Ajouter un administrateur"
                  : "Ajouter un utilisateur"
                : "Modifier l'utilisateur"}
            </DialogTitle>
            <DialogDescription>
              {isCreateMode
                ? currentUserIsSuperadmin
                  ? "Les administrateurs peuvent créer et gérer leurs propres salons"
                  : "Les utilisateurs sont membres du staff de votre salon"
                : `Modifier les informations de ${displayName}`}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            form={form}
            isCreateMode={isCreateMode}
            isSubmitting={
              form.formState.isSubmitting || isCreating || isUpdating
            }
            salons={salons}
            admins={admins}
            isSuperadmin={currentUserIsSuperadmin}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
