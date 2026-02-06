import { cn } from "@/lib/utils";
import { AdminNotificationsBell } from "./admin-notifications-bell";
import { useUser } from "@/hooks/useUser";

interface AppTopbarProps {
  className?: string;
}

export function AppTopbar({ className }: AppTopbarProps) {
  const { isAdmin, isSuperadmin } = useUser();
  const show = isAdmin || isSuperadmin;

  if (!show) {
    return null;
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-20 flex items-center justify-end gap-3 bg-background/95 backdrop-blur border-b border-border/40 py-2",
        className,
      )}
    >
      <AdminNotificationsBell />
    </div>
  );
}
