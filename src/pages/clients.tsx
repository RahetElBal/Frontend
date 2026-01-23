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
import { useTable } from '@/hooks/useTable';
import type { Client } from '@/types/entities';

// TODO: Replace with real API data
const clients: Client[] = [];

export function ClientsPage() {
  const { t } = useTranslation();

  const table = useTable<Client>({
    data: clients,
    searchKeys: ['firstName', 'lastName', 'email', 'phone'],
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

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
      render: (client) => (
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
          <Button className="gap-2">
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
        emptyMessage={t('clients.noClients')}
      />
    </div>
  );
}
