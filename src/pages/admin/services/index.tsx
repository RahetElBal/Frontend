import { Fragment, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/lib/toast";
import { useGet } from "@/hooks/useGet";
import { useUser } from "@/hooks/useUser";
import { ROUTES } from "@/constants/navigation";
import { patch, post } from "@/lib/http";
import {
  getServiceImage,
  getServiceImageFallback,
  translateServiceCategory,
} from "@/common/service-translations";
import type { Category, PaginatedResponse, Salon, Service } from "@/types";

type ServiceModalMode = "create" | "edit";
type ServicePayload = {
  salonId?: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description?: string;
  image?: string;
  isActive: boolean;
};

export default function AdminServicesPage() {
  const { t } = useTranslation();
  const { isSuperadmin, isLoading } = useUser();
  const [selectedSalonId, setSelectedSalonId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [priceEdits, setPriceEdits] = useState<Record<string, string>>({});
  const [initialPrices, setInitialPrices] = useState<Record<string, string>>(
    {}
  );
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ServiceModalMode>("create");
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isSavingService, setIsSavingService] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    category: "",
    duration: "",
    price: "",
    description: "",
    image: "",
    isActive: true,
  });

  const getCategoryName = (category?: string | Category): string => {
    if (!category) return "";
    if (typeof category === "string") return category;
    return category.name || "";
  };

  const { data: salons = [] } = useGet<Salon[]>("salons", {
    enabled: isSuperadmin,
  });

  const {
    data: servicesResponse,
    isLoading: servicesLoading,
    refetch,
  } = useGet<PaginatedResponse<Service>>("services", {
    params: selectedSalonId ? { salonId: selectedSalonId, perPage: 200 } : {},
    enabled: !!selectedSalonId,
  });

  const services = useMemo(
    () => servicesResponse?.data ?? [],
    [servicesResponse]
  );

  const categories = useMemo(() => {
    const unique = new Set<string>();
    services.forEach((service) => {
      const name = getCategoryName(service.category);
      if (name) unique.add(name);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [services]);

  useEffect(() => {
    if (!selectedSalonId && salons.length === 1) {
      setSelectedSalonId(salons[0].id);
    }
  }, [salons, selectedSalonId]);

  useEffect(() => {
    if (services.length === 0) return;
    const nextPrices = services.reduce<Record<string, string>>(
      (acc, service) => {
        acc[service.id] = String(service.price ?? 0);
        return acc;
      },
      {}
    );
    setPriceEdits(nextPrices);
    setInitialPrices(nextPrices);
  }, [services]);

  const handlePriceChange = (serviceId: string, value: string) => {
    setPriceEdits((prev) => ({ ...prev, [serviceId]: value }));
  };

  const handleSave = async (serviceId: string) => {
    const rawValue = priceEdits[serviceId];
    const price = Number(rawValue);
    if (!Number.isFinite(price) || price < 0) {
      toast.error(t("admin.services.priceInvalid"));
      return;
    }

    setIsUpdatingId(serviceId);
    try {
      await patch<Service, { price: number }>(`services/${serviceId}`, {
        price,
      });
      toast.success(t("admin.services.priceUpdated"));
      refetch();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("common.error");
      toast.error(message);
    } finally {
      setIsUpdatingId(null);
    }
  };

  const dirtyServiceIds = useMemo(() => {
    return services
      .filter((service) => priceEdits[service.id] !== initialPrices[service.id])
      .map((service) => service.id);
  }, [services, priceEdits, initialPrices]);

  const handleReset = () => {
    setPriceEdits(initialPrices);
  };

  const handleSaveAll = async () => {
    if (dirtyServiceIds.length === 0) return;
    setIsSavingAll(true);
    try {
      await Promise.all(
        dirtyServiceIds.map(async (serviceId) => {
          const price = Number(priceEdits[serviceId]);
          if (!Number.isFinite(price) || price < 0) {
            throw new Error(t("admin.services.priceInvalid"));
          }
          return patch<Service, { price: number }>(`services/${serviceId}`, {
            price,
          });
        })
      );
      toast.success(t("admin.services.bulkUpdated"));
      refetch();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("common.error");
      toast.error(message);
    } finally {
      setIsSavingAll(false);
    }
  };

  const openCreateModal = () => {
    if (!selectedSalonId) {
      toast.error(t("admin.services.selectSalonFirst"));
      return;
    }
    setModalMode("create");
    setEditingServiceId(null);
    setFormValues({
      name: "",
      category: "",
      duration: "",
      price: "",
      description: "",
      image: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setModalMode("edit");
    setEditingServiceId(service.id);
    setFormValues({
      name: service.name ?? "",
      category: getCategoryName(service.category),
      duration: String(service.duration ?? ""),
      price: String(service.price ?? ""),
      description: service.description ?? "",
      image: service.image ?? "",
      isActive: service.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (
    field: keyof typeof formValues,
    value: string | boolean
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitService = async () => {
    const duration = Number(formValues.duration);
    const price = Number(formValues.price);
    if (!formValues.name.trim()) {
      toast.error(t("admin.services.nameRequired"));
      return;
    }
    if (!formValues.category.trim()) {
      toast.error(t("admin.services.categoryRequired"));
      return;
    }
    if (!Number.isFinite(duration) || duration <= 0) {
      toast.error(t("admin.services.durationInvalid"));
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error(t("admin.services.priceInvalid"));
      return;
    }

    setIsSavingService(true);
    try {
      if (modalMode === "create") {
        await post<Service, ServicePayload>("services", {
          salonId: selectedSalonId,
          name: formValues.name.trim(),
          category: formValues.category.trim(),
          duration,
          price,
          description: formValues.description.trim() || undefined,
          image: formValues.image.trim() || undefined,
          isActive: formValues.isActive,
        });
        toast.success(t("admin.services.created"));
      } else if (editingServiceId) {
        await patch<Service, ServicePayload>(`services/${editingServiceId}`, {
          name: formValues.name.trim(),
          category: formValues.category.trim(),
          duration,
          price,
          description: formValues.description.trim() || undefined,
          image: formValues.image.trim() || undefined,
          isActive: formValues.isActive,
        });
        toast.success(t("admin.services.updated"));
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("common.error");
      toast.error(message);
    } finally {
      setIsSavingService(false);
    }
  };

  const filteredServices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return services.filter((service) => {
      const categoryName = getCategoryName(service.category);
      const matchesCategory =
        selectedCategory === "all" || categoryName === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        service.name.toLowerCase().includes(normalizedSearch) ||
        categoryName.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [services, searchTerm, selectedCategory]);

  const groupedServices = useMemo(() => {
    if (!groupByCategory) return { all: filteredServices };
    return filteredServices.reduce<Record<string, Service[]>>(
      (acc, service) => {
        const categoryName =
          getCategoryName(service.category) || t("common.unknown");
        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push(service);
        return acc;
      },
      {}
    );
  }, [filteredServices, groupByCategory, t]);

  if (!isLoading && !isSuperadmin) {
    return <Navigate to={ROUTES.ADMIN} replace />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.services.title")}
        description={t("admin.services.description")}
        actions={
          selectedSalonId ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={openCreateModal}>
                {t("admin.services.addService")}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={dirtyServiceIds.length === 0}
              >
                {t("admin.services.resetChanges")}
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={dirtyServiceIds.length === 0 || isSavingAll}
              >
                {isSavingAll
                  ? t("admin.services.savingAll")
                  : t("admin.services.saveAll")}
              </Button>
            </div>
          ) : null
        }
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="text-sm font-medium">
              {t("admin.services.selectSalon")}
            </div>
            <Select value={selectedSalonId} onValueChange={setSelectedSalonId}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue
                  placeholder={t("admin.services.selectSalonPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {salons.map((salon) => (
                  <SelectItem key={salon.id} value={salon.id}>
                    {salon.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-3">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t("admin.services.searchPlaceholder")}
              className="w-full sm:w-64"
            />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder={t("admin.services.filterCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.services.allCategories")}
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {translateServiceCategory(t, category).toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                checked={groupByCategory}
                onCheckedChange={setGroupByCategory}
              />
              <span className="text-sm">
                {t("admin.services.groupByCategory")}
              </span>
            </div>
          </div>
        </div>
        {dirtyServiceIds.length > 0 && (
          <div className="mt-3 text-sm text-muted-foreground">
            {t("admin.services.unsavedChanges", {
              count: dirtyServiceIds.length,
            })}
          </div>
        )}
      </Card>

      {!selectedSalonId && (
        <Card className="p-6 text-center text-muted-foreground">
          {t("admin.services.noSalonSelected")}
        </Card>
      )}

      {selectedSalonId && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.services.name")}</TableHead>
                <TableHead>{t("admin.services.category")}</TableHead>
                <TableHead>{t("admin.services.duration")}</TableHead>
                <TableHead>{t("admin.services.price")}</TableHead>
                <TableHead className="text-end">
                  {t("common.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicesLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              )}
              {!servicesLoading && services.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {t("admin.services.noServices")}
                  </TableCell>
                </TableRow>
              )}
              {!servicesLoading &&
                Object.entries(groupedServices).map(([category, items]) => (
                  <Fragment key={category}>
                    {groupByCategory && (
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={5} className="font-semibold">
                          {translateServiceCategory(t, category).toUpperCase()}
                        </TableCell>
                      </TableRow>
                    )}
                    {items.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getServiceImage(service) && (
                              <img
                                src={getServiceImage(service)}
                                alt={service.name}
                                className="h-8 w-8 rounded-md object-cover"
                                loading="lazy"
                                onError={(event) => {
                                  const fallback =
                                    getServiceImageFallback(service);
                                  if (
                                    fallback &&
                                    event.currentTarget.src !== fallback
                                  ) {
                                    event.currentTarget.src = fallback;
                                  }
                                }}
                              />
                            )}
                            <span>{service.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {translateServiceCategory(
                            t,
                            getCategoryName(service.category)
                          ).toUpperCase()}
                        </TableCell>
                        <TableCell>{service.duration} min</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={priceEdits[service.id] ?? ""}
                            onChange={(event) =>
                              handlePriceChange(service.id, event.target.value)
                            }
                            className="w-32"
                          />
                        </TableCell>
                        <TableCell className="text-end">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(service)}
                            >
                              {t("common.edit")}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSave(service.id)}
                              disabled={isUpdatingId === service.id}
                            >
                              {t("admin.services.updatePrice")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create"
                ? t("admin.services.addService")
                : t("admin.services.editService")}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? t("admin.services.addServiceDescription")
                : t("admin.services.editServiceDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("admin.services.nameLabel")}</Label>
              <Input
                value={formValues.name}
                onChange={(event) =>
                  handleFormChange("name", event.target.value)
                }
              />
            </div>
            <div>
              <Label>{t("admin.services.categoryLabel")}</Label>
              <Input
                value={formValues.category}
                list="admin-service-categories"
                onChange={(event) =>
                  handleFormChange("category", event.target.value)
                }
              />
              <datalist id="admin-service-categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>{t("admin.services.durationLabel")}</Label>
                <Input
                  type="number"
                  min="1"
                  value={formValues.duration}
                  onChange={(event) =>
                    handleFormChange("duration", event.target.value)
                  }
                />
              </div>
              <div>
                <Label>{t("admin.services.priceLabel")}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formValues.price}
                  onChange={(event) =>
                    handleFormChange("price", event.target.value)
                  }
                />
              </div>
            </div>
            <div>
              <Label>{t("admin.services.descriptionLabel")}</Label>
              <Textarea
                value={formValues.description}
                onChange={(event) =>
                  handleFormChange("description", event.target.value)
                }
              />
            </div>
            <div>
              <Label>{t("admin.services.imageLabel")}</Label>
              <Input
                value={formValues.image}
                onChange={(event) =>
                  handleFormChange("image", event.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formValues.isActive}
                onCheckedChange={(value) => handleFormChange("isActive", value)}
              />
              <span className="text-sm">{t("admin.services.activeLabel")}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmitService} disabled={isSavingService}>
              {isSavingService
                ? t("admin.services.savingService")
                : modalMode === "create"
                ? t("common.create")
                : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
