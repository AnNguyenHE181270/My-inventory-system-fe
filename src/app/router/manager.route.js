import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { dashboardRoutes } from './routes.constants';
import { AuthContext } from '../../shared/context/auth-context';
import ManagerLayout from '../../features/manager/components/ManagerLayout';
import ManagerImportsPage from '../../features/manager/pages/ManagerImportsPage';
import ManagerOverviewPage from '../../features/manager/pages/ManagerOverviewPage';
import ManagerCreateImportPage from '../../features/manager/pages/ManagerCreateImportPage';

function ManagerOnlyRoute() {
  const auth = useContext(AuthContext);

  if (auth.role !== 'manager') {
    return <Navigate to={dashboardRoutes.home} replace />;
  }

  return <Outlet />;
}

export const managerRouteObject = {
  path: 'manager',
  element: <ManagerOnlyRoute />,
  children: [
    {
      element: <ManagerLayout />,
      children: [
        { index: true, element: <Navigate to={dashboardRoutes.managerOverview} replace /> },
        { path: 'overview', element: <ManagerOverviewPage /> },
        { path: 'create-import', element: <ManagerCreateImportPage /> },
        { path: 'imports', element: <ManagerImportsPage /> },
      ]
    },
    { path: '*', element: <Navigate to={dashboardRoutes.managerOverview} replace /> }
  ]
};
