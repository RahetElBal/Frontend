import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Clock, Save, Calendar, Heart, Bell } from "lucide-react";

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
import { GeneralSettings } from "./components/general-settings";
import { WorkingHoursSettings } from "./components/working-hours-settings";
import { BookingSettings } from "./components/booking-settings";
import { LoyaltySettings } from "./components/loyalty-settings";
import { NotificationSettings } from "./components/notification-settings";
import {
  mergeWithDefaultSettings,
  createFieldUpdater,
  createWorkingHoursUpdater,
  mergeFormData,
} from "./utils";

type SettingsTab =
  | "general"
  | "booking"
  | "hours"
  | "loyalty"
  | "notifications";

export function SalonSettingsPage() {
  const { t } = useTranslation();
  const { salon: userSalon } = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [hasChanges, setHasChanges] = useState(false);

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

  // Settings are stored within the salon entity
  const settings = currentSalon?.settings as SalonSettingsExtended | undefined;
  const isLoading = !currentSalon;
  const { data: servicesData, isLoading: servicesLoading } = useGet<
    PaginatedResponse<Service>
  >(
    withParams("services", { salonId: currentSalon?.id, perPage: 100, compact: true }),
    {
      enabled: activeTab === "loyalty" && !!currentSalon?.id,
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
    saveSettings.mutate({ settings: formData });
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "general", label: t("salonSettings.tabs.general"), icon: Building2 },
    { id: "hours", label: t("salonSettings.tabs.hours"), icon: Clock },
    { id: "booking", label: t("salonSettings.tabs.booking"), icon: Calendar },
    {
      id: "notifications",
      label: t("salonSettings.tabs.notifications"),
      icon: Bell,
    },
    { id: "loyalty", label: t("salonSettings.tabs.loyalty"), icon: Heart },
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
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-start transition-colors",
                activeTab === tab.id
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
              {activeTab === "general" && (
                <GeneralSettings
                  formData={formData}
                  updateField={updateField}
                />
              )}
              {activeTab === "hours" && (
                <WorkingHoursSettings
                  formData={formData}
                  updateWorkingHours={updateWorkingHours}
                />
              )}
              {activeTab === "booking" && (
                <BookingSettings
                  formData={formData}
                  updateField={updateField}
                />
              )}
              {activeTab === "notifications" && (
                <NotificationSettings
                  formData={formData}
                  updateField={updateField}
                />
              )}
              {activeTab === "loyalty" && (
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
