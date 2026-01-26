import { useTranslation } from "react-i18next";
import {
  Building2,
  Edit,
  Shield,
  MapPin,
  Phone,
  Mail,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import type { Salon } from "@/types/entities";

interface SalonViewModalProps {
  isOpen: boolean;
  salon: Salon | null;
  canModify: boolean;
  isOwnSalon: boolean;
  isSuperadmin: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function SalonViewModal({
  isOpen,
  salon,
  canModify,
  isOwnSalon,
  isSuperadmin,
  onClose,
  onEdit,
}: SalonViewModalProps) {
  const { t } = useTranslation();

  if (!salon) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{t("admin.salons.salonDetails")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-accent-pink/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-accent-pink" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{salon.name}</h3>
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

          <div className="grid gap-4">
            {/* Owner info - visible to superadmin */}
            {isSuperadmin && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent-pink/5 border border-accent-pink/20">
                <Shield className="h-5 w-5 text-accent-pink" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.salons.salonOwner")}
                  </p>
                  <p className="font-medium">
                    {salon.owner?.name ||
                      salon.owner?.email ||
                      t("common.unknown")}
                  </p>
                </div>
              </div>
            )}

            {salon.address && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("fields.address")}
                  </p>
                  <p className="font-medium">{salon.address}</p>
                </div>
              </div>
            )}

            {salon.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("fields.phone")}
                  </p>
                  <p className="font-medium">{salon.phone}</p>
                </div>
              </div>
            )}

            {salon.email && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("fields.email")}
                  </p>
                  <p className="font-medium">{salon.email}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.salons.users")}
                </p>
                <p className="font-medium">
                  {salon.staff?.length || 0}{" "}
                  {t("admin.salons.users").toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.close")}
          </Button>
          {canModify && (
            <Button onClick={onEdit}>
              <Edit className="h-4 w-4 me-2" />
              {t("common.edit")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
