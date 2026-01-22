import { useUser } from '@/hooks/useUser';
import { Spinner } from '@/components/spinner';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {user?.name}!
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
  const { user, isLoading } = useUser({ requiredRole: 'Admin' });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome, {user?.name}</p>
        <p className="text-sm text-muted-foreground">
          Admin features coming soon...
        </p>
      </div>
    </div>
  );
}
