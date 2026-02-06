import { useTranslation } from "react-i18next";
import {
  Building2,
  Users,
  CheckCircle2,
  DollarSign,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { useLanguage } from "@/hooks/useLanguage";
import { AdminStatsGrid } from "@/pages/admin/components/stats-grid";

interface StatsGridProps {
  totalSalons: number;
  activeSalons: number;
  totalUsers: number;
  activeUsers?: number;
  totalAdmins?: number;
  isSuperadmin: boolean;
  loading?: boolean;
  // Admin-specific stats
  totalRevenue?: number;
  monthlyRevenue?: number;
  totalServices?: number;
  totalClients?: number;
}

export function StatsGrid({
  totalSalons,
  activeSalons,
  totalUsers,
  activeUsers = 0,
  totalAdmins = 0,
  isSuperadmin,
  loading = false,
  totalRevenue = 0,
  monthlyRevenue = 0,
  totalServices = 0,
  totalClients = 0,
}: StatsGridProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  if (isSuperadmin) {
    return (
      <div className="space-y-4">
        {/* Top Row - Platform Overview */}
        <AdminStatsGrid className="sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t("admin.salons.totalSalons")}
            value={totalSalons}
            loading={loading}
            icon={Building2}
            iconColor="text-accent-pink"
            iconBgColor="bg-accent-pink/10"
          />
          <StatsCard
            title={t("admin.salons.activeSalons")}
            value={activeSalons}
            loading={loading}
            icon={CheckCircle2}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatsCard
            title="Admins"
            value={totalAdmins}
            loading={loading}
            icon={UserCheck}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-100"
          />
          <StatsCard
            title={t("admin.salons.totalUsers")}
            value={totalUsers}
            loading={loading}
            icon={Users}
            iconColor="text-accent-blue"
            iconBgColor="bg-accent-blue/10"
          />
        </AdminStatsGrid>

        {/* Bottom Row - Activity Overview */}
        <AdminStatsGrid className="sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Salons inactifs"
            value={Math.max(totalSalons - activeSalons, 0)}
            loading={loading}
            icon={Building2}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
          <StatsCard
            title="Utilisateurs actifs"
            value={activeUsers}
            loading={loading}
            icon={Users}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatsCard
            title="Utilisateurs inactifs"
            value={Math.max(totalUsers - activeUsers, 0)}
            loading={loading}
            icon={Users}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
          />
        </AdminStatsGrid>
      </div>
    );
  }

  // Admin mode - show comprehensive salon stats
  return (
    <div className="space-y-4">
      {/* Revenue Stats - Top Row */}
      <AdminStatsGrid className="sm:grid-cols-2">
        <StatsCard
          title="Revenu total"
          value={formatCurrency(totalRevenue)}
          loading={loading}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="Revenu ce mois"
          value={formatCurrency(monthlyRevenue)}
          loading={loading}
          icon={DollarSign}
          iconColor="text-accent-pink"
          iconBgColor="bg-accent-pink/10"
        />
      </AdminStatsGrid>

      {/* Other Stats - Bottom Row */}
      <AdminStatsGrid className="sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Clients"
          value={totalClients}
          loading={loading}
          icon={UserCheck}
          iconColor="text-accent-blue"
          iconBgColor="bg-accent-blue/10"
        />
        <StatsCard
          title="Services"
          value={totalServices}
          loading={loading}
          icon={Briefcase}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
        />
        <StatsCard
          title="Equipe"
          value={totalUsers}
          loading={loading}
          icon={Users}
          iconColor="text-accent-blue"
          iconBgColor="bg-accent-blue/10"
        />
      </AdminStatsGrid>
    </div>
  );
}
