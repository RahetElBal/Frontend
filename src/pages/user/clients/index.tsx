import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { useTable } from "@/hooks/useTable";
import { useLanguage } from "@/hooks/useLanguage";
import { useForm } from "@/hooks/useForm";
import type { Appointment, Client, Sale } from "@/types/entities";
import { ClientModals } from "./components/dialog/client-modals";
import type { ClientModalState } from "./types";
import { clientFormSchema, type ClientFormData } from "./validation";
import { getClientColumns } from "./components/list/columns";
import { useUser } from "@/hooks/useUser";
import type { PaginatedResponse } from "@/types";
import { useGet, withParams } from "@/hooks/useGet";
import { normalizeSalesResponse } from "@/utils/normalize-sales";

const isWalkInClient = (client: Client) =>
  (client.email || "").toLowerCase().startsWith("walkin+");

export function ClientsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  const { isUser, user } = useUser();
  const [modalState, setModalState] = useState<ClientModalState>(null);

  const salonId = user?.salon?.id;
  const clientsStaleTime = 1000 * 60 * 10;
  const salesStaleTime = 1000 * 60;
  const salesCacheTime = 1000 * 60 * 10;
  const appointmentsStaleTime = 1000 * 60;

  const {
    data: clientsResponse,
    isLoading,
    refetch,
  } = useGet<PaginatedResponse<Client>>(
    withParams("clients", { salonId, perPage: 100 }),
    { enabled: !!salonId, staleTime: clientsStaleTime, refetchOnWindowFocus: "always" },
  );

  const { data: salesResponse } = useGet<PaginatedResponse<Sale>>(
    withParams("sales", { salonId, perPage: 100, sortBy: "createdAt", sortOrder: "desc" }),
    {
      enabled: !!salonId,
      staleTime: salesStaleTime,
      gcTime: salesCacheTime,
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
      select: normalizeSalesResponse,
    },
  );

  const { data: appointmentsResponse } = useGet<
    PaginatedResponse<Appointment>
  >(
    withParams("appointments", { salonId, perPage: 100, sortBy: "date", sortOrder: "desc" }),
    { enabled: !!salonId, staleTime: appointmentsStaleTime, refetchOnWindowFocus: "always" },
  );

  const clients = useMemo(() => clientsResponse?.data || [], [clientsResponse]);
  const sales = useMemo(() => salesResponse?.data || [], [salesResponse]);
  const appointments = useMemo(
    () => appointmentsResponse?.data || [],
    [appointmentsResponse],
  );
  const totalSpentByClient = useMemo(() => {
    const totals = new Map<string, number>();
    sales.forEach((sale) => {
      if (!sale.clientId) return;
      const current = totals.get(sale.clientId) ?? 0;
      const total = Number(sale.total ?? 0);
      totals.set(sale.clientId, current + (Number.isFinite(total) ? total : 0));
    });
    return totals;
  }, [sales]);
  const lastSaleByClient = useMemo(() => {
    const latest = new Map<string, string>();
    sales.forEach((sale) => {
      if (!sale.clientId || !sale.createdAt) return;
      const current = latest.get(sale.clientId);
      if (!current || new Date(sale.createdAt) > new Date(current)) {
        latest.set(sale.clientId, sale.createdAt);
      }
    });
    return latest;
  }, [sales]);
  const visitCountByClient = useMemo(() => {
    const counts = new Map<string, number>();
    appointments.forEach((appointment) => {
      if (!appointment.clientId) return;
      if (appointment.status === "cancelled") return;
      counts.set(
        appointment.clientId,
        (counts.get(appointment.clientId) ?? 0) + 1,
      );
    });
    return counts;
  }, [appointments]);
  const clientsWithSales = useMemo(
    () =>
      clients.map((client) => ({
        ...client,
        totalSpent: totalSpentByClient.get(client.id) ?? 0,
        visitCount: visitCountByClient.get(client.id) ?? 0,
        lastVisit: lastSaleByClient.get(client.id),
      })),
    [clients, totalSpentByClient, visitCountByClient, lastSaleByClient],
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
