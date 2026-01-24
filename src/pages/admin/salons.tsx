import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
  Plus,
  Building2,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
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
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useLanguage } from "@/hooks/useLanguage";
import { useForm } from "@/hooks/useForm";
import { toast } from "@/lib/toast";
import type { Salon } from "@/types/entities";

// Modal state type
type SalonModalState = {
  salonId: string | "create";
  mode: "view" | "edit" | "delete";
} | null;

// Zod schema for salon form
const salonFormSchema = z.object({
  name: z.string().min(1, "validation.required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("validation.email").optional().or(z.literal("")),
});

type SalonFormData = z.infer<typeof salonFormSchema>;

export function AdminSalonsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  // Unified modal state
  const [modalState, setModalState] = useState<SalonModalState>(null);

  // Fetch salons from API (returns array directly)
  const { data: salons = [], isLoading, refetch } = useGet<Salon[]>("salons");

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
  const form = useForm<SalonFormData>({
    schema: salonFormSchema,
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
    } else if (selectedSalon && isEditMode) {
      form.reset({
        name: selectedSalon.name,
        address: selectedSalon.address || "",
        phone: selectedSalon.phone || "",
        email: selectedSalon.email || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState, selectedSalon, isCreateMode, isEditMode]);

  // Create salon mutation
  const createSalon = usePost<Salon, SalonFormData>("salons", {
    onSuccess: () => {
      toast.success(t("admin.salons.addSalon") + " - " + t("common.success"));
      setModalState(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Update salon mutation
  const updateSalon = usePost<Salon, SalonFormData>(`salons/${selectedSalon?.id}`, {
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

  // Delete salon mutation
  const deleteSalon = usePost<void, void>(`salons/${selectedSalon?.id}`, {
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
    setModalState({ salonId: salon.id, mode: "edit" });
  };

  const handleDelete = (salon: Salon) => {
    setModalState({ salonId: salon.id, mode: "delete" });
  };

  const handleSubmit = (data: SalonFormData) => {
    if (isEditMode) {
      updateSalon.mutate(data);
    } else {
      createSalon.mutate(data);
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
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("admin.salons.totalSalons")}
          </p>
          <p className="text-2xl font-bold">{totalSalons}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("admin.salons.activeSalons")}
          </p>
          <p className="text-2xl font-bold text-green-600">{activeSalons}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("admin.salons.totalUsers")}
          </p>
          <p className="text-2xl font-bold">{totalUsers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("admin.salons.monthlyRevenue")}
          </p>
          <p className="text-2xl font-bold text-accent-pink">
            {formatCurrency(0)}
          </p>
        </Card>
      </div>

      {/* Salons Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("common.loading")}
        </div>
      ) : salons.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("admin.salons.noSalons")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("admin.salons.addFirstSalon")}
          </p>
          <Button onClick={() => setModalState({ salonId: "create", mode: "edit" })}>
            <Plus className="h-4 w-4 me-2" />
            {t("admin.salons.addSalon")}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {salons.map((salon) => (
            <Card key={salon.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-accent-pink/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-accent-pink" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{salon.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={salon.isActive ? "success" : "warning"}>
                          {salon.isActive ? t("common.active") : t("common.inactive")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(salon)}>
                        <Eye className="h-4 w-4 me-2" />
                        {t("common.view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(salon)}>
                        <Edit className="h-4 w-4 me-2" />
                        {t("common.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(salon)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 me-2" />
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  {salon.address && (
                    <p className="text-muted-foreground">{salon.address}</p>
                  )}
                  {salon.email && (
                    <p className="text-muted-foreground">{salon.email}</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {salon.staff?.length || 0} {t("admin.salons.users")}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Salon Modal */}
      <Dialog
        open={isEditMode || isCreateMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? t("admin.salons.addSalon") : t("common.edit")}
            </DialogTitle>
            {isEditMode && selectedSalon && (
              <DialogDescription>{selectedSalon.name}</DialogDescription>
            )}
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fields.name")} *</Label>
                <Input id="name" {...form.register("name")} />
                {form.hasError("name") && (
                  <p className="text-sm text-destructive">{form.getError("name")}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t("fields.address")}</Label>
                <Input id="address" {...form.register("address")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("fields.phone")}</Label>
                  <Input id="phone" type="tel" {...form.register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("fields.email")}</Label>
                  <Input id="email" type="email" {...form.register("email")} />
                  {form.hasError("email") && (
                    <p className="text-sm text-destructive">{form.getError("email")}</p>
                  )}
                </div>
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
                disabled={form.isSubmitting || createSalon.isPending || updateSalon.isPending}
              >
                {form.isSubmitting || createSalon.isPending || updateSalon.isPending
                  ? t("common.loading")
                  : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Salon Modal */}
      <Dialog open={isViewMode} onOpenChange={(open) => !open && setModalState(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("admin.salons.salonDetails")}</DialogTitle>
          </DialogHeader>
          {selectedSalon && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-accent-pink/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-accent-pink" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedSalon.name}</h3>
                  <Badge variant={selectedSalon.isActive ? "success" : "warning"}>
                    {selectedSalon.isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4">
                {selectedSalon.address && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t("fields.address")}</p>
                      <p className="font-medium">{selectedSalon.address}</p>
                    </div>
                  </div>
                )}

                {selectedSalon.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t("fields.phone")}</p>
                      <p className="font-medium">{selectedSalon.phone}</p>
                    </div>
                  </div>
                )}

                {selectedSalon.email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t("fields.email")}</p>
                      <p className="font-medium">{selectedSalon.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("admin.salons.users")}</p>
                    <p className="font-medium">
                      {selectedSalon.staff?.length || 0} {t("admin.salons.users").toLowerCase()}
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
            {selectedSalon && (
              <Button
                onClick={() => setModalState({ salonId: selectedSalon.id, mode: "edit" })}
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
            <AlertDialogTitle>{t("admin.salons.deleteSalon")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.salons.deleteSalonConfirm", {
                name: selectedSalon?.name || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSalon.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSalon.isPending ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
