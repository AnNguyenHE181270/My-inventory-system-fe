import { useContext, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../shared/context/auth-context';
import { authRoutes, dashboardRoutes } from '../../../app/router/routes.constants';

const menuItems = [
  { path: dashboardRoutes.adminOverview, label: 'Tổng quan', icon: 'fa-solid fa-chart-line' },
  { path: dashboardRoutes.adminImports, label: 'Duyệt phiếu nhập', icon: 'fa-solid fa-clipboard-check' },
  { path: dashboardRoutes.adminUsers, label: 'Người dùng', icon: 'fa-solid fa-users' },
  { path: dashboardRoutes.adminUnits, label: 'Đơn vị đo', icon: 'fa-solid fa-ruler-combined' },
  { path: dashboardRoutes.adminProducts, label: 'Sản phẩm', icon: 'fa-solid fa-boxes-stacked' },
  { path: dashboardRoutes.adminProfile, label: 'Hồ sơ cá nhân', icon: 'fa-solid fa-user' }
];

const pageTitles = {
  [dashboardRoutes.adminOverview]: 'Tổng quan',
  [dashboardRoutes.adminImports]: 'Duyệt phiếu nhập',
  [dashboardRoutes.adminUsers]: 'Người dùng',
  [dashboardRoutes.adminUnits]: 'Đơn vị đo',
  [dashboardRoutes.adminProducts]: 'Sản phẩm',
  [dashboardRoutes.adminProfile]: 'Hồ sơ cá nhân'
};

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);

  const title = useMemo(
    () => pageTitles[location.pathname] || 'Quản trị hệ thống',
    [location.pathname]
  );

  const handleLogout = () => {
    auth.logout();
    navigate(authRoutes.login);
  };

  return (
    <div className="min-h-screen bg-[#141414] font-sans text-white">
      <aside
        className={`${collapsed ? 'w-16' : 'w-64'} fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/10 bg-[#0b0b0b] transition-all duration-300`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E50914] shadow-lg shadow-red-900/30">
                <i className="fa-solid fa-shield-halved text-sm text-white"></i>
              </div>
              <div>
                <div className="text-base font-black tracking-tight text-white">Quản trị kho</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-red-400">Kiểm soát nhập kho</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(prev => !prev)}
            className="rounded-lg p-1.5 text-gray-500 transition hover:bg-white/10 hover:text-white"
          >
            <i className={`fa-solid ${collapsed ? 'fa-bars' : 'fa-angles-left'}`}></i>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="mb-4 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
            {!collapsed && 'Bảng điều khiển'}
          </div>
          <div className="flex flex-col gap-1.5">
            {menuItems.map(item => {
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? 'bg-[#E50914] text-white shadow-lg shadow-red-950/30'
                      : 'text-gray-300 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <i className={`${item.icon} w-5 text-center`}></i>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="mx-3 mb-3 mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          {!collapsed && (
            <div className="mb-3">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Quyền hiện tại</div>
              <div className="mt-2 text-sm font-semibold text-white">Admin</div>
              <div className="text-xs text-gray-400">Duyệt phiếu và quản trị hệ thống</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#181818] px-3 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-red-500/40 hover:bg-[#E50914] hover:text-white"
          >
            <i className="fa-solid fa-right-from-bracket w-5 text-center"></i>
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div className={`${collapsed ? 'ml-16' : 'ml-64'} flex min-w-0 flex-col transition-all duration-300`}>
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#141414]/95 px-6 py-4 backdrop-blur">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-500">Bảng điều khiển quản trị</div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-white/10 bg-[#1f1f1f] p-2.5 text-gray-400 transition hover:border-white/20 hover:text-white">
              <i className="fa-solid fa-bell"></i>
            </button>
            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-[#1f1f1f] px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15 text-xs font-bold text-red-400">
                <i className="fa-solid fa-user-shield"></i>
              </div>
              <span className="text-sm font-medium text-white">Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(229,9,20,0.12),_transparent_28%),linear-gradient(180deg,#141414_0%,#181818_45%,#111111_100%)] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
