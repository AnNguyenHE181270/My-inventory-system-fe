import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../shared/context/auth-context';

function AdminUsersPage() {
  const auth = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'staff', status: 'pending' });

  useEffect(() => {
    loadUsers();
  }, [auth.token]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tải người dùng');
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', role: 'staff', status: 'pending' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editingUser) {
      setError('Admin không được trực tiếp tạo user. Hãy yêu cầu user đăng ký.');
      return;
    }

    try {
      const res = await fetch(`/api/user/${editingUser._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cập nhật thất bại');
      
      setUsers(prev => prev.map(u => u._id === editingUser._id ? data.user : u));
      setSuccess('Cập nhật người dùng thành công.');
      handleCancel();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Chắc chắn xóa người dùng này?')) return;
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xóa thất bại');
      
      setUsers(prev => prev.filter(u => u._id !== id));
      setSuccess('Đã xóa người dùng.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[3fr_1fr]">
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm border border-red-100">
        <div className="border-b border-red-100 bg-red-50 px-5 py-4">
          <h2 className="text-xl font-black text-slate-800">Quản lý người dùng</h2>
          <p className="text-sm text-slate-500">Danh sách tài khoản trong hệ thống</p>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 border-b border-red-100">{error}</div>}
        {success && <div className="p-4 bg-emerald-50 text-emerald-600 border-b border-emerald-100">{success}</div>}

        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-bold">Tên / Email</th>
                <th className="px-5 py-3 font-bold">Vai trò</th>
                <th className="px-5 py-3 font-bold">Trạng thái</th>
                <th className="px-5 py-3 font-bold w-[120px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400">Đang tải...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400">Không có người dùng nào.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' : 
                        user.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                        user.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800 font-medium text-xs mr-3">Sửa</button>
                      <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-800 font-medium text-xs">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-red-100 p-5 h-fit">
        <h3 className="text-lg font-black text-slate-800 mb-4">{editingUser ? 'Cập nhật User' : 'Hướng dẫn'}</h3>
        
        {!editingUser ? (
          <div className="text-sm text-slate-500 leading-relaxed">
            Admin chỉ có quyền Cập nhật Vai trò và Trạng thái của user hoặc Xóa user. Muốn thêm mới người dùng hãy dùng chức năng <strong>Đăng ký</strong> ngoài hệ thống để kích hoạt OTP qua Email.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input name="email" value={form.email} disabled className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-3 py-2 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vai trò</label>
              <select name="role" value={form.role} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm">
                <option value="staff">Staff (Nhân viên)</option>
                <option value="manager">Manager (Quản lý)</option>
                <option value="admin">Admin (Chủ quán)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm">
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={handleCancel} className="flex-1 border border-slate-200 bg-white text-slate-700 text-sm font-bold py-2 rounded-lg hover:bg-slate-50">Hủy</button>
              <button type="submit" className="flex-1 bg-red-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-red-700">Lưu</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default AdminUsersPage;
