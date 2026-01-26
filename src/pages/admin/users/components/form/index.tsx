import { useTranslation } from "react-i18next";
import { Building2, UserCog, UserPlus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import type { User, Salon } from "@/types/entities";
import type { UserFormData } from "./validation";

interface UserFormProps {
  form: UseFormReturn<UserFormData>;
  isCreateMode: boolean;
  isSubmitting: boolean;
  salons: Salon[];
  admins: User[];
  isSuperadmin: boolean;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
}

export function UserForm({
  form,
  isCreateMode,
  isSubmitting,
  salons,
  admins,
  isSuperadmin,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const { t } = useTranslation();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("fields.fullName")} *</Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Jean Dupont"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
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
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
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

        {form.watch("role") === "user" && isSuperadmin && (
          <div className="space-y-2">
            <Label htmlFor="managedBy">Géré par (Admin) *</Label>
            {admins.length === 0 ? (
              <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
                <p className="font-medium">Aucun administrateur disponible</p>
                <p className="text-sm mt-1">
                  Créez d'abord un administrateur avant d'ajouter du staff.
                </p>
              </div>
            ) : (
              <>
                <Select
                  value={form.watch("managedById")}
                  onValueChange={(value) => form.setValue("managedById", value)}
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
                {form.formState.errors.managedById && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.managedById.message}
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
            {form.formState.errors.salonId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.salonId.message}
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
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            (form.watch("role") === "user" && salons.length === 0) ||
            (form.watch("role") === "user" && isSuperadmin && admins.length === 0)
          }
        >
          {isSubmitting ? t("common.loading") : t("common.save")}
        </Button>
      </DialogFooter>
    </form>
  );
}
