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

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "";

  // Get admin's salons (typed as Salon | null but actually Salon[] at runtime)
  const adminSalons = (user?.salon as unknown as Salon[]) || [];
  const adminSalon = adminSalons[0];

  // For admin: use their salon from useUser, for superadmin: use all salons
  const salonsToDisplay = isSuperadmin
    ? salonsData
    : adminSalons.length > 0
      ? adminSalons
      : undefined;

  const recentSalons = salonsToDisplay
    ? [...salonsToDisplay]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5)
    : [];

  // Filter users based on role
  const filteredUsers = usersData?.data
    ? isSuperadmin
      ? // Superadmin: show all admins and users
        usersData.data.filter((u) => u.role === "admin" || u.role === "user")
      : // Admin: show only users managed by them
        usersData.data.filter((u) => u.managedById === user?.id)
    : [];

  const recentUsers = filteredUsers
    ? [...filteredUsers]
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
        description={
          isSuperadmin
            ? t("admin.dashboard.welcome", { name: displayName })
            : adminSalon
              ? `Tableau de bord - ${adminSalon.name}`
              : t("admin.dashboard.welcome", { name: displayName })
        }
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
