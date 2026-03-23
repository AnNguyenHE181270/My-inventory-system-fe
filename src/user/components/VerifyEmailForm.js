function VerifyEmailForm({ form, isLoading, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="form">
      <label htmlFor="verify-email">Email</label>
      <input
        id="verify-email"
        name="email"
        type="email"
        value={form.email}
        onChange={onChange}
        placeholder="Nhap email da dang ky"
        required
      />

      <label htmlFor="otp">Ma xac thuc</label>
      <input
        id="otp"
        name="otp"
        type="text"
        value={form.otp}
        onChange={onChange}
        placeholder="Nhap ma xac thuc"
        required
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Dang xac minh...' : 'Xac minh email'}
      </button>
    </form>
  );
}

export default VerifyEmailForm;
