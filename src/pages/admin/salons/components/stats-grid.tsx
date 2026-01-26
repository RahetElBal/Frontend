import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Building2, CheckCircle2, Users, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useGet } from "@/hooks/useGet";
import { useLanguage } from "@/hooks/useLanguage";
import type { Sale } from "@/types/entities";

interface StatsGridProps {
  totalSalons: number;
  activeSalons: number;
  totalUsers: number;
}

export function StatsGrid({
  totalSalons,
  activeSalons,
  totalUsers,
}: StatsGridProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  // Fetch sales data
  const { data: sales = [] } = useGet<Sale[]>("sales");

  // Calculate monthly revenue (current month)
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return sales
      .filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return (
          saleDate.getMonth() === currentMonth &&
          saleDate.getFullYear() === currentYear &&
          sale.status === "completed"
        );
      })
      .reduce((sum, sale) => sum + sale.total, 0);
  }, [sales]);

  const stats = [
    {
      label: t("admin.salons.totalSalons"),
      value: totalSalons,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: t("admin.salons.activeSalons"),
      value: activeSalons,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: t("admin.salons.totalUsers"),
      value: totalUsers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: t("admin.salons.monthlyRevenue"),
      value: formatCurrency(monthlyRevenue),
      icon: TrendingUp,
      color: "text-accent-pink",
      bgColor: "bg-pink-100",
      isRevenue: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p
                  className={`text-2xl font-bold ${stat.isRevenue ? stat.color : ""}`}
                >
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
