import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Package,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/stats-card';

export function AnalyticsPage() {
  const { t } = useTranslation();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

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
          value={formatCurrency(0)}
          change={0}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title={t('analytics.totalAppointments')}
          value={0}
          change={0}
          icon={Calendar}
          iconColor="text-accent-blue"
          iconBgColor="bg-accent-blue/10"
        />
        <StatsCard
          title={t('analytics.newClients')}
          value={0}
          change={0}
          icon={Users}
          iconColor="text-accent-pink"
          iconBgColor="bg-accent-pink/10"
        />
        <StatsCard
          title={t('analytics.averageTicket')}
          value={formatCurrency(0)}
          change={0}
          icon={BarChart3}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </div>

      {/* Empty Revenue Chart */}
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

        {/* Empty state chart */}
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucune donnée à afficher</p>
            <p className="text-sm">Les données apparaîtront ici après vos premières ventes</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Services - Empty */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('analytics.topServices')}</h2>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucun service réservé</p>
            </div>
          </div>
        </Card>

        {/* Top Products - Empty */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('analytics.topProducts')}</h2>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucun produit vendu</p>
            </div>
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
            <p className="text-2xl font-bold">0%</p>
            <p className="text-xs text-muted-foreground">-</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-accent-blue" />
              <span className="text-sm text-muted-foreground">{t('analytics.clientRetention')}</span>
            </div>
            <p className="text-2xl font-bold">0%</p>
            <p className="text-xs text-muted-foreground">-</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-accent-pink" />
              <span className="text-sm text-muted-foreground">{t('analytics.noShowRate')}</span>
            </div>
            <p className="text-2xl font-bold">0%</p>
            <p className="text-xs text-muted-foreground">-</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">{t('analytics.productSalesRatio')}</span>
            </div>
            <p className="text-2xl font-bold">0%</p>
            <p className="text-xs text-muted-foreground">-</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
