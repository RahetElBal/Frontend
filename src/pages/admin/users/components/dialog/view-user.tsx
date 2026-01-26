import { useTranslation } from "react-i18next";
import {
  Mail,
  Shield,
  Building2,
  Calendar,
  Crown,
  ToggleLeft,
  ToggleRight,
  Edit,
  UserCog,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserRole } from "@/types/entities";
import type { User } from "@/types/entities";
import { getDisplayName, getInitials } from "@/common/utils";
import { useUser } from "@/hooks/useUser";

interface ViewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onEdit: () => void;
}

export function ViewUserDialog({
  open,
  onOpenChange,
  user,
  onEdit,
}: ViewUserDialogProps) {
  const { t } = useTranslation();
  const { isSuperadmin } = useUser();
  if (!user) return null;

  const displayName = getDisplayName(user);
  const initials = getInitials(user);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Détails de l'utilisateur</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <div
              className={`h-16 w-16 rounded-full flex items-center justify-center ${isSuperadmin ? "bg-yellow-100" : "bg-accent-pink/10"}`}
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={displayName}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <span
                  className={`text-2xl font-bold ${isSuperadmin ? "text-yellow-600" : "text-accent-pink"}`}
                >
                  {initials}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{displayName}</h3>
                {isSuperadmin && (
                  <Badge variant="warning" className="gap-1">
                    <Crown className="h-3 w-3" />
                    Super Admin
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("fields.email")}
                </p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("fields.role")}
                </p>
                <Badge
                  variant={user.role === UserRole.ADMIN ? "info" : "default"}
                >
                  {user.role === UserRole.ADMIN
                    ? "Administrateur"
                    : "Utilisateur"}
                </Badge>
              </div>
            </div>

            {user.role !== UserRole.ADMIN && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <UserCog className="h-5 w-5 text-accent-pink" />
                <div>
                  <p className="text-sm text-muted-foreground">Géré par</p>
                  <p className="font-medium">
                    {user.managedBy?.name ||
                      user.managedBy?.email ||
                      "Non assigné"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("fields.salon")}
                </p>
                <p className="font-medium">
                  {user.workingSalons?.[0]?.name || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("fields.createdAt")}
                </p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {user.isActive ? (
                  <ToggleRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("fields.status")}
                  </p>
                  <Badge variant={user.isActive ? "success" : "error"}>
                    {user.isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          {!isSuperadmin && (
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
