import { useTranslation } from "react-i18next";
import {
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import type { Service } from "@/types/entities";
import { translateServiceName } from "@/common/service-translations";

interface ServiceCardProps {
  service: Service;
  onView: (service: Service) => void;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggle: (service: Service) => void;
  canManage?: boolean;
}

export function ServiceCard({
  service,
  onView,
  onEdit,
  onDelete,
  onToggle,
  canManage = false,
}: ServiceCardProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  const displayName = translateServiceName(t, service);

  return (
    <Card
      className={cn(
        "p-4 transition-shadow hover:shadow-md",
        !service.isActive && "opacity-60",
      )}
    >
      {service.image && (
        <div className="mb-3 overflow-hidden rounded-lg">
          <img
            src={service.image}
            alt={displayName}
            className="h-32 w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{displayName}</h3>
            {!service.isActive && (
              <Badge variant="warning">{t("common.inactive")}</Badge>
            )}
          </div>
          {service.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {service.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {service.duration} min
            </div>
            <span className="text-lg font-bold text-accent-pink">
              {formatCurrency(service.price)}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(service)}>
              <Eye className="h-4 w-4 me-2" />
              {t("common.view")}
            </DropdownMenuItem>
            {canManage && (
              <>
                <DropdownMenuItem onClick={() => onEdit(service)}>
                  <Edit className="h-4 w-4 me-2" />
                  {t("common.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggle(service)}>
                  {service.isActive ? (
                    <>
                      <ToggleLeft className="h-4 w-4 me-2" />
                      {t("common.deactivate")}
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-4 w-4 me-2" />
                      {t("common.activate")}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(service)}
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
    </Card>
  );
}
