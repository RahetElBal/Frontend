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
  isSuperadmin,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const { t } = useTranslation();
  const currentRole = form.watch("role");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        {/* Name Field */}
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

        {/* Email Field */}
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

        {/* Role Display (Read-only in create mode) */}
        <div className="space-y-2">
          <Label>{t("fields.role")}</Label>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            {currentRole === "admin" ? (
              <>
                <UserCog className="h-5 w-5 text-accent-pink" />
                <div>
                  <p className="font-medium">Administrateur</p>
                  <p className="text-xs text-muted-foreground">
                    Peut gérer son propre salon
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

        {/* Salon Selection - Only for Superadmin creating Admin */}
        {isSuperadmin && currentRole === "admin" && isCreateMode && (
          <div className="space-y-2">
            <Label htmlFor="salon">{t("fields.salon")} *</Label>
            {salons.length === 0 ? (
              <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
                <p className="font-medium">Aucun salon disponible</p>
                <p className="text-sm mt-1">
                  Créez d'abord un salon pour pouvoir l'assigner à cet
                  administrateur.
                </p>
              </div>
            ) : (
              <>
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
                  Le salon que cet administrateur gérera
                </p>
              </>
            )}
          </div>
        )}

        {/* Info message for Admin creating User - Salon auto-assigned */}
        {!isSuperadmin && currentRole === "user" && isCreateMode && (
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-800">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Assignation automatique</p>
                <p className="text-sm mt-1">
                  Cet utilisateur sera automatiquement assigné à votre salon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info message for Superadmin creating Admin */}
        {isSuperadmin && currentRole === "admin" && isCreateMode && (
          <div className="p-4 rounded-lg border border-purple-200 bg-purple-50 text-purple-800">
            <div className="flex items-start gap-3">
              <UserCog className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Gestion du salon</p>
                <p className="text-sm mt-1">
                  Cet administrateur pourra gérer le salon sélectionné
                  ci-dessus.
                </p>
              </div>
            </div>
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
            (isSuperadmin && currentRole === "admin" && salons.length === 0)
          }
        >
          {isSubmitting ? t("common.loading") : t("common.save")}
        </Button>
      </DialogFooter>
    </form>
  );
}
