import { useTranslation } from "react-i18next";
import {
  Eye,
  Pencil,
  Trash2,
  Shield,
  Crown,
  UserCog,
  Phone,
  UserCheck,
  UserX,
} from "lucide-react";

import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/table/data-table";
import { AppRole } from "@/constants/enum";
import type { User } from "@/types/entities";
import { getDisplayName, getInitials } from "@/common/utils";

interface UseUsersColumnsProps {
  currentUser: User | null;
  isSuperadmin: boolean;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleActive?: (user: User) => void;
  isTogglingActive?: boolean;
}

export function useUsersColumns({
  currentUser,
  isSuperadmin,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  isTogglingActive = false,
}: UseUsersColumnsProps): Column<User>[] {
  const { t } = useTranslation();

  const columns: Column<User>[] = [
    {
      key: "name",
      header: t("fields.name"),
      sortable: true,
      render: (user) => {
        const displayName = getDisplayName(user);
        const initials = getInitials(user);
        const userIsSuperadmin = user.isSuperadmin === true;

        return (
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                userIsSuperadmin ? "bg-yellow-100" : "bg-accent-pink/10"
              }`}
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={displayName}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <span
                  className={`font-medium ${
                    userIsSuperadmin ? "text-yellow-600" : "text-accent-pink"
                  }`}
                >
                  {initials}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{displayName}</p>
                {userIsSuperadmin && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    },
  ];

  columns.push({
    key: "status",
    header: t("fields.status"),
    render: (user) => (
      <Badge variant={user.isActive ? "success" : "warning"}>
        {user.isActive ? t("common.active") : t("common.inactive")}
      </Badge>
    ),
  });

  // Conditional columns based on user role
  if (isSuperadmin) {
    // Superadmin sees managedBy column
    columns.push({
      key: "managedBy",
      header: "Géré par",
      render: (user) => (
        <div className="flex items-center gap-2">
          {user.managedBy ? (
            <>
              <UserCog className="h-4 w-4 text-accent-pink" />
              <span>{user.managedBy.name || user.managedBy.email}</span>
            </>
          ) : user.role === AppRole.ADMIN || user.isSuperadmin ? (
            <span className="text-muted-foreground text-sm">-</span>
          ) : (
            <span className="text-muted-foreground text-sm">Non assigné</span>
          )}
        </div>
      ),
    });

    // Superadmin sees salon column
    columns.push({
      key: "salon",
      header: t("fields.salon"),
      render: (user) => {
        // Admins and superadmins don't have salon assignments
        if (user.role === AppRole.ADMIN || user.isSuperadmin) {
          return <span className="text-muted-foreground text-sm">-</span>;
        }

        // Regular users should have a salon
        if (user.salon) {
          return (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-accent-blue/10 flex items-center justify-center">
                <span className="text-xs font-medium text-accent-blue">
                  {user.salon.name.substring(0, 1).toUpperCase()}
                </span>
              </div>
              <span>{user.salon.name}</span>
            </div>
          );
        }

        // User without salon assignment
        return (
          <span className="text-muted-foreground text-sm">Non assigné</span>
        );
      },
    });

    // Superadmin sees role column
    columns.push({
      key: "role",
      header: t("fields.role"),
      render: (user) => {
        const userIsSuperadmin = user.isSuperadmin === true;
        return (
          <Badge
            variant={
              user.role === AppRole.ADMIN || userIsSuperadmin
                ? "info"
                : "default"
            }
          >
            <Shield className="h-3 w-3 me-1" />
            {userIsSuperadmin
              ? "Super Admin"
              : user.role === AppRole.ADMIN
              ? "Admin"
              : "Utilisateur"}
          </Badge>
        );
      },
    });
  } else {
    // Admin sees phone column instead
    columns.push({
      key: "phone",
      header: t("fields.phone"),
      render: (user) => (
        <div className="flex items-center gap-2">
          {user.phone ? (
            <>
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user.phone}</span>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      ),
    });
  }

  // Common columns for both
  columns.push(
    {
      key: "createdAt",
      header: t("fields.createdAt"),
      sortable: true,
      render: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      className: "w-32",
      render: (user: User) => {
        const userIsSuperadmin = user.isSuperadmin === true;
        const isSelf = user.id === currentUser?.id;

        // Permission checks
        const canEdit = isSuperadmin || !userIsSuperadmin;
        const canDelete = isSuperadmin && !isSelf && !userIsSuperadmin;
        const canToggle =
          !!onToggleActive &&
          !userIsSuperadmin &&
          !isSelf &&
          (isSuperadmin || user.managedById === currentUser?.id);

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(user);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(user);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {canToggle && (
              <Button
                variant="ghost"
                size="sm"
                title={
                  user.isActive ? t("common.deactivate") : t("common.activate")
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleActive?.(user);
                }}
                disabled={isTogglingActive}
                className={
                  user.isActive
                    ? "text-destructive hover:text-destructive"
                    : "text-green-600 hover:text-green-700"
                }
              >
                {user.isActive ? (
                  <UserX className="h-4 w-4" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(user);
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    }
  );

  return columns;
}
