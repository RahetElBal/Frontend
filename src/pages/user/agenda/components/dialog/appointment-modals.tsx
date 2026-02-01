import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { UseFormReturn } from "react-hook-form";
import { User, Scissors, Clock, Calendar, Edit, Trash2, XCircle, CheckCircle } from "lucide-react";
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
import { timeSlots, statusColors } from "../../utils";
import { parseValidationMsg } from "@/common/validator/zodI18n";

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
  isPending,
}: AppointmentModalsProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const getErrorMessage = (name: keyof AppointmentFormData): string | undefined => {
    const maybeGetError = (form as UseFormReturn<AppointmentFormData> & {
      getError?: (field: keyof AppointmentFormData) => string | undefined;
    }).getError;
    const message =
      maybeGetError?.(name) ??
      (form.formState.errors[name]?.message as string | undefined);
    if (!message) return undefined;
    if (message.startsWith("validation.") || message.startsWith("errors.")) {
      const { key, params } = parseValidationMsg(message);
      return t(key, params);
    }
    return message;
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

  // Safe arrays
  const safeClients = useMemo(
    () => (Array.isArray(clients) ? clients : []),
    [clients],
  );
  const safeServices = useMemo(
    () => (Array.isArray(services) ? services : []),
    [services],
  );

  const { reset, watch } = form;

  // Selected service for display
  const selectedServiceId = watch("serviceId");
  const selectedService = useMemo(
    () => safeServices.find((s) => s.id === selectedServiceId) || null,
    [safeServices, selectedServiceId],
  );

  // Reset form when modal state changes
  useEffect(() => {
    if (!modalState) return;

    if (derived?.isCreateMode) {
      reset({
        clientId: "",
        serviceId: "",
        date: modalState?.prefillDate || new Date().toISOString().split("T")[0],
        startTime: modalState?.prefillTime || "09:00",
        notes: "",
      });
    } else if (selectedAppointment && derived?.isEditMode) {
      reset({
        clientId: selectedAppointment.clientId,
        serviceId: selectedAppointment.serviceId,
        date: selectedAppointment.date,
        startTime: selectedAppointment.startTime,
        notes: selectedAppointment.notes || "",
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
                  {selectedAppointment.status}
                </Badge>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Scissors className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {t("fields.service")}
                    </p>
                    <p className="font-medium">
                      {selectedAppointment.service?.name}
                    </p>
                  </div>
                  <p className="font-bold text-accent-pink">
                    {formatCurrency(selectedAppointment.service?.price || 0)}
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
                {/* Cancel button - show for non-cancelled/completed appointments */}
                {onCancel && selectedAppointment.status !== "cancelled" && selectedAppointment.status !== "completed" && (
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
                {onComplete && selectedAppointment.status !== "completed" && selectedAppointment.status !== "cancelled" && (
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
                <Select
                  value={form.watch("clientId")}
                  onValueChange={(value) => form.setValue("clientId", value)}
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
                {getErrorMessage("clientId") && (
                  <p className="text-sm text-destructive">
                    {getErrorMessage("clientId")}
                  </p>
                )}
              </div>

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
                              {service.name}
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
                {getErrorMessage("serviceId") && (
                  <p className="text-sm text-destructive">
                    {getErrorMessage("serviceId")}
                  </p>
                )}
              </div>

              {selectedService && (
                <Card className="p-3 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedService.name}</p>
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
                  {getErrorMessage("date") && (
                    <p className="text-sm text-destructive">
                      {getErrorMessage("date")}
                    </p>
                  )}
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
