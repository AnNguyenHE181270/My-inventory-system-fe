import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { dashboardRoutes } from './routes.constants';
import { AuthContext } from '../../shared/context/auth-context';
import AdminLayout from '../../features/admin/components/AdminLayout';
import AdminImportsPage from '../../features/admin/pages/AdminImportsPage';
import AdminUsersPage from '../../features/admin/pages/AdminUsersPage';
import AdminUnitsPage from '../../features/admin/pages/AdminUnitsPage';
import AdminProductsPage from '../../features/admin/pages/AdminProductsPage';

function AdminOnlyRoute() {
  const auth = useContext(AuthContext);

  if (auth.role !== 'admin') {
    return <Navigate to={dashboardRoutes.home} replace />;
  }

  return <Outlet />;
}

export const adminRouteObject = {
  path: 'admin',
  element: <AdminOnlyRoute />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { index: true, element: <Navigate to={dashboardRoutes.adminImports} replace /> },
        { path: 'imports', element: <AdminImportsPage /> },
        { path: 'users', element: <AdminUsersPage /> },
        { path: 'units', element: <AdminUnitsPage /> },
        { path: 'products', element: <AdminProductsPage /> },
      ]
    },
    { path: '*', element: <Navigate to={dashboardRoutes.adminImports} replace /> }
  ]
};
