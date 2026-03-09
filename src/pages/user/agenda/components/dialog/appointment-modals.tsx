import { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  User,
  Scissors,
  Clock,
  Calendar,
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
import { PhoneNumberInput } from "@/components/ui/phone-input";
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
  User as StaffUser,
} from "@/types/entities";
import { AppointmentStatus } from "@/types/entities";
import type { AppointmentFormData } from "../validation";
import type { AppointmentModalState } from "../../types";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import {
  statusColors,
  canRecordAppointmentPayment,
  getAppointmentDisplayStatus,
  getLocalDateString,
  getWorkingHoursForDate,
  buildTimeSlotsForHours,
  DEFAULT_SLOT_MINUTES,
  addMinutesToTime,
  timeToMinutes,
  findConflictingAppointment,
} from "../utils";
import { getValidationErrorMessage } from "@/pages/user/utils";
import { FormErrorMessage } from "@/pages/user/components/form-error-message";
import { normalizePhone } from "@/common/phone";
import {
  getServiceImage,
  getServiceImageFallback,
  translateServiceName,
} from "@/common/service-translations";

const isWalkInClient = (client: Client) =>
  (client.email || "").toLowerCase().startsWith("walkin+");

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const getPersonLabel = (person?: unknown): string | undefined => {
  if (!person) return undefined;
  if (typeof person === "string") {
    const trimmed = person.trim();
    return trimmed ? trimmed : undefined;
  }
  if (typeof person === "number") {
    return Number.isFinite(person) ? String(person) : undefined;
  }
  if (typeof person !== "object") return undefined;

  const data = person as Record<string, unknown>;
  const firstName = typeof data.firstName === "string" ? data.firstName : "";
  const lastName = typeof data.lastName === "string" ? data.lastName : "";
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName) return fullName;

  const directName = typeof data.name === "string" ? data.name.trim() : "";
  if (directName) return directName;

  const fullNameField =
    typeof data.fullName === "string" ? data.fullName.trim() : "";
  if (fullNameField) return fullNameField;

  const email = typeof data.email === "string" ? data.email.trim() : "";
  if (email) return email;

  const username =
    typeof data.username === "string" ? data.username.trim() : "";
  if (username) return username;

  if (data.user) return getPersonLabel(data.user);
  if (data.profile) return getPersonLabel(data.profile);

  return undefined;
};

