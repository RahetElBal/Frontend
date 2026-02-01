import {
  LayoutDashboard,
  Users,
  Calendar,
  Scissors,
  ShoppingCart,
  BarChart3,
  Settings,
  Building2,
  UserCog,
  Sliders,
} from "lucide-react";
import type { NavSection } from "@/types/navigation";

// Role types for navigation access control
type NavRole = "superadmin" | "admin" | "user";

// ============================================
// ROUTE PATHS
// ============================================

export const ROUTES = {
  // Auth
  LOGIN: "/login",
  AUTH_CALLBACK: "/auth/callback",

  // Dashboard
  DASHBOARD: "/dashboard",

  // CRM
  CLIENTS: "/clients",
  CLIENT_DETAIL: "/clients/:id",

  // Agenda
  AGENDA: "/agenda",

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

  // Settings
  SETTINGS: "/settings",
  SALON_SETTINGS: "/salon-settings",
  PROFILE: "/settings/profile",

  // Admin/Superadmin only
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_SALON: "/admin/salon",
  ADMIN_SETTINGS: "/admin/settings",
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
    id: "account",
    titleKey: "nav.sections.account",
    items: [
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
        id: "services",
        titleKey: "nav.services",
        href: ROUTES.SERVICES,
        icon: Scissors,
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
    ],
  },
  {
    id: "admin-settings",
    titleKey: "nav.sections.account",
    items: [
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
  isInAdminPanel: boolean = false,
): NavSection[] {
  if (isInAdminPanel) {
    // Admin panel is only for superadmin and admin
    if (role === "superadmin" || role === "admin") {
      return ADMIN_NAVIGATION;
    }
    return [];
  }

  // Regular salon panel
  switch (role) {
    case "superadmin":
      return ADMIN_SALON_NAVIGATION;
    case "admin":
      return ADMIN_SALON_NAVIGATION.map((section) =>
        section.id === "management"
          ? {
              ...section,
              items: section.items.filter((item) => item.id !== "services"),
            }
          : section,
      );
    case "user":
    default:
      return USER_NAVIGATION;
  }
}
