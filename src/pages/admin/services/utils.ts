import type { Salon } from "@/pages/admin/salon/types";
import type { Category, Service } from "@/pages/user/services/types";

export const PACK_CATEGORY = "PACK";
export const SERVICE_DURATION_STEP_MINUTES = 15;
export const ADMIN_SERVICES_PAGE_SIZE = 20;
export const PACK_OPTIONS_LIMIT = 1000;

export interface ServicePayload {
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
}

export interface ServiceFormValues {
  name: string;
  category: string;
  duration: string;
  price: string;
  description: string;
  image: string;
  isActive: boolean;
  isPack: boolean;
  packServiceIds: string[];
}

export interface PackTotals {
  totalDuration: number;
  totalPrice: number;
}

export interface EditServiceFormState {
  formValues: ServiceFormValues;
  lastNonPackCategory: string;
}

export const createDefaultServiceFormValues = (): ServiceFormValues => ({
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

export const getCategoryName = (category?: string | Category): string => {
  if (!category) {
    return "";
  }

  if (typeof category === "string") {
    return category;
  }

  if (!category.name) {
    return "";
  }

  return category.name;
};

export const getAvailableSalons = (
  isSuperadmin: boolean,
  salons: Salon[],
  userSalon: Salon | null | undefined,
): Salon[] => {
  if (isSuperadmin) {
    return salons;
  }

  if (!userSalon) {
    return [];
  }

  return [userSalon];
};

export const getCategoryList = (categoryNames: string[]): string[] => {
  return Array.from(new Set(categoryNames.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
};

export const getCategoryOptions = (
  categories: string[],
  formValues: ServiceFormValues,
): string[] => {
  const baseCategories = categories.filter(
    (category) => category !== PACK_CATEGORY,
  );

  if (formValues.isPack) {
    return [PACK_CATEGORY, ...baseCategories];
  }

  if (formValues.category === PACK_CATEGORY) {
    return [PACK_CATEGORY, ...baseCategories];
  }

  return baseCategories;
};

export const getPackServiceOptions = (
  services: Service[],
  editingServiceId: string | null,
): Service[] => {
  return services.filter((service) => {
    if (service.isPack) {
      return false;
    }

    if (service.id === editingServiceId) {
      return false;
    }

    return true;
  });
};

export const getSelectedPackServices = (
  formValues: ServiceFormValues,
  packServiceOptions: Service[],
): Service[] => {
  if (!formValues.isPack) {
    return [];
  }

  const selectedIds = new Set(formValues.packServiceIds);
  return packServiceOptions.filter((service) => selectedIds.has(service.id));
};

export const getPackTotals = (services: Service[]): PackTotals => {
  let totalDuration = 0;
  let totalPrice = 0;

  services.forEach((service) => {
    totalDuration += Number(service.duration) || 0;
    totalPrice += Number(service.price) || 0;
  });

  return { totalDuration, totalPrice };
};

export const getPriceEditsMap = (
  services: Service[],
): Record<string, string> => {
  const nextPrices: Record<string, string> = {};

  services.forEach((service) => {
    nextPrices[service.id] = String(service.price ?? 0);
  });

  return nextPrices;
};

export const getDirtyServiceIds = (
  services: Service[],
  priceEdits: Record<string, string>,
  initialPrices: Record<string, string>,
): string[] => {
  return services
    .filter((service) => priceEdits[service.id] !== initialPrices[service.id])
    .map((service) => service.id);
};

export const getEditServiceFormState = (
  service: Service,
): EditServiceFormState => {
  const categoryName = getCategoryName(service.category);

  let lastNonPackCategory = categoryName;
  if (service.isPack) {
    lastNonPackCategory = "";
  }

  let category = categoryName;
  if (service.isPack) {
    category = PACK_CATEGORY;
  }

  return {
    lastNonPackCategory,
    formValues: {
      name: service.name ?? "",
      category,
      duration: String(service.duration ?? ""),
      price: String(service.price ?? ""),
      description: service.description ?? "",
      image: service.image ?? "",
      isActive: service.isActive ?? true,
      isPack: service.isPack ?? false,
      packServiceIds: service.packServiceIds ?? [],
    },
  };
};

export const updateServiceFormValues = (
  previousValues: ServiceFormValues,
  field: keyof ServiceFormValues,
  value: string | boolean,
  lastNonPackCategory: string,
): EditServiceFormState => {
  if (field === "isPack") {
    const nextIsPack = Boolean(value);

    if (nextIsPack) {
      let nextLastNonPackCategory = lastNonPackCategory;
      if (
        previousValues.category &&
        previousValues.category !== PACK_CATEGORY
      ) {
        nextLastNonPackCategory = previousValues.category;
      }

      return {
        lastNonPackCategory: nextLastNonPackCategory,
        formValues: {
          ...previousValues,
          isPack: true,
          category: PACK_CATEGORY,
        },
      };
    }

    let restoredCategory = previousValues.category;
    if (previousValues.category === PACK_CATEGORY) {
      restoredCategory = lastNonPackCategory;
    }

    return {
      lastNonPackCategory,
      formValues: {
        ...previousValues,
        isPack: false,
        category: restoredCategory || "",
        packServiceIds: [],
      },
    };
  }

  if (field === "category") {
    if (previousValues.isPack) {
      return {
        lastNonPackCategory,
        formValues: {
          ...previousValues,
          category: PACK_CATEGORY,
        },
      };
    }

    return {
      lastNonPackCategory: String(value),
      formValues: {
        ...previousValues,
        category: String(value),
      },
    };
  }

  return {
    lastNonPackCategory,
    formValues: {
      ...previousValues,
      [field]: value,
    },
  };
};

export const togglePackServiceIds = (
  selectedIds: string[],
  serviceId: string,
): string[] => {
  const nextSelectedIds = new Set(selectedIds);

  if (nextSelectedIds.has(serviceId)) {
    nextSelectedIds.delete(serviceId);
    return Array.from(nextSelectedIds);
  }

  nextSelectedIds.add(serviceId);
  return Array.from(nextSelectedIds);
};

export const getGroupedServices = (
  services: Service[],
  groupByCategory: boolean,
  unknownCategoryLabel: string,
): Record<string, Service[]> => {
  if (!groupByCategory) {
    return { all: services };
  }

  return services.reduce<Record<string, Service[]>>((acc, service) => {
    const categoryName = getCategoryName(service.category) || unknownCategoryLabel;

    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }

    acc[categoryName].push(service);
    return acc;
  }, {});
};
