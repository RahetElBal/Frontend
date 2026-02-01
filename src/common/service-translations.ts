import type { TFunction } from "i18next";
import type { Service } from "@/types/entities";

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

const defaultServiceKeyMap: Record<string, string> = {
  "nails|manicure": "services.defaults.nails.manicure",
  "nails|pedicure": "services.defaults.nails.pedicure",
  "nails|nail art": "services.defaults.nails.nailArt",
  "makeup|casual": "services.defaults.makeup.casual",
  "makeup|wedding": "services.defaults.makeup.wedding",
  "hair|casual": "services.defaults.hair.casual",
  "hair|wedding": "services.defaults.hair.wedding",
  "hair|haircut": "services.defaults.hair.haircut",
  "hair|hair dye": "services.defaults.hair.hairDye",
  "hair|hairstyle": "services.defaults.hair.hairstyle",
  "skincare|laser": "services.defaults.skincare.laser",
  "skincare|hydrafacial": "services.defaults.skincare.hydrafacial",
  "skincare|microneedling": "services.defaults.skincare.microneedling",
};

const defaultCategoryKeyMap: Record<string, string> = {
  nails: "services.categories.nails",
  makeup: "services.categories.makeup",
  hair: "services.categories.hair",
  skincare: "services.categories.skincare",
};

const getServiceCategoryValue = (service: Service) => {
  if (typeof service.category === "string") return service.category;
  return service.category?.name || "";
};

export const translateServiceName = (t: TFunction, service: Service): string => {
  const category = normalize(getServiceCategoryValue(service));
  const name = normalize(service.name);
  const key = defaultServiceKeyMap[`${category}|${name}`];
  return key ? t(key) : service.name;
};

export const translateServiceCategory = (
  t: TFunction,
  category: string,
): string => {
  const key = defaultCategoryKeyMap[normalize(category)];
  return key ? t(key) : category;
};
