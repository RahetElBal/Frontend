import type { TFunction } from "i18next";
import type { Service } from "@/pages/user/services/types";

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

const isBlockedUnsplashSource = (value?: string) =>
  !!value && value.includes("source.unsplash.com");

const isLegacyUploadPath = (value?: string) =>
  !!value &&
  (/^\/?uploads\//i.test(value) || /\/\/[^/]+\/uploads\//i.test(value));

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
  pack: "services.pack",
};

const getServiceCategoryValue = (service: Service) => {
  if (typeof service.category === "string") return service.category;
  return service.category?.name || "";
};

export const translateServiceName = (
  t: TFunction,
  service: Service
): string => {
  const category = normalize(getServiceCategoryValue(service));
  const name = normalize(service.name);
  const key = defaultServiceKeyMap[`${category}|${name}`];
  return key ? t(key) : service.name;
};

export const translateServiceCategory = (
  t: TFunction,
  category: string
): string => {
  const key = defaultCategoryKeyMap[normalize(category)];
  return key ? t(key) : category;
};

const defaultCategoryImageMap: Record<string, string> = {
  nails: "/service-icons/nails.svg",
  makeup: "/service-icons/makeup.svg",
  hair: "/service-icons/hair.svg",
  skincare: "/service-icons/skincare.svg",
  pack: "/service-icons/pack.svg",
};

const genericServiceImage = "/service-icons/default.svg";

export const getServiceImageFallback = (
  service: Service
): string | undefined => {
  const category = normalize(getServiceCategoryValue(service));
  const name = normalize(service.name);
  const key = defaultServiceKeyMap[`${category}|${name}`];
  if (key && defaultServiceImageMap[key]) return defaultServiceImageMap[key];
  if (defaultCategoryImageMap[category]) {
    return defaultCategoryImageMap[category];
  }
  return genericServiceImage;
};

export const getServiceImage = (service: Service): string | undefined => {
  const fallback = getServiceImageFallback(service);
  if (service.image) {
    if (isLegacyUploadPath(service.image)) return fallback;
    return isBlockedUnsplashSource(service.image) ? fallback : service.image;
  }
  return fallback;
};

const defaultServiceImageMap: Record<string, string> = {
  "services.defaults.nails.manicure": "/service-icons/nails.svg",
  "services.defaults.nails.pedicure": "/service-icons/nails.svg",
  "services.defaults.nails.nailArt": "/service-icons/nails.svg",
  "services.defaults.makeup.casual": "/service-icons/makeup.svg",
  "services.defaults.makeup.wedding": "/service-icons/makeup.svg",
  "services.defaults.hair.casual": "/service-icons/hair.svg",
  "services.defaults.hair.wedding": "/service-icons/hair.svg",
  "services.defaults.hair.haircut": "/service-icons/hair.svg",
  "services.defaults.hair.hairDye": "/service-icons/hair.svg",
  "services.defaults.hair.hairstyle": "/service-icons/hair.svg",
  "services.defaults.skincare.laser": "/service-icons/skincare.svg",
  "services.defaults.skincare.hydrafacial": "/service-icons/skincare.svg",
  "services.defaults.skincare.microneedling": "/service-icons/skincare.svg",
};
