export type PlanTier = "standard" | "pro";

const PRO_LIKE_TIERS = new Set(["pro", "all-in", "all_in", "allin"]);

export function isProPlan(planTier?: string | null): boolean {
  return PRO_LIKE_TIERS.has(String(planTier || "standard").toLowerCase().trim());
}

export type ProFeature =
  | "advanced_analytics"
  | "advanced_permissions"
  | "whatsapp_reminders";

export function hasFeature(
  planTier: string | undefined | null,
  feature: ProFeature,
): boolean {
  const isPro = isProPlan(planTier);

  switch (feature) {
    case "advanced_analytics":
    case "advanced_permissions":
    case "whatsapp_reminders":
      return isPro;
    default:
      return false;
  }
}
