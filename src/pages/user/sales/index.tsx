import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/table/data-table";
import { useTable } from "@/hooks/useTable";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import type { Sale } from "@/types/entities";
import { useGet } from "@/hooks/useGet";
import { getSalesColumns } from "./list/columns";

// API response types
interface SalesResponse {
  data: Sale[];
  total: number;
  page: number;
  perPage: number;
}

export function SalesPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { user } = useUser();

  const salonId = user?.salon?.id;
  const toNumber = (value?: number | null) =>
    typeof value === "number" && Number.isFinite(value) ? value : 0;
  const salesStaleTime = 1000 * 60 * 5;

  // Fetch data from API (scoped to current salon)
  const { data: salesResponse, isLoading } = useGet<SalesResponse>("sales", {
    params: { salonId, perPage: 100 },
    enabled: !!salonId,
    staleTime: salesStaleTime,
  });
  const sales = salesResponse?.data || [];

  const table = useTable<Sale>({
    data: sales,
    searchKeys: ["id"],
  });

  const todayTotal = (sales ?? []).reduce(
    (sum, sale) => sum + toNumber(sale?.total),
    0
  );
  const averageTicket = sales.length > 0 ? todayTotal / sales.length : 0;
  const columns = getSalesColumns({ t, formatCurrency });

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
    </div>
  );
}
