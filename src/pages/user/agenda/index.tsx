import { useState, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Calendar, List } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { LoadingPanel } from "@/components/loading-panel";
/* cSpell:ignore Superadmin walkin */
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import { useGet, withParams } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useForm } from "@/hooks/useForm";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { normalizePhone } from "@/common/phone";
import { buildUrl, get } from "@/lib/http";

import type {
  Appointment,
  Client,
  Service,
  PaginatedResponse,
  Sale,
  Salon,
  SalonSettings,
  SalonSettingsExtended,
  User,
} from "@/types";
import { AppointmentStatus } from "@/types/entities";
import type { AppointmentModalState } from "./types";
import { appointmentFormSchema, type AppointmentFormData } from "./validation";
import type { CalendarEvent } from "./utils";
import {
  ALL_STAFF_ID,
  buildStaffOptions,
  getAppointmentMatchKey,
  safeExtractArray,
  getLocalDateString,
  isAppointmentOverdue,
  isOptimisticAppointmentId,
  mergeAppointments,
  timeToDate,
  getWorkingHoursForDate,
  buildTimeSlotsForHours,
  DEFAULT_SLOT_MINUTES,
  addMinutesToTime,
  normalizeTime,
  timeToMinutes,
  findConflictingAppointment,
} from "./utils";

import {
  requestNotificationPermission,
  scheduleReminder,
  cancelAllReminders,
  showNotification,
  type AppointmentReminder,
} from "@/lib/notifications";
import { CalendarToolbar } from "./components/dialog/calendar-toolbar";
import { TimelineView } from "./components/timeline-view";
import { MonthlySummaryView } from "./components/monthly-summary-view";
import { AppointmentModals } from "./components/dialog/appointment-modals";
import { translateServiceName } from "@/common/service-translations";

