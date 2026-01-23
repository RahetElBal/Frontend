import { Outlet } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { Spinner } from '@/components/spinner';
import { MainLayout } from '@/layouts/main-layout';
import { useUser } from '@/hooks/useUser';
import { ADMIN_NAVIGATION } from '@/constants/navigation';
import { UserRole } from '@/types/user';

/**
 * Layout for admin users
 * Includes sidebar with admin navigation
 * Requires Admin role
 */
export function AdminLayout() {
  const { user, isLoading, isAuthenticated } = useUser({
    requiredRole: UserRole.ADMIN,
  });

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  // If not authenticated or not admin, useUser will redirect
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <MainLayout>
      {/* Sidebar */}
      <AppSidebar
        navigation={ADMIN_NAVIGATION}
        user={user}
        userRole={user.role}
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
