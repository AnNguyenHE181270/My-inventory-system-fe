import { useContext, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../shared/context/auth-context';
import { authRoutes, dashboardRoutes } from '../../../app/router/routes.constants';

const menuItems = [
  { path: dashboardRoutes.staff, label: 'Tổng quan', icon: 'fa-solid fa-chart-line' },
  { path: dashboardRoutes.staffSell, label: 'Bán hàng', icon: 'fa-solid fa-cash-register' },
  { path: dashboardRoutes.staffOrders, label: 'Đơn hàng', icon: 'fa-solid fa-receipt' },
  { path: dashboardRoutes.staffProducts, label: 'Sản phẩm', icon: 'fa-solid fa-box' },
  { path: dashboardRoutes.staffReports, label: 'Báo cáo', icon: 'fa-solid fa-chart-pie' }
];

const pageTitles = {
  [dashboardRoutes.staff]: 'Tổng quan',
  [dashboardRoutes.staffSell]: 'Bán hàng',
  [dashboardRoutes.staffOrders]: 'Quản lý đơn hàng',
  [dashboardRoutes.staffProducts]: 'Sản phẩm',
  [dashboardRoutes.staffReports]: 'Báo cáo'
};

function SalesLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);

  const title = useMemo(() => pageTitles[location.pathname] || 'Quản lý bán hàng', [location.pathname]);

  const handleLogout = () => {
    auth.logout();
    navigate(authRoutes.login);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <aside
        className={`${collapsed ? 'w-16' : 'w-60'} sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden bg-white border-r border-gray-200 transition-all duration-300`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                <i className="fa-solid fa-warehouse text-sm text-white"></i>
              </div>
              <span className="text-base font-bold text-gray-900">Kho Vật Tư</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(prev => !prev)}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <i className={`fa-solid ${collapsed ? 'fa-bars' : 'fa-angles-left'}`}></i>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {menuItems.map(item => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active 
                    ? 'bg-red-50 text-red-600 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className={`${item.icon} w-5 text-center`}></i>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <i className="fa-solid fa-right-from-bracket w-5 text-center"></i>
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3.5 shadow-sm">
          <h1 className="m-0 text-xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
              <i className="fa-solid fa-bell"></i>
            </button>
            <div className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                <i className="fa-solid fa-user"></i>
              </div>
              <span className="text-sm font-medium text-gray-700">Nhân viên</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SalesLayout;
