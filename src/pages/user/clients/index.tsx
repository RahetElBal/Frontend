import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ServerDataTable } from "@/components/table";
import { useLanguage } from "@/hooks/useLanguage";
import { useSalonDateTime } from "@/hooks/useSalonDateTime";
import { useForm } from "@/hooks/useForm";
import { isWalkInClient } from "@/common/client";
import type { Client } from "./types";
import { ClientModals } from "./components/dialog/client-modals";
import type { ClientModalState } from "./types";
import { clientFormSchema, type ClientFormData } from "./components/validation";
import { getClientColumns } from "./components/list/columns";
import { useUser } from "@/hooks/useUser";
import { useTable } from "@/hooks/useTable";

const CLIENTS_PAGE_SIZE = 20;

export function ClientsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { formatDate } = useSalonDateTime();

  const { isUser, user } = useUser();
  const [modalState, setModalState] = useState<ClientModalState>(null);

  const salonId = user?.salon?.id;
  const regularTable = useTable<Client>({
    path: "clients",
    query: {
      salonId,
      includeMetrics: true,
      walkIn: false,
    },
    enabled: !!salonId,
    initialPerPage: CLIENTS_PAGE_SIZE,
    options: { staleTime: 1000 * 60 * 10 },
  });

  const walkInTable = useTable<Client>({
    path: "clients",
    query: {
      salonId,
      includeMetrics: true,
      walkIn: true,
    },
    enabled: !!salonId,
    initialPerPage: CLIENTS_PAGE_SIZE,
    options: { staleTime: 1000 * 60 * 10 },
  });

  const normalizeClients = useMemo(
    () => (clients: Client[]) =>
      clients.map((client) => {
        const withLegacyVisit = client as Client & { totalVisits?: number };
        const rawVisitCount =
          withLegacyVisit.visitCount ?? withLegacyVisit.totalVisits ?? 0;
        const visitCount = Number(rawVisitCount);
        const totalSpent = Number(client.totalSpent ?? 0);

        return {
          ...client,
          visitCount: Number.isFinite(visitCount) ? visitCount : 0,
          totalSpent: Number.isFinite(totalSpent) ? totalSpent : 0,
        };
      }),
    [],
  );

  const regularClients = useMemo(
    () => normalizeClients(regularTable.items),
    [normalizeClients, regularTable.items],
  );
  const walkInClients = useMemo(
    () => normalizeClients(walkInTable.items),
    [normalizeClients, walkInTable.items],
  );
  const totalClientsCount = regularTable.totalItems + walkInTable.totalItems;
  const clientsWithMetrics = useMemo(
    () => [...regularClients, ...walkInClients],
    [regularClients, walkInClients],
  );
  const showRegularClientsLoading =
    (regularTable.isLoading || regularTable.isFetching) &&
    regularClients.length === 0;
  const showWalkInClientsLoading =
    (walkInTable.isLoading || walkInTable.isFetching) &&
    walkInClients.length === 0;

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

  const handleView = (client: Client) => {
    setModalState({ clientId: client.id, mode: "view" });
  };

  const handleEdit = (client: Client) => {
    if (isWalkInClient(client)) {
      setModalState({ clientId: client.id, mode: "view" });
      return;
    }

    setModalState({ clientId: client.id, mode: "edit" });
  };

  const handleDelete = (client: Client) => {
    if (isWalkInClient(client)) {
      setModalState({ clientId: client.id, mode: "view" });
      return;
    }

    setModalState({ clientId: client.id, mode: "delete" });
  };

  const columns = getClientColumns({
    t,
    formatCurrency,
    formatDate,
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.clients")}
        description={t("clients.description", { count: totalClientsCount })}
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
            {regularTable.totalItems}
          </span>
        </div>
        <ServerDataTable
          items={regularClients}
          columns={columns}
          search={regularTable.searchInput}
          onSearchChange={regularTable.setSearchInput}
          page={regularTable.page}
          perPage={regularTable.perPage}
          totalItems={regularTable.totalItems}
          totalPages={regularTable.totalPages}
          onPageChange={regularTable.setPage}
          searchPlaceholder={t("clients.searchPlaceholder")}
          emptyMessage={t("clients.noClients")}
          loading={showRegularClientsLoading}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("agenda.walkIn")}</h2>
          <span className="text-sm text-muted-foreground">
            {walkInTable.totalItems}
          </span>
        </div>
        <ServerDataTable
          items={walkInClients}
          columns={columns}
          search={walkInTable.searchInput}
          onSearchChange={walkInTable.setSearchInput}
          page={walkInTable.page}
          perPage={walkInTable.perPage}
          totalItems={walkInTable.totalItems}
          totalPages={walkInTable.totalPages}
          onPageChange={walkInTable.setPage}
          searchPlaceholder={t("clients.searchPlaceholder")}
          emptyMessage={t("clients.noClients")}
          loading={showWalkInClientsLoading}
        />
      </div>

      <ClientModals
        modalState={modalState}
        setModalState={setModalState}
        clients={clientsWithMetrics}
        form={form}
        onSuccess={() => {
          void regularTable.refetch();
          void walkInTable.refetch();
        }}
      />
    </div>
  );
}
