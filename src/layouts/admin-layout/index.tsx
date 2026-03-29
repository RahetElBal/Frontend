import { Outlet, Navigate } from "react-router-dom";

import { AppRole } from "@/constants/enum";
import { Spinner } from "@/components/spinner";
import { PanelLayout } from "@/layouts/panel-layout";
import { useUser } from "@/hooks/useUser";
import { ROUTES } from "@/constants/navigation";

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
  const userRole = user.role || AppRole.USER;
  const isSuperadmin = user.isSuperadmin || userRole === AppRole.SUPER_ADMIN;
  const isAdmin = userRole === AppRole.ADMIN;

  // Only superadmin and admin can access admin panel
  if (!isSuperadmin && !isAdmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <PanelLayout
      user={user}
      userRole={userRole}
      isInAdminPanel={true}
    >
      <Outlet />
    </PanelLayout>
  );
}
