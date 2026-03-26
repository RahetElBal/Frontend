import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppRole } from "@/constants/enum";
import { useAuthContext } from "@/contexts/AuthProvider";
import { AUTH_ROUTES } from "@/constants/auth";
import type { AuthUser } from "@/types/user";
import type { Salon } from "@/types/entities";

interface UseUserOptions {
  redirectTo?: string;
  redirectIfFound?: boolean;
}

interface UseUserReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperadmin: boolean;
  isAdmin: boolean;
  isUser: boolean;
  hasRole: (role: AppRole) => boolean;
  salon: Salon | null;
}

export function useUser(options: UseUserOptions = {}): UseUserReturn {
  const { redirectTo = AUTH_ROUTES.LOGIN, redirectIfFound = false } = options;

  const { user, isAuthenticated, isLoading, isSuperadmin, isAdmin, hasRole } =
    useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isUser = user?.role === AppRole.USER;

  useEffect(() => {
    if (isLoading) return;

    // Redirect if not authenticated and redirectIfFound is false
    if (!isAuthenticated && !redirectIfFound) {
      navigate(redirectTo, {
        replace: true,
        state: { from: location.pathname },
      });
      return;
    }

    if (isAuthenticated && redirectIfFound) {
      const from = (location.state as { from?: string })?.from;
      const destination =
        from ||
        getDefaultRouteForRole(user?.role as AppRole, user?.isSuperadmin);
      navigate(destination, { replace: true });
    }
  }, [
    isLoading,
    isAuthenticated,
    redirectTo,
    redirectIfFound,
    user?.role,
    user?.isSuperadmin,
    navigate,
    location,
  ]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isSuperadmin,
    isAdmin,
    isUser,
    hasRole,
    salon: (user?.salon || null) as Salon | null,
  };
}

function getDefaultRouteForRole(
  role?: AppRole,
  isSuperadmin?: boolean,
): string {
  // Superadmin goes to admin panel
  if (isSuperadmin || role === AppRole.SUPER_ADMIN) {
    return AUTH_ROUTES.ADMIN_DASHBOARD;
  }

  // Admin can go to admin panel or dashboard
  if (role === AppRole.ADMIN) {
    return AUTH_ROUTES.ADMIN_DASHBOARD;
  }

  // Regular user goes to dashboard
  return AUTH_ROUTES.DASHBOARD;
}
