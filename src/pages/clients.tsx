import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Mail, Phone, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/badge';
import { DataTable, type Column } from '@/components/table/data-table';
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
import { useTable } from '@/hooks/useTable';
import { useSalonGet, useSalonPost } from '@/hooks/useSalonData';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from '@/lib/toast';
import type { Client } from '@/types/entities';

interface CreateClientDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export function ClientsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateClientDto>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Fetch clients from API (scoped to current salon)
  const { data: clients = [], isLoading } = useSalonGet<Client[]>('clients');

  // Create client mutation (includes salonId automatically)
  const createClient = useSalonPost<Client, CreateClientDto>('clients', {
    onSuccess: () => {
      toast.success(t('clients.addClient') + ' - ' + t('common.success'));
      setIsAddModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', phone: '' });
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  const table = useTable<Client>({
    data: clients,
    searchKeys: ['firstName', 'lastName', 'email', 'phone'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createClient.mutate(formData);
  };

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: t('fields.name'),
      sortable: true,
      render: (client) => (
        <div>
          <p className="font-medium">
            {client.firstName} {client.lastName}
          </p>
          {client.email && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {client.email}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      header: t('fields.phone'),
      render: (client) =>
        client.phone ? (
          <span className="flex items-center gap-1 text-sm">
            <Phone className="h-3 w-3" />
            {client.phone}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'loyaltyPoints',
      header: t('fields.loyaltyPoints'),
      sortable: true,
      render: (client) => (
        <Badge variant={client.loyaltyPoints >= 500 ? 'success' : 'default'}>
          {client.loyaltyPoints} pts
        </Badge>
      ),
    },
    {
      key: 'totalSpent',
      header: t('fields.totalSpent'),
      sortable: true,
      render: (client) => (
        <span className="font-medium">{formatCurrency(client.totalSpent)}</span>
      ),
    },
    {
      key: 'visitCount',
      header: t('fields.visits'),
      sortable: true,
      render: (client) => (
        <span className="text-muted-foreground">{client.visitCount}</span>
      ),
    },
    {
      key: 'lastVisit',
      header: t('fields.lastVisit'),
      sortable: true,
      render: (client) =>
        client.lastVisit ? (
          new Date(client.lastVisit).toLocaleDateString()
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (_client) => (
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
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.clients')}
        description={t('clients.description', { count: clients.length })}
        actions={
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('clients.addClient')}
          </Button>
        }
      />

      <DataTable
        table={table}
        columns={columns}
        selectable
        searchPlaceholder={t('clients.searchPlaceholder')}
        emptyMessage={isLoading ? t('common.loading') : t('clients.noClients')}
      />

      {/* Add Client Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('clients.addClient')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('fields.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('fields.lastName')}</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
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
              <div className="space-y-2">
                <Label htmlFor="phone">{t('fields.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createClient.isPending}>
                {createClient.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
