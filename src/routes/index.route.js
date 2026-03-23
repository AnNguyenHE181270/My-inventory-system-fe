import { Navigate, createBrowserRouter } from 'react-router-dom';
import { authRouteObjects, authRoutes } from './auth.route';
import { dashboardRouteObjects, dashboardRoutes } from './dashboard.route';

export const appRoutes = {
  ...dashboardRoutes,
  ...authRoutes
};

export const router = createBrowserRouter([
  ...dashboardRouteObjects,
  ...authRouteObjects,
  {
    path: '*',
    element: <Navigate to={authRoutes.login} replace />
  }
]);
