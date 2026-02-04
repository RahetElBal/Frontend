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
import type {
  Appointment,
  Client,
  Service,
  SalonSettings,
  SalonSettingsExtended,
} from "@/types/entities";
import type { AppointmentFormData } from "../../validation";
import type { AppointmentModalState } from "../../types";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import {
  statusColors,
  getLocalDateString,
  getWorkingHoursForDate,
  buildTimeSlotsForHours,
  DEFAULT_SLOT_MINUTES,
  addMinutesToTime,
  findConflictingAppointment,
} from "../../utils";
import { getValidationErrorMessage } from "@/pages/user/utils";
import { FormErrorMessage } from "@/pages/user/components/form-error-message";
import { normalizePhone, sanitizePhoneInput } from "@/common/phone";
import {
  getServiceImage,
  getServiceImageFallback,
  translateServiceName,
} from "@/common/service-translations";

const isWalkInClient = (client: Client) =>
  (client.email || "").toLowerCase().startsWith("walkin+");

type SalonSettingsLike = SalonSettings & Partial<SalonSettingsExtended>;

interface AppointmentModalsProps {
  modalState: AppointmentModalState;
  setModalState: (state: AppointmentModalState) => void;
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  salonSettings?: SalonSettingsLike;
  form: UseFormReturn<AppointmentFormData>;
  onSubmit: (data: AppointmentFormData) => void;
  onDelete: () => void;
  onCreateSale?: (
    appointment: Appointment,
    options?: { redeemLoyalty?: boolean },
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
  salonSettings,
  form,
  onSubmit,
  onDelete,
  onCreateSale,
  isCreatingSale = false,
  isPending,
}: AppointmentModalsProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { salon, isAdmin, isSuperadmin } = useUser();
  const [redeemLoyalty, setRedeemLoyalty] = useState(false);
  const getErrorMessage = (
    name: keyof AppointmentFormData,
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

  const effectiveSalonSettings = (salonSettings ??
    salon?.settings) as SalonSettingsLike | undefined;
  const loyaltySettings = effectiveSalonSettings;
  const loyaltyEnabled = !!loyaltySettings?.loyaltyEnabled;
  const loyaltyRewardServiceId = loyaltySettings?.loyaltyRewardServiceId || "";
  const loyaltyMinimumRedemption = Number(
    loyaltySettings?.loyaltyMinimumRedemption || 0,
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
  const canRedeemLoyalty = isAdmin || isSuperadmin;

  // Safe arrays
  const safeClients = useMemo(
    () => (Array.isArray(clients) ? clients : []),
    [clients],
  );
  const regularClients = useMemo(
    () => safeClients.filter((client) => !isWalkInClient(client)),
    [safeClients],
  );
  const safeServices = useMemo(
    () => (Array.isArray(services) ? services : []),
    [services],
  );

  const { reset, watch } = form;
  const selectedClientId = watch("clientId");

  const selectableClients = useMemo(() => {
    if (!selectedClientId) return regularClients;
    const selectedClient = safeClients.find(
      (client) => client.id === selectedClientId,
    );
    if (selectedClient && isWalkInClient(selectedClient)) {
      return [selectedClient, ...regularClients];
    }
    return regularClients;
  }, [regularClients, safeClients, selectedClientId]);

  // Selected service for display
  const selectedServiceId = watch("serviceId");
  const priceOverrideEnabled = watch("priceOverrideEnabled");
  const customPriceInput = watch("price");
  const discountInput = watch("discount");
  const walkInEmail = watch("walkInEmail");
  const selectedDate = watch("date") || getLocalDateString();
  const selectedStartTime = watch("startTime");
  const selectedService = useMemo(
    () => safeServices.find((s) => s.id === selectedServiceId) || null,
    [safeServices, selectedServiceId],
  );

  const bookingSlotMinutes = Number(
    effectiveSalonSettings?.bookingSlotDuration || DEFAULT_SLOT_MINUTES,
  );
  const workingHoursForDate = useMemo(
    () => getWorkingHoursForDate(effectiveSalonSettings, selectedDate),
    [effectiveSalonSettings, selectedDate],
  );
  const { slots: availableSlots, blocked: blockedSlots } = useMemo(() => {
    if (!workingHoursForDate.isOpen) {
      return { slots: [] as string[], blocked: new Set<string>() };
    }
    return buildTimeSlotsForHours({
      openTime: workingHoursForDate.openTime,
      closeTime: workingHoursForDate.closeTime,
      slotMinutes: bookingSlotMinutes,
      breakStart: workingHoursForDate.breakStart || undefined,
      breakEnd: workingHoursForDate.breakEnd || undefined,
    });
  }, [
    workingHoursForDate.isOpen,
    workingHoursForDate.openTime,
    workingHoursForDate.closeTime,
    workingHoursForDate.breakStart,
    workingHoursForDate.breakEnd,
    bookingSlotMinutes,
  ]);
  const isClosedDay = !workingHoursForDate.isOpen;

  const conflict = useMemo(() => {
    if (!selectedDate || !selectedStartTime) return null;
    const durationMinutes = selectedService?.duration || bookingSlotMinutes;
    const endTime = addMinutesToTime(selectedStartTime, durationMinutes);
    return findConflictingAppointment(appointments, {
      date: selectedDate,
      startTime: selectedStartTime,
      endTime,
      excludeId: derived?.isCreateMode ? null : selectedAppointment?.id,
    });
  }, [
    appointments,
    selectedDate,
    selectedStartTime,
    selectedService?.duration,
    bookingSlotMinutes,
    derived?.isCreateMode,
    selectedAppointment?.id,
  ]);

  const walkInEnabled = watch("walkInEnabled");
  const normalizedWalkInEmail = (walkInEmail || "").trim().toLowerCase();
  const emailConflict = useMemo(() => {
    if (!walkInEnabled || !normalizedWalkInEmail) return null;
    return (
      regularClients.find(
        (client) =>
          (client.email || "").toLowerCase() === normalizedWalkInEmail,
      ) || null
    );
  }, [walkInEnabled, normalizedWalkInEmail, regularClients]);

  useEffect(() => {
    if (!walkInEnabled) {
      if (
        form.formState.errors.walkInEmail?.message === "agenda.walkInEmailExists"
      ) {
        form.clearErrors("walkInEmail");
      }
      return;
    }
    if (emailConflict) {
      form.setError("walkInEmail", {
        type: "custom",
        message: "agenda.walkInEmailExists",
      });
    } else if (
      form.formState.errors.walkInEmail?.message === "agenda.walkInEmailExists"
    ) {
      form.clearErrors("walkInEmail");
    }
  }, [
    emailConflict,
    walkInEnabled,
    form,
    form.formState.errors.walkInEmail?.message,
  ]);

  // Reset form when modal state changes
  useEffect(() => {
    if (!modalState) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRedeemLoyalty(false);

    if (derived?.isCreateMode) {
      reset({
        clientId: "",
        serviceId: "",
        date: modalState?.prefillDate || getLocalDateString(),
        startTime: modalState?.prefillTime || "09:00",
        notes: "",
        walkInEnabled: false,
        walkInName: "",
        walkInPhone: "",
        walkInEmail: "",
        price: "",
        discount: "",
        priceOverrideEnabled: false,
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
        price: "",
        discount: "",
        priceOverrideEnabled: false,
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
    if (data.walkInEnabled && emailConflict) {
      form.setError("walkInEmail", {
        type: "custom",
        message: "agenda.walkInEmailExists",
      });
      return;
    }
    const normalizedWalkInPhone = normalizePhone(data.walkInPhone);
    onSubmit({
      ...data,
      walkInPhone: normalizedWalkInPhone || data.walkInPhone,
    });
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
        <DialogContent className="sm:max-w-4xl w-full overflow-x-hidden">
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
                  loyaltyEnabled &&
                  canRedeemLoyalty && (
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
                          selectedAppointment.service,
                        )}
                        className="h-10 w-10 rounded-md object-cover"
                        loading="lazy"
                        onError={(event) => {
                          const fallback = getServiceImageFallback(
                            selectedAppointment.service!,
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
                        0,
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
            {selectedAppointment &&
              onCreateSale &&
              !selectedAppointment.paid &&
              selectedAppointment.status !== "cancelled" && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() =>
                      onCreateSale(selectedAppointment, {
                        redeemLoyalty:
                          selectedAppointment.status === "completed" &&
                          canRedeemLoyalty
                            ? redeemLoyalty
                            : false,
                      })
                    }
                    disabled={isPending || isCreatingSale}
                  >
                    <DollarSign className="h-4 w-4 me-2" />
                    {isCreatingSale
                      ? t("common.loading")
                      : selectedAppointment.status === "completed"
                      ? t("agenda.recordPayment")
                      : t("agenda.completeAndPay")}
                  </Button>
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
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder={t("agenda.selectClient")} />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                    {selectableClients.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground text-sm">
                        {t("clients.noClients")}
                      </div>
                    ) : (
                      selectableClients.map((client) => (
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
                    <Label>{t("agenda.walkInPhone")} *</Label>
                    <Input
                      {...form.register("walkInPhone", {
                        setValueAs: sanitizePhoneInput,
                        onChange: (event) => {
                          const sanitized = sanitizePhoneInput(
                            event.target.value,
                          );
                          if (sanitized !== event.target.value) {
                            event.target.value = sanitized;
                          }
                        },
                        onBlur: (event) => {
                          const normalized = normalizePhone(
                            event.target.value,
                          );
                          form.setValue("walkInPhone", normalized, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        },
                      })}
                      placeholder={t("fields.placeholders.phone")}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      pattern="\\+?\\d*"
                    />
                    <FormErrorMessage message={getErrorMessage("walkInPhone")} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("agenda.walkInEmail")}</Label>
                    <Input
                      {...form.register("walkInEmail")}
                      placeholder={t("agenda.walkInEmailPlaceholder")}
                    />
                    <FormErrorMessage message={getErrorMessage("walkInEmail")} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t("fields.service")} *</Label>
                <Select
                  value={form.watch("serviceId")}
                  onValueChange={(value) => form.setValue("serviceId", value)}
                >
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder={t("agenda.selectService")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black">
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
                              {service.duration}min
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

              <div className="space-y-2">
                <Label>{t("fields.price")}</Label>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">
                      {t("agenda.adjustPrice")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("agenda.adjustPriceDescription")}
                    </p>
                  </div>
                  <Switch
                    checked={!!priceOverrideEnabled}
                    onCheckedChange={(value) => {
                      form.setValue("priceOverrideEnabled", value);
                      if (!value) {
                        form.setValue("price", "");
                        form.setValue("discount", "");
                      }
                    }}
                    disabled={!selectedService}
                  />
                </div>
              </div>

              {priceOverrideEnabled && (
                <div className="space-y-3">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t("fields.price")}</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...form.register("price")}
                        placeholder={t("fields.price")}
                      />
                      <FormErrorMessage message={getErrorMessage("price")} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("sales.discount")}</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...form.register("discount")}
                        placeholder={t("sales.discount")}
                      />
                      <FormErrorMessage message={getErrorMessage("discount")} />
                    </div>
                  </div>
                  {(() => {
                    const trimmedPrice = customPriceInput?.toString().trim();
                    const trimmedDiscount =
                      discountInput?.toString().trim();
                    const parsedPriceValue = trimmedPrice
                      ? Number(trimmedPrice)
                      : undefined;
                    const parsedPrice = Number.isFinite(parsedPriceValue)
                      ? parsedPriceValue
                      : undefined;
                    const parsedDiscountValue = trimmedDiscount
                      ? Number(trimmedDiscount)
                      : undefined;
                    const parsedDiscount = Number.isFinite(parsedDiscountValue)
                      ? parsedDiscountValue
                      : undefined;
                    const basePrice =
                      parsedPrice ??
                      (parsedDiscount !== undefined
                        ? selectedService?.price
                        : undefined);
                    if (basePrice === undefined) return null;
                    const finalPrice = Math.max(
                      0,
                      basePrice - (parsedDiscount ?? 0),
                    );
                    return (
                      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                        <span className="text-muted-foreground">
                          {t("fields.total")}
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(finalPrice)}
                        </span>
                      </div>
                    );
                  })()}
                </div>
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
                    disabled={isClosedDay || availableSlots.length === 0}
                  >
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black">
                      {availableSlots.length === 0 ? (
                        <div className="p-2 text-center text-muted-foreground text-sm">
                          {t("common.noResults")}
                        </div>
                      ) : (
                        availableSlots.map((time) => {
                          const isBlocked = blockedSlots.has(time);
                          return (
                            <SelectItem
                              key={time}
                              value={time}
                              disabled={isBlocked}
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {time}
                                {isBlocked && (
                                  <span className="text-xs text-muted-foreground">
                                    ({t("agenda.breakTime")})
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isClosedDay && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {t("agenda.closedDay")}
                </div>
              )}

              {conflict && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <p className="font-medium">{t("agenda.timeSlotOccupied")}</p>
                  <p className="text-xs">
                    {t("agenda.timeSlotOccupiedDetails", {
                      client: conflict.client
                        ? `${conflict.client.firstName} ${conflict.client.lastName}`
                        : t("common.unknown"),
                      start: conflict.startTime,
                      end: conflict.endTime,
                    })}
                  </p>
                </div>
              )}

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
