import { useTranslation } from "react-i18next";
import { Building2, Users, DollarSign, Activity } from "lucide-react";

import { useUser } from "@/hooks/useUser";
import { Spinner } from "@/components/spinner";
import { PageHeader } from "@/components/page-header";
import { StatsCard } from "@/components/stats-card";
import { Card } from "@/components/ui/card";

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "";

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={t("admin.dashboard.title")}
        description={t("admin.dashboard.welcome", { name: displayName })}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("admin.stats.totalSalons")}
          value={0}
          change={0}
          icon={Building2}
          iconColor="text-accent-pink"
          iconBgColor="bg-accent-pink/10"
        />
        <StatsCard
          title={t("admin.stats.totalUsers")}
          value={0}
          change={0}
          icon={Users}
          iconColor="text-accent-blue"
          iconBgColor="bg-accent-blue/10"
        />
        <StatsCard
          title={t("admin.stats.totalRevenue")}
          value={formatCurrency(0)}
          change={0}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title={t("admin.stats.activeSubscriptions")}
          value={0}
          icon={Activity}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Salons */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("admin.dashboard.recentSalons")}
          </h2>
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aucun salon récent</p>
          </div>
        </Card>

        {/* Recent Users */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("admin.dashboard.recentUsers")}
          </h2>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aucun utilisateur récent</p>
          </div>
        </Card>
      </div>

      {/* System Status */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          {t("admin.dashboard.systemStatus")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-green-700">
                {t("admin.status.apiOnline")}
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              {t("admin.status.allSystemsOperational")}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-green-700">
                {t("admin.status.databaseOnline")}
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">Neon PostgreSQL</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-green-700">
                {t("admin.status.storageOnline")}
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">Railway</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
