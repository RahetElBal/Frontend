import { useTranslation } from "react-i18next";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "@/components/badge";
import { ServerDataTable } from "@/components/table";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import { ROUTES } from "@/constants/navigation";
import {
  useBusinessSummaryContext,
  useSalonBusinessSummary,
} from "@/contexts/BusinessSummaryProvider";
import type { Sale, SaleItem } from "@/types/entities";
import { useGet, withParams } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { toast } from "@/lib/toast";
import { getSalesColumns } from "./components/list/columns";
import { saleStatusColors, formatSaleTime, toNumber } from "./components/utils";
import { normalizeSale, normalizeSalesResponse } from "@/utils/normalize-sales";
import type { PaginatedResponse } from "@/types";
import { useServerTableState } from "@/hooks/useServerTableState";

const SALES_PAGE_SIZE = 20;

const getSaleItemPricing = (item: SaleItem) => {
  const quantity = Math.max(1, toNumber(item.quantity, 1));
  const baseUnitPrice = toNumber(
    item.unitPrice ??
      item.price ??
      (item.total !== undefined ? toNumber(item.total) / quantity : undefined),
  );
  const baseLineTotal = baseUnitPrice * quantity;
  const lineTotal = toNumber(item.total ?? baseLineTotal);
  const discountFromLine = Math.max(0, baseLineTotal - lineTotal);
  const discountFromField = Math.max(0, toNumber(item.discount, 0));
  const shouldUseDiscountField =
    discountFromField > 0 && discountFromLine < 0.01;
  const discount = shouldUseDiscountField
    ? discountFromField
    : Math.max(discountFromLine, discountFromField);
  const finalLineTotal = Math.max(
    0,
    shouldUseDiscountField ? baseLineTotal - discount : lineTotal,
  );
  const finalUnitPrice = finalLineTotal / quantity;

  return {
    quantity,
    baseUnitPrice,
    finalUnitPrice,
    lineTotal: finalLineTotal,
    discount,
  };
};

