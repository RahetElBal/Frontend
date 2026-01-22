import { useTranslation } from 'react-i18next';
import { LogOut, Settings, User, ChevronUp, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuthentication } from '@/hooks/useAuthentication';
import { useLanguage } from '@/hooks/useLanguage';
import { ROUTES } from '@/constants/navigation';
import type { User as UserType } from '@/types/entities';

interface SidebarUserMenuProps {
  user: UserType;
  collapsed?: boolean;
}

export function SidebarUserMenu({ user, collapsed }: SidebarUserMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuthentication();
  const { languages, currentLanguage, changeLanguage } = useLanguage();

  // Build display name from firstName and lastName
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user.email[0].toUpperCase();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const menuContent = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted',
            collapsed && 'justify-center'
          )}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={user.picture} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-foreground">
                  {displayName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align={collapsed ? 'center' : 'end'}
        side={collapsed ? 'right' : 'top'}
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
            <User className="mr-2 h-4 w-4" />
            {t('nav.user.profile')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(ROUTES.SETTINGS)}>
            <Settings className="mr-2 h-4 w-4" />
            {t('nav.user.settings')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Globe className="mr-2 h-4 w-4" />
            {t('languages.selectLanguage')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={currentLanguage}
              onValueChange={(value) => changeLanguage(value as typeof currentLanguage)}
            >
              {languages.map((lang) => (
                <DropdownMenuRadioItem key={lang.code} value={lang.code}>
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t('nav.user.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{menuContent}</TooltipTrigger>
        <TooltipContent side="right">
          <p className="font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return menuContent;
}
