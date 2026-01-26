import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Tag,
  Percent,
  Calendar,
  Copy,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Pause,
  Eye,
  Users,
  Clock,
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type {
  Promotion,
  PromotionType,
  PromotionStatus,
  PromotionAppliesTo,
} from "@/types/entities";
import { usePost } from "@/hooks/usePost";
import { useGet } from "@/hooks/useGet";

const PROMOTION_TYPES: PromotionType[] = [
  "percentage",
  "fixed_amount",
  "buy_x_get_y",
  "free_service",
  "free_product",
  "bundle",
];

const APPLIES_TO_OPTIONS: PromotionAppliesTo[] = [
  "all",
  "services",
  "products",
  "specific_items",
  "categories",
];

interface CreatePromotionDto {
  name: string;
  description?: string;
  code?: string;
  type: PromotionType;
  appliesTo: PromotionAppliesTo;
  discountValue?: number;
  minimumPurchase?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageLimitPerClient?: number;
  startDate: string;
  endDate: string;
  isFirstTimeOnly: boolean;
  isBirthdayOnly: boolean;
}

export function PromotionsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PromotionStatus | "all">(
    "all",
  );

  // Fetch promotions
  const { data: promotions = [], isLoading } =
    useGet<Promotion[]>("promotions");

  // Mutations
  const createPromotion = usePost<Promotion, CreatePromotionDto>("promotions", {
    onSuccess: () => {
      toast.success(t("promotions.created"));
      setIsAddModalOpen(false);
    },
    onError: (error) => toast.error(error.message || t("common.error")),
  });

  const updatePromotionStatus = usePost<Promotion, { status: PromotionStatus }>(
    "promotions",
    {
      method: "PATCH",
      onSuccess: () => toast.success(t("promotions.statusUpdated")),
      onError: (error) => toast.error(error.message),
    },
  );

  const filteredPromotions =
    selectedStatus === "all"
      ? promotions
      : promotions.filter((p) => p.status === selectedStatus);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t("promotions.codeCopied"));
  };

  const getStatusBadge = (status: PromotionStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="success">{t("promotions.active")}</Badge>;
      case "draft":
        return <Badge variant="default">{t("promotions.draft")}</Badge>;
      case "paused":
        return <Badge variant="warning">{t("promotions.paused")}</Badge>;
      case "expired":
        return <Badge variant="error">{t("promotions.expired")}</Badge>;
      case "cancelled":
        return <Badge>{t("promotions.cancelled")}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: PromotionType) => {
    switch (type) {
      case "percentage":
        return <Percent className="h-5 w-5" />;
      case "fixed_amount":
        return <Tag className="h-5 w-5" />;
      default:
        return <Tag className="h-5 w-5" />;
    }
  };

  const formatDiscountValue = (promo: Promotion) => {
    if (promo.type === "percentage") {
      return `-${promo.discountValue}%`;
    } else if (promo.type === "fixed_amount") {
      return `-${formatCurrency(promo.discountValue || 0)}`;
    }
    return promo.type;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.promotions")}
        description={t("promotions.description")}
        actions={
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 me-2" />
            {t("promotions.create")}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {promotions.filter((p) => p.status === "active").length}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("promotions.activePromos")}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {promotions.reduce((acc, p) => acc + p.timesUsed, 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("promotions.totalUsage")}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {promotions.filter((p) => p.status === "draft").length}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("promotions.drafts")}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {promotions.filter((p) => p.status === "expired").length}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("promotions.expired")}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "active", "draft", "paused", "expired"] as const).map(
          (status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(status)}
            >
              {t(`promotions.${status === "all" ? "allStatuses" : status}`)}
              {status !== "all" && (
                <span className="ms-1 text-xs">
                  ({promotions.filter((p) => p.status === status).length})
                </span>
              )}
            </Button>
          ),
        )}
      </div>

      {/* Promotions Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("common.loading")}
        </div>
      ) : filteredPromotions.length === 0 ? (
        <Card className="p-8 text-center">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">{t("promotions.noPromotions")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("promotions.noPromotionsDescription")}
          </p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 me-2" />
            {t("promotions.create")}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPromotions.map((promotion) => (
            <Card key={promotion.id} className="overflow-hidden">
              <div
                className={cn(
                  "p-4 border-b",
                  promotion.status === "active" ? "bg-green-50" : "bg-muted/30",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center",
                        promotion.status === "active"
                          ? "bg-green-100 text-green-600"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {getTypeIcon(promotion.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{promotion.name}</h3>
                      <p className="text-2xl font-bold text-accent-pink">
                        {formatDiscountValue(promotion)}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 me-2" />
                        {t("common.view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 me-2" />
                        {t("common.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {promotion.status === "active" ? (
                        <DropdownMenuItem
                          onClick={() =>
                            updatePromotionStatus.mutate({ status: "paused" })
                          }
                        >
                          <Pause className="h-4 w-4 me-2" />
                          {t("promotions.pause")}
                        </DropdownMenuItem>
                      ) : promotion.status === "paused" ||
                        promotion.status === "draft" ? (
                        <DropdownMenuItem
                          onClick={() =>
                            updatePromotionStatus.mutate({ status: "active" })
                          }
                        >
                          <Play className="h-4 w-4 me-2" />
                          {t("promotions.activate")}
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 me-2" />
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {promotion.code && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <code className="font-mono font-semibold">
                      {promotion.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyCode(promotion.code!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {promotion.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {promotion.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(promotion.status)}
                  {promotion.isFirstTimeOnly && (
                    <Badge variant="info">
                      {t("promotions.firstTimeOnly")}
                    </Badge>
                  )}
                  {promotion.isBirthdayOnly && (
                    <Badge variant="info">{t("promotions.birthdayOnly")}</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      {t("promotions.validFrom")}
                    </p>
                    <p className="font-medium">
                      {new Date(promotion.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {t("promotions.validUntil")}
                    </p>
                    <p className="font-medium">
                      {new Date(promotion.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      {t("promotions.used")}:{" "}
                    </span>
                    <span className="font-semibold">{promotion.timesUsed}</span>
                    {promotion.usageLimit && (
                      <span className="text-muted-foreground">
                        /{promotion.usageLimit}
                      </span>
                    )}
                  </div>
                  {promotion.minimumPurchase && (
                    <div className="text-sm text-muted-foreground">
                      {t("promotions.min")}:{" "}
                      {formatCurrency(promotion.minimumPurchase)}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Promotion Modal */}
      <PromotionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => createPromotion.mutate(data)}
        isLoading={createPromotion.isPending}
        t={t}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

