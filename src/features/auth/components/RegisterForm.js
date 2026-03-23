const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";

function RegisterForm({ form, isLoading, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
          <i className="fa-solid fa-user mr-1.5 text-xs text-gray-400"></i>
          Họ và tên
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={onChange}
          placeholder="Nguyễn Văn A"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
          <i className="fa-solid fa-envelope mr-1.5 text-xs text-gray-400"></i>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="ten@congty.com"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
          <i className="fa-solid fa-lock mr-1.5 text-xs text-gray-400"></i>
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="••••••••"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="role" className="mb-2 block text-sm font-semibold text-gray-700">
          <i className="fa-solid fa-user-tag mr-1.5 text-xs text-gray-400"></i>
          Vai trò
        </label>
        <select
          id="role"
          name="role"
          value={form.role}
          onChange={onChange}
          required
          className={inputClass}
        >
          <option value="">Chọn vai trò</option>
          <option value="staff">Nhân viên</option>
          <option value="manager">Quản lý</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3.5 text-sm font-bold text-white shadow-lg transition ${
          isLoading ? 'cursor-wait bg-red-400' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/30'
        }`}
      >
        {isLoading ? (
          <>
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>Đang đăng ký...</span>
          </>
        ) : (
          <>
            <i className="fa-solid fa-user-plus"></i>
            <span>Đăng ký tài khoản</span>
          </>
        )}
      </button>
    </form>
  );
}

export default RegisterForm;
