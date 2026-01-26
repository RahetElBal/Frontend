import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Shield,
  Building2,
  Crown,
  UserCog,
} from "lucide-react";

import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/table/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@/types/entities";
import type { User } from "@/types/entities";
import { getDisplayName, getInitials } from "@/common/utils";
import type { TFunction } from "i18next";

interface UserColumnsParams {
  t: TFunction;
  isSuperadmin: boolean;
  handleView: (user: User) => void;
  handleEdit: (user: User) => void;
  handleDelete: (user: User) => void;
  handleToggleStatus: (user: User) => void;
}

export const useColumns = ({
  t,
  isSuperadmin,
  handleView,
  handleEdit,
  handleDelete,
  handleToggleStatus,
}: UserColumnsParams): Column<User>[] => [
  {
    key: "name",
    header: t("fields.name"),
    sortable: true,
    render: (user) => {
      const displayName = getDisplayName(user);
      const initials = getInitials(user);

      return (
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${isSuperadmin ? "bg-yellow-100" : "bg-accent-pink/10"}`}
          >
            {user.picture ? (
              <img
                src={user.picture}
                alt={displayName}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <span
                className={`font-medium ${isSuperadmin ? "text-yellow-600" : "text-accent-pink"}`}
              >
                {initials}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{displayName}</p>
              {isSuperadmin && <Crown className="h-4 w-4 text-yellow-500" />}
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    key: "managedBy",
    header: "Géré par",
    render: (user) => (
      <div className="flex items-center gap-2">
        {user.managedBy ? (
          <>
            <UserCog className="h-4 w-4 text-accent-pink" />
            <span>{user.managedBy.name || user.managedBy.email}</span>
          </>
        ) : user.role === UserRole.ADMIN ? (
          <span className="text-muted-foreground text-sm">-</span>
        ) : (
          <span className="text-muted-foreground text-sm">Non assigné</span>
        )}
      </div>
    ),
  },
  {
    key: "salon",
    header: t("fields.salon"),
    render: (user) => (
      <div className="flex items-center gap-2">
        {user.workingSalons?.[0] ? (
          <>
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{user.workingSalons[0].name}</span>
          </>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </div>
    ),
  },
  {
    key: "role",
    header: t("fields.role"),
    render: (user) => (
      <Badge variant={user.role === UserRole.ADMIN ? "info" : "default"}>
        <Shield className="h-3 w-3 me-1" />
        {user.role === UserRole.ADMIN ? "Admin" : "Utilisateur"}
      </Badge>
    ),
  },
  {
    key: "status",
    header: t("fields.status"),
    render: (user) => (
      <Badge variant={user.isActive ? "success" : "error"}>
        {user.isActive ? t("common.active") : t("common.inactive")}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    header: t("fields.createdAt"),
    sortable: true,
    render: (user) => new Date(user.createdAt).toLocaleDateString(),
  },
  {
    key: "actions",
    header: "",
    className: "w-12",
    render: (user) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(user)}>
              <Eye className="h-4 w-4 me-2" />
              {t("common.view")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleEdit(user)}
              disabled={isSuperadmin}
              className={isSuperadmin ? "opacity-50" : ""}
            >
              <Edit className="h-4 w-4 me-2" />
              {t("common.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleToggleStatus(user)}
              disabled={isSuperadmin}
              className={isSuperadmin ? "opacity-50" : ""}
            ></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(user)}
              disabled={isSuperadmin}
              className={`text-destructive ${isSuperadmin ? "opacity-50" : ""}`}
            >
              <Trash2 className="h-4 w-4 me-2" />
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
