import { Fragment, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import { ROUTES } from "@/constants/navigation";
import { patch, post } from "@/lib/http";
import {
  getServiceImage,
  getServiceImageFallback,
  translateServiceCategory,
} from "@/common/service-translations";
import type { Category, PaginatedResponse, Salon, Service } from "@/types";
import { Badge } from "@/components/badge";

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
  isPack?: boolean;
  packServiceIds?: string[];
};

export default function AdminServicesPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { isSuperadmin, isAdmin, isLoading, user } = useUser();
  const salonsStaleTime = 1000 * 60 * 10;
  const servicesStaleTime = 1000 * 60 * 5;
  const adminSalonId = !isSuperadmin ? (user?.salon?.id ?? "") : "";
  const [selectedSalonId, setSelectedSalonId] = useState<string>(adminSalonId);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [priceEdits, setPriceEdits] = useState<Record<string, string>>({});
  const [initialPrices, setInitialPrices] = useState<Record<string, string>>(
    {},
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
    isPack: false,
    packServiceIds: [] as string[],
  });

  const getCategoryName = (category?: string | Category): string => {
    if (!category) return "";
    if (typeof category === "string") return category;
    return category.name || "";
  };

  const { data: salons = [] } = useGet<Salon[]>("salons", {
    enabled: isSuperadmin,
    staleTime: salonsStaleTime,
  });

  const availableSalons = isSuperadmin
    ? salons
    : user?.salon
      ? [user.salon]
      : [];

  const {
    data: servicesResponse,
    isLoading: servicesLoading,
    refetch,
  } = useGet<PaginatedResponse<Service>>("services", {
    params: selectedSalonId ? { salonId: selectedSalonId, perPage: 100 } : {},
    enabled: !!selectedSalonId,
    staleTime: servicesStaleTime,
  });

  const services = useMemo(
    () => servicesResponse?.data ?? [],
    [servicesResponse],
  );

  const categories = useMemo(() => {
    const unique = new Set<string>();
    services.forEach((service) => {
      const name = getCategoryName(service.category);
      if (name) unique.add(name);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [services]);

  const packServiceOptions = useMemo(
    () =>
      services.filter(
        (service) => !service.isPack && service.id !== editingServiceId,
      ),
    [services, editingServiceId],
  );

  const selectedPackServices = useMemo(() => {
    if (!formValues.isPack) return [];
    const selectedIds = new Set(formValues.packServiceIds);
    return packServiceOptions.filter((service) => selectedIds.has(service.id));
  }, [formValues.isPack, formValues.packServiceIds, packServiceOptions]);

  const packTotals = useMemo(() => {
    const totalDuration = selectedPackServices.reduce(
      (sum, service) => sum + (Number(service.duration) || 0),
      0,
    );
    const totalPrice = selectedPackServices.reduce(
      (sum, service) => sum + (Number(service.price) || 0),
      0,
    );
    return { totalDuration, totalPrice };
  }, [selectedPackServices]);

  useEffect(() => {
    if (!formValues.isPack) return;
    const nextDuration = packTotals.totalDuration;
    if (nextDuration > 0 && String(nextDuration) !== formValues.duration) {
      setFormValues((prev) => ({ ...prev, duration: String(nextDuration) }));
    }
  }, [formValues.isPack, formValues.duration, packTotals.totalDuration]);

  useEffect(() => {
    if (!isSuperadmin) {
      if (adminSalonId && adminSalonId !== selectedSalonId) {
        setSelectedSalonId(adminSalonId);
      }
      return;
    }
    if (!selectedSalonId && salons.length === 1) {
      setSelectedSalonId(salons[0].id);
    }
  }, [adminSalonId, isSuperadmin, salons, selectedSalonId]);

  useEffect(() => {
    if (services.length === 0) return;
    const nextPrices = services.reduce<Record<string, string>>(
      (acc, service) => {
        acc[service.id] = String(service.price ?? 0);
        return acc;
      },
      {},
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
        }),
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
      isPack: false,
      packServiceIds: [],
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
      isPack: service.isPack ?? false,
      packServiceIds: service.packServiceIds ?? [],
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (
    field: keyof typeof formValues,
    value: string | boolean,
  ) => {
    setFormValues((prev) => {
      if (field === "isPack" && value === false) {
        return { ...prev, isPack: false, packServiceIds: [] };
      }
      return { ...prev, [field]: value };
    });
  };

  const togglePackService = (serviceId: string) => {
    setFormValues((prev) => {
      const existing = new Set(prev.packServiceIds);
      if (existing.has(serviceId)) {
        existing.delete(serviceId);
      } else {
        existing.add(serviceId);
      }
      return { ...prev, packServiceIds: Array.from(existing) };
    });
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
    if (formValues.isPack && formValues.packServiceIds.length === 0) {
      toast.error(t("admin.services.packServicesRequired"));
      return;
    }

    setIsSavingService(true);
    try {
      const resolvedDuration =
        formValues.isPack && packTotals.totalDuration > 0
          ? packTotals.totalDuration
          : duration;
      if (modalMode === "create") {
        await post<Service, ServicePayload>("services", {
          salonId: selectedSalonId,
          name: formValues.name.trim(),
          category: formValues.category.trim(),
          duration: resolvedDuration,
          price,
          description: formValues.description.trim() || undefined,
          image: formValues.image.trim() || undefined,
          isActive: formValues.isActive,
          isPack: formValues.isPack,
          packServiceIds: formValues.isPack
            ? formValues.packServiceIds
            : [],
        });
        toast.success(t("admin.services.created"));
      } else if (editingServiceId) {
        await patch<Service, ServicePayload>(`services/${editingServiceId}`, {
          name: formValues.name.trim(),
          category: formValues.category.trim(),
          duration: resolvedDuration,
          price,
          description: formValues.description.trim() || undefined,
          image: formValues.image.trim() || undefined,
          isActive: formValues.isActive,
          isPack: formValues.isPack,
          packServiceIds: formValues.isPack
            ? formValues.packServiceIds
            : [],
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
      {},
    );
  }, [filteredServices, groupByCategory, t]);

  if (!isLoading && !isAdmin) {
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
            {isSuperadmin ? (
              <>
                <div className="text-sm font-medium">
                  {t("admin.services.selectSalon")}
                </div>
                <Select
                  value={selectedSalonId}
                  onValueChange={setSelectedSalonId}
                >
                  <SelectTrigger className="w-full sm:w-80">
                    <SelectValue
                      placeholder={t("admin.services.selectSalonPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSalons.map((salon) => (
                      <SelectItem key={salon.id} value={salon.id}>
                        {salon.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                {availableSalons[0]?.name ||
                  t("admin.services.noSalonSelected")}
              </div>
            )}
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
                  <TableCell colSpan={5} className="h-24">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Spinner size="sm" />
                      <span className="text-sm">{t("common.loading")}</span>
                    </div>
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
                            {service.isPack && (
                              <Badge variant="info">
                                {t("services.pack")}
                              </Badge>
                            )}
                          </div>
                          {service.isPack &&
                            service.packServiceIds &&
                            service.packServiceIds.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {t("admin.services.packItems", {
                                  count: service.packServiceIds.length,
                                })}
                              </p>
                            )}
                        </TableCell>
                        <TableCell>
                          {translateServiceCategory(
                            t,
                            getCategoryName(service.category),
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
                  disabled={formValues.isPack}
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
            <div className="rounded-lg border p-3 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label>{t("admin.services.packLabel")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.services.packDescription")}
                  </p>
                </div>
                <Switch
                  checked={formValues.isPack}
                  onCheckedChange={(value) => handleFormChange("isPack", value)}
                />
              </div>
              {formValues.isPack && (
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    {t("admin.services.packSummary", {
                      count: selectedPackServices.length,
                      duration: packTotals.totalDuration,
                      price: formatCurrency(packTotals.totalPrice),
                    })}
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.services.packServicesLabel")}</Label>
                    {packServiceOptions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {t("admin.services.packServicesEmpty")}
                      </p>
                    ) : (
                      <div className="grid gap-2 max-h-40 overflow-y-auto rounded-md border p-2">
                        {packServiceOptions.map((service) => {
                          const checked = formValues.packServiceIds.includes(
                            service.id,
                          );
                          return (
                            <label
                              key={service.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() =>
                                  togglePackService(service.id)
                                }
                              />
                              <span className="flex-1">
                                {service.name} ({service.duration} min)
                              </span>
                              <span className="text-muted-foreground">
                                {formatCurrency(Number(service.price) || 0)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
