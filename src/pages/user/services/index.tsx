import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Plus, Clock, Edit, DollarSign } from "lucide-react";
import { requiredString, optionalString } from "@/common/validator/zodI18n";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { LoadingPanel } from "@/components/loading-panel";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { useForm } from "@/hooks/useForm";
import { useUser } from "@/hooks/useUser";
import { toast } from "@/lib/toast";
import type { Service } from "@/types/entities";
import type { PaginatedResponse } from "@/types";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { usePostAction } from "@/hooks/usePostAction";
import { ServiceCard } from "./components/service-card";
import { getServiceCategoryName } from "./utils";
import {
  translateServiceCategory,
  translateServiceName,
} from "@/common/service-translations";

// Category type from API
interface ServiceCategory {
  category: string;
  count: number;
}

// Modal state type
type ServiceModalState = {
  serviceId: string | "create";
  mode: "view" | "edit" | "delete";
} | null;

// Zod schema for service form
const serviceFormSchema = z.object({
  name: requiredString("Nom"),
  description: optionalString(),
  duration: z.coerce.number().min(5, "validation.number.min"),
  price: z.coerce.number().min(0, "validation.number.positive"),
  category: requiredString("Category"),
  isActive: z.boolean().optional(),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

export function ServicesPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { user, isSuperadmin } = useUser();
  const servicesStaleTime = 1000 * 60 * 10;
  const categoriesStaleTime = 1000 * 60 * 30;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Unified modal state
  const [modalState, setModalState] = useState<ServiceModalState>(null);

  const salonId = user?.salon?.id;
  const canManageServices = isSuperadmin;

  // Fetch services and categories from API (scoped to current salon)
  const {
    data: servicesResponse,
    isLoading,
    refetch,
    } = useGet<PaginatedResponse<Service>>("services", {
      params: { salonId, perPage: 100 },
      enabled: !!salonId,
      staleTime: servicesStaleTime,
    });
  const services = servicesResponse?.data ?? [];
  
  const { data: categoriesData = [] } = useGet<ServiceCategory[] | string[]>(
    "services/categories",
    {
      params: { salonId },
      enabled: !!salonId,
      staleTime: categoriesStaleTime,
    },
  );
  
  // Transform categories data for display
  const categories = categoriesData.map((cat) => {
    const name = typeof cat === "string" ? cat : cat.category;
    return {
      id: name,
      name,
      label: translateServiceCategory(t, name),
      color: "#ec4899", // Default color, could be dynamic
    };
  });

  // Helper functions
  const getSelectedService = (): Service | null => {
    if (!modalState || modalState.serviceId === "create") return null;
    return services.find((s) => s.id === modalState.serviceId) || null;
  };

  const selectedService = getSelectedService();
  const isCreateMode = modalState?.serviceId === "create";
  const isEditMode = modalState?.mode === "edit" && !isCreateMode;
  const isViewMode = modalState?.mode === "view";
  const isDeleteMode = modalState?.mode === "delete";

  // Form setup
  const form = useForm<ServiceFormData>({
    schema: serviceFormSchema,
    defaultValues: {
      name: "",
      description: "",
      duration: 30,
      price: 0,
      category: "",
      isActive: true,
    },
  });

  // Reset form when modal state changes
  useEffect(() => {
    if (isCreateMode) {
      form.reset({
        name: "",
        description: "",
        duration: 30,
        price: 0,
        category: "",
        isActive: true,
      });
    } else if (selectedService && isEditMode) {
      // Category can be a Category object or string depending on API response
      const categoryValue = typeof selectedService.category === 'string' 
        ? selectedService.category 
        : selectedService.category?.name || "";
      form.reset({
        name: selectedService.name,
        description: selectedService.description || "",
        duration: selectedService.duration,
        price: selectedService.price,
        category: categoryValue,
        isActive: selectedService.isActive,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState, selectedService, isCreateMode, isEditMode]);

  // Create service mutation
  const { mutate: createService, isPending: isCreating } = usePost<
    Service,
    ServiceFormData & { salonId: string }
  >("services", {
    invalidateQueries: ["services"],
    onSuccess: () => {
      toast.success(t("services.addService") + " - " + t("common.success"));
      setModalState(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Update service mutation
  const { mutate: updateService, isPending: isUpdating } = usePost<
    Service,
    ServiceFormData
  >("services", {
    id: selectedService?.id,
    method: "PATCH",
    invalidateQueries: ["services"],
    onSuccess: () => {
      toast.success(t("common.edit") + " - " + t("common.success"));
      setModalState(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Delete service mutation
  const { mutate: deleteService, isPending: isDeleting } = usePost<void, void>(
    "services",
    {
      id: selectedService?.id,
      method: "DELETE",
      invalidateQueries: ["services"],
      onSuccess: () => {
        toast.success(t("common.delete") + " - " + t("common.success"));
        setModalState(null);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("common.error"));
      },
    },
  );

  // Toggle service status - POST /services/{id}/toggle
  const { mutate: toggleStatus } = usePostAction<Service, string>("services", {
    id: (serviceId) => serviceId,
    action: "toggle",
    invalidateQueries: ["services"],
    showSuccessToast: true,
    successMessage: t("common.success"),
  });

  const filteredServices = selectedCategory
    ? services.filter((s) => getServiceCategoryName(s) === selectedCategory)
    : services;

  const servicesByCategory = categories.map((cat) => ({
    ...cat,
    services: services.filter((s) => getServiceCategoryName(s) === cat.id),
  }));

  // Handlers
  const handleView = (service: Service) => {
    setModalState({ serviceId: service.id, mode: "view" });
  };

  const handleEdit = (service: Service) => {
    if (!canManageServices) return;
    setModalState({ serviceId: service.id, mode: "edit" });
  };

  const handleDelete = (service: Service) => {
    if (!canManageServices) return;
    setModalState({ serviceId: service.id, mode: "delete" });
  };

  const handleToggle = (service: Service) => {
    if (!canManageServices) return;
    toggleStatus(service.id);
  };

  const handleSubmit = (data: ServiceFormData) => {
    if (!salonId) {
      toast.error(t("common.error"));
      return;
    }
    
    if (isEditMode) {
      updateService(data);
    } else {
      // Include salonId when creating
      createService({
        ...data,
        salonId,
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.services")}
        description={t("services.description", { count: services.length })}
        actions={
          canManageServices ? (
            <Button
              className="gap-2"
              onClick={() =>
                setModalState({ serviceId: "create", mode: "edit" })
              }
            >
              <Plus className="h-4 w-4" />
              {t("services.addService")}
            </Button>
          ) : null
        }
      />

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          {t("common.all")} ({services.length})
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="gap-2"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            {cat.label} (
            {services.filter((s) => getServiceCategoryName(s) === cat.id).length}
            )
          </Button>
        ))}
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <LoadingPanel label={t("common.loading")} />
      ) : selectedCategory === null ? (
        <div className="space-y-8">
          {servicesByCategory.map((category) => (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <h2 className="text-lg font-semibold">
                  {translateServiceCategory(t, category.name)}
                </h2>
                <span className="text-sm text-muted-foreground">
                  ({category.services.length} {t("services.services")})
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    canManage={canManageServices}
                  />
                ))}
              </div>
            </div>
          ))}
          {services.filter((s) => !getServiceCategoryName(s)).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {t("common.other")}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services
                  .filter((s) => !getServiceCategoryName(s))
                  .map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                      canManage={canManageServices}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Service Modal */}
      <Dialog
        open={isEditMode || isCreateMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? t("services.addService") : t("common.edit")}
            </DialogTitle>
            {isEditMode && selectedService && (
              <DialogDescription>
                {translateServiceName(t, selectedService)}
              </DialogDescription>
            )}
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fields.name")} *</Label>
                <Input id="name" {...form.register("name")} />
                {form.hasError("name") && (
                  <p className="text-sm text-destructive">
                    {form.getError("name")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("fields.description")}</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t("fields.category")} *</Label>
                <Input
                  id="category"
                  list="service-category-options"
                  value={form.watch("category")}
                  onChange={(event) =>
                    form.setValue("category", event.target.value)
                  }
                  placeholder={t("services.selectCategory")}
                />
                <datalist id="service-category-options">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.label}
                    </option>
                  ))}
                </datalist>
                {form.hasError("category") && (
                  <p className="text-sm text-destructive">
                    {form.getError("category")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    {t("fields.duration")} (min) *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    step="5"
                    {...form.register("duration")}
                  />
                  {form.hasError("duration") && (
                    <p className="text-sm text-destructive">
                      {form.getError("duration")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">{t("fields.price")} *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    {...form.register("price")}
                  />
                  {form.hasError("price") && (
                    <p className="text-sm text-destructive">
                      {form.getError("price")}
                    </p>
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
                disabled={form.isSubmitting || isCreating || isUpdating}
              >
                {form.isSubmitting || isCreating || isUpdating
                  ? t("common.loading")
                  : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Service Modal */}
      <Dialog
        open={isViewMode}
        onOpenChange={(open) => !open && setModalState(null)}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>{t("services.serviceDetails")}</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {translateServiceName(t, selectedService)}
                  </h3>
                  {selectedService.description && (
                    <p className="text-muted-foreground mt-1">
                      {selectedService.description}
                    </p>
                  )}
                </div>
                <Badge
                  variant={selectedService.isActive ? "success" : "warning"}
                >
                  {selectedService.isActive
                    ? t("common.active")
                    : t("common.inactive")}
                </Badge>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.duration")}
                    </p>
                    <p className="font-medium">
                      {selectedService.duration} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("fields.price")}
                    </p>
                    <p className="font-medium text-accent-pink">
                      {formatCurrency(selectedService.price)}
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
            {selectedService && (
              <Button
                onClick={() =>
                  setModalState({ serviceId: selectedService.id, mode: "edit" })
                }
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
            <AlertDialogTitle>{t("services.deleteService")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("services.deleteServiceConfirm", {
                name: selectedService?.name || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteService()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
