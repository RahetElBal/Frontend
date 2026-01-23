import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AppointmentStatus } from '@/types/entities';
import type { Appointment, Client, Service } from '@/types/entities';
import { useSalonGet, useSalonPost } from '@/hooks/useSalonData';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from '@/lib/toast';
import { 
  showNotification, 
  requestNotificationPermission,
  scheduleReminder,
  cancelAllReminders,
  type AppointmentReminder 
} from '@/lib/notifications';

interface CreateAppointmentDto {
  clientId: string;
  serviceId: string;
  date: string;
  startTime: string;
  notes?: string;
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'info' | 'error'> = {
  [AppointmentStatus.CONFIRMED]: 'success',
  [AppointmentStatus.PENDING]: 'warning',
  [AppointmentStatus.IN_PROGRESS]: 'info',
  [AppointmentStatus.COMPLETED]: 'default',
  [AppointmentStatus.CANCELLED]: 'error',
  [AppointmentStatus.NO_SHOW]: 'error',
};

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00',
];

export function AgendaPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    notes: '',
  });

  // Fetch data from API (scoped to current salon)
  const { data: appointments = [], isLoading } = useSalonGet<Appointment[]>('appointments');
  const { data: clients = [] } = useSalonGet<Client[]>('clients');
  const { data: services = [] } = useSalonGet<Service[]>('services');

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().then(setNotificationsEnabled);
  }, []);

  // Handle appointment reminder
  const handleReminder = useCallback((reminder: AppointmentReminder) => {
    showNotification(
      `${t('agenda.reminderTitle')} - ${reminder.time}`,
      {
        body: `${reminder.clientName} - ${reminder.serviceName}`,
        playSound: true,
        onClick: () => {
          // Navigate to the appointment date
          setSelectedDate(new Date(reminder.date));
        },
      }
    );
    toast.info(`${t('agenda.upcomingAppointment')}: ${reminder.clientName} - ${reminder.serviceName} à ${reminder.time}`);
  }, [t]);

  // Schedule reminders for today's appointments
  useEffect(() => {
    if (!notificationsEnabled || appointments.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(
      apt => apt.date === today && apt.status !== 'cancelled' && apt.status !== 'completed'
    );

    // Schedule reminders (15 minutes before)
    todayAppointments.forEach(apt => {
      const reminder: AppointmentReminder = {
        id: `reminder-${apt.id}`,
        appointmentId: apt.id,
        clientName: apt.client ? `${apt.client.firstName} ${apt.client.lastName}` : 'Client',
        serviceName: apt.service?.name || 'Service',
        time: apt.startTime,
        date: apt.date,
        reminderTime: new Date(),
      };
      scheduleReminder(reminder, 15, handleReminder);
    });

    // Cleanup on unmount
    return () => cancelAllReminders();
  }, [appointments, notificationsEnabled, handleReminder]);

  // Create appointment mutation (includes salonId automatically)
  const createAppointment = useSalonPost<Appointment, CreateAppointmentDto>('appointments', {
    onSuccess: () => {
      toast.success(t('agenda.newAppointment') + ' - ' + t('common.success'));
      closeModal();
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  // Get selected service details
  const selectedService = useMemo(() => 
    services.find(s => s.id === formData.serviceId),
    [services, formData.serviceId]
  );

  const formatDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  const closeModal = () => {
    setIsAddModalOpen(false);
    setFormData({
      clientId: '',
      serviceId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      notes: '',
    });
  };

  const openModalWithTime = (time: string) => {
    setFormData({
      ...formData,
      startTime: time,
      date: selectedDate.toISOString().split('T')[0],
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.serviceId) {
      toast.error(t('validation.requiredField'));
      return;
    }
    createAppointment.mutate({
      clientId: formData.clientId,
      serviceId: formData.serviceId,
      date: formData.date,
      startTime: formData.startTime,
      notes: formData.notes || undefined,
    });
  };

  // Get current hour for highlighting
  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinutes >= 30 ? '30' : '00'}`;

  // Filter appointments for the selected date
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const dayAppointments = appointments.filter(apt => apt.date === selectedDateStr);

  const confirmedCount = dayAppointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length;
  const pendingCount = dayAppointments.filter(a => a.status === AppointmentStatus.PENDING).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.agenda')}
        description={t('agenda.description')}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={notificationsEnabled ? 'default' : 'outline'}
              size="icon"
              onClick={() => {
                if (!notificationsEnabled) {
                  requestNotificationPermission().then(granted => {
                    setNotificationsEnabled(granted);
                    if (granted) {
                      toast.success(t('agenda.notificationsEnabled'));
                    }
                  });
                }
              }}
              title={notificationsEnabled ? t('agenda.notificationsOn') : t('agenda.enableNotifications')}
            >
              {notificationsEnabled ? (
                <BellRing className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
            </Button>
            <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4" />
              {t('agenda.newAppointment')}
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
              {t('agenda.today')}
            </Button>
          </div>
          <h2 className="text-lg font-semibold capitalize">{formatDate(selectedDate)}</h2>
          <div className="flex items-center gap-2">
            <Badge variant="success">{confirmedCount} {t('agenda.confirmed')}</Badge>
            <Badge variant="warning">{pendingCount} {t('agenda.pending')}</Badge>
          </div>
        </div>
      </Card>

      {/* Timeline View */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">{t('common.loading')}</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="relative">
                {timeSlots.map((time) => {
                  const isCurrentTime = time === currentTimeString;
                  const isPastTime = time < currentTimeString;
                  const appointment = dayAppointments.find(apt => apt.startTime === time);

                  return (
                    <div
                      key={time}
                      className={cn(
                        'flex border-b relative',
                        isCurrentTime && 'bg-accent-pink/5',
                        isPastTime && 'opacity-60'
                      )}
                    >
                      <div className={cn(
                        'w-20 flex-shrink-0 py-4 px-3 text-sm font-medium border-r bg-muted/30',
                        isCurrentTime && 'text-accent-pink font-bold'
                      )}>
                        {time}
                      </div>

                      <div
                        className={cn(
                          'flex-1 min-h-[60px] p-2 hover:bg-muted/30 cursor-pointer transition-colors',
                          !appointment && 'border-l-4 border-l-transparent hover:border-l-accent-pink/30'
                        )}
                        onClick={() => {
                          if (!appointment) {
                            openModalWithTime(time);
                          }
                        }}
                      >
                        {appointment ? (
                          <div
                            className={cn(
                              'rounded-lg p-3 h-full cursor-pointer hover:shadow-md transition-all',
                              'border-l-4',
                              appointment.status === AppointmentStatus.CONFIRMED && 'bg-green-50 border-l-green-500',
                              appointment.status === AppointmentStatus.PENDING && 'bg-yellow-50 border-l-yellow-500',
                              appointment.status === AppointmentStatus.IN_PROGRESS && 'bg-blue-50 border-l-blue-500',
                              appointment.status === AppointmentStatus.COMPLETED && 'bg-gray-50 border-l-gray-400',
                              appointment.status === AppointmentStatus.CANCELLED && 'bg-red-50 border-l-red-500'
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {appointment.client?.firstName} {appointment.client?.lastName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Scissors className="h-3 w-3" />
                                  <span>{appointment.service?.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{appointment.startTime} - {appointment.endTime}</span>
                                </div>
                              </div>
                              <Badge variant={statusColors[appointment.status]} className="text-xs flex-shrink-0">
                                {appointment.status}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground/50 text-sm">
                            <Plus className="h-4 w-4 me-1" />
                            {t('agenda.addSlot')}
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
                      top: `${((currentHour - 9) * 2 + (currentMinutes >= 30 ? 1 : 0)) * 60 + (currentMinutes % 30) * 2}px`
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
            <h3 className="text-lg font-semibold mb-2">{t('agenda.noAppointments')}</h3>
            <p className="text-muted-foreground mb-4">{t('agenda.noAppointmentsDescription')}</p>
          </div>
        )}
      </Card>

      {/* Add Appointment Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('agenda.newAppointment')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Client Selection */}
              <div className="space-y-2">
                <Label>{t('fields.client')} *</Label>
                <Select 
                  value={formData.clientId} 
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('agenda.selectClient')} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground text-sm">
                        {t('clients.noClients')}
                      </div>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {client.firstName} {client.lastName}
                            {client.phone && (
                              <span className="text-muted-foreground text-xs">({client.phone})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <Label>{t('fields.service')} *</Label>
                <Select 
                  value={formData.serviceId} 
                  onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('agenda.selectService')} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground text-sm">
                        {t('services.services')} - {t('common.noResults')}
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
                              {service.duration}min - {formatCurrency(service.price)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Service Info */}
              {selectedService && (
                <Card className="p-3 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedService.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('fields.duration')}: {selectedService.duration} min
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
                  <Label htmlFor="date">{t('fields.date')} *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">{t('fields.time')} *</Label>
                  <Select
                    value={formData.startTime}
                    onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">{t('fields.notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Notes supplémentaires..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={createAppointment.isPending || !formData.clientId || !formData.serviceId}
              >
                {createAppointment.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
