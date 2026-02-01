import { Outlet, Navigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Spinner } from "@/components/spinner";
import { MainLayout } from "@/layouts/main-layout";
import { useUser } from "@/hooks/useUser";
import { ROUTES } from "@/constants/navigation";
import type { AppRole } from "@/types/user";

/**
 * Layout for admin panel (superadmin and admin only)
 * Includes sidebar with admin navigation
 * Requires Admin or Superadmin role
 */
export function AdminLayout() {
  const { user, isLoading, isAuthenticated } = useUser();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check if user has admin or superadmin role
  const userRole = (user.role || "user") as AppRole;
  const isSuperadmin = user.isSuperadmin || userRole === "superadmin";
  const isAdmin = userRole === "admin";

  // Only superadmin and admin can access admin panel
  if (!isSuperadmin && !isAdmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <MainLayout>
      {/* Sidebar - Navigation filtered automatically by role */}
      <AppSidebar
        user={user}
        userRole={userRole}
        isInAdminPanel={true} // This is admin panel - shows admin navigation
      />

      {/* Main Content Area */}
      <main
        className={cn("min-h-screen transition-all duration-300")}
        style={{ paddingInlineStart: "var(--app-sidebar-width, 256px)" }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </MainLayout>
  );
}
