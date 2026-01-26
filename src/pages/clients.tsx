import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
  Plus,
  Mail,
  Phone,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Award,
  DollarSign,
} from "lucide-react";
import {
  requiredString,
  optionalString,
  optionalEmailField,
} from "@/common/validator/zodI18n";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import { DataTable, type Column } from "@/components/table/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTable } from "@/hooks/useTable";
import { useLanguage } from "@/hooks/useLanguage";
import { useForm } from "@/hooks/useForm";
import { toast } from "@/lib/toast";
import type { Client } from "@/types/entities";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";

// Modal state type
type ClientModalState = {
  clientId: string | "create";
  mode: "view" | "edit" | "delete";
} | null;

// Zod schema for client form
const clientFormSchema = z.object({
  firstName: requiredString("Prénom"),
  lastName: requiredString("Nom"),
  email: optionalEmailField(),
  phone: optionalString(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

export function ClientsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  // Unified modal state
  const [modalState, setModalState] = useState<ClientModalState>(null);

  // Fetch clients from API (scoped to current salon)
  const {
    data: clients = [],
    isLoading,
    refetch,
  } = useGet<Client[]>("clients");

  // Helper functions
  const getSelectedClient = (): Client | null => {
    if (!modalState || modalState.clientId === "create") return null;
    return clients.find((c) => c.id === modalState.clientId) || null;
  };

  const selectedClient = getSelectedClient();
  const isCreateMode = modalState?.clientId === "create";
  const isEditMode = modalState?.mode === "edit" && !isCreateMode;
  const isViewMode = modalState?.mode === "view";
  const isDeleteMode = modalState?.mode === "delete";

  // Form setup
  const form = useForm<ClientFormData>({
    schema: clientFormSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  // Reset form when modal state changes
  useEffect(() => {
    if (isCreateMode) {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
    } else if (selectedClient && isEditMode) {
      form.reset({
        firstName: selectedClient.firstName,
        lastName: selectedClient.lastName,
        email: selectedClient.email || "",
        phone: selectedClient.phone || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState, selectedClient, isCreateMode, isEditMode]);

  // Create client mutation
  const { mutate: createClient, isPending: isCreating } = usePost<
    Client,
    ClientFormData
  >("clients", {
    onSuccess: () => {
      toast.success(t("clients.addClient") + " - " + t("common.success"));
      setModalState(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Update client mutation
  const { mutate: updateClient, isPending: isUpdating } = usePost<
    Client,
    ClientFormData
  >("clients", {
    id: selectedClient?.id,
    method: "PATCH",
    onSuccess: () => {
      toast.success(t("common.edit") + " - " + t("common.success"));
      setModalState(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Delete client mutation
  const { mutate: deleteClient, isPending: isDeleting } = usePost<void, void>(
    "clients",
    {
      id: selectedClient?.id,
      method: "DELETE",
      onSuccess: () => {
        toast.success(t("common.delete") + " - " + t("common.success"));
        setModalState(null);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("common.error"));
      },
    },
  );

  const table = useTable<Client>({
    data: clients,
    searchKeys: ["firstName", "lastName", "email", "phone"],
  });

  // Handlers
  const handleView = (client: Client) => {
    setModalState({ clientId: client.id, mode: "view" });
  };

  const handleEdit = (client: Client) => {
    setModalState({ clientId: client.id, mode: "edit" });
  };

  const handleDelete = (client: Client) => {
    setModalState({ clientId: client.id, mode: "delete" });
  };

  const handleSubmit = (data: ClientFormData) => {
    if (isEditMode) {
      updateClient(data);
    } else {
      createClient(data);
    }
  };

  const columns: Column<Client>[] = [
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
      render: (client) => (
        <span className="text-muted-foreground">{client.visitCount}</span>
      ),
    },
    {
      key: "lastVisit",
      header: t("fields.lastVisit"),
      sortable: true,
      render: (client) =>
        client.lastVisit ? (
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
            <DropdownMenuItem onClick={() => handleView(client)}>
              <Eye className="h-4 w-4 me-2" />
              {t("common.view")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(client)}>
              <Edit className="h-4 w-4 me-2" />
              {t("common.edit")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(client)}
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.clients")}
        description={t("clients.description", { count: clients.length })}
        actions={
          <Button
            className="gap-2"
            onClick={() => setModalState({ clientId: "create", mode: "edit" })}
          >
            <Plus className="h-4 w-4" />
            {t("clients.addClient")}
          </Button>
        }
      />

      <DataTable
        table={table}
        columns={columns}
        selectable
        searchPlaceholder={t("clients.searchPlaceholder")}
        emptyMessage={isLoading ? t("common.loading") : t("clients.noClients")}
      />

      {/* Create/Edit Client Modal */}
      <Dialog
        open={isEditMode || isCreateMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? t("clients.addClient") : t("common.edit")}
            </DialogTitle>
            {isEditMode && selectedClient && (
              <DialogDescription>
                {selectedClient.firstName} {selectedClient.lastName}
              </DialogDescription>
            )}
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("fields.firstName")} *</Label>
                  <Input id="firstName" {...form.register("firstName")} />
                  {form.hasError("firstName") && (
                    <p className="text-sm text-destructive">
                      {form.getError("firstName")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("fields.lastName")} *</Label>
                  <Input id="lastName" {...form.register("lastName")} />
                  {form.hasError("lastName") && (
                    <p className="text-sm text-destructive">
                      {form.getError("lastName")}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("fields.email")}</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.hasError("email") && (
                  <p className="text-sm text-destructive">
                    {form.getError("email")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("fields.phone")}</Label>
                <Input id="phone" type="tel" {...form.register("phone")} />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalState(null)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={form.isSubmitting || isCreating || isUpdating}
              >
                {form.isSubmitting || isCreating || isUpdating
                  ? t("common.loading")
                  : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Client Modal */}
      <Dialog
        open={isViewMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>{t("clients.clientDetails")}</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-accent-pink/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent-pink">
                    {selectedClient.firstName[0]}
                    {selectedClient.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedClient.firstName} {selectedClient.lastName}
                  </h3>
                  {selectedClient.email && (
                    <p className="text-muted-foreground">
                      {selectedClient.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4">
                {selectedClient.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("fields.phone")}
                      </p>
                      <p className="font-medium">{selectedClient.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.loyaltyPoints")}
                    </p>
                    <Badge
                      variant={
                        selectedClient.loyaltyPoints >= 500
                          ? "success"
                          : "default"
                      }
                    >
                      {selectedClient.loyaltyPoints} pts
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.totalSpent")}
                    </p>
                    <p className="font-medium">
                      {formatCurrency(selectedClient.totalSpent)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.visits")}
                    </p>
                    <p className="font-medium">
                      {selectedClient.visitCount}{" "}
                      {t("fields.visits").toLowerCase()}
                      {selectedClient.lastVisit && (
                        <span className="text-muted-foreground text-sm ml-2">
                          ({t("fields.lastVisit")}:{" "}
                          {new Date(
                            selectedClient.lastVisit,
                          ).toLocaleDateString()}
                          )
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalState(null)}>
              {t("common.close")}
            </Button>
            {selectedClient && (
              <Button
                onClick={() =>
                  setModalState({ clientId: selectedClient.id, mode: "edit" })
                }
              >
                <Edit className="h-4 w-4 me-2" />
                {t("common.edit")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clients.deleteClient")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("clients.deleteClientConfirm", {
                name: selectedClient
                  ? `${selectedClient.firstName} ${selectedClient.lastName}`
                  : "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteClient()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
