import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Heart,
  Star,
  Trophy,
  Crown,
  Gift,
  TrendingUp,
  Settings,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type {
  LoyaltyProgram,
  LoyaltyTransaction,
  Client,
} from "@/types/entities";

// TODO: Replace with real API data
const loyaltyProgram: LoyaltyProgram = {
  id: "",
  name: "Programme Fidélité",
  pointsPerCurrency: 1,
  redemptionRate: 0.05,
  minimumPoints: 100,
  isActive: true,
  salonId: "",
  tiers: [],
  createdAt: "",
  updatedAt: "",
};

const loyaltyTransactions: LoyaltyTransaction[] = [];
const clients: Client[] = [];

const tierIcons = [Star, Trophy, Crown, Gift];
const tierColors = [
  "text-orange-500",
  "text-gray-400",
  "text-yellow-500",
  "text-purple-500",
];

export function LoyaltyPage() {
  const { t } = useTranslation();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    name: loyaltyProgram.name,
    pointsPerCurrency: loyaltyProgram.pointsPerCurrency,
    redemptionRate: loyaltyProgram.redemptionRate,
    minimumPoints: loyaltyProgram.minimumPoints,
    isActive: loyaltyProgram.isActive,
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  const totalPointsIssued = loyaltyTransactions
    .filter((tx) => tx.type === "earn")
    .reduce((sum, tx) => sum + tx.points, 0);
  const totalPointsRedeemed = Math.abs(
    loyaltyTransactions
      .filter((tx) => tx.type === "redeem")
      .reduce((sum, tx) => sum + tx.points, 0),
  );

  const topClients = [...clients]
    .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
    .slice(0, 5);

  const getTier = (points: number) => {
    if (!loyaltyProgram.tiers) return null;
    return [...loyaltyProgram.tiers]
      .reverse()
      .find((tier) => points >= tier.minPoints);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to update loyalty program settings
    console.log("Saving loyalty settings:", settings);
    setIsSettingsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.loyalty")}
        description={loyaltyProgram.name}
        actions={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsSettingsModalOpen(true)}
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
              <p className="text-xl font-bold">{clients.length}</p>
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
              <Gift className="h-5 w-5 text-blue-600" />
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
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("loyalty.redemptionValue")}
              </p>
              <p className="text-xl font-bold">
                {formatCurrency(
                  totalPointsRedeemed * loyaltyProgram.redemptionRate,
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Loyalty Tiers */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t("loyalty.tiers")}</h2>
          {loyaltyProgram.tiers && loyaltyProgram.tiers.length > 0 ? (
            <div className="space-y-4">
              {loyaltyProgram.tiers.map((tier, index) => {
                const Icon = tierIcons[index] || Star;
                const colorClass = tierColors[index] || "text-muted-foreground";

                return (
                  <div
                    key={tier.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div
                      className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center",
                        index === 0
                          ? "bg-orange-100"
                          : index === 1
                            ? "bg-gray-200"
                            : index === 2
                              ? "bg-yellow-100"
                              : "bg-purple-100",
                      )}
                    >
                      <Icon className={cn("h-6 w-6", colorClass)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{tier.name}</h3>
                        <Badge variant="default">
                          {tier.multiplier}x {t("loyalty.multiplier")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tier.minPoints.toLocaleString()}+ {t("loyalty.points")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucun palier configuré</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setIsSettingsModalOpen(true)}
              >
                Configurer les paliers
              </Button>
            </div>
          )}
        </Card>

        {/* Top Loyalty Members */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("loyalty.topMembers")}
          </h2>
          {topClients.length > 0 ? (
            <div className="space-y-3">
              {topClients.map((client, index) => {
                const tier = getTier(client.loyaltyPoints);
                const Icon =
                  tierIcons[loyaltyProgram.tiers?.indexOf(tier!) ?? 0] || Star;

                return (
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
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Icon className="h-3 w-3" />
                          {tier?.name || "Member"}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="font-bold text-accent-pink">
                        {client.loyaltyPoints.toLocaleString()} pts
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(client.totalSpent)} {t("loyalty.spent")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucun membre pour le moment</p>
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
              Configurez les paramètres de votre programme de fidélité
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSettings}>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Programme actif</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer ou désactiver le programme
                  </p>
                </div>
                <Switch
                  checked={settings.isActive}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, isActive: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="programName">Nom du programme</Label>
                <Input
                  id="programName"
                  value={settings.name}
                  onChange={(e) =>
                    setSettings({ ...settings, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsPerCurrency">
                    Points par € dépensé
                  </Label>
                  <Input
                    id="pointsPerCurrency"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={settings.pointsPerCurrency}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        pointsPerCurrency: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="redemptionRate">Valeur du point (€)</Label>
                  <Input
                    id="redemptionRate"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={settings.redemptionRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        redemptionRate: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumPoints">
                  Points minimum pour utilisation
                </Label>
                <Input
                  id="minimumPoints"
                  type="number"
                  min="0"
                  value={settings.minimumPoints}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      minimumPoints: parseInt(e.target.value),
                    })
                  }
                />
              </div>
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
