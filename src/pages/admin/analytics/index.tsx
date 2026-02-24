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
import { useGet, withParams } from "@/hooks/useGet";
import {
  translateServiceCategory,
  translateServiceName,
} from "@/common/service-translations";
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
  type AggregatedItem,
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
  >(
    withParams("sales", {
      salonId,
      perPage: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      summary: true,
    }),
    {
      enabled: !!salonId && canViewAnalytics,
      staleTime: listStaleTime,
      gcTime: listCacheTime,
      refetchOnWindowFocus: false,
      select: normalizeSalesResponse,
    },
  );

  const { data: appointmentsResponse, isLoading: loadingAppointments } = useGet<
    PaginatedResponse<Appointment>
  >(
    withParams("appointments", { salonId, perPage: 10, summary: true }),
    {
      enabled: !!salonId && canViewAnalytics,
      staleTime: listStaleTime,
      gcTime: listCacheTime,
      refetchOnWindowFocus: false,
    },
  );

  const { data: clientsResponse, isLoading: loadingClients } = useGet<
    PaginatedResponse<Client>
  >(
    withParams("clients", { salonId, perPage: 10 }),
    {
      enabled: !!salonId && canViewAnalytics,
      staleTime: listStaleTime,
      gcTime: listCacheTime,
      refetchOnWindowFocus: false,
    },
  );

  const { data: servicesResponse, isLoading: loadingServices } = useGet<
    PaginatedResponse<Service>
  >(
    withParams("services", { salonId, perPage: 10, compact: true }),
    {
      enabled: !!salonId && canViewAnalytics,
      staleTime: listStaleTime,
      gcTime: listCacheTime,
      refetchOnWindowFocus: false,
    },
  );

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
  const serviceLookup = useMemo(
    () => new Map(services.map((service) => [service.id, service])),
    [services],
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
    const totals: Record<
      string,
      { name: string; count: number; revenue: number; itemId: string; type: "service" }
    > = {};
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
          totals[item.itemId] = {
            name: packName,
            count: 0,
            revenue: 0,
            itemId: item.itemId,
            type: "service",
          };
        }
        totals[item.itemId].count += quantity;
        totals[item.itemId].revenue += lineTotal;
      });
    });
    return Object.values(totals);
  }, [packServiceIds, packServices, salesInRange, t]);

  const getServiceDisplayName = (item: AggregatedItem) => {
    if (item.type !== "service" || !item.itemId) return item.name;
    const service = serviceLookup.get(item.itemId);
    return service ? translateServiceName(t, service) : item.name;
  };

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

  const allServiceItems = aggregateSalesItems(salesInRange, "service");
  const bestSeller = getTopItemsBy(allServiceItems, "count", 1)[0];

  const topServices = getTopItemsBy(allServiceItems, "count", 5);

  const topCategories = getTopItemsBy(
    aggregateCategorySales(
      salesInRange,
      services,
      [],
      t("common.other"),
      "service",
    ),
    "revenue",
    5,
  );

  const serviceRevenue = allServiceItems.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const serviceShare = serviceRevenue > 0 ? 100 : 0;
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
          loading={isLoading}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title={t("sales.transactions")}
          value={totalTransactions}
          loading={isLoading}
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title={t("analytics.totalAppointments")}
          value={totalAppointments}
          loading={isLoading}
          icon={Calendar}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <StatsCard
          title={t("analytics.newClients")}
          value={newClients}
          loading={isLoading}
          icon={Users}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
        />
        <StatsCard
          title={t("analytics.averageTicket")}
          value={formatCurrency(toNumber(averageTicket))}
          loading={isLoading}
          icon={TrendingUp}
          iconColor="text-accent-pink"
          iconBgColor="bg-accent-pink/10"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("analytics.marriedClients")}
          value={marriedClientsInRange.length}
          loading={isLoading}
          icon={Heart}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-100"
        />
        <StatsCard
          title={t("analytics.packRevenue")}
          value={formatCurrency(toNumber(packRevenue))}
          loading={isLoading}
          icon={Package}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
        />
        <StatsCard
          title={t("analytics.packSold")}
          value={packCount}
          loading={isLoading}
          icon={Package}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
        />
        <StatsCard
          title={t("analytics.packShare")}
          value={`${packShare.toFixed(1)}%`}
          loading={isLoading}
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
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-balance">
                    {getServiceDisplayName(bestSeller)}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700 font-medium">
                      {bestSeller.count} {t("analytics.sold")}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(bestSeller.revenue)}
                    </span>
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
                  topCategories.map((category, idx) => {
                    const totalRevenue = topCategories.reduce((sum, c) => sum + c.revenue, 0) || 1;
                    const percent = (category.revenue / totalRevenue) * 100;
                    const colors = [
                      "bg-accent-pink-500",
                      "bg-emerald-500",
                      "bg-indigo-500",
                      "bg-amber-500",
                      "bg-sky-500",
                    ];
                    return (
                      <div key={category.name}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="font-medium">
                            {translateServiceCategory(t, category.name)}
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(category.revenue)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${colors[idx % colors.length]}`}
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
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium">{t("nav.services")}</span>
                    <span className="font-semibold">
                      {formatCurrency(serviceRevenue)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(serviceShare, 100)}%` }}
                    />
                  </div>
                </div>
                {packRevenue > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium">{t("services.pack")}</span>
                      <span className="font-semibold">
                        {formatCurrency(packRevenue)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${Math.min(packShare, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("analytics.topServices")}
              </h3>
              {topServices.length === 0 ? (
                <p className="text-muted-foreground">{t("common.noResults")}</p>
              ) : (
                <div className="space-y-4">
                  {topServices.map((service, index) => {
                    const maxRevenue = topServices[0]?.revenue || 1;
                    const percent = (service.revenue / maxRevenue) * 100;
                    return (
                      <div key={`${service.name}-${index}`}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <div>
                            <span className="font-medium">
                              {getServiceDisplayName(service)}
                            </span>
                            <span className="text-muted-foreground ms-2">
                              {service.count} {t("analytics.sold")}
                            </span>
                          </div>
                          <span className="font-semibold text-emerald-600">
                            {formatCurrency(service.revenue)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("analytics.topPacks")}
              </h3>
              {topPacks.length === 0 ? (
                <p className="text-muted-foreground">{t("common.noResults")}</p>
              ) : (
                <div className="space-y-4">
                  {topPacks.map((pack, index) => {
                    const maxRevenue = topPacks[0]?.revenue || 1;
                    const percent = (pack.revenue / maxRevenue) * 100;
                    return (
                      <div key={`${pack.name}-${index}`}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <div>
                            <span className="font-medium">
                              {getServiceDisplayName(pack)}
                            </span>
                            <span className="text-muted-foreground ms-2">
                              {pack.count} {t("analytics.sold")}
                            </span>
                          </div>
                          <span className="font-semibold text-indigo-600">
                            {formatCurrency(pack.revenue)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
