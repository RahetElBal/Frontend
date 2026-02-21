import { lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { LoginPage } from "@/routes/login";
import AuthCallback from "@/routes/auth-callback";
import LandingPage from "@/routes/landing";
import TermsPage from "@/routes/terms";
import PrivacyPage from "@/routes/privacy";
import { UserLayout } from "@/layouts/user-layout";
import { AdminLayout } from "@/layouts/admin-layout";
import { ROUTES } from "@/constants/navigation";

const AdminDashboardPage = lazy(() => import("./pages/admin/dashboard"));
const AdminUsersPage = lazy(() =>
  import("./pages/admin/users").then((module) => ({
    default: module.AdminUsersPage,
  })),
);
const SalonsPage = lazy(() => import("./pages/admin/salon"));
const AdminServicesPage = lazy(() => import("./pages/admin/services"));
const PromotionsPage = lazy(() =>
  import("./pages/admin/promotions").then((module) => ({
    default: module.PromotionsPage,
  })),
);
const AnalyticsPage = lazy(() =>
  import("./pages/admin/analytics").then((module) => ({
    default: module.AnalyticsPage,
  })),
);
const MarketingPage = lazy(() =>
  import("./pages/admin/marketing").then((module) => ({
    default: module.MarketingPage,
  })),
);
const SalonSettingsPage = lazy(() =>
  import("./pages/admin/salon-settings").then((module) => ({
    default: module.SalonSettingsPage,
  })),
);
const LoyaltyPage = lazy(() =>
  import("./pages/admin/loyalty").then((module) => ({
    default: module.LoyaltyPage,
  })),
);

const ClientsPage = lazy(() =>
  import("./pages/user/clients").then((module) => ({
    default: module.ClientsPage,
  })),
);
const DashboardPage = lazy(() =>
  import("./pages/user/dashboard").then((module) => ({
    default: module.DashboardPage,
  })),
);
const AgendaPage = lazy(() =>
  import("./pages/user/agenda").then((module) => ({
    default: module.AgendaPage,
  })),
);
const AgendaHistoryPage = lazy(() =>
  import("./pages/user/agenda-history").then((module) => ({
    default: module.AgendaHistoryPage,
  })),
);
const ServicesPage = lazy(() =>
  import("./pages/user/services").then((module) => ({
    default: module.ServicesPage,
  })),
);
const StaffPage = lazy(() =>
  import("./pages/admin/staff").then((module) => ({
    default: module.StaffPage,
  })),
);
const ProductsPage = lazy(() =>
  import("./pages/user/products").then((module) => ({
    default: module.ProductsPage,
  })),
);
const SalesPage = lazy(() =>
  import("./pages/user/sales").then((module) => ({
    default: module.SalesPage,
  })),
);
const SettingsPage = lazy(() =>
  import("./pages/user/settings").then((module) => ({
    default: module.SettingsPage,
  })),
);
const NotificationsPage = lazy(() =>
  import("./pages/user/notifications").then((module) => ({
    default: module.NotificationsPage,
  })),
);
const SupportReportPage = lazy(() => import("./pages/user/report"));
const MobileAppDownloadPage = lazy(() => import("./routes/mobile-app"));

function AgendaPageWrapper() {
  const location = useLocation();
  return <AgendaPage key={location.search} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path={ROUTES.HOME} element={<LandingPage />} />
        <Route path={ROUTES.TERMS} element={<TermsPage />} />
        <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
        <Route path={ROUTES.MOBILE_APP} element={<MobileAppDownloadPage />} />

        {/* Auth routes - no layout */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />

        {/* User routes - with UserLayout */}
        <Route element={<UserLayout />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.CLIENTS} element={<ClientsPage />} />
        <Route path={ROUTES.AGENDA} element={<AgendaPageWrapper />} />
        <Route path={ROUTES.AGENDA_HISTORY} element={<AgendaHistoryPage />} />
        <Route path={ROUTES.SERVICES} element={<ServicesPage />} />
          <Route path={ROUTES.STAFF} element={<StaffPage />} />
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path={ROUTES.SALES} element={<SalesPage />} />
          <Route path={ROUTES.PROMOTIONS} element={<PromotionsPage />} />
          <Route path={ROUTES.MARKETING} element={<MarketingPage />} />
          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          <Route path={ROUTES.LOYALTY} element={<LoyaltyPage />} />
          <Route path={ROUTES.SALON_SETTINGS} element={<SalonSettingsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.PROFILE} element={<SettingsPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={ROUTES.REPORT} element={<SupportReportPage />} />
        </Route>

        {/* Admin routes - with AdminLayout */}
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
          <Route path={ROUTES.ADMIN_SALON} element={<SalonsPage />} />
          <Route path={ROUTES.ADMIN_SERVICES} element={<AdminServicesPage />} />
          <Route path={ROUTES.ADMIN_SETTINGS} element={<SettingsPage />} />
        </Route>

        {/* 404 - redirect to home */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
