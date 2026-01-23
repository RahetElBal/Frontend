import { Outlet } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { Spinner } from '@/components/spinner';
import { MainLayout } from '@/layouts/main-layout';
import { SalonSelector } from '@/components/salon-selector';
import { useUser } from '@/hooks/useUser';
import { useSalon } from '@/contexts/SalonProvider';
import { USER_NAVIGATION } from '@/constants/navigation';

/**
 * Layout for regular users (salon staff)
 * Includes sidebar with user navigation
 * Requires salon selection before showing content
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

  // If user has salons but none selected, show salon selector
  if (salons.length > 0 && !currentSalon) {
    return <SalonSelector onSelect={() => refreshSalons()} />;
  }

  // If user has no salons (new user or not assigned), show selector with empty state
  if (salons.length === 0) {
    return <SalonSelector />;
  }

  return (
    <MainLayout>
      {/* Sidebar */}
      <AppSidebar
        navigation={USER_NAVIGATION}
        user={user}
        userRole={user.role}
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
