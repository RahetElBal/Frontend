import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
  Plus,
  AlertTriangle,
  Package,
  Edit,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { requiredString, optionalString } from "@/common/validator/zodI18n";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import { ServerDataTable } from "@/components/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/useLanguage";
import { useForm } from "@/hooks/useForm";
import { useUser } from "@/hooks/useUser";
import { toast } from "@/lib/toast";
import type { Product } from "./types";
import { cn } from "@/lib/utils";
import { usePost } from "@/hooks/usePost";
import { usePostAction } from "@/hooks/usePostAction";
import { useGet, withParams } from "@/hooks/useGet";
import {
  useCategoriesContext,
  useSalonCategories,
} from "@/contexts/CategoriesProvider";
import { getProductColumns } from "./components/list/columns";
import type { PaginatedResponse } from "@/types/api";
import { useServerTableState } from "@/hooks/useServerTableState";

// Modal state type
type ProductModalState = {
  productId: string | "create";
  mode: "view" | "edit" | "delete";
} | null;

// Zod schema for product form - matches API CreateProductDto
const productFormSchema = z.object({
  name: requiredString("Nom"),
  reference: requiredString("Reference"), // SKU/reference
  description: optionalString(),
  price: z.coerce.number().min(0, "validation.number.positive"),
  stock: z.coerce.number().min(0, "validation.number.positive"),
  alertThreshold: z.coerce.number().min(0, "validation.number.positive").optional(),
  category: requiredString("Category"),
  brand: optionalString(),
  isActive: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

const PRODUCTS_PAGE_SIZE = 20;

export function ProductsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { user } = useUser();
  const productsStaleTime = 1000 * 60 * 10;
  const lowStockStaleTime = 1000 * 60 * 2;
  const { invalidateCategories } = useCategoriesContext();
  const {
    page,
    setPage,
    search,
    searchInput,
    setSearchInput,
  } = useServerTableState();

  // Unified modal state
  const [modalState, setModalState] = useState<ProductModalState>(null);

  const salonId = user?.salon?.id;

  // Fetch products from API (scoped to current salon)
  const {
    data: productsResponse,
    isLoading,
    isFetching,
  } = useGet<PaginatedResponse<Product>>(
    withParams("products", {
      salonId,
      search: search || undefined,
      skip: (page - 1) * PRODUCTS_PAGE_SIZE,
      limit: PRODUCTS_PAGE_SIZE,
    }),
    { enabled: !!salonId, staleTime: productsStaleTime },
  );
  const products = productsResponse?.data || [];
  const productsMeta = productsResponse?.meta;

  const { productCategories = [] } = useSalonCategories(salonId, {
    enabled: !!salonId,
    includeServices: false,
  });

  // Fetch low stock products - GET /products/low-stock
  const { data: lowStockProducts = [] } = useGet<Product[]>(
    withParams("products/low-stock", { salonId }),
    { enabled: !!salonId, staleTime: lowStockStaleTime },
  );

  // Helper functions
  const getSelectedProduct = (): Product | null => {
    if (!modalState || modalState.productId === "create") return null;
    return products.find((p) => p.id === modalState.productId) || null;
  };

  const selectedProduct = getSelectedProduct();
  const isCreateMode = modalState?.productId === "create";
  const isEditMode = modalState?.mode === "edit" && !isCreateMode;
  const isViewMode = modalState?.mode === "view";
  const isDeleteMode = modalState?.mode === "delete";

  // Form setup
  const form = useForm<ProductFormData>({
    schema: productFormSchema,
    defaultValues: {
      name: "",
      reference: "",
      description: "",
      price: 0,
      stock: 0,
      alertThreshold: 5,
      category: "",
      brand: "",
      isActive: true,
    },
  });

  // Reset form when modal state changes
  useEffect(() => {
    if (isCreateMode) {
      form.reset({
        name: "",
        reference: "",
        description: "",
        price: 0,
        stock: 0,
        alertThreshold: 5,
        category: "",
        brand: "",
        isActive: true,
      });
    } else if (selectedProduct && isEditMode) {
      const categoryValue =
        typeof selectedProduct.category === "string"
          ? selectedProduct.category
          : selectedProduct.category?.name || "";
      form.reset({
        name: selectedProduct.name,
        reference: selectedProduct.reference || "",
        description: selectedProduct.description || "",
        price: selectedProduct.price,
        stock: selectedProduct.stock,
        alertThreshold: selectedProduct.minStock || 5,
        category: categoryValue,
        brand: selectedProduct.brand || "",
        isActive: selectedProduct.isActive ?? true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState, selectedProduct, isCreateMode, isEditMode]);

  // Create product mutation
  const { mutate: createProduct, isPending: isCreating } = usePost<
    Product,
    ProductFormData & { salonId: string }
  >("products", {
    invalidate: ["products"],
    onSuccess: () => {
      toast.success(t("products.addProduct") + " - " + t("common.success"));
      if (salonId) {
        invalidateCategories(salonId);
      }
      setModalState(null);
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Update product mutation
  const { mutate: updateProduct, isPending: isUpdating } = usePost<
    Product,
    ProductFormData
  >(`products/${selectedProduct?.id}`, {
    method: "PATCH",
    invalidate: ["products"],
    onSuccess: () => {
      toast.success(t("common.edit") + " - " + t("common.success"));
      if (salonId) {
        invalidateCategories(salonId);
      }
      setModalState(null);
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Delete product mutation
  const { mutate: deleteProduct, isPending: isDeleting } = usePost<void, void>(
    `products/${selectedProduct?.id}`,
    {
      method: "DELETE",
    invalidate: ["products"],
    onSuccess: () => {
      toast.success(t("common.delete") + " - " + t("common.success"));
      if (salonId) {
        invalidateCategories(salonId);
      }
      setModalState(null);
    },
      onError: (error) => {
        toast.error(error.message || t("common.error"));
      },
    },
  );

  // Update stock - POST /products/{id}/stock
  const { mutate: updateStock, isPending: isUpdatingStock } = usePostAction<
    Product,
    { quantity: number; type: "add" | "remove" | "set" }
  >(`products/${selectedProduct?.id}/stock`, {
    invalidate: ["products", "products/low-stock"],
    successToast: t("products.stockUpdated"),
  });

  // Stock adjustment state
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);

  const handleStockUpdate = (type: "add" | "remove") => {
    if (stockAdjustment <= 0) {
      toast.error(t("products.enterQuantity"));
      return;
    }
    updateStock({ quantity: stockAdjustment, type });
    setStockAdjustment(0);
  };

  const showTableLoading = (isLoading || isFetching) && products.length === 0;

  useEffect(() => {
    if (!productsMeta) return;

    const lastPage =
      productsMeta.total > 0 ? Math.max(1, productsMeta.lastPage) : 1;
    if (page > lastPage) {
      setPage(lastPage);
    }
  }, [page, productsMeta, setPage]);

  // Use the dedicated low-stock endpoint for counts
  const lowStockCount = lowStockProducts.filter((p) => p.stock > 0).length;
  const outOfStockCount = lowStockProducts.filter((p) => p.stock === 0).length;

  // Handlers
  const handleView = (product: Product) => {
    setModalState({ productId: product.id, mode: "view" });
  };

  const handleEdit = (product: Product) => {
    setModalState({ productId: product.id, mode: "edit" });
  };

  const handleDelete = (product: Product) => {
    setModalState({ productId: product.id, mode: "delete" });
  };

  const handleSubmit = (data: ProductFormData) => {
    if (!salonId) {
      toast.error(t("common.error"));
      return;
    }
    
    if (isEditMode) {
      updateProduct(data);
    } else {
      createProduct({
        ...data,
        salonId,
      });
    }
  };

  const columns = getProductColumns({
    t,
    formatCurrency,
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.products")}
        description={t("products.description", {
          count: productsMeta?.total ?? 0,
        })}
        actions={
          <Button
            className="gap-2"
            onClick={() => setModalState({ productId: "create", mode: "edit" })}
          >
            <Plus className="h-4 w-4" />
            {t("products.addProduct")}
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
                {t("products.stockAlerts")}
              </p>
              <p className="text-sm text-yellow-700">
                {outOfStockCount > 0 && (
                  <span className="font-semibold text-red-600">
                    {outOfStockCount} {t("products.outOfStock")}
                  </span>
                )}
                {outOfStockCount > 0 && lowStockCount > 0 && " • "}
                {lowStockCount > 0 && (
                  <span className="font-semibold text-yellow-600">
                    {lowStockCount} {t("products.lowStock")}
                  </span>
                )}
              </p>
            </div>
          </div>
        </Card>
      )}

      <ServerDataTable
        items={products}
        columns={columns}
        search={searchInput}
        onSearchChange={setSearchInput}
        page={page}
        perPage={productsMeta?.perPage ?? PRODUCTS_PAGE_SIZE}
        totalItems={productsMeta?.total ?? 0}
        totalPages={Math.max(productsMeta?.lastPage ?? 0, 1)}
        onPageChange={setPage}
        searchPlaceholder={t("products.searchPlaceholder")}
        emptyMessage={t("products.noProducts")}
        loading={showTableLoading}
      />

      {/* Create/Edit Product Modal */}
      <Dialog
        open={isEditMode || isCreateMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? t("products.addProduct") : t("common.edit")}
            </DialogTitle>
            {isEditMode && selectedProduct && (
              <DialogDescription>{selectedProduct.name}</DialogDescription>
            )}
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fields.name")} *</Label>
                <Input id="name" {...form.register("name")} />
                {form.hasError("name") && (
                  <p className="text-sm text-destructive">
                    {form.getError("name")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("fields.description")}</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">SKU / {t("fields.reference")} *</Label>
                <Input id="reference" {...form.register("reference")} />
                {form.hasError("reference") && (
                  <p className="text-sm text-destructive">
                    {form.getError("reference")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t("fields.price")} *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    {...form.register("price")}
                  />
                  {form.hasError("price") && (
                    <p className="text-sm text-destructive">
                      {form.getError("price")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">{t("products.brand")}</Label>
                  <Input
                    id="brand"
                    {...form.register("brand")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t("fields.category")} *</Label>
                <Input
                  id="category"
                  list="product-category-options"
                  value={form.watch("category")}
                  onChange={(event) =>
                    form.setValue("category", event.target.value)
                  }
                  placeholder={t("products.selectCategory")}
                />
                <datalist id="product-category-options">
                  {productCategories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                {form.hasError("category") && (
                  <p className="text-sm text-destructive">
                    {form.getError("category")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">{t("fields.stock")} *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    {...form.register("stock")}
                  />
                  {form.hasError("stock") && (
                    <p className="text-sm text-destructive">
                      {form.getError("stock")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alertThreshold">{t("products.minStock")}</Label>
                  <Input
                    id="alertThreshold"
                    type="number"
                    min="0"
                    {...form.register("alertThreshold")}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalState(null)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={form.isSubmitting || isCreating || isUpdating}
              >
                {form.isSubmitting || isCreating || isUpdating
                  ? t("common.loading")
                  : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Product Modal */}
      <Dialog
        open={isViewMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>{t("products.productDetails")}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedProduct.name}
                  </h3>
                  {(selectedProduct.reference || selectedProduct.sku) && (
                    <p className="text-muted-foreground">
                      SKU: {selectedProduct.reference || selectedProduct.sku}
                    </p>
                  )}
                </div>
              </div>

              {selectedProduct.description && (
                <p className="text-muted-foreground">
                  {selectedProduct.description}
                </p>
              )}

              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.price")}
                    </p>
                    <p className="font-medium text-accent-pink">
                      {formatCurrency(selectedProduct.price)}
                    </p>
                    {selectedProduct.cost && (
                      <p className="text-xs text-muted-foreground">
                        {t("products.cost")}:{" "}
                        {formatCurrency(selectedProduct.cost)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.stock")}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium",
                          selectedProduct.stock === 0 && "text-red-600",
                          selectedProduct.minStock &&
                            selectedProduct.stock <= selectedProduct.minStock &&
                            selectedProduct.stock > 0 &&
                            "text-yellow-600",
                        )}
                      >
                        {selectedProduct.stock}
                      </span>
                      {selectedProduct.stock === 0 && (
                        <Badge variant="error">
                          {t("products.outOfStock")}
                        </Badge>
                      )}
                      {selectedProduct.minStock &&
                        selectedProduct.stock <= selectedProduct.minStock &&
                        selectedProduct.stock > 0 && (
                          <Badge variant="warning">
                            {t("products.lowStock")}
                          </Badge>
                        )}
                    </div>
                    {selectedProduct.minStock && (
                      <p className="text-xs text-muted-foreground">
                        {t("products.minStock")}: {selectedProduct.minStock}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stock Adjustment */}
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("products.adjustStock")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={stockAdjustment}
                      onChange={(e) => setStockAdjustment(parseInt(e.target.value) || 0)}
                      className="w-24"
                      placeholder="0"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStockUpdate("add")}
                      disabled={isUpdatingStock || stockAdjustment <= 0}
                    >
                      <Plus className="h-4 w-4 me-1" />
                      {t("products.addStock")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStockUpdate("remove")}
                      disabled={isUpdatingStock || stockAdjustment <= 0 || selectedProduct.stock < stockAdjustment}
                    >
                      {t("products.removeStock")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalState(null)}>
              {t("common.close")}
            </Button>
            {selectedProduct && (
              <Button
                onClick={() =>
                  setModalState({ productId: selectedProduct.id, mode: "edit" })
                }
              >
                <Edit className="h-4 w-4 me-2" />
                {t("common.edit")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("products.deleteProduct")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("products.deleteProductConfirm", {
                name: selectedProduct?.name || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProduct()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
