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
import {
  defaultLoyaltySettings,
  extractArray,
  deriveLoyaltySettings,
  calculateTotalPointsIssued,
  calculateTotalPointsRedeemed,
  getTopLoyaltyClients,
  countActiveMembers,
  getRedeemableClients,
  getRedeemableServices,
  findClientById,
  findServiceById,
  canClientRedeem,
  validateRedemption,
  createRedemptionPayload,
} from "./utils";

export function LoyaltyPage() {
  const { t } = useTranslation();
  /* cSpell:ignore Superadmin */
  const { salon, isAdmin, isSuperadmin } = useUser();
  const { formatCurrency } = useLanguage();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [redeemClientId, setRedeemClientId] = useState("");
  const [redeemServiceId, setRedeemServiceId] = useState("");
  const [settings, setSettings] = useState<Partial<SalonSettingsExtended>>({
    ...defaultLoyaltySettings,
  });
  const salonId = salon?.id;
  const canRedeem = isAdmin || isSuperadmin;

  const { data: clientsData } = useGet<PaginatedResponse<Client>>("clients", {
    params: { salonId, perPage: 100 },
    enabled: !!salonId,
  });

  const { data: salesData } = useGet<PaginatedResponse<Sale>>("sales", {
    params: { salonId, perPage: 100, sortBy: "createdAt", sortOrder: "desc" },
    enabled: !!salonId,
    staleTime: 1000 * 60,
    select: normalizeSalesResponse,
  });

  const { data: servicesData } = useGet<PaginatedResponse<Service>>(
    "services",
    {
      params: { salonId, perPage: 100 },
      enabled: !!salonId,
    },
  );

  const clients = useMemo(
    () => extractArray<Client>(clientsData),
    [clientsData],
  );
  const salesStats = useMemo(() => extractArray<Sale>(salesData), [salesData]);
  const sales = useMemo(() => salesStats.slice(0, 10), [salesStats]);
  const services = useMemo(
    () => extractArray<Service>(servicesData),
    [servicesData],
  );

  const derivedSettings = useMemo(() => deriveLoyaltySettings(salon), [salon]);

  const totalPointsIssued = useMemo(
    () => calculateTotalPointsIssued(clients),
    [clients],
  );

  const totalPointsRedeemed = useMemo(
    () =>
      calculateTotalPointsRedeemed(
        salesStats,
        Number(derivedSettings.loyaltyPointValue || 0),
      ),
    [salesStats, derivedSettings.loyaltyPointValue],
  );

  const topClients = useMemo(() => getTopLoyaltyClients(clients, 5), [clients]);

  const activeMembers = useMemo(() => countActiveMembers(clients), [clients]);

  const redeemableClients = useMemo(
    () => getRedeemableClients(clients),
    [clients],
  );

  const selectedRedeemClient = useMemo(
    () => findClientById(redeemableClients, redeemClientId),
    [redeemableClients, redeemClientId],
  );

  const redeemableServices = useMemo(
    () => getRedeemableServices(services),
    [services],
  );

  const selectedRedeemService = useMemo(
    () => findServiceById(redeemableServices, redeemServiceId),
    [redeemableServices, redeemServiceId],
  );

  const requiredRedeemPoints = Number(
    derivedSettings.loyaltyMinimumRedemption || 0,
  );

  const canSubmitRedeem = canClientRedeem(
    selectedRedeemClient,
    selectedRedeemService,
    !!derivedSettings.loyaltyEnabled,
    requiredRedeemPoints,
  );

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
    },
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

    const validation = validateRedemption(
      selectedRedeemClient,
      selectedRedeemService,
      !!derivedSettings.loyaltyEnabled,
      requiredRedeemPoints,
    );

    if (!validation.isValid) {
      if (validation.errorParams) {
        toast.error(
          t(validation.errorKey!, {
            field: t(validation.errorParams.field),
          }),
        );
      } else {
        toast.error(t(validation.errorKey!));
      }
      return;
    }

    createRedeemSale(
      createRedemptionPayload(
        salonId,
        selectedRedeemClient!,
        selectedRedeemService!,
      ),
    );
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
                  setRedeemServiceId(
                    derivedSettings.loyaltyRewardServiceId || "",
                  );
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
                  totalPointsRedeemed *
                    (derivedSettings.loyaltyPointValue || 0),
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
                              : "bg-muted text-muted-foreground",
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
            <DialogDescription>
              {t("loyalty.redeemPointsDescription")}
            </DialogDescription>
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
                    placeholder={t(
                      "salonSettings.loyaltyRewardServicePlaceholder",
                    )}
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
                  {t("loyalty.availablePoints")}:{" "}
                  {selectedRedeemClient.loyaltyPoints}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRedeemModalOpen(false)}
            >
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
