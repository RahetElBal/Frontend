import { useTranslation } from 'react-i18next';
import { Plus, Building2, MoreHorizontal, Eye, Edit, Trash2, Users } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock salons data
const mockSalons = [
  {
    id: 'salon-1',
    name: 'Beautiq Paris',
    address: '123 Rue de Paris, 75001 Paris',
    phone: '+33 1 23 45 67 89',
    email: 'contact@beautiq-paris.com',
    usersCount: 5,
    status: 'active',
    subscription: 'premium',
    createdAt: '2023-06-01T00:00:00Z',
    monthlyRevenue: 12500,
  },
  {
    id: 'salon-2',
    name: 'Glamour Studio',
    address: '45 Avenue des Champs, 75008 Paris',
    phone: '+33 1 98 76 54 32',
    email: 'info@glamour-studio.com',
    usersCount: 3,
    status: 'active',
    subscription: 'basic',
    createdAt: '2023-09-15T00:00:00Z',
    monthlyRevenue: 8200,
  },
  {
    id: 'salon-3',
    name: 'Style & Co',
    address: '78 Boulevard Saint-Germain, 75006 Paris',
    phone: '+33 1 11 22 33 44',
    email: 'hello@styleco.com',
    usersCount: 4,
    status: 'pending',
    subscription: 'trial',
    createdAt: '2024-01-10T00:00:00Z',
    monthlyRevenue: 0,
  },
  {
    id: 'salon-4',
    name: 'Beauty Bar',
    address: '12 Rue du Commerce, 75015 Paris',
    phone: '+33 1 55 66 77 88',
    email: 'contact@beautybar.fr',
    usersCount: 2,
    status: 'active',
    subscription: 'basic',
    createdAt: '2023-11-20T00:00:00Z',
    monthlyRevenue: 5600,
  },
  {
    id: 'salon-5',
    name: 'Élégance Spa',
    address: '90 Avenue Montaigne, 75008 Paris',
    phone: '+33 1 99 88 77 66',
    email: 'reservations@elegance-spa.com',
    usersCount: 8,
    status: 'active',
    subscription: 'premium',
    createdAt: '2023-04-05T00:00:00Z',
    monthlyRevenue: 18500,
  },
];

const statusColors: Record<string, 'success' | 'warning' | 'error'> = {
  active: 'success',
  pending: 'warning',
  suspended: 'error',
};

const subscriptionColors: Record<string, 'default' | 'info' | 'success'> = {
  trial: 'default',
  basic: 'info',
  premium: 'success',
};

export function AdminSalonsPage() {
  const { t } = useTranslation();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

  // Stats
  const totalSalons = mockSalons.length;
  const activeSalons = mockSalons.filter((s) => s.status === 'active').length;
  const totalUsers = mockSalons.reduce((sum, s) => sum + s.usersCount, 0);
  const totalRevenue = mockSalons.reduce((sum, s) => sum + s.monthlyRevenue, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.admin.salons')}
        description={t('admin.salons.description')}
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.salons.addSalon')}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('admin.salons.totalSalons')}</p>
          <p className="text-2xl font-bold">{totalSalons}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('admin.salons.activeSalons')}</p>
          <p className="text-2xl font-bold text-green-600">{activeSalons}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('admin.salons.totalUsers')}</p>
          <p className="text-2xl font-bold">{totalUsers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('admin.salons.monthlyRevenue')}</p>
          <p className="text-2xl font-bold text-accent-pink">{formatCurrency(totalRevenue)}</p>
        </Card>
      </div>

      {/* Salons Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockSalons.map((salon) => (
          <Card key={salon.id} className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-accent-pink/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-accent-pink" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{salon.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={statusColors[salon.status]}>{salon.status}</Badge>
                      <Badge variant={subscriptionColors[salon.subscription]}>
                        {salon.subscription}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 me-2" />
                      {t('common.view')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 me-2" />
                      {t('common.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 me-2" />
                      {t('common.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="text-muted-foreground">{salon.address}</p>
                <p className="text-muted-foreground">{salon.email}</p>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {salon.usersCount} {t('admin.salons.users')}
                </div>
                <p className="font-semibold text-green-600">
                  {formatCurrency(salon.monthlyRevenue)}/mo
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
