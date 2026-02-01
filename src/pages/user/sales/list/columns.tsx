import { Receipt, MoreHorizontal, Eye, FileText, CheckCircle } from "lucide-react";
import type { TFunction } from "i18next";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import { type Column } from "@/components/table/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Sale } from "@/types/entities";
import { formatSaleTime, saleStatusColors } from "../utils";

interface GetSalesColumnsProps {
  t: TFunction;
  formatCurrency: (value: number) => string;
  onComplete?: (sale: Sale) => void;
}

export function getSalesColumns({
  t,
  formatCurrency,
  onComplete,
}: GetSalesColumnsProps): Column<Sale>[] {
  return [
    {
      key: "id",
      header: t("fields.receipt"),
      render: (sale) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-accent-pink/10 flex items-center justify-center">
            <Receipt className="h-4 w-4 text-accent-pink" />
          </div>
          <div>
            <p className="font-mono text-sm">
              {sale.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatSaleTime(sale.createdAt)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "client",
      header: t("fields.client"),
      render: (sale) =>
        sale.client ? (
          <span>
            {sale.client.firstName} {sale.client.lastName}
          </span>
        ) : (
          <span className="text-muted-foreground">{t("sales.walkIn")}</span>
        ),
    },
    {
      key: "items",
      header: t("fields.items"),
      render: (sale) => (
        <div>
          <p className="text-sm">
            {sale.items.length}{" "}
            {sale.items.length === 1 ? t("common.item") : t("common.items")}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-50">
            {sale.items.map((i) => i.name).join(", ")}
          </p>
        </div>
      ),
    },
    {
      key: "total",
      header: t("fields.total"),
      sortable: true,
      render: (sale) => (
        <div>
          <p className="font-semibold">{formatCurrency(sale.total)}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: t("fields.status"),
      render: (sale) => (
        <Badge variant={saleStatusColors[sale.status]}>{sale.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (sale) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 me-2" />
              {t("common.view")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="h-4 w-4 me-2" />
              {t("sales.printReceipt")}
            </DropdownMenuItem>
            {onComplete && sale.status !== "completed" && sale.status !== "cancelled" && (
              <DropdownMenuItem onClick={() => onComplete(sale)}>
                <CheckCircle className="h-4 w-4 me-2 text-green-600" />
                {t("sales.complete")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
