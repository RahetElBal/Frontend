import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { NavItem } from '@/types/navigation';

interface SidebarNavItemProps {
  item: NavItem;
  collapsed?: boolean;
}

export function SidebarNavItem({ item, collapsed }: SidebarNavItemProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const Icon = item.icon;
  
  const isActive = location.pathname === item.href || 
    location.pathname.startsWith(item.href + '/');

  const linkContent = (
    <NavLink
      to={item.href}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        'hover:bg-accent-pink-100 hover:text-accent-pink-700',
        isActive
          ? 'bg-accent-pink-200/80 text-accent-pink-800 shadow-sm ring-1 ring-accent-pink-300/70'
          : 'text-muted-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon
        className={cn(
          'h-5 w-5 shrink-0 transition-colors',
          isActive
            ? 'text-accent-pink-800'
            : 'text-muted-foreground group-hover:text-accent-pink-700'
        )}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{t(item.titleKey)}</span>
          {item.badge && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-pink-500 px-1.5 text-[10px] font-semibold text-white">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {t(item.titleKey)}
          {item.badge && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-pink-500 px-1.5 text-[10px] font-semibold text-white">
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
