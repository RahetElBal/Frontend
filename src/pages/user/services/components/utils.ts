import type { Service } from "../types";

export const getServiceCategoryName = (service: Service): string => {
  if (typeof service.category === "string") return service.category;
  return service.category?.name || "";
};
