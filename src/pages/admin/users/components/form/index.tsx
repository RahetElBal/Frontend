import { useTranslation } from "react-i18next";
import {
  Building2,
  UserCog,
  UserPlus,
  Phone,
  Users,
  Calendar,
  ShoppingCart,
  Package,
  Scissors,
  Settings,
} from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneNumberInput } from "@/components/ui/phone-input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { STAFF_PERMISSIONS, type StaffPermission } from "./validation";
import { parseValidationMsg } from "@/common/validator/zodI18n";
import { useUser } from "@/hooks/useUser";
import { ProFeatureGate } from "@/components/pro-feature-gate";
import { isProPlan } from "@/lib/plan";

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

const PERMISSION_META: Record<
  StaffPermission,
  { icon: typeof Users; labelKey: string }
> = {
  clients: { icon: Users, labelKey: "nav.clients" },
  agenda: { icon: Calendar, labelKey: "nav.agenda" },
  sales: { icon: ShoppingCart, labelKey: "nav.sales" },
  products: { icon: Package, labelKey: "nav.products" },
  services: { icon: Scissors, labelKey: "nav.services" },
  settings: { icon: Settings, labelKey: "nav.settings" },
};

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
  const { salon: currentSalon } = useUser();
  const currentRole = form.watch("role");
  const isPro = isProPlan(currentSalon?.planTier);
  const isProLikePlan = isPro;
  const getErrorMessage = (message?: string): string | undefined => {
    if (!message) return undefined;
    if (message.startsWith("validation.") || message.startsWith("errors.")) {
      const { key, params } = parseValidationMsg(message);
      return t(key, params);
    }
    return message;
  };

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
              {getErrorMessage(form.formState.errors.name.message as string)}
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
              {getErrorMessage(form.formState.errors.email.message as string)}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone">{t("fields.phone")} *</Label>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <Controller
              name="phone"
              control={form.control}
              render={({ field }) => (
                <PhoneNumberInput
                  id="phone"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  className="flex-1"
                />
              )}
            />
          </div>
          {form.formState.errors.phone && (
            <p className="text-sm text-destructive">
              {getErrorMessage(form.formState.errors.phone.message as string)}
            </p>
          )}
          {!isSuperadmin && isCreateMode && currentRole === "user" && isProLikePlan ? (
            <p className="text-xs text-muted-foreground">
              Offre Pro: demandez le numero WhatsApp du membre pour recevoir les rappels automatiques.
            </p>
          ) : null}
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
            <Label htmlFor="salon">{t("fields.salon")}</Label>
            {salons.length === 0 ? (
              <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
                <p className="font-medium">Aucun salon disponible</p>
                <p className="text-sm mt-1">
                  Vous pouvez créer un salon plus tard et l'assigner à cet
                  administrateur.
                </p>
              </div>
            ) : (
              <>
                <Controller
                  name="salonId"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Trigger validation when value changes
                        form.trigger("salonId");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un salon (optionnel)" />
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
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Le salon que cet administrateur gérera (optionnel)
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
                  Vous pourrez assigner un salon à cet administrateur plus tard
                  si nécessaire.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Advanced Permissions - Pro plan only, staff users only */}
        {currentRole === "user" && (
          <ProFeatureGate featureKey="advancedPermissions" compact>
            <div className="space-y-3">
              <Label>{t("proFeatures.advancedPermissions.title")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {STAFF_PERMISSIONS.map((perm) => {
                  const meta = PERMISSION_META[perm];
                  const Icon = meta.icon;
                  const currentPerms = form.watch("permissions") ?? [];
                  const checked = currentPerms.includes(perm);
                  return (
                    <label
                      key={perm}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 transition-colors hover:bg-muted/50 has-[data-state=checked]:border-accent-blue-300 has-[data-state=checked]:bg-accent-blue-50/50"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(val) => {
                          const next = val
                            ? [...currentPerms, perm]
                            : currentPerms.filter((p) => p !== perm);
                          form.setValue("permissions", next, {
                            shouldDirty: true,
                          });
                        }}
                      />
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{t(meta.labelKey)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </ProFeatureGate>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("common.loading") : t("common.save")}
        </Button>
      </DialogFooter>
    </form>
  );
}
