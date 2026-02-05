import { Mail, Phone, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
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
import type { Client } from "@/types/entities";

interface ClientColumnsProps {
  t: (key: string) => string;
  formatCurrency: (value: number) => string;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

const isWalkInClient = (client: Client) =>
  (client.email || "").toLowerCase().startsWith("walkin+");

export const getClientColumns = ({
  t,
  formatCurrency,
  onView,
  onEdit,
  onDelete,
}: ClientColumnsProps): Column<Client>[] => [
  {
    key: "name",
    header: t("fields.name"),
    sortable: true,
    render: (client) => (
      <div>
        <p className="font-medium">
          {client.firstName} {client.lastName}
        </p>
        {client.email && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {client.email}
          </p>
        )}
      </div>
    ),
  },
  {
    key: "phone",
    header: t("fields.phone"),
    render: (client) =>
      client.phone ? (
        <span className="flex items-center gap-1 text-sm">
          <Phone className="h-3 w-3" />
          {client.phone}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    key: "loyaltyPoints",
    header: t("fields.loyaltyPoints"),
    sortable: true,
    render: (client) => (
      <Badge variant={client.loyaltyPoints >= 500 ? "success" : "default"}>
        {client.loyaltyPoints} pts
      </Badge>
    ),
  },
  {
    key: "totalSpent",
    header: t("fields.totalSpent"),
    sortable: true,
    render: (client) => (
      <span className="font-medium">{formatCurrency(client.totalSpent)}</span>
    ),
  },
  {
    key: "visitCount",
    header: t("fields.visits"),
    sortable: true,
    render: (client) =>
      isWalkInClient(client) ? (
        <span className="text-muted-foreground">-</span>
      ) : (
        <span className="text-muted-foreground">{client.visitCount}</span>
      ),
  },
  {
    key: "lastVisit",
    header: t("fields.lastVisit"),
    sortable: true,
    render: (client) =>
      isWalkInClient(client) ? (
        <span className="text-muted-foreground">-</span>
      ) : client.lastVisit ? (
        new Date(client.lastVisit).toLocaleDateString()
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    key: "actions",
    header: "",
    className: "w-12",
    render: (client) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(client)}>
            <Eye className="h-4 w-4 me-2" />
            {t("common.view")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(client)}>
            <Edit className="h-4 w-4 me-2" />
            {t("common.edit")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(client)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 me-2" />
            {t("common.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
