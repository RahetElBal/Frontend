import { Suspense } from "react";
import { Outlet, Navigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { LoadingPanel } from "@/components/loading-panel";
import { Spinner } from "@/components/spinner";
import { MainLayout } from "@/layouts/main-layout";
import { useUser } from "@/hooks/useUser";
import { ROUTES } from "@/constants/navigation";
import type { AppRole } from "@/types/user";
import type { Salon } from "@/types/entities";

/**
 * Layout for regular users and admins (salon view)
 * Navigation varies based on role:
 * - user: Limited access (no analytics, settings)
 * - admin: Full salon management access
 * - superadmin: Redirected to admin panel (shouldn't access user routes directly)
 */
export function UserLayout() {
  const { user, isLoading: userLoading, isAuthenticated } = useUser();

  const isLoading = userLoading;

  // Show loading spinner while checking auth and salons
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  // If not authenticated, useUser will redirect to login
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check user roles
  const isSuperadmin = user.isSuperadmin || user.role === "superadmin";
  // Superadmin should use admin panel, not user routes
  // Redirect them to admin panel
  if (isSuperadmin) {
    return <Navigate to={ROUTES.ADMIN} replace />;
  }

  // Get user role
  const userRole = (user.role || "user") as AppRole;

  return (
    <MainLayout>
      <AppSidebar
        user={user}
        userRole={userRole}
        currentSalon={user?.salon as Salon}
        isInAdminPanel={false}
      />

      {/* Main Content Area */}
      <main
        className={cn("min-h-screen w-full transition-all duration-300")}
        style={{ paddingInlineStart: "var(--app-sidebar-width, 256px)" }}
      >
        <div className="w-full p-6">
          <Suspense fallback={<LoadingPanel className="min-h-[60vh]" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </MainLayout>
  );
}
