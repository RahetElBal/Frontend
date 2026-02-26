import { useTranslation } from "react-i18next";
import { DollarSign } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { useLanguage } from "@/hooks/useLanguage";

interface RevenueStatsProps {
  grossRevenue?: number;
  netRevenue?: number;
  loading?: boolean;
}

export function RevenueStats({
  grossRevenue = 0,
  netRevenue = 0,
  loading = false,
}: RevenueStatsProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  return (
    <>
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
    </>
  );
}
