import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { User } from "@/types";
import { formatDate } from "@/common/utils";

interface RecentUsersCardProps {
  users: User[];
}

export function RecentUsersCard({ users }: RecentUsersCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">
        {t("admin.dashboard.recentUsers")}
      </h2>
      {users.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Aucun utilisateur récent</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{user.name}</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Créé le {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
