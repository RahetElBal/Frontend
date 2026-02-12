import { cn } from '@/lib/utils';

interface SidebarLogoProps {
  collapsed?: boolean;
  className?: string;
}

export function SidebarLogo({ collapsed, className }: SidebarLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
        <img
          src="/branding/beautiq-logo.svg"
          alt="Beautiq logo"
          className="h-10 w-10 object-contain"
          decoding="async"
        />
      </div>
      
      {/* Logo Text - Hidden when collapsed */}
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-foreground">
            Beautiq
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Salon Management
          </span>
        </div>
      )}
    </div>
  );
}
