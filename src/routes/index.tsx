import { useUser } from '@/hooks/useUser';
import { Spinner } from '@/components/spinner';
import { UserRole } from '@/types/entities';

// Placeholder dashboard - will be replaced with actual dashboard later
export function DashboardPage() {
  const { user, isLoading, isAdmin } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {displayName}!
        </h1>
        <p className="text-muted-foreground">
          Role: {user?.role} {isAdmin && '(Administrator)'}
        </p>
        <p className="text-sm text-muted-foreground">
          Dashboard coming soon...
        </p>
      </div>
    </div>
  );
}

// Admin dashboard placeholder
export function AdminDashboardPage() {
  const { user, isLoading } = useUser({ requiredRole: UserRole.ADMIN });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome, {displayName}</p>
        <p className="text-sm text-muted-foreground">
          Admin features coming soon...
        </p>
      </div>
    </div>
  );
}
