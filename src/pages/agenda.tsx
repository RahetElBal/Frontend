import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Scissors,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/badge';
import { cn } from '@/lib/utils';
import { AppointmentStatus } from '@/types/entities';
import type { Appointment, User as UserType } from '@/types/entities';

// TODO: Replace with real API data
const appointments: Appointment[] = [];
const staff: UserType[] = [];

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
  '18:00',
];

export function AgendaPage() {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const goToPrevDay = () => {
    setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)));
  };

  const goToNextDay = () => {
    setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Get appointments for each staff member
  const getStaffAppointments = (staffId: string) =>
    appointments.filter((apt) => apt.staffId === staffId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.agenda')}
        description={t('agenda.description')}
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('agenda.newAppointment')}
          </Button>
        }
      />

      {/* Date Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
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
            <Badge variant="success">{appointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length} {t('agenda.confirmed')}</Badge>
            <Badge variant="warning">{appointments.filter(a => a.status === AppointmentStatus.PENDING).length} {t('agenda.pending')}</Badge>
          </div>
        </div>
      </Card>

      {/* Agenda Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Staff Headers */}
          <div className="grid grid-cols-[80px_repeat(3,1fr)] gap-2 mb-2">
            <div className="h-12" /> {/* Empty corner */}
            {staff.map((member) => (
              <Card key={member.id} className="p-3 text-center">
                <p className="font-medium">{member.firstName}</p>
                <p className="text-xs text-muted-foreground">
                  {getStaffAppointments(member.id).length} {t('agenda.appointments')}
                </p>
              </Card>
            ))}
          </div>

          {/* Time Slots */}
          <div className="space-y-1">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-[80px_repeat(3,1fr)] gap-2">
                {/* Time Label */}
                <div className="flex items-center justify-end pe-2 text-sm text-muted-foreground">
                  {time}
                </div>

                {/* Staff Columns */}
                {staff.map((member) => {
                  const appointment = appointments.find(
                    (apt) => apt.staffId === member.id && apt.startTime === time
                  );

                  return (
                    <div
                      key={`${member.id}-${time}`}
                      className={cn(
                        'min-h-[60px] rounded-lg border-2 border-dashed border-transparent transition-colors',
                        !appointment && 'hover:border-accent-pink/30 hover:bg-accent-pink/5 cursor-pointer'
                      )}
                    >
                      {appointment && (
                        <Card
                          className={cn(
                            'h-full p-3 cursor-pointer hover:shadow-md transition-shadow',
                            appointment.status === AppointmentStatus.CONFIRMED && 'border-l-4 border-l-green-500',
                            appointment.status === AppointmentStatus.PENDING && 'border-l-4 border-l-yellow-500',
                            appointment.status === AppointmentStatus.IN_PROGRESS && 'border-l-4 border-l-blue-500'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <User className="h-3 w-3" />
                                {appointment.client?.firstName} {appointment.client?.lastName}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Scissors className="h-3 w-3" />
                                {appointment.service?.name}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {appointment.startTime} - {appointment.endTime}
                              </div>
                            </div>
                            <Badge variant={statusColors[appointment.status]} className="text-xs">
                              {appointment.status}
                            </Badge>
                          </div>
                        </Card>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
