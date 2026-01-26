import { Users, UserCog, UserCheck, UserX } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { User } from "@/types/entities";
import { UserRole } from "@/types/entities";

interface StatsGridProps {
  users: User[];
  isSuperadmin: boolean;
}

export function StatsGrid({ users, isSuperadmin }: StatsGridProps) {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;
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
      title: "Utilisateurs actifs",
      value: activeUsers,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Administrateurs",
      value: admins,
      icon: UserCog,
      color: "text-accent-blue",
      bgColor: "bg-accent-blue/10",
      showOnlyForSuperadmin: true,
    },
    {
      title: "Utilisateurs inactifs",
      value: inactiveUsers,
      icon: UserX,
      color: "text-gray-500",
      bgColor: "bg-gray-100",
    },
  ];

  const stats = allStats.filter(
    (stat) => !stat.showOnlyForSuperadmin || isSuperadmin,
  );

  return (
    <div
      className={`grid gap-4 md:grid-cols-2 ${isSuperadmin ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
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
    </div>
  );
}
