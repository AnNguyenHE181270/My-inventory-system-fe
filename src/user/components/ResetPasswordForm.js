function ResetPasswordForm({ form, isLoading, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="form">
      <label htmlFor="reset-email">Email</label>
      <input
        id="reset-email"
        name="email"
        type="email"
        value={form.email}
        onChange={onChange}
        placeholder="Nhap email cua ban"
        required
      />

      <label htmlFor="reset-otp">Ma OTP</label>
      <input
        id="reset-otp"
        name="otp"
        type="text"
        value={form.otp}
        onChange={onChange}
        placeholder="Nhap ma OTP da nhan"
        required
      />

      <label htmlFor="new-password">Mat khau moi</label>
      <input
        id="new-password"
        name="newPassword"
        type="password"
        value={form.newPassword}
        onChange={onChange}
        placeholder="Nhap mat khau moi"
        required
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Dang doi mat khau...' : 'Doi mat khau'}
      </button>
    </form>
  );
}

export default ResetPasswordForm;
