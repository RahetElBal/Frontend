import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Salon } from "@/types";
import { formatDate } from "@/common/utils";

interface RecentSalonsCardProps {
  salons: Salon[];
}

export function RecentSalonsCard({ salons }: RecentSalonsCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">
        {t("admin.dashboard.recentSalons")}
      </h2>
      {salons.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Aucun salon récent</p>
        </div>
      ) : (
        <div className="space-y-3">
          {salons.map((salon) => (
            <div
              key={salon.id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{salon.name}</p>
                  {salon.isActive && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Actif
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {salon.address}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Créé le {formatDate(salon.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
