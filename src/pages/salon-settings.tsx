import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Clock,
  Bell,
  Receipt,
  Heart,
  Save,
  Calendar,
  Percent,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { SalonSettingsExtended, DayOfWeek, Salon } from "@/types/entities";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useUser } from "@/hooks/useUser";

const DAYS: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const TIMEZONES = [
  "Europe/Paris",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Africa/Algiers",
];

const CURRENCIES = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "DZD", symbol: "د.ج", name: "Algerian Dinar" },
];

type SettingsTab =
  | "general"
  | "booking"
  | "notifications"
  | "tax"
  | "loyalty"
  | "receipt"
  | "hours";

export function SalonSettingsPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch salons
  const { data: salonsData } = useGet<Salon[]>("salons");

  // Get current user's salon
  const currentSalon = salonsData?.find((salon) => salon.ownerId === user?.id);

  // Fetch settings
  const { data: settings, isLoading } =
    useGet<SalonSettingsExtended>("salon-settings");

  // Default settings state
  const [formData, setFormData] = useState<Partial<SalonSettingsExtended>>({
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
  });

  // Update form when settings load - this is intentional to sync form with loaded data
  useEffect(() => {
    if (settings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(settings);
    }
  }, [settings]);

  // Save mutation
  const saveSettings = usePost<
    SalonSettingsExtended,
    Partial<SalonSettingsExtended>
  >("salon-settings", {
    method: "PATCH",
    onSuccess: () => {
      toast.success(t("salonSettings.saved"));
      setHasChanges(false);
    },
    onError: (error) => toast.error(error.message || t("common.error")),
  });

  const updateField = <K extends keyof SalonSettingsExtended>(
    field: K,
    value: SalonSettingsExtended[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const updateWorkingHours = (
    day: string,
    field: string,
    value: string | boolean,
  ) => {
    setFormData((prev) => {
      const currentDayHours = prev.workingHours?.[day] || {
        isOpen: false,
        openTime: "09:00",
        closeTime: "18:00",
      };
      return {
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [day]: {
            isOpen: currentDayHours.isOpen,
            openTime: currentDayHours.openTime,
            closeTime: currentDayHours.closeTime,
            breakStart: currentDayHours.breakStart,
            breakEnd: currentDayHours.breakEnd,
            [field]: value,
          },
        },
      };
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettings.mutate(formData);
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
    { id: "tax", label: t("salonSettings.tabs.tax"), icon: Percent },
    { id: "loyalty", label: t("salonSettings.tabs.loyalty"), icon: Heart },
    { id: "receipt", label: t("salonSettings.tabs.receipt"), icon: Receipt },
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
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">{t("common.loading")}</p>
            </Card>
          ) : (
            <>
              {activeTab === "general" && (
                <GeneralSettings
                  formData={formData}
                  updateField={updateField}
                  t={t}
                />
              )}
              {activeTab === "hours" && (
                <WorkingHoursSettings
                  formData={formData}
                  updateWorkingHours={updateWorkingHours}
                  t={t}
                />
              )}
              {activeTab === "booking" && (
                <BookingSettings
                  formData={formData}
                  updateField={updateField}
                  t={t}
                />
              )}
              {activeTab === "notifications" && (
                <NotificationSettings
                  formData={formData}
                  updateField={updateField}
                  t={t}
                />
              )}
              {activeTab === "tax" && (
                <TaxSettings
                  formData={formData}
                  updateField={updateField}
                  t={t}
                />
              )}
              {activeTab === "loyalty" && (
                <LoyaltySettings
                  formData={formData}
                  updateField={updateField}
                  t={t}
                />
              )}
              {activeTab === "receipt" && (
                <ReceiptSettings
                  formData={formData}
                  updateField={updateField}
                  t={t}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SETTINGS SECTIONS
// ============================================

interface SettingsSectionProps {
  formData: Partial<SalonSettingsExtended>;
  updateField: <K extends keyof SalonSettingsExtended>(
    field: K,
    value: SalonSettingsExtended[K],
  ) => void;
  t: ReturnType<typeof useTranslation>["t"];
}

function GeneralSettings({ formData, updateField, t }: SettingsSectionProps) {
  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {t("salonSettings.tabs.general")}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("salonSettings.currency")}</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => updateField("currency", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} - {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("salonSettings.timezone")}</Label>
          <Select
            value={formData.timezone}
            onValueChange={(value) => updateField("timezone", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("salonSettings.dateFormat")}</Label>
          <Select
            value={formData.dateFormat}
            onValueChange={(value) => updateField("dateFormat", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">
                DD/MM/YYYY (31/12/2024)
              </SelectItem>
              <SelectItem value="MM/DD/YYYY">
                MM/DD/YYYY (12/31/2024)
              </SelectItem>
              <SelectItem value="YYYY-MM-DD">
                YYYY-MM-DD (2024-12-31)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("salonSettings.timeFormat")}</Label>
          <Select
            value={formData.timeFormat}
            onValueChange={(value) =>
              updateField("timeFormat", value as "12h" | "24h")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24h (14:00)</SelectItem>
              <SelectItem value="12h">12h (2:00 PM)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}

interface WorkingHoursSettingsProps {
  formData: Partial<SalonSettingsExtended>;
  updateWorkingHours: (
    day: string,
    field: string,
    value: string | boolean,
  ) => void;
  t: ReturnType<typeof useTranslation>["t"];
}

function WorkingHoursSettings({
  formData,
  updateWorkingHours,
  t,
}: WorkingHoursSettingsProps) {
  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">{t("salonSettings.tabs.hours")}</h2>

      <div className="space-y-4">
        {DAYS.map((day) => {
          const hours = formData.workingHours?.[day];
          return (
            <div
              key={day}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border",
                hours?.isOpen ? "bg-background" : "bg-muted/50",
              )}
            >
              <div className="w-32">
                <p className="font-medium">{t(`days.${day}`)}</p>
              </div>

              <Switch
                checked={hours?.isOpen ?? false}
                onCheckedChange={(checked) =>
                  updateWorkingHours(day, "isOpen", checked)
                }
              />

              {hours?.isOpen && (
                <>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hours?.openTime || "09:00"}
                      onChange={(e) =>
                        updateWorkingHours(day, "openTime", e.target.value)
                      }
                      className="w-32"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="time"
                      value={hours?.closeTime || "18:00"}
                      onChange={(e) =>
                        updateWorkingHours(day, "closeTime", e.target.value)
                      }
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center gap-2 ms-4 text-sm text-muted-foreground">
                    <span>{t("salonSettings.break")}:</span>
                    <Input
                      type="time"
                      value={hours?.breakStart || ""}
                      onChange={(e) =>
                        updateWorkingHours(day, "breakStart", e.target.value)
                      }
                      className="w-28"
                      placeholder="--:--"
                    />
                    <span>-</span>
                    <Input
                      type="time"
                      value={hours?.breakEnd || ""}
                      onChange={(e) =>
                        updateWorkingHours(day, "breakEnd", e.target.value)
                      }
                      className="w-28"
                      placeholder="--:--"
                    />
                  </div>
                </>
              )}

              {!hours?.isOpen && (
                <span className="text-muted-foreground">
                  {t("salonSettings.closed")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function BookingSettings({ formData, updateField, t }: SettingsSectionProps) {
  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {t("salonSettings.tabs.booking")}
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">
              {t("salonSettings.allowOnlineBooking")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.allowOnlineBookingDescription")}
            </p>
          </div>
          <Switch
            checked={formData.allowOnlineBooking}
            onCheckedChange={(checked) =>
              updateField("allowOnlineBooking", checked)
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("salonSettings.slotDuration")}</Label>
            <Select
              value={String(formData.bookingSlotDuration)}
              onValueChange={(value) =>
                updateField("bookingSlotDuration", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("salonSettings.leadTime")}</Label>
            <Select
              value={String(formData.bookingLeadTime)}
              onValueChange={(value) =>
                updateField("bookingLeadTime", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">
                  {t("salonSettings.noLeadTime")}
                </SelectItem>
                <SelectItem value="1">1 {t("common.hour")}</SelectItem>
                <SelectItem value="2">2 {t("common.hours")}</SelectItem>
                <SelectItem value="24">24 {t("common.hours")}</SelectItem>
                <SelectItem value="48">48 {t("common.hours")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("salonSettings.bookingWindow")}</Label>
            <Select
              value={String(formData.bookingWindowDays)}
              onValueChange={(value) =>
                updateField("bookingWindowDays", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 {t("common.days")}</SelectItem>
                <SelectItem value="14">14 {t("common.days")}</SelectItem>
                <SelectItem value="30">30 {t("common.days")}</SelectItem>
                <SelectItem value="60">60 {t("common.days")}</SelectItem>
                <SelectItem value="90">90 {t("common.days")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("salonSettings.cancellationDeadline")}</Label>
            <Select
              value={String(formData.cancellationDeadline)}
              onValueChange={(value) =>
                updateField("cancellationDeadline", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("salonSettings.anytime")}</SelectItem>
                <SelectItem value="2">2 {t("common.hours")}</SelectItem>
                <SelectItem value="12">12 {t("common.hours")}</SelectItem>
                <SelectItem value="24">24 {t("common.hours")}</SelectItem>
                <SelectItem value="48">48 {t("common.hours")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">{t("salonSettings.requireDeposit")}</p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.requireDepositDescription")}
            </p>
          </div>
          <Switch
            checked={formData.requireDeposit}
            onCheckedChange={(checked) =>
              updateField("requireDeposit", checked)
            }
          />
        </div>

        {formData.requireDeposit && (
          <div className="grid gap-4 sm:grid-cols-2 ps-4">
            <div className="space-y-2">
              <Label>{t("salonSettings.depositAmount")}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.depositAmount || ""}
                onChange={(e) =>
                  updateField(
                    "depositAmount",
                    parseFloat(e.target.value) || undefined,
                  )
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("salonSettings.depositPercentage")}</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.depositPercentage || ""}
                onChange={(e) =>
                  updateField(
                    "depositPercentage",
                    parseInt(e.target.value) || undefined,
                  )
                }
                placeholder="0"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function NotificationSettings({
  formData,
  updateField,
  t,
}: SettingsSectionProps) {
  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {t("salonSettings.tabs.notifications")}
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">
              {t("salonSettings.appointmentConfirmation")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.appointmentConfirmationDescription")}
            </p>
          </div>
          <Switch
            checked={formData.sendAppointmentConfirmation}
            onCheckedChange={(checked) =>
              updateField("sendAppointmentConfirmation", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">
              {t("salonSettings.appointmentReminder")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.appointmentReminderDescription")}
            </p>
          </div>
          <Switch
            checked={formData.sendAppointmentReminder}
            onCheckedChange={(checked) =>
              updateField("sendAppointmentReminder", checked)
            }
          />
        </div>

        {formData.sendAppointmentReminder && (
          <div className="ps-4 space-y-2">
            <Label>{t("salonSettings.reminderTiming")}</Label>
            <Select
              value={String(formData.reminderHoursBefore)}
              onValueChange={(value) =>
                updateField("reminderHoursBefore", parseInt(value))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">
                  1 {t("common.hour")} {t("common.before")}
                </SelectItem>
                <SelectItem value="2">
                  2 {t("common.hours")} {t("common.before")}
                </SelectItem>
                <SelectItem value="24">
                  24 {t("common.hours")} {t("common.before")}
                </SelectItem>
                <SelectItem value="48">
                  48 {t("common.hours")} {t("common.before")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">{t("salonSettings.birthdayGreeting")}</p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.birthdayGreetingDescription")}
            </p>
          </div>
          <Switch
            checked={formData.sendBirthdayGreeting}
            onCheckedChange={(checked) =>
              updateField("sendBirthdayGreeting", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">{t("salonSettings.reviewRequest")}</p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.reviewRequestDescription")}
            </p>
          </div>
          <Switch
            checked={formData.sendReviewRequest}
            onCheckedChange={(checked) =>
              updateField("sendReviewRequest", checked)
            }
          />
        </div>
      </div>
    </Card>
  );
}

function TaxSettings({ formData, updateField, t }: SettingsSectionProps) {
  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">{t("salonSettings.tabs.tax")}</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">{t("salonSettings.taxEnabled")}</p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.taxEnabledDescription")}
            </p>
          </div>
          <Switch
            checked={formData.taxEnabled}
            onCheckedChange={(checked) => updateField("taxEnabled", checked)}
          />
        </div>

        {formData.taxEnabled && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("salonSettings.taxRate")} (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.taxRate || ""}
                  onChange={(e) =>
                    updateField("taxRate", parseFloat(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("salonSettings.taxNumber")}</Label>
                <Input
                  value={formData.taxNumber || ""}
                  onChange={(e) => updateField("taxNumber", e.target.value)}
                  placeholder="FR12345678901"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">
                  {t("salonSettings.pricesIncludeTax")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("salonSettings.pricesIncludeTaxDescription")}
                </p>
              </div>
              <Switch
                checked={formData.pricesIncludeTax}
                onCheckedChange={(checked) =>
                  updateField("pricesIncludeTax", checked)
                }
              />
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function LoyaltySettings({ formData, updateField, t }: SettingsSectionProps) {
  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {t("salonSettings.tabs.loyalty")}
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">{t("salonSettings.loyaltyEnabled")}</p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.loyaltyEnabledDescription")}
            </p>
          </div>
          <Switch
            checked={formData.loyaltyEnabled}
            onCheckedChange={(checked) =>
              updateField("loyaltyEnabled", checked)
            }
          />
        </div>

        {formData.loyaltyEnabled && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("salonSettings.pointsPerCurrency")}</Label>
              <Input
                type="number"
                min="1"
                value={formData.loyaltyPointsPerCurrency || ""}
                onChange={(e) =>
                  updateField(
                    "loyaltyPointsPerCurrency",
                    parseInt(e.target.value),
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("salonSettings.pointsPerCurrencyDescription")}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("salonSettings.pointValue")}</Label>
              <Input
                type="number"
                min="0"
                step="0.001"
                value={formData.loyaltyPointValue || ""}
                onChange={(e) =>
                  updateField("loyaltyPointValue", parseFloat(e.target.value))
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("salonSettings.pointValueDescription")}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("salonSettings.minimumRedemption")}</Label>
              <Input
                type="number"
                min="1"
                value={formData.loyaltyMinimumRedemption || ""}
                onChange={(e) =>
                  updateField(
                    "loyaltyMinimumRedemption",
                    parseInt(e.target.value),
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("salonSettings.minimumRedemptionDescription")}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function ReceiptSettings({ formData, updateField, t }: SettingsSectionProps) {
  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {t("salonSettings.tabs.receipt")}
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t("salonSettings.receiptHeader")}</Label>
          <Textarea
            value={formData.receiptHeader || ""}
            onChange={(e) => updateField("receiptHeader", e.target.value)}
            rows={3}
            placeholder={t("salonSettings.receiptHeaderPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("salonSettings.receiptFooter")}</Label>
          <Textarea
            value={formData.receiptFooter || ""}
            onChange={(e) => updateField("receiptFooter", e.target.value)}
            rows={3}
            placeholder={t("salonSettings.receiptFooterPlaceholder")}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">
              {t("salonSettings.showStaffOnReceipt")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("salonSettings.showStaffOnReceiptDescription")}
            </p>
          </div>
          <Switch
            checked={formData.showStaffOnReceipt}
            onCheckedChange={(checked) =>
              updateField("showStaffOnReceipt", checked)
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("salonSettings.invoicePrefix")}</Label>
            <Input
              value={formData.invoicePrefix || ""}
              onChange={(e) => updateField("invoicePrefix", e.target.value)}
              placeholder="INV-"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("salonSettings.nextInvoiceNumber")}</Label>
            <Input
              type="number"
              min="1"
              value={formData.invoiceNextNumber || ""}
              onChange={(e) =>
                updateField("invoiceNextNumber", parseInt(e.target.value))
              }
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
