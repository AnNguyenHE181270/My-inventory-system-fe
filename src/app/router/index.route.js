import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import { authRouteObjects } from './auth.route';
import { dashboardRouteObjects } from './dashboard.route';
import { authRoutes } from './routes.constants';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
    children: [
      ...dashboardRouteObjects,
      ...authRouteObjects
    ]
  },
  {
    path: '*',
    element: <Navigate to={authRoutes.login} replace />
  }
]);
