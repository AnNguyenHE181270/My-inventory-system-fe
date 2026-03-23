const inputClass = "px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100";

function ResetPasswordForm({ form, isLoading, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="reset-email" className="text-sm font-semibold text-gray-700">Email</label>
        <input id="reset-email" name="email" type="email" value={form.email} onChange={onChange}
          placeholder="ten@congty.com" required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="reset-otp" className="text-sm font-semibold text-gray-700">Mã OTP</label>
        <input id="reset-otp" name="otp" type="text" value={form.otp} onChange={onChange}
          placeholder="Nhập mã OTP" required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="new-password" className="text-sm font-semibold text-gray-700">Mật khẩu mới</label>
        <input id="new-password" name="newPassword" type="password" value={form.newPassword} onChange={onChange}
          placeholder="••••••••" required className={inputClass} />
      </div>
      <button type="submit" disabled={isLoading}
        className="mt-2 w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wide transition-all disabled:opacity-60 shadow-lg shadow-red-200">
        {isLoading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
      </button>
    </form>
  );
}

export default ResetPasswordForm;
