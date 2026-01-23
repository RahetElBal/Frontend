import { useTranslation } from 'react-i18next';
import { Plus, AlertTriangle, Package, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

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
import type { Product } from '@/types/entities';
import { cn } from '@/lib/utils';

// TODO: Replace with real API data
const products: Product[] = [];

export function ProductsPage() {
  const { t } = useTranslation();

  const table = useTable<Product>({
    data: products,
    searchKeys: ['name', 'sku', 'barcode'],
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

  // Count low stock items
  const lowStockCount = products.filter(
    (p) => p.minStock !== undefined && p.stock <= p.minStock
  ).length;

  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: t('fields.product'),
      sortable: true,
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">
              SKU: {product.sku || '-'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('fields.category'),
      render: (product) => (
        <div className="flex items-center gap-2">
          {product.category && (
            <>
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: product.category.color }}
              />
              <span>{product.category.name}</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      header: t('fields.price'),
      sortable: true,
      render: (product) => (
        <div>
          <p className="font-medium">{formatCurrency(product.price)}</p>
          {product.cost && (
            <p className="text-xs text-muted-foreground">
              {t('products.cost')}: {formatCurrency(product.cost)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: t('fields.stock'),
      sortable: true,
      render: (product) => {
        const isLowStock = product.minStock !== undefined && product.stock <= product.minStock;
        const isOutOfStock = product.stock === 0;

        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-medium',
                isOutOfStock && 'text-red-600',
                isLowStock && !isOutOfStock && 'text-yellow-600'
              )}
            >
              {product.stock}
            </span>
            {isOutOfStock && (
              <Badge variant="error">{t('products.outOfStock')}</Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge variant="warning">{t('products.lowStock')}</Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (_product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
        title={t('nav.products')}
        description={t('products.description', { count: products.length })}
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('products.addProduct')}
          </Button>
        }
      />

      {/* Stock Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">
                {t('products.stockAlerts')}
              </p>
              <p className="text-sm text-yellow-700">
                {outOfStockCount > 0 && (
                  <span className="font-semibold text-red-600">
                    {outOfStockCount} {t('products.outOfStock')}
                  </span>
                )}
                {outOfStockCount > 0 && lowStockCount > 0 && ' • '}
                {lowStockCount > 0 && (
                  <span className="font-semibold text-yellow-600">
                    {lowStockCount} {t('products.lowStock')}
                  </span>
                )}
              </p>
            </div>
          </div>
        </Card>
      )}

      <DataTable
        table={table}
        columns={columns}
        selectable
        searchPlaceholder={t('products.searchPlaceholder')}
        emptyMessage={t('products.noProducts')}
      />
    </div>
  );
}
