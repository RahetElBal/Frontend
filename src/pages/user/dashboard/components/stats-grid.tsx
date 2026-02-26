import type { Client } from "@/types";
import { RevenueStats } from "./revenue-stats";
import { NewClientsStats } from "./new-clients-stats";

interface StatsGridProps {
  grossRevenue?: number;
  netRevenue?: number;
  clients: Client[];
  loading?: boolean;
}

export function StatsGrid({
  grossRevenue,
  netRevenue,
  clients,
  loading = false,
}: StatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RevenueStats
        grossRevenue={grossRevenue}
        netRevenue={netRevenue}
        loading={loading}
      />
      <NewClientsStats clients={clients} loading={loading} />
    </div>
  );
}
