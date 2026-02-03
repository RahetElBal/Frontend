import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Clock, Save, Calendar, Heart } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { SalonSettingsExtended, Salon, Service } from "@/types/entities";
import type { PaginatedResponse } from "@/types";
import { usePost } from "@/hooks/usePost";
import { useUser } from "@/hooks/useUser";
import { useGet } from "@/hooks/useGet";
import { GeneralSettings } from "./components/general-settings";
import { WorkingHoursSettings } from "./components/working-hours-settings";
import { BookingSettings } from "./components/booking-settings";
import { LoyaltySettings } from "./components/loyalty-settings";

type SettingsTab = "general" | "booking" | "hours" | "loyalty";

const defaultSettings: Partial<SalonSettingsExtended> = {
  currency: "EUR",
  timezone: "Europe/Paris",
  language: "fr",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  bookingSlotDuration: 15,
  bookingLeadTime: 0,
  bookingWindowDays: 30,
  cancellationDeadline: 24,
  allowOnlineBooking: true,
  requireDeposit: false,
  depositAmount: undefined,
  depositPercentage: undefined,
  sendAppointmentConfirmation: true,
  sendAppointmentReminder: true,
  reminderHoursBefore: 24,
  sendBirthdayGreeting: false,
  sendReviewRequest: false,
  reviewRequestHoursAfter: 24,
  taxEnabled: true,
  taxRate: 20,
  pricesIncludeTax: true,
  taxNumber: "",
  loyaltyEnabled: false,
  loyaltyPointsPerCurrency: 1,
  loyaltyPointValue: 0.01,
  loyaltyMinimumRedemption: 100,
  loyaltyRewardServiceId: "",
  loyaltyRewardDiscountType: "percent",
  loyaltyRewardDiscountValue: 10,
  receiptHeader: "",
  receiptFooter: "",
  showStaffOnReceipt: true,
  invoicePrefix: "INV-",
  invoiceNextNumber: 1,
  workingHours: {
    monday: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
    tuesday: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
    wednesday: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
    thursday: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
    friday: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
    saturday: { isOpen: true, openTime: "09:00", closeTime: "17:00" },
    sunday: { isOpen: false, openTime: "09:00", closeTime: "18:00" },
  },
};

export function SalonSettingsPage() {
  const { t } = useTranslation();
  const { salon: userSalon } = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [hasChanges, setHasChanges] = useState(false);

  const { data: fetchedSalon } = useGet<Salon>("salons", {
    id: userSalon?.id,
    enabled: !!userSalon?.id,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });

  // Use latest salon settings when available
  const currentSalon = fetchedSalon || userSalon;

  // Settings are stored within the salon entity
  const settings = currentSalon?.settings as SalonSettingsExtended | undefined;
  const isLoading = !currentSalon;
  const { data: servicesData } = useGet<PaginatedResponse<Service>>(
    "services",
    {
      params: { salonId: currentSalon?.id, perPage: 200 },
      enabled: !!currentSalon?.id,
    }
  );
  const services = Array.isArray(servicesData?.data)
    ? servicesData.data
    : Array.isArray(servicesData)
    ? servicesData
    : [];

  const baseSettings = useMemo(() => {
    const mergedWorkingHours = {
      ...defaultSettings.workingHours,
      ...(settings?.workingHours ?? {}),
    };
    return {
      ...defaultSettings,
      ...(settings ?? {}),
      workingHours: mergedWorkingHours,
    };
  }, [settings]);
  const [draftSettings, setDraftSettings] =
    useState<Partial<SalonSettingsExtended>>({});
  const formData = useMemo(
    () => ({
      ...baseSettings,
      ...draftSettings,
      workingHours: {
        ...baseSettings.workingHours,
        ...(draftSettings.workingHours ?? {}),
      },
    }),
    [baseSettings, draftSettings],
  );

  // Save mutation - update salon settings via PATCH /salons/{id}
  const saveSettings = usePost<
    Salon,
    { settings: Partial<SalonSettingsExtended> }
  >("salons", {
    id: currentSalon?.id,
    method: "PATCH",
    invalidateQueries: ["salons", "auth"],
    onSuccess: () => {
      toast.success(t("salonSettings.saved"));
      setHasChanges(false);
      setDraftSettings({});
    },
    onError: (error) => toast.error(error.message || t("common.error")),
  });

  const updateField = <K extends keyof SalonSettingsExtended>(
    field: K,
    value: SalonSettingsExtended[K]
  ) => {
    setDraftSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const updateWorkingHours = (
    day: string,
    field: string,
    value: string | boolean
  ) => {
    const currentDayHours = formData.workingHours?.[day] || {
        isOpen: false,
        openTime: "09:00",
        closeTime: "18:00",
      };
    setDraftSettings((prev) => ({
      ...prev,
      workingHours: {
        ...baseSettings.workingHours,
        ...(prev.workingHours ?? {}),
        [day]: {
          isOpen: currentDayHours.isOpen,
          openTime: currentDayHours.openTime,
          closeTime: currentDayHours.closeTime,
          breakStart: currentDayHours.breakStart,
          breakEnd: currentDayHours.breakEnd,
          [field]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettings.mutate({ settings: formData });
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "general", label: t("salonSettings.tabs.general"), icon: Building2 },
    { id: "hours", label: t("salonSettings.tabs.hours"), icon: Clock },
    { id: "booking", label: t("salonSettings.tabs.booking"), icon: Calendar },
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
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
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
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">{t("common.loading")}</p>
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
              {activeTab === "loyalty" && (
                <LoyaltySettings
                  formData={formData}
                  updateField={updateField}
                  services={services}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
