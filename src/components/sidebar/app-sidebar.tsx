import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { PanelLeftClose, PanelLeft, X } from "lucide-react";
import { useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { MediaImage } from "@/components/media-image";
import { SidebarLogo } from "./sidebar-logo";
import { SidebarNavSection } from "./sidebar-nav-section";
import { SidebarUserMenu } from "./sidebar-user-menu";
import type { AppRole } from "@/constants/enum";
import type { Salon } from "@/pages/admin/salon/types";
import type { AuthUser } from "@/types/user";
import { getNavigationForRole } from "@/constants/navigation";

const DEFAULT_SALON_IMAGE = "/salon-placeholder.svg";

interface AppSidebarProps {
  collapsed: boolean;
  user: AuthUser;
  userRole: AppRole;
  currentSalon?: Salon | null;
  isInAdminPanel?: boolean; // Add this
  isMobile?: boolean;
  mobileOpen?: boolean;
  className?: string;
  onCollapsedChange: (collapsed: boolean) => void;
  onMobileOpenChange: (open: boolean) => void;
}

export function AppSidebar({
  collapsed,
  user,
  userRole,
  currentSalon,
  isInAdminPanel = false,
  isMobile = false,
  mobileOpen = false,
  className,
  onCollapsedChange,
  onMobileOpenChange,
}: AppSidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigation = getNavigationForRole(userRole, isInAdminPanel);
  const visibleNavigation = useMemo(() => navigation, [navigation]);
  const previousLocation = useRef(`${location.pathname}${location.search}`);

  useEffect(() => {
    const nextLocation = `${location.pathname}${location.search}`;

    if (!isMobile) {
      previousLocation.current = nextLocation;
      return;
    }

    if (mobileOpen && previousLocation.current !== nextLocation) {
      onMobileOpenChange(false);
    }

    previousLocation.current = nextLocation;
  }, [isMobile, location.pathname, location.search, mobileOpen, onMobileOpenChange]);

  return (
    <TooltipProvider>
      {isMobile && mobileOpen && (
        <button
          type="button"
          aria-label={t("common.close")}
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => onMobileOpenChange(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex flex-col border-e border-border bg-card transition-all duration-300",
          isMobile
            ? "w-[280px] max-w-[calc(100vw-2rem)] shadow-xl"
            : collapsed
              ? "w-[72px]"
              : "w-64",
          isMobile
            ? mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0",
          className,
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <SidebarLogo collapsed={collapsed} />
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 lg:hidden"
              onClick={() => onMobileOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {!isMobile && !collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onCollapsedChange(true)}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {!isMobile && collapsed && (
          <div className="flex justify-center py-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onCollapsedChange(false)}
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
                    <MediaImage
                      src={currentSalon.logo}
                      fallbackSrc={DEFAULT_SALON_IMAGE}
                      alt={currentSalon.name}
                      className="h-10 w-10 rounded-lg object-cover border border-border/60 bg-muted"
                      loading="lazy"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{currentSalon.name}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                <MediaImage
                  src={currentSalon.logo}
                  fallbackSrc={DEFAULT_SALON_IMAGE}
                  alt={currentSalon.name}
                  className="h-8 w-8 rounded-md object-cover border border-border/60 bg-muted shrink-0"
                  loading="lazy"
                />
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
            {visibleNavigation.map((section) => (
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
