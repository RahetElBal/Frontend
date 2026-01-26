import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Building2, UserCog, UserPlus } from "lucide-react";
import { z } from "zod";
import {
  requiredString,
  emailField,
  optionalString,
} from "@/common/validator/zodI18n";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePost } from "@/hooks/usePost";
import { useForm } from "@/hooks/useForm";
import { toast } from "@/lib/toast";
import type { User, Salon } from "@/types/entities";
import { getDisplayName } from "@/common/utils";

const userFormSchema = z
  .object({
    name: requiredString("Nom"),
    email: emailField("Email"),
    role: z.enum(["user", "admin"] as const),
    salonId: optionalString(),
    managedById: optionalString(),
  })
  .refine(
    (data) => {
      if (data.role === "user") {
        return !!data.salonId && data.salonId.length > 0;
      }
      return true;
    },
    {
      message: "Un salon est requis pour les utilisateurs (staff)",
      path: ["salonId"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "user") {
        return !!data.managedById && data.managedById.length > 0;
      }
      return true;
    },
    {
      message: "Un administrateur est requis pour les utilisateurs (staff)",
      path: ["managedById"],
    },
  );

type UserFormData = z.infer<typeof userFormSchema>;

interface CreateUpdateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  isCreateMode: boolean;
  initialRole?: "user" | "admin";
  salons: Salon[];
  admins: User[];
  onSuccess: () => void;
}

export function CreateUpdateUserDialog({
  open,
  onOpenChange,
  user,
  isCreateMode,
  initialRole,
  salons,
  admins,
  onSuccess,
}: CreateUpdateUserDialogProps) {
  const { t } = useTranslation();

  const form = useForm<UserFormData>({
    schema: userFormSchema,
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      salonId: "",
      managedById: "",
    },
  });

  // Reset form when dialog state changes
  useEffect(() => {
    if (isCreateMode) {
      const role = initialRole || "admin";
      form.reset({
        name: "",
        email: "",
        role,
        salonId: "",
        managedById: "",
      });
    } else if (user) {
      const formRole =
        user.role === "superadmin" ? "admin" : (user.role as "user" | "admin");
      form.reset({
        name: getDisplayName(user),
        email: user.email,
        role: formRole,
        salonId: user.workingSalons?.[0]?.id || "",
        managedById: user.managedById || "",
      });
    }
  }, [open, user, isCreateMode, initialRole, form]);

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

  const handleSubmit = (data: UserFormData) => {
    const cleanedData: Record<string, unknown> = {
      name: data.name,
      email: data.email,
      role: data.role,
    };

    if (data.salonId && data.salonId.trim() !== "") {
      cleanedData.salonId = data.salonId;
    }

    if (data.managedById && data.managedById.trim() !== "") {
      cleanedData.managedById = data.managedById;
    }

    if (isCreateMode) {
      createUser(cleanedData as UserFormData);
    } else {
      updateUser(cleanedData as UserFormData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {isCreateMode
              ? form.watch("role") === "admin"
                ? "Ajouter un administrateur"
                : "Ajouter un utilisateur (staff)"
              : "Modifier l'utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode
              ? form.watch("role") === "admin"
                ? "Les administrateurs peuvent créer et gérer leurs propres salons"
                : "Les utilisateurs sont membres du staff d'un salon"
              : `Modifier les informations de ${user ? getDisplayName(user) : ""}`}
          </DialogDescription>
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

            {!isCreateMode && (
              <div className="space-y-2">
                <Label htmlFor="role">{t("fields.role")}</Label>
                <Select
                  value={form.watch("role")}
                  onValueChange={(value) => {
                    form.setValue("role", value as "user" | "admin");
                    if (value === "admin") {
                      form.setValue("salonId", "");
                      form.clearErrors("salonId");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur (Staff)</SelectItem>
                    <SelectItem value="admin">
                      Administrateur (Propriétaire)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {form.watch("role") === "admin"
                    ? "Un administrateur peut créer et gérer ses propres salons"
                    : "Un utilisateur est membre du staff d'un salon existant"}
                </p>
              </div>
            )}

            {isCreateMode && (
              <div className="space-y-2">
                <Label>{t("fields.role")}</Label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  {form.watch("role") === "admin" ? (
                    <>
                      <UserCog className="h-5 w-5 text-accent-pink" />
                      <div>
                        <p className="font-medium">Administrateur</p>
                        <p className="text-xs text-muted-foreground">
                          Peut créer et gérer des salons
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 text-accent-blue" />
                      <div>
                        <p className="font-medium">Utilisateur (Staff)</p>
                        <p className="text-xs text-muted-foreground">
                          Membre du staff d'un salon
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {form.watch("role") === "user" && (
              <div className="space-y-2">
                <Label htmlFor="managedBy">Géré par (Admin) *</Label>
                {admins.length === 0 ? (
                  <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
                    <p className="font-medium">
                      Aucun administrateur disponible
                    </p>
                    <p className="text-sm mt-1">
                      Créez d'abord un administrateur avant d'ajouter du staff.
                    </p>
                  </div>
                ) : (
                  <>
                    <Select
                      value={form.watch("managedById")}
                      onValueChange={(value) =>
                        form.setValue("managedById", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un administrateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {admins.map((admin) => (
                          <SelectItem key={admin.id} value={admin.id}>
                            <div className="flex items-center gap-2">
                              <UserCog className="h-4 w-4 text-accent-pink" />
                              {admin.name || admin.email}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.hasError("managedById") && (
                      <p className="text-sm text-destructive">
                        {form.getError("managedById")}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      L'administrateur qui supervise cet utilisateur
                    </p>
                  </>
                )}
              </div>
            )}

            {form.watch("role") === "user" && (
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
                    {salons.map((salon) => (
                      <SelectItem key={salon.id} value={salon.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {salon.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.hasError("salonId") && (
                  <p className="text-sm text-destructive">
                    {form.getError("salonId")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  L'utilisateur aura accès uniquement à ce salon
                </p>
              </div>
            )}

            {form.watch("role") === "admin" && isCreateMode && (
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-800">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-medium">Création automatique de salon</p>
                    <p className="text-sm mt-1">
                      L'administrateur pourra créer son propre salon après sa
                      première connexion.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {form.watch("role") === "admin" && !isCreateMode && (
              <div className="space-y-2">
                <Label htmlFor="salon">{t("fields.salon")} (optionnel)</Label>
                <Select
                  value={form.watch("salonId")}
                  onValueChange={(value) => form.setValue("salonId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun salon assigné" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      <span className="text-muted-foreground">Aucun salon</span>
                    </SelectItem>
                    {salons.map((salon) => (
                      <SelectItem key={salon.id} value={salon.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {salon.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                form.isSubmitting ||
                isCreating ||
                isUpdating ||
                (form.watch("role") === "user" &&
                  (salons.length === 0 || admins.length === 0))
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
  );
}
