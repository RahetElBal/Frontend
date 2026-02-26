import { useTranslation } from "react-i18next";
import { Building2, Users, DollarSign, Activity } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import type { PaginatedResponse, Salon, User } from "@/types";
import { AdminStatsGrid } from "@/pages/admin/components/stats-grid";

interface StatsGridProps {
  salonsData?: Salon[];
  usersData?: PaginatedResponse<User>;
  loading?: boolean;
  revenueData?: {
    gross: number;
    net: number;
    bySalon?: Record<string, number>;
  };
}

export function StatsGrid({
  salonsData,
  usersData,
  loading = false,
  revenueData,
}: StatsGridProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { isSuperadmin } = useUser();
  const totalSalons = salonsData?.length || 0;
  const totalUsers = usersData?.meta.total || 0;
  const activeSubscriptions = salonsData?.filter((s) => s.isActive).length || 0;
  const grossRevenue = revenueData?.gross || 0;
  const netRevenue = revenueData?.net || 0;

  return (
    <AdminStatsGrid
      className={`sm:grid-cols-2 ${isSuperadmin ? "lg:grid-cols-5" : "lg:grid-cols-3"}`}
    >
      {isSuperadmin && (
        <StatsCard
          title={t("admin.stats.totalSalons")}
          value={totalSalons}
          loading={loading}
          icon={Building2}
          iconColor="text-accent-pink"
          iconBgColor="bg-accent-pink/10"
        />
      )}
      <StatsCard
        title={t("admin.stats.totalUsers")}
        value={totalUsers}
        loading={loading}
        icon={Users}
        iconColor="text-accent-blue"
        iconBgColor="bg-accent-blue/10"
      />
      <StatsCard
        title={t("sales.grossRevenue")}
        value={formatCurrency(grossRevenue)}
        loading={loading}
        icon={DollarSign}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
      />
      <StatsCard
        title={t("sales.netRevenue")}
        value={formatCurrency(netRevenue)}
        loading={loading}
        icon={DollarSign}
        iconColor="text-accent-pink"
        iconBgColor="bg-accent-pink/10"
      />
      {isSuperadmin && (
        <StatsCard
          title={t("admin.stats.activeSubscriptions")}
          value={activeSubscriptions}
          loading={loading}
          icon={Activity}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      )}
    </AdminStatsGrid>
  );
}