export function SalesPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { user, isAdmin, isSuperadmin } = useUser();
  const queryClient = useQueryClient();
  const { invalidateBusinessSummary } = useBusinessSummaryContext();
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [refundingSaleId, setRefundingSaleId] = useState<string | null>(null);
  const [salePendingRefund, setSalePendingRefund] = useState<Sale | null>(null);

  if (!isAdmin && !isSuperadmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const salonId = user?.salon?.id;
  const salesStaleTime = 1000 * 60;
  const { summary, isLoading: isSummaryLoading } = useSalonBusinessSummary(
    salonId,
    {
      enabled: !!salonId,
    },
  );
  const {
    page,
    setPage,
    search,
    searchInput,
    setSearchInput,
  } = useServerTableState();

  const {
    data: salesResponse,
    isLoading,
    isFetching,
  } = useGet<PaginatedResponse<Sale>>(
    withParams("sales", {
      salonId,
      search: search || undefined,
      skip: (page - 1) * SALES_PAGE_SIZE,
      limit: SALES_PAGE_SIZE,
      sortBy: "createdAt",
      sortOrder: "desc",
      compact: true,
    }),
    {
      enabled: !!salonId,
      staleTime: salesStaleTime,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      select: normalizeSalesResponse,
    },
  );
  const sales = salesResponse?.data ?? [];
  const salesMeta = salesResponse?.meta;

  const { data: selectedSaleDetails } = useGet<Sale>(`sales/${selectedSaleId}`, {
    enabled: !!selectedSaleId,
    staleTime: 1000 * 60,
    select: normalizeSale,
  });

  const { mutate: refundSale, isPending: isRefunding } = usePost<Sale, { id: string }>(
    ({ id }) => `sales/${id}/refund`,
    {
      invalidate: ["sales", "appointments"],
      onSuccess: (_sale, variables) => {
        queryClient.invalidateQueries({
          queryKey: [`sales/${variables.id}`],
        });
        if (salonId) {
          invalidateBusinessSummary(salonId);
        }
        setSalePendingRefund(null);
        setRefundingSaleId(null);
        toast.success(t("sales.refundSuccess"));
      },
      onError: (error) => {
        setSalePendingRefund(null);
        setRefundingSaleId(null);
        toast.error(error?.message || t("sales.refundError"));
      },
    },
  );

  const selectedSale = useMemo(() => {
    if (!selectedSaleId) return null;
    if (selectedSaleDetails?.id === selectedSaleId) return selectedSaleDetails;
    return sales.find((sale) => sale.id === selectedSaleId) || null;
  }, [selectedSaleDetails, sales, selectedSaleId]);

  const isSaleDetailsLoading = !!selectedSaleId && !selectedSaleDetails;
  const hasSummaryData = summary.updatedAt > 0;
  const grossRevenue = summary.grossRevenue;
  const netRevenue = summary.netRevenue;
  const transactionsCount = summary.transactionCount;
  const refundedCount = summary.refundedCount;
  const refundedAmount = Math.abs(summary.refundedRevenueImpact);
  const averageTicket =
    transactionsCount > 0 ? netRevenue / transactionsCount : 0;
  const showSummaryLoading = isSummaryLoading && !hasSummaryData;
  const showTableLoading = (isLoading || isFetching) && sales.length === 0;

  useEffect(() => {
    if (!salesMeta) return;

    const lastPage = salesMeta.total > 0 ? Math.max(1, salesMeta.lastPage) : 1;
    if (page > lastPage) {
      setPage(lastPage);
    }
  }, [page, salesMeta, setPage]);

  const handleRefund = useCallback(
    (sale: Sale) => {
      if (!salonId) return;
      if (sale.status !== "completed") return;
      setSalePendingRefund(sale);
    },
    [salonId],
  );

  const handleConfirmRefund = useCallback(() => {
    if (!salonId || !salePendingRefund) return;
    setRefundingSaleId(salePendingRefund.id);
    refundSale({ id: salePendingRefund.id });
  }, [refundSale, salePendingRefund, salonId]);

  const handleRefundDialogChange = useCallback(
    (open: boolean) => {
      if (isRefunding) return;
      if (!open) setSalePendingRefund(null);
    },
    [isRefunding],
  );

  const columns = getSalesColumns({
    t,
    formatCurrency,
    onRefund: handleRefund,
    isRefunding: (sale) => isRefunding && refundingSaleId === sale.id,
    onView: (sale) => setSelectedSaleId(sale.id),
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("sales.grossRevenue")}
          </p>
          {showSummaryLoading ? (
            <div className="flex items-center h-8">
              <Spinner size="sm" />
            </div>
          ) : (
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(grossRevenue)}
            </p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("sales.netRevenue")}
          </p>
          {showSummaryLoading ? (
            <div className="flex items-center h-8">
              <Spinner size="sm" />
            </div>
          ) : (
            <p className="text-2xl font-bold text-accent-pink">
              {formatCurrency(netRevenue)}
            </p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("sales.transactions")}
          </p>
          {showSummaryLoading ? (
            <div className="flex items-center h-8">
              <Spinner size="sm" />
            </div>
          ) : (
            <p className="text-2xl font-bold">{transactionsCount}</p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("sales.refundedPayments")}
          </p>
          {showSummaryLoading ? (
            <div className="flex items-center h-8">
              <Spinner size="sm" />
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-rose-600">{refundedCount}</p>
              <p className="text-xs text-muted-foreground">
                {t("sales.refundedAmount")}: {formatCurrency(refundedAmount)}
              </p>
            </>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("sales.averageTicket")}
          </p>
          {showSummaryLoading ? (
            <div className="flex items-center h-8">
              <Spinner size="sm" />
            </div>
          ) : (
            <p className="text-2xl font-bold">
              {formatCurrency(averageTicket)}
            </p>
          )}
        </Card>
      </div>

      <ServerDataTable
        items={sales}
        columns={columns}
        search={searchInput}
        onSearchChange={setSearchInput}
        page={page}
        perPage={salesMeta?.perPage ?? SALES_PAGE_SIZE}
        totalItems={salesMeta?.total ?? 0}
        totalPages={Math.max(salesMeta?.lastPage ?? 0, 1)}
        onPageChange={setPage}
        newestFirst
        searchPlaceholder={t("sales.searchPlaceholder")}
        emptyMessage={t("sales.noSales")}
        loading={showTableLoading}
      />

      <AlertDialog
        open={!!salePendingRefund}
        onOpenChange={handleRefundDialogChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("sales.refund")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("sales.refundConfirm")}
              {salePendingRefund
                ? ` (${formatCurrency(Math.abs(toNumber(salePendingRefund.total)))})`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRefunding}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRefund}
              disabled={isRefunding}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {isRefunding ? t("common.loading") : t("sales.refund")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!selectedSaleId}
        onOpenChange={(open) => {
          if (!open) setSelectedSaleId(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("sales.viewPayment")}</DialogTitle>
          </DialogHeader>

          {isSaleDetailsLoading ? (
            <div className="py-10 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : selectedSale ? (
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
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
