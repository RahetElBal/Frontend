import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/page-header";
import { toast } from "@/lib/toast";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useForm } from "@/hooks/useForm";
import { useUser } from "@/hooks/useUser";

import type { Appointment, Client, Service, PaginatedResponse } from "@/types";
import { AppointmentStatus } from "@/types/entities";
import type { AppointmentModalState } from "./types";
import { appointmentFormSchema, type AppointmentFormData } from "./validation";
import type { CalendarEvent } from "./utils";
import { safeExtractArray } from "./utils";

import {
  requestNotificationPermission,
  scheduleReminder,
  cancelAllReminders,
  showNotification,
  type AppointmentReminder,
} from "@/lib/notifications";
import { CalendarToolbar } from "./components/dialog/calendar-toolbar";
import { CalendarView } from "./components/dialog/calendar-view";
import { AppointmentModals } from "./components/dialog/appointment-modals";

export function AgendaPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [modalState, setModalState] = useState<AppointmentModalState>(null);

  const salonId = user?.salon?.id;

  const {
    data: appointmentsData,
    isLoading,
    refetch,
  } = useGet<PaginatedResponse<Appointment>>("appointments", {
    params: { salonId, perPage: 100 },
    enabled: !!salonId,
  });

  const { data: clientsData } = useGet<PaginatedResponse<Client>>("clients", {
    params: { salonId, perPage: 100 },
    enabled: !!salonId,
  });

  const { data: servicesData } = useGet<PaginatedResponse<Service>>(
    "services",
    {
      params: { salonId, perPage: 100 },
      enabled: !!salonId,
    },
  );

  const appointments = safeExtractArray<Appointment>(appointmentsData);
  const clients = safeExtractArray<Client>(clientsData);
  const services = safeExtractArray<Service>(servicesData);

  const form = useForm<AppointmentFormData>({
    schema: appointmentFormSchema,
    defaultValues: {
      clientId: "",
      serviceId: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      notes: "",
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

  const handleReminder = useCallback(
    (reminder: AppointmentReminder) => {
      showNotification(`${t("agenda.reminderTitle")} - ${reminder.time}`, {
        body: `${reminder.clientName} - ${reminder.serviceName}`,
        playSound: true,
      });
      toast.info(
        `${t("agenda.upcomingAppointment")}: ${reminder.clientName} - ${reminder.serviceName} à ${reminder.time}`,
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

    const today = new Date().toISOString().split("T")[0];
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
        serviceName: apt.service?.name || "Service",
        time: apt.startTime,
        date: apt.date,
        reminderTime: new Date(),
      };
      scheduleReminder(reminder, 15, handleReminder);
    });

    return () => cancelAllReminders();
  }, [appointments, notificationsEnabled, handleReminder]);

  const { mutate: createAppointment, isPending: isCreating } = usePost<
    Appointment,
    AppointmentFormData
  >("appointments", {
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
    AppointmentFormData
  >("appointments", {
    id: selectedAppointment?.id,
    method: "PATCH",
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
    void
  >("appointments", {
    id: selectedAppointment?.id,
    method: "DELETE",
    onSuccess: () => {
      toast.success(t("common.delete") + " - " + t("common.success"));
      setModalState(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const handleSelectSlot = useCallback(
    ({ start }: { start: Date; end: Date }) => {
      const date = start.toISOString().split("T")[0];
      const hours = start.getHours();
      const minutes = start.getMinutes();
      const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

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

  const handleSubmit = (data: AppointmentFormData) => {
    if (!salonId) {
      toast.error("No salon assigned to user");
      return;
    }

    if (modalState?.mode === "edit" && !isCreateMode) {
      updateAppointment(data);
    } else {
      createAppointment({ ...data, salonId });
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
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
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
          setModalState({ appointmentId: "create", mode: "edit" })
        }
        confirmedCount={confirmedCount}
        pendingCount={pendingCount}
        totalCount={appointments.length}
      />

      <CalendarView
        appointments={appointments}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />

      <AppointmentModals
        modalState={modalState}
        setModalState={setModalState}
        appointments={appointments}
        clients={clients}
        services={services}
        form={form}
        onSubmit={handleSubmit}
        onDelete={() => deleteAppointment()}
        isPending={isCreating || isUpdating || isDeleting}
      />
    </div>
  );
}
