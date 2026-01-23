import { useTranslation } from 'react-i18next';
import {
  Building2,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Shield,
} from 'lucide-react';

import { useUser } from '@/hooks/useUser';
import { Spinner } from '@/components/spinner';
import { PageHeader } from '@/components/page-header';
import { StatsCard } from '@/components/stats-card';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/badge';
import { UserRole } from '@/types/entities';

// Mock admin data
const mockAdminStats = {
  totalSalons: 12,
  totalUsers: 48,
  totalRevenue: 145000,
  activeSubscriptions: 10,
  salonsChange: 20,
  usersChange: 15,
  revenueChange: 8.5,
};

const mockRecentSalons = [
  { id: '1', name: 'Beautiq Paris', users: 5, status: 'active', createdAt: '2024-01-15' },
  { id: '2', name: 'Glamour Studio', users: 3, status: 'active', createdAt: '2024-01-12' },
  { id: '3', name: 'Style & Co', users: 4, status: 'pending', createdAt: '2024-01-10' },
  { id: '4', name: 'Beauty Bar', users: 2, status: 'active', createdAt: '2024-01-08' },
];

const mockRecentUsers = [
  { id: '1', name: 'Marie Dupont', email: 'marie@salon.com', role: 'owner', salon: 'Beautiq Paris' },
  { id: '2', name: 'Jean Martin', email: 'jean@glamour.com', role: 'staff', salon: 'Glamour Studio' },
  { id: '3', name: 'Sophie Leroy', email: 'sophie@style.com', role: 'owner', salon: 'Style & Co' },
];

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useUser({ requiredRole: UserRole.ADMIN });

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
        title={t('admin.dashboard.title')}
        description={t('admin.dashboard.welcome', { name: displayName })}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('admin.stats.totalSalons')}
          value={mockAdminStats.totalSalons}
          change={mockAdminStats.salonsChange}
          icon={Building2}
          iconColor="text-accent-pink"
          iconBgColor="bg-accent-pink/10"
        />
        <StatsCard
          title={t('admin.stats.totalUsers')}
          value={mockAdminStats.totalUsers}
          change={mockAdminStats.usersChange}
          icon={Users}
          iconColor="text-accent-blue"
          iconBgColor="bg-accent-blue/10"
        />
        <StatsCard
          title={t('admin.stats.totalRevenue')}
          value={formatCurrency(mockAdminStats.totalRevenue)}
          change={mockAdminStats.revenueChange}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title={t('admin.stats.activeSubscriptions')}
          value={mockAdminStats.activeSubscriptions}
          icon={Activity}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Salons */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('admin.dashboard.recentSalons')}</h2>
          <div className="space-y-3">
            {mockRecentSalons.map((salon) => (
              <div
                key={salon.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent-pink/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-accent-pink" />
                  </div>
                  <div>
                    <p className="font-medium">{salon.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {salon.users} {t('admin.dashboard.users')}
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  <Badge variant={salon.status === 'active' ? 'success' : 'warning'}>
                    {salon.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(salon.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Users */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('admin.dashboard.recentUsers')}</h2>
          <div className="space-y-3">
            {mockRecentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent-blue/10 flex items-center justify-center">
                    <span className="font-medium text-accent-blue">
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="text-end">
                  <Badge variant={user.role === 'owner' ? 'info' : 'default'}>
                    {user.role}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{user.salon}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* System Status */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t('admin.dashboard.systemStatus')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-green-700">{t('admin.status.apiOnline')}</span>
            </div>
            <p className="text-sm text-green-600 mt-1">{t('admin.status.allSystemsOperational')}</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-green-700">{t('admin.status.databaseOnline')}</span>
            </div>
            <p className="text-sm text-green-600 mt-1">PostgreSQL 15.2</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-green-700">{t('admin.status.storageOnline')}</span>
            </div>
            <p className="text-sm text-green-600 mt-1">45% {t('admin.status.used')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
