import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import type { User } from "@/types";
import { formatDate } from "@/common/utils";
import { RecentCard } from "./recent-card";

interface RecentUsersCardProps {
  users: User[];
}

export function RecentUsersCard({ users }: RecentUsersCardProps) {
  const { t } = useTranslation();
  const { isSuperadmin } = useUser();

  const title = isSuperadmin
    ? t("admin.dashboard.recentUsers")
    : "Utilisateurs assignés";
  const emptyMessage = isSuperadmin
    ? "Aucun utilisateur récent"
    : "Aucun utilisateur assigné";

  return (
    <RecentCard
      title={title}
      emptyIcon={<Users className="h-8 w-8" />}
      emptyMessage={emptyMessage}
      isEmpty={users.length === 0}
    >
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
    </RecentCard>
  );
}
