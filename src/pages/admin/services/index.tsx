import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { Input } from "@/components/ui/input";
import { ServerPagination } from "@/components/table";
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
import { useTable } from "@/hooks/useTable";
import { useCategoriesContext } from "@/contexts/CategoriesProvider";
import { useServicesContext } from "@/contexts/ServicesProvider";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import { ROUTES } from "@/constants/navigation";
import { patch, post, uploadFile } from "@/lib/http";
import {
  getServiceImage,
  getServiceImageFallback,
  translateServiceCategory,
  translateServiceName,
} from "@/common/service-translations";
import type { Salon } from "@/pages/admin/salon/types";
import type { Category, Service } from "@/pages/user/services/types";
import { Badge } from "@/components/badge";
import { useSalonCategories } from "@/contexts/CategoriesProvider";

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

const PACK_CATEGORY = "PACK";
const SERVICE_DURATION_STEP_MINUTES = 15;
const ADMIN_SERVICES_PAGE_SIZE = 20;
const PACK_OPTIONS_LIMIT = 1000;

export default function AdminServicesPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { isSuperadmin, isAdmin, isLoading, user } = useUser();
  const { invalidateCategories } = useCategoriesContext();
  const { invalidateServices } = useServicesContext();
  const salonsStaleTime = 1000 * 60 * 10;
  const servicesStaleTime = 1000 * 60 * 5;
  const adminSalonId = !isSuperadmin ? (user?.salon?.id ?? "") : "";
  const [selectedSalonId, setSelectedSalonId] = useState<string>(adminSalonId);
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
  const [isUploadingServiceImage, setIsUploadingServiceImage] =
    useState(false);
  const serviceImageInputRef = useRef<HTMLInputElement | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    category: "",
    duration: "",
    price: "",
    packDiscount: "",
    description: "",
    image: "",
    isActive: true,
    isPack: false,
    packServiceIds: [] as string[],
  });
  const [lastNonPackCategory, setLastNonPackCategory] = useState("");

  const getCategoryName = (category?: string | Category): string => {
    if (!category) return "";
    if (typeof category === "string") return category;
    return category.name || "";
  };

  const { data: salons = [] } = useGet<Salon[]>({
    path: "salons",
    options: {
      enabled: isSuperadmin,
      staleTime: salonsStaleTime,
    },
  });

  const availableSalons = isSuperadmin
    ? salons
    : user?.salon
      ? [user.salon]
      : [];

  const servicesTable = useTable<Service>({
    path: "services",
    query: {
      salonId: selectedSalonId || undefined,
      category: selectedCategory === "all" ? undefined : selectedCategory,
    },
    enabled: !!selectedSalonId,
    initialPerPage: ADMIN_SERVICES_PAGE_SIZE,
    options: { staleTime: servicesStaleTime },
  });
  const services = servicesTable.items;
  const {
    serviceCategories: categoryNames = [],
  } = useSalonCategories(selectedSalonId, {
    enabled: !!selectedSalonId,
    includeProducts: false,
  });
  const { data: allPackServices = [] } = useGet<Service[]>({
    path: "services",
    query: selectedSalonId
      ? {
          salonId: selectedSalonId,
          limit: PACK_OPTIONS_LIMIT,
          compact: true,
        }
      : undefined,
    options: {
      enabled: isModalOpen && !!selectedSalonId,
      staleTime: servicesStaleTime,
      select: (response) => {
        const normalizedResponse = response as
          | { data?: Service[] }
          | Service[];

        if (Array.isArray(normalizedResponse)) {
          return normalizedResponse;
        }

        return Array.isArray(normalizedResponse?.data)
          ? normalizedResponse.data
          : [];
      },
    },
  });

  const categories = useMemo(() => {
    return Array.from(new Set(categoryNames.filter(Boolean))).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [categoryNames]);

  const categoryOptions = useMemo(() => {
    const baseCategories = categories.filter(
      (category) => category !== PACK_CATEGORY,
    );
    if (formValues.isPack || formValues.category === PACK_CATEGORY) {
      return [PACK_CATEGORY, ...baseCategories];
    }
    return baseCategories;
  }, [categories, formValues.isPack, formValues.category]);

  const packServiceOptions = useMemo(
    () =>
      allPackServices.filter(
        (service) => !service.isPack && service.id !== editingServiceId,
      ),
    [allPackServices, editingServiceId],
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

  const packDiscountValue = useMemo(() => {
    if (!formValues.isPack) return 0;
    const parsed = Number(formValues.packDiscount);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [formValues.isPack, formValues.packDiscount]);

  const packFinalPrice = useMemo(() => {
    if (!formValues.isPack) return 0;
    return Math.max(0, packTotals.totalPrice - packDiscountValue);
  }, [formValues.isPack, packTotals.totalPrice, packDiscountValue]);

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
    if (selectedCategory === "all") return;
    if (categories.includes(selectedCategory)) return;
    setSelectedCategory("all");
  }, [categories, selectedCategory]);

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
      if (selectedSalonId) {
        invalidateServices(selectedSalonId);
        invalidateCategories(selectedSalonId);
      }
      void servicesTable.refetch();
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
      if (selectedSalonId) {
        invalidateServices(selectedSalonId);
        invalidateCategories(selectedSalonId);
      }
      void servicesTable.refetch();
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
    setLastNonPackCategory("");
    setFormValues({
      name: "",
      category: "",
      duration: "",
      price: "",
      packDiscount: "",
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
    const categoryName = getCategoryName(service.category);
    const packBasePrice = (service.packServiceIds ?? []).reduce(
      (sum, serviceId) => {
        const item = services.find((entry) => entry.id === serviceId);
        return sum + (Number(item?.price) || 0);
      },
      0,
    );
    const packDiscount = service.isPack
      ? Math.max(0, packBasePrice - Number(service.price ?? 0))
      : 0;
    setLastNonPackCategory(service.isPack ? "" : categoryName);
    setFormValues({
      name: service.name ?? "",
      category: service.isPack ? PACK_CATEGORY : categoryName,
      duration: String(service.duration ?? ""),
      price: String(service.price ?? ""),
      packDiscount: service.isPack ? String(packDiscount) : "",
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
      if (field === "isPack") {
        const nextIsPack = Boolean(value);
        if (nextIsPack) {
          if (prev.category && prev.category !== PACK_CATEGORY) {
            setLastNonPackCategory(prev.category);
          }
          return {
            ...prev,
            isPack: true,
            category: PACK_CATEGORY,
            packDiscount: "",
          };
        }
        const restoredCategory =
          prev.category === PACK_CATEGORY ? lastNonPackCategory : prev.category;
        return {
          ...prev,
          isPack: false,
          category: restoredCategory || "",
          packDiscount: "",
          packServiceIds: [],
        };
      }
      if (field === "category") {
        if (prev.isPack) {
          return { ...prev, category: PACK_CATEGORY };
        }
        const nextCategory = String(value);
        setLastNonPackCategory(nextCategory);
        return { ...prev, category: nextCategory };
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
    const rawDuration = Number(formValues.duration);
    const price = Number(formValues.price);
    const discount = Number(formValues.packDiscount);
    const resolvedDiscount = Number.isFinite(discount) ? discount : 0;
    const duration = formValues.isPack ? packTotals.totalDuration : rawDuration;
    const resolvedPrice = formValues.isPack
      ? Math.max(0, packTotals.totalPrice - resolvedDiscount)
      : price;
    if (!formValues.name.trim()) {
      toast.error(t("admin.services.nameRequired"));
      return;
    }
    if (!formValues.category.trim()) {
      toast.error(t("admin.services.categoryRequired"));
      return;
    }
    if (
      !Number.isFinite(duration) ||
      duration < SERVICE_DURATION_STEP_MINUTES ||
      !Number.isInteger(duration) ||
      duration % SERVICE_DURATION_STEP_MINUTES !== 0
    ) {
      toast.error(t("admin.services.durationInvalid"));
      return;
    }
    if (formValues.isPack && formValues.packServiceIds.length === 0) {
      toast.error(t("admin.services.packServicesRequired"));
      return;
    }
    if (formValues.isPack) {
      if (!Number.isFinite(discount) || discount < 0) {
        toast.error(t("admin.services.priceInvalid"));
        return;
      }
    } else if (!Number.isFinite(price) || price < 0) {
      toast.error(t("admin.services.priceInvalid"));
      return;
    }

    setIsSavingService(true);
    try {
      const resolvedCategory = formValues.isPack
        ? PACK_CATEGORY
        : formValues.category.trim();
      if (modalMode === "create") {
        await post<Service, ServicePayload>("services", {
          salonId: selectedSalonId,
          name: formValues.name.trim(),
          category: resolvedCategory,
          duration,
          price: resolvedPrice,
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
          category: resolvedCategory,
          duration,
          price: resolvedPrice,
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
      if (selectedSalonId) {
        invalidateServices(selectedSalonId);
        invalidateCategories(selectedSalonId);
      }
      setIsModalOpen(false);
      void servicesTable.refetch();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("common.error");
      toast.error(message);
    } finally {
      setIsSavingService(false);
    }
  };

  const handleServiceImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    setIsUploadingServiceImage(true);
    try {
      const response = await uploadFile<{ url: string }>(
        "uploads/services",
        file,
      );
      if (!response?.url) {
        throw new Error(t("common.error"));
      }
      setFormValues((prev) => ({ ...prev, image: response.url }));
      toast.success(t("success.saved"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("common.error");
      toast.error(message);
    } finally {
      setIsUploadingServiceImage(false);
    }
  };

  const groupedServices = useMemo(() => {
    if (!groupByCategory) return { all: services };
    return services.reduce<Record<string, Service[]>>(
      (acc, service) => {
        const categoryName =
          getCategoryName(service.category) || t("common.unknown");
        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push(service);
        return acc;
      },
      {},
    );
  }, [groupByCategory, services, t]);

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
                  onValueChange={(value) => {
                    setSelectedSalonId(value);
                    setSelectedCategory("all");
                    servicesTable.resetPage();
                  }}
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
              value={servicesTable.searchInput}
              onChange={(event) => servicesTable.setSearchInput(event.target.value)}
              placeholder={t("admin.services.searchPlaceholder")}
              className="w-full sm:w-64"
            />
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                servicesTable.resetPage();
              }}
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
              {(servicesTable.isLoading || servicesTable.isFetching) &&
                services.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Spinner size="sm" />
                      <span className="text-sm">{t("common.loading")}</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!servicesTable.isLoading &&
                !servicesTable.isFetching &&
                services.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {t("admin.services.noServices")}
                  </TableCell>
                </TableRow>
              )}
              {!servicesTable.isLoading &&
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
                                alt={translateServiceName(t, service)}
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
                            <span>{translateServiceName(t, service)}</span>
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

      {selectedSalonId && (
        <ServerPagination
          page={servicesTable.page}
          perPage={servicesTable.perPage}
          totalItems={servicesTable.totalItems}
          totalPages={servicesTable.totalPages}
          onPageChange={servicesTable.setPage}
        />
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
              <Select
                value={formValues.category}
                onValueChange={(value) => handleFormChange("category", value)}
                disabled={formValues.isPack}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("services.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      {t("common.noResults")}
                    </SelectItem>
                  ) : (
                    categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {translateServiceCategory(t, category)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>{t("admin.services.durationLabel")}</Label>
                <Input
                  type="number"
                  min={String(SERVICE_DURATION_STEP_MINUTES)}
                  step={String(SERVICE_DURATION_STEP_MINUTES)}
                  value={formValues.duration}
                  onChange={(event) =>
                    handleFormChange("duration", event.target.value)
                  }
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("validation.number.multipleOf", {
                    field: t("fields.duration"),
                    value: SERVICE_DURATION_STEP_MINUTES,
                  })}
                </p>
              </div>
              {formValues.isPack ? (
                <div>
                  <Label>{t("sales.discount")}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.packDiscount}
                    onChange={(event) =>
                      handleFormChange("packDiscount", event.target.value)
                    }
                  />
                </div>
              ) : (
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
              )}
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
                                {translateServiceName(t, service)} (
                                {service.duration} min)
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
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">
                      {t("fields.total")}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(packFinalPrice)}
                    </span>
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
              <div className="mt-2 flex items-center gap-3">
                <div className="h-16 w-16 rounded-md border bg-muted/40 flex items-center justify-center overflow-hidden">
                  {formValues.image ? (
                    <img
                      src={formValues.image}
                      alt={formValues.name || t("admin.services.imageLabel")}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.removeAttribute("src");
                      }}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => serviceImageInputRef.current?.click()}
                    disabled={isUploadingServiceImage}
                  >
                    {isUploadingServiceImage
                      ? t("common.loading")
                      : t("common.upload")}
                  </Button>
                  {formValues.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        setFormValues((prev) => ({ ...prev, image: "" }))
                      }
                      disabled={isUploadingServiceImage}
                    >
                      {t("common.remove")}
                    </Button>
                  )}
                </div>
              </div>
              <input
                ref={serviceImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleServiceImageChange}
              />
              <Input
                value={formValues.image}
                onChange={(event) =>
                  handleFormChange("image", event.target.value)
                }
                placeholder="https://ik.imagekit.io/beautiq/..."
                className="mt-2"
              />
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
