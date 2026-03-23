import { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../shared/context/auth-context';
import { authRoutes, dashboardRoutes } from '../../../app/router/routes.constants';

const menuItems = [
  { path: dashboardRoutes.adminImports, label: 'Duyệt phiếu nhập', icon: 'AD' },
  { path: dashboardRoutes.adminUsers, label: 'Người dùng', icon: 'US' },
  { path: dashboardRoutes.adminUnits, label: 'Đơn vị đo', icon: 'UT' },
  { path: dashboardRoutes.adminProducts, label: 'Sản phẩm', icon: 'PR' }
];

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const handleLogout = () => {
    auth.logout();
    navigate(authRoutes.login);
  };

  return (
    <div className="min-h-screen bg-[#fff7f7] font-sans text-slate-900">
      <header className="flex h-[72px] items-center justify-between border-b border-red-100 bg-white/95 px-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 font-black text-white shadow-lg shadow-slate-900/20">
            A
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">Admin Imports</div>
            <div className="text-xs uppercase tracking-[0.12em] text-red-500">Phê duyệt nhập kho</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-red-50 px-3 py-2 text-sm font-bold text-red-700">Chi nhánh trung tâm</div>
          <div className="rounded-full bg-slate-900 px-3 py-2 text-sm font-bold text-white">Admin</div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-red-50"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-72px)] grid-cols-[260px_1fr]">
        <aside className="relative overflow-hidden border-r border-red-100 bg-[linear-gradient(180deg,#111827_0%,#7f1d1d_55%,#dc2626_100%)] px-5 py-6 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.2)_58%,rgba(255,255,255,0.03)_100%)]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{ backgroundImage: "url('https://pbs.twimg.com/media/Fn6adGJXoBg8t-_.jpg')" }}
          />

          <div className="relative z-10">
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-0.5 w-8 bg-yellow-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/75">Admin Panel</span>
              </div>
              <h2 className="text-[30px] font-black leading-none tracking-[-0.04em] text-white">
                Duyệt nhập
                <br />
                <span className="text-red-200">có kiểm soát.</span>
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/80">
                Admin là người chấp nhận hoặc từ chối phiếu nhập của manager. Quản lý người dùng và vật tư trong hệ thống.
              </p>
            </div>

            <div className="mb-5 text-xs uppercase tracking-[0.14em] text-red-100/90">Điều hướng</div>

            <nav className="grid gap-2">
              {menuItems.map(item => {
                const active = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 font-bold transition ${
                      active
                        ? 'border-white/30 bg-white/16 text-white shadow-lg shadow-black/15'
                        : 'border-white/10 bg-white/5 text-white/85 hover:bg-white/10'
                    }`}
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-xs font-black">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="p-6">
          <section className="mb-5 overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-sm">
            <div className="grid gap-5 bg-[linear-gradient(135deg,#111827_0%,#b91c1c_55%,#ef4444_100%)] px-7 py-6 text-white lg:grid-cols-[1.2fr_auto] lg:items-center">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-0.5 w-8 bg-yellow-300" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/80">Phê duyệt kho</span>
                </div>
                <h1 className="text-4xl font-black tracking-[-0.04em]">Kiểm soát phiếu nhập</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
                  Xem tất cả phiếu manager gửi lên, duyệt hoặc từ chối nhanh ngay trên bảng điều khiển. Quản lý người dùng và sản phẩm hệ thống.
                </p>
              </div>
            </div>
          </section>

          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
