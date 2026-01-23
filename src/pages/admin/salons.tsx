import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGet } from '@/hooks/useGet';
import { usePost } from '@/hooks/usePost';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from '@/lib/toast';
import type { Salon } from '@/types/entities';

interface CreateSalonDto {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export function AdminSalonsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateSalonDto>({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  // Fetch salons from API
  const { data: salons = [], isLoading } = useGet<Salon[]>('salons');

  // Create salon mutation
  const createSalon = usePost<Salon, CreateSalonDto>('salons', {
    onSuccess: () => {
      toast.success(t('admin.salons.addSalon') + ' - ' + t('common.success'));
      setIsAddModalOpen(false);
      setFormData({ name: '', address: '', phone: '', email: '' });
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  // Stats
  const totalSalons = salons.length;
  const activeSalons = salons.filter((s) => s.isActive).length;
  const totalUsers = salons.reduce((sum, s) => sum + (s.users?.length || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createSalon.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.admin.salons')}
        description={t('admin.salons.description')}
        actions={
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
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
          <p className="text-2xl font-bold text-accent-pink">{formatCurrency(0)}</p>
        </Card>
      </div>

      {/* Salons Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
      ) : salons.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun salon</h3>
          <p className="text-muted-foreground mb-4">Ajoutez votre premier salon</p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 me-2" />
            {t('admin.salons.addSalon')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {salons.map((salon) => (
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
                        <Badge variant={salon.isActive ? 'success' : 'warning'}>
                          {salon.isActive ? 'active' : 'inactive'}
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
                  {salon.address && <p className="text-muted-foreground">{salon.address}</p>}
                  {salon.email && <p className="text-muted-foreground">{salon.email}</p>}
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {salon.users?.length || 0} {t('admin.salons.users')}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Salon Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('admin.salons.addSalon')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('fields.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('fields.address')}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('fields.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('fields.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createSalon.isPending}>
                {createSalon.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
