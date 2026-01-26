import { useTranslation } from "react-i18next";
import { Shield, Users, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { User, Salon } from "@/types/entities";
import { z } from "zod";
import {
  requiredString,
  optionalString,
  optionalEmailField,
} from "@/common/validator/zodI18n";
import type { UseFormReturn } from "react-hook-form";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const baseSalonFormSchema = z.object({
  name: requiredString("Nom"),
  address: optionalString(),
  phone: optionalString(),
  email: optionalEmailField(),
});

type BaseSalonFormData = z.infer<typeof baseSalonFormSchema>;

interface SalonFormModalProps {
  isOpen: boolean;
  isCreateMode: boolean;
  selectedSalon: Salon | null;
  isSuperadmin: boolean;
  isAdmin: boolean;
  admins: User[];
  selectedOwnerId: string;
  form: UseFormReturn<BaseSalonFormData>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: BaseSalonFormData) => void;
  onOwnerChange: (ownerId: string) => void;
  onCreateAdmin: () => void;
}

export function SalonFormModal({
  isOpen,
  isCreateMode,
  selectedSalon,
  isSuperadmin,
  isAdmin,
  admins,
  selectedOwnerId,
  form,
  isSubmitting,
  onClose,
  onSubmit,
  onOwnerChange,
  onCreateAdmin,
}: SalonFormModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {isCreateMode ? t("admin.salons.addSalon") : t("common.edit")}
          </DialogTitle>
          {!isCreateMode && selectedSalon && (
            <DialogDescription>{selectedSalon.name}</DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Owner selector - only for superadmin */}
            {isSuperadmin && (
              <div className="space-y-2">
                <Label htmlFor="ownerId">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent-pink" />
                    {t("admin.salons.salonOwner")} *
                  </div>
                </Label>
                {admins.length === 0 ? (
                  <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 space-y-2">
                    <p className="font-medium">
                      Aucun administrateur disponible
                    </p>
                    <p className="text-sm">
                      Vous devez d'abord créer un administrateur avant de créer
                      un salon. Allez dans "Utilisateurs" et créez un
                      administrateur.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="bg-white"
                      onClick={onCreateAdmin}
                    >
                      <Users className="h-4 w-4 me-2" />
                      Créer un administrateur
                    </Button>
                  </div>
                ) : (
                  <>
                    <Select
                      value={selectedOwnerId}
                      onValueChange={onOwnerChange}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("admin.salons.selectOwner")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {admins.map((admin) => (
                          <SelectItem key={admin.id} value={admin.id}>
                            <div className="flex items-center gap-2">
                              <UserCog className="h-4 w-4" />
                              {admin.name || admin.email}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isCreateMode && !selectedOwnerId && (
                      <p className="text-sm text-muted-foreground">
                        {t("admin.salons.ownerHelp")}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Admin info - show when admin creates (auto-assigned) */}
            {isAdmin && isCreateMode && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                <Shield className="h-4 w-4 text-accent-pink" />
                <span>{t("admin.salons.ownerAutoAssigned")}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t("fields.name")} *</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t("fields.address")}</Label>
              <Input id="address" {...form.register("address")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t("fields.phone")}</Label>
                <Input id="phone" type="tel" {...form.register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("fields.email")}</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                (isSuperadmin &&
                  isCreateMode &&
                  (!selectedOwnerId || admins.length === 0))
              }
            >
              {isSubmitting ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