export function AgendaPage() {
  const { t } = useTranslation();
  const { user, isAdmin, isSuperadmin } = useUser();
  const { formatCurrency } = useLanguage();
  const queryClient = useQueryClient();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [modalState, setModalState] = useState<AppointmentModalState>(null);
  const [filter, setFilter] = useState<
    "all" | "today" | "unpaid" | "overdue" | "completed"
  >("all");
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "month">("day");
  const salonId = user?.salon?.id;
  const canSelectStaff = isAdmin || isSuperadmin;
  const selectedStaffIdValue = useMemo(() => {
    const baseId =
      viewMode === "day" && selectedStaffId === ALL_STAFF_ID
        ? null
        : selectedStaffId;
    if (canSelectStaff && viewMode === "month") {
      if (!baseId || baseId === user?.id) return ALL_STAFF_ID;
      return baseId;
    }
    return baseId ?? user?.id ?? null;
  }, [selectedStaffId, viewMode, canSelectStaff, user?.id]);
  const staffFilterId =
    selectedStaffIdValue === ALL_STAFF_ID ? null : selectedStaffIdValue;
  const appointmentsStaleTime = 1000 * 30; // 30s for near real-time
  const clientsStaleTime = 1000 * 60 * 10; // 10m
  const servicesStaleTime = 1000 * 60 * 10; // 10m
  const appointmentsParams = useMemo(
    () => ({ salonId, perPage: 100, staffId: staffFilterId || undefined }),
    [salonId, staffFilterId],
  );
  const appointmentsQueryKey = useMemo(
    () => ["appointments", appointmentsParams].filter(Boolean),
    [appointmentsParams],
  );

  const {
    data: appointmentsData,
    isLoading,
    refetch,
  } = useGet<PaginatedResponse<Appointment>>(
    withParams("appointments", appointmentsParams),
    {
      enabled: !!salonId && (viewMode === "month" || !!staffFilterId),
      staleTime: appointmentsStaleTime,
    },
  );

  const { data: clientsData } = useGet<PaginatedResponse<Client>>(
    withParams("clients", { salonId, perPage: 100 }),
    { enabled: !!salonId, staleTime: clientsStaleTime },
  );

  const { data: salonData } = useGet<Salon>(
    `salons/${salonId}`,
    { enabled: !!salonId, staleTime: 1000 * 60 * 2, refetchOnWindowFocus: true },
  );

  const { data: servicesData } = useGet<PaginatedResponse<Service>>(
    withParams("services", { salonId, perPage: 100 }),
    { enabled: !!salonId, staleTime: servicesStaleTime },
  );

  const { data: staffResponse } = useGet<PaginatedResponse<User>>(
    withParams("users", { salonId, role: "user", perPage: 100 }),
    { enabled: !!salonId && canSelectStaff, staleTime: 1000 * 60 * 5 },
  );

  const [optimisticState, setOptimisticState] = useState(() => ({
    scopeKey: "",
    appointments: [] as Appointment[],
    deletedIds: new Set<string>(),
  }));
  const rawAppointments = safeExtractArray<Appointment>(appointmentsData);
  const optimisticScopeKey = useMemo(
    () => `${salonId ?? "no-salon"}|${selectedStaffIdValue ?? "no-staff"}`,
    [salonId, selectedStaffIdValue],
  );
  const scopedOptimistic =
    optimisticState.scopeKey === optimisticScopeKey
      ? optimisticState
      : {
          scopeKey: optimisticScopeKey,
          appointments: [] as Appointment[],
          deletedIds: new Set<string>(),
        };
  const appointments = useMemo(
    () =>
      mergeAppointments({
        current: scopedOptimistic.appointments,
        incoming: rawAppointments,
        deletedIds: scopedOptimistic.deletedIds,
        isOptimisticId: isOptimisticAppointmentId,
        getMatchKey: getAppointmentMatchKey,
      }),
    [rawAppointments, scopedOptimistic],
  );
  const clients = safeExtractArray<Client>(clientsData);
  const services = safeExtractArray<Service>(servicesData);
  const staffMembers = safeExtractArray<User>(staffResponse);
  const staffOptions = useMemo(() => {
    return buildStaffOptions({
      user,
      staffMembers,
      includeAll: canSelectStaff && viewMode === "month",
      allStaffId: ALL_STAFF_ID,
      allLabel: t("common.all"),
    });
  }, [staffMembers, user, canSelectStaff, viewMode, t]);
  type SalonSettingsLike = SalonSettings & Partial<SalonSettingsExtended>;
  const salonSettings = (salonData?.settings ?? user?.salon?.settings) as
    | SalonSettingsLike
    | undefined;
  const bookingSlotMinutes = Number(
    salonSettings?.bookingSlotDuration || DEFAULT_SLOT_MINUTES,
  );
  const workingHoursForSelectedDate = useMemo(
    () => getWorkingHoursForDate(salonSettings, selectedDate),
    [salonSettings, selectedDate],
  );
  const timelineSlots = useMemo(() => {
    if (!workingHoursForSelectedDate.isOpen) {
      return { slots: [] as string[], blocked: new Set<string>() };
    }
    return buildTimeSlotsForHours({
      openTime: workingHoursForSelectedDate.openTime,
      closeTime: workingHoursForSelectedDate.closeTime,
      slotMinutes: bookingSlotMinutes,
      breakStart: workingHoursForSelectedDate.breakStart || undefined,
      breakEnd: workingHoursForSelectedDate.breakEnd || undefined,
    });
  }, [workingHoursForSelectedDate, bookingSlotMinutes]);

  const form = useForm<AppointmentFormData>({
    schema: appointmentFormSchema,
    defaultValues: {
      clientId: "",
      serviceId: "",
      date: getLocalDateString(),
      startTime: "09:00",
      notes: "",
      staffId: "",
      walkInEnabled: false,
      walkInName: "",
      walkInPhone: "",
      walkInEmail: "",
      walkInIsMarried: false,
      price: "",
      discount: "",
      priceOverrideEnabled: false,
    },
  });

  // Derived states
  const selectedAppointment = useMemo(() => {
    if (!modalState || modalState.appointmentId === "create") return null;
    return appointments.find((a) => a.id === modalState.appointmentId) || null;
  }, [modalState, appointments]);

  const isCreateMode = useMemo(
    () => modalState?.appointmentId === "create",
    [modalState],
  );

  const confirmedCount = useMemo(
    () =>
      appointments.filter((a) => a.status === AppointmentStatus.CONFIRMED)
        .length,
    [appointments],
  );

  const pendingCount = useMemo(
    () =>
      appointments.filter((a) => a.status === AppointmentStatus.PENDING).length,
    [appointments],
  );

  useEffect(() => {
    requestNotificationPermission().then(setNotificationsEnabled);
  }, []);

  const isOverdue = useCallback(
    (apt: Appointment) => isAppointmentOverdue(apt),
    [],
  );

  const unpaidAppointments = useMemo(
    () => appointments.filter((apt) => !apt.paid && apt.status !== "cancelled"),
    [appointments],
  );

  const today = useMemo(() => getLocalDateString(), []);
  const isSelectedDatePast = selectedDate < today;
  const selectedDateObj = useMemo(
    () => new Date(`${selectedDate}T00:00:00`),
    [selectedDate],
  );

  const todayAppointments = useMemo(
    () => appointments.filter((apt) => apt.date === today),
    [appointments, today],
  );

  const unpaidTodayAppointments = useMemo(
    () => unpaidAppointments.filter((apt) => apt.date === today),
    [unpaidAppointments, today],
  );

  const overdueAppointments = useMemo(
    () => unpaidAppointments.filter((apt) => isOverdue(apt)),
    [unpaidAppointments, isOverdue],
  );

  const unpaidTotalToday = useMemo(
    () =>
      unpaidTodayAppointments.reduce(
        (sum, apt) => sum + (apt.service?.price ?? apt.price ?? 0),
        0,
      ),
    [unpaidTodayAppointments],
  );

  const filteredAppointments = useMemo(() => {
    switch (filter) {
      case "today":
        return todayAppointments;
      case "unpaid":
        return unpaidAppointments;
      case "overdue":
        return overdueAppointments;
      case "completed":
        return appointments.filter((apt) => apt.status === "completed");
      case "all":
      default:
        return appointments;
    }
  }, [
    appointments,
    todayAppointments,
    unpaidAppointments,
    overdueAppointments,
    filter,
  ]);

  const upsertVisibleAppointment = useCallback(
    (nextAppointment: Appointment, options?: { prepend?: boolean }) => {
      setOptimisticState((prev) => {
        const base =
          prev.scopeKey === optimisticScopeKey
            ? prev
            : {
                scopeKey: optimisticScopeKey,
                appointments: [] as Appointment[],
                deletedIds: new Set<string>(),
              };
        const nextAppointments = [...base.appointments];
        const index = nextAppointments.findIndex(
          (appointment) => appointment.id === nextAppointment.id,
        );
        if (index === -1) {
          if (options?.prepend) {
            nextAppointments.unshift(nextAppointment);
          } else {
            nextAppointments.push(nextAppointment);
          }
        } else {
          nextAppointments[index] = nextAppointment;
        }
        const nextDeletedIds = new Set(base.deletedIds);
        nextDeletedIds.delete(nextAppointment.id);
        return {
          scopeKey: optimisticScopeKey,
          appointments: nextAppointments,
          deletedIds: nextDeletedIds,
        };
      });
    },
    [optimisticScopeKey],
  );

  const markAppointmentDeleted = useCallback((appointmentId: string) => {
    setOptimisticState((prev) => {
      const base =
        prev.scopeKey === optimisticScopeKey
          ? prev
          : {
              scopeKey: optimisticScopeKey,
              appointments: [] as Appointment[],
              deletedIds: new Set<string>(),
            };
      const nextAppointments = base.appointments.filter(
        (appointment) => appointment.id !== appointmentId,
      );
      const nextDeletedIds = new Set(base.deletedIds);
      nextDeletedIds.add(appointmentId);
      return {
        scopeKey: optimisticScopeKey,
        appointments: nextAppointments,
        deletedIds: nextDeletedIds,
      };
    });
  }, [optimisticScopeKey]);

  const handleReminder = useCallback(
    (reminder: AppointmentReminder) => {
      showNotification(`${t("agenda.reminderTitle")} - ${reminder.time}`, {
        body: `${reminder.clientName} - ${reminder.serviceName}`,
        playSound: true,
      });
      toast.info(
        `${t("agenda.upcomingAppointment")}: ${reminder.clientName} - ${
          reminder.serviceName
        } à ${reminder.time}`,
      );
    },
    [t],
  );

  useEffect(() => {
    if (
      !notificationsEnabled ||
      !Array.isArray(appointments) ||
      appointments.length === 0
    )
      return;

    const today = getLocalDateString();
    const todayAppointments = appointments.filter(
      (apt) =>
        apt.date === today &&
        apt.status !== "cancelled" &&
        apt.status !== "completed",
    );

    todayAppointments.forEach((apt) => {
      const reminder: AppointmentReminder = {
        id: `reminder-${apt.id}`,
        appointmentId: apt.id,
        clientName: apt.client
          ? `${apt.client.firstName} ${apt.client.lastName}`
          : "Client",
        serviceName: apt.service
          ? translateServiceName(t, apt.service)
          : "Service",
        time: apt.startTime,
        date: apt.date,
        reminderTime: new Date(),
      };
      scheduleReminder(reminder, 15, handleReminder);
    });

    return () => cancelAllReminders();
  }, [appointments, notificationsEnabled, handleReminder, t]);

  // Check for overdue unpaid appointments and notify
  useEffect(() => {
    if (!Array.isArray(appointments) || appointments.length === 0) return;

    const now = new Date();
    const today = getLocalDateString(now);
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    // Find overdue unpaid appointments (completed but not paid, or past end time and not paid)
    const overdueUnpaid = appointments.filter((apt) => {
      // Skip cancelled appointments
      if (apt.status === "cancelled") return false;

      // Already paid, no need to notify
      if (apt.paid) return false;

      // Check if appointment is in the past
      const isPastDate = apt.date < today;
      const isPastTime =
        apt.date === today && apt.endTime && apt.endTime < currentTime;
      const isOverdue = isPastDate || isPastTime;

      // Appointment is overdue and unpaid
      return isOverdue;
    });

    // Show notification for each overdue unpaid appointment (only once per session)
    overdueUnpaid.forEach((apt) => {
      const notificationKey = `overdue-notified-${apt.id}`;
      if (sessionStorage.getItem(notificationKey)) return;

      sessionStorage.setItem(notificationKey, "true");

      const clientName = apt.client
        ? `${apt.client.firstName} ${apt.client.lastName}`
        : t("common.client");
      const serviceName = apt.service
        ? translateServiceName(t, apt.service)
        : t("common.service");

      toast.warning(
        `${t("agenda.overdueUnpaid")}: ${clientName} - ${serviceName} (${
          apt.date
        } ${apt.startTime})`,
        { duration: 10000 },
      );

      if (notificationsEnabled) {
        showNotification(t("agenda.overdueUnpaidTitle"), {
          body: `${clientName} - ${serviceName} (${apt.date} ${apt.startTime})`,
          playSound: true,
        });
      }
    });
  }, [appointments, notificationsEnabled, t]);

  type AppointmentPayload = Omit<
    AppointmentFormData,
    "price" | "discount" | "priceOverrideEnabled"
  > & {
    customPrice?: number;
    discount?: number;
  };

  const { mutate: createAppointment, isPending: isCreating } = usePost<
    Appointment,
    AppointmentPayload
  >("appointments", {
    invalidate: ["appointments"],
    onSuccess: () => {
      toast.success(t("agenda.newAppointment") + " - " + t("common.success"));
      setModalState(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const { mutate: updateAppointment, isPending: isUpdating } = usePost<
    Appointment,
    AppointmentPayload
  >(`appointments/${selectedAppointment?.id}`, {
    method: "PATCH",
    invalidate: ["appointments"],
    onSuccess: () => {
      toast.success(t("common.edit") + " - " + t("common.success"));
      setModalState(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const { mutate: deleteAppointment, isPending: isDeleting } = usePost<
    void,
    string
  >(`appointments/${selectedAppointment?.id}`, {
    method: "DELETE",
    invalidate: ["appointments"],
    onSuccess: () => {
      toast.success(t("common.delete") + " - " + t("common.success"));
      setModalState(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const { mutate: createSaleFromAppointment, isPending: isCreatingSale } =
    usePost<
      Sale,
      {
        salonId: string;
        appointmentId: string;
        clientId?: string;
        redeemLoyalty?: boolean;
        items: {
          type: "service";
          itemId: string;
          quantity: number;
          price: number;
        }[];
      }
    >("sales", {
      invalidate: ["sales", "appointments", "clients"],
      onSuccess: (_sale, variables) => {
        toast.success(
          t("agenda.paymentRecorded") + " - " + t("common.success"),
        );
        queryClient.setQueryData<PaginatedResponse<Appointment> | undefined>(
          appointmentsQueryKey,
          (current) => {
            if (!current) return current;
            return {
              ...current,
              data: current.data.map((appointment) =>
                appointment.id === variables.appointmentId
                  ? { ...appointment, status: "completed", paid: true }
                  : appointment,
              ),
            };
          },
        );
        if (salonId) {
          const salesParams = {
            salonId,
            perPage: 100,
            sortBy: "createdAt",
            sortOrder: "desc",
          };
          const salesQueryKey = ["sales", salesParams];
          void queryClient.prefetchQuery({
            queryKey: salesQueryKey,
            queryFn: () =>
              get(buildUrl("sales", salesParams)) as Promise<
                PaginatedResponse<Sale>
              >,
          });
        }
        setModalState(null);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("common.error"));
      },
    });

  const { mutateAsync: createWalkInClient, isPending: isCreatingWalkIn } =
    usePost<Client, Partial<Client>>("clients");

  const handleSelectSlot = useCallback(
    ({ start }: { start: Date; end: Date }) => {
      const date = getLocalDateString(start);
      const hours = start.getHours();
      const minutes = start.getMinutes();
      const time = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;

      setModalState({
        appointmentId: "create",
        mode: "edit",
        prefillDate: date,
        prefillTime: time,
        nonce: Date.now(),
      });
    },
    [],
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setModalState({ appointmentId: event.id, mode: "view", nonce: Date.now() });
  }, []);

  const toAppointmentPayload = (
    data: AppointmentFormData,
    pricing?: { customPrice?: number; discount?: number },
  ): AppointmentPayload => {
    return {
      clientId: data.clientId,
      serviceId: data.serviceId,
      date: data.date,
      startTime: data.startTime,
      notes: data.notes,
      staffId: data.staffId,
      customPrice: pricing?.customPrice,
      discount: pricing?.discount,
    };
  };

  const handleSubmit = async (data: AppointmentFormData) => {
    if (!salonId) {
      toast.error("No salon assigned to user");
      return;
    }
    const effectiveStaffId = data.staffId || staffFilterId || user?.id;
    if (!effectiveStaffId) {
      toast.error(t("common.error"));
      return;
    }
    const now = new Date();
    const today = getLocalDateString(now);
    const selectedStartMinutes = timeToMinutes(normalizeTime(data.startTime));
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    if (
      data.date < today ||
      (data.date === today && selectedStartMinutes < currentMinutes)
    ) {
      toast.error(t("agenda.pastAppointmentNotAllowed"));
      return;
    }

    const workingHoursForDate = getWorkingHoursForDate(
      salonSettings,
      data.date,
    );
    if (!workingHoursForDate.isOpen) {
      toast.error(t("agenda.closedDay"));
      return;
    }
    const daySlots = buildTimeSlotsForHours({
      openTime: workingHoursForDate.openTime,
      closeTime: workingHoursForDate.closeTime,
      slotMinutes: bookingSlotMinutes,
      breakStart: workingHoursForDate.breakStart || undefined,
      breakEnd: workingHoursForDate.breakEnd || undefined,
    });
    if (
      !daySlots.slots.includes(data.startTime) ||
      daySlots.blocked.has(data.startTime)
    ) {
      toast.error(t("agenda.timeOutsideWorkingHours"));
      return;
    }

    const selectedServiceForTime = services.find(
      (service) => service.id === data.serviceId,
    );
    const durationMinutes =
      selectedServiceForTime?.duration || bookingSlotMinutes;
    const endTime = addMinutesToTime(data.startTime, durationMinutes);
    const conflictingAppointment = findConflictingAppointment(appointments, {
      date: data.date,
      startTime: data.startTime,
      endTime,
      excludeId: isCreateMode ? null : selectedAppointment?.id,
      staffId: effectiveStaffId,
    });

    if (conflictingAppointment) {
      const conflictName = conflictingAppointment.client
        ? `${conflictingAppointment.client.firstName} ${conflictingAppointment.client.lastName}`
        : t("common.unknown");
      toast.error(
        `${t("agenda.timeSlotOccupied")} ${t("agenda.timeSlotOccupiedDetails", {
          client: conflictName,
          start: conflictingAppointment.startTime,
          end: conflictingAppointment.endTime,
        })}`,
      );
      return;
    }

    const usePriceOverride = !!data.priceOverrideEnabled;
    const rawPrice = data.price?.toString().trim();
    const rawDiscount = data.discount?.toString().trim();
    let parsedPrice: number | undefined;
    let parsedDiscount: number | undefined;

    if (usePriceOverride && rawPrice) {
      parsedPrice = Number(rawPrice);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        toast.error(
          t("validation.number.min", { field: t("fields.price"), min: 0 }),
        );
        return;
      }
    }
    if (usePriceOverride && rawDiscount) {
      parsedDiscount = Number(rawDiscount);
      if (!Number.isFinite(parsedDiscount) || parsedDiscount < 0) {
        toast.error(
          t("validation.number.min", { field: t("sales.discount"), min: 0 }),
        );
        return;
      }
    }

    const selectedService = services.find(
      (service) => service.id === data.serviceId,
    );
    if (usePriceOverride) {
      const basePrice =
        parsedPrice ??
        (parsedDiscount !== undefined ? selectedService?.price : undefined);
      if (
        parsedDiscount !== undefined &&
        basePrice !== undefined &&
        parsedDiscount > basePrice
      ) {
        toast.error(
          t("validation.number.max", {
            field: t("sales.discount"),
            max: basePrice,
          }),
        );
        return;
      }
    }

    const pricingPayload = usePriceOverride
      ? {
          customPrice: parsedPrice,
          discount: parsedDiscount ?? 0,
        }
      : undefined;
    const nowIso = new Date().toISOString();
    const createOptimisticId = () =>
      `local-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const resolvedService =
      selectedServiceForTime ||
      services.find((service) => service.id === data.serviceId);
    const resolvedClient = clients.find(
      (client) => client.id === data.clientId,
    );
    const basePrice =
      pricingPayload?.customPrice ??
      resolvedService?.price ??
      selectedAppointment?.customPrice ??
      selectedAppointment?.price ??
      0;
    const discountValue = pricingPayload?.discount ?? selectedAppointment?.discount ?? 0;
    const finalPrice = Math.max(0, basePrice - discountValue);

    const buildOptimisticAppointment = (options?: {
      client?: Client;
      clientId?: string;
      appointmentId?: string;
    }): Appointment => {
      const optimisticClient = options?.client ?? resolvedClient ?? selectedAppointment?.client;
      const optimisticClientId =
        options?.clientId ?? optimisticClient?.id ?? data.clientId ?? "";
      const appointmentId =
        options?.appointmentId ||
        selectedAppointment?.id ||
        createOptimisticId();
      return {
        id: appointmentId,
        createdAt: selectedAppointment?.createdAt ?? nowIso,
        updatedAt: nowIso,
        salonId: salonId || "",
        clientId: optimisticClientId,
        client: optimisticClient,
        serviceId: data.serviceId,
        service: resolvedService ?? selectedAppointment?.service,
        staffId: effectiveStaffId,
        staff: selectedAppointment?.staff,
        date: data.date,
        startTime: data.startTime,
        endTime,
        status: selectedAppointment?.status ?? AppointmentStatus.PENDING,
        paid: selectedAppointment?.paid ?? false,
        notes: data.notes,
        basePrice: resolvedService?.price ?? selectedAppointment?.basePrice ?? basePrice,
        customPrice: pricingPayload?.customPrice ?? selectedAppointment?.customPrice ?? null,
        discount: discountValue,
        price: finalPrice,
        reminderSent: selectedAppointment?.reminderSent ?? false,
      };
    };

    if (modalState?.mode === "edit" && !isCreateMode) {
      if (selectedAppointment) {
        const optimisticUpdate = buildOptimisticAppointment({
          appointmentId: selectedAppointment.id,
        });
        upsertVisibleAppointment(optimisticUpdate);
      }
      updateAppointment({
        ...toAppointmentPayload(data, pricingPayload),
        staffId: effectiveStaffId,
      });
    } else {
      if (data.walkInEnabled) {
        try {
          const name = data.walkInName?.trim() || "";
          const nameParts = name.split(/\s+/).filter(Boolean);
          const firstName = nameParts[0] || t("agenda.walkIn");
          const lastName =
            nameParts.slice(1).join(" ") || t("agenda.walkInLastNameFallback");
          const email =
            data.walkInEmail?.trim() ||
            `walkin+${salonId}+${Date.now()}@salon.local`;
          const phone = normalizePhone(data.walkInPhone);
          const walkInClient = await createWalkInClient({
            salonId,
            firstName,
            lastName,
            email,
            phone,
            notes: t("agenda.walkInNote"),
            isMarried: !!data.walkInIsMarried,
          });
          const optimisticAppointment = buildOptimisticAppointment({
            client: walkInClient,
            clientId: walkInClient.id,
            appointmentId: createOptimisticId(),
          });
          upsertVisibleAppointment(optimisticAppointment, { prepend: true });
          createAppointment({
            ...toAppointmentPayload(data, pricingPayload),
            salonId,
            staffId: effectiveStaffId,
            clientId: walkInClient.id,
          });
        } catch (e) {
          console.log(e);
          toast.error(t("common.error"));
        }
      } else {
        const optimisticAppointment = buildOptimisticAppointment({
          appointmentId: createOptimisticId(),
        });
        upsertVisibleAppointment(optimisticAppointment, { prepend: true });
        createAppointment({
          ...toAppointmentPayload(data, pricingPayload),
          salonId,
          staffId: effectiveStaffId,
        });
      }
    }
  };

  const handleNotificationToggle = () => {
    if (!notificationsEnabled) {
      requestNotificationPermission().then((granted) => {
        setNotificationsEnabled(granted);
        if (granted) {
          toast.success(t("agenda.notificationsEnabled"));
        }
      });
    }
  };

  const handleDeleteAppointment = () => {
    if (!selectedAppointment?.id) {
      toast.error(t("common.error"));
      return;
    }
    markAppointmentDeleted(selectedAppointment.id);
    deleteAppointment(selectedAppointment.id);
  };

  const showPageLoading = isLoading && appointments.length === 0;

  if (showPageLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("nav.agenda")}
          description={t("agenda.description")}
        />
        <LoadingPanel label={t("common.loading")} className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title={t("nav.agenda")}
        description={t("agenda.description")}
      />

      <CalendarToolbar
        notificationsEnabled={notificationsEnabled}
        onNotificationToggle={handleNotificationToggle}
        onNewAppointment={() =>
          setModalState({
            appointmentId: "create",
            mode: "edit",
            prefillDate: selectedDate,
            nonce: Date.now(),
          })
        }
        confirmedCount={confirmedCount}
        pendingCount={pendingCount}
        totalCount={appointments.length}
        isNewAppointmentDisabled={isSelectedDatePast}
        newAppointmentDisabledReason={t("agenda.pastAppointmentNotAllowed")}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("agenda.unpaidTotalToday")}
          </p>
          <p className="text-xl font-bold text-accent-pink">
            {formatCurrency(unpaidTotalToday)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("agenda.overdueCount")}
          </p>
          <p className="text-xl font-bold text-orange-600">
            {overdueAppointments.length}
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t("fields.date")}
          </span>
          <Input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="w-40"
          />
        </div>
        {canSelectStaff && staffOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t("fields.staff")}
            </span>
            <Select
              value={selectedStaffIdValue || ""}
              onValueChange={(value) => setSelectedStaffId(value)}
            >
              <SelectTrigger className="w-56 bg-white text-black">
                <SelectValue placeholder={t("fields.staff")} />
              </SelectTrigger>
              <SelectContent className="bg-white text-black">
                {staffOptions.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("day")}
            className="gap-1"
          >
            <List className="h-3.5 w-3.5" />
            {t("agenda.day")}
          </Button>
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("month")}
            className="gap-1"
          >
            <Calendar className="h-3.5 w-3.5" />
            {t("agenda.month")}
          </Button>
        </div>
        {viewMode === "day" && (
          <>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              {t("agenda.filters.all")}
            </Button>
            <Button
              variant={filter === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("today")}
            >
              {t("agenda.filters.today")}
            </Button>
            <Button
              variant={filter === "unpaid" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unpaid")}
            >
              {t("agenda.filters.unpaid")}
            </Button>
            <Button
              variant={filter === "overdue" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("overdue")}
            >
              {t("agenda.filters.overdue")}
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("completed")}
            >
              {t("agenda.filters.completed")}
            </Button>
          </>
        )}
      </div>

      <div className="w-full">
        {viewMode === "month" ? (
          <MonthlySummaryView
            appointments={appointments}
            selectedDate={selectedDateObj}
            onSelectDate={setSelectedDate}
          />
        ) : (
          <TimelineView
            appointments={filteredAppointments}
            selectedDate={selectedDateObj}
            isLoading={isLoading}
            timeSlots={timelineSlots.slots}
            blockedSlots={timelineSlots.blocked}
            isClosed={!workingHoursForSelectedDate.isOpen}
            onTimeSlotClick={(time) =>
              handleSelectSlot({
                start: timeToDate(time, selectedDate),
                end: timeToDate(time, selectedDate),
              })
            }
            onAppointmentClick={(appointment) =>
              handleSelectEvent({
                id: appointment.id,
                title: appointment.client
                  ? `${appointment.client.firstName} ${appointment.client.lastName}`
                  : appointment.service?.name || t("agenda.appointmentDetails"),
                start: new Date(`${appointment.date}T${appointment.startTime}`),
                end: new Date(`${appointment.date}T${appointment.endTime}`),
                resource: appointment,
              })
            }
            onRecordPayment={(appointment) => {
              if (!salonId || !appointment.serviceId) {
                toast.error(t("common.error"));
                return;
              }
              const optimisticUpdated = {
                ...appointment,
                status: AppointmentStatus.COMPLETED,
                paid: true,
                updatedAt: new Date().toISOString(),
              };
              upsertVisibleAppointment(optimisticUpdated);
              createSaleFromAppointment({
                salonId,
                appointmentId: appointment.id,
                clientId: appointment.clientId,
                redeemLoyalty: false,
                items: [
                  {
                    type: "service",
                    itemId: appointment.serviceId,
                    quantity: 1,
                    price: appointment.price,
                  },
                ],
              });
            }}
            isRecordingPayment={isCreatingSale}
          />
        )}
      </div>

      <AppointmentModals
        modalState={modalState}
        setModalState={setModalState}
        appointments={appointments}
        clients={clients}
        services={services}
        staffMembers={staffMembers}
        selectedStaffId={staffFilterId}
        form={form}
        onSubmit={handleSubmit}
        onDelete={handleDeleteAppointment}
        onCreateSale={(appointment, options) => {
          if (!salonId || !appointment.serviceId) {
            toast.error(t("common.error"));
            return;
          }
          const optimisticUpdated = {
            ...appointment,
            status: AppointmentStatus.COMPLETED,
            paid: true,
            updatedAt: new Date().toISOString(),
          };
          upsertVisibleAppointment(optimisticUpdated);
          createSaleFromAppointment({
            salonId,
            appointmentId: appointment.id,
            clientId: appointment.clientId,
            redeemLoyalty: options?.redeemLoyalty ?? false,
            items: [
              {
                type: "service",
                itemId: appointment.serviceId,
                quantity: 1,
                price: appointment.price,
              },
            ],
          });
        }}
        isCreatingSale={isCreatingSale}
        isPending={
          isCreating ||
          isUpdating ||
          isDeleting ||
          isCreatingSale ||
          isCreatingWalkIn
        }
        salonSettings={salonSettings}
      />
    </div>
  );
}
