import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { LoginPage } from '@/routes/login';
import AuthCallback from '@/routes/auth-callback';
import { UserLayout } from '@/layouts/user-layout';
import { AdminLayout } from '@/layouts/admin-layout';
import { ROUTES } from '@/constants/navigation';

// Pages
import {
  DashboardPage,
  ClientsPage,
  AgendaPage,
  ServicesPage,
  ProductsPage,
  SalesPage,
  GiftCardsPage,
  LoyaltyPage,
  AnalyticsPage,
  MarketingPage,
  SettingsPage,
  AdminDashboardPage,
  AdminUsersPage,
  AdminSalonsPage,
} from '@/pages';

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
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path={ROUTES.SALES} element={<SalesPage />} />
          <Route path={ROUTES.LOYALTY} element={<LoyaltyPage />} />
          <Route path={ROUTES.GIFT_CARDS} element={<GiftCardsPage />} />
          <Route path={ROUTES.MARKETING} element={<MarketingPage />} />
          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.PROFILE} element={<SettingsPage />} />
        </Route>

        {/* Admin routes - with AdminLayout */}
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
          <Route path={ROUTES.ADMIN_SALONS} element={<AdminSalonsPage />} />
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
