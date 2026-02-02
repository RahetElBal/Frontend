import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, TrendingUp, Settings } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import type {
  Client,
  Sale,
  Service,
  Salon,
  SalonSettings,
  SalonSettingsExtended,
} from "@/types/entities";
import type { PaginatedResponse } from "@/types";
import { LoyaltySettings } from "../salon-settings/components/loyalty-settings";
import type { SettingsSectionProps } from "../salon-settings/types";

const defaultSettings = {
  loyaltyEnabled: false,
  loyaltyPointsPerCurrency: 1,
  loyaltyPointValue: 0.01,
  loyaltyMinimumRedemption: 100,
  loyaltyRewardServiceId: "",
  loyaltyRewardDiscountType: "percent" as const,
  loyaltyRewardDiscountValue: 10,
};

const extractArray = <T,>(
  data: PaginatedResponse<T> | T[] | undefined
): T[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Array.isArray(data.data) ? data.data : [];
};

export function LoyaltyPage() {
  const { t } = useTranslation();
  const { salon } = useUser();
  const { formatCurrency } = useLanguage();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settings, setSettings] = useState<Partial<SalonSettingsExtended>>({
    ...defaultSettings,
  });
  const salonId = salon?.id;

  const { data: clientsData } = useGet<PaginatedResponse<Client>>("clients", {
    params: { salonId, perPage: 200 },
    enabled: !!salonId,
  });

  const { data: salesData } = useGet<PaginatedResponse<Sale>>("sales", {
    params: { salonId, perPage: 10, sortBy: "createdAt", sortOrder: "desc" },
    enabled: !!salonId,
  });

  const { data: servicesData } = useGet<PaginatedResponse<Service>>(
    "services",
    {
      params: { salonId, perPage: 200 },
      enabled: !!salonId,
    }
  );

  const clients = extractArray<Client>(clientsData);
  const sales = extractArray<Sale>(salesData);
  const services = extractArray<Service>(servicesData);

  const derivedSettings = useMemo<Partial<SalonSettingsExtended>>(
    () => ({
      ...defaultSettings,
      loyaltyEnabled: !!salon?.settings?.loyaltyEnabled,
      loyaltyPointsPerCurrency:
        salon?.settings?.loyaltyPointsPerCurrency ??
        defaultSettings.loyaltyPointsPerCurrency,
      loyaltyPointValue:
        salon?.settings?.loyaltyPointValue ?? defaultSettings.loyaltyPointValue,
      loyaltyMinimumRedemption:
        salon?.settings?.loyaltyMinimumRedemption ??
        defaultSettings.loyaltyMinimumRedemption,
      loyaltyRewardServiceId: salon?.settings?.loyaltyRewardServiceId || "",
      loyaltyRewardDiscountType:
        salon?.settings?.loyaltyRewardDiscountType ??
        defaultSettings.loyaltyRewardDiscountType,
      loyaltyRewardDiscountValue:
        salon?.settings?.loyaltyRewardDiscountValue ??
        defaultSettings.loyaltyRewardDiscountValue,
    }),
    [salon]
  );

  const totalPointsIssued = useMemo(
    () => clients.reduce((sum, client) => sum + (client.loyaltyPoints || 0), 0),
    [clients]
  );

  const totalPointsRedeemed = useMemo(() => {
    const pointValue = Number(derivedSettings.loyaltyPointValue || 0);
    if (pointValue <= 0) return 0;
    const totalDiscount = sales.reduce(
      (sum, sale) => sum + Number(sale.discount || 0),
      0
    );
    return Math.round(totalDiscount / pointValue);
  }, [sales, derivedSettings.loyaltyPointValue]);

  const topClients = useMemo(
    () =>
      [...clients]
        .sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0))
        .slice(0, 5),
    [clients]
  );

  const activeMembers = useMemo(
    () => clients.filter((client) => (client.loyaltyPoints || 0) > 0).length,
    [clients]
  );

  const updateField: SettingsSectionProps["updateField"] = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const saveSettings = usePost<Salon, { settings: Partial<SalonSettings> }>(
    "salons",
    {
      id: salonId,
      method: "PATCH",
      invalidateQueries: ["salons", "auth"],
      onSuccess: () => {
        toast.success(t("salonSettings.saved"));
        setIsSettingsModalOpen(false);
      },
      onError: (error) => toast.error(error.message || t("common.error")),
    }
  );

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonId) {
      toast.error(t("common.error"));
      return;
    }

    saveSettings.mutate({
      settings: {
        ...salon?.settings,
        loyaltyEnabled: settings.loyaltyEnabled,
        loyaltyPointsPerCurrency: settings.loyaltyPointsPerCurrency,
        loyaltyPointValue: settings.loyaltyPointValue,
        loyaltyMinimumRedemption: settings.loyaltyMinimumRedemption,
        loyaltyRewardServiceId: settings.loyaltyRewardServiceId,
        loyaltyRewardDiscountType: settings.loyaltyRewardDiscountType,
        loyaltyRewardDiscountValue: settings.loyaltyRewardDiscountValue,
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.loyalty")}
        description={t("loyalty.description")}
        actions={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setSettings(derivedSettings);
              setIsSettingsModalOpen(true);
            }}
          >
            <Settings className="h-4 w-4" />
            {t("loyalty.programSettings")}
          </Button>
        }
      />

      {/* Program Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent-pink/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-accent-pink" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("loyalty.activeMembers")}
              </p>
              <p className="text-xl font-bold">{activeMembers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("loyalty.pointsIssued")}
              </p>
              <p className="text-xl font-bold">
                {totalPointsIssued.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Heart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("loyalty.pointsRedeemed")}
              </p>
              <p className="text-xl font-bold">
                {totalPointsRedeemed.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Heart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("loyalty.redemptionValue")}
              </p>
              <p className="text-xl font-bold">
                {formatCurrency(
                  totalPointsRedeemed * (derivedSettings.loyaltyPointValue || 0)
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Loyalty Members */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("loyalty.topMembers")}
          </h2>
          {topClients.length > 0 ? (
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold",
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                          ? "bg-gray-200 text-gray-700"
                          : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">
                        {client.firstName} {client.lastName}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {t("loyalty.points")}
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="font-bold text-accent-pink">
                      {client.loyaltyPoints.toLocaleString()} pts
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(Number(client.totalSpent || 0))}{" "}
                      {t("loyalty.spent")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t("loyalty.noMembers")}</p>
            </div>
          )}
        </Card>

        {/* Recent Payments */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("loyalty.recentPayments")}
          </h2>
          {sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t("loyalty.noPayments")}</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("loyalty.paymentDate")}</TableHead>
                    <TableHead>{t("loyalty.paymentClient")}</TableHead>
                    <TableHead>{t("loyalty.paymentStatus")}</TableHead>
                    <TableHead className="text-right">
                      {t("loyalty.paymentTotal")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {sale.client
                          ? `${sale.client.firstName} ${sale.client.lastName}`
                          : t("common.unknown")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{sale.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(sale.total || 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      {/* Program Settings Modal */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>{t("loyalty.programSettings")}</DialogTitle>
            <DialogDescription>
              {t("loyalty.programDescription")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSettings}>
            <div className="py-4">
              <LoyaltySettings
                formData={settings}
                updateField={updateField}
                services={services}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSettingsModalOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit">{t("common.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
