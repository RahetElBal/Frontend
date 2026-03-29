import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, TrendingUp, Award } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import { Spinner } from "@/components/spinner";
import { LoadingPanel } from "@/components/loading-panel";
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
import { useModalState } from "@/contexts/ModalsProvider";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useSalonLoyaltyData } from "@/hooks/useSalonLoyaltyData";
import { useSalonServices } from "@/hooks/useSalonServices";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { usePost } from "@/hooks/usePost";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { useSalonDateTime } from "@/hooks/useSalonDateTime";
import type { Sale } from "@/pages/user/sales/types";
import type { Salon } from "@/pages/admin/salon/types";
import {
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
} from "./components/utils";

export function LoyaltyPage() {
  const { t } = useTranslation();
  /* cSpell:ignore Superadmin */
  const { salon, isAdmin, isSuperadmin } = useUser();
  const { formatCurrency } = useLanguage();
  const redeemModal = useModalState("admin-loyalty-redeem");
  const [redeemClientId, setRedeemClientId] = useState("");
  const [redeemServiceId, setRedeemServiceId] = useState("");
  const salonId = salon?.id;
  const canRedeem = isAdmin || isSuperadmin;
  const shouldLoadData = !!salonId;
  const shouldLoadServices = !!salonId && canRedeem && redeemModal.isOpen;
  const { settings: salonSettings } = useSalonSettings(salonId, {
    enabled: shouldLoadData,
  });
  const { formatDate } = useSalonDateTime({ settings: salonSettings });

  const { services, isLoading: isServicesLoading } = useSalonServices(salonId, {
    enabled: shouldLoadServices,
  });
  const {
    clients,
    sales: salesStats,
    isClientsLoading,
    isSalesLoading,
  } = useSalonLoyaltyData(salonId, {
    enabled: shouldLoadData,
    includeClients: true,
    includeSales: true,
  });
  const sales = useMemo(() => salesStats.slice(0, 10), [salesStats]);
  const showLoyaltyLoading =
    (isClientsLoading || isSalesLoading) &&
    clients.length === 0 &&
    salesStats.length === 0;

  const salonWithLatestSettings = useMemo(
    () =>
      salon
        ? {
            ...salon,
            settings: {
              ...(salon.settings || {}),
              ...(salonSettings || {}),
            },
          }
        : null,
    [salon, salonSettings],
  );

  const derivedSettings = useMemo(
    () => deriveLoyaltySettings(salonWithLatestSettings as Salon | null),
    [salonWithLatestSettings],
  );

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

  const closeRedeemModal = () => {
    redeemModal.close();
    setRedeemClientId("");
    setRedeemServiceId("");
  };

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
    invalidate: ["sales", "clients"],
    onSuccess: () => {
      toast.success(t("loyalty.redeemSuccess"));
      closeRedeemModal();
    },
    onError: (error) => toast.error(error.message || t("common.error")),
  });

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
                  redeemModal.open();
                }}
              >
                <Award className="h-4 w-4" />
                {t("loyalty.redeemPoints")}
              </Button>
            )}
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
              {showLoyaltyLoading ? (
                <div className="flex items-center h-6">
                  <Spinner size="sm" />
                </div>
              ) : (
                <p className="text-xl font-bold">{activeMembers}</p>
              )}
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
              {showLoyaltyLoading ? (
                <div className="flex items-center h-6">
                  <Spinner size="sm" />
                </div>
              ) : (
                <p className="text-xl font-bold">
                  {totalPointsIssued.toLocaleString()}
                </p>
              )}
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
              {showLoyaltyLoading ? (
                <div className="flex items-center h-6">
                  <Spinner size="sm" />
                </div>
              ) : (
                <p className="text-xl font-bold">
                  {totalPointsRedeemed.toLocaleString()}
                </p>
              )}
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
              {showLoyaltyLoading ? (
                <div className="flex items-center h-6">
                  <Spinner size="sm" />
                </div>
              ) : (
                <p className="text-xl font-bold">
                  {formatCurrency(
                    totalPointsRedeemed *
                      (derivedSettings.loyaltyPointValue || 0),
                  )}
                </p>
              )}
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
          {showLoyaltyLoading ? (
            <LoadingPanel label={t("common.loading")} />
          ) : topClients.length > 0 ? (
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
          <div className="border rounded-lg overflow-hidden">
            <div className="space-y-3 p-4 md:hidden">
              {showLoyaltyLoading ? (
                <LoadingPanel label={t("common.loading")} className="py-6" />
              ) : sales.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {t("loyalty.noPayments")}
                </div>
              ) : (
                sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="space-y-3 rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        {t("loyalty.paymentDate")}
                      </p>
                      <p className="text-sm">
                        {formatDate(sale.createdAt)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        {t("loyalty.paymentClient")}
                      </p>
                      <p className="text-sm">
                        {sale.client
                          ? `${sale.client.firstName} ${sale.client.lastName}`
                          : t("common.unknown")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        {t("loyalty.paymentStatus")}
                      </p>
                      <Badge variant="default">{sale.status}</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        {t("loyalty.paymentTotal")}
                      </p>
                      <p className="text-sm font-semibold">
                        {formatCurrency(Number(sale.total || 0))}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="hidden md:block">
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
                  {showLoyaltyLoading ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <LoadingPanel
                          label={t("common.loading")}
                          className="py-6"
                        />
                      </TableCell>
                    </TableRow>
                  ) : sales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                        {t("loyalty.noPayments")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {formatDate(sale.createdAt)}
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </div>

      <Dialog
        open={redeemModal.isOpen}
        onOpenChange={(open) => {
          if (open) {
            redeemModal.open();
            return;
          }

          closeRedeemModal();
        }}
      >
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
                  {isServicesLoading ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      {t("common.loading")}
                    </div>
                  ) : redeemableServices.length === 0 ? (
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
            <Button variant="outline" onClick={closeRedeemModal}>
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
