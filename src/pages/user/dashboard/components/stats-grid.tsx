import type { RevenueData, Client } from "@/types";
import { RevenueStats } from "./revenue-stats";
import { NewClientsStats } from "./new-clients-stats";

interface StatsGridProps {
  todaysRevenue?: RevenueData;
  lastWeekRevenue?: RevenueData;
  clients: Client[];
  loading?: boolean;
}

export function StatsGrid({
  todaysRevenue,
  lastWeekRevenue,
  clients,
  loading = false,
}: StatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
      <RevenueStats
        todaysRevenue={todaysRevenue}
        lastWeekRevenue={lastWeekRevenue}
        loading={loading}
      />
      <NewClientsStats clients={clients} loading={loading} />
    </div>
  );
}
