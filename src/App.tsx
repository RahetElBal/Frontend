import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { LoginPage } from '@/routes/login';
import { UserLayout } from '@/layouts/user-layout';
import { AdminLayout } from '@/layouts/admin-layout';
import { ROUTES } from '@/constants/navigation';

// Placeholder pages - will be replaced with actual implementations
import { DashboardPage, AdminDashboardPage } from '@/routes/index';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - no layout */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* User routes - with UserLayout */}
        <Route element={<UserLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.CLIENTS} element={<PlaceholderPage title="Clients" />} />
          <Route path={ROUTES.AGENDA} element={<PlaceholderPage title="Agenda" />} />
          <Route path={ROUTES.SERVICES} element={<PlaceholderPage title="Services" />} />
          <Route path={ROUTES.PRODUCTS} element={<PlaceholderPage title="Products" />} />
          <Route path={ROUTES.SALES} element={<PlaceholderPage title="Sales" />} />
          <Route path={ROUTES.LOYALTY} element={<PlaceholderPage title="Loyalty" />} />
          <Route path={ROUTES.GIFT_CARDS} element={<PlaceholderPage title="Gift Cards" />} />
          <Route path={ROUTES.MARKETING} element={<PlaceholderPage title="Marketing" />} />
          <Route path={ROUTES.ANALYTICS} element={<PlaceholderPage title="Analytics" />} />
          <Route path={ROUTES.SETTINGS} element={<PlaceholderPage title="Settings" />} />
          <Route path={ROUTES.PROFILE} element={<PlaceholderPage title="Profile" />} />
        </Route>

        {/* Admin routes - with AdminLayout */}
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN_USERS} element={<PlaceholderPage title="Admin - Users" />} />
          <Route path={ROUTES.ADMIN_SALONS} element={<PlaceholderPage title="Admin - Salons" />} />
          <Route path={ROUTES.ADMIN_SETTINGS} element={<PlaceholderPage title="Admin - Settings" />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

        {/* 404 - redirect to login */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Temporary placeholder component for routes not yet implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-muted-foreground">This page is coming soon...</p>
    </div>
  );
}

export default App;
