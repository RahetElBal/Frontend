import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/useUser";
import { useGet } from "@/hooks/useGet";
import { Spinner } from "@/components/spinner";
import { PageHeader } from "@/components/page-header";
import type { PaginatedResponse, Salon, User } from "@/types";
import { StatsGrid } from "./components/stats-grid";
import { RecentSalonsCard } from "./components/recent-salons";
import { RecentUsersCard } from "./components/recent-users";

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { user, isLoading: userLoading } = useUser();

  const { data: usersData, isLoading: usersLoading } = useGet<
    PaginatedResponse<User>
  >("users", {
    retry: 1,
  });

  const { data: salonsData, isLoading: salonsLoading } =
    useGet<Salon[]>("salons");

  const isLoading = userLoading || usersLoading || salonsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "";

  const recentSalons = salonsData
    ? [...salonsData]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5)
    : [];

  const recentUsers = usersData?.data
    ? [...usersData.data]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={t("admin.dashboard.title")}
        description={t("admin.dashboard.welcome", { name: displayName })}
      />

      <StatsGrid salonsData={salonsData} usersData={usersData} />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentSalonsCard salons={recentSalons} />
        <RecentUsersCard users={recentUsers} />
      </div>
    </div>
  );
}
