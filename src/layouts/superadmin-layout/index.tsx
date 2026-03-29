import { Navigate, Outlet } from "react-router-dom";

import { AppRole } from "@/constants/enum";
import { ROUTES } from "@/constants/navigation";
import { Spinner } from "@/components/spinner";
import { useUser } from "@/hooks/useUser";
import { PanelLayout } from "@/layouts/panel-layout";

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
    <PanelLayout user={user} userRole={userRole} isInAdminPanel>
      <Outlet />
    </PanelLayout>
  );
}
