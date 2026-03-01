import { useEffect, useMemo, useState } from "react";
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
  planLabel: string;
}

function resolvePlanLabel(planTier?: string) {
  const normalized = String(planTier || "standard").toLowerCase();
  if (normalized === "pro") return "Pro";
  if (
    normalized === "all-in" ||
    normalized === "all_in" ||
    normalized === "allin"
  ) {
    return "All-In";
  }
  return "Standard";
}

function resolveThresholdLabel(hours: number) {
  if (hours === 168) return "7 jours";
  if (hours === 72) return "72 heures";
  if (hours === 48) return "48 heures";
  return `${hours} heures`;
}

export function PlanExpiryWarningModal() {
  const { user } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [warningState, setWarningState] = useState<PlanWarningState | null>(null);

  const computedWarning = useMemo<PlanWarningState | null>(() => {
    if (!user || user.isSuperadmin) return null;
    const salon = user.salon;
    if (!salon?.id || !salon.planEndAt) return null;

    const planEndMs = new Date(salon.planEndAt).getTime();
    if (!Number.isFinite(planEndMs)) return null;

    const hoursLeft = (planEndMs - Date.now()) / (1000 * 60 * 60);
    if (hoursLeft <= 0) return null;

    const dueThresholds = WARNING_THRESHOLDS_HOURS.filter(
      (threshold) => hoursLeft <= threshold,
    );
    if (dueThresholds.length === 0) return null;

    const thresholdHours = Math.min(...dueThresholds);
    const storageKey = `plan-expiry-warning:${salon.id}:${salon.planEndAt}:${thresholdHours}`;

    return {
      storageKey,
      thresholdHours,
      hoursLeft: Math.ceil(hoursLeft),
      isTrial: salon.isOnFreeTrial === true,
      planLabel: resolvePlanLabel(salon.planTier),
    };
  }, [user]);

  useEffect(() => {
    if (!computedWarning) {
      setWarningState(null);
      setOpen(false);
      return;
    }

    const alreadyDismissed =
      localStorage.getItem(computedWarning.storageKey) === "dismissed";
    if (alreadyDismissed) {
      setWarningState(null);
      setOpen(false);
      return;
    }

    setWarningState(computedWarning);
    setOpen(true);
  }, [computedWarning]);

  const handleDismiss = () => {
    if (warningState) {
      localStorage.setItem(warningState.storageKey, "dismissed");
    }
    setOpen(false);
  };

  if (!warningState) return null;

  const thresholdLabel = resolveThresholdLabel(warningState.thresholdHours);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleDismiss();
        } else {
          setOpen(true);
        }
      }}
    >
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {warningState.isTrial
              ? "Votre essai gratuit se termine bientôt"
              : "Votre offre se termine bientôt"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {warningState.isTrial ? (
              <>
                Votre essai gratuit ({warningState.planLabel}) arrive à expiration
                dans moins de <strong>{thresholdLabel}</strong>. Passez à une
                offre payante pour éviter l’interruption.
              </>
            ) : (
              <>
                Votre offre {warningState.planLabel} expire dans moins de{" "}
                <strong>{thresholdLabel}</strong>. Renouvelez maintenant pour
                conserver vos accès sans interruption.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {warningState.isTrial ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-medium">Ce que vous risquez de perdre:</p>
            <ul className="mt-2 list-disc space-y-1 ps-5">
              <li>Rappels WhatsApp automatiques</li>
              <li>Tableau analytique avancé</li>
              <li>Support prioritaire (prise en charge accélérée)</li>
            </ul>
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Temps restant estimé: {warningState.hoursLeft} heure(s)
        </p>

        <AlertDialogFooter className="gap-2">
          <Button
            variant="outline"
            asChild
            onClick={handleDismiss}
          >
            <a href="mailto:support@beautiq-app.com?subject=Renouvellement%20offre%20Beautiq">
              Contacter le support
            </a>
          </Button>
          <Button asChild onClick={handleDismiss}>
            <Link to={ROUTES.SALON_SETTINGS}>Mettre à niveau / payer</Link>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
