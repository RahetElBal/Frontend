import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { AppRole } from "@/constants/enum";
import { Phone, Award, DollarSign, Calendar, Heart, Edit, Archive, Plus, Minus } from "lucide-react";
import type { Client } from "../../types";
import { toast } from "@/lib/toast";
import { usePost } from "@/hooks/usePost";
import { usePostAction } from "@/hooks/usePostAction";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import { MVP_VISIBILITY } from "@/constants/mvp";
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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneNumberInput } from "@/components/ui/phone-input";
import { Badge } from "@/components/badge";
import { Switch } from "@/components/ui/switch";
import type { ClientModalState } from "@/pages/user/clients/types";
import type { ClientFormData } from "../validation";
import { getValidationErrorMessage } from "@/pages/user/utils";
import { FormErrorMessage } from "@/pages/user/components/form-error-message";
import { normalizePhone } from "@/common/phone";
import { useSalonDateTime } from "@/hooks/useSalonDateTime";
import { isWalkInClient } from "@/common/client";

interface ClientModalsProps {
  modalState: ClientModalState;
  setModalState: (state: ClientModalState) => void;
  clients: Client[];
  form: UseFormReturn<ClientFormData>;
  onSuccess: () => void;
}

export function ClientModals({
  modalState,
  setModalState,
  clients,
  form,
  onSuccess,
}: ClientModalsProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { formatDate } = useSalonDateTime();
  const { user } = useUser();
  const loyaltyVisible = MVP_VISIBILITY.loyalty;
  const canManageLoyalty =
    loyaltyVisible && (user?.isSuperadmin || user?.role === AppRole.ADMIN);
  const getErrorMessage = (name: keyof ClientFormData): string | undefined => {
    const maybeGetError = (
      form as UseFormReturn<ClientFormData> & {
        getError?: (field: keyof ClientFormData) => string | undefined;
      }
    ).getError;
    const message =
      maybeGetError?.(name) ??
      (form.formState.errors[name]?.message as string | undefined);
    return getValidationErrorMessage(t, message);
  };

  const selectedClient = useMemo(() => {
    if (!modalState || modalState.clientId === "create") return null;
    return clients.find((c) => c.id === modalState.clientId) || null;
  }, [modalState, clients]);
  const selectedClientIsWalkIn = isWalkInClient(selectedClient);

  const { mutate: createClientMutate, isPending: isCreating } = usePost<
    Client,
    ClientFormData & { salonId: string }
  >("clients", {
    invalidate: ["clients"],
    onSuccess: () => {
      toast.success(t("clients.addClient") + " - " + t("common.success"));
      setModalState(null);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const { mutate: updateClientMutate, isPending: isUpdating } = usePost<
    Client,
    ClientFormData
  >(`clients/${selectedClient?.id}`, {
    method: "PATCH",
    invalidate: ["clients"],
    onSuccess: () => {
      toast.success(t("common.edit") + " - " + t("common.success"));
      setModalState(null);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const { mutate: deleteClientMutate, isPending: isDeleting } = usePost<
    void,
    void
  >(`clients/${selectedClient?.id}`, {
    method: "DELETE",
    invalidate: ["clients"],
    onSuccess: () => {
      toast.success(t("common.delete") + " - " + t("common.success"));
      setModalState(null);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Archive client - POST /clients/{id}/archive
  const { mutate: archiveClientMutate, isPending: isArchiving } = usePostAction<
    void,
    string
  >(`clients/${selectedClient?.id}/archive`, {
    invalidate: ["clients"],
    successToast: t("clients.archived"),
    onSuccess: () => {
      setModalState(null);
      onSuccess();
    },
  });

  // Add loyalty points - POST /clients/{id}/loyalty/add
  const { mutate: addLoyaltyPoints, isPending: isAddingPoints } = usePostAction<
    Client,
    { points: number }
  >(`clients/${selectedClient?.id}/loyalty/add`, {
    invalidate: ["clients"],
    successToast: t("clients.pointsAdded"),
    onSuccess: () => {
      onSuccess();
    },
  });

  // Deduct loyalty points - POST /clients/{id}/loyalty/deduct
  const { mutate: deductLoyaltyPoints, isPending: isDeductingPoints } =
    usePostAction<Client, { points: number }>(
      `clients/${selectedClient?.id}/loyalty/deduct`,
      {
        invalidate: ["clients"],
        successToast: t("clients.pointsDeducted"),
        onSuccess: () => {
          onSuccess();
        },
      },
    );

  const derived = useMemo(() => {
    if (!modalState) return null;

    const clientId = modalState.clientId;
    const isCreateMode = clientId === "create";

    return {
      mode: modalState.mode,
      clientId,
      isCreateMode,
      isPending: isCreating || isUpdating || isDeleting,
    };
  }, [modalState, isCreating, isUpdating, isDeleting]);

  useEffect(() => {
    if (!modalState) return;

    const isCreateMode = modalState.clientId === "create";
    const mode = modalState.mode;

    if (isCreateMode && mode === "edit") {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        isMarried: false,
      });
    } else if (selectedClient && mode === "edit") {
      form.reset({
        firstName: selectedClient.firstName,
        lastName: selectedClient.lastName,
        email: selectedClient.email || "",
        phone: selectedClient.phone || "",
        isMarried: selectedClient.isMarried ?? false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState, selectedClient]);

  useEffect(() => {
    if (!modalState) return;
    if (modalState.clientId === "create") return;
    if (!selectedClient) return;
    if (!selectedClientIsWalkIn) return;
    if (modalState.mode === "view") return;

    setModalState({ clientId: selectedClient.id, mode: "view" });
  }, [modalState, selectedClient, selectedClientIsWalkIn, setModalState]);

  if (!derived) return null;

  if (!derived.isCreateMode && selectedClientIsWalkIn && derived.mode !== "view") {
    return null;
  }

  const handleClose = () => setModalState(null);

  const handleSubmit = (data: ClientFormData) => {
    if (!derived.isCreateMode && selectedClientIsWalkIn) {
      toast.error(t("common.error"));
      return;
    }

    const normalizedEmail = data.email?.trim();
    const normalizedPhone = normalizePhone(data.phone);
    const payload: ClientFormData = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: normalizedEmail || data.email.trim(),
      phone: normalizedPhone || data.phone.trim(),
      isMarried: !!data.isMarried,
    };
    if (derived.isCreateMode) {
      const salonId = user?.salon?.id;
      if (!salonId) {
        toast.error("No salon assigned to user");
        return;
      }
      createClientMutate({ ...payload, salonId });
    } else {
      updateClientMutate(payload);
    }
  };

  const handleDelete = () => {
    if (selectedClientIsWalkIn) {
      toast.error(t("common.error"));
      return;
    }

    deleteClientMutate();
  };

  if (derived.mode === "delete") {
    return (
      <AlertDialog open={!!modalState} onOpenChange={handleClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clients.deleteClient")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("clients.deleteClientConfirm", {
                name: selectedClient
                  ? `${selectedClient.firstName} ${selectedClient.lastName}`
                  : "",
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
              {derived.isPending ? t("common.loading") : t("common.delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (derived.mode === "view") {
    return (
      <Dialog open={!!modalState} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>{t("clients.clientDetails")}</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-accent-pink/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent-pink">
                    {selectedClient.firstName[0]}
                    {selectedClient.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedClient.firstName} {selectedClient.lastName}
                  </h3>
                  {selectedClient.email && (
                    <p className="text-muted-foreground">
                      {selectedClient.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4">
                {selectedClient.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("fields.phone")}
                      </p>
                      <p className="font-medium">{selectedClient.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.maritalStatus")}
                    </p>
                    <p className="font-medium">
                      {selectedClient.isMarried
                        ? t("fields.married")
                        : t("fields.single")}
                    </p>
                  </div>
                </div>

                {loyaltyVisible && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t("fields.loyaltyPoints")}
                        </p>
                        <Badge
                          variant={
                            selectedClient.loyaltyPoints >= 500
                              ? "success"
                              : "default"
                          }
                        >
                          {selectedClient.loyaltyPoints} pts
                        </Badge>
                      </div>
                    </div>
                    {canManageLoyalty && !selectedClientIsWalkIn && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => addLoyaltyPoints({ points: 10 })}
                          disabled={isAddingPoints}
                          title={t("clients.addPoints")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deductLoyaltyPoints({ points: 10 })}
                          disabled={
                            isDeductingPoints ||
                            selectedClient.loyaltyPoints < 10
                          }
                          title={t("clients.deductPoints")}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.totalSpent")}
                    </p>
                    <p className="font-medium">
                      {formatCurrency(selectedClient.totalSpent)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.visits")}
                    </p>
                    <p className="font-medium">
                      {selectedClient.visitCount}{" "}
                      {t("fields.visits").toLowerCase()}
                      {selectedClient.lastVisit && (
                        <span className="text-muted-foreground text-sm ml-2">
                          ({t("fields.lastVisit")}:{" "}
                          {formatDate(selectedClient.lastVisit)}
                          )
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              {selectedClient && selectedClient.isActive && !selectedClientIsWalkIn && (
                <Button
                  variant="outline"
                  onClick={() => archiveClientMutate(selectedClient.id)}
                  disabled={isArchiving}
                >
                  <Archive className="h-4 w-4 me-2" />
                  {t("clients.archive")}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                {t("common.close")}
              </Button>
              {selectedClient && !selectedClientIsWalkIn && (
                <Button
                  onClick={() =>
                    setModalState({ clientId: selectedClient.id, mode: "edit" })
                  }
                >
                  <Edit className="h-4 w-4 me-2" />
                  {t("common.edit")}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (derived.mode === "edit") {
    return (
      <Dialog open={!!modalState} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>
              {derived.isCreateMode ? t("clients.addClient") : t("common.edit")}
            </DialogTitle>
            {!derived.isCreateMode && selectedClient && (
              <DialogDescription>
                {selectedClient.firstName} {selectedClient.lastName}
              </DialogDescription>
            )}
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("fields.firstName")} *</Label>
                <Input id="firstName" {...form.register("firstName")} />
                <FormErrorMessage message={getErrorMessage("firstName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("fields.lastName")} *</Label>
                <Input id="lastName" {...form.register("lastName")} />
                <FormErrorMessage message={getErrorMessage("lastName")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("fields.email")} *</Label>
              <Input id="email" type="email" {...form.register("email")} />
              <FormErrorMessage message={getErrorMessage("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("fields.phone")} *</Label>
              <Controller
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <PhoneNumberInput
                    id="phone"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>{t("fields.maritalStatus")}</Label>
                <p className="text-xs text-muted-foreground">
                  {form.watch("isMarried")
                    ? t("fields.married")
                    : t("fields.single")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!form.watch("isMarried")}
                  onCheckedChange={(value) => form.setValue("isMarried", value)}
                />
                <span className="text-sm">
                  {form.watch("isMarried")
                    ? t("fields.married")
                    : t("fields.single")}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={derived.isPending}>
                {derived.isPending ? t("common.loading") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
