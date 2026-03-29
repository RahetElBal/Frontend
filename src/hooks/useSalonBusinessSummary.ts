import { useCallback } from "react";
import { useGet } from "@/hooks/useGet";

interface BusinessSummaryApiResponse {
  grossRevenue?: number | string;
  netRevenue?: number | string;
  monthlyRevenue?: number | string;
  transactionCount?: number | string;
  canceledCount?: number | string;
  canceledRevenueImpact?: number | string;
  refundedCount?: number | string;
  refundedRevenueImpact?: number | string;
  todayRevenue?: number | string;
  lastWeekRevenue?: number | string;
  updatedAt?: string;
}

export interface BusinessSummary {
  grossRevenue: number;
  netRevenue: number;
  monthlyRevenue: number;
  transactionCount: number;
  canceledCount: number;
  canceledRevenueImpact: number;
  refundedCount: number;
  refundedRevenueImpact: number;
  todayRevenue: number;
  lastWeekRevenue: number;
  updatedAt: number;
}

interface UseSalonBusinessSummaryOptions {
  enabled?: boolean;
}

const BUSINESS_SUMMARY_STALE_TIME = 1000 * 60;

const EMPTY_SUMMARY: BusinessSummary = {
  grossRevenue: 0,
  netRevenue: 0,
  monthlyRevenue: 0,
  transactionCount: 0,
  canceledCount: 0,
  canceledRevenueImpact: 0,
  refundedCount: 0,
  refundedRevenueImpact: 0,
  todayRevenue: 0,
  lastWeekRevenue: 0,
  updatedAt: 0,
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number") {
    if (Number.isFinite(value)) {
      return value;
    }
    return fallback;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const mapBusinessSummary = (
  response: BusinessSummaryApiResponse | null | undefined,
): BusinessSummary => {
  const grossRevenue = toNumber(response?.grossRevenue);
  const netRevenue = toNumber(response?.netRevenue, grossRevenue);
  const updatedAt = response?.updatedAt ? Date.parse(response.updatedAt) : 0;

  return {
    grossRevenue,
    netRevenue,
    monthlyRevenue: toNumber(response?.monthlyRevenue),
    transactionCount: toNumber(response?.transactionCount),
    canceledCount: toNumber(response?.canceledCount),
    canceledRevenueImpact: toNumber(response?.canceledRevenueImpact),
    refundedCount: toNumber(response?.refundedCount),
    refundedRevenueImpact: toNumber(response?.refundedRevenueImpact),
    todayRevenue: toNumber(response?.todayRevenue),
    lastWeekRevenue: toNumber(response?.lastWeekRevenue),
    updatedAt: Number.isFinite(updatedAt) ? updatedAt : 0,
  };
};

export function useSalonBusinessSummary(
  salonId: string | null | undefined,
  options: UseSalonBusinessSummaryOptions = {},
) {
  const normalizedSalonId = salonId?.trim() || "";
  const enabled = options.enabled !== false && !!normalizedSalonId;
  const query = useGet<BusinessSummary>({
    path: "sales/business-summary",
    query: {
      salonId: normalizedSalonId || undefined,
    },
    options: {
      enabled,
      staleTime: BUSINESS_SUMMARY_STALE_TIME,
      select: (response) =>
        mapBusinessSummary(response as BusinessSummaryApiResponse | null | undefined),
    },
  });

  const refresh = useCallback(async () => {
    if (!enabled) {
      return EMPTY_SUMMARY;
    }

    const result = await query.refetch();
    return result.data ?? EMPTY_SUMMARY;
  }, [enabled, query]);

  return {
    summary: query.data ?? EMPTY_SUMMARY,
    isLoading: query.isLoading,
    error: query.error ?? null,
    refresh,
  };
}
