import type { LucideIcon } from 'lucide-react';
import type { AppRole } from "@/constants/enum";

export interface NavItem {
  id: string;
  titleKey: string; // i18n key
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  roles?: AppRole[]; // If undefined, visible to all roles
  children?: NavItem[];
}

export interface NavSection {
  id: string;
  titleKey?: string; // i18n key for section header
  items: NavItem[];
  roles?: AppRole[]; // If undefined, visible to all roles
}

export interface BreadcrumbItem {
  titleKey: string;
  href?: string;
}
