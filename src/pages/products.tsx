import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTable } from '@/hooks/useTable';
import { useSalonGet, useSalonPost } from '@/hooks/useSalonData';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from '@/lib/toast';
import type { Product } from '@/types/entities';
import { cn } from '@/lib/utils';

interface CreateProductDto {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
}

export function ProductsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    description: '',
    sku: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
  });

  // Fetch products from API (scoped to current salon)
  const { data: products = [], isLoading } = useSalonGet<Product[]>('products');

  // Create product mutation (includes salonId automatically)
  const createProduct = useSalonPost<Product, CreateProductDto>('products', {
    onSuccess: () => {
      toast.success(t('products.addProduct') + ' - ' + t('common.success'));
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '', sku: '', price: 0, cost: 0, stock: 0, minStock: 5 });
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  const table = useTable<Product>({
    data: products,
    searchKeys: ['name', 'sku', 'barcode'],
  });

  const lowStockCount = products.filter(
    (p) => p.minStock !== undefined && p.stock <= p.minStock
  ).length;

  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate(formData);
  };

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
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
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
        emptyMessage={isLoading ? t('common.loading') : t('products.noProducts')}
      />

      {/* Add Product Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('products.addProduct')}</DialogTitle>
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
                <Label htmlFor="description">{t('fields.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('fields.price')}</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">{t('products.cost')}</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">{t('fields.stock')}</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">{t('products.minStock')}</Label>
                  <Input
                    id="minStock"
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
