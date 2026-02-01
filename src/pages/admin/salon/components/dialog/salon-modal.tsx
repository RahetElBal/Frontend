// src/pages/admin/salons/components/dialog/salon-modal.tsx
import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Salon, User } from "@/types/entities";
import { toast } from "@/lib/toast";
import { usePost } from "@/hooks/usePost";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { canModifySalon, type SalonModalState } from "../../utils";
import { createSalonFormSchema, type SalonFormData } from "../../validation";
import React from "react";
import { parseValidationMsg } from "@/common/validator/zodI18n";

interface SalonModalProps {
  modalState: SalonModalState;
  setModalState: (state: SalonModalState) => void;
  salons: Salon[];
  user: User | null;
  admins: User[];
  onSuccess: () => void;
}

export function SalonModals({
  modalState,
  setModalState,
  salons,
  user,
  admins,
  onSuccess,
}: SalonModalProps) {
  const { t } = useTranslation();
  const getErrorMessage = (message?: string): string | undefined => {
    if (!message) return undefined;
    if (message.startsWith("validation.") || message.startsWith("errors.")) {
      const { key, params } = parseValidationMsg(message);
      return t(key, params);
    }
    return message;
  };

  // Derive selected salon from modalState
  const selectedSalon = useMemo(() => {
    if (!modalState || modalState.salonId === "create") return null;
    return salons.find((s) => s.id === modalState.salonId) || null;
  }, [modalState, salons]);

  // Form setup with zodResolver
  const form = useForm<SalonFormData>({
    resolver: zodResolver(createSalonFormSchema(t)),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  // Owner selection state (for superadmin only)
  const [selectedOwnerId, setSelectedOwnerId] = React.useState<string>("");

  // Mutations - defined inside the modal component
  const { mutate: createSalonMutate, isPending: isCreating } = usePost<
    Salon,
    SalonFormData & { ownerId?: string }
  >("salons", {
    onSuccess: () => {
      toast.success(t("admin.salons.addSalon") + " - " + t("common.success"));
      setModalState(null);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const { mutate: updateSalonMutate, isPending: isUpdating } = usePost<
    Salon,
    SalonFormData & { ownerId?: string }
  >("salons", {
    id: selectedSalon?.id,
    method: "PATCH",
    onSuccess: () => {
      toast.success(t("common.edit") + " - " + t("common.success"));
      setModalState(null);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const { mutate: deleteSalonMutate, isPending: isDeleting } = usePost<
    void,
    { salonId: string }
  >("salons", {
    id: (variables) => variables.salonId,
    method: "DELETE",
    onSuccess: () => {
      toast.success(t("common.delete") + " - " + t("common.success"));
      setModalState(null);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Derive all state from modalState
  const derived = useMemo(() => {
    if (!modalState) return null;

    const salonId = modalState.salonId;
    const isCreateMode = salonId === "create";
    const isSuperadmin = user?.isSuperadmin === true;
    const isAdmin = user?.role === "admin";

    return {
      mode: modalState.mode,
      salonId,
      isCreateMode,
      isSuperadmin,
      isAdmin,
      canModify: selectedSalon ? canModifySalon(selectedSalon, user) : false,
      isOwnSalon: selectedSalon?.ownerId === user?.id,
      isPending: isCreating || isUpdating || isDeleting,
    };
  }, [modalState, selectedSalon, user, isCreating, isUpdating, isDeleting]);

  // Reset form when modal opens or changes
  useEffect(() => {
    if (!modalState) {
      form.clearErrors();
      return;
    }

    const isCreateMode = modalState.salonId === "create";
    const mode = modalState.mode;

    if (isCreateMode && mode === "edit") {
      setTimeout(() => {
        form.reset(
          { name: "", address: "", phone: "", email: "" },
          {
            keepErrors: false,
            keepDirty: false,
            keepTouched: false,
            keepIsSubmitted: false,
          },
        );
        setSelectedOwnerId("");
      }, 0);
    } else if (selectedSalon && mode === "edit") {
      setTimeout(() => {
        form.reset(
          {
            name: selectedSalon.name,
            address: selectedSalon.address || "",
            phone: selectedSalon.phone || "",
            email: selectedSalon.email || "",
          },
          {
            keepErrors: false,
            keepDirty: false,
            keepTouched: false,
            keepIsSubmitted: false,
          },
        );
        setSelectedOwnerId(selectedSalon.ownerId || "");
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState?.salonId, modalState?.mode, selectedSalon?.id]);

  if (!derived) return null;

  const handleClose = () => setModalState(null);

  const handleSubmit = (data: SalonFormData) => {
    if (derived.isSuperadmin && derived.isCreateMode && !selectedOwnerId) {
      toast.error(t("admin.salons.selectOwnerRequired"));
      return;
    }

    const payload = {
      ...data,
      ...(derived.isSuperadmin && { ownerId: selectedOwnerId }),
    };

    // CRUD logic based on salonId
    if (derived.isCreateMode) {
      createSalonMutate(payload);
    } else {
      updateSalonMutate(payload);
    }
  };

  const handleDelete = () => {
    if (!selectedSalon?.id) {
      toast.error("Erreur: ID salon manquant");
      return;
    }
    deleteSalonMutate({ salonId: selectedSalon.id });
  };

  // DELETE MODE
  if (derived.mode === "delete") {
    return (
      <AlertDialog open={!!modalState} onOpenChange={handleClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.salons.deleteSalonConfirm", {
                name: selectedSalon?.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={derived.isPending}
            >
              {derived.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // VIEW MODE
  if (derived.mode === "view") {
    return (
      <Dialog open={!!modalState} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSalon?.name}</DialogTitle>
            <DialogDescription>
              {t("admin.salons.viewSalonDetails")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("admin.salons.address")}</Label>
              <p className="text-sm text-muted-foreground">
                {selectedSalon?.address || "-"}
              </p>
            </div>
            <div>
              <Label>{t("admin.salons.phone")}</Label>
              <p className="text-sm text-muted-foreground">
                {selectedSalon?.phone || "-"}
              </p>
            </div>
            <div>
              <Label>{t("admin.salons.email")}</Label>
              <p className="text-sm text-muted-foreground">
                {selectedSalon?.email || "-"}
              </p>
            </div>
            {derived.isSuperadmin && (
              <div>
                <Label>{t("admin.salons.owner")}</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedSalon?.owner?.email || "-"}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {t("common.close")}
            </Button>
            {derived.canModify && (
              <Button
                onClick={() =>
                  setModalState({ salonId: derived.salonId, mode: "edit" })
                }
              >
                {t("common.edit")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // EDIT/CREATE MODE
  if (derived.mode === "edit") {
    return (
      <Dialog open={!!modalState} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {derived.isCreateMode
                ? t("admin.salons.addSalon")
                : t("admin.salons.editSalon")}
            </DialogTitle>
            <DialogDescription>
              {derived.isCreateMode
                ? t("admin.salons.addSalonDescription")
                : t("admin.salons.editSalonDescription")}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">{t("admin.salons.name")} *</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {getErrorMessage(form.formState.errors.name.message as string)}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="address">{t("admin.salons.address")}</Label>
              <Input id="address" {...form.register("address")} />
            </div>
            <div>
              <Label htmlFor="phone">{t("admin.salons.phone")}</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>
            <div>
              <Label htmlFor="email">{t("admin.salons.email")}</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {getErrorMessage(form.formState.errors.email.message as string)}
                </p>
              )}
            </div>
            {derived.isSuperadmin && (
              <div>
                <Label htmlFor="owner">{t("admin.salons.owner")} *</Label>
                <Select
                  value={selectedOwnerId}
                  onValueChange={setSelectedOwnerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("admin.salons.selectOwner")} />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        {t("admin.salons.noAdmins")}
                      </div>
                    ) : (
                      admins.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {admins.length === 0 && (
                  <Button
                    type="button"
                    variant="link"
                    className="mt-2 p-0"
                    onClick={() => {
                      setModalState(null);
                      window.location.href = "/admin/users";
                    }}
                  >
                    {t("admin.salons.createAdmin")}
                  </Button>
                )}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={derived.isPending}>
                {derived.isPending
                  ? t("common.saving")
                  : derived.isCreateMode
                    ? t("common.create")
                    : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
