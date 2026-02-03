import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  ShoppingCart,
  BarChart3,
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
import type {
  Sale,
  Appointment,
  Client,
  Service,
  Product,
  RevenueData,
  TopService,
} from "@/types/entities";
import type { PaginatedResponse } from "@/types";
import { useGet } from "@/hooks/useGet";
import {
  aggregateProductSales,
  aggregateServiceBookings,
  getTopItems,
} from "./utils";

// Analytics API response types
interface DashboardStatsResponse {
  todayRevenue: number;
  todayAppointments: number;
  newClients: number;
  averageTicket: number;
  revenueChange: number;
  appointmentsChange: number;
  clientsChange: number;
  ticketChange: number;
}

interface RevenueAnalyticsResponse {
  data: RevenueData[];
  total: number;
  period: string;
}

export function AnalyticsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { user } = useUser();
  const [revenuePeriod, setRevenuePeriod] = useState<string>("weekly");

  const salonId = user?.salon?.id;
  const toNumber = (value?: number | null) =>
    typeof value === "number" && Number.isFinite(value) ? value : 0;

  // Fetch dashboard stats from dedicated analytics endpoint
  const { data: dashboardStats, isLoading: loadingDashboard } =
    useGet<DashboardStatsResponse>("analytics/dashboard", {
      params: { salonId },
      enabled: !!salonId,
    });

  // Fetch revenue analytics (data available for future chart implementation)
  useGet<RevenueAnalyticsResponse>("analytics/revenue", {
    params: { salonId, period: revenuePeriod },
    enabled: !!salonId,
  });

  // Fetch top services
  const { data: topServices = [] } = useGet<TopService[]>("services/top", {
    params: { salonId, limit: 5 },
    enabled: !!salonId,
  });

  // Fallback: Fetch raw data if analytics endpoints fail
  const { data: salesResponse, isLoading: loadingSales } = useGet<
    PaginatedResponse<Sale>
  >(
    "sales",
    {
      params: { salonId, perPage: 100 },
      enabled: !!salonId && !dashboardStats,
    },
  );
  const sales = useMemo(() => salesResponse?.data || [], [salesResponse]);

  const { data: appointmentsResponse, isLoading: loadingAppointments } =
    useGet<PaginatedResponse<Appointment>>("appointments", {
      params: { salonId, perPage: 100 },
      enabled: !!salonId,
    });
  const appointments = useMemo(
    () => appointmentsResponse?.data || [],
    [appointmentsResponse],
  );
  
  const { data: clientsResponse, isLoading: loadingClients } =
    useGet<PaginatedResponse<Client>>("clients", {
      params: { salonId, perPage: 100 },
      enabled: !!salonId,
    });
  const clients = useMemo(() => clientsResponse?.data || [], [clientsResponse]);
  
  const { data: servicesResponse } = useGet<PaginatedResponse<Service>>(
    "services",
    {
      params: { salonId, perPage: 100 },
      enabled: !!salonId,
    },
  );
  const services = useMemo(
    () => servicesResponse?.data || [],
    [servicesResponse],
  );
  
  const { data: productsResponse } = useGet<PaginatedResponse<Product>>(
    "products",
    {
      params: { salonId, perPage: 100 },
      enabled: !!salonId,
    },
  );
  const products = useMemo(
    () => productsResponse?.data || [],
    [productsResponse],
  );

  const isLoading =
    loadingDashboard || loadingSales || loadingAppointments || loadingClients;

  // Calculate metrics - use dashboard stats if available, otherwise calculate from raw data
  const metrics = useMemo(() => {
    // If we have dashboard stats from the API, use those
    if (dashboardStats) {
      // Still need to calculate top products from sales data
      const topProductsFromSales = getTopItems(
        aggregateProductSales(sales, products),
        5,
      );

      return {
        totalRevenue: toNumber(dashboardStats.todayRevenue),
        totalAppointments: toNumber(dashboardStats.todayAppointments),
        totalClients: clients.length,
        newClientsThisMonth: toNumber(dashboardStats.newClients),
        averageTicket: toNumber(dashboardStats.averageTicket),
        revenueChange: dashboardStats.revenueChange,
        appointmentsChange: dashboardStats.appointmentsChange,
        topServices: topServices.map((s) => ({
          name: s.name,
          count: toNumber(s.count),
          revenue: toNumber(s.revenue),
        })),
        topProducts: topProductsFromSales,
      };
    }

    // Fallback: Calculate from raw data
    const totalRevenue = (sales ?? []).reduce(
      (sum, sale) => sum + toNumber(sale?.total),
      0,
    );
    const totalAppointments = appointments.length;
    const totalClients = clients.length;
    const averageTicket =
      sales.length > 0 ? totalRevenue / sales.length : 0;

    // Count new clients this month
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const newClientsThisMonth = clients.filter((c) => {
      const createdAt = new Date(c.createdAt);
      return (
        createdAt.getMonth() === thisMonth &&
        createdAt.getFullYear() === thisYear
      );
    }).length;

    // Calculate service popularity from appointments
    const topServicesFromBookings = getTopItems(
      aggregateServiceBookings(appointments),
      5,
    );

    const topProductsFromSales = getTopItems(
      aggregateProductSales(sales, products),
      5,
    );

    return {
      totalRevenue,
      totalAppointments,
      totalClients,
      newClientsThisMonth,
      averageTicket: toNumber(averageTicket),
      revenueChange: undefined,
      appointmentsChange: undefined,
      topServices: topServicesFromBookings,
      topProducts: topProductsFromSales,
    };
  }, [dashboardStats, topServices, sales, appointments, clients, products]);

  const hasData =
    sales.length > 0 || appointments.length > 0 || clients.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.analytics")}
        description={t("analytics.description")}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("analytics.totalRevenue")}
          value={formatCurrency(toNumber(metrics.totalRevenue))}
          change={metrics.revenueChange}
          changeLabel={metrics.revenueChange !== undefined ? t("analytics.vsLastPeriod") : undefined}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title={t("analytics.totalAppointments")}
          value={(metrics.totalAppointments ?? 0).toString()}
          change={metrics.appointmentsChange}
          changeLabel={metrics.appointmentsChange !== undefined ? t("analytics.vsLastPeriod") : undefined}
          icon={Calendar}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title={t("analytics.newClients")}
          value={(metrics.newClientsThisMonth ?? 0).toString()}
          changeLabel={t("analytics.thisMonth")}
          icon={Users}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <StatsCard
          title={t("analytics.averageTicket")}
          value={formatCurrency(toNumber(metrics.averageTicket))}
          icon={ShoppingCart}
        />
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{t("analytics.period")}:</span>
        <Select value={revenuePeriod} onValueChange={setRevenuePeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">{t("analytics.daily")}</SelectItem>
            <SelectItem value="weekly">{t("analytics.weekly")}</SelectItem>
            <SelectItem value="monthly">{t("analytics.monthly")}</SelectItem>
            <SelectItem value="yearly">{t("analytics.yearly")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <Card className="p-6">
          <LoadingPanel label={t("common.loading")} />
        </Card>
      ) : !hasData ? (
        <Card className="p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t("analytics.noData")}
          </h3>
          <p className="text-muted-foreground">
            {t("analytics.noDataDescription")}
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Services */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("analytics.topServices")}
            </h3>
            {metrics.topServices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {t("common.noResults")}
              </p>
            ) : (
              <div className="space-y-4">
                {metrics.topServices.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-pink/10 flex items-center justify-center text-accent-pink font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.count} {t("analytics.bookings")}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(toNumber(service.revenue))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>


          {/* KPIs */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">
              {t("analytics.kpis")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t("analytics.clientRetention")}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold">
                    {clients.length > 0
                      ? Math.round(
                          (clients.filter((c) => c.visitCount > 1).length /
                            clients.length) *
                            100,
                        )
                      : 0}
                    %
                  </p>
                  {clients.filter((c) => c.visitCount > 1).length > 0 && (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t("analytics.noShowRate")}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold">
                    {appointments.length > 0
                      ? Math.round(
                          (appointments.filter((a) => a.status === "no_show")
                            .length /
                            appointments.length) *
                            100,
                        )
                      : 0}
                    %
                  </p>
                  {appointments.filter((a) => a.status === "no_show").length ===
                    0 &&
                    appointments.length > 0 && (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    )}
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t("fields.totalSpent")}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      clients.reduce((sum, c) => sum + c.totalSpent, 0),
                    )}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t("fields.loyaltyPoints")}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold">
                    {clients.reduce((sum, c) => sum + c.loyaltyPoints, 0)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Summary Stats */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">
              {t("common.viewAll")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-accent-pink">
                  {clients.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("nav.clients")}
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-blue-500">
                  {services.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("nav.services")}
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {products.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("nav.products")}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
