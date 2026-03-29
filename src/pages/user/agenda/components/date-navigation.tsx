import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import { useSalonDateTime } from "@/hooks/useSalonDateTime";

interface DateNavigationProps {
  selectedDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  confirmedCount: number;
  pendingCount: number;
}

export function DateNavigation({
  selectedDate,
  onPrevDay,
  onNextDay,
  onToday,
  confirmedCount,
  pendingCount,
}: DateNavigationProps) {
  const { t } = useTranslation();
  const { formatDate } = useSalonDateTime();

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevDay}
            title={t("agenda.previous")}
            aria-label={t("agenda.previous")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNextDay}
            title={t("agenda.next")}
            aria-label={t("agenda.next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={onToday}>
            {t("agenda.today")}
          </Button>
        </div>
        <h2 className="text-lg font-semibold capitalize">
          {formatDate(selectedDate)}
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="success">
            {confirmedCount} {t("agenda.confirmed")}
          </Badge>
          <Badge variant="warning">
            {pendingCount} {t("agenda.pending")}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
