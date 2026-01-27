import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { useTable } from "@/hooks/useTable";
import { useLanguage } from "@/hooks/useLanguage";
import { useForm } from "@/hooks/useForm";
import type { Client } from "@/types/entities";
import { useGet } from "@/hooks/useGet";

import { ClientModals } from "./components/dialog/client-modals";
import type { ClientModalState } from "../types";
import type { PaginatedResponse } from "@/types";
import { clientFormSchema, type ClientFormData } from "../validation";
import { getClientColumns } from "./components/list/columns";

export function ClientsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  // Unified modal state
  const [modalState, setModalState] = useState<ClientModalState>(null);

  // Fetch clients from API (scoped to current salon) - returns paginated response
  const {
    data: clientsResponse,
    isLoading,
    refetch,
  } = useGet<PaginatedResponse<Client>>("clients");

  // Extract the data array from paginated response
  const clients = clientsResponse?.data || [];

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

  const columns = getClientColumns({
    t,
    formatCurrency,
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

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

      {/* Unified Modal Handler */}
      <ClientModals
        modalState={modalState}
        setModalState={setModalState}
        clients={clients}
        form={form}
        onSuccess={refetch}
      />
    </div>
  );
}
