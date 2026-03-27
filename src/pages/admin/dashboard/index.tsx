import { useTranslation } from "react-i18next";
import { selectCollectionData } from "@/common/utils";
import { useUser } from "@/hooks/useUser";
import { useGet } from "@/hooks/useGet";
import { useSalonBusinessSummary } from "@/contexts/BusinessSummaryProvider";
import { Spinner } from "@/components/spinner";
import { PageHeader } from "@/components/page-header";
import type { Salon } from "@/pages/admin/salon/types";
import type { User } from "@/pages/admin/users/types";
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
} from "./components/utils";

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

  const { data: users = [], isLoading: usersLoading } = useGet<User[]>({
    path: "users",
    options: {
      select: (response) =>
        selectCollectionData(response as { data?: User[] } | User[]),
    },
  });

  const { data: salonsData, isLoading: salonsLoading } = useGet<Salon[]>({
    path: "salons",
    options: {
      enabled: isSuperadmin,
    },
  });
  const { data: summaryStats, isLoading: summaryLoading } =
    useGet<DashboardSummaryStats>({
      path: "salons/stats/summary",
      options: {
        enabled: isSuperadmin,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: true,
      },
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
    users,
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
        usersTotal={users.length}
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
