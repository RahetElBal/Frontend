import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { LoginPage } from "@/routes/login";
import AuthCallback from "@/routes/auth-callback";
import { UserLayout } from "@/layouts/user-layout";
import { AdminLayout } from "@/layouts/admin-layout";
import { ROUTES } from "@/constants/navigation";

import AdminDashboardPage from "./pages/admin/dashboard";
import { AdminUsersPage } from "./pages/admin/users";
import SalonsPage from "./pages/admin/salon";
import { ClientsPage } from "./pages/user/clients";
import { DashboardPage } from "./pages/user/dashboard";
import { AgendaPage } from "./pages/user/agenda";
import { ServicesPage } from "./pages/user/services";
import { StaffPage } from "./pages/admin/staff";
import { ProductsPage } from "./pages/user/products";
import { SalesPage } from "./pages/user/sales";
import { PromotionsPage } from "./pages/admin/promotions";
import { AnalyticsPage } from "./pages/admin/analytics";
import { SalonSettingsPage } from "./pages/admin/salon-settings";
import { SettingsPage } from "./pages/user/settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - no layout */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />

        {/* User routes - with UserLayout */}
        <Route element={<UserLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.CLIENTS} element={<ClientsPage />} />
          <Route path={ROUTES.AGENDA} element={<AgendaPage />} />
          <Route path={ROUTES.SERVICES} element={<ServicesPage />} />
          <Route path={ROUTES.STAFF} element={<StaffPage />} />
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path={ROUTES.SALES} element={<SalesPage />} />
          <Route path={ROUTES.PROMOTIONS} element={<PromotionsPage />} />
          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          <Route path={ROUTES.SALON_SETTINGS} element={<SalonSettingsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.PROFILE} element={<SettingsPage />} />
        </Route>

        {/* Admin routes - with AdminLayout */}
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
          <Route path={ROUTES.ADMIN_SALON} element={<SalonsPage />} />
          <Route path={ROUTES.ADMIN_SETTINGS} element={<SettingsPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

        {/* 404 - redirect to login */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
