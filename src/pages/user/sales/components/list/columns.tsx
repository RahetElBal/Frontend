import {
  Receipt,
  MoreHorizontal,
  Eye,
  FileText,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
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
import type { Sale } from "../../types";
import {
  getSaleStatusLabel,
  saleStatusColors,
  toNumber,
} from "../utils";

interface GetSalesColumnsProps {
  t: TFunction;
  formatCurrency: (value: number) => string;
  formatDate: (value: string | Date) => string;
  formatTime: (value: string | Date) => string;
  onComplete?: (sale: Sale) => void;
  onRefund?: (sale: Sale) => void;
  isRefunding?: (sale: Sale) => boolean;
  onView?: (sale: Sale) => void;
}

export function getSalesColumns({
  t,
  formatCurrency,
  formatDate,
  formatTime,
  onComplete,
  onRefund,
  isRefunding,
  onView,
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
              {formatTime(sale.createdAt)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "date",
      header: t("fields.date"),
      render: (sale) => (
        <div>
          <p className="text-sm font-medium">{formatDate(sale.createdAt)}</p>
          <p className="text-xs text-muted-foreground">
            {formatTime(sale.createdAt)}
          </p>
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
      key: "staff",
      header: t("sales.paidBy"),
      render: (sale) =>
        sale.staff?.name || sale.staff?.email ? (
          <span>{sale.staff?.name || sale.staff?.email}</span>
        ) : (
          <span className="text-muted-foreground">{t("common.unknown")}</span>
        ),
    },
    {
      key: "items",
      header: t("fields.items"),
      render: (sale) => {
        const items = sale.items ?? [];
        if (items.length === 0) {
          return (
            <span className="text-sm text-muted-foreground">
              {t("common.view")}
            </span>
          );
        }
        return (
          <div>
            <p className="text-sm">
              {items.length}{" "}
              {items.length === 1 ? t("common.item") : t("common.items")}
            </p>
            <p className="text-xs text-muted-foreground truncate max-w-50">
              {items.map((i) => i.name).join(", ")}
            </p>
          </div>
        );
      },
    },
    {
      key: "total",
      header: t("fields.total"),
      sortable: true,
      render: (sale) => (
        <div>
          <p className="font-semibold">
            {formatCurrency(toNumber(sale.total))}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: t("fields.status"),
      render: (sale) => (
        <Badge variant={saleStatusColors[sale.status]}>
          {getSaleStatusLabel(t, sale.status)}
        </Badge>
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
            <DropdownMenuItem
              onClick={() => onView?.(sale)}
              disabled={!onView}
            >
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
            {onRefund && sale.status === "completed" && (
              <DropdownMenuItem
                onClick={() => onRefund(sale)}
                disabled={isRefunding?.(sale)}
              >
                <RotateCcw className="h-4 w-4 me-2 text-rose-600" />
                {t("sales.refund")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
