function ForgotPasswordForm({ form, isLoading, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="form">
      <label htmlFor="forgot-email">Email</label>
      <input
        id="forgot-email"
        name="email"
        type="email"
        value={form.email}
        onChange={onChange}
        placeholder="Nhap email de nhan ma OTP"
        required
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Dang gui ma...' : 'Gui ma OTP'}
      </button>
    </form>
  );
}

export default ForgotPasswordForm;
