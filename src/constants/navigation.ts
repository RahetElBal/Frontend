import {
  LayoutDashboard,
  Users,
  Calendar,
  History,
  Scissors,
  ShoppingCart,
  BarChart3,
  Settings,
  Bell,
  Building2,
  UserCog,
  Sliders,
  Heart,
  LifeBuoy,
  Megaphone,
} from "lucide-react";
import type { NavSection } from "@/types/navigation";

// Role types for navigation access control
type NavRole = "superadmin" | "admin" | "user";

// ============================================
// ROUTE PATHS
// ============================================

export const ROUTES = {
  // Public
  HOME: "/",
  TERMS: "/terms",
  PRIVACY: "/privacy",

  // Auth
  LOGIN: "/login",
  AUTH_CALLBACK: "/auth/callback",
  MOBILE_APP: "/mobile-app",

  // Dashboard
  DASHBOARD: "/dashboard",

  // CRM
  CLIENTS: "/clients",
  CLIENT_DETAIL: "/clients/:id",

  // Agenda
  AGENDA: "/agenda",
  AGENDA_HISTORY: "/history",

  // Services
  SERVICES: "/services",
  SERVICE_DETAIL: "/services/:id",

  // Products & Stock
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  STOCK: "/stock",

  // Sales & POS
  SALES: "/sales",
  SALE_DETAIL: "/sales/:id",
  POS: "/pos",

  // Loyalty
  LOYALTY: "/loyalty",

  // Gift Cards
  GIFT_CARDS: "/gift-cards",

  // Marketing
  MARKETING: "/marketing",
  CAMPAIGNS: "/marketing/campaigns",

  // Analytics
  ANALYTICS: "/analytics",
  REPORTS: "/analytics/reports",

  // Staff
  STAFF: "/staff",

  // Promotions
  PROMOTIONS: "/promotions",
  REPORT: "/report",

  // Settings
  SETTINGS: "/settings",
  SALON_SETTINGS: "/salon-settings",
  SALON_SETTINGS_GENERAL: "/salon-settings/general",
  SALON_SETTINGS_HOURS: "/salon-settings/hours",
  SALON_SETTINGS_NOTIFICATIONS: "/salon-settings/notifications",
  SALON_SETTINGS_LOYALTY: "/salon-settings/loyalty",
  PROFILE: "/settings/profile",
  NOTIFICATIONS: "/notifications",

  // Admin/Superadmin only
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_SALON: "/admin/salon",
  ADMIN_SERVICES: "/admin/services",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_REPORT: "/admin/report",
} as const;

// ============================================
// USER NAVIGATION (Regular Staff - Limited)
// Only basic operational pages
// ============================================