const getStringLabel = (value?: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

type SalonSettingsLike = SalonSettings & Partial<SalonSettingsExtended>;

interface AppointmentModalsProps {
  modalState: AppointmentModalState;
  setModalState: (state: AppointmentModalState) => void;
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  staffMembers?: StaffUser[];
  selectedStaffId?: string | null;
  salonSettings?: SalonSettingsLike;
  form: UseFormReturn<AppointmentFormData>;
  onSubmit: (data: AppointmentFormData) => void;
  onDelete: () => void;
  onCreateSale?: (
    appointment: Appointment,
    options?: { redeemLoyalty?: boolean },
  ) => void;
  onUpdateStatus?: (appointment: Appointment, status: AppointmentStatus) => void;
  isCreatingSale?: boolean;
  isUpdatingStatus?: boolean;
  isReferenceDataLoading?: boolean;
  isPending: boolean;
}

export function AppointmentModals({
  modalState,
  setModalState,
  appointments,
  clients,
  services,
  staffMembers = [],
  selectedStaffId,
  salonSettings,
  form,
  onSubmit,
  onDelete,
  onCreateSale,
  onUpdateStatus,
  isCreatingSale = false,
  isUpdatingStatus = false,
  isReferenceDataLoading = false,
  isPending,
}: AppointmentModalsProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { user, salon, isAdmin, isSuperadmin } = useUser();
  const canViewPayment = isAdmin || isSuperadmin;
  const [redeemLoyalty, setRedeemLoyalty] = useState(false);
  const modalKey = modalState
    ? `${modalState.appointmentId}-${modalState.mode}-${modalState.nonce ?? 0}`
    : "";
  const [initializedModalKey, setInitializedModalKey] = useState<string | null>(
    null,
  );
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
  const allServices = useMemo(
    () => (Array.isArray(services) ? services : []),
    [services],
  );

  const canAssignStaff = isAdmin || isSuperadmin;
  const staffOptions = useMemo(() => {
    const options: Array<{ id: string; label: string }> = [];
    if (user?.id) {
      const label =
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.name ||
        user.email ||
        "Me";
      options.push({ id: user.id, label });
    }
    const deduped = new Set(options.map((option) => option.id));
    staffMembers.forEach((staff) => {
      if (deduped.has(staff.id)) return;
      const label =
        `${staff.firstName || ""} ${staff.lastName || ""}`.trim() ||
        staff.name ||
        staff.email ||
        "Staff";
      options.push({ id: staff.id, label });
      deduped.add(staff.id);
    });
    return options;
  }, [staffMembers, user]);

  const staffLookup = useMemo(() => {
    const map = new Map<string, StaffUser>();
    if (user?.id) {
      map.set(user.id, user as StaffUser);
    }
    staffMembers.forEach((staff) => {
      map.set(staff.id, staff);
    });
    return map;
  }, [staffMembers, user]);

  const { reset, watch } = form;
  const selectedStaff = watch("staffId");
  const selectedClientId = watch("clientId");
  const walkInEnabled = watch("walkInEnabled");
  const walkInIsMarried = watch("walkInIsMarried");
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
  const todayStr = getLocalDateString();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isPastDate = selectedDate < todayStr;
  const isToday = selectedDate === todayStr;
  const isSelectedAppointmentPast = useMemo(() => {
    if (!selectedAppointment) return false;

    const appointmentEndTime =
      selectedAppointment.endTime || selectedAppointment.startTime;
    const appointmentEndMinutes = timeToMinutes(appointmentEndTime);

    return (
      selectedAppointment.date < todayStr ||
      (selectedAppointment.date === todayStr &&
        appointmentEndMinutes < currentMinutes)
    );
  }, [selectedAppointment, todayStr, currentMinutes]);
  const forceViewMode =
    !!selectedAppointment && isSelectedAppointmentPast && !derived?.isCreateMode;
  const visibleServices = useMemo(() => allServices, [allServices]);
  const selectedService = useMemo(
    () => allServices.find((service) => service.id === selectedServiceId) || null,
    [allServices, selectedServiceId],
  );
  const selectedServiceBasePrice = useMemo(
    () => toNumber(selectedService?.price),
    [selectedService?.price],
  );
  const serviceLookup = useMemo(
    () => new Map(allServices.map((service) => [service.id, service])),
    [allServices],
  );
  const selectedPackServices = useMemo(() => {
    if (!selectedService?.isPack) return [];
    const packIds = selectedService.packServiceIds ?? [];
    return packIds
      .map((id) => serviceLookup.get(id))
      .filter((service): service is Service => Boolean(service));
  }, [selectedService, serviceLookup]);
  const packRegularPrice = useMemo(
    () =>
      selectedPackServices.reduce(
        (sum, service) => sum + toNumber(service.price),
        0,
      ),
    [selectedPackServices],
  );
  const packRegularDuration = useMemo(
    () =>
      selectedPackServices.reduce(
        (sum, service) => sum + (Number(service.duration) || 0),
        0,
      ),
    [selectedPackServices],
  );
  const packSavings = Math.max(0, packRegularPrice - selectedServiceBasePrice);
  const priceOverridePreview = useMemo(() => {
    if (!selectedService) return null;
    const trimmedPrice = customPriceInput?.toString().trim();
    const trimmedDiscount = discountInput?.toString().trim();
    const parsedPriceValue = trimmedPrice ? Number(trimmedPrice) : undefined;
    const parsedPrice = Number.isFinite(parsedPriceValue)
      ? parsedPriceValue
      : undefined;
    const parsedDiscountValue = trimmedDiscount
      ? Number(trimmedDiscount)
      : undefined;
    const parsedDiscount = Number.isFinite(parsedDiscountValue)
      ? parsedDiscountValue
      : undefined;

    if (parsedPrice === undefined && parsedDiscount === undefined) {
      return {
        basePrice: selectedServiceBasePrice,
        finalPrice: selectedServiceBasePrice,
        hasOverrideInput: false,
      };
    }

    const basePrice = parsedPrice ?? selectedServiceBasePrice;
    const finalPrice = Math.max(0, basePrice - (parsedDiscount ?? 0));

    return {
      basePrice,
      finalPrice,
      hasOverrideInput: true,
    };
  }, [
    selectedService,
    selectedServiceBasePrice,
    customPriceInput,
    discountInput,
  ]);
  const displayServicePrice =
    priceOverrideEnabled && priceOverridePreview
      ? priceOverridePreview.finalPrice
      : selectedServiceBasePrice;

  const bookingSlotMinutes = DEFAULT_SLOT_MINUTES;
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
    if (!derived?.isEditMode) return null;
    if (initializedModalKey !== modalKey) return null;
    if (!selectedDate || !selectedStartTime) return null;
    const durationMinutes = selectedService?.duration || bookingSlotMinutes;
    const endTime = addMinutesToTime(selectedStartTime, durationMinutes);
    return findConflictingAppointment(appointments, {
      date: selectedDate,
      startTime: selectedStartTime,
      endTime,
      excludeId: derived?.isCreateMode ? null : selectedAppointment?.id,
      staffId: selectedStaff || selectedStaffId || user?.id || undefined,
    });
  }, [
    appointments,
    selectedDate,
    selectedStartTime,
    selectedService?.duration,
    bookingSlotMinutes,
    derived?.isCreateMode,
    derived?.isEditMode,
    selectedAppointment?.id,
    selectedStaff,
    selectedStaffId,
    user?.id,
    initializedModalKey,
    modalKey,
  ]);

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
    if (!modalState) {
      setInitializedModalKey(null);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRedeemLoyalty(false);

    if (derived?.isCreateMode) {
      reset({
        clientId: "",
        serviceId: "",
        date: modalState?.prefillDate || getLocalDateString(),
        startTime: modalState?.prefillTime || "09:00",
        notes: "",
        staffId: modalState?.prefillStaffId || selectedStaffId || user?.id || "",
        walkInEnabled: false,
        walkInName: "",
        walkInPhone: "",
        walkInEmail: "",
        walkInIsMarried: false,
        price: "",
        discount: "",
        priceOverrideEnabled: false,
      });
      setInitializedModalKey(modalKey);
    } else if (selectedAppointment && derived?.isEditMode) {
      reset({
        clientId: selectedAppointment.clientId,
        serviceId: selectedAppointment.serviceId,
        date: selectedAppointment.date,
        startTime: selectedAppointment.startTime,
        notes: selectedAppointment.notes || "",
        staffId: selectedAppointment.staffId || selectedStaffId || user?.id || "",
        walkInEnabled: false,
        walkInName: "",
        walkInPhone: "",
        walkInEmail: "",
        walkInIsMarried: false,
        price: "",
        discount: "",
        priceOverrideEnabled: false,
      });
      setInitializedModalKey(modalKey);
    } else {
      setInitializedModalKey(modalKey);
    }
  }, [
    modalState,
    selectedAppointment,
    derived?.isCreateMode,
    derived?.isEditMode,
    reset,
    selectedStaffId,
    user?.id,
    modalKey,
  ]);

  if (!derived) return null;

  const handleClose = () => setModalState(null);

  const handleFormSubmit = (data: AppointmentFormData) => {
    if (isReferenceDataLoading) {
      return;
    }
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
    handleClose();
  };

  // DELETE MODE
  if (derived.isDeleteMode && !forceViewMode) {
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
  if (derived.isViewMode || forceViewMode) {
    const appointmentPrice = toNumber(
      selectedAppointment?.price ??
        selectedAppointment?.customPrice ??
        selectedAppointment?.basePrice ??
        selectedAppointment?.service?.price,
    );
    const appointmentPackServices =
      selectedAppointment?.service?.isPack && serviceLookup.size
        ? (selectedAppointment?.service?.packServiceIds ?? [])
            .map((id) => serviceLookup.get(id))
            .filter((service): service is Service => Boolean(service))
        : [];
    const appointmentPackValue = appointmentPackServices.reduce(
      (sum, service) => sum + toNumber(service.price),
      0,
    );
    const appointmentPackSavings = Math.max(
      0,
      appointmentPackValue - appointmentPrice,
    );
    const bookedByLabel = (() => {
      if (!selectedAppointment) return t("common.unknown");
      const appointmentMeta = selectedAppointment as Appointment &
        Record<string, unknown>;

      const resolveById = (value?: unknown) => {
        if (typeof value !== "string") return undefined;
        return getPersonLabel(staffLookup.get(value));
      };

      const resolvePerson = (value?: unknown) => {
        const direct = getPersonLabel(value);
        if (direct) return direct;
        if (value && typeof value === "object") {
          const maybeId = (value as Record<string, unknown>).id;
          const resolved = resolveById(maybeId);
          if (resolved) return resolved;
        }
        return undefined;
      };

      const label =
        resolvePerson(appointmentMeta.createdBy) ||
        resolvePerson(appointmentMeta.createdByUser) ||
        resolvePerson(appointmentMeta.bookedBy) ||
        resolvePerson(appointmentMeta.bookedByUser) ||
        resolvePerson(appointmentMeta.creator) ||
        resolvePerson(appointmentMeta.user) ||
        getStringLabel(appointmentMeta.createdByName) ||
        getStringLabel(appointmentMeta.createdByFullName) ||
        getStringLabel(appointmentMeta.createdByEmail) ||
        getStringLabel(appointmentMeta.bookedByName) ||
        getStringLabel(appointmentMeta.bookedByFullName) ||
        getStringLabel(appointmentMeta.bookedByEmail) ||
        getStringLabel(appointmentMeta.creatorName) ||
        getStringLabel(appointmentMeta.creatorEmail) ||
        getStringLabel(appointmentMeta.userName) ||
        getStringLabel(appointmentMeta.userEmail) ||
        resolveById(appointmentMeta.createdById) ||
        resolveById(appointmentMeta.createdByUserId) ||
        resolveById(appointmentMeta.bookedById) ||
        resolveById(appointmentMeta.bookedByUserId) ||
        resolveById(appointmentMeta.creatorId) ||
        resolveById(appointmentMeta.userId) ||
        resolvePerson(selectedAppointment.staff) ||
        resolveById(selectedAppointment.staffId);

      return label || t("common.unknown");
    })();
    const displayStatus = selectedAppointment
      ? getAppointmentDisplayStatus(selectedAppointment)
      : null;
    const canManageSelectedAppointment =
      !!selectedAppointment &&
      !!user?.id &&
      (selectedAppointment.staffId === user.id || isAdmin || isSuperadmin);
    const canCompleteOverdueAppointment =
      canManageSelectedAppointment &&
      displayStatus === AppointmentStatus.OVERDUE;
    const canUpdateStatus =
      !!selectedAppointment &&
      canManageSelectedAppointment &&
      (!isSelectedAppointmentPast || canCompleteOverdueAppointment);
    const canMarkInProgress =
      displayStatus !== AppointmentStatus.OVERDUE &&
      (selectedAppointment?.status === AppointmentStatus.PENDING ||
        selectedAppointment?.status === AppointmentStatus.CONFIRMED);
    const canMarkFinished =
      selectedAppointment?.status === AppointmentStatus.IN_PROGRESS ||
      canCompleteOverdueAppointment;
    const canRecordSelectedAppointmentPayment =
      !!selectedAppointment &&
      !!onCreateSale &&
      canViewPayment &&
      canRecordAppointmentPayment(selectedAppointment);
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
                <Badge
                  variant={
                    statusColors[displayStatus ?? selectedAppointment.status]
                  }
                >
                  {t(
                    `agenda.statuses.${displayStatus ?? selectedAppointment.status}`,
                    {
                      defaultValue: displayStatus ?? selectedAppointment.status,
                    },
                  )}
                </Badge>
              </div>

                <div className="grid gap-4">
                  {canViewPayment && (
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
                  )}
                {canRecordSelectedAppointmentPayment &&
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
                    {formatCurrency(appointmentPrice)}
                  </p>
                </div>
                {selectedAppointment.service?.isPack &&
                  appointmentPackServices.length > 0 && (
                    <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                      <div>
                        {t("services.packIncludes")}:{" "}
                        {appointmentPackServices
                          .map((service) => translateServiceName(t, service))
                          .join(", ")}
                      </div>
                      <div>
                        {t("services.packValue")}:{" "}
                        {formatCurrency(appointmentPackValue)} |{" "}
                        {t("services.packSavings")}:{" "}
                        {formatCurrency(appointmentPackSavings)}
                      </div>
                    </div>
                  )}

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("agenda.bookedBy")}
                    </p>
                    <p className="font-medium">{bookedByLabel}</p>
                  </div>
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
              onUpdateStatus &&
              canUpdateStatus &&
              selectedAppointment.status !== AppointmentStatus.CANCELLED && (
                <div className="flex gap-2 w-full sm:w-auto">
                  {canMarkInProgress && (
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() =>
                        onUpdateStatus(
                          selectedAppointment,
                          AppointmentStatus.IN_PROGRESS,
                        )
                      }
                      disabled={isPending || isUpdatingStatus}
                    >
                      {isUpdatingStatus
                        ? t("common.loading")
                        : t("agenda.markInProgress")}
                    </Button>
                  )}
                  {canMarkFinished && (
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() =>
                        onUpdateStatus(
                          selectedAppointment,
                          AppointmentStatus.COMPLETED,
                        )
                      }
                      disabled={isPending || isUpdatingStatus}
                    >
                      {isUpdatingStatus
                        ? t("common.loading")
                        : t("agenda.markFinished")}
                    </Button>
                  )}
                </div>
              )}
            {selectedAppointment &&
              canRecordSelectedAppointmentPayment && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() =>
                      onCreateSale(selectedAppointment, {
                        redeemLoyalty: canRedeemLoyalty ? redeemLoyalty : false,
                      })
                    }
                    disabled={isPending || isCreatingSale}
                  >
                    <DollarSign className="h-4 w-4 me-2" />
                    {isCreatingSale
                      ? t("common.loading")
                      : t("agenda.recordPayment")}
                  </Button>
                </div>
              )}
            <div className="flex gap-2 w-full sm:w-auto sm:ms-auto">
              <Button variant="outline" onClick={handleClose}>
                {t("common.close")}
              </Button>
              {selectedAppointment && (
                <>
                  {!selectedAppointment.paid && !isSelectedAppointmentPast && (
                    <Button
                      variant="outline"
                      className="text-destructive"
                      onClick={() =>
                        setModalState({
                          appointmentId: selectedAppointment.id,
                          mode: "delete",
                          nonce: Date.now(),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 me-2" />
                      {t("common.delete")}
                    </Button>
                  )}
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
              {isReferenceDataLoading && (
                <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  {t("common.loading")}
                </div>
              )}
              {canAssignStaff && staffOptions.length > 0 && (
                <div className="space-y-2">
                  <Label>{t("fields.staff")} *</Label>
                  <Select
                    value={selectedStaff || ""}
                    onValueChange={(value) => form.setValue("staffId", value)}
                  >
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder={t("fields.staff")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      {staffOptions.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {staff.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormErrorMessage message={getErrorMessage("staffId")} />
                </div>
              )}
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
                  disabled={!!walkInEnabled || isReferenceDataLoading}
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
                    <Controller
                      name="walkInPhone"
                      control={form.control}
                      render={({ field }) => (
                        <PhoneNumberInput
                          id="walkInPhone"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      )}
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
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label>{t("fields.maritalStatus")}</Label>
                      <p className="text-xs text-muted-foreground">
                        {walkInIsMarried
                          ? t("fields.married")
                          : t("fields.single")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!walkInIsMarried}
                        onCheckedChange={(value) =>
                          form.setValue("walkInIsMarried", value)
                        }
                      />
                      <span className="text-sm">
                        {walkInIsMarried
                          ? t("fields.married")
                          : t("fields.single")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t("fields.service")} *</Label>
                <Select
                  value={form.watch("serviceId")}
                  onValueChange={(value) => form.setValue("serviceId", value)}
                  disabled={isReferenceDataLoading}
                >
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder={t("agenda.selectService")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black">
                    {visibleServices.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground text-sm">
                        {t("services.services")} - {t("common.noResults")}
                      </div>
                    ) : (
                      visibleServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <div className="flex items-center gap-2">
                              <Scissors className="h-4 w-4 text-accent-pink" />
                              {translateServiceName(t, service)}
                              {service.isPack && (
                                <Badge variant="info">
                                  {t("services.pack")}
                                </Badge>
                              )}
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
                      {formatCurrency(displayServicePrice)}
                    </p>
                  </div>
                  {selectedService.isPack && selectedPackServices.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <div>
                        {t("services.packIncludes")}:{" "}
                        {selectedPackServices
                          .map((service) => translateServiceName(t, service))
                          .join(", ")}
                      </div>
                      <div>
                        {t("services.packValue")}:{" "}
                        {formatCurrency(packRegularPrice)} |{" "}
                        {t("services.packSavings")}:{" "}
                        {formatCurrency(packSavings)}
                      </div>
                      {packRegularDuration > 0 && (
                        <div>
                          {t("services.packDuration")}: {packRegularDuration}{" "}
                          min
                        </div>
                      )}
                    </div>
                  )}
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
                  {priceOverridePreview?.hasOverrideInput && (
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                      <span className="text-muted-foreground">
                        {t("fields.total")}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(priceOverridePreview.finalPrice)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">{t("fields.date")} *</Label>
                  <Input
                    id="date"
                    type="date"
                    min={todayStr}
                    {...form.register("date")}
                  />
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
                          const slotMinutesValue = timeToMinutes(time);
                          const isPastSlot =
                            isPastDate ||
                            (isToday && slotMinutesValue < currentMinutes);
                          const isDisabled = isBlocked || isPastSlot;
                          return (
                            <SelectItem
                              key={time}
                              value={time}
                              disabled={isDisabled}
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
              <Button type="submit" disabled={isPending || isReferenceDataLoading}>
                {isPending || isReferenceDataLoading
                  ? t("common.loading")
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
