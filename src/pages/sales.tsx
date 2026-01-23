import { useTranslation } from 'react-i18next';
import {
  Plus,
  Receipt,
  CreditCard,
  Banknote,
  MoreHorizontal,
  Eye,
  FileText,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/badge';
import { DataTable, type Column } from '@/components/table/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTable } from '@/hooks/useTable';
import type { Sale } from '@/types/entities';
import { PaymentMethod, SaleStatus } from '@/types/entities';

// TODO: Replace with real API data
const sales: Sale[] = [];
const averageTicket = 0;

const statusColors: Record<SaleStatus, 'default' | 'success' | 'warning' | 'error'> = {
  [SaleStatus.COMPLETED]: 'success',
  [SaleStatus.PENDING]: 'warning',
  [SaleStatus.REFUNDED]: 'error',
  [SaleStatus.CANCELLED]: 'error',
};

const paymentIcons: Record<PaymentMethod, typeof CreditCard> = {
  [PaymentMethod.CARD]: CreditCard,
  [PaymentMethod.CASH]: Banknote,
  [PaymentMethod.BANK_TRANSFER]: Receipt,
  [PaymentMethod.OTHER]: Receipt,
};

export function SalesPage() {
  const { t } = useTranslation();

  const table = useTable<Sale>({
    data: sales,
    searchKeys: ['id'],
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate totals
  const todayTotal = sales.reduce((sum, sale) => sum + sale.total, 0);

  const columns: Column<Sale>[] = [
    {
      key: 'id',
      header: t('fields.receipt'),
      render: (sale) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-accent-pink/10 flex items-center justify-center">
            <Receipt className="h-4 w-4 text-accent-pink" />
          </div>
          <div>
            <p className="font-mono text-sm">{sale.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-xs text-muted-foreground">{formatTime(sale.createdAt)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'client',
      header: t('fields.client'),
      render: (sale) =>
        sale.client ? (
          <span>
            {sale.client.firstName} {sale.client.lastName}
          </span>
        ) : (
          <span className="text-muted-foreground">{t('sales.walkIn')}</span>
        ),
    },
    {
      key: 'items',
      header: t('fields.items'),
      render: (sale) => (
        <div>
          <p className="text-sm">
            {sale.items.length} {sale.items.length === 1 ? t('common.item') : t('common.items')}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
            {sale.items.map((i) => i.name).join(', ')}
          </p>
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: t('fields.payment'),
      render: (sale) => {
        const Icon = paymentIcons[sale.paymentMethod];
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{sale.paymentMethod}</span>
          </div>
        );
      },
    },
    {
      key: 'total',
      header: t('fields.total'),
      sortable: true,
      render: (sale) => (
        <div>
          <p className="font-semibold">{formatCurrency(sale.total)}</p>
          {sale.discount > 0 && (
            <p className="text-xs text-green-600">
              -{formatCurrency(sale.discount)} {t('sales.discount')}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: t('fields.status'),
      render: (sale) => <Badge variant={statusColors[sale.status]}>{sale.status}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (_sale) => (
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
              <FileText className="h-4 w-4 me-2" />
              {t('sales.printReceipt')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.sales')}
        description={t('sales.description')}
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('sales.newSale')}
          </Button>
        }
      />

      {/* Today's Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('sales.todayTotal')}</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(todayTotal)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('sales.transactions')}</p>
          <p className="text-2xl font-bold">{sales.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('sales.averageTicket')}</p>
          <p className="text-2xl font-bold">{formatCurrency(averageTicket)}</p>
        </Card>
      </div>

      <DataTable
        table={table}
        columns={columns}
        searchPlaceholder={t('sales.searchPlaceholder')}
        emptyMessage={t('sales.noSales')}
      />
    </div>
  );
}
