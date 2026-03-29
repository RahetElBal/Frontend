import { type ReactNode, Suspense, useEffect, useState } from "react";

import type { AppRole } from "@/constants/enum";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { LoadingPanel } from "@/components/loading-panel";
import { PlanExpiryBanner } from "@/components/plan-expiry-banner";
import { AppTopbar } from "@/components/topbar/app-topbar";
import { MainLayout } from "@/layouts/main-layout";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Salon } from "@/pages/admin/salon/types";
import type { AuthUser } from "@/types/user";

interface PanelLayoutProps {
  children: ReactNode;
  currentSalon?: Salon | null;
  isInAdminPanel?: boolean;
  user: AuthUser;
  userRole: AppRole;
}

const SIDEBAR_WIDTH = 256;
const SIDEBAR_WIDTH_COLLAPSED = 72;

export function PanelLayout({
  children,
  currentSalon = null,
  isInAdminPanel = false,
  user,
  userRole,
}: PanelLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const desktopCollapsed = isMobile ? false : collapsed;

  useEffect(() => {
    const nextWidth = isMobile
      ? 0
      : desktopCollapsed
        ? SIDEBAR_WIDTH_COLLAPSED
        : SIDEBAR_WIDTH;

    document.documentElement.style.setProperty(
      "--app-sidebar-width",
      `${nextWidth}px`,
    );

    return () => {
      document.documentElement.style.setProperty("--app-sidebar-width", "0px");
    };
  }, [desktopCollapsed, isMobile]);

  useEffect(() => {
    if (!isMobile || !mobileSidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, mobileSidebarOpen]);

  return (
    <MainLayout>
      <AppSidebar
        user={user}
        userRole={userRole}
        currentSalon={currentSalon}
        isInAdminPanel={isInAdminPanel}
        collapsed={desktopCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileSidebarOpen}
        onCollapsedChange={setCollapsed}
        onMobileOpenChange={setMobileSidebarOpen}
      />

      <main
        className={cn("min-h-screen w-full transition-[padding] duration-300")}
        style={
          isMobile
            ? undefined
            : { paddingInlineStart: "var(--app-sidebar-width, 256px)" }
        }
      >
        <div className="w-full space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
          <PlanExpiryBanner />
          <AppTopbar
            showSidebarToggle={isMobile}
            onSidebarToggle={() => setMobileSidebarOpen(true)}
          />
          <Suspense fallback={<LoadingPanel className="min-h-[60vh]" />}>
            {children}
          </Suspense>
        </div>
      </main>
    </MainLayout>
  );
}
