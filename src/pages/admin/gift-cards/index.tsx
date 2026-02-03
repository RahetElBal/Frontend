import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Gift, MoreHorizontal, Eye, Ban, Search, CheckCircle } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import { LoadingPanel } from "@/components/loading-panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GiftCardStatus } from "@/types/entities";
import type { GiftCard } from "@/types/entities";
import { cn } from "@/lib/utils";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { usePostAction } from "@/hooks/usePostAction";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import { toast } from "@/lib/toast";
import { giftCardStatusColors } from "./utils";

interface CreateGiftCardDto {
  salonId: string;
  value: number;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
}


export function GiftCardsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { user } = useUser();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [lookupCode, setLookupCode] = useState("");
  const [lookupResult, setLookupResult] = useState<GiftCard | null>(null);
  const [redeemAmount, setRedeemAmount] = useState<number>(0);
  const [formData, setFormData] = useState({
    value: 50,
    recipientName: "",
    recipientEmail: "",
    message: "",
  });

  const salonId = user?.salon?.id;

  // Fetch gift cards from API
  const { data: giftCards = [], isLoading } = useGet<GiftCard[]>(
    "gift-cards",
    {
      params: { salonId },
      enabled: !!salonId,
    },
  );

  // Create gift card mutation
  const createGiftCard = usePost<GiftCard, CreateGiftCardDto>("gift-cards", {
    invalidateQueries: ["gift-cards"],
    onSuccess: () => {
      toast.success(t("giftCards.createCard") + " - " + t("common.success"));
      setIsAddModalOpen(false);
      setFormData({ value: 50, recipientName: "", recipientEmail: "", message: "" });
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Lookup gift card by code - GET /gift-cards/lookup/{code}
  const { refetch: lookupGiftCard, isFetching: isLookingUp } = useGet<GiftCard>(
    `gift-cards/lookup/${lookupCode}`,
    {
      params: { salonId },
      enabled: false, // Manual trigger
      onSuccess: (data) => {
        setLookupResult(data);
      },
      onError: () => {
        toast.error(t("giftCards.notFound"));
        setLookupResult(null);
      },
    },
  );

  // Redeem gift card - POST /gift-cards/{code}/redeem
  const { mutate: redeemGiftCard, isPending: isRedeeming } = usePostAction<
    GiftCard,
    { amount: number }
  >("gift-cards", {
    id: lookupResult?.code,
    action: "redeem",
    invalidateQueries: ["gift-cards"],
    showSuccessToast: true,
    successMessage: t("giftCards.redeemed"),
    onSuccess: (data) => {
      setLookupResult(data);
      setRedeemAmount(0);
    },
  });

  const handleLookup = () => {
    if (!lookupCode.trim()) {
      toast.error(t("giftCards.enterCode"));
      return;
    }
    lookupGiftCard();
  };

  const handleRedeem = () => {
    if (redeemAmount <= 0) {
      toast.error(t("giftCards.enterAmount"));
      return;
    }
    if (lookupResult && redeemAmount > lookupResult.currentValue) {
      toast.error(t("giftCards.insufficientBalance"));
      return;
    }
    redeemGiftCard({ amount: redeemAmount });
  };

  const closeLookupModal = () => {
    setIsLookupModalOpen(false);
    setLookupCode("");
    setLookupResult(null);
    setRedeemAmount(0);
  };

  const totalValue = giftCards
    .filter((gc) => gc.status === GiftCardStatus.ACTIVE)
    .reduce((sum, gc) => sum + gc.currentValue, 0);
  const activeCount = giftCards.filter(
    (gc) => gc.status === GiftCardStatus.ACTIVE,
  ).length;
  const redeemedCount = giftCards.filter(
    (gc) => gc.status === GiftCardStatus.REDEEMED,
  ).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonId) {
      toast.error(t("common.error"));
      return;
    }
    createGiftCard.mutate({
      ...formData,
      salonId,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.giftCards")}
        description={t("giftCards.description")}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setIsLookupModalOpen(true)}>
              <Search className="h-4 w-4" />
              {t("giftCards.lookup")}
            </Button>
            <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("giftCards.createCard")}
            </Button>
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("giftCards.outstandingValue")}
          </p>
          <p className="text-2xl font-bold text-accent-pink">
            {formatCurrency(totalValue)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("giftCards.activeCards")}
          </p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("giftCards.redeemedCards")}
          </p>
          <p className="text-2xl font-bold">{redeemedCount}</p>
        </Card>
      </div>

      {/* Gift Cards Grid */}
      {isLoading ? (
        <LoadingPanel label={t("common.loading")} />
      ) : giftCards.length === 0 ? (
        <Card className="p-12 text-center">
          <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t("giftCards.noCards")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t("giftCards.noCardsDescription")}
          </p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 me-2" />
            {t("giftCards.createCard")}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {giftCards.map((giftCard) => {
            const percentUsed =
              ((giftCard.initialValue - giftCard.currentValue) /
                giftCard.initialValue) *
              100;

            return (
              <Card
                key={giftCard.id}
                className={cn(
                  "overflow-hidden transition-shadow hover:shadow-md",
                  giftCard.status !== GiftCardStatus.ACTIVE && "opacity-60",
                )}
              >
                <div className="bg-linear-to-r from-accent-pink to-accent-blue p-4 text-white">
                  <div className="flex items-center justify-between">
                    <Gift className="h-6 w-6" />
                    <Badge
                      variant={giftCardStatusColors[giftCard.status]}
                      className="bg-white/20 text-white border-none"
                    >
                      {giftCard.status}
                    </Badge>
                  </div>
                  <p className="mt-4 font-mono text-lg tracking-wider">
                    {giftCard.code}
                  </p>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("giftCards.balance")}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(giftCard.currentValue)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      / {formatCurrency(giftCard.initialValue)}
                    </p>
                  </div>

                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-pink transition-all"
                      style={{ width: `${100 - percentUsed}%` }}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 me-2" />
                          {t("giftCards.viewHistory")}
                        </DropdownMenuItem>
                        {giftCard.status === GiftCardStatus.ACTIVE && (
                          <DropdownMenuItem className="text-destructive">
                            <Ban className="h-4 w-4 me-2" />
                            {t("giftCards.deactivate")}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Gift Card Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("giftCards.createCard")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="value">{t("giftCards.value")}</Label>
                <Input
                  id="value"
                  type="number"
                  min="10"
                  step="10"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      value: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientName">
                  {t("giftCards.recipientName")}
                </Label>
                <Input
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipientName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">
                  {t("giftCards.recipientEmail")}
                </Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipientEmail: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={createGiftCard.isPending}>
                {createGiftCard.isPending
                  ? t("common.loading")
                  : t("giftCards.createCard")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lookup & Redeem Gift Card Modal */}
      <Dialog open={isLookupModalOpen} onOpenChange={closeLookupModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("giftCards.lookupRedeem")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Lookup Section */}
            <div className="space-y-2">
              <Label htmlFor="lookupCode">{t("giftCards.enterCode")}</Label>
              <div className="flex gap-2">
                <Input
                  id="lookupCode"
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX"
                  className="font-mono"
                />
                <Button
                  type="button"
                  onClick={handleLookup}
                  disabled={isLookingUp || !lookupCode.trim()}
                >
                  {isLookingUp ? t("common.loading") : t("giftCards.lookup")}
                </Button>
              </div>
            </div>

            {/* Result Section */}
            {lookupResult && (
              <Card className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-lg">{lookupResult.code}</p>
                    <Badge variant={giftCardStatusColors[lookupResult.status]}>
                      {lookupResult.status}
                    </Badge>
                  </div>
                  <div className="text-end">
                    <p className="text-sm text-muted-foreground">
                      {t("giftCards.balance")}
                    </p>
                    <p className="text-2xl font-bold text-accent-pink">
                      {formatCurrency(lookupResult.currentValue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      / {formatCurrency(lookupResult.initialValue)}
                    </p>
                  </div>
                </div>

                {/* Redeem Section - only for active cards */}
                {lookupResult.status === GiftCardStatus.ACTIVE && (
                  <div className="pt-4 border-t space-y-2">
                    <Label htmlFor="redeemAmount">{t("giftCards.redeemAmount")}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="redeemAmount"
                        type="number"
                        min="0.01"
                        max={lookupResult.currentValue}
                        step="0.01"
                        value={redeemAmount || ""}
                        onChange={(e) => setRedeemAmount(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                      <Button
                        type="button"
                        onClick={handleRedeem}
                        disabled={isRedeeming || redeemAmount <= 0 || redeemAmount > lookupResult.currentValue}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {isRedeeming ? t("common.loading") : t("giftCards.redeem")}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("giftCards.maxAmount")}: {formatCurrency(lookupResult.currentValue)}
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeLookupModal}>
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
