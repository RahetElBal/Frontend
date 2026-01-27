import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TopService } from "@/types/entities";

// TODO: Replace with real API data
const topServices: TopService[] = [];

export function TopServices() {
  const { t } = useTranslation();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{t("dashboard.topServices")}</h2>
        <Button variant="ghost" size="sm" className="gap-1">
          {t("common.viewAll")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        {topServices.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t("dashboard.noServices")}
          </p>
        ) : (
          topServices.map((service, index) => (
            <div
              key={service.id}
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
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {service.count} {t("dashboard.bookings")}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-green-600">
                {formatCurrency(service.revenue)}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
