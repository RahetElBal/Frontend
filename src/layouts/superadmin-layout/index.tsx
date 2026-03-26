import { Suspense } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { AppRole } from "@/constants/enum";
import { ROUTES } from "@/constants/navigation";
import { LoadingPanel } from "@/components/loading-panel";
import { PlanExpiryBanner } from "@/components/plan-expiry-banner";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Spinner } from "@/components/spinner";
import { AppTopbar } from "@/components/topbar/app-topbar";
import { useUser } from "@/hooks/useUser";
import { MainLayout } from "@/layouts/main-layout";

export function SuperadminLayout() {
  const { user, isLoading, isAuthenticated } = useUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const userRole = user.role ?? AppRole.USER;
  const hasSuperadminAccess =
    user.isSuperadmin || userRole === AppRole.SUPER_ADMIN;

  if (!hasSuperadminAccess) {
    return <Navigate to={ROUTES.ADMIN} replace />;
  }

  return (
    <MainLayout>
      <AppSidebar user={user} userRole={userRole} isInAdminPanel />
      <main
        className="min-h-screen transition-all duration-300"
        style={{ paddingInlineStart: "var(--app-sidebar-width, 256px)" }}
      >
        <div className="p-6 space-y-6">
          <PlanExpiryBanner />
          <AppTopbar />
          <Suspense fallback={<LoadingPanel className="min-h-[60vh]" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </MainLayout>
  );
}
