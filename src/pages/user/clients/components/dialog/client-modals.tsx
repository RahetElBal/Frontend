import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { UseFormReturn } from "react-hook-form";
import { Phone, Award, DollarSign, Calendar, Edit } from "lucide-react";
import type { Client } from "@/types/entities";
import { toast } from "@/lib/toast";
import { usePost } from "@/hooks/usePost";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
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
import { Badge } from "@/components/badge";
import type { ClientModalState } from "@/pages/user/clients/types";
import type { ClientFormData } from "@/pages/user/clients/validation";

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
  const { user } = useUser();

  const selectedClient = useMemo(() => {
    if (!modalState || modalState.clientId === "create") return null;
    return clients.find((c) => c.id === modalState.clientId) || null;
  }, [modalState, clients]);

  const { mutate: createClientMutate, isPending: isCreating } = usePost<
    Client,
    ClientFormData
  >("clients", {
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
  >("clients", {
    id: selectedClient?.id,
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

  const { mutate: deleteClientMutate, isPending: isDeleting } = usePost<
    void,
    void
  >("clients", {
    id: selectedClient?.id,
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
      });
    } else if (selectedClient && mode === "edit") {
      form.reset({
        firstName: selectedClient.firstName,
        lastName: selectedClient.lastName,
        email: selectedClient.email || "",
        phone: selectedClient.phone || "",
      });
    }
  }, [modalState?.clientId, modalState?.mode, selectedClient?.id]);

  if (!derived) return null;

  const handleClose = () => setModalState(null);

  const handleSubmit = (data: ClientFormData) => {
    if (derived.isCreateMode) {
      const salonId = user?.salon?.id;
      if (!salonId) {
        toast.error("No salon assigned to user");
        return;
      }
      createClientMutate({ ...data, salonId });
    } else {
      updateClientMutate(data);
    }
  };

  const handleDelete = () => {
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
                          {new Date(
                            selectedClient.lastVisit,
                          ).toLocaleDateString()}
                          )
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {t("common.close")}
            </Button>
            {selectedClient && (
              <Button
                onClick={() =>
                  setModalState({ clientId: selectedClient.id, mode: "edit" })
                }
              >
                <Edit className="h-4 w-4 me-2" />
                {t("common.edit")}
              </Button>
            )}
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
                {form.formState.errors.firstName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("fields.lastName")} *</Label>
                <Input id="lastName" {...form.register("lastName")} />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
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
            <div className="space-y-2">
              <Label htmlFor="phone">{t("fields.phone")}</Label>
              <Input id="phone" type="tel" {...form.register("phone")} />
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
