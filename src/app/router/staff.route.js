import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { dashboardRoutes } from './routes.constants';
import { AuthContext } from '../../shared/context/auth-context';
import SalesLayout from '../../features/staff/components/SalesLayout';
import SalesDashboard from '../../features/staff/pages/SalesDashboard';
import SellPage from '../../features/staff/pages/SellPage';
import ExportPage from '../../features/staff/pages/ExportPage';
import OrdersPage from '../../features/staff/pages/OrdersPage';
import ProductsPage from '../../features/staff/pages/ProductsPage';
import ReportsPage from '../../features/staff/pages/ReportsPage';

function StaffOnlyRoute() {
  const auth = useContext(AuthContext);

  if (auth.role !== 'staff') {
    return <Navigate to={dashboardRoutes.home} replace />;
  }

  return <Outlet />;
}

export const staffRouteObject = {
  path: 'staff',
  element: <StaffOnlyRoute />,
  children: [
    {
      element: <SalesLayout />,
      children: [
        { index: true, element: <SalesDashboard /> },
        { path: 'sell', element: <SellPage /> },
        { path: 'export', element: <ExportPage /> },
        { path: 'orders', element: <OrdersPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'reports', element: <ReportsPage /> },
      ]
    },
    { path: '*', element: <Navigate to={dashboardRoutes.staff} replace /> }
  ]
};
