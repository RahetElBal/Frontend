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
import { ProFeatureGate } from "@/components/pro-feature-gate";
import { selectCollectionData } from "@/common/utils";

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
import { useSalonBusinessSummary } from "@/hooks/useSalonBusinessSummary";
import { useSalonServices } from "@/hooks/useSalonServices";
import type { Appointment } from "@/pages/user/agenda/types";
import type { Client } from "@/pages/user/clients/types";
import type { Sale } from "@/pages/user/sales/types";
import { normalizeSale } from "@/utils/normalize-sales";
import { ROUTES } from "@/constants/navigation";
import {
  buildAnalyticsViewModel,
  toNumber,
  type AnalyticsPeriod,
} from "./components/utils";

export function AnalyticsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  /* cSpell:disable */
  const { user, isAdmin, isSuperadmin, isLoading: userLoading } = useUser();
  const [period, setPeriod] = useState<AnalyticsPeriod>("weekly");

  const canViewAnalytics = isAdmin || isSuperadmin;
  /* cSpell:enable */
  const salonId = user?.salon?.id;
  const { summary: businessSummary } = useSalonBusinessSummary(salonId, {
    enabled: !!salonId && canViewAnalytics,
  });

  const { data: sales = [], isLoading: loadingSales } = useGet<Sale[]>({
    path: "sales",
    query: {
      salonId,
      perPage: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      summary: true,
    },
    options: {
      enabled: !!salonId && canViewAnalytics,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      select: (response) =>
        selectCollectionData(response as { data?: Sale[] } | Sale[]).map(
          normalizeSale,
        ),
    },
  });

  const { data: appointments = [], isLoading: loadingAppointments } = useGet<
    Appointment[]
  >({
    path: "appointments",
    query: { salonId, perPage: 10, summary: true },
    options: {
      enabled: !!salonId && canViewAnalytics,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      select: (response) =>
        selectCollectionData(
          response as { data?: Appointment[] } | Appointment[],
        ),
    },
  });

  const { data: clients = [], isLoading: loadingClients } = useGet<Client[]>({
    path: "clients",
    query: { salonId, perPage: 10 },
    options: {
      enabled: !!salonId && canViewAnalytics,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      select: (response) =>
        selectCollectionData(response as { data?: Client[] } | Client[]),
    },
  });

  const { services, isLoading: loadingServices } = useSalonServices(salonId, {
    enabled: !!salonId && canViewAnalytics,
  });

  // Move all data extraction and useMemo hooks before early returns
  const isLoading =
    loadingSales || loadingAppointments || loadingClients || loadingServices;
  const analytics = useMemo(() => {
    return buildAnalyticsViewModel({
      sales,
      appointments,
      clients,
      services,
      businessSummary,
      period,
      t,
    });
  }, [appointments, businessSummary, clients, period, sales, services, t]);

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
          title={t("analytics.netRevenue")}
          value={formatCurrency(toNumber(analytics.totalNetRevenue))}
          loading={isLoading}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title={t("analytics.grossRevenue")}
          value={formatCurrency(toNumber(analytics.totalGrossRevenue))}
          loading={isLoading}
          icon={DollarSign}
          iconColor="text-emerald-700"
          iconBgColor="bg-emerald-100"
        />
        <StatsCard
          title={t("sales.transactions")}
          value={analytics.totalTransactions}
          loading={isLoading}
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("analytics.refundedPayments")}
              </p>
              <p className="text-2xl font-bold text-rose-600">
                {analytics.refundedPaymentsCount}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("analytics.refundedAmount")}:{" "}
                {formatCurrency(analytics.refundedRevenueAmount)}
              </p>
            </div>
            <div className="rounded-lg bg-rose-100 p-3">
              <DollarSign className="h-5 w-5 text-rose-600" />
            </div>
          </div>
        </Card>
        <StatsCard
          title={t("analytics.averageTicket")}
          value={formatCurrency(toNumber(analytics.averageTicket))}
          loading={isLoading}
          icon={TrendingUp}
          iconColor="text-accent-pink"
          iconBgColor="bg-accent-pink/10"
        />
      </div>

      <ProFeatureGate featureKey="advancedAnalytics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <StatsCard
            title={t("analytics.totalAppointments")}
            value={analytics.totalAppointments}
            loading={isLoading}
            icon={Calendar}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatsCard
            title={t("analytics.newClients")}
            value={analytics.newClients}
            loading={isLoading}
            icon={Users}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
          />
          <StatsCard
            title={t("analytics.marriedClients")}
            value={analytics.marriedClientsCount}
            loading={isLoading}
            icon={Heart}
            iconColor="text-rose-600"
            iconBgColor="bg-rose-100"
          />
          <StatsCard
            title={t("analytics.packRevenue")}
            value={formatCurrency(toNumber(analytics.packRevenue))}
            loading={isLoading}
            icon={Package}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-100"
          />
          <StatsCard
            title={t("analytics.packSold")}
            value={analytics.packCount}
            loading={isLoading}
            icon={Package}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-100"
          />
          <StatsCard
            title={t("analytics.packShare")}
            value={`${analytics.packShare.toFixed(1)}%`}
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
        ) : !analytics.hasData ? (
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
              {analytics.bestSeller ? (
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-balance">
                    {analytics.bestSeller.displayName}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700 font-medium">
                      {analytics.bestSeller.count} {t("analytics.sold")}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(analytics.bestSeller.revenue)}
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
                {analytics.topCategories.length === 0 ? (
                  <p className="text-muted-foreground">
                    {t("common.noResults")}
                  </p>
                ) : (
                  analytics.topCategories.map((category, idx) => {
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
                            {category.displayName}
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(category.revenue)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${colors[idx % colors.length]}`}
                            style={{ width: `${Math.min(category.percent, 100)}%` }}
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
                      {formatCurrency(analytics.serviceRevenue)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(analytics.serviceShare, 100)}%` }}
                    />
                  </div>
                </div>
                {analytics.packRevenue > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium">{t("services.pack")}</span>
                      <span className="font-semibold">
                        {formatCurrency(analytics.packRevenue)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${Math.min(analytics.packShare, 100)}%` }}
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
              {analytics.topServices.length === 0 ? (
                <p className="text-muted-foreground">{t("common.noResults")}</p>
              ) : (
                <div className="space-y-4">
                  {analytics.topServices.map((service, index) => {
                    return (
                      <div key={`${service.name}-${index}`}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <div>
                            <span className="font-medium">
                              {service.displayName}
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
                            style={{ width: `${Math.min(service.percent, 100)}%` }}
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
              {analytics.topPacks.length === 0 ? (
                <p className="text-muted-foreground">{t("common.noResults")}</p>
              ) : (
                <div className="space-y-4">
                  {analytics.topPacks.map((pack, index) => {
                    return (
                      <div key={`${pack.name}-${index}`}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <div>
                            <span className="font-medium">
                              {pack.displayName}
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
                            style={{ width: `${Math.min(pack.percent, 100)}%` }}
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
      </ProFeatureGate>
    </div>
  );
}
