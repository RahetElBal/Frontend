import {
  Package,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import type { TFunction } from "i18next";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import { type Column } from "@/components/table/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/entities";

interface GetProductColumnsProps {
  t: TFunction;
  formatCurrency: (value: number) => string;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function getProductColumns({
  t,
  formatCurrency,
  onView,
  onEdit,
  onDelete,
}: GetProductColumnsProps): Column<Product>[] {
  return [
    {
      key: "name",
      header: t("fields.product"),
      sortable: true,
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">
              SKU: {product.sku || "-"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: t("fields.category"),
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
      key: "price",
      header: t("fields.price"),
      sortable: true,
      render: (product) => (
        <div>
          <p className="font-medium">{formatCurrency(product.price)}</p>
          {product.cost && (
            <p className="text-xs text-muted-foreground">
              {t("products.cost")}: {formatCurrency(product.cost)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: t("fields.stock"),
      sortable: true,
      render: (product) => {
        const isLowStock =
          product.minStock !== undefined && product.stock <= product.minStock;
        const isOutOfStock = product.stock === 0;

        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-medium",
                isOutOfStock && "text-red-600",
                isLowStock && !isOutOfStock && "text-yellow-600",
              )}
            >
              {product.stock}
            </span>
            {isOutOfStock && (
              <Badge variant="error">{t("products.outOfStock")}</Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge variant="warning">{t("products.lowStock")}</Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(product)}>
              <Eye className="h-4 w-4 me-2" />
              {t("common.view")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(product)}>
              <Edit className="h-4 w-4 me-2" />
              {t("common.edit")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(product)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 me-2" />
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
