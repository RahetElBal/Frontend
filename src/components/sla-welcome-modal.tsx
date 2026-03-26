import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppRole } from "@/constants/enum";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthContext } from "@/contexts/AuthProvider";
import { patch } from "@/lib/http";
import { toast } from "@/lib/toast";
import type { Salon } from "@/pages/admin/salon/types";

const SLA_VERSION = 1;

export function SlaWelcomeModal() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthContext();
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const salon = user?.salon;
  const shouldShow = useMemo(() => {
    if (!user || !salon) return false;
    if (user.role !== AppRole.ADMIN) return false;
    const acceptedVersion = salon.slaAcceptedVersion ?? 0;
    return !salon.slaAcceptedAt || acceptedVersion < SLA_VERSION;
  }, [user, salon]);

  const handleAccept = async () => {
    if (!salon || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updatedSalon = await patch<Salon, { version: number }>(
        `salons/${salon.id}/sla`,
        { version: SLA_VERSION },
      );

      updateUser({
        ...user,
        salon: {
          ...salon,
          ...updatedSalon,
        },
      });
      toast.success(t("sla.accepted"));
    } catch (error) {
      toast.error(t("sla.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shouldShow) return null;

  return (
    <AlertDialog open>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold">
            {t("sla.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {t("sla.subtitle")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
          <p className="text-sm text-foreground font-medium">
            {t("sla.welcomeHeadline")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("sla.description")}
          </p>
          <ul className="text-sm text-muted-foreground list-disc ps-5 space-y-1">
            <li>{t("sla.items.usage")}</li>
            <li>{t("sla.items.data")}</li>
            <li>{t("sla.items.security")}</li>
            <li>{t("sla.items.support")}</li>
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="sla-accept"
            checked={accepted}
            onCheckedChange={(value) => setAccepted(Boolean(value))}
          />
          <label
            htmlFor="sla-accept"
            className="text-sm text-muted-foreground"
          >
            {t("sla.acceptLabel")}
          </label>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleAccept}
            disabled={!accepted || isSubmitting}
          >
            {isSubmitting ? t("sla.processing") : t("sla.acceptButton")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
