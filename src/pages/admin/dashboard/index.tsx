import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/useUser";
import { useGet } from "@/hooks/useGet";
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

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { user, isLoading: userLoading, isSuperadmin } = useUser();

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

  const isLoading =
    userLoading || usersLoading || (isSuperadmin && salonsLoading);

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const displayName = getUserDisplayName(user as User | null);
  const adminSalons = getAdminSalons(user as User | null);
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

      <StatsGrid salonsData={salonsToDisplay} usersData={usersData} />

      <div
        className={`grid gap-6 ${isSuperadmin ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}
      >
        {isSuperadmin && <RecentSalonsCard salons={recentSalons} />}
        <RecentUsersCard users={recentUsers} />
      </div>
    </div>
  );
}
