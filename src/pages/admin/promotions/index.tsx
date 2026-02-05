import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Tag,
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
import { LoadingPanel } from "@/components/loading-panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/hooks/useUser";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { Promotion, PromotionStatus } from "@/types/entities";
import { usePost } from "@/hooks/usePost";
import { useGet } from "@/hooks/useGet";
import { PromotionModal } from "./components/dialog/promotion-modal";
import type { CreatePromotionDto } from "./types";
import {
  copyPromotionCode,
  formatPromotionDiscountValue,
  getPromotionStatusBadge,
  getPromotionTypeIcon,
} from "./utils";

// TODO: Backend needs to implement these endpoints:
// - GET /promotions?salonId={salonId}
// - POST /promotions
// - PATCH /promotions/{id}
// - DELETE /promotions/{id}
// - POST /promotions/{id}/toggle (activate/pause)

export function PromotionsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const { user } = useUser();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PromotionStatus | "all">(
    "all",
  );

  const salonId = user?.salon?.id;

  // Fetch promotions - NOTE: This endpoint needs to be implemented in backend
  const { data: promotions = [], isLoading } = useGet<Promotion[]>(
    "promotions",
    {
      params: { salonId },
      enabled: !!salonId,
    },
  );

  // Mutations - NOTE: These endpoints need to be implemented in backend
  const createPromotion = usePost<Promotion, CreatePromotionDto & { salonId: string }>(
    "promotions",
    {
    invalidateQueries: ["promotions"],
    onSuccess: () => {
      toast.success(t("promotions.created"));
      setIsAddModalOpen(false);
    },
    onError: (error) => toast.error(error.message || t("common.error")),
  },
  );

  const updatePromotionStatus = usePost<
    Promotion,
    { id: string; status: PromotionStatus }
  >("promotions", {
    id: (variables) => variables.id,
    method: "PATCH",
    invalidateQueries: ["promotions"],
    onSuccess: () => toast.success(t("promotions.statusUpdated")),
    onError: (error) => toast.error(error.message),
  });

  const filteredPromotions =
    selectedStatus === "all"
      ? promotions
      : promotions.filter((p) => p.status === selectedStatus);

  const handleCopyCode = (code: string) => {
    copyPromotionCode(code, () => toast.success(t("promotions.codeCopied")));
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
        <LoadingPanel label={t("common.loading")} />
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
                      {getPromotionTypeIcon(promotion.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{promotion.name}</h3>
                      <p className="text-2xl font-bold text-accent-pink">
                        {formatPromotionDiscountValue(
                          promotion,
                          formatCurrency,
                        )}
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
                            updatePromotionStatus.mutate({
                              id: promotion.id,
                              status: "paused",
                            })
                          }
                        >
                          <Pause className="h-4 w-4 me-2" />
                          {t("promotions.pause")}
                        </DropdownMenuItem>
                      ) : promotion.status === "paused" ||
                        promotion.status === "draft" ? (
                        <DropdownMenuItem
                          onClick={() =>
                            updatePromotionStatus.mutate({
                              id: promotion.id,
                              status: "active",
                            })
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
                      onClick={() => handleCopyCode(promotion.code!)}
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
                  {getPromotionStatusBadge(t, promotion.status)}
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
        onSubmit={(data) => {
          if (!salonId) {
            toast.error(t("common.error"));
            return;
          }
          createPromotion.mutate({ ...data, salonId });
        }}
        isLoading={createPromotion.isPending}
      />
    </div>
  );
}
