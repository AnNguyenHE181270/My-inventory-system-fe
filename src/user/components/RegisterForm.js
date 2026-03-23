function RegisterForm({ form, isLoading, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="form">
      <label htmlFor="name">Ten nguoi dung</label>
      <input
        id="name"
        name="name"
        type="text"
        value={form.name}
        onChange={onChange}
        placeholder="Nhap ten nguoi dung"
        required
      />

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

      <label htmlFor="role">Vai tro</label>
      <select id="role" name="role" value={form.role} onChange={onChange} required>
        <option value="">Chon vai tro</option>
        <option value="admin">Admin</option>
        <option value="manager">Manager</option>
        <option value="staff">Staff</option>
      </select>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Dang dang ky...' : 'Dang ky'}
      </button>
    </form>
  );
}

export default RegisterForm;
