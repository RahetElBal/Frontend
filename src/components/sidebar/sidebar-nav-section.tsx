import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { SidebarNavItem } from './sidebar-nav-item';
import type { AppRole } from "@/constants/enum";
import type { NavSection } from '@/types/navigation';

interface SidebarNavSectionProps {
  section: NavSection;
  collapsed?: boolean;
  userRole?: AppRole;
}

export function SidebarNavSection({
  section,
  collapsed,
  userRole,
}: SidebarNavSectionProps) {
  const { t } = useTranslation();

  // Filter items based on user role
  const visibleItems = section.items.filter((item) => {
    if (!item.roles) return true;
    return userRole && item.roles.includes(userRole);
  });

  // Don't render if no visible items
  if (visibleItems.length === 0) return null;

  // Check if section itself is role-restricted
  if (section.roles && userRole && !section.roles.includes(userRole)) {
    return null;
  }

  return (
    <div className="space-y-1">
      {/* Section Header */}
      {section.titleKey && !collapsed && (
        <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {t(section.titleKey)}
        </h3>
      )}

      {/* Section Divider for collapsed state */}
      {section.titleKey && collapsed && (
        <div className={cn('mx-auto my-2 h-px w-6 bg-border')} />
      )}

      {/* Nav Items */}
      <nav className="space-y-0.5">
        {visibleItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </div>
  );
}
