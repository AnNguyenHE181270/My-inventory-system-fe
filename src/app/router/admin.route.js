import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { dashboardRoutes } from './routes.constants';
import { AuthContext } from '../../shared/context/auth-context';
import AdminLayout from '../../features/admin/components/AdminLayout';
import AdminImportsPage from '../../features/admin/pages/AdminImportsPage';

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
      ]
    },
    { path: '*', element: <Navigate to={dashboardRoutes.adminImports} replace /> }
  ]
};