// ============================================
// PROMOTION MODAL
// ============================================

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePromotionDto) => void;
  isLoading: boolean;
  t: ReturnType<typeof useTranslation>["t"];
  formatCurrency: (value: number) => string;
}

function PromotionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  t,
}: PromotionModalProps) {
  // Compute initial dates once
  const initialDates = useMemo(() => {
    const today = new Date();
    const thirtyDaysLater = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    return {
      startDate: today.toISOString().split("T")[0],
      endDate: thirtyDaysLater.toISOString().split("T")[0],
    };
  }, []);

  const [formData, setFormData] = useState<CreatePromotionDto>({
    name: "",
    description: "",
    code: "",
    type: "percentage",
    appliesTo: "all",
    discountValue: 10,
    minimumPurchase: undefined,
    maximumDiscount: undefined,
    usageLimit: undefined,
    usageLimitPerClient: undefined,
    startDate: initialDates.startDate,
    endDate: initialDates.endDate,
    isFirstTimeOnly: false,
    isBirthdayOnly: false,
  });

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("promotions.create")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label>{t("fields.name")} *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("promotions.namePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t("fields.description")}</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t("promotions.descriptionPlaceholder")}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("promotions.promoCode")}</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.code || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="SUMMER20"
                  className="font-mono"
                />
                <Button type="button" variant="outline" onClick={generateCode}>
                  {t("promotions.generate")}
                </Button>
              </div>
            </div>

            {/* Discount Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("promotions.type")} *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as PromotionType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMOTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`promotions.types.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {formData.type === "percentage"
                    ? t("promotions.percentage")
                    : t("promotions.amount")}{" "}
                  *
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step={formData.type === "percentage" ? "1" : "0.01"}
                    max={formData.type === "percentage" ? "100" : undefined}
                    value={formData.discountValue || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {formData.type === "percentage" ? "%" : "€"}
                  </span>
                </div>
              </div>
            </div>

            {/* Applies To */}
            <div className="space-y-2">
              <Label>{t("promotions.appliesTo")}</Label>
              <Select
                value={formData.appliesTo}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    appliesTo: value as PromotionAppliesTo,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLIES_TO_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {t(`promotions.appliesTo.${option}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("promotions.startDate")} *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("promotions.endDate")} *</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("promotions.minimumPurchase")}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimumPurchase || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumPurchase: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("promotions.maxDiscount")}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maximumDiscount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maximumDiscount: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="∞"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("promotions.usageLimit")}</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.usageLimit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usageLimit: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="∞"
                />
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-3 pt-2">
              <Label className="text-base">{t("promotions.conditions")}</Label>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("promotions.firstTimeOnly")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("promotions.firstTimeOnlyDescription")}
                  </p>
                </div>
                <Switch
                  checked={formData.isFirstTimeOnly}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFirstTimeOnly: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("promotions.birthdayOnly")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("promotions.birthdayOnlyDescription")}
                  </p>
                </div>
                <Switch
                  checked={formData.isBirthdayOnly}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isBirthdayOnly: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("promotions.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
