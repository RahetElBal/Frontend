import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { LoginPage } from '@/routes/login';
import { DashboardPage, AdminDashboardPage } from '@/routes/index';
import { AUTH_ROUTES } from '@/constants/auth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path={AUTH_ROUTES.LOGIN} element={<LoginPage />} />

        {/* Protected routes - User */}
        <Route path={AUTH_ROUTES.DASHBOARD} element={<DashboardPage />} />

        {/* Protected routes - Admin */}
        <Route path={AUTH_ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={AUTH_ROUTES.LOGIN} replace />} />

        {/* 404 - redirect to login */}
        <Route path="*" element={<Navigate to={AUTH_ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
