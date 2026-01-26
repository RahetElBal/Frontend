import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
  Plus,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  DollarSign,
} from "lucide-react";
import { requiredString, optionalString } from "@/common/validator/zodI18n";

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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useForm } from "@/hooks/useForm";
import { toast } from "@/lib/toast";
import type { Service, Category } from "@/types/entities";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";

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
  categoryId: optionalString(),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

export function ServicesPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Unified modal state
  const [modalState, setModalState] = useState<ServiceModalState>(null);

  // Fetch services and categories from API (scoped to current salon)
  const {
    data: services = [],
    isLoading,
    refetch,
  } = useGet<Service[]>("services");
  const { data: categories = [] } = useGet<Category[]>("categories");

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
      categoryId: "",
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
        categoryId: "",
      });
    } else if (selectedService && isEditMode) {
      form.reset({
        name: selectedService.name,
        description: selectedService.description || "",
        duration: selectedService.duration,
        price: selectedService.price,
        categoryId: selectedService.categoryId || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState, selectedService, isCreateMode, isEditMode]);

  // Create service mutation
  const { mutate: createService, isPending: isCreating } = usePost<
    Service,
    ServiceFormData
  >("services", {
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

  // Toggle service status
  const { mutate: toggleStatus } = usePost<Service, void>("services", {
    method: "PATCH",
    onSuccess: () => {
      toast.success(t("common.success"));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const filteredServices = selectedCategory
    ? services.filter((s) => s.categoryId === selectedCategory)
    : services;

  const servicesByCategory = categories.map((cat) => ({
    ...cat,
    services: services.filter((s) => s.categoryId === cat.id),
  }));

  // Handlers
  const handleView = (service: Service) => {
    setModalState({ serviceId: service.id, mode: "view" });
  };

  const handleEdit = (service: Service) => {
    setModalState({ serviceId: service.id, mode: "edit" });
  };

  const handleDelete = (service: Service) => {
    setModalState({ serviceId: service.id, mode: "delete" });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleToggle = (_service: Service) => {
    toggleStatus(undefined, {
      onSuccess: () => refetch(),
    });
  };

  const handleSubmit = (data: ServiceFormData) => {
    if (isEditMode) {
      updateService(data);
    } else {
      createService(data);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.services")}
        description={t("services.description", { count: services.length })}
        actions={
          <Button
            className="gap-2"
            onClick={() => setModalState({ serviceId: "create", mode: "edit" })}
          >
            <Plus className="h-4 w-4" />
            {t("services.addService")}
          </Button>
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
            {cat.name} ({services.filter((s) => s.categoryId === cat.id).length}
            )
          </Button>
        ))}
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("common.loading")}
        </div>
      ) : selectedCategory === null ? (
        <div className="space-y-8">
          {servicesByCategory.map((category) => (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <h2 className="text-lg font-semibold">{category.name}</h2>
                <span className="text-sm text-muted-foreground">
                  ({category.services.length} {t("services.services")})
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    t={t}
                    formatCurrency={formatCurrency}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          ))}
          {services.filter((s) => !s.categoryId).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {t("common.other")}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services
                  .filter((s) => !s.categoryId)
                  .map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      t={t}
                      formatCurrency={formatCurrency}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
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
              t={t}
              formatCurrency={formatCurrency}
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
              <DialogDescription>{selectedService.name}</DialogDescription>
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
                    {selectedService.name}
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

interface ServiceCardProps {
  service: Service;
  t: ReturnType<typeof useTranslation>["t"];
  formatCurrency: (value: number) => string;
  onView: (service: Service) => void;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggle: (service: Service) => void;
}

function ServiceCard({
  service,
  t,
  formatCurrency,
  onView,
  onEdit,
  onDelete,
  onToggle,
}: ServiceCardProps) {
  return (
    <Card
      className={cn(
        "p-4 transition-shadow hover:shadow-md",
        !service.isActive && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{service.name}</h3>
            {!service.isActive && (
              <Badge variant="warning">{t("common.inactive")}</Badge>
            )}
          </div>
          {service.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {service.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {service.duration} min
            </div>
            <span className="text-lg font-bold text-accent-pink">
              {formatCurrency(service.price)}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(service)}>
              <Eye className="h-4 w-4 me-2" />
              {t("common.view")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(service)}>
              <Edit className="h-4 w-4 me-2" />
              {t("common.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggle(service)}>
              {service.isActive ? (
                <>
                  <ToggleLeft className="h-4 w-4 me-2" />
                  {t("common.deactivate")}
                </>
              ) : (
                <>
                  <ToggleRight className="h-4 w-4 me-2" />
                  {t("common.activate")}
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(service)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 me-2" />
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
