import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Layers,
  Package,
  Heart,
  BadgePercent,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/stats-card";
import { LoadingPanel } from "@/components/loading-panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import { useGet } from "@/hooks/useGet";
import type { Appointment, Client, Sale, Service } from "@/types/entities";
import type { PaginatedResponse } from "@/types/api";
import { normalizeSalesResponse } from "@/utils/normalize-sales";
import { ROUTES } from "@/constants/navigation";
import {
  aggregateCategorySales,
  aggregateSalesItems,
  filterAppointmentsByRange,
  filterClientsByRange,
  filterSalesByRange,
  getPeriodRange,
  getTopItemsBy,
  toNumber,
  type AnalyticsPeriod,
} from "./utils";

export function AnalyticsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  /* cSpell:disable */
  const { user, isAdmin, isSuperadmin, isLoading: userLoading } = useUser();
  const [period, setPeriod] = useState<AnalyticsPeriod>("weekly");

  const canViewAnalytics = isAdmin || isSuperadmin;
  /* cSpell:enable */
  const salonId = user?.salon?.id;

  const listStaleTime = 1000 * 60 * 5;
  const listCacheTime = 1000 * 60 * 30;

  const { data: salesResponse, isLoading: loadingSales } = useGet<
    PaginatedResponse<Sale>
  >("sales", {
    params: {
      salonId,
      perPage: 100,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    enabled: !!salonId && canViewAnalytics,
    staleTime: listStaleTime,
    cacheTime: listCacheTime,
    refetchOnWindowFocus: false,
    select: normalizeSalesResponse,
  });

  const { data: appointmentsResponse, isLoading: loadingAppointments } = useGet<
    PaginatedResponse<Appointment>
  >("appointments", {
    params: { salonId, perPage: 100 },
    enabled: !!salonId && canViewAnalytics,
    staleTime: listStaleTime,
    cacheTime: listCacheTime,
    refetchOnWindowFocus: false,
  });

  const { data: clientsResponse, isLoading: loadingClients } = useGet<
    PaginatedResponse<Client>
  >("clients", {
    params: { salonId, perPage: 100 },
    enabled: !!salonId && canViewAnalytics,
    staleTime: listStaleTime,
    cacheTime: listCacheTime,
    refetchOnWindowFocus: false,
  });

  const { data: servicesResponse, isLoading: loadingServices } = useGet<
    PaginatedResponse<Service>
  >("services", {
    params: { salonId, perPage: 100 },
    enabled: !!salonId && canViewAnalytics,
    staleTime: listStaleTime,
    cacheTime: listCacheTime,
    refetchOnWindowFocus: false,
  });

  // Move all data extraction and useMemo hooks before early returns
  const isLoading =
    loadingSales || loadingAppointments || loadingClients || loadingServices;

  // Wrap data arrays in useMemo to ensure stable references
  const sales = useMemo(() => salesResponse?.data ?? [], [salesResponse?.data]);
  const appointments = useMemo(
    () => appointmentsResponse?.data ?? [],
    [appointmentsResponse?.data],
  );
  const clients = useMemo(
    () => clientsResponse?.data ?? [],
    [clientsResponse?.data],
  );
  const services = useMemo(
    () => servicesResponse?.data ?? [],
    [servicesResponse?.data],
  );
  const packServices = useMemo(
    () => services.filter((service) => service.isPack),
    [services],
  );
  const packServiceIds = useMemo(
    () => new Set(packServices.map((service) => service.id)),
    [packServices],
  );

  const { start, end } = useMemo(() => getPeriodRange(period), [period]);

  const salesInRange = useMemo(
    () => filterSalesByRange(sales, start, end),
    [sales, start, end],
  );
  const appointmentsInRange = useMemo(
    () => filterAppointmentsByRange(appointments, start, end),
    [appointments, start, end],
  );
  const clientsInRange = useMemo(
    () => filterClientsByRange(clients, start, end),
    [clients, start, end],
  );
  const marriedClientsInRange = useMemo(
    () => clientsInRange.filter((client) => client.isMarried),
    [clientsInRange],
  );
  const packItems = useMemo(() => {
    if (packServiceIds.size === 0) return [];
    const totals: Record<string, { name: string; count: number; revenue: number }> =
      {};
    salesInRange.forEach((sale) => {
      const items = Array.isArray(sale.items) ? sale.items : [];
      items.forEach((item) => {
        if (item.type !== "service") return;
        if (!packServiceIds.has(item.itemId)) return;
        const quantity = Math.max(1, toNumber(item.quantity));
        const unitPrice = toNumber(
          item.unitPrice ??
            item.price ??
            (item.total ? item.total / quantity : 0),
        );
        const lineTotal = toNumber(item.total ?? unitPrice * quantity);
        if (!totals[item.itemId]) {
          const packName =
            item.name ||
            packServices.find((service) => service.id === item.itemId)?.name ||
            t("services.pack");
          totals[item.itemId] = { name: packName, count: 0, revenue: 0 };
        }
        totals[item.itemId].count += quantity;
        totals[item.itemId].revenue += lineTotal;
      });
    });
    return Object.values(totals);
  }, [packServiceIds, packServices, salesInRange, t]);

  if (userLoading) {
    return (
      <Card className="p-6">
        <LoadingPanel label={t("common.loading")} />
      </Card>
    );
  }

  if (!canViewAnalytics) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const totalRevenue = salesInRange.reduce(
    (sum, sale) => sum + toNumber(sale.total),
    0,
  );
  const totalTransactions = salesInRange.length;
  const averageTicket =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const totalAppointments = appointmentsInRange.length;
  const newClients = clientsInRange.length;

  const bestSeller = getTopItemsBy(
    aggregateSalesItems(salesInRange),
    "count",
    1,
  )[0];

  const allServiceItems = aggregateSalesItems(salesInRange, "service");
  const allProductItems = aggregateSalesItems(salesInRange, "product");

  const topServices = getTopItemsBy(allServiceItems, "count", 5);

  const topProducts = getTopItemsBy(allProductItems, "count", 5);

  const topCategories = getTopItemsBy(
    aggregateCategorySales(salesInRange, services, [], t("common.other")),
    "revenue",
    5,
  );

  const serviceRevenue = allServiceItems.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const productRevenue = allProductItems.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const totalItemRevenue = serviceRevenue + productRevenue;
  const serviceShare =
    totalItemRevenue > 0 ? (serviceRevenue / totalItemRevenue) * 100 : 0;
  const productShare =
    totalItemRevenue > 0 ? (productRevenue / totalItemRevenue) * 100 : 0;
  const packRevenue = packItems.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const packCount = packItems.reduce((sum, item) => sum + item.count, 0);
  const packShare =
    serviceRevenue > 0 ? (packRevenue / serviceRevenue) * 100 : 0;
  const topPacks = getTopItemsBy(packItems, "revenue", 5);

  const hasData =
    salesInRange.length > 0 ||
    appointmentsInRange.length > 0 ||
    clientsInRange.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.analytics")}
        description={t("analytics.description")}
      />

      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {t("analytics.period")}:
        </span>
        <Select
          value={period}
          onValueChange={(value) => setPeriod(value as AnalyticsPeriod)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">{t("analytics.daily")}</SelectItem>
            <SelectItem value="weekly">{t("analytics.weekly")}</SelectItem>
            <SelectItem value="monthly">{t("analytics.monthly")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title={t("analytics.totalRevenue")}
          value={formatCurrency(toNumber(totalRevenue))}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title={t("sales.transactions")}
          value={totalTransactions}
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title={t("analytics.totalAppointments")}
          value={totalAppointments}
          icon={Calendar}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <StatsCard
          title={t("analytics.newClients")}
          value={newClients}
          icon={Users}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
        />
        <StatsCard
          title={t("analytics.averageTicket")}
          value={formatCurrency(toNumber(averageTicket))}
          icon={TrendingUp}
          iconColor="text-accent-pink"
          iconBgColor="bg-accent-pink/10"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("analytics.marriedClients")}
          value={marriedClientsInRange.length}
          icon={Heart}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-100"
        />
        <StatsCard
          title={t("analytics.packRevenue")}
          value={formatCurrency(toNumber(packRevenue))}
          icon={Package}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
        />
        <StatsCard
          title={t("analytics.packSold")}
          value={packCount}
          icon={Package}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
        />
        <StatsCard
          title={t("analytics.packShare")}
          value={`${packShare.toFixed(1)}%`}
          icon={BadgePercent}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
        />
      </div>

      {isLoading ? (
        <Card className="p-6">
          <LoadingPanel label={t("common.loading")} />
        </Card>
      ) : !hasData ? (
        <Card className="p-12 text-center">
          <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t("analytics.noData")}
          </h3>
          <p className="text-muted-foreground">
            {t("analytics.noDataDescription")}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("analytics.bestSeller")}
              </h3>
              {bestSeller ? (
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{bestSeller.name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      {bestSeller.count} {t("analytics.sold")}
                    </span>
                    <span>•</span>
                    <span>{formatCurrency(bestSeller.revenue)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">{t("common.noResults")}</p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("analytics.topCategories")}
              </h3>
              <div className="space-y-4">
                {topCategories.length === 0 ? (
                  <p className="text-muted-foreground">
                    {t("common.noResults")}
                  </p>
                ) : (
                  topCategories.map((category) => {
                    const percent =
                      totalItemRevenue > 0
                        ? (category.revenue / totalItemRevenue) * 100
                        : 0;
                    return (
                      <div key={category.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{category.name}</span>
                          <span>{formatCurrency(category.revenue)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-accent-pink"
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("analytics.revenueMix")}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{t("nav.services")}</span>
                    <span>{formatCurrency(serviceRevenue)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(serviceShare, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{t("nav.products")}</span>
                    <span>{formatCurrency(productRevenue)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${Math.min(productShare, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("analytics.topPacks")}
              </h3>
              {topPacks.length === 0 ? (
                <p className="text-muted-foreground">{t("common.noResults")}</p>
              ) : (
                <div className="space-y-4">
                  {topPacks.map((pack, index) => (
                    <div
                      key={`${pack.name}-${index}`}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{pack.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {pack.count} {t("analytics.sold")}
                        </p>
                      </div>
                      <p className="font-semibold text-indigo-600">
                        {formatCurrency(pack.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("analytics.topServices")}
              </h3>
              {topServices.length === 0 ? (
                <p className="text-muted-foreground">{t("common.noResults")}</p>
              ) : (
                <div className="space-y-4">
                  {topServices.map((service, index) => (
                    <div
                      key={`${service.name}-${index}`}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.count} {t("analytics.sold")}
                        </p>
                      </div>
                      <p className="font-semibold text-emerald-600">
                        {formatCurrency(service.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("analytics.topProducts")}
              </h3>
              {topProducts.length === 0 ? (
                <p className="text-muted-foreground">{t("common.noResults")}</p>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div
                      key={`${product.name}-${index}`}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.count} {t("analytics.sold")}
                        </p>
                      </div>
                      <p className="font-semibold text-blue-600">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
