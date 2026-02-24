import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { useTable } from "@/hooks/useTable";
import { useLanguage } from "@/hooks/useLanguage";
import { useForm } from "@/hooks/useForm";
import type { Client } from "@/types/entities";
import { ClientModals } from "./components/dialog/client-modals";
import type { ClientModalState } from "./types";
import { clientFormSchema, type ClientFormData } from "./validation";
import { getClientColumns } from "./components/list/columns";
import { useUser } from "@/hooks/useUser";
import type { PaginatedResponse } from "@/types";
import { useGet, withParams } from "@/hooks/useGet";

const isWalkInClient = (client: Client) =>
  (client.email || "").toLowerCase().startsWith("walkin+");

export function ClientsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  const { isUser, user } = useUser();
  const [modalState, setModalState] = useState<ClientModalState>(null);

  const salonId = user?.salon?.id;
  const clientsStaleTime = 1000 * 60 * 10;

  const {
    data: clientsResponse,
    isLoading,
    refetch,
  } = useGet<PaginatedResponse<Client>>(
    withParams("clients", { salonId, perPage: 100 }),
    { enabled: !!salonId, staleTime: clientsStaleTime },
  );

  const clients = useMemo(() => clientsResponse?.data || [], [clientsResponse]);
  const clientsWithSales = useMemo(
    () =>
      clients.map((client) => ({
        ...client,
        totalSpent: Number(client.totalSpent ?? 0),
        visitCount: Number(client.visitCount ?? 0),
        lastVisit: client.lastVisit,
      })),
    [clients],
  );
  const regularClients = useMemo(
    () => clientsWithSales.filter((client) => !isWalkInClient(client)),
    [clientsWithSales],
  );
  const walkInClients = useMemo(
    () => clientsWithSales.filter((client) => isWalkInClient(client)),
    [clientsWithSales],
  );

  const form = useForm<ClientFormData>({
    schema: clientFormSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      isMarried: false,
    },
  });

  const searchKeys = ["firstName", "lastName", "email", "phone"] as const;
  const regularTable = useTable<Client>({
    data: regularClients,
    searchKeys: [...searchKeys],
  });
  const walkInTable = useTable<Client>({
    data: walkInClients,
    searchKeys: [...searchKeys],
  });

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
          !isUser && (
            <Button
              className="gap-2"
              onClick={() =>
                setModalState({ clientId: "create", mode: "edit" })
              }
            >
              <Plus className="h-4 w-4" />
              {t("clients.addClient")}
            </Button>
          )
        }
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("nav.clients")}</h2>
          <span className="text-sm text-muted-foreground">
            {regularClients.length}
          </span>
        </div>
        <DataTable
          table={regularTable}
          columns={columns}
          selectable
          searchPlaceholder={t("clients.searchPlaceholder")}
          emptyMessage={t("clients.noClients")}
          loading={isLoading}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("agenda.walkIn")}</h2>
          <span className="text-sm text-muted-foreground">
            {walkInClients.length}
          </span>
        </div>
        <DataTable
          table={walkInTable}
          columns={columns}
          selectable
          searchPlaceholder={t("clients.searchPlaceholder")}
          emptyMessage={t("clients.noClients")}
          loading={isLoading}
        />
      </div>

      <ClientModals
        modalState={modalState}
        setModalState={setModalState}
        clients={clientsWithSales}
        form={form}
        onSuccess={refetch}
      />
    </div>
  );
}
