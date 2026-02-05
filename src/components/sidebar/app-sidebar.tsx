// app-sidebar.tsx (minor updates)
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PanelLeftClose, PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { SidebarLogo } from "./sidebar-logo";
import { SidebarNavSection } from "./sidebar-nav-section";
import { SidebarUserMenu } from "./sidebar-user-menu";
import type { Salon } from "@/types/entities";
import type { AuthUser, AppRole } from "@/types/user";
import { getNavigationForRole } from "@/constants/navigation";

interface AppSidebarProps {
  user: AuthUser;
  userRole: AppRole;
  currentSalon?: Salon | null;
  isInAdminPanel?: boolean; // Add this
  className?: string;
}

export function AppSidebar({
  user,
  userRole,
  currentSalon,
  isInAdminPanel = false,
  className,
}: AppSidebarProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const navigation = getNavigationForRole(userRole, isInAdminPanel);

  useEffect(() => {
    const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH;
    document.documentElement.style.setProperty(
      "--app-sidebar-width",
      `${width}px`,
    );
  }, [collapsed]);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 flex flex-col border-e border-border bg-card transition-all duration-300",
          collapsed ? "w-18" : "w-64",
          className,
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <SidebarLogo collapsed={collapsed} />
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setCollapsed(true)}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex justify-center py-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCollapsed(false)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Salon Switcher - Only show in salon panel, not admin panel */}
        {currentSalon && !isInAdminPanel && (
          <div className={cn("px-3 py-2", collapsed && "px-2")}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <div className="h-10 w-10 rounded-lg bg-linear-to-br from-accent-pink to-accent-blue flex items-center justify-center text-white text-sm font-bold">
                      {currentSalon.name}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{currentSalon.name}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-md bg-linear-to-br from-accent-pink to-accent-blue flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {currentSalon.name}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium truncate">
                    {currentSalon.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("salon.currentSalon")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation - Automatically filtered by role! */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-6">
            {navigation.map((section) => (
              <SidebarNavSection
                key={section.id}
                section={section}
                collapsed={collapsed}
                userRole={userRole}
              />
            ))}
          </div>
        </div>

        {/* Footer - User Menu */}
        <div className="mt-auto border-t border-border p-3">
          <SidebarUserMenu user={user} collapsed={collapsed} />
        </div>
      </aside>
    </TooltipProvider>
  );
}

export const SIDEBAR_WIDTH = 256;
export const SIDEBAR_WIDTH_COLLAPSED = 72;
