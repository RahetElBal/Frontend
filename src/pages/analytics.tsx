import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Package,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/stats-card';
import type { DashboardStats, RevenueData, TopService, TopProduct } from '@/types/entities';

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

const revenueData: RevenueData[] = [];
const topServices: TopService[] = [];
const topProducts: TopProduct[] = [];

export function AnalyticsPage() {
  const { t } = useTranslation();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

  // Calculate totals from revenue data
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalAppointments = revenueData.reduce((sum, d) => sum + d.appointments, 0);
  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.analytics')}
        description={t('analytics.description')}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              {t('analytics.last7Days')}
            </Button>
            <Button variant="outline" size="sm">
              {t('analytics.last30Days')}
            </Button>
            <Button variant="outline" size="sm">
              {t('analytics.thisMonth')}
            </Button>
          </div>
        }
      />

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('analytics.totalRevenue')}
          value={formatCurrency(totalRevenue)}
          change={dashboardStats.revenueChange}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title={t('analytics.totalAppointments')}
          value={totalAppointments}
          change={dashboardStats.appointmentsChange}
          icon={Calendar}
          iconColor="text-accent-blue"
          iconBgColor="bg-accent-blue/10"
        />
        <StatsCard
          title={t('analytics.newClients')}
          value={dashboardStats.newClients}
          change={dashboardStats.clientsChange}
          icon={Users}
          iconColor="text-accent-pink"
          iconBgColor="bg-accent-pink/10"
        />
        <StatsCard
          title={t('analytics.averageTicket')}
          value={formatCurrency(dashboardStats.averageTicket)}
          change={dashboardStats.ticketChange}
          icon={BarChart3}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </div>

      {/* Revenue Chart (Simple bar visualization) */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{t('analytics.revenueOverTime')}</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-accent-pink" />
              <span className="text-muted-foreground">{t('analytics.revenue')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-accent-blue" />
              <span className="text-muted-foreground">{t('analytics.appointments')}</span>
            </div>
          </div>
        </div>

        {/* Simple bar chart */}
        <div className="h-64 flex items-end gap-2">
          {revenueData.map((day, index) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center gap-1 h-52">
                {/* Revenue bar */}
                <div
                  className="w-full max-w-[40px] bg-accent-pink rounded-t transition-all hover:bg-accent-pink/80"
                  style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                  title={formatCurrency(day.revenue)}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Services */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('analytics.topServices')}</h2>
          <div className="space-y-4">
            {topServices.map((service, index) => {
              const maxServiceRevenue = topServices[0]?.revenue || 1;
              const percentage = (service.revenue / maxServiceRevenue) * 100;

              return (
                <div key={service.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="text-end">
                      <p className="font-semibold">{formatCurrency(service.revenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.count} {t('analytics.bookings')}
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-pink transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('analytics.topProducts')}</h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => {
              const maxProductRevenue = topProducts[0]?.revenue || 1;
              const percentage = (product.revenue / maxProductRevenue) * 100;

              return (
                <div key={product.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <div className="text-end">
                      <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.count} {t('analytics.sold')}
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-blue transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t('analytics.kpis')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">{t('analytics.conversionRate')}</span>
            </div>
            <p className="text-2xl font-bold">78%</p>
            <p className="text-xs text-green-600">+5% {t('analytics.vsLastMonth')}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-accent-blue" />
              <span className="text-sm text-muted-foreground">{t('analytics.clientRetention')}</span>
            </div>
            <p className="text-2xl font-bold">85%</p>
            <p className="text-xs text-green-600">+2% {t('analytics.vsLastMonth')}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-accent-pink" />
              <span className="text-sm text-muted-foreground">{t('analytics.noShowRate')}</span>
            </div>
            <p className="text-2xl font-bold">3%</p>
            <p className="text-xs text-green-600">-1% {t('analytics.vsLastMonth')}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">{t('analytics.productSalesRatio')}</span>
            </div>
            <p className="text-2xl font-bold">32%</p>
            <p className="text-xs text-red-600">-3% {t('analytics.vsLastMonth')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
