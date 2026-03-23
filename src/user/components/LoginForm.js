function LoginForm({ form, isLoading, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="form">
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        value={form.email}
        onChange={onChange}
        placeholder="Nhap email"
        required
      />

      <label htmlFor="password">Mat khau</label>
      <input
        id="password"
        name="password"
        type="password"
        value={form.password}
        onChange={onChange}
        placeholder="Nhap mat khau"
        required
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Dang dang nhap...' : 'Dang nhap'}
      </button>
    </form>
  );
}

export default LoginForm;
