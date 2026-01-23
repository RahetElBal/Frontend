import type { LucideIcon } from 'lucide-react';
import type { UserRole } from './user';

export interface NavItem {
  id: string;
  titleKey: string; // i18n key
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  roles?: UserRole[]; // If undefined, visible to all roles
  children?: NavItem[];
}

export interface NavSection {
  id: string;
  titleKey?: string; // i18n key for section header
  items: NavItem[];
  roles?: UserRole[]; // If undefined, visible to all roles
}

export interface BreadcrumbItem {
  titleKey: string;
  href?: string;
}
