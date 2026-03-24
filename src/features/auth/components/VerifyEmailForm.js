const inputClass =
  'px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100';

function VerifyEmailForm({ form, isLoading, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="verify-email" className="text-sm font-semibold text-gray-700">Email</label>
        <input
          id="verify-email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="ten@congty.com"
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="otp" className="text-sm font-semibold text-gray-700">Mã OTP</label>
        <input
          id="otp"
          name="otp"
          type="text"
          value={form.otp}
          onChange={onChange}
          placeholder="Nhập mã OTP"
          required
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full rounded-xl bg-red-600 py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 disabled:opacity-60"
      >
        {isLoading ? 'Đang xác minh...' : 'Xác minh email'}
      </button>
    </form>
  );
}

export default VerifyEmailForm;
