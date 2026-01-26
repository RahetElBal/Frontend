import { useTranslation } from "react-i18next";
import { Building2, Users, CheckCircle2 } from "lucide-react";
import { StatsCard } from "@/components/stats-card";

interface StatsGridProps {
  totalSalons: number;
  activeSalons: number;
  totalUsers: number;
  isSuperadmin: boolean;
}

export function StatsGrid({
  totalSalons,
  activeSalons,
  totalUsers,
  isSuperadmin,
}: StatsGridProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 ${isSuperadmin ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}
    >
      <StatsCard
        title={t("admin.salons.totalSalons")}
        value={totalSalons}
        icon={Building2}
        iconColor="text-accent-pink"
        iconBgColor="bg-accent-pink/10"
      />
      {isSuperadmin && (
        <StatsCard
          title={t("admin.salons.activeSalons")}
          value={activeSalons}
          icon={CheckCircle2}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
      )}
      <StatsCard
        title={t("admin.salons.totalUsers")}
        value={totalUsers}
        icon={Users}
        iconColor="text-accent-blue"
        iconBgColor="bg-accent-blue/10"
      />
    </div>
  );
}
