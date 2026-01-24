import { Outlet, Navigate } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { Spinner } from '@/components/spinner';
import { MainLayout } from '@/layouts/main-layout';
import { SalonSelector } from '@/components/salon-selector';
import { useUser } from '@/hooks/useUser';
import { useSalon } from '@/contexts/SalonProvider';
import { getNavigationForRole, ROUTES } from '@/constants/navigation';
import type { AppRole } from '@/types/user';

/**
 * Layout for regular users and admins (salon view)
 * Navigation varies based on role:
 * - user: Limited access (no analytics, settings)
 * - admin: Full salon management access
 * - superadmin: Redirected to admin panel (shouldn't access user routes directly)
 */
export function UserLayout() {
  const { user, isLoading: userLoading, isAuthenticated } = useUser();
  const { currentSalon, salons, isLoading: salonLoading, refreshSalons } = useSalon();

  const isLoading = userLoading || salonLoading;

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
  const isSuperadmin = user.isSuperadmin || user.role === 'superadmin';
  const isAdmin = user.role === 'admin';

  // Superadmin should use admin panel, not user routes
  // Redirect them to admin panel
  if (isSuperadmin) {
    return <Navigate to={ROUTES.ADMIN} replace />;
  }

  // Admin without any salons should go to admin panel to create one
  if (isAdmin && salons.length === 0) {
    return <Navigate to={ROUTES.ADMIN} replace />;
  }

  // Admin with salons but none selected - show salon selector
  if (isAdmin && salons.length > 0 && !currentSalon) {
    return <SalonSelector onSelect={() => refreshSalons()} />;
  }

  // Regular user with no salons - show "contact admin" message
  if (!isAdmin && salons.length === 0) {
    return <SalonSelector />;
  }

  // Regular user with salons but none selected - show salon selector
  if (!isAdmin && salons.length > 0 && !currentSalon) {
    return <SalonSelector onSelect={() => refreshSalons()} />;
  }

  // Get navigation based on user role
  const userRole = (user.role || 'user') as AppRole;
  const navigation = getNavigationForRole(userRole, false);

  return (
    <MainLayout>
      {/* Sidebar */}
      <AppSidebar
        navigation={navigation}
        user={user}
        userRole={userRole}
        currentSalon={currentSalon}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          'ps-64' // Padding start for sidebar (RTL-aware)
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </MainLayout>
  );
}
