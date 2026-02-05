import { Users, UserCog } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { User } from "@/types/entities";
import { UserRole } from "@/types/entities";
import { AdminStatsGrid } from "@/pages/admin/components/stats-grid";

interface StatsGridProps {
  users: User[];
  isSuperadmin: boolean;
}

export function StatsGrid({ users, isSuperadmin }: StatsGridProps) {
  const totalUsers = users.length;
  const admins = users.filter((u) => u.role === UserRole.ADMIN).length;

  const allStats = [
    {
      title: "Total utilisateurs",
      value: totalUsers,
      icon: Users,
      color: "text-accent-pink",
      bgColor: "bg-accent-pink/10",
    },
    {
      title: "Administrateurs",
      value: admins,
      icon: UserCog,
      color: "text-accent-blue",
      bgColor: "bg-accent-blue/10",
      showOnlyForSuperadmin: true,
    },
  ];

  const stats = allStats.filter(
    (stat) => !stat.showOnlyForSuperadmin || isSuperadmin
  );

  return (
    <AdminStatsGrid
      className={`md:grid-cols-1 ${
        isSuperadmin ? "lg:grid-cols-2" : "lg:grid-cols-1"
      }`}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </AdminStatsGrid>
  );
}
