import {
  LayoutDashboard,
  Users,
  Calendar,
  Scissors,
  Package,
  ShoppingCart,
  Heart,
  Gift,
  Mail,
  BarChart3,
  Settings,
  Building2,
  UserCog,
} from 'lucide-react';
import type { NavSection } from '@/types/navigation';
import { UserRole } from '@/types/user';

// ============================================
// ROUTE PATHS
// ============================================

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // CRM
  CLIENTS: '/clients',
  CLIENT_DETAIL: '/clients/:id',
  
  // Agenda
  AGENDA: '/agenda',
  
  // Services
  SERVICES: '/services',
  SERVICE_DETAIL: '/services/:id',
  
  // Products & Stock
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  STOCK: '/stock',
  
  // Sales & POS
  SALES: '/sales',
  SALE_DETAIL: '/sales/:id',
  POS: '/pos',
  
  // Loyalty
  LOYALTY: '/loyalty',
  
  // Gift Cards
  GIFT_CARDS: '/gift-cards',
  
  // Marketing
  MARKETING: '/marketing',
  CAMPAIGNS: '/marketing/campaigns',
  
  // Analytics
  ANALYTICS: '/analytics',
  REPORTS: '/analytics/reports',
  
  // Settings
  SETTINGS: '/settings',
  PROFILE: '/settings/profile',
  
  // Admin only
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SALONS: '/admin/salons',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

// ============================================
// USER NAVIGATION (Salon Staff)
// ============================================

export const USER_NAVIGATION: NavSection[] = [
  {
    id: 'main',
    items: [
      {
        id: 'dashboard',
        titleKey: 'nav.dashboard',
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'management',
    titleKey: 'nav.sections.management',
    items: [
      {
        id: 'clients',
        titleKey: 'nav.clients',
        href: ROUTES.CLIENTS,
        icon: Users,
      },
      {
        id: 'agenda',
        titleKey: 'nav.agenda',
        href: ROUTES.AGENDA,
        icon: Calendar,
      },
      {
        id: 'services',
        titleKey: 'nav.services',
        href: ROUTES.SERVICES,
        icon: Scissors,
      },
    ],
  },
  {
    id: 'inventory',
    titleKey: 'nav.sections.inventory',
    items: [
      {
        id: 'products',
        titleKey: 'nav.products',
        href: ROUTES.PRODUCTS,
        icon: Package,
      },
      {
        id: 'sales',
        titleKey: 'nav.sales',
        href: ROUTES.SALES,
        icon: ShoppingCart,
      },
    ],
  },
  {
    id: 'engagement',
    titleKey: 'nav.sections.engagement',
    items: [
      {
        id: 'loyalty',
        titleKey: 'nav.loyalty',
        href: ROUTES.LOYALTY,
        icon: Heart,
      },
      {
        id: 'gift-cards',
        titleKey: 'nav.giftCards',
        href: ROUTES.GIFT_CARDS,
        icon: Gift,
      },
      {
        id: 'marketing',
        titleKey: 'nav.marketing',
        href: ROUTES.MARKETING,
        icon: Mail,
      },
    ],
  },
  {
    id: 'insights',
    titleKey: 'nav.sections.insights',
    items: [
      {
        id: 'analytics',
        titleKey: 'nav.analytics',
        href: ROUTES.ANALYTICS,
        icon: BarChart3,
      },
    ],
  },
  {
    id: 'account',
    titleKey: 'nav.sections.account',
    items: [
      {
        id: 'settings',
        titleKey: 'nav.settings',
        href: ROUTES.SETTINGS,
        icon: Settings,
      },
    ],
  },
];

// ============================================
// ADMIN NAVIGATION
// ============================================

export const ADMIN_NAVIGATION: NavSection[] = [
  {
    id: 'main',
    items: [
      {
        id: 'admin-dashboard',
        titleKey: 'nav.admin.dashboard',
        href: ROUTES.ADMIN,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'administration',
    titleKey: 'nav.sections.administration',
    roles: [UserRole.ADMIN],
    items: [
      {
        id: 'admin-users',
        titleKey: 'nav.admin.users',
        href: ROUTES.ADMIN_USERS,
        icon: UserCog,
        roles: [UserRole.ADMIN],
      },
      {
        id: 'admin-salons',
        titleKey: 'nav.admin.salons',
        href: ROUTES.ADMIN_SALONS,
        icon: Building2,
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    id: 'admin-settings',
    titleKey: 'nav.sections.account',
    items: [
      {
        id: 'admin-settings-page',
        titleKey: 'nav.admin.settings',
        href: ROUTES.ADMIN_SETTINGS,
        icon: Settings,
      },
    ],
  },
];
