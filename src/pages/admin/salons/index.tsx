import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useGet } from "@/hooks/useGet";
import { useForm } from "@/hooks/useForm";
import { useUser } from "@/hooks/useUser";
import { useTable } from "@/hooks/useTable";
import { toast } from "@/lib/toast";
import type { Salon, User } from "@/types/entities";
import {
  requiredString,
  optionalString,
  optionalEmailField,
} from "@/common/validator/zodI18n";
import { canModifySalon, type SalonModalState } from "./utils";
import { StatsGrid } from "./components/stats-grid";
import { useSalonsColumns } from "./list/columns";
import { DataTable } from "@/components/table";
import { SalonModals } from "./components/dialog/salon-modal";

// Zod schema for salon form
const baseSalonFormSchema = z.object({
  name: requiredString("Nom"),
  address: optionalString(),
  phone: optionalString(),
  email: optionalEmailField(),
});

type BaseSalonFormData = z.infer<typeof baseSalonFormSchema>;

export default function SalonsPage() {
  const { t } = useTranslation();
  const { user, isSuperadmin: userIsSuperadmin } = useUser();

  // State
  const [modalState, setModalState] = useState<SalonModalState>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");

  // Fetch data
  const { data: salons = [], isLoading, refetch } = useGet<Salon[]>("salons");
  const { data: admins = [] } = useGet<User[]>("users/admins", {
    enabled: userIsSuperadmin,
    retry: 1,
  });

  // Table setup
  const table = useTable({
    data: salons,
    initialPerPage: 10,
    searchKeys: ["name", "address", "phone", "email"],
  });

  // Form setup
  const form = useForm<BaseSalonFormData>({
    schema: baseSalonFormSchema,
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  // Stats
  const totalSalons = salons.length;
  const activeSalons = salons.filter((s) => s.isActive).length;
  const totalUsers = salons.reduce((sum, s) => sum + (s.staff?.length || 0), 0);

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

  // Columns
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
        title={t("nav.admin.salons")}
        description={t("admin.salons.description")}
        actions={
          <Button
            className="gap-2"
            onClick={() => setModalState({ salonId: "create", mode: "edit" })}
          >
            <Plus className="h-4 w-4" />
            {t("admin.salons.addSalon")}
          </Button>
        }
      />

      <StatsGrid
        totalSalons={totalSalons}
        activeSalons={activeSalons}
        totalUsers={totalUsers}
        isSuperadmin={userIsSuperadmin}
      />

      <DataTable
        table={table}
        columns={columns}
        onRowClick={handleView}
        searchPlaceholder={t("admin.salons.searchSalons")}
        emptyMessage={t("admin.salons.noSalons")}
        loading={isLoading}
      />

      <SalonModals
        modalState={modalState}
        setModalState={setModalState}
        salons={salons}
        user={user as User | null}
        admins={admins}
        form={form}
        selectedOwnerId={selectedOwnerId}
        setSelectedOwnerId={setSelectedOwnerId}
        onSuccess={refetch}
      />
    </div>
  );
}
