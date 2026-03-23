import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';
import { authRoutes, dashboardRoutes, getDashboardPathByRole } from './routes.constants';
import { staffRouteObject } from './staff.route';
import { managerRouteObject } from './manager.route';
import { adminRouteObject } from './admin.route';

export { dashboardRoutes };

function ProtectedRoute() {
  const auth = useContext(AuthContext);
  if (!auth.isLoggedIn) return <Navigate to={authRoutes.login} replace />;
  return <Outlet />;
}

function RoleRedirect() {
  const auth = useContext(AuthContext);
  if (!auth.isLoggedIn) return <Navigate to={authRoutes.login} replace />;
  if (!auth.role) return null;
  if (['staff', 'admin', 'manager'].includes(auth.role)) {
    return <Navigate to={getDashboardPathByRole(auth.role)} replace />;
  }
  auth.logout();
  return <Navigate to={authRoutes.login} replace />;
}

export const dashboardRouteObjects = [
  {
    index: true,
    element: <RoleRedirect />,
  },
  {
    path: 'dashboard',
    element: <ProtectedRoute />,
    children: [
      staffRouteObject,
      managerRouteObject,
      adminRouteObject
    ],
  },
];
