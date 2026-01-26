import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Scissors,
  Calendar,
  Bell,
  BellRing,
  Edit,
  Trash2,
} from "lucide-react";
import { requiredString, optionalString } from "@/common/validator/zodI18n";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
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
import { cn } from "@/lib/utils";
import { AppointmentStatus } from "@/types/entities";
import type { Appointment, Client, Service } from "@/types/entities";
import { useLanguage } from "@/hooks/useLanguage";
import { useForm } from "@/hooks/useForm";
import { toast } from "@/lib/toast";
import {
  showNotification,
  requestNotificationPermission,
  scheduleReminder,
  cancelAllReminders,
  type AppointmentReminder,
} from "@/lib/notifications";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";

// Modal state type
type AppointmentModalState = {
  appointmentId: string | "create";
  mode: "view" | "edit" | "delete";
  prefillTime?: string;
  prefillDate?: string;
} | null;

// Zod schema for appointment form
const appointmentFormSchema = z.object({
  clientId: requiredString("Client"),
  serviceId: requiredString("Service"),
  date: requiredString("Date"),
  startTime: requiredString("Heure"),
  notes: optionalString(),
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

const statusColors: Record<
  string,
  "default" | "success" | "warning" | "info" | "error"
> = {
  [AppointmentStatus.CONFIRMED]: "success",
  [AppointmentStatus.PENDING]: "warning",
  [AppointmentStatus.IN_PROGRESS]: "info",
  [AppointmentStatus.COMPLETED]: "default",
  [AppointmentStatus.CANCELLED]: "error",
  [AppointmentStatus.NO_SHOW]: "error",
};

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

export function AgendaPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Unified modal state
  const [modalState, setModalState] = useState<AppointmentModalState>(null);

  // Fetch data from API (scoped to current salon)
  const {
    data: appointments = [],
    isLoading,
    refetch,
  } = useGet<Appointment[]>("appointments");
  const { data: clients = [] } = useGet<Client[]>("clients");
  const { data: services = [] } = useGet<Service[]>("services");

  // Helper functions
  const getSelectedAppointment = (): Appointment | null => {
    if (!modalState || modalState.appointmentId === "create") return null;
    return appointments.find((a) => a.id === modalState.appointmentId) || null;
  };

  const selectedAppointment = getSelectedAppointment();
  const isCreateMode = modalState?.appointmentId === "create";
  const isEditMode = modalState?.mode === "edit" && !isCreateMode;
  const isViewMode = modalState?.mode === "view";
  const isDeleteMode = modalState?.mode === "delete";

  // Form setup
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

  // Reset form when modal state changes
  useEffect(() => {
    if (isCreateMode) {
      form.reset({
        clientId: "",
        serviceId: "",
        date:
          modalState?.prefillDate || selectedDate.toISOString().split("T")[0],
        startTime: modalState?.prefillTime || "09:00",
        notes: "",
      });
    } else if (selectedAppointment && isEditMode) {
      form.reset({
        clientId: selectedAppointment.clientId,
        serviceId: selectedAppointment.serviceId,
        date: selectedAppointment.date,
        startTime: selectedAppointment.startTime,
        notes: selectedAppointment.notes || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState, selectedAppointment, isCreateMode, isEditMode, selectedDate]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().then(setNotificationsEnabled);
  }, []);

  // Handle appointment reminder
  const handleReminder = useCallback(
    (reminder: AppointmentReminder) => {
      showNotification(`${t("agenda.reminderTitle")} - ${reminder.time}`, {
        body: `${reminder.clientName} - ${reminder.serviceName}`,
        playSound: true,
        onClick: () => {
          setSelectedDate(new Date(reminder.date));
        },
      });
      toast.info(
        `${t("agenda.upcomingAppointment")}: ${reminder.clientName} - ${reminder.serviceName} à ${reminder.time}`,
      );
    },
    [t],
  );

  // Schedule reminders for today's appointments
  useEffect(() => {
    if (!notificationsEnabled || appointments.length === 0) return;

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

  // Create appointment mutation
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

  // Update appointment mutation
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

  // Delete appointment mutation
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

  // Get selected service details
  const selectedServiceId = form.watch("serviceId");
  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId],
  );

  const formatDate = (date: Date) =>
    date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const goToPrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const openModalWithTime = (time: string) => {
    setModalState({
      appointmentId: "create",
      mode: "edit",
      prefillTime: time,
      prefillDate: selectedDate.toISOString().split("T")[0],
    });
  };

  const handleView = (appointment: Appointment) => {
    setModalState({ appointmentId: appointment.id, mode: "view" });
  };

  // These handlers are available for future use
  const _handleEdit = (appointment: Appointment) => {
    setModalState({ appointmentId: appointment.id, mode: "edit" });
  };

  const _handleDelete = (appointment: Appointment) => {
    setModalState({ appointmentId: appointment.id, mode: "delete" });
  };

  // Expose for potential future use
  void _handleEdit;
  void _handleDelete;

  const handleSubmit = (data: AppointmentFormData) => {
    if (isEditMode) {
      updateAppointment(data);
    } else {
      createAppointment(data);
    }
  };

  // Get current hour for highlighting
  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const currentTimeString = `${currentHour.toString().padStart(2, "0")}:${currentMinutes >= 30 ? "30" : "00"}`;

  // Filter appointments for the selected date
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const dayAppointments = appointments.filter(
    (apt) => apt.date === selectedDateStr,
  );

  const confirmedCount = dayAppointments.filter(
    (a) => a.status === AppointmentStatus.CONFIRMED,
  ).length;
  const pendingCount = dayAppointments.filter(
    (a) => a.status === AppointmentStatus.PENDING,
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.agenda")}
        description={t("agenda.description")}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={notificationsEnabled ? "default" : "outline"}
              size="icon"
              onClick={() => {
                if (!notificationsEnabled) {
                  requestNotificationPermission().then((granted) => {
                    setNotificationsEnabled(granted);
                    if (granted) {
                      toast.success(t("agenda.notificationsEnabled"));
                    }
                  });
                }
              }}
              title={
                notificationsEnabled
                  ? t("agenda.notificationsOn")
                  : t("agenda.enableNotifications")
              }
            >
              {notificationsEnabled ? (
                <BellRing className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
            </Button>
            <Button
              className="gap-2"
              onClick={() =>
                setModalState({ appointmentId: "create", mode: "edit" })
              }
            >
              <Plus className="h-4 w-4" />
              {t("agenda.newAppointment")}
            </Button>
          </div>
        }
      />

      {/* Date Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday}>
              {t("agenda.today")}
            </Button>
          </div>
          <h2 className="text-lg font-semibold capitalize">
            {formatDate(selectedDate)}
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="success">
              {confirmedCount} {t("agenda.confirmed")}
            </Badge>
            <Badge variant="warning">
              {pendingCount} {t("agenda.pending")}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Timeline View */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-150">
              <div className="relative">
                {timeSlots.map((time) => {
                  const isCurrentTime = time === currentTimeString;
                  const isPastTime = time < currentTimeString;
                  const appointment = dayAppointments.find(
                    (apt) => apt.startTime === time,
                  );

                  return (
                    <div
                      key={time}
                      className={cn(
                        "flex border-b relative",
                        isCurrentTime && "bg-accent-pink/5",
                        isPastTime && "opacity-60",
                      )}
                    >
                      <div
                        className={cn(
                          "w-20 shrink-0 py-4 px-3 text-sm font-medium border-r bg-muted/30",
                          isCurrentTime && "text-accent-pink font-bold",
                        )}
                      >
                        {time}
                      </div>

                      <div
                        className={cn(
                          "flex-1 min-h-15 p-2 hover:bg-muted/30 cursor-pointer transition-colors",
                          !appointment &&
                            "border-l-4 border-l-transparent hover:border-l-accent-pink/30",
                        )}
                        onClick={() => {
                          if (!appointment) {
                            openModalWithTime(time);
                          } else {
                            handleView(appointment);
                          }
                        }}
                      >
                        {appointment ? (
                          <div
                            className={cn(
                              "rounded-lg p-3 h-full cursor-pointer hover:shadow-md transition-all",
                              "border-l-4",
                              appointment.status ===
                                AppointmentStatus.CONFIRMED &&
                                "bg-green-50 border-l-green-500",
                              appointment.status ===
                                AppointmentStatus.PENDING &&
                                "bg-yellow-50 border-l-yellow-500",
                              appointment.status ===
                                AppointmentStatus.IN_PROGRESS &&
                                "bg-blue-50 border-l-blue-500",
                              appointment.status ===
                                AppointmentStatus.COMPLETED &&
                                "bg-gray-50 border-l-gray-400",
                              appointment.status ===
                                AppointmentStatus.CANCELLED &&
                                "bg-red-50 border-l-red-500",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {appointment.client?.firstName}{" "}
                                    {appointment.client?.lastName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Scissors className="h-3 w-3" />
                                  <span>{appointment.service?.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {appointment.startTime} -{" "}
                                    {appointment.endTime}
                                  </span>
                                </div>
                              </div>
                              <Badge
                                variant={statusColors[appointment.status]}
                                className="text-xs shrink-0"
                              >
                                {appointment.status}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground/50 text-sm">
                            <Plus className="h-4 w-4 me-1" />
                            {t("agenda.addSlot")}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {currentHour >= 9 && currentHour < 19 && (
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-accent-pink z-10 pointer-events-none"
                    style={{
                      top: `${((currentHour - 9) * 2 + (currentMinutes >= 30 ? 1 : 0)) * 60 + (currentMinutes % 30) * 2}px`,
                    }}
                  >
                    <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-accent-pink" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!isLoading && dayAppointments.length === 0 && (
          <div className="p-12 text-center border-t">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("agenda.noAppointments")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("agenda.noAppointmentsDescription")}
            </p>
          </div>
        )}
      </Card>

      {/* Create/Edit Appointment Modal */}
      <Dialog
        open={isEditMode || isCreateMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? t("agenda.newAppointment") : t("common.edit")}
            </DialogTitle>
            {isEditMode && selectedAppointment && (
              <DialogDescription>
                {selectedAppointment.client?.firstName}{" "}
                {selectedAppointment.client?.lastName}
              </DialogDescription>
            )}
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-4 py-4">
              {/* Client Selection */}
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
                    {clients.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground text-sm">
                        {t("clients.noClients")}
                      </div>
                    ) : (
                      clients.map((client) => (
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
                {form.hasError("clientId") && (
                  <p className="text-sm text-destructive">
                    {form.getError("clientId")}
                  </p>
                )}
              </div>

              {/* Service Selection */}
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
                    {services.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground text-sm">
                        {t("services.services")} - {t("common.noResults")}
                      </div>
                    ) : (
                      services.map((service) => (
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
                {form.hasError("serviceId") && (
                  <p className="text-sm text-destructive">
                    {form.getError("serviceId")}
                  </p>
                )}
              </div>

              {/* Selected Service Info */}
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

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">{t("fields.date")} *</Label>
                  <Input id="date" type="date" {...form.register("date")} />
                  {form.hasError("date") && (
                    <p className="text-sm text-destructive">
                      {form.getError("date")}
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
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalState(null)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={form.isSubmitting || isCreating || isUpdating}
              >
                {form.isSubmitting || isCreating || isUpdating
                  ? t("common.loading")
                  : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Appointment Modal */}
      <Dialog
        open={isViewMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
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
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setModalState(null)}>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
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
              onClick={() => deleteAppointment()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
