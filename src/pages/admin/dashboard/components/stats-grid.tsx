import { useTranslation } from "react-i18next";
import { Building2, Users, DollarSign, Activity } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { formatCurrency } from "../utils";

interface StatsGridProps {
  totalSalons: number;
  totalUsers: number;
  activeSubscriptions: number;
}

export function StatsGrid({
  totalSalons,
  totalUsers,
  activeSubscriptions,
}: StatsGridProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title={t("admin.stats.totalSalons")}
        value={totalSalons}
        change={0}
        icon={Building2}
        iconColor="text-accent-pink"
        iconBgColor="bg-accent-pink/10"
      />
      <StatsCard
        title={t("admin.stats.totalUsers")}
        value={totalUsers}
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
        value={activeSubscriptions}
        icon={Activity}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100"
      />
    </div>
  );
}
