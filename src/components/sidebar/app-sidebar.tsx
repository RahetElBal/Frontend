import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelLeftClose, PanelLeft, ChevronDown, Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { SidebarLogo } from './sidebar-logo';
import { SidebarNavSection } from './sidebar-nav-section';
import { SidebarUserMenu } from './sidebar-user-menu';
import { useSalon } from '@/contexts/SalonProvider';
import type { NavSection } from '@/types/navigation';
import type { User, UserRole, Salon } from '@/types/entities';

interface AppSidebarProps {
  navigation: NavSection[];
  user: User;
  userRole: UserRole;
  currentSalon?: Salon | null;
  className?: string;
}

export function AppSidebar({
  navigation,
  user,
  userRole,
  currentSalon,
  className,
}: AppSidebarProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const { salons, selectSalon } = useSalon();

  const showSalonSwitcher = currentSalon && salons.length > 1;

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

        {/* Salon Switcher */}
        {currentSalon && (
          <div className={cn('px-3 py-2', collapsed && 'px-2')}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-accent-pink to-accent-blue flex items-center justify-center text-white text-sm font-bold">
                      {currentSalon.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{currentSalon.name}</p>
                </TooltipContent>
              </Tooltip>
            ) : showSalonSwitcher ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-auto py-2 px-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-8 w-8 rounded-md bg-gradient-to-br from-accent-pink to-accent-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {currentSalon.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-sm font-medium truncate">{currentSalon.name}</p>
                        <p className="text-xs text-muted-foreground">{t('salon.currentSalon')}</p>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {t('salon.switchSalon')}
                  </div>
                  <DropdownMenuSeparator />
                  {salons.map((salon) => (
                    <DropdownMenuItem
                      key={salon.id}
                      onClick={() => selectSalon(salon)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-gradient-to-br from-accent-pink to-accent-blue flex items-center justify-center text-white text-xs font-bold">
                          {salon.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{salon.name}</span>
                      </div>
                      {salon.id === currentSalon.id && (
                        <Check className="h-4 w-4 text-accent-pink" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-accent-pink to-accent-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {currentSalon.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium truncate">{currentSalon.name}</p>
                  <p className="text-xs text-muted-foreground">{t('salon.currentSalon')}</p>
                </div>
              </div>
            )}
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
