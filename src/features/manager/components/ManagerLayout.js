import { useContext, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../shared/context/auth-context';
import { authRoutes, dashboardRoutes } from '../../../app/router/routes.constants';

const menuItems = [
  { path: dashboardRoutes.managerOverview, label: 'Tổng quan', icon: 'fa-solid fa-chart-line' },
  { path: dashboardRoutes.managerCreateImport, label: 'Tạo đơn nhập', icon: 'fa-solid fa-file-circle-plus' },
  { path: dashboardRoutes.managerImports, label: 'Xem đơn nhập', icon: 'fa-solid fa-list-check' }
];

const pageTitles = {
  [dashboardRoutes.managerOverview]: 'Tổng quan',
  [dashboardRoutes.managerCreateImport]: 'Tạo đơn nhập',
  [dashboardRoutes.managerImports]: 'Danh sách đơn nhập'
};

function ManagerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);

  const title = useMemo(
    () => pageTitles[location.pathname] || 'Quản lý nhập kho',
    [location.pathname]
  );

  const handleLogout = () => {
    auth.logout();
    navigate(authRoutes.login);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <aside
        className={`${collapsed ? 'w-16' : 'w-60'} fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                <i className="fa-solid fa-warehouse text-sm text-white"></i>
              </div>
              <span className="text-base font-bold text-gray-900">Kho vật tư</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(prev => !prev)}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <i className={`fa-solid ${collapsed ? 'fa-bars' : 'fa-angles-left'}`}></i>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-1">
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
          </div>
        </nav>

        <div className="mt-auto border-t border-gray-200 bg-white p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <i className="fa-solid fa-right-from-bracket w-5 text-center"></i>
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div className={`${collapsed ? 'ml-16' : 'ml-60'} flex min-w-0 flex-col transition-all duration-300`}>
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3.5 shadow-sm">
          <h1 className="m-0 text-xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
              <i className="fa-solid fa-bell"></i>
            </button>
            <div className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <span className="text-sm font-medium text-gray-700">Quản lý</span>
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

export default ManagerLayout;
