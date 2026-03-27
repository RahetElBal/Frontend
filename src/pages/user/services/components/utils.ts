import type { TFunction } from "i18next";
import { translateServiceCategory } from "@/common/service-translations";
import type { Service } from "../types";

export interface ServiceCategoryOption {
  id: string;
  name: string;
  label: string;
  color: string;
}

export interface ServiceFormValues {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
}

const DEFAULT_SERVICE_CATEGORY_COLOR = "#ec4899";

export const getServiceCategoryName = (service: Service): string => {
  if (typeof service.category === "string") {
    return service.category;
  }

  if (!service.category?.name) {
    return "";
  }

  return service.category.name;
};

export const createServiceCategoryOptions = (
  categoryNames: string[],
  t: TFunction,
): ServiceCategoryOption[] => {
  return categoryNames.map((name) => {
    return {
      id: name,
      name,
      label: translateServiceCategory(t, name),
      color: DEFAULT_SERVICE_CATEGORY_COLOR,
    };
  });
};

export const createServiceFormDefaults = (): ServiceFormValues => ({
  name: "",
  description: "",
  duration: 30,
  price: 0,
  category: "",
  isActive: true,
});

export const getServiceFormValues = (
  service: Service,
): ServiceFormValues => {
  return {
    name: service.name,
    description: service.description || "",
    duration: service.duration,
    price: service.price,
    category: getServiceCategoryName(service),
    isActive: service.isActive,
  };
};

export const getSelectedService = (
  serviceId: string | "create" | undefined,
  services: Service[],
): Service | null => {
  if (!serviceId) {
    return null;
  }

  if (serviceId === "create") {
    return null;
  }

  const selectedService = services.find((service) => service.id === serviceId);
  if (!selectedService) {
    return null;
  }

  return selectedService;
};

export const groupServicesByCategory = (
  categories: ServiceCategoryOption[],
  services: Service[],
) => {
  return categories
    .map((category) => {
      return {
        ...category,
        services: services.filter(
          (service) => getServiceCategoryName(service) === category.id,
        ),
      };
    })
    .filter((category) => category.services.length > 0);
};

export const getUncategorizedServices = (services: Service[]) => {
  return services.filter((service) => !getServiceCategoryName(service));
};
