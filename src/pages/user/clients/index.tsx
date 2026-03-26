import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ServerDataTable } from "@/components/table";
import { useLanguage } from "@/hooks/useLanguage";
import { useForm } from "@/hooks/useForm";
import type { Client } from "./types";
import { ClientModals } from "./components/dialog/client-modals";
import type { ClientModalState } from "./types";
import { clientFormSchema, type ClientFormData } from "./components/validation";
import { getClientColumns } from "./components/list/columns";
import { useUser } from "@/hooks/useUser";
import type { PaginatedResponse } from "@/types/api";
import { useGet, withParams } from "@/hooks/useGet";
import { useServerTableState } from "@/hooks/useServerTableState";

const CLIENTS_PAGE_SIZE = 20;

export function ClientsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  const { isUser, user } = useUser();
  const [modalState, setModalState] = useState<ClientModalState>(null);

  const salonId = user?.salon?.id;
  const clientsStaleTime = 1000 * 60 * 10;
  const regularState = useServerTableState();
  const walkInState = useServerTableState();

  const {
    data: regularClientsResponse,
    isLoading: isRegularClientsLoading,
    isFetching: isRegularClientsFetching,
    refetch: refetchRegularClients,
  } = useGet<PaginatedResponse<Client>>(
    withParams("clients", {
      salonId,
      search: regularState.search || undefined,
      skip: (regularState.page - 1) * CLIENTS_PAGE_SIZE,
      limit: CLIENTS_PAGE_SIZE,
      includeMetrics: true,
      walkIn: false,
    }),
    { enabled: !!salonId, staleTime: clientsStaleTime },
  );

  const {
    data: walkInClientsResponse,
    isLoading: isWalkInClientsLoading,
    isFetching: isWalkInClientsFetching,
    refetch: refetchWalkInClients,
  } = useGet<PaginatedResponse<Client>>(
    withParams("clients", {
      salonId,
      search: walkInState.search || undefined,
      skip: (walkInState.page - 1) * CLIENTS_PAGE_SIZE,
      limit: CLIENTS_PAGE_SIZE,
      includeMetrics: true,
      walkIn: true,
    }),
    { enabled: !!salonId, staleTime: clientsStaleTime },
  );

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
    () => normalizeClients(regularClientsResponse?.data ?? []),
    [normalizeClients, regularClientsResponse],
  );
  const walkInClients = useMemo(
    () => normalizeClients(walkInClientsResponse?.data ?? []),
    [normalizeClients, walkInClientsResponse],
  );
  const regularMeta = regularClientsResponse?.meta;
  const walkInMeta = walkInClientsResponse?.meta;
  const totalClientsCount = (regularMeta?.total ?? 0) + (walkInMeta?.total ?? 0);
  const clientsWithMetrics = useMemo(
    () => [...regularClients, ...walkInClients],
    [regularClients, walkInClients],
  );
  const showRegularClientsLoading =
    (isRegularClientsLoading || isRegularClientsFetching) &&
    regularClients.length === 0;
  const showWalkInClientsLoading =
    (isWalkInClientsLoading || isWalkInClientsFetching) &&
    walkInClients.length === 0;

  useEffect(() => {
    if (!regularMeta) return;

    const lastPage =
      regularMeta.total > 0 ? Math.max(1, regularMeta.lastPage) : 1;
    if (regularState.page > lastPage) {
      regularState.setPage(lastPage);
    }
  }, [regularMeta, regularState.page, regularState.setPage]);

  useEffect(() => {
    if (!walkInMeta) return;

    const lastPage =
      walkInMeta.total > 0 ? Math.max(1, walkInMeta.lastPage) : 1;
    if (walkInState.page > lastPage) {
      walkInState.setPage(lastPage);
    }
  }, [walkInMeta, walkInState.page, walkInState.setPage]);

  const form = useForm<ClientFormData>({
    schema: clientFormSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthDate: "",
      isMarried: false,
    },
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
            {regularMeta?.total ?? 0}
          </span>
        </div>
        <ServerDataTable
          items={regularClients}
          columns={columns}
          search={regularState.searchInput}
          onSearchChange={regularState.setSearchInput}
          page={regularState.page}
          perPage={regularMeta?.perPage ?? CLIENTS_PAGE_SIZE}
          totalItems={regularMeta?.total ?? 0}
          totalPages={Math.max(regularMeta?.lastPage ?? 0, 1)}
          onPageChange={regularState.setPage}
          searchPlaceholder={t("clients.searchPlaceholder")}
          emptyMessage={t("clients.noClients")}
          loading={showRegularClientsLoading}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("agenda.walkIn")}</h2>
          <span className="text-sm text-muted-foreground">
            {walkInMeta?.total ?? 0}
          </span>
        </div>
        <ServerDataTable
          items={walkInClients}
          columns={columns}
          search={walkInState.searchInput}
          onSearchChange={walkInState.setSearchInput}
          page={walkInState.page}
          perPage={walkInMeta?.perPage ?? CLIENTS_PAGE_SIZE}
          totalItems={walkInMeta?.total ?? 0}
          totalPages={Math.max(walkInMeta?.lastPage ?? 0, 1)}
          onPageChange={walkInState.setPage}
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
          void refetchRegularClients();
          void refetchWalkInClients();
        }}
      />
    </div>
  );
}
