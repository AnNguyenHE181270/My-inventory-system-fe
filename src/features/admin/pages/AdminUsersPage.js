import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../shared/context/auth-context';

const roleLabelMap = {
  admin: 'Admin',
  manager: 'Quản lý',
  staff: 'Nhân viên'
};

const statusLabelMap = {
  active: 'Đang hoạt động',
  pending: 'Chờ xác minh',
  blocked: 'Đã khóa'
};

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'staff',
  status: 'pending'
};

function AdminUsersPage() {
  const auth = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadUsers();
  }, [auth.token]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Tải danh sách người dùng thất bại.');
      }

      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = event => {
    setForm(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleEdit = user => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'staff',
      status: user.status || 'pending'
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditingUser(null);
    setForm(initialForm);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        const res = await fetch(`/api/user/${editingUser._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            role: form.role,
            status: form.status
          })
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Cập nhật người dùng thất bại.');
        }

        setUsers(prev => prev.map(user => (user._id === editingUser._id ? data.user : user)));
        setSuccess('Đã cập nhật người dùng thành công.');
        handleCancel();
        return;
      }

      const res = await fetch('/api/user/internal-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Tạo tài khoản nội bộ thất bại.');
      }

      setUsers(prev => [data.user, ...prev]);
      setSuccess(data.message || 'Đã tạo tài khoản nội bộ thành công.');
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc muốn xóa mềm người dùng này không?')) {
      return;
    }

    try {
      const res = await fetch(`/api/user/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Xóa mềm người dùng thất bại.');
      }

      setUsers(prev => prev.filter(user => user._id !== id));
      setSuccess('Đã xóa mềm người dùng khỏi danh sách hiển thị.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[2.2fr_1fr]">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#141414] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
        <div className="border-b border-white/10 bg-[#1c1c1c] px-6 py-5">
          <h2 className="text-2xl font-black text-white">Quản lý người dùng</h2>
          <p className="mt-1 text-sm text-gray-400">Admin tạo tài khoản nội bộ, theo dõi kích hoạt và quản lý nhân sự trong hệ thống.</p>
        </div>

        {error && <div className="border-b border-red-500/20 bg-red-500/10 px-6 py-4 text-sm text-red-300">{error}</div>}
        {success && <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-sm text-emerald-300">{success}</div>}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 bg-[#1a1a1a] text-gray-400">
              <tr>
                <th className="px-6 py-4 font-bold">Tên / Email</th>
                <th className="px-6 py-4 font-bold">Vai trò</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
                <th className="px-6 py-4 font-bold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                    Chưa có người dùng nào để hiển thị.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="bg-[#141414] transition hover:bg-white/[0.03]">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-white">{user.name}</div>
                      <div className="mt-1 text-xs text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          user.role === 'admin'
                            ? 'bg-red-500/15 text-red-300'
                            : user.role === 'manager'
                              ? 'bg-blue-500/15 text-blue-300'
                              : 'bg-white/10 text-gray-200'
                        }`}
                      >
                        {roleLabelMap[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          user.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : user.status === 'pending'
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-rose-500/15 text-rose-300'
                        }`}
                      >
                        {statusLabelMap[user.status] || user.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button onClick={() => handleEdit(user)} className="mr-4 text-sm font-semibold text-blue-300 transition hover:text-blue-200">
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(user._id)} className="text-sm font-semibold text-red-300 transition hover:text-red-200">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="h-fit rounded-[28px] border border-white/10 bg-[#141414] p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
        <h3 className="text-xl font-black text-white">{editingUser ? 'Cập nhật người dùng' : 'Tạo tài khoản nội bộ'}</h3>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Tên người dùng</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={Boolean(editingUser)}
              className="w-full rounded-2xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none disabled:bg-[#1a1a1a] disabled:text-gray-500"
            />
          </div>

          {!editingUser && (
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Mật khẩu tạm</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full rounded-2xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Vai trò</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none">
              <option value="staff">Nhân viên</option>
              <option value="manager">Quản lý</option>
              {editingUser && <option value="admin">Admin</option>}
            </select>
          </div>

          {editingUser && (
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Trạng thái</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none">
                <option value="pending">Chờ xác minh</option>
                <option value="active">Đang hoạt động</option>
                <option value="blocked">Đã khóa</option>
              </select>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-gray-400">
            {editingUser
              ? 'Admin có thể chỉnh vai trò và trạng thái tài khoản sau khi tạo.'
              : 'Khi tạo xong, hệ thống sẽ gửi OTP về Gmail của nhân viên hoặc quản lý. Mã có hiệu lực trong 3 giờ để họ xác minh tài khoản.'}
          </div>

          <div className="mt-2 flex gap-3">
            <button type="button" onClick={handleCancel} className="flex-1 rounded-2xl border border-white/10 bg-[#202020] py-3 text-sm font-bold text-gray-200 transition hover:bg-[#292929]">
              {editingUser ? 'Hủy' : 'Làm mới'}
            </button>
            <button type="submit" className="flex-1 rounded-2xl bg-[#E50914] py-3 text-sm font-bold text-white transition hover:bg-[#b20710]">
              {editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AdminUsersPage;
