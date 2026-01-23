import { Outlet } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { Spinner } from '@/components/spinner';
import { MainLayout } from '@/layouts/main-layout';
import { useUser } from '@/hooks/useUser';
import { USER_NAVIGATION } from '@/constants/navigation';

/**
 * Layout for regular users (salon staff)
 * Includes sidebar with user navigation
 */
export function UserLayout() {
  const { user, isLoading, isAuthenticated } = useUser();

  // Show loading spinner while checking auth
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

  return (
    <MainLayout>
      {/* Sidebar */}
      <AppSidebar
        navigation={USER_NAVIGATION}
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
