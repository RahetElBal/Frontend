import { useTranslation } from "react-i18next";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { DayOfWeek } from "@/types/entities";
import type { WorkingHoursSettingsProps } from "../types";

const DAYS: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function WorkingHoursSettings({
  formData,
  updateWorkingHours,
}: WorkingHoursSettingsProps) {
  const { t } = useTranslation();

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
