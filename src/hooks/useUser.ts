import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthProvider';
import { AUTH_ROUTES } from '@/constants/auth';
import { UserRole } from '@/types/user';
import type { User } from '@/types/user';

interface UseUserOptions {
  redirectTo?: string;
  redirectIfFound?: boolean;
  requiredRole?: UserRole;
}

interface UseUserReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isUser: boolean;
}

export function useUser(options: UseUserOptions = {}): UseUserReturn {
  const {
    redirectTo = AUTH_ROUTES.LOGIN,
    redirectIfFound = false,
    requiredRole,
  } = options;

  const { user, isAuthenticated, isLoading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === UserRole.ADMIN;
  const isUser = user?.role === UserRole.USER;

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

    // Redirect if authenticated and redirectIfFound is true
    if (isAuthenticated && redirectIfFound) {
      const from = (location.state as { from?: string })?.from;
      const destination = from || getDefaultRouteForRole(user?.role);
      navigate(destination, { replace: true });
      return;
    }

    // Check for required role
    if (isAuthenticated && requiredRole && user?.role !== requiredRole) {
      navigate(getDefaultRouteForRole(user?.role), { replace: true });
    }
  }, [
    isLoading,
    isAuthenticated,
    redirectTo,
    redirectIfFound,
    requiredRole,
    user?.role,
    navigate,
    location,
  ]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isUser,
  };
}

function getDefaultRouteForRole(role?: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return AUTH_ROUTES.ADMIN_DASHBOARD;
    case UserRole.USER:
    default:
      return AUTH_ROUTES.DASHBOARD;
  }
}
