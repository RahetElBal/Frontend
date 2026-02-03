// src/pages/admin/salons/index.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useGet } from "@/hooks/useGet";
import { useUser } from "@/hooks/useUser";
import { useTable } from "@/hooks/useTable";
import { toast } from "@/lib/toast";
import type {
  Salon,
  User,
  Service,
  Client,
  Sale,
} from "@/types/entities";
import { canModifySalon, type SalonModalState } from "./utils";
import { StatsGrid } from "./components/stats-grid";
import { useSalonsColumns } from "./list/columns";
import { DataTable } from "@/components/table";
import { SalonModals } from "./components/dialog/salon-modal";

export default function SalonsPage() {
  const { t } = useTranslation();
  const { user, isSuperadmin: userIsSuperadmin, salon: adminSalon } = useUser();
  const adminStatsStaleTime = 1000 * 60 * 5;

  // State
  const [modalState, setModalState] = useState<SalonModalState>(null);
  const currentSalon = userIsSuperadmin ? null : adminSalon;
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

  const { data: admins = [] } = useGet<User[]>("users/admins", {
    enabled: userIsSuperadmin,
    retry: 1,
    staleTime: adminStatsStaleTime,
  });

  // Users endpoint returns paginated data
  const { data: allUsersResponse } = useGet<{ data: User[] }>("users", {
    params: userIsSuperadmin ? undefined : { salonId },
    enabled: userIsSuperadmin || !!salonId,
    staleTime: adminStatsStaleTime,
  });
  const allUsers = allUsersResponse?.data || [];

  const { data: servicesResponse } = useGet<{ data: Service[] }>("services", {
    params: { salonId },
    enabled: !!salonId,
    staleTime: adminStatsStaleTime,
  });
  const servicesData = servicesResponse?.data || [];

  const { data: clientsResponse } = useGet<{ data: Client[] }>("clients", {
    params: { salonId, perPage: 100 },
    enabled: !!salonId,
    staleTime: adminStatsStaleTime,
  });
  const clientsData = clientsResponse?.data || [];

  const { data: salesResponse } = useGet<{ data: Sale[] }>("sales", {
    params: { salonId, perPage: 100 },
    enabled: !!salonId,
    staleTime: adminStatsStaleTime,
  });
  const salesData = salesResponse?.data || [];

  // Salons - superadmin sees all, admin sees only their own from useUser
  const salons = userIsSuperadmin ? allSalons : adminSalon ? [adminSalon] : [];

  // Table setup (only for superadmin)
  const table = useTable({
    data: salons,
    initialPerPage: 10,
    searchKeys: ["name", "address", "phone", "email"],
  });

  // Get current admin's salon - use from useUser hook
  // currentSalon defined above

  // Stats - calculated based on role
  const totalSalons = salons.length;
  const activeSalons = salons.filter((s) => s.isActive).length;

  // Count users properly
  const totalUsers = userIsSuperadmin
    ? allUsers.length // Superadmin: all users in system
    : allUsers.filter((u) => u.salon?.id === currentSalon?.id).length; // Admin: users in their salon

  const activeUsers = userIsSuperadmin
    ? allUsers.filter((u) => u.isActive).length
    : allUsers.filter(
        (u) => u.salon?.id === currentSalon?.id && u.isActive,
      ).length;

  const totalAdmins = userIsSuperadmin ? admins.length : 0;

  // Stats calculations - ALL data for superadmin, filtered for admin
  const totalServices = servicesData.length;
  const totalClients = clientsData.length;

  const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0);
  const now = new Date();
  const monthlyRevenue = salesData
    .filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return (
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, sale) => sum + sale.total, 0);

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
        description={
          userIsSuperadmin
            ? t("admin.salons.description")
            : currentSalon
              ? `Tableau de bord - ${currentSalon.name}`
              : "Gérez votre salon"
        }
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
        totalSalons={totalSalons}
        activeSalons={activeSalons}
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        totalAdmins={totalAdmins}
        isSuperadmin={userIsSuperadmin}
        totalRevenue={totalRevenue}
        monthlyRevenue={monthlyRevenue}
        totalServices={totalServices}
        totalClients={totalClients}
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
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
