// src/pages/admin/salons/index.tsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useGet, withParams } from "@/hooks/useGet";
import { useUser } from "@/hooks/useUser";
import { useTable } from "@/hooks/useTable";
import { toast } from "@/lib/toast";
import type { PaginatedResponse } from "@/types";
import type { Salon, User, Service, Client, Sale } from "@/types/entities";
import { normalizeSalesResponse } from "@/utils/normalize-sales";
import {
  canModifySalon,
  getSalonsList,
  getCurrentSalon,
  extractDataArray,
  areAdminsLoaded,
  calculateAllStats,
  getDashboardDescription,
  type SalonModalState,
} from "./utils";
import { StatsGrid } from "./components/stats-grid";
import { useSalonsColumns } from "./list/columns";
import { DataTable } from "@/components/table";
import { SalonModals } from "./components/dialog/salon-modal";

export default function SalonsPage() {
  const { t } = useTranslation();
  /* cSpell:ignore Superadmin */
  const { user, isSuperadmin: userIsSuperadmin, salon: adminSalon } = useUser();
  const adminStatsStaleTime = 1000 * 60 * 5;

  // State
  const [modalState, setModalState] = useState<SalonModalState>(null);
  const currentSalon = useMemo(
    () => getCurrentSalon(userIsSuperadmin, adminSalon),
    [userIsSuperadmin, adminSalon],
  );
  const salonId = currentSalon?.id;

  // Fetch data - only superadmin needs to fetch all salons
  const {
    data: allSalons = [],
    isLoading,
    refetch,
  } = useGet<Salon[]>("salons", {
    enabled: userIsSuperadmin,
    staleTime: adminStatsStaleTime,
  });

  const {
    data: admins = [],
    isLoading: isAdminsLoading,
    isError: isAdminsError,
    refetch: refetchAdmins,
  } = useGet<User[]>("users/admins", {
    enabled: userIsSuperadmin,
    retry: 1,
    staleTime: adminStatsStaleTime,
  });

  // Users endpoint returns paginated data
  const { data: allUsersResponse, isLoading: isUsersLoading } = useGet<{ data: User[] }>(
    withParams("users", userIsSuperadmin ? {} : { salonId }),
    { enabled: userIsSuperadmin || !!salonId, staleTime: adminStatsStaleTime },
  );

  const { data: servicesResponse, isLoading: isServicesLoading } = useGet<PaginatedResponse<Service>>(
    withParams("services", { salonId, perPage: 1 }),
    { enabled: !!salonId, staleTime: adminStatsStaleTime },
  );

  const { data: clientsResponse, isLoading: isClientsLoading } = useGet<{ data: Client[] }>(
    withParams("clients", { salonId, perPage: 100 }),
    { enabled: !!salonId, staleTime: adminStatsStaleTime },
  );

  const { data: salesResponse, isLoading: isSalesLoading } = useGet<{ data: Sale[] }>(
    withParams("sales", { salonId, perPage: 100 }),
    { enabled: !!salonId, staleTime: adminStatsStaleTime, select: normalizeSalesResponse },
  );

  // Extract data arrays using utility function
  const allUsers = useMemo(
    () => extractDataArray(allUsersResponse),
    [allUsersResponse],
  );
  const servicesData = useMemo(
    () => extractDataArray(servicesResponse),
    [servicesResponse],
  );
  const clientsData = useMemo(
    () => extractDataArray(clientsResponse),
    [clientsResponse],
  );
  const salesData = useMemo(
    () => extractDataArray(salesResponse),
    [salesResponse],
  );

  // Salons - superadmin sees all, admin sees only their own
  const salons = useMemo(
    () => getSalonsList(userIsSuperadmin, allSalons, adminSalon),
    [userIsSuperadmin, allSalons, adminSalon],
  );

  // Table setup (only for superadmin)
  const table = useTable({
    data: salons,
    initialPerPage: 10,
    searchKeys: ["name", "address", "phone", "email"],
  });

  // Check if admins are loaded
  const adminsLoaded = useMemo(
    () => areAdminsLoaded(userIsSuperadmin, isAdminsLoading, isAdminsError),
    [userIsSuperadmin, isAdminsLoading, isAdminsError],
  );

  // Calculate all stats
  const stats = useMemo(
    () =>
      calculateAllStats(
        userIsSuperadmin,
        salons,
        allUsers,
        admins,
        currentSalon,
        servicesResponse,
        servicesData,
        clientsData,
        salesData,
      ),
    [
      userIsSuperadmin,
      salons,
      allUsers,
      admins,
      currentSalon,
      servicesResponse,
      servicesData,
      clientsData,
      salesData,
    ],
  );

  // Handlers
  const handleView = (salon: Salon) => {
    setModalState({ salonId: salon.id, mode: "view" });
  };

  const handleEdit = (salon: Salon) => {
    if (!canModifySalon(salon, user as User | null)) {
      toast.error(t("common.unauthorized"));
      return;
    }
    setModalState({ salonId: salon.id, mode: "edit" });
  };

  const handleDelete = (salon: Salon) => {
    if (!canModifySalon(salon, user as User | null)) {
      toast.error(t("common.unauthorized"));
      return;
    }
    setModalState({ salonId: salon.id, mode: "delete" });
  };

  // Columns (only for superadmin)
  const columns = useSalonsColumns({
    currentUser: user as User | null,
    isSuperadmin: userIsSuperadmin,
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.admin.salon")}
        description={getDashboardDescription(
          userIsSuperadmin,
          currentSalon,
          t("admin.salons.description"),
        )}
        actions={
          userIsSuperadmin && (
            <Button
              className="gap-2"
              onClick={() => setModalState({ salonId: "create", mode: "edit" })}
            >
              <Plus className="h-4 w-4" />
              {t("admin.salons.addSalon")}
            </Button>
          )
        }
      />

      <StatsGrid
        totalSalons={stats.totalSalons}
        activeSalons={stats.activeSalons}
        totalUsers={stats.totalUsers}
        activeUsers={stats.activeUsers}
        totalAdmins={stats.totalAdmins}
        isSuperadmin={userIsSuperadmin}
        loading={isLoading || isUsersLoading || isServicesLoading || isClientsLoading || isSalesLoading || isAdminsLoading}
        totalRevenue={stats.totalRevenue}
        monthlyRevenue={stats.monthlyRevenue}
        totalServices={stats.totalServices}
        totalClients={stats.totalClients}
      />

      {/* Only show table for superadmin */}
      {userIsSuperadmin && (
        <DataTable
          table={table}
          columns={columns}
          onRowClick={handleView}
          searchPlaceholder={t("admin.salons.searchSalons")}
          emptyMessage={t("admin.salons.noSalons")}
          loading={isLoading}
        />
      )}

      {userIsSuperadmin && (
        <SalonModals
          modalState={modalState}
          setModalState={setModalState}
          salons={salons}
          user={user as User | null}
          admins={admins}
          adminsLoaded={adminsLoaded}
          onRefreshAdmins={refetchAdmins}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
