import { useTranslation } from "react-i18next";
import { Building2, Users, DollarSign, Activity } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import type { PaginatedResponse, Salon, User } from "@/types";

interface StatsGridProps {
  salonsData?: Salon[];
  usersData?: PaginatedResponse<User>;
}

export function StatsGrid({ salonsData, usersData }: StatsGridProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { isSuperadmin } = useUser();
  const totalSalons = salonsData?.length || 0;
  const totalUsers = usersData?.meta.total || 0;
  const activeSubscriptions = salonsData?.filter((s) => s.isActive).length || 0;

  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 ${isSuperadmin ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
    >
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
      {isSuperadmin && (
        <StatsCard
          title={t("admin.stats.activeSubscriptions")}
          value={activeSubscriptions}
          icon={Activity}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      )}
    </div>
  );
}
