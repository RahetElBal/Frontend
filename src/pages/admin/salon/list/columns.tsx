import { useTranslation } from "react-i18next";
import { Eye, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Salon, User } from "@/types/entities";
import { canModifySalon } from "../utils";
import type { Column } from "@/components/table";
import { Badge } from "@/components/badge";
import { MediaImage } from "@/components/media-image";

const DEFAULT_SALON_IMAGE = "/salon-placeholder.svg";

interface UseSalonsColumnsProps {
  currentUser: User | null;
  isSuperadmin: boolean;
  onView: (salon: Salon) => void;
  onEdit: (salon: Salon) => void;
  onDelete: (salon: Salon) => void;
}

export function useSalonsColumns({
  currentUser,
  isSuperadmin,
  onView,
  onEdit,
  onDelete,
}: UseSalonsColumnsProps): Column<Salon>[] {
  const { t } = useTranslation();

  const columns: Column<Salon>[] = [
    {
      key: "name",
      header: t("fields.name"),
      sortable: true,
      render: (salon) => (
        <div className="flex items-center gap-3">
          <MediaImage
            src={salon.logo}
            fallbackSrc={DEFAULT_SALON_IMAGE}
            alt={salon.name}
            className="h-8 w-8 rounded-md object-cover border border-border/60 shrink-0"
            loading="lazy"
          />
          <div className="font-medium">{salon.name}</div>
        </div>
      ),
    },
    {
      key: "address",
      header: t("fields.address"),
      sortable: true,
      render: (salon) => (
        <div className="text-sm text-muted-foreground">
          {salon.address || "-"}
        </div>
      ),
    },
    {
      key: "phone",
      header: t("fields.phone"),
      render: (salon) => <div className="text-sm">{salon.phone || "-"}</div>,
    },
    {
      key: "email",
      header: t("fields.email"),
      render: (salon) => <div className="text-sm">{salon.email || "-"}</div>,
    },
    {
      key: "staff",
      header: t("admin.salons.staffCount"),
      sortable: true,
      className: "text-center",
      render: (salon) => (
        <div className="text-center">{salon.staff?.length || 0}</div>
      ),
    },
    {
      key: "isActive",
      header: t("fields.status"),
      sortable: true,
      render: (salon) => (
        <Badge
          variant={salon.isActive ? "success" : "secondary"}
          className="gap-1"
        >
          {salon.isActive ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {salon.isActive ? t("common.active") : t("common.inactive")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-32",
      render: (salon: Salon) => {
        const canModify = canModifySalon(salon, currentUser);

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(salon);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canModify && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(salon);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(salon);
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  // Add owner column for superadmin (insert after name)
  if (isSuperadmin) {
    columns.splice(1, 0, {
      key: "owner",
      header: t("admin.salons.salonOwner"),
      sortable: true,
      render: (salon) => (
        <div className="text-sm">
          {salon.owner?.name || salon.owner?.email || "-"}
        </div>
      ),
    });
  }

  return columns;
}
