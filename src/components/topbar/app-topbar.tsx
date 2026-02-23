import { cn } from "@/lib/utils";
import { AdminNotificationsBell } from "./admin-notifications-bell";
import { PlanBadge } from "./plan-badge";

interface AppTopbarProps {
  className?: string;
}

export function AppTopbar({ className }: AppTopbarProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 flex items-center justify-between gap-3 bg-background/95 backdrop-blur border-b border-border/40 py-2",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <PlanBadge />
      </div>
      <div className="ms-auto flex items-center">
        <AdminNotificationsBell />
      </div>
    </div>
  );
}
