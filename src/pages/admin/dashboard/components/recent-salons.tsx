import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import type { Salon } from "@/pages/admin/salon/types";
import { formatDate } from "@/common/utils";
import { RecentCard } from "./recent-card";
import { MediaImage } from "@/components/media-image";

const DEFAULT_SALON_IMAGE = "/salon-placeholder.svg";

interface RecentSalonsCardProps {
  salons: Salon[];
}

export function RecentSalonsCard({ salons }: RecentSalonsCardProps) {
  const { t } = useTranslation();
  const { isSuperadmin } = useUser();
  if (!isSuperadmin) {
    return null;
  }

  return (
    <RecentCard
      title={t("admin.dashboard.recentSalons")}
      emptyIcon={<Building2 className="h-8 w-8" />}
      emptyMessage="Aucun salon récent"
      isEmpty={salons.length === 0}
    >
      <div className="space-y-3">
        {salons.map((salon) => (
          <div
            key={salon.id}
            className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
          >
            <MediaImage
              src={salon.logo}
              fallbackSrc={DEFAULT_SALON_IMAGE}
              alt={salon.name}
              className="h-10 w-10 rounded-lg object-cover border border-border/60 shrink-0"
              loading="lazy"
            />
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
    </RecentCard>
  );
}
