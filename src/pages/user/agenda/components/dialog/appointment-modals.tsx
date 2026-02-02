import { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { UseFormReturn } from "react-hook-form";
import {
  User,
  Scissors,
  Clock,
  Calendar,
  Edit,
  Trash2,
  XCircle,
  CheckCircle,
  DollarSign,
  UserPlus,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import type { Appointment, Client, Service } from "@/types/entities";
import type { AppointmentFormData } from "../../validation";
import type { AppointmentModalState } from "../../types";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import { timeSlots, statusColors } from "../../utils";
import { getValidationErrorMessage } from "@/pages/user/utils";
import { FormErrorMessage } from "@/pages/user/components/form-error-message";
import {
  getServiceImage,
  getServiceImageFallback,
  translateServiceName,
} from "@/common/service-translations";

interface AppointmentModalsProps {
  modalState: AppointmentModalState;
  setModalState: (state: AppointmentModalState) => void;
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  form: UseFormReturn<AppointmentFormData>;
  onSubmit: (data: AppointmentFormData) => void;
  onDelete: () => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCreateSale?: (
    appointment: Appointment,
    options?: { redeemLoyalty?: boolean }
  ) => void;
  isCreatingSale?: boolean;
  isPending: boolean;
}

export function AppointmentModals({
  modalState,
  setModalState,
  appointments,
  clients,
  services,
  form,
  onSubmit,
  onDelete,
  onCancel,
  onComplete,
  onCreateSale,
  isCreatingSale = false,
  isPending,
}: AppointmentModalsProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { salon } = useUser();
  const [redeemLoyalty, setRedeemLoyalty] = useState(false);
  const getErrorMessage = (
    name: keyof AppointmentFormData
  ): string | undefined => {
    const maybeGetError = (
      form as UseFormReturn<AppointmentFormData> & {
        getError?: (field: keyof AppointmentFormData) => string | undefined;
      }
    ).getError;
    const message =
      maybeGetError?.(name) ??
      (form.formState.errors[name]?.message as string | undefined);
    return getValidationErrorMessage(t, message);
  };

  // Derive selected appointment
  const selectedAppointment = useMemo(() => {
    if (!modalState || modalState.appointmentId === "create") return null;
    return appointments.find((a) => a.id === modalState.appointmentId) || null;
  }, [modalState, appointments]);

  // Derive modal mode states
  const derived = useMemo(() => {
    if (!modalState) return null;

    const isCreateMode = modalState.appointmentId === "create";
    const mode = modalState.mode;

    return {
      mode,
      isCreateMode,
      isEditMode: mode === "edit",
      isViewMode: mode === "view",
      isDeleteMode: mode === "delete",
    };
  }, [modalState]);

  const loyaltySettings = salon?.settings;
  const loyaltyEnabled = !!loyaltySettings?.loyaltyEnabled;
  const loyaltyRewardServiceId = loyaltySettings?.loyaltyRewardServiceId || "";
  const loyaltyMinimumRedemption = Number(
    loyaltySettings?.loyaltyMinimumRedemption || 0
  );
  const loyaltyClientPoints = selectedAppointment?.client?.loyaltyPoints ?? 0;
  const loyaltyServiceMatch =
    !!loyaltyRewardServiceId &&
    selectedAppointment?.serviceId === loyaltyRewardServiceId;
  const loyaltyEligible =
    loyaltyEnabled &&
    loyaltyServiceMatch &&
    loyaltyClientPoints >= loyaltyMinimumRedemption &&
    loyaltyMinimumRedemption > 0;

  // Safe arrays
  const safeClients = useMemo(
    () => (Array.isArray(clients) ? clients : []),
    [clients]
  );
  const safeServices = useMemo(
    () => (Array.isArray(services) ? services : []),
    [services]
  );

  const { reset, watch } = form;

  // Selected service for display
  const selectedServiceId = watch("serviceId");
  const selectedService = useMemo(
    () => safeServices.find((s) => s.id === selectedServiceId) || null,
    [safeServices, selectedServiceId]
  );

  const walkInEnabled = watch("walkInEnabled");

  // Reset form when modal state changes
  useEffect(() => {
    if (!modalState) return;
    setRedeemLoyalty(false);

    if (derived?.isCreateMode) {
      reset({
        clientId: "",
        serviceId: "",
        date: modalState?.prefillDate || new Date().toISOString().split("T")[0],
        startTime: modalState?.prefillTime || "09:00",
        notes: "",
        walkInEnabled: false,
        walkInName: "",
        walkInPhone: "",
        walkInEmail: "",
      });
    } else if (selectedAppointment && derived?.isEditMode) {
      reset({
        clientId: selectedAppointment.clientId,
        serviceId: selectedAppointment.serviceId,
        date: selectedAppointment.date,
        startTime: selectedAppointment.startTime,
        notes: selectedAppointment.notes || "",
        walkInEnabled: false,
        walkInName: "",
        walkInPhone: "",
        walkInEmail: "",
      });
    }
  }, [
    modalState,
    selectedAppointment,
    derived?.isCreateMode,
    derived?.isEditMode,
    reset,
  ]);

  if (!derived) return null;

  const handleClose = () => setModalState(null);

  const handleFormSubmit = (data: AppointmentFormData) => {
    onSubmit(data);
  };

  // DELETE MODE
  if (derived.isDeleteMode) {
    return (
      <AlertDialog open={!!modalState} onOpenChange={handleClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("agenda.deleteAppointment")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("agenda.deleteAppointmentConfirm", {
                client: selectedAppointment?.client
                  ? `${selectedAppointment.client.firstName} ${selectedAppointment.client.lastName}`
                  : "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // VIEW MODE
  if (derived.isViewMode) {
    return (
      <Dialog open={!!modalState} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>{t("agenda.appointmentDetails")}</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent-pink/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-accent-pink" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {selectedAppointment.client?.firstName}{" "}
                      {selectedAppointment.client?.lastName}
                    </h3>
                    {selectedAppointment.client?.phone && (
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.client.phone}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={statusColors[selectedAppointment.status]}>
                  {t(`agenda.statuses.${selectedAppointment.status}`, {
                    defaultValue: selectedAppointment.status,
                  })}
                </Badge>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("agenda.paymentStatus")}
                    </p>
                    <p className="font-medium">
                      {selectedAppointment.paid
                        ? t("agenda.paymentPaid")
                        : t("agenda.paymentUnpaid")}
                    </p>
                  </div>
                </div>
                {onCreateSale &&
                  selectedAppointment.status === "completed" &&
                  !selectedAppointment.paid &&
                  loyaltyEnabled && (
                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">
                          {t("agenda.redeemNow")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {loyaltyEligible
                            ? t("agenda.redeemNowDescription", {
                                points: loyaltyMinimumRedemption,
                              })
                            : t("agenda.redeemNowNotEligible")}
                        </p>
                      </div>
                      <Switch
                        checked={redeemLoyalty}
                        onCheckedChange={setRedeemLoyalty}
                        disabled={!loyaltyEligible}
                      />
                    </div>
                  )}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Scissors className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {t("fields.service")}
                    </p>
                    <p className="font-medium">
                      {selectedAppointment.service
                        ? translateServiceName(t, selectedAppointment.service)
                        : t("common.unknown")}
                    </p>
                  </div>
                  {selectedAppointment.service &&
                    getServiceImage(selectedAppointment.service) && (
                      <img
                        src={getServiceImage(selectedAppointment.service)}
                        alt={translateServiceName(
                          t,
                          selectedAppointment.service
                        )}
                        className="h-10 w-10 rounded-md object-cover"
                        loading="lazy"
                        onError={(event) => {
                          const fallback = getServiceImageFallback(
                            selectedAppointment.service!
                          );
                          if (
                            fallback &&
                            event.currentTarget.src !== fallback
                          ) {
                            event.currentTarget.src = fallback;
                          }
                        }}
                      />
                    )}
                  <p className="font-bold text-accent-pink">
                    {formatCurrency(
                      selectedAppointment.service?.price ??
                        selectedAppointment.price ??
                        0
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.date")}
                    </p>
                    <p className="font-medium">
                      {new Date(selectedAppointment.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.time")}
                    </p>
                    <p className="font-medium">
                      {selectedAppointment.startTime} -{" "}
                      {selectedAppointment.endTime}
                    </p>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("fields.notes")}
                    </p>
                    <p className="text-sm">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {selectedAppointment && (
              <div className="flex gap-2 w-full sm:w-auto">
                {/* Cancel button - allow if not cancelled and not paid */}
                {onCancel &&
                  selectedAppointment.status !== "cancelled" &&
                  !selectedAppointment.paid && (
                    <Button
                      variant="outline"
                      className="text-orange-600 hover:text-orange-700"
                      onClick={() => onCancel(selectedAppointment.id)}
                      disabled={isPending}
                    >
                      <XCircle className="h-4 w-4 me-2" />
                      {t("agenda.cancel")}
                    </Button>
                  )}
                {/* Complete button - show for non-completed/cancelled appointments */}
                {onComplete &&
                  selectedAppointment.status !== "completed" &&
                  selectedAppointment.status !== "cancelled" && (
                    <Button
                      variant="outline"
                      className="text-green-600 hover:text-green-700"
                      onClick={() => onComplete(selectedAppointment.id)}
                      disabled={isPending}
                    >
                      <CheckCircle className="h-4 w-4 me-2" />
                      {t("agenda.complete")}
                    </Button>
                  )}
                {onCreateSale &&
                  selectedAppointment.status === "completed" &&
                  !selectedAppointment.paid && (
                    <Button
                      onClick={() =>
                        onCreateSale(selectedAppointment, {
                          redeemLoyalty,
                        })
                      }
                      disabled={isPending || isCreatingSale}
                    >
                      <DollarSign className="h-4 w-4 me-2" />
                      {isCreatingSale
                        ? t("common.loading")
                        : t("agenda.recordPayment")}
                    </Button>
                  )}
              </div>
            )}
            <div className="flex gap-2 w-full sm:w-auto sm:ms-auto">
              <Button variant="outline" onClick={handleClose}>
                {t("common.close")}
              </Button>
              {selectedAppointment && (
                <>
                  <Button
                    variant="outline"
                    className="text-destructive"
                    onClick={() =>
                      setModalState({
                        appointmentId: selectedAppointment.id,
                        mode: "delete",
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4 me-2" />
                    {t("common.delete")}
                  </Button>
                  <Button
                    onClick={() =>
                      setModalState({
                        appointmentId: selectedAppointment.id,
                        mode: "edit",
                      })
                    }
                  >
                    <Edit className="h-4 w-4 me-2" />
                    {t("common.edit")}
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // EDIT/CREATE MODE
  if (derived.isEditMode) {
    return (
      <Dialog open={!!modalState} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>
              {derived.isCreateMode
                ? t("agenda.newAppointment")
                : t("common.edit")}
            </DialogTitle>
            {!derived.isCreateMode && selectedAppointment && (
              <DialogDescription>
                {selectedAppointment.client?.firstName}{" "}
                {selectedAppointment.client?.lastName}
              </DialogDescription>
            )}
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("fields.client")} *</Label>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {t("agenda.walkIn")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("agenda.walkInDescription")}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={!!walkInEnabled}
                    onCheckedChange={(value) => {
                      form.setValue("walkInEnabled", value);
                      if (value) {
                        form.setValue("clientId", "");
                      }
                    }}
                  />
                </div>
                <Select
                  value={form.watch("clientId")}
                  onValueChange={(value) => form.setValue("clientId", value)}
                  disabled={!!walkInEnabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("agenda.selectClient")} />
                  </SelectTrigger>
                  <SelectContent>
                    {safeClients.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground text-sm">
                        {t("clients.noClients")}
                      </div>
                    ) : (
                      safeClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {client.firstName} {client.lastName}
                            {client.phone && (
                              <span className="text-muted-foreground text-xs">
                                ({client.phone})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormErrorMessage message={getErrorMessage("clientId")} />
              </div>

              {walkInEnabled && (
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>{t("agenda.walkInName")}</Label>
                    <Input
                      {...form.register("walkInName")}
                      placeholder={t("agenda.walkInNamePlaceholder")}
                    />
                    <FormErrorMessage message={getErrorMessage("walkInName")} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {t("agenda.walkInOptionalDetails")}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t("agenda.walkInPhone")}</Label>
                        <Input
                          {...form.register("walkInPhone")}
                          placeholder={t("agenda.walkInPhonePlaceholder")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("agenda.walkInEmail")}</Label>
                        <Input
                          {...form.register("walkInEmail")}
                          placeholder={t("agenda.walkInEmailPlaceholder")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t("fields.service")} *</Label>
                <Select
                  value={form.watch("serviceId")}
                  onValueChange={(value) => form.setValue("serviceId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("agenda.selectService")} />
                  </SelectTrigger>
                  <SelectContent>
                    {safeServices.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground text-sm">
                        {t("services.services")} - {t("common.noResults")}
                      </div>
                    ) : (
                      safeServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <div className="flex items-center gap-2">
                              <Scissors className="h-4 w-4 text-accent-pink" />
                              {translateServiceName(t, service)}
                            </div>
                            <span className="text-muted-foreground text-sm">
                              {service.duration}min -{" "}
                              {formatCurrency(service.price)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormErrorMessage message={getErrorMessage("serviceId")} />
              </div>

              {selectedService && (
                <Card className="p-3 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {translateServiceName(t, selectedService)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("fields.duration")}: {selectedService.duration} min
                      </p>
                    </div>
                    <p className="text-lg font-bold text-accent-pink">
                      {formatCurrency(selectedService.price)}
                    </p>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">{t("fields.date")} *</Label>
                  <Input id="date" type="date" {...form.register("date")} />
                  <FormErrorMessage message={getErrorMessage("date")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">{t("fields.time")} *</Label>
                  <Select
                    value={form.watch("startTime")}
                    onValueChange={(value) => form.setValue("startTime", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {time}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("fields.notes")}</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  rows={2}
                  placeholder={t("agenda.notesPlaceholder")}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("common.loading") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
