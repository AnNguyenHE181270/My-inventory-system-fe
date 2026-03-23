import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-gray-50">
      {/* Left side - Image banner */}
      <div className="relative hidden w-1/2 shrink-0 overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070"
          alt="Warehouse"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
              <i className="fa-solid fa-warehouse text-xl text-white"></i>
            </div>
            <div>
              <div className="text-lg font-bold text-white">Kho Vật Tư</div>
              <div className="text-xs text-white/60">Quản lý chuyên nghiệp</div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/20 px-4 py-2 backdrop-blur-md">
              <i className="fa-solid fa-bolt text-sm text-red-400"></i>
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                Hệ thống quản lý kho
              </span>
            </div>

            <h2 className="mb-4 text-5xl font-bold leading-tight text-white">
              Quản lý kho
              <br />
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                Hiện đại & Hiệu quả
              </span>
            </h2>

            <p className="mb-8 max-w-md text-base leading-relaxed text-white/70">
              Giải pháp quản lý vật tư xây dựng toàn diện. Theo dõi tồn kho, nhập xuất và báo cáo chi tiết.
            </p>

            {/* Features */}
            <div className="grid gap-3">
              {[
                { icon: 'fa-box', text: 'Quản lý vật tư' },
                { icon: 'fa-chart-line', text: 'Báo cáo chi tiết' },
                { icon: 'fa-users', text: 'Đa người dùng' }
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md">
                    <i className={`fa-solid ${item.icon} text-sm text-red-400`}></i>
                  </div>
                  <span className="text-sm font-medium text-white/90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <div className="flex items-center gap-2 text-white/60">
              <i className="fa-solid fa-phone text-sm"></i>
              <span className="text-sm">Hỗ trợ: 1800 6162</span>
            </div>
            <div className="text-sm text-white/40">© 2025 Kho Vật Tư</div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full shrink-0 items-center justify-center px-6 py-10 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-[440px] rounded-2xl border border-gray-200 bg-white p-8 shadow-xl lg:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
