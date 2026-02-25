import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Clock, Save, Heart, Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingPanel } from "@/components/loading-panel";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { SalonSettingsExtended, Salon, Service } from "@/types/entities";
import type { PaginatedResponse } from "@/types";
import { usePost } from "@/hooks/usePost";
import { useUser } from "@/hooks/useUser";
import { useGet, withParams } from "@/hooks/useGet";
import { ROUTES } from "@/constants/navigation";
import { GeneralSettings } from "./components/general-settings";
import { WorkingHoursSettings } from "./components/working-hours-settings";
import { LoyaltySettings } from "./components/loyalty-settings";
import { NotificationSettings } from "./components/notification-settings";
import {
  mergeWithDefaultSettings,
  createFieldUpdater,
  createWorkingHoursUpdater,
  mergeFormData,
} from "./utils";

type SettingsPage =
  | "general"
  | "hours"
  | "notifications"
  | "loyalty";

export function SalonSettingsPage() {
  const { t } = useTranslation();
  const { salon: userSalon } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [hasChanges, setHasChanges] = useState(false);
  const activePage = useMemo<SettingsPage>(() => {
    switch (location.pathname) {
      case ROUTES.SALON_SETTINGS_HOURS:
        return "hours";
      case ROUTES.SALON_SETTINGS_NOTIFICATIONS:
        return "notifications";
      case ROUTES.SALON_SETTINGS_LOYALTY:
        return "loyalty";
      case ROUTES.SALON_SETTINGS_GENERAL:
      default:
        return "general";
    }
  }, [location.pathname]);

  const { data: fetchedSalon } = useGet<Salon>(
    `salons/${userSalon?.id}`,
    {
      enabled: !!userSalon?.id,
      staleTime: 1000 * 60 * 10,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  // Use latest salon settings when available
  const currentSalon = fetchedSalon || userSalon;
  const normalizedPlanTier = String(currentSalon?.planTier || "standard").toLowerCase();
  const isReminderProEnabled =
    normalizedPlanTier === "pro" ||
    normalizedPlanTier === "all-in" ||
    normalizedPlanTier === "all_in" ||
    normalizedPlanTier === "allin";
  const isSocialPublishingProEnabled = isReminderProEnabled;

  // Settings are stored within the salon entity
  const settings = currentSalon?.settings as SalonSettingsExtended | undefined;
  const isLoading = !currentSalon;
  const { data: servicesData, isLoading: servicesLoading } = useGet<
    PaginatedResponse<Service>
  >(
    withParams("services", { salonId: currentSalon?.id, perPage: 10, compact: true }),
    {
      enabled: activePage === "loyalty" && !!currentSalon?.id,
      staleTime: 1000 * 60 * 30,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );
  const services = Array.isArray(servicesData?.data)
    ? servicesData.data
    : Array.isArray(servicesData)
      ? servicesData
      : [];

  const baseSettings = useMemo(
    () => mergeWithDefaultSettings(settings),
    [settings],
  );

  const [draftSettings, setDraftSettings] = useState<
    Partial<SalonSettingsExtended>
  >({});

  const formData = useMemo(
    () => mergeFormData(baseSettings, draftSettings),
    [baseSettings, draftSettings],
  );

  // Save mutation - update salon settings via PATCH /salons/{id}
  const saveSettings = usePost<
    Salon,
    { settings: Partial<SalonSettingsExtended> }
  >(`salons/${currentSalon?.id}`, {
    method: "PATCH",
    invalidate: ["salons", "auth"],
    onSuccess: () => {
      toast.success(t("salonSettings.saved"));
      setHasChanges(false);
      setDraftSettings({});
    },
    onError: (error) => toast.error(error.message || t("common.error")),
  });

  const updateField = createFieldUpdater(setDraftSettings, setHasChanges);

  const updateWorkingHours = createWorkingHoursUpdater(
    setDraftSettings,
    setHasChanges,
    baseSettings,
    formData,
  );

  const handleSave = () => {
    saveSettings.mutate({
      settings: isReminderProEnabled
        ? formData
        : {
            ...formData,
            sendAppointmentReminder: false,
            socialPublishingEnabled: false,
          },
    });
  };

  const tabs: {
    id: SettingsPage;
    href: string;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      id: "general",
      href: ROUTES.SALON_SETTINGS_GENERAL,
      label: t("salonSettings.tabs.general"),
      icon: Building2,
    },
    {
      id: "hours",
      href: ROUTES.SALON_SETTINGS_HOURS,
      label: t("salonSettings.tabs.hours"),
      icon: Clock,
    },
    {
      id: "notifications",
      href: ROUTES.SALON_SETTINGS_NOTIFICATIONS,
      label: t("salonSettings.tabs.notifications"),
      icon: Bell,
    },
    {
      id: "loyalty",
      href: ROUTES.SALON_SETTINGS_LOYALTY,
      label: t("salonSettings.tabs.loyalty"),
      icon: Heart,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.salonSettings")}
        description={
          currentSalon
            ? t("salonSettings.description", { salon: currentSalon.name })
            : t("salonSettings.description")
        }
        actions={
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveSettings.isPending}
          >
            <Save className="h-4 w-4 me-2" />
            {saveSettings.isPending ? t("common.loading") : t("common.save")}
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.href)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-start transition-colors",
                activePage === tab.id
                  ? "bg-accent-pink/10 text-accent-pink"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {isLoading ? (
            <Card className="p-6">
              <LoadingPanel label={t("common.loading")} />
            </Card>
          ) : (
            <>
              {activePage === "general" && (
                <GeneralSettings
                  formData={formData}
                  updateField={updateField}
                />
              )}
              {activePage === "hours" && (
                <WorkingHoursSettings
                  formData={formData}
                  updateWorkingHours={updateWorkingHours}
                />
              )}
              {activePage === "notifications" && (
                <NotificationSettings
                  formData={formData}
                  isReminderProEnabled={isReminderProEnabled}
                  isSocialPublishingProEnabled={isSocialPublishingProEnabled}
                  updateField={updateField}
                />
              )}
              {activePage === "loyalty" && (
                <LoyaltySettings
                  formData={formData}
                  updateField={updateField}
                  services={services}
                  isLoading={servicesLoading}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
