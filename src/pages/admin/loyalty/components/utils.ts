import type { Salon } from "@/pages/admin/salon/types";
import type { Client } from "@/pages/user/clients/types";
import type { Sale } from "@/pages/user/sales/types";
import type { Service } from "@/pages/user/services/types";
import type { SalonSettingsExtended } from "@/pages/admin/salon-settings/types";
import type { PaginatedResponse } from "@/types/api";

export const defaultLoyaltySettings = {
  loyaltyEnabled: false,
  loyaltyPointsPerCurrency: 1,
  loyaltyPointValue: 0.01,
  loyaltyMinimumRedemption: 100,
  loyaltyRewardServiceId: "",
  loyaltyRewardDiscountType: "percent" as const,
  loyaltyRewardDiscountValue: 10,
};

/**
 * Extracts array from PaginatedResponse or returns array as-is
 */
export const extractArray = <T>(
  data: PaginatedResponse<T> | T[] | undefined,
): T[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Array.isArray(data.data) ? data.data : [];
};

/**
 * Derives loyalty settings from salon data with defaults
 */
export const deriveLoyaltySettings = (
  salon: Salon | null,
): Partial<SalonSettingsExtended> => ({
  ...defaultLoyaltySettings,
  loyaltyEnabled: !!salon?.settings?.loyaltyEnabled,
  loyaltyPointsPerCurrency:
    salon?.settings?.loyaltyPointsPerCurrency ??
    defaultLoyaltySettings.loyaltyPointsPerCurrency,
  loyaltyPointValue:
    salon?.settings?.loyaltyPointValue ??
    defaultLoyaltySettings.loyaltyPointValue,
  loyaltyMinimumRedemption:
    salon?.settings?.loyaltyMinimumRedemption ??
    defaultLoyaltySettings.loyaltyMinimumRedemption,
  loyaltyRewardServiceId: salon?.settings?.loyaltyRewardServiceId || "",
  loyaltyRewardDiscountType:
    salon?.settings?.loyaltyRewardDiscountType ??
    defaultLoyaltySettings.loyaltyRewardDiscountType,
  loyaltyRewardDiscountValue:
    salon?.settings?.loyaltyRewardDiscountValue ??
    defaultLoyaltySettings.loyaltyRewardDiscountValue,
});

/**
 * Calculates total points issued to all clients
 */
export const calculateTotalPointsIssued = (clients: Client[]): number => {
  return clients.reduce((sum, client) => sum + (client.loyaltyPoints || 0), 0);
};

/**
 * Calculates total points redeemed from sales
 */
export const calculateTotalPointsRedeemed = (
  sales: Sale[],
  pointValue: number,
): number => {
  const hasRedeemedPointsField = sales.some(
    (sale) => sale.redeemedPoints !== undefined && sale.redeemedPoints !== null,
  );

  if (hasRedeemedPointsField) {
    return sales.reduce(
      (sum, sale) => sum + Number(sale.redeemedPoints || 0),
      0,
    );
  }

  if (pointValue <= 0) return 0;

  const totalDiscount = sales.reduce(
    (sum, sale) => sum + Number(sale.discount || 0),
    0,
  );
  return Math.round(totalDiscount / pointValue);
};

/**
 * Gets top clients by loyalty points
 */
export const getTopLoyaltyClients = (
  clients: Client[],
  limit: number = 5,
): Client[] => {
  return [...clients]
    .sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0))
    .slice(0, limit);
};

/**
 * Counts active loyalty program members (clients with points > 0)
 */
export const countActiveMembers = (clients: Client[]): number => {
  return clients.filter((client) => (client.loyaltyPoints || 0) > 0).length;
};

/**
 * Filters clients who have points available to redeem
 */
export const getRedeemableClients = (clients: Client[]): Client[] => {
  return clients.filter((client) => (client.loyaltyPoints || 0) > 0);
};

/**
 * Filters active services that can be redeemed
 */
export const getRedeemableServices = (services: Service[]): Service[] => {
  return services.filter((service) => service.isActive !== false);
};

/**
 * Finds a client by ID from a list
 */
export const findClientById = (
  clients: Client[],
  clientId: string,
): Client | null => {
  return clients.find((client) => client.id === clientId) || null;
};

/**
 * Finds a service by ID from a list
 */
export const findServiceById = (
  services: Service[],
  serviceId: string,
): Service | null => {
  return services.find((service) => service.id === serviceId) || null;
};

/**
 * Validates if a client can redeem points
 */
export const canClientRedeem = (
  client: Client | null,
  service: Service | null,
  loyaltyEnabled: boolean,
  minimumRedemption: number,
): boolean => {
  if (!client || !service || !loyaltyEnabled || minimumRedemption <= 0) {
    return false;
  }

  const availablePoints = client.loyaltyPoints || 0;
  return availablePoints >= minimumRedemption;
};

/**
 * Validates redemption request
 */
export interface RedemptionValidation {
  isValid: boolean;
  errorKey?: string;
  errorParams?: Record<string, string>;
}

export const validateRedemption = (
  client: Client | null,
  service: Service | null,
  loyaltyEnabled: boolean,
  minimumRedemption: number,
): RedemptionValidation => {
  if (!client) {
    return {
      isValid: false,
      errorKey: "validation.required",
      errorParams: { field: "loyalty.paymentClient" },
    };
  }

  if (!loyaltyEnabled || minimumRedemption <= 0) {
    return {
      isValid: false,
      errorKey: "loyalty.redeemConfigMissing",
    };
  }

  if (!service) {
    return {
      isValid: false,
      errorKey: "validation.required",
      errorParams: { field: "salonSettings.loyaltyRewardService" },
    };
  }

  const availablePoints = client.loyaltyPoints || 0;
  if (availablePoints < minimumRedemption) {
    return {
      isValid: false,
      errorKey: "loyalty.redeemNotEligible",
    };
  }

  return { isValid: true };
};

/**
 * Creates redemption sale payload
 */
export const createRedemptionPayload = (
  salonId: string,
  client: Client,
  service: Service,
) => ({
  salonId,
  clientId: client.id,
  redeemLoyalty: true,
  redeemServiceId: service.id,
  items: [
    {
      type: "service" as const,
      itemId: service.id,
      quantity: 1,
      price: Number(service.price || 0),
    },
  ],
});
