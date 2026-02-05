import { useTranslation } from "react-i18next";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/badge";
import { DataTable } from "@/components/table/data-table";
import { useTable } from "@/hooks/useTable";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import type { Sale, SaleItem } from "@/types/entities";
import { useGet } from "@/hooks/useGet";
import { getSalesColumns } from "./list/columns";
import { saleStatusColors, formatSaleTime, toNumber } from "./utils";
import { normalizeSalesResponse } from "@/utils/normalize-sales";

// API response types
interface SalesResponse {
  data: Sale[];
  total: number;
  page: number;
  perPage: number;
}

const getSaleItemPricing = (item: SaleItem) => {
  const quantity = Math.max(1, toNumber(item.quantity, 1));
  const baseUnitPrice = toNumber(item.unitPrice ?? item.price ?? item.total);
  const fallbackLineTotal = baseUnitPrice * quantity;
  const lineTotal = toNumber(
    item.total ??
      (item.price !== undefined ? toNumber(item.price) * quantity : undefined),
    fallbackLineTotal,
  );
  const finalUnitPrice = lineTotal / quantity;
  const discount = Math.max(0, baseUnitPrice * quantity - lineTotal);

  return {
    quantity,
    baseUnitPrice,
    finalUnitPrice,
    lineTotal,
    discount,
  };
};

export function SalesPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { user } = useUser();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const salonId = user?.salon?.id;
  const salesStaleTime = 1000 * 30;

  // Fetch data from API (scoped to current salon)
  const { data: salesResponse, isLoading } = useGet<SalesResponse>("sales", {
    params: { salonId, perPage: 100 },
    enabled: !!salonId,
    staleTime: salesStaleTime,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
    select: normalizeSalesResponse,
  });
  const sales = salesResponse?.data || [];

  const table = useTable<Sale>({
    data: sales,
    searchKeys: ["id"],
  });

  const todayTotal = (sales ?? []).reduce(
    (sum, sale) => sum + toNumber(sale?.total),
    0,
  );
  const averageTicket = sales.length > 0 ? todayTotal / sales.length : 0;
  const columns = getSalesColumns({
    t,
    formatCurrency,
    onView: (sale) => setSelectedSale(sale),
  });

  const paymentMethodLabel = (method?: string) => {
    switch (method) {
      case "card":
        return t("sales.card");
      case "bank_transfer":
        return t("sales.bankTransfer");
      case "other":
        return t("sales.other");
      case "cash":
      default:
        return t("sales.cash");
    }
  };

  const selectedSaleItemDiscountTotal = selectedSale
    ? (selectedSale.items ?? []).reduce(
        (sum, item) => sum + getSaleItemPricing(item).discount,
        0,
      )
    : 0;
  const selectedSaleDiscount = toNumber(selectedSale?.discount ?? 0);
  const displayDiscount =
    selectedSaleDiscount > 0
      ? selectedSaleDiscount
      : selectedSaleItemDiscountTotal;
  const showDiscount = displayDiscount > 0.009;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("sales.paymentsTitle")}
        description={t("sales.paymentsDescription")}
      />

      {/* Today's Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("sales.todayTotal")}
          </p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(todayTotal)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("sales.transactions")}
          </p>
          <p className="text-2xl font-bold">{sales.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("sales.averageTicket")}
          </p>
          <p className="text-2xl font-bold">{formatCurrency(averageTicket)}</p>
        </Card>
      </div>

      <DataTable
        table={table}
        columns={columns}
        searchPlaceholder={t("sales.searchPlaceholder")}
        emptyMessage={t("sales.noSales")}
        loading={isLoading}
      />

      <Dialog
        open={!!selectedSale}
        onOpenChange={(open) => {
          if (!open) setSelectedSale(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("sales.viewPayment")}</DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("fields.receipt")}
                  </p>
                  <p className="font-mono text-sm">
                    {selectedSale.id.slice(0, 12).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatSaleTime(selectedSale.createdAt)}
                  </p>
                </div>
                <Badge variant={saleStatusColors[selectedSale.status]}>
                  {selectedSale.status}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("fields.client")}
                  </p>
                  <p className="font-medium">
                    {selectedSale.client
                      ? `${selectedSale.client.firstName} ${selectedSale.client.lastName}`
                      : t("sales.walkIn")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("sales.paidBy")}
                  </p>
                  <p className="font-medium">
                    {selectedSale.staff?.name ||
                      selectedSale.staff?.email ||
                      t("common.unknown")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("sales.paymentMethod")}
                  </p>
                  <p className="font-medium">
                    {paymentMethodLabel(selectedSale.paymentMethod)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("sales.paymentStatus")}
                  </p>
                  <p className="font-medium">
                    {selectedSale.paymentStatus || selectedSale.status}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border">
                <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b px-4 py-2 text-sm font-medium">
                  <span>{t("fields.items")}</span>
                  <span className="text-right">{t("sales.quantity")}</span>
                  <span className="text-right">{t("sales.unitPrice")}</span>
                </div>
                <div className="divide-y">
                  {(selectedSale.items ?? []).map((item) => {
                    const {
                      quantity,
                      baseUnitPrice,
                      finalUnitPrice,
                      discount,
                    } = getSaleItemPricing(item);
                    const hasDiscount = discount > 0.009;
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <span className="truncate">{item.name}</span>
                          {hasDiscount && (
                            <p className="text-xs text-rose-600">
                              {t("sales.discount")}: -
                              {formatCurrency(discount)}
                            </p>
                          )}
                        </div>
                        <span className="text-right">{quantity}</span>
                        <span className="text-right">
                          {hasDiscount ? (
                            <span className="flex flex-col items-end">
                              <span className="text-xs text-muted-foreground line-through">
                                {formatCurrency(baseUnitPrice)}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(finalUnitPrice)}
                              </span>
                            </span>
                          ) : (
                            formatCurrency(baseUnitPrice)
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("fields.subtotal")}
                  </span>
                  <span>{formatCurrency(toNumber(selectedSale.subtotal))}</span>
                </div>
                {showDiscount && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("sales.discount")}
                    </span>
                    <span>-{formatCurrency(displayDiscount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("fields.tax")}</span>
                  <span>{formatCurrency(toNumber(selectedSale.tax || 0))}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>{t("fields.total")}</span>
                  <span>{formatCurrency(toNumber(selectedSale.total))}</span>
                </div>
              </div>

              {selectedSale.notes && (
                <div className="rounded-lg border p-3 text-sm">
                  <p className="text-sm text-muted-foreground">
                    {t("fields.notes")}
                  </p>
                  <p>{selectedSale.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
