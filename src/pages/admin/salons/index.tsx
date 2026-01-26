import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useForm } from "@/hooks/useForm";
import { useUser } from "@/hooks/useUser";
import { toast } from "@/lib/toast";
import type { Salon, User } from "@/types/entities";
import {
  requiredString,
  optionalString,
  optionalEmailField,
} from "@/common/validator/zodI18n";
import { canModifySalon, type SalonModalState } from "./utils";
import { EmptyState } from "./components/empty-state";
import { SalonCard } from "./components/salon-card";
import { SalonFormModal } from "./components/dialog/cu-salon";
import { SalonViewModal } from "./components/dialog/view-salon";
import { DeleteSalonDialog } from "./components/dialog/delete-salon";
import { StatsGrid } from "./components/stats-grid";

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
  const {
    user,
    isSuperadmin: userIsSuperadmin,
    isAdmin: userIsAdmin,
  } = useUser();

  const currentUserId = user?.id;

  // Unified modal state
  const [modalState, setModalState] = useState<SalonModalState>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");

  // Fetch salons
  const { data: salons = [], isLoading, refetch } = useGet<Salon[]>("salons");

  // Fetch admins list for superadmin
  const { data: admins = [] } = useGet<User[]>("users/admins", {
    enabled: userIsSuperadmin,
    retry: 1,
  });

  // Helper functions
  const getSelectedSalon = (): Salon | null => {
    if (!modalState || modalState.salonId === "create") return null;
    return salons.find((s) => s.id === modalState.salonId) || null;
  };

  const selectedSalon = getSelectedSalon();
  const isCreateMode = modalState?.salonId === "create";
  const isEditMode = modalState?.mode === "edit" && !isCreateMode;
  const isViewMode = modalState?.mode === "view";
  const isDeleteMode = modalState?.mode === "delete";

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

  // Reset form when modal state changes
  useEffect(() => {
    if (isCreateMode) {
      form.reset({
        name: "",
        address: "",
        phone: "",
        email: "",
      });
      setSelectedOwnerId("");
    } else if (selectedSalon && isEditMode) {
      form.reset({
        name: selectedSalon.name,
        address: selectedSalon.address || "",
        phone: selectedSalon.phone || "",
        email: selectedSalon.email || "",
      });
      setSelectedOwnerId(selectedSalon.ownerId || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState, selectedSalon, isCreateMode, isEditMode]);

  // Mutations
  const createSalon = usePost<Salon, BaseSalonFormData & { ownerId?: string }>(
    "salons",
    {
      onSuccess: () => {
        toast.success(t("admin.salons.addSalon") + " - " + t("common.success"));
        setModalState(null);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("common.error"));
      },
    },
  );

  const updateSalon = usePost<Salon, BaseSalonFormData & { ownerId?: string }>(
    `salons/${selectedSalon?.id}`,
    {
      method: "PATCH",
      onSuccess: () => {
        toast.success(t("common.edit") + " - " + t("common.success"));
        setModalState(null);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("common.error"));
      },
    },
  );

  const deleteSalon = usePost<void, string>("salons", {
    id: (salonId) => salonId,
    method: "DELETE",
    onSuccess: () => {
      toast.success(t("common.delete") + " - " + t("common.success"));
      setModalState(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
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

  const handleSubmit = (data: BaseSalonFormData) => {
    if (userIsSuperadmin && isCreateMode && !selectedOwnerId) {
      toast.error(t("admin.salons.selectOwnerRequired"));
      return;
    }

    const payload = {
      ...data,
      ...(userIsSuperadmin && { ownerId: selectedOwnerId }),
    };

    if (isEditMode) {
      updateSalon.mutate(payload);
    } else {
      createSalon.mutate(payload);
    }
  };

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

      {/* Stats */}
      <StatsGrid
        totalSalons={totalSalons}
        activeSalons={activeSalons}
        totalUsers={totalUsers}
      />

      {/* Salons Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("common.loading")}
        </div>
      ) : salons.length === 0 ? (
        <EmptyState
          isSuperadmin={userIsSuperadmin}
          hasAdmins={admins.length > 0}
          onCreateSalon={() =>
            setModalState({ salonId: "create", mode: "edit" })
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {salons.map((salon) => (
            <SalonCard
              key={salon.id}
              salon={salon}
              canModify={canModifySalon(salon, user as User | null)}
              isOwnSalon={salon.ownerId === currentUserId}
              isSuperadmin={userIsSuperadmin}
              onView={() => handleView(salon)}
              onEdit={() => handleEdit(salon)}
              onDelete={() => handleDelete(salon)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <SalonFormModal
        isOpen={isEditMode || isCreateMode}
        isCreateMode={isCreateMode}
        selectedSalon={selectedSalon}
        isSuperadmin={userIsSuperadmin}
        isAdmin={userIsAdmin}
        admins={admins}
        selectedOwnerId={selectedOwnerId}
        form={form}
        isSubmitting={
          form.isSubmitting || createSalon.isPending || updateSalon.isPending
        }
        onClose={() => setModalState(null)}
        onSubmit={handleSubmit}
        onOwnerChange={setSelectedOwnerId}
        onCreateAdmin={() => {
          setModalState(null);
          window.location.href = "/admin/users";
        }}
      />

      <SalonViewModal
        isOpen={isViewMode}
        salon={selectedSalon}
        canModify={
          selectedSalon
            ? canModifySalon(selectedSalon, user as User | null)
            : false
        }
        isOwnSalon={selectedSalon?.ownerId === currentUserId}
        isSuperadmin={userIsSuperadmin}
        onClose={() => setModalState(null)}
        onEdit={() =>
          selectedSalon &&
          setModalState({ salonId: selectedSalon.id, mode: "edit" })
        }
      />

      <DeleteSalonDialog
        isOpen={isDeleteMode}
        salon={selectedSalon}
        isDeleting={deleteSalon.isPending}
        onClose={() => setModalState(null)}
        onConfirm={() => selectedSalon && deleteSalon.mutate(selectedSalon.id)}
      />
    </div>
  );
}
