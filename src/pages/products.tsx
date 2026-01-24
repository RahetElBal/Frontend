import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Plus, AlertTriangle, Package, MoreHorizontal, Edit, Trash2, Eye, DollarSign, BarChart3 } from 'lucide-react';
import { requiredString, optionalString } from '@/common/validator/zodI18n';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/badge';
import { DataTable, type Column } from '@/components/table/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTable } from '@/hooks/useTable';
import { useSalonGet, useSalonPost } from '@/hooks/useSalonData';
import { useLanguage } from '@/hooks/useLanguage';
import { useForm } from '@/hooks/useForm';
import { toast } from '@/lib/toast';
import type { Product } from '@/types/entities';
import { cn } from '@/lib/utils';

// Modal state type
type ProductModalState = {
  productId: string | 'create';
  mode: 'view' | 'edit' | 'delete';
} | null;

// Zod schema for product form
const productFormSchema = z.object({
  name: requiredString('Nom'),
  description: optionalString(),
  sku: optionalString(),
  price: z.coerce.number().min(0, 'validation.number.positive'),
  cost: z.coerce.number().min(0, 'validation.number.positive').optional(),
  stock: z.coerce.number().min(0, 'validation.number.positive'),
  minStock: z.coerce.number().min(0, 'validation.number.positive').optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export function ProductsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  
  // Unified modal state
  const [modalState, setModalState] = useState<ProductModalState>(null);

  // Fetch products from API (scoped to current salon)
  const { data: products = [], isLoading, refetch } = useSalonGet<Product[]>('products');

  // Helper functions
  const getSelectedProduct = (): Product | null => {
    if (!modalState || modalState.productId === 'create') return null;
    return products.find((p) => p.id === modalState.productId) || null;
  };

  const selectedProduct = getSelectedProduct();
  const isCreateMode = modalState?.productId === 'create';
  const isEditMode = modalState?.mode === 'edit' && !isCreateMode;
  const isViewMode = modalState?.mode === 'view';
  const isDeleteMode = modalState?.mode === 'delete';

  // Form setup
  const form = useForm<ProductFormData>({
    schema: productFormSchema,
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 5,
    },
  });

  // Reset form when modal state changes
  useEffect(() => {
    if (isCreateMode) {
      form.reset({
        name: '',
        description: '',
        sku: '',
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 5,
      });
    } else if (selectedProduct && isEditMode) {
      form.reset({
        name: selectedProduct.name,
        description: selectedProduct.description || '',
        sku: selectedProduct.sku || '',
        price: selectedProduct.price,
        cost: selectedProduct.cost || 0,
        stock: selectedProduct.stock,
        minStock: selectedProduct.minStock || 5,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState, selectedProduct, isCreateMode, isEditMode]);

  // Create product mutation
  const { mutate: createProduct, isPending: isCreating } = useSalonPost<Product, ProductFormData>('products', {
    onSuccess: () => {
      toast.success(t('products.addProduct') + ' - ' + t('common.success'));
      setModalState(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  // Update product mutation
  const { mutate: updateProduct, isPending: isUpdating } = useSalonPost<Product, ProductFormData>('products', {
    id: selectedProduct?.id,
    method: 'PATCH',
    onSuccess: () => {
      toast.success(t('common.edit') + ' - ' + t('common.success'));
      setModalState(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  // Delete product mutation
  const { mutate: deleteProduct, isPending: isDeleting } = useSalonPost<void, void>('products', {
    id: selectedProduct?.id,
    method: 'DELETE',
    onSuccess: () => {
      toast.success(t('common.delete') + ' - ' + t('common.success'));
      setModalState(null);
      refetch();
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

  // Handlers
  const handleView = (product: Product) => {
    setModalState({ productId: product.id, mode: 'view' });
  };

  const handleEdit = (product: Product) => {
    setModalState({ productId: product.id, mode: 'edit' });
  };

  const handleDelete = (product: Product) => {
    setModalState({ productId: product.id, mode: 'delete' });
  };

  const handleSubmit = (data: ProductFormData) => {
    if (isEditMode) {
      updateProduct(data);
    } else {
      createProduct(data);
    }
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
      render: (product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(product)}>
              <Eye className="h-4 w-4 me-2" />
              {t('common.view')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(product)}>
              <Edit className="h-4 w-4 me-2" />
              {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive">
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
          <Button className="gap-2" onClick={() => setModalState({ productId: 'create', mode: 'edit' })}>
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

      {/* Create/Edit Product Modal */}
      <Dialog open={isEditMode || isCreateMode} onOpenChange={(open) => !open && setModalState(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? t('products.addProduct') : t('common.edit')}
            </DialogTitle>
            {isEditMode && selectedProduct && (
              <DialogDescription>{selectedProduct.name}</DialogDescription>
            )}
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('fields.name')} *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                />
                {form.hasError('name') && (
                  <p className="text-sm text-destructive">{form.getError('name')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('fields.description')}</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  {...form.register('sku')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('fields.price')} *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    {...form.register('price')}
                  />
                  {form.hasError('price') && (
                    <p className="text-sm text-destructive">{form.getError('price')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">{t('products.cost')}</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    {...form.register('cost')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">{t('fields.stock')} *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    {...form.register('stock')}
                  />
                  {form.hasError('stock') && (
                    <p className="text-sm text-destructive">{form.getError('stock')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">{t('products.minStock')}</Label>
                  <Input
                    id="minStock"
                    type="number"
                    min="0"
                    {...form.register('minStock')}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalState(null)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={form.isSubmitting || isCreating || isUpdating}>
                {form.isSubmitting || isCreating || isUpdating ? t('common.loading') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Product Modal */}
      <Dialog open={isViewMode} onOpenChange={(open) => !open && setModalState(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('products.productDetails')}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedProduct.name}</h3>
                  {selectedProduct.sku && (
                    <p className="text-muted-foreground">SKU: {selectedProduct.sku}</p>
                  )}
                </div>
              </div>

              {selectedProduct.description && (
                <p className="text-muted-foreground">{selectedProduct.description}</p>
              )}

              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('fields.price')}</p>
                    <p className="font-medium text-accent-pink">{formatCurrency(selectedProduct.price)}</p>
                    {selectedProduct.cost && (
                      <p className="text-xs text-muted-foreground">
                        {t('products.cost')}: {formatCurrency(selectedProduct.cost)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('fields.stock')}</p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-medium',
                        selectedProduct.stock === 0 && 'text-red-600',
                        selectedProduct.minStock && selectedProduct.stock <= selectedProduct.minStock && selectedProduct.stock > 0 && 'text-yellow-600'
                      )}>
                        {selectedProduct.stock}
                      </span>
                      {selectedProduct.stock === 0 && (
                        <Badge variant="error">{t('products.outOfStock')}</Badge>
                      )}
                      {selectedProduct.minStock && selectedProduct.stock <= selectedProduct.minStock && selectedProduct.stock > 0 && (
                        <Badge variant="warning">{t('products.lowStock')}</Badge>
                      )}
                    </div>
                    {selectedProduct.minStock && (
                      <p className="text-xs text-muted-foreground">
                        {t('products.minStock')}: {selectedProduct.minStock}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalState(null)}>
              {t('common.close')}
            </Button>
            {selectedProduct && (
              <Button onClick={() => setModalState({ productId: selectedProduct.id, mode: 'edit' })}>
                <Edit className="h-4 w-4 me-2" />
                {t('common.edit')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteMode} onOpenChange={(open) => !open && setModalState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('products.deleteProduct')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('products.deleteProductConfirm', { name: selectedProduct?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProduct()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('common.loading') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
