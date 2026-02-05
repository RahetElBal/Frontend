import { useTranslation } from "react-i18next";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  UserCog,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Salon } from "@/types/entities";
import { MediaImage } from "@/components/media-image";

const DEFAULT_SALON_IMAGE = "/salon-placeholder.svg";

interface SalonCardProps {
  salon: Salon;
  canModify: boolean;
  isOwnSalon: boolean;
  isSuperadmin: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SalonCard({
  salon,
  canModify,
  isOwnSalon,
  isSuperadmin,
  onView,
  onEdit,
  onDelete,
}: SalonCardProps) {
  const { t } = useTranslation();
  const ownerName =
    salon.owner?.name || salon.owner?.email || t("common.unknown");

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-accent-pink/10 flex items-center justify-center overflow-hidden">
              <MediaImage
                src={salon.logo}
                fallbackSrc={DEFAULT_SALON_IMAGE}
                alt={salon.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <h3 className="font-semibold">{salon.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={salon.isActive ? "success" : "warning"}>
                  {salon.isActive ? t("common.active") : t("common.inactive")}
                </Badge>
                {isOwnSalon && (
                  <Badge
                    variant="default"
                    className="bg-accent-pink/20 text-accent-pink"
                  >
                    {t("admin.salons.yourSalon")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 me-2" />
                {t("common.view")}
              </DropdownMenuItem>
              {canModify && (
                <>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 me-2" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 me-2" />
                    {t("common.delete")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          {salon.address && (
            <p className="text-muted-foreground">{salon.address}</p>
          )}
          {salon.email && (
            <p className="text-muted-foreground">{salon.email}</p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {salon.staff?.length || 0} {t("admin.salons.users")}
          </div>
          {isSuperadmin && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <UserCog className="h-4 w-4" />
              {ownerName}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
