import { cn } from '@/lib/utils';

interface SidebarLogoProps {
  collapsed?: boolean;
  className?: string;
}

export function SidebarLogo({ collapsed, className }: SidebarLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-pink-400 to-accent-pink-500 shadow-lg shadow-accent-pink-200">
        <span className="text-lg font-bold text-white">B</span>
      </div>
      
      {/* Logo Text - Hidden when collapsed */}
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-xl font-display font-bold tracking-tight text-foreground">
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
