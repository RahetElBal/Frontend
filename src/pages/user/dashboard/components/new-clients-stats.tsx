import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import type { Client } from "@/types/entities";
import { getTodaysNewClients, getLastWeekNewClients } from "../utils";
import { getChangeDisplay } from "@/common/utils";

interface NewClientsStatsProps {
  clients: Client[];
}

export function NewClientsStats({ clients }: NewClientsStatsProps) {
  const { t } = useTranslation();

  const todaysNewClients = getTodaysNewClients(clients);
  const lastWeekNewClients = getLastWeekNewClients(clients);

  const todayCount = todaysNewClients.length;
  const lastWeekCount = lastWeekNewClients.length;
  const change = getChangeDisplay(todayCount, lastWeekCount);

  return (
    <StatsCard
      title={t("dashboard.newClients")}
      value={todayCount}
      change={change.value}
      changeText={change.text ? t("common.new") : undefined}
      changeIsPositive={change.isPositive}
      changeLabel={t("dashboard.vsLastWeek")}
      icon={Users}
      iconColor="text-accent-pink"
      iconBgColor="bg-accent-pink/10"
    />
  );
}
