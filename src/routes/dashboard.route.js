import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../shared/context/auth-context';
import LoginSuccess from '../user/components/LoginSuccess';
import ExportPage from '../export/pages/ExportPage';
import AdminInventoryHistory from '../admin/pages/AdminInventoryHistory';
import { authRoutes } from './auth.route';

export const dashboardRoutes = {
  home: '/',
  export: '/export',
  adminInventoryHistory: '/admin/inventory-history'
};

function DashboardHome() {
  const auth = useContext(AuthContext);

  if (!auth.isLoggedIn) {
    return <Navigate to={authRoutes.login} replace />;
  }

  return (
    <LoginSuccess
      userId={auth.userId}
      token={auth.token}
      onLogout={auth.logout}
    />
  );
}

function ProtectedExportPage() {
  const auth = useContext(AuthContext);

  if (!auth.isLoggedIn) {
    return <Navigate to={authRoutes.login} replace />;
  }

  return <ExportPage />;
}

function ProtectedAdminInventoryHistory() {
  const auth = useContext(AuthContext);

  if (!auth.isLoggedIn) {
    return <Navigate to={authRoutes.login} replace />;
  }

  return <AdminInventoryHistory />;
}

export const dashboardRouteObjects = [
  {
    path: dashboardRoutes.home,
    element: <DashboardHome />
  },
  {
    path: dashboardRoutes.export,
    element: <ProtectedExportPage />
  },
  {
    path: dashboardRoutes.adminInventoryHistory,
    element: <ProtectedAdminInventoryHistory />
  }
];
