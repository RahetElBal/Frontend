import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AdminNotificationsBell } from "./admin-notifications-bell";

interface AppTopbarProps {
  className?: string;
  onSidebarToggle?: () => void;
  showSidebarToggle?: boolean;
}

export function AppTopbar({
  className,
  onSidebarToggle,
  showSidebarToggle = false,
}: AppTopbarProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/40 bg-background/95 py-2 backdrop-blur",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {showSidebarToggle && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={onSidebarToggle}
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="ms-auto flex items-center">
        <AdminNotificationsBell />
      </div>
    </div>
  );
}