export const USER_NAVIGATION: NavSection[] = [
  {
    id: "main",
    items: [
      {
        id: "dashboard",
        titleKey: "nav.dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "operations",
    titleKey: "nav.sections.management",
    items: [
      {
        id: "clients",
        titleKey: "nav.clients",
        href: ROUTES.CLIENTS,
        icon: Users,
      },
      {
        id: "agenda",
        titleKey: "nav.agenda",
        href: ROUTES.AGENDA,
        icon: Calendar,
      },
      {
        id: "services",
        titleKey: "nav.services",
        href: ROUTES.SERVICES,
        icon: Scissors,
      },
    ],
  },
  {
    id: "account",
    titleKey: "nav.sections.account",
    items: [
      {
        id: "notifications",
        titleKey: "nav.notifications",
        href: ROUTES.NOTIFICATIONS,
        icon: Bell,
      },
      {
        id: "support-report",
        titleKey: "nav.report",
        href: ROUTES.REPORT,
        icon: LifeBuoy,
      },
      {
        id: "settings",
        titleKey: "nav.settings",
        href: ROUTES.SETTINGS,
        icon: Settings,
      },
    ],
  },
];

// ============================================
// ADMIN NAVIGATION (Salon Owner/Manager - Full Salon Access)
// All operational pages + salon settings + analytics
// ============================================

export const ADMIN_SALON_NAVIGATION: NavSection[] = [
  {
    id: "main",
    items: [
      {
        id: "dashboard",
        titleKey: "nav.dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "management",
    titleKey: "nav.sections.management",
    items: [
      {
        id: "clients",
        titleKey: "nav.clients",
        href: ROUTES.CLIENTS,
        icon: Users,
      },
      {
        id: "agenda",
        titleKey: "nav.agenda",
        href: ROUTES.AGENDA,
        icon: Calendar,
      },
      {
        id: "agenda-history",
        titleKey: "nav.history",
        href: ROUTES.AGENDA_HISTORY,
        icon: History,
      },
      {
        id: "services",
        titleKey: "nav.services",
        href: ROUTES.SERVICES,
        icon: Scissors,
      },
      {
        id: "loyalty",
        titleKey: "nav.loyalty",
        href: ROUTES.LOYALTY,
        icon: Heart,
      },
      {
        id: "marketing",
        titleKey: "nav.marketing",
        href: ROUTES.MARKETING,
        icon: Megaphone,
      },
    ],
  },
  {
    id: "inventory",
    titleKey: "nav.sections.inventory",
    items: [
      {
        id: "sales",
        titleKey: "nav.sales",
        href: ROUTES.SALES,
        icon: ShoppingCart,
      },
    ],
  },
  {
    id: "insights",
    titleKey: "nav.sections.insights",
    items: [
      {
        id: "analytics",
        titleKey: "nav.analytics",
        href: ROUTES.ANALYTICS,
        icon: BarChart3,
      },
    ],
  },
  {
    id: "account",
    titleKey: "nav.sections.account",
    items: [
      {
        id: "salon-settings",
        titleKey: "nav.salonSettings",
        href: ROUTES.SALON_SETTINGS,
        icon: Sliders,
      },
      {
        id: "notifications",
        titleKey: "nav.notifications",
        href: ROUTES.NOTIFICATIONS,
        icon: Bell,
      },
      {
        id: "support-report",
        titleKey: "nav.report",
        href: ROUTES.REPORT,
        icon: LifeBuoy,
      },
      {
        id: "settings",
        titleKey: "nav.settings",
        href: ROUTES.SETTINGS,
        icon: Settings,
      },
    ],
  },
];

// ============================================
// SUPERADMIN/ADMIN PANEL NAVIGATION
// Platform management
// ============================================

export const ADMIN_NAVIGATION: NavSection[] = [
  {
    id: "main",
    items: [
      {
        id: "admin-dashboard",
        titleKey: "nav.admin.dashboard",
        href: ROUTES.ADMIN,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "administration",
    titleKey: "nav.sections.administration",
    items: [
      {
        id: "admin-users",
        titleKey: "nav.admin.users",
        href: ROUTES.ADMIN_USERS,
        icon: UserCog,
      },
      {
        id: "admin-salons",
        titleKey: "nav.admin.salon",
        href: ROUTES.ADMIN_SALON,
        icon: Building2,
      },
      {
        id: "admin-services",
        titleKey: "nav.admin.services",
        href: ROUTES.ADMIN_SERVICES,
        icon: Scissors,
      },
    ],
  },
  {
    id: "admin-settings",
    titleKey: "nav.sections.account",
    items: [
      {
        id: "admin-support-report",
        titleKey: "nav.report",
        href: ROUTES.ADMIN_REPORT,
        icon: LifeBuoy,
      },
      {
        id: "admin-settings-page",
        titleKey: "nav.admin.settings",
        href: ROUTES.ADMIN_SETTINGS,
        icon: Settings,
      },
    ],
  },
];

/**
 * Get navigation based on user role
 */
export function getNavigationForRole(
  role: NavRole,
  isInAdminPanel: boolean = false
): NavSection[] {
  if (isInAdminPanel) {
    if (role === "superadmin") {
      return ADMIN_NAVIGATION;
    }
    if (role === "admin") {
      return ADMIN_NAVIGATION.map((section) => ({
        ...section,
        items: section.items.filter((item) => item.id !== "admin-support-report"),
      }));
    }
    return [];
  }

  // Regular salon panel
  switch (role) {
    case "superadmin":
      return ADMIN_SALON_NAVIGATION.map((section) =>
        section.id === "management"
          ? {
              ...section,
              items: section.items.filter((item) => item.id !== "agenda-history"),
            }
          : section
      );
    case "admin":
      return ADMIN_SALON_NAVIGATION.map((section) =>
        section.id === "management"
          ? {
              ...section,
              items: section.items.filter((item) => item.id !== "services"),
            }
          : section
      );
    case "user":
    default:
      return USER_NAVIGATION;
  }
}
