import { useState } from 'react';
import { PanelLeftClose, PanelLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { SidebarLogo } from './sidebar-logo';
import { SidebarNavSection } from './sidebar-nav-section';
import { SidebarUserMenu } from './sidebar-user-menu';
import type { NavSection } from '@/types/navigation';
import type { User, UserRole } from '@/types/user';

interface AppSidebarProps {
  navigation: NavSection[];
  user: User;
  userRole: UserRole;
  className?: string;
}

export function AppSidebar({
  navigation,
  user,
  userRole,
  className,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-40 flex flex-col border-e border-border bg-card transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64',
          className
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

        {/* Navigation */}
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

// Export collapsed width constant for layout calculations
export const SIDEBAR_WIDTH = 256; // 16rem = 256px
export const SIDEBAR_WIDTH_COLLAPSED = 72; // 4.5rem = 72px
