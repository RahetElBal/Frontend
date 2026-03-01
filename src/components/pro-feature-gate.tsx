import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Crown, Lock } from "lucide-react";

import { Card } from "@/components/ui/card";
import { isProPlan } from "@/lib/plan";
import { useUser } from "@/hooks/useUser";

interface ProFeatureGateProps {
  children: ReactNode;
  featureKey: string;
  planTier?: string | null;
  compact?: boolean;
}

export function ProFeatureGate({
  children,
  featureKey,
  planTier,
  compact = false,
}: ProFeatureGateProps) {
  const { salon, isSuperadmin } = useUser();
  const tier = planTier ?? salon?.planTier;

  if (isSuperadmin || isProPlan(tier)) {
    return <>{children}</>;
  }

  return <ProUpgradePrompt featureKey={featureKey} compact={compact} />;
}

interface ProUpgradePromptProps {
  featureKey: string;
  compact?: boolean;
}

export function ProUpgradePrompt({
  featureKey,
  compact = false,
}: ProUpgradePromptProps) {
  const { t } = useTranslation();

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-accent-blue-200 bg-accent-blue-50/50 px-3 py-2 text-sm">
        <Lock className="h-4 w-4 shrink-0 text-accent-blue-500" />
        <span className="text-accent-blue-700">
          {t(`proFeatures.${featureKey}.locked`)}
        </span>
        <span className="ml-auto rounded-full bg-accent-blue-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          PRO
        </span>
      </div>
    );
  }

  return (
    <Card className="relative overflow-hidden border-accent-blue-200 bg-linear-to-br from-accent-blue-50/80 to-white p-6">
      <div className="absolute right-4 top-4 rounded-full bg-accent-blue-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
        PRO
      </div>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-blue-100">
          <Crown className="h-6 w-6 text-accent-blue-500" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-accent-blue-700">
            {t(`proFeatures.${featureKey}.title`)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(`proFeatures.${featureKey}.description`)}
          </p>
        </div>
      </div>
    </Card>
  );
}
