import type { TFunction } from "i18next";
import type { Service } from "@/types/entities";

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

const isBlockedUnsplashSource = (value?: string) =>
  !!value && value.includes("source.unsplash.com");

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
  nails:
    "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80",
  makeup:
    "https://images.unsplash.com/photo-1522336572468-97b06e8ef143?auto=format&fit=crop&w=800&q=80",
  hair: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=800&q=80",
  skincare:
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
};

const genericServiceImage =
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80";

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
    return isBlockedUnsplashSource(service.image) ? fallback : service.image;
  }
  return fallback;
};

const defaultServiceImageMap: Record<string, string> = {
  "services.defaults.nails.manicure":
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
  "services.defaults.nails.pedicure":
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
  "services.defaults.nails.nailArt":
    "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80",
  "services.defaults.makeup.casual":
    "https://images.unsplash.com/photo-1522336572468-97b06e8ef143?auto=format&fit=crop&w=800&q=80",
  "services.defaults.makeup.wedding":
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
  "services.defaults.hair.casual":
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
  "services.defaults.hair.wedding":
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  "services.defaults.hair.haircut":
    "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=800&q=80",
  "services.defaults.hair.hairDye":
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
  "services.defaults.hair.hairstyle":
    "https://images.unsplash.com/photo-1492107376256-402643ee46b0?auto=format&fit=crop&w=800&q=80",
  "services.defaults.skincare.laser":
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
  "services.defaults.skincare.hydrafacial":
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
  "services.defaults.skincare.microneedling":
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
};
