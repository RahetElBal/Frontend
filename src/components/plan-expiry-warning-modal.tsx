import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/navigation";
import { useAuthContext } from "@/contexts/AuthProvider";

const WARNING_THRESHOLDS_HOURS = [168, 72, 48] as const;

interface PlanWarningState {
  storageKey: string;
  thresholdHours: number;
  hoursLeft: number;
  isTrial: boolean;
}

function resolveThresholdLabel(hours: number) {
  if (hours === 168) {
    return "7 jours";
  }

  if (hours === 72) {
    return "72 heures";
  }

  if (hours === 48) {
    return "48 heures";
  }

  return `${hours} heures`;
}

export function PlanExpiryWarningModal() {
  const { user } = useAuthContext();
  const [referenceTime] = useState(() => Date.now());
  const [dismissedStorageKey, setDismissedStorageKey] = useState<string | null>(null);

  const warningState = useMemo<PlanWarningState | null>(() => {
    if (!user || user.isSuperadmin) {
      return null;
    }

    const salon = user.salon;
    if (!salon?.id || !salon.planEndAt) {
      return null;
    }

    const planEndMs = new Date(salon.planEndAt).getTime();
    if (!Number.isFinite(planEndMs)) {
      return null;
    }

    const hoursLeft = (planEndMs - referenceTime) / (1000 * 60 * 60);
    if (hoursLeft <= 0) {
      return null;
    }

    const dueThresholds = WARNING_THRESHOLDS_HOURS.filter(
      (threshold) => hoursLeft <= threshold,
    );
    if (dueThresholds.length === 0) {
      return null;
    }

    const thresholdHours = Math.min(...dueThresholds);
    return {
      storageKey: `plan-expiry-warning:${salon.id}:${salon.planEndAt}:${thresholdHours}`,
      thresholdHours,
      hoursLeft: Math.ceil(hoursLeft),
      isTrial: salon.isOnFreeTrial === true,
    };
  }, [referenceTime, user]);

  const handleDismiss = () => {
    if (!warningState) {
      return;
    }

    localStorage.setItem(warningState.storageKey, "dismissed");
    setDismissedStorageKey(warningState.storageKey);
  };

  if (!warningState) {
    return null;
  }

  const isDismissed =
    dismissedStorageKey === warningState.storageKey ||
    localStorage.getItem(warningState.storageKey) === "dismissed";
  if (isDismissed) {
    return null;
  }

  const thresholdLabel = resolveThresholdLabel(warningState.thresholdHours);

  return (
    <AlertDialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleDismiss();
          return;
        }
      }}
    >
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {warningState.isTrial
              ? "Votre essai gratuit se termine bientot"
              : "Votre abonnement se termine bientot"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {warningState.isTrial ? (
              <>
                Votre essai gratuit arrive a expiration dans moins de{" "}
                <strong>{thresholdLabel}</strong>. Activez votre abonnement pour
                eviter toute interruption.
              </>
            ) : (
              <>
                Votre abonnement expire dans moins de{" "}
                <strong>{thresholdLabel}</strong>. Renouvelez maintenant pour
                conserver vos acces sans interruption.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {warningState.isTrial ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-medium">Ce que vous risquez de perdre:</p>
            <ul className="mt-2 list-disc space-y-1 ps-5">
              <li>Rappels WhatsApp automatiques</li>
              <li>Tableau analytique avance</li>
              <li>Support prioritaire</li>
            </ul>
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Temps restant estime: {warningState.hoursLeft} heure(s)
        </p>

        <AlertDialogFooter className="gap-2">
          <Button variant="outline" asChild onClick={handleDismiss}>
            <a href="mailto:support@beautiq-app.com?subject=Renouvellement%20abonnement%20Beautiq">
              Contacter le support
            </a>
          </Button>
          <Button asChild onClick={handleDismiss}>
            <Link to={ROUTES.SALON_SETTINGS}>Gerer mon abonnement</Link>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
