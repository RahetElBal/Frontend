import { useTranslation } from "react-i18next";
import {
  Building2,
  Users,
  CheckCircle2,
  DollarSign,
  Package,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { useLanguage } from "@/hooks/useLanguage";

interface StatsGridProps {
  totalSalons: number;
  activeSalons: number;
  totalUsers: number;
  isSuperadmin: boolean;
  // Admin-specific stats
  totalRevenue?: number;
  monthlyRevenue?: number;
  totalProducts?: number;
  totalServices?: number;
  totalClients?: number;
}

export function StatsGrid({
  totalSalons,
  activeSalons,
  totalUsers,
  isSuperadmin,
  totalRevenue = 0,
  monthlyRevenue = 0,
  totalProducts = 0,
  totalServices = 0,
  totalClients = 0,
}: StatsGridProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  if (isSuperadmin) {
    return (
      <div className="space-y-4">
        {/* Top Row - Salon & User Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title={t("admin.salons.totalSalons")}
            value={totalSalons}
            icon={Building2}
            iconColor="text-accent-pink"
            iconBgColor="bg-accent-pink/10"
          />
          <StatsCard
            title={t("admin.salons.activeSalons")}
            value={activeSalons}
            icon={CheckCircle2}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatsCard
            title={t("admin.salons.totalUsers")}
            value={totalUsers}
            icon={Users}
            iconColor="text-accent-blue"
            iconBgColor="bg-accent-blue/10"
          />
        </div>

        {/* Bottom Row - Revenue & Business Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="Revenu total"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatsCard
            title="Revenu ce mois"
            value={formatCurrency(monthlyRevenue)}
            icon={DollarSign}
            iconColor="text-accent-pink"
            iconBgColor="bg-accent-pink/10"
          />
          <StatsCard
            title="Clients"
            value={totalClients}
            icon={UserCheck}
            iconColor="text-accent-blue"
            iconBgColor="bg-accent-blue/10"
          />
          <StatsCard
            title="Services"
            value={totalServices}
            icon={Briefcase}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-100"
          />
          <StatsCard
            title="Produits"
            value={totalProducts}
            icon={Package}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>
      </div>
    );
  }

  // Admin mode - show comprehensive salon stats
  return (
    <div className="space-y-4">
      {/* Revenue Stats - Top Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatsCard
          title="Revenu total"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="Revenu ce mois"
          value={formatCurrency(monthlyRevenue)}
          icon={DollarSign}
          iconColor="text-accent-pink"
          iconBgColor="bg-accent-pink/10"
        />
      </div>

      {/* Other Stats - Bottom Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Clients"
          value={totalClients}
          icon={UserCheck}
          iconColor="text-accent-blue"
          iconBgColor="bg-accent-blue/10"
        />
        <StatsCard
          title="Services"
          value={totalServices}
          icon={Briefcase}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
        />
        <StatsCard
          title="Produits"
          value={totalProducts}
          icon={Package}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
        <StatsCard
          title="Stock faible"
          value={0}
          icon={Package}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
      </div>
    </div>
  );
}
