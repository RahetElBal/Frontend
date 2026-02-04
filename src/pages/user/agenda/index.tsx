import { useState, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/page-header";
import { LoadingPanel } from "@/components/loading-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { usePostAction } from "@/hooks/usePostAction";
import { useForm } from "@/hooks/useForm";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { normalizePhone } from "@/common/phone";

import type {
  Appointment,
  Client,
  Service,
  PaginatedResponse,
  Sale,
  Salon,
  SalonSettings,
  SalonSettingsExtended,
} from "@/types";
import { AppointmentStatus } from "@/types/entities";
import type { AppointmentModalState } from "./types";
import { appointmentFormSchema, type AppointmentFormData } from "./validation";
import type { CalendarEvent } from "./utils";
import {
  safeExtractArray,
  getLocalDateString,
  isAppointmentOverdue,
  timeToDate,
  getWorkingHoursForDate,
  buildTimeSlotsForHours,
  DEFAULT_SLOT_MINUTES,
  addMinutesToTime,
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
import { AppointmentModals } from "./components/dialog/appointment-modals";
import { translateServiceName } from "@/common/service-translations";

export function AgendaPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { formatCurrency } = useLanguage();
  const queryClient = useQueryClient();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [modalState, setModalState] = useState<AppointmentModalState>(null);
  const [filter, setFilter] = useState<
    "all" | "today" | "unpaid" | "overdue" | "completed"
  >("all");
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [autoArchiveWalkIns, setAutoArchiveWalkIns] = useState<boolean>(() => {
    try {
      return localStorage.getItem("agenda.autoArchiveWalkIns") === "true";
    } catch {
      return false;
    }
  });

  const salonId = user?.salon?.id;
  const appointmentsStaleTime = 1000 * 30; // 30s for near real-time
  const clientsStaleTime = 1000 * 60 * 10; // 10m
  const servicesStaleTime = 1000 * 60 * 10; // 10m
  const appointmentsParams = useMemo(
    () => ({ salonId, perPage: 100 }),
    [salonId],
  );
  const appointmentsQueryKey = useMemo(
    () => ["appointments", appointmentsParams].filter(Boolean),
    [appointmentsParams],
  );

  const {
    data: appointmentsData,
    isLoading,
    refetch,
  } = useGet<PaginatedResponse<Appointment>>("appointments", {
    params: appointmentsParams,
    enabled: !!salonId,
    staleTime: appointmentsStaleTime,
  });

  const { data: clientsData } = useGet<PaginatedResponse<Client>>("clients", {
    params: { salonId, perPage: 100 },
    enabled: !!salonId,
    staleTime: clientsStaleTime,
  });

  const { data: salonData } = useGet<Salon>("salons", {
    id: salonId,
    enabled: !!salonId,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  const { data: servicesData } = useGet<PaginatedResponse<Service>>(
    "services",
    {
      params: { salonId, perPage: 100 },
      enabled: !!salonId,
      staleTime: servicesStaleTime,
    },
  );

  const appointments = safeExtractArray<Appointment>(appointmentsData);
  const clients = safeExtractArray<Client>(clientsData);
  const services = safeExtractArray<Service>(servicesData);
  type SalonSettingsLike = SalonSettings & Partial<SalonSettingsExtended>;
  const salonSettings = (salonData?.settings ??
    user?.salon?.settings) as SalonSettingsLike | undefined;
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
      walkInEnabled: false,
      walkInName: "",
      walkInPhone: "",
      walkInEmail: "",
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
    invalidateQueries: ["appointments"],
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
  >("appointments", {
    id: selectedAppointment?.id,
    method: "PATCH",
    invalidateQueries: ["appointments"],
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
  >("appointments", {
    id: (appointmentId) => appointmentId,
    method: "DELETE",
    invalidateQueries: ["appointments"],
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
      invalidateQueries: ["sales", "appointments"],
      onSuccess: (_sale, variables) => {
        toast.success(
          t("agenda.paymentRecorded") + " - " + t("common.success"),
        );
        if (autoArchiveWalkIns) {
          const paidAppointment = appointments.find(
            (appointment) => appointment.id === variables.appointmentId,
          );
          const clientId = paidAppointment?.client?.id;
          const clientEmail = paidAppointment?.client?.email || "";
          if (clientId && clientEmail.startsWith("walkin+")) {
            archiveClient(clientId);
          }
        }
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
        setModalState(null);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("common.error"));
      },
    });

  const { mutateAsync: createWalkInClient, isPending: isCreatingWalkIn } =
    usePost<Client, Partial<Client>>("clients");

  const { mutateAsync: archiveClient } = usePostAction<void, string>(
    "clients",
    {
      id: (clientId) => clientId,
      action: "archive",
      showSuccessToast: true,
      successMessage: t("clients.archived"),
      showErrorToast: true,
    },
  );

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
      });
    },
    [],
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setModalState({ appointmentId: event.id, mode: "view" });
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
      customPrice: pricing?.customPrice,
      discount: pricing?.discount,
    };
  };

  const handleSubmit = async (data: AppointmentFormData) => {
    if (!salonId) {
      toast.error("No salon assigned to user");
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
        toast.error(t("validation.number.max", {
          field: t("sales.discount"),
          max: basePrice,
        }));
        return;
      }
    }

    const pricingPayload = usePriceOverride
      ? {
          customPrice: parsedPrice,
          discount: parsedDiscount ?? 0,
        }
      : undefined;

    if (modalState?.mode === "edit" && !isCreateMode) {
      updateAppointment(toAppointmentPayload(data, pricingPayload));
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
          });
          createAppointment({
            ...toAppointmentPayload(data, pricingPayload),
            salonId,
            clientId: walkInClient.id,
          });
        } catch (e) {
          console.log(e);
          toast.error(t("common.error"));
        }
      } else {
        createAppointment({
          ...toAppointmentPayload(data, pricingPayload),
          salonId,
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

  if (isLoading) {
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
    <div className="space-y-6">
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
          })
        }
        confirmedCount={confirmedCount}
        pendingCount={pendingCount}
        totalCount={appointments.length}
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
        <div className="flex items-center gap-2 ms-auto">
          <Switch
            checked={autoArchiveWalkIns}
            onCheckedChange={(checked) => {
              setAutoArchiveWalkIns(checked);
              try {
                localStorage.setItem(
                  "agenda.autoArchiveWalkIns",
                  String(checked),
                );
              } catch {
                // ignore
              }
            }}
          />
          <span className="text-sm text-muted-foreground">
            {t("agenda.autoArchiveWalkIns")}
          </span>
        </div>
      </div>

      <TimelineView
        appointments={filteredAppointments}
        selectedDate={new Date(`${selectedDate}T00:00:00`)}
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

      <AppointmentModals
        modalState={modalState}
        setModalState={setModalState}
        appointments={appointments}
        clients={clients}
        services={services}
        form={form}
        onSubmit={handleSubmit}
        onDelete={() => {
          if (!selectedAppointment?.id) {
            toast.error(t("common.error"));
            return;
          }
          deleteAppointment(selectedAppointment.id);
        }}
        onCreateSale={(appointment, options) => {
          if (!salonId || !appointment.serviceId) {
            toast.error(t("common.error"));
            return;
          }
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
