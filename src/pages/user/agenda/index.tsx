import { useState, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/page-header";
import { toast } from "@/lib/toast";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { usePostAction } from "@/hooks/usePostAction";
import { useForm } from "@/hooks/useForm";
import { useUser } from "@/hooks/useUser";

import type {
  Appointment,
  Client,
  Service,
  PaginatedResponse,
  Sale,
} from "@/types";
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
import { translateServiceName } from "@/common/service-translations";

export function AgendaPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [modalState, setModalState] = useState<AppointmentModalState>(null);

  const salonId = user?.salon?.id;
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
    const today = now.toISOString().split("T")[0];
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    // Find overdue unpaid appointments (completed but not paid, or past end time and not paid)
    const overdueUnpaid = appointments.filter((apt) => {
      // Skip cancelled appointments
      if (apt.status === "cancelled") return false;
      
      // Already paid, no need to notify
      if (apt.paid) return false;

      // Check if appointment is in the past
      const isPastDate = apt.date < today;
      const isPastTime = apt.date === today && apt.endTime && apt.endTime < currentTime;
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
        `${t("agenda.overdueUnpaid")}: ${clientName} - ${serviceName} (${apt.date} ${apt.startTime})`,
        { duration: 10000 }
      );

      if (notificationsEnabled) {
        showNotification(t("agenda.overdueUnpaidTitle"), {
          body: `${clientName} - ${serviceName} (${apt.date} ${apt.startTime})`,
          playSound: true,
        });
      }
    });
  }, [appointments, notificationsEnabled, t]);

  const { mutate: createAppointment, isPending: isCreating } = usePost<
    Appointment,
    AppointmentFormData
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
    AppointmentFormData
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
    void
  >("appointments", {
    id: selectedAppointment?.id,
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

  // Cancel appointment - POST /appointments/{id}/cancel
  const { mutate: cancelAppointment, isPending: isCancelling } = usePostAction<
    Appointment,
    string
  >("appointments", {
    id: (appointmentId) => appointmentId,
    action: "cancel",
    invalidateQueries: ["appointments"],
    showSuccessToast: true,
    successMessage: t("agenda.appointmentCancelled"),
    onSuccess: () => {
      setModalState(null);
      refetch();
    },
  });

  // Complete appointment - POST /appointments/{id}/complete
  const { mutate: completeAppointment, isPending: isCompleting } = usePostAction<
    Appointment,
    string
  >("appointments", {
    id: (appointmentId) => appointmentId,
    action: "complete",
    invalidateQueries: ["appointments"],
    showSuccessToast: true,
    successMessage: t("agenda.appointmentCompleted"),
    onSuccess: () => {
      setModalState(null);
      refetch();
    },
  });

  const { mutate: createSaleFromAppointment, isPending: isCreatingSale } =
    usePost<
      Sale,
      {
        salonId: string;
        appointmentId: string;
        clientId?: string;
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
        toast.success(t("agenda.paymentRecorded") + " - " + t("common.success"));
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

  const handleSubmit = async (data: AppointmentFormData) => {
    if (!salonId) {
      toast.error("No salon assigned to user");
      return;
    }

    if (modalState?.mode === "edit" && !isCreateMode) {
      updateAppointment(data);
    } else {
      if (data.walkInEnabled) {
        try {
          const firstName = data.walkInFirstName?.trim() || "";
          const lastName = data.walkInLastName?.trim() || "";
          if (!firstName || !lastName) {
            toast.error(t("agenda.walkInNameRequired"));
            return;
          }
          const email = `walkin+${salonId}+${Date.now()}@salon.local`;
          const phone = data.walkInPhone?.trim() || "0000000000";
          const walkInClient = await createWalkInClient({
            salonId,
            firstName,
            lastName,
            email,
            phone,
            notes: t("agenda.walkInNote"),
          });
          createAppointment({
            ...data,
            salonId,
            clientId: walkInClient.id,
          });
        } catch (error) {
          toast.error(t("common.error"));
        }
      } else {
        createAppointment({ ...data, salonId });
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
        onCancel={(id) => cancelAppointment(id)}
        onComplete={(id) => completeAppointment(id)}
        onCreateSale={(appointment) => {
          if (!salonId || !appointment.serviceId) {
            toast.error(t("common.error"));
            return;
          }
          createSaleFromAppointment({
            salonId,
            appointmentId: appointment.id,
            clientId: appointment.clientId,
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
          isCancelling ||
          isCompleting ||
          isCreatingSale ||
          isCreatingWalkIn
        }
      />
    </div>
  );
}
