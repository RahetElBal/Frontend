import { useTranslation } from 'react-i18next';
import {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';

import { useUser } from '@/hooks/useUser';
import { Spinner } from '@/components/spinner';
import { PageHeader } from '@/components/page-header';
import { StatsCard } from '@/components/stats-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/badge';
import { cn } from '@/lib/utils';
import { AppointmentStatus } from '@/types/entities';
import type { Appointment, TopService, DashboardStats } from '@/types/entities';

// TODO: Replace with real API data
const dashboardStats: DashboardStats = {
  todayRevenue: 0,
  todayAppointments: 0,
  newClients: 0,
  averageTicket: 0,
  revenueChange: 0,
  appointmentsChange: 0,
  clientsChange: 0,
  ticketChange: 0,
};

const appointments: Appointment[] = [];
const topServices: TopService[] = [];

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  [AppointmentStatus.CONFIRMED]: 'success',
  [AppointmentStatus.PENDING]: 'warning',
  [AppointmentStatus.IN_PROGRESS]: 'info',
  [AppointmentStatus.COMPLETED]: 'default',
};

export function DashboardPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : '';

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={t('common.welcome', { name: displayName })}
        description={t('nav.dashboard')}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('dashboard.todayRevenue')}
          value={formatCurrency(dashboardStats.todayRevenue)}
          change={dashboardStats.revenueChange}
          changeLabel={t('dashboard.vsLastWeek')}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title={t('dashboard.todayAppointments')}
          value={dashboardStats.todayAppointments}
          change={dashboardStats.appointmentsChange}
          changeLabel={t('dashboard.vsLastWeek')}
          icon={Calendar}
          iconColor="text-accent-blue"
          iconBgColor="bg-accent-blue/10"
        />
        <StatsCard
          title={t('dashboard.newClients')}
          value={dashboardStats.newClients}
          change={dashboardStats.clientsChange}
          changeLabel={t('dashboard.vsLastWeek')}
          icon={Users}
          iconColor="text-accent-pink"
          iconBgColor="bg-accent-pink/10"
        />
        <StatsCard
          title={t('dashboard.averageTicket')}
          value={formatCurrency(dashboardStats.averageTicket)}
          change={dashboardStats.ticketChange}
          changeLabel={t('dashboard.vsLastWeek')}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Appointments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('dashboard.todaysAppointments')}</h2>
            <Button variant="ghost" size="sm" className="gap-1">
              {t('common.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t('dashboard.noAppointments')}</p>
            ) : (
              appointments.slice(0, 5).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-accent-pink/10 text-accent-pink">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {apt.client?.firstName} {apt.client?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {apt.service?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="font-medium">{apt.startTime}</p>
                    <Badge variant={statusColors[apt.status]}>
                      {apt.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top Services */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('dashboard.topServices')}</h2>
            <Button variant="ghost" size="sm" className="gap-1">
              {t('common.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {topServices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t('dashboard.noServices')}</p>
            ) : (
              topServices.map((service, index) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold',
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                          ? 'bg-gray-200 text-gray-700'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.count} {t('dashboard.bookings')}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(service.revenue)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
