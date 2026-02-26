import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/useUser";
import { useGet, withParams } from "@/hooks/useGet";
import { useSalonBusinessSummary } from "@/contexts/BusinessSummaryProvider";
import { Spinner } from "@/components/spinner";
import { PageHeader } from "@/components/page-header";
import type { PaginatedResponse, Salon, User } from "@/types";
import { StatsGrid } from "./components/stats-grid";
import { RecentSalonsCard } from "./components/recent-salons";
import { RecentUsersCard } from "./components/recent-users";
import {
  getRecentItems,
  getUserDisplayName,
  getAdminSalons,
  getSalonsToDisplay,
  getFilteredUsers,
  getDashboardDescription,
} from "./utils";

interface DashboardSummaryStats {
  grossRevenue: number;
  netRevenue: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { user, isLoading: userLoading, isSuperadmin } = useUser();
  const adminSalons = getAdminSalons(user as User | null);
  const adminSalonId = adminSalons[0]?.id;

  const { summary: adminBusinessSummary, isLoading: adminSummaryLoading } =
    useSalonBusinessSummary(adminSalonId, {
      enabled: !isSuperadmin && !!adminSalonId,
    });

  const { data: usersData, isLoading: usersLoading } = useGet<
    PaginatedResponse<User>
  >("users", {
    retry: 1,
  });

  const { data: salonsData, isLoading: salonsLoading } = useGet<Salon[]>(
    "salons",
    {
      enabled: isSuperadmin,
    },
  );
  const { data: summaryStats, isLoading: summaryLoading } =
    useGet<DashboardSummaryStats>(withParams("salons/stats/summary"), {
      enabled: isSuperadmin,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true,
    });

  const effectiveSummaryLoading = isSuperadmin
    ? summaryLoading
    : adminSummaryLoading;
  const isLoading =
    userLoading ||
    usersLoading ||
    effectiveSummaryLoading ||
    (isSuperadmin && salonsLoading);

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const displayName = getUserDisplayName(user as User | null);
  const adminSalon = adminSalons[0];
  const salonsToDisplay = getSalonsToDisplay(
    isSuperadmin,
    salonsData,
    adminSalons,
  );
  const recentSalons = salonsToDisplay
    ? getRecentItems(salonsToDisplay, 5)
    : [];
  const filteredUsers = getFilteredUsers(
    usersData?.data,
    isSuperadmin,
    user?.id,
  );
  const recentUsers = getRecentItems(filteredUsers, 5);
  const grossRevenue = isSuperadmin
    ? summaryStats?.grossRevenue ?? summaryStats?.totalRevenue ?? 0
    : adminBusinessSummary.grossRevenue;
  const netRevenue = isSuperadmin
    ? summaryStats?.netRevenue ?? summaryStats?.totalRevenue ?? 0
    : adminBusinessSummary.netRevenue;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={t("admin.dashboard.title")}
        description={getDashboardDescription(
          isSuperadmin,
          displayName,
          adminSalon,
          t("admin.dashboard.welcome"),
        )}
      />

      <StatsGrid
        salonsData={salonsToDisplay}
        usersData={usersData}
        loading={isLoading}
        revenueData={{
          gross: grossRevenue,
          net: netRevenue,
        }}
      />

      <div
        className={`grid gap-6 ${isSuperadmin ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}
      >
        {isSuperadmin && <RecentSalonsCard salons={recentSalons} />}
        <RecentUsersCard users={recentUsers} />
      </div>
    </div>
  );
}
