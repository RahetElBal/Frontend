import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, TrendingUp, Settings, Award } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { normalizeSalesResponse } from "@/utils/normalize-sales";

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
  const { salon, isAdmin, isSuperadmin } = useUser();
  const { formatCurrency } = useLanguage();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [redeemClientId, setRedeemClientId] = useState("");
  const [redeemServiceId, setRedeemServiceId] = useState("");
  const [settings, setSettings] = useState<Partial<SalonSettingsExtended>>({
    ...defaultSettings,
  });
  const salonId = salon?.id;
  const canRedeem = isAdmin || isSuperadmin;

  const { data: clientsData } = useGet<PaginatedResponse<Client>>("clients", {
    params: { salonId, perPage: 200 },
    enabled: !!salonId,
  });

  const { data: salesData } = useGet<PaginatedResponse<Sale>>("sales", {
    params: { salonId, perPage: 10, sortBy: "createdAt", sortOrder: "desc" },
    enabled: !!salonId,
    select: normalizeSalesResponse,
  });

  const { data: salesStatsData } = useGet<PaginatedResponse<Sale>>("sales", {
    params: { salonId, perPage: 200, sortBy: "createdAt", sortOrder: "desc" },
    enabled: !!salonId,
    staleTime: 1000 * 60,
    select: normalizeSalesResponse,
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
  const salesStats = extractArray<Sale>(salesStatsData);
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
    const hasRedeemedPointsField = salesStats.some(
      (sale) => sale.redeemedPoints !== undefined && sale.redeemedPoints !== null,
    );
    if (hasRedeemedPointsField) {
      return salesStats.reduce(
        (sum, sale) => sum + Number(sale.redeemedPoints || 0),
        0,
      );
    }
    const pointValue = Number(derivedSettings.loyaltyPointValue || 0);
    if (pointValue <= 0) return 0;
    const totalDiscount = salesStats.reduce(
      (sum, sale) => sum + Number(sale.discount || 0),
      0,
    );
    return Math.round(totalDiscount / pointValue);
  }, [salesStats, derivedSettings.loyaltyPointValue]);

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

  const redeemableClients = useMemo(
    () => clients.filter((client) => (client.loyaltyPoints || 0) > 0),
    [clients],
  );

  const selectedRedeemClient = useMemo(
    () => redeemableClients.find((client) => client.id === redeemClientId) || null,
    [redeemableClients, redeemClientId],
  );

  const redeemableServices = useMemo(
    () => services.filter((service) => service.isActive !== false),
    [services],
  );

  const selectedRedeemService = useMemo(
    () => redeemableServices.find((service) => service.id === redeemServiceId) || null,
    [redeemableServices, redeemServiceId],
  );

  const requiredRedeemPoints = Number(
    derivedSettings.loyaltyMinimumRedemption || 0,
  );
  const canSubmitRedeem =
    !!selectedRedeemClient &&
    !!selectedRedeemService &&
    !!derivedSettings.loyaltyEnabled &&
    requiredRedeemPoints > 0 &&
    (selectedRedeemClient?.loyaltyPoints || 0) >= requiredRedeemPoints;

  const { mutate: createRedeemSale, isPending: isRedeeming } = usePost<
    Sale,
    {
      salonId: string;
      clientId: string;
      redeemLoyalty: boolean;
      redeemServiceId: string;
      items: {
        type: "service";
        itemId: string;
        quantity: number;
        price: number;
      }[];
    }
  >("sales", {
    invalidateQueries: ["sales", "clients"],
    onSuccess: () => {
      toast.success(t("loyalty.redeemSuccess"));
      setIsRedeemModalOpen(false);
      setRedeemClientId("");
      setRedeemServiceId("");
    },
    onError: (error) => toast.error(error.message || t("common.error")),
  });

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

  const handleRedeemPoints = () => {
    if (!salonId) {
      toast.error(t("common.error"));
      return;
    }
    if (!selectedRedeemClient) {
      toast.error(
        t("validation.required", { field: t("loyalty.paymentClient") }),
      );
      return;
    }
    if (!derivedSettings.loyaltyEnabled || requiredRedeemPoints <= 0) {
      toast.error(t("loyalty.redeemConfigMissing"));
      return;
    }
    if (!selectedRedeemService) {
      toast.error(
        t("validation.required", { field: t("salonSettings.loyaltyRewardService") }),
      );
      return;
    }
    const availablePoints = selectedRedeemClient.loyaltyPoints || 0;
    if (availablePoints < requiredRedeemPoints) {
      toast.error(t("loyalty.redeemNotEligible"));
      return;
    }

    createRedeemSale({
      salonId,
      clientId: selectedRedeemClient.id,
      redeemLoyalty: true,
      redeemServiceId: selectedRedeemService.id,
      items: [
        {
          type: "service",
          itemId: selectedRedeemService.id,
          quantity: 1,
          price: Number(selectedRedeemService.price || 0),
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.loyalty")}
        description={t("loyalty.description")}
        actions={
          <div className="flex flex-wrap gap-2">
            {canRedeem && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setRedeemClientId("");
                  setRedeemServiceId(derivedSettings.loyaltyRewardServiceId || "");
                  setIsRedeemModalOpen(true);
                }}
              >
                <Award className="h-4 w-4" />
                {t("loyalty.redeemPoints")}
              </Button>
            )}
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
          </div>
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

      <Dialog open={isRedeemModalOpen} onOpenChange={setIsRedeemModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("loyalty.redeemPoints")}</DialogTitle>
            <DialogDescription>{t("loyalty.redeemPointsDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("loyalty.paymentClient")}</Label>
              <Select value={redeemClientId} onValueChange={setRedeemClientId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("loyalty.selectClient")} />
                </SelectTrigger>
                <SelectContent>
                  {redeemableClients.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      {t("clients.noClients")}
                    </div>
                  ) : (
                    redeemableClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName} (
                        {client.loyaltyPoints} {t("loyalty.points")})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("salonSettings.loyaltyRewardService")}</Label>
              <Select
                value={redeemServiceId}
                onValueChange={setRedeemServiceId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("salonSettings.loyaltyRewardServicePlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {redeemableServices.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      {t("services.services")} - {t("common.noResults")}
                    </div>
                  ) : (
                    redeemableServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.duration} min)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("loyalty.pointsToRedeem")}</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={requiredRedeemPoints || ""}
                disabled
              />
              {selectedRedeemClient && (
                <p className="text-xs text-muted-foreground">
                  {t("loyalty.availablePoints")}: {selectedRedeemClient.loyaltyPoints}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRedeemModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleRedeemPoints}
              disabled={isRedeeming || !canSubmitRedeem}
            >
              {isRedeeming ? t("common.loading") : t("loyalty.redeem")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
