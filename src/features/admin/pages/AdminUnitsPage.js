import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../shared/context/auth-context';

function AdminUnitsPage() {
  const auth = useContext(AuthContext);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [editingUnit, setEditingUnit] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    loadUnits();
  }, [auth.token]);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/unit', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tải đơn vị');
      setUnits(data.units || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setForm({
      name: unit.name,
      description: unit.description
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditingUnit(null);
    setForm({ name: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const isEdit = !!editingUnit;
      const url = isEdit ? `/api/unit/${editingUnit._id}` : '/api/unit';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lưu thất bại');
      
      if (isEdit) {
        setUnits(prev => prev.map(u => u._id === editingUnit._id ? data.unit : u));
        setSuccess('Cập nhật đơn vị thành công.');
      } else {
        setUnits(prev => [data.unit, ...prev]);
        setSuccess('Tạo đơn vị thành công.');
      }
      handleCancel();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Chắc chắn xóa đơn vị này? Yêu cầu không có sản phẩm nào sử dụng đơn vị này.')) return;
    try {
      const res = await fetch(`/api/unit/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xóa thất bại');
      
      setUnits(prev => prev.filter(u => u._id !== id));
      setSuccess('Đã xóa đơn vị.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm border border-red-100">
        <div className="border-b border-red-100 bg-red-50 px-5 py-4">
          <h2 className="text-xl font-black text-slate-800">Quản lý hiển thị đơn vị</h2>
          <p className="text-sm text-slate-500">Danh sách các đơn vị tính (Cái, Chiếc, Mét,...)</p>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 border-b border-red-100">{error}</div>}
        {success && <div className="p-4 bg-emerald-50 text-emerald-600 border-b border-emerald-100">{success}</div>}

        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-bold">Tên đơn vị</th>
                <th className="px-5 py-3 font-bold">Mô tả</th>
                <th className="px-5 py-3 font-bold w-[120px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="3" className="p-8 text-center text-slate-400">Đang tải...</td></tr>
              ) : units.length === 0 ? (
                <tr><td colSpan="3" className="p-8 text-center text-slate-400">Chưa có đơn vị nào.</td></tr>
              ) : (
                units.map(unit => (
                  <tr key={unit._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-red-700">{unit.name}</td>
                    <td className="px-5 py-4 text-slate-600">{unit.description || '--'}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleEdit(unit)} className="text-blue-600 hover:text-blue-800 font-medium text-xs mr-3">Sửa</button>
                      <button onClick={() => handleDelete(unit._id)} className="text-red-600 hover:text-red-800 font-medium text-xs">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-red-100 p-5 h-fit">
        <h3 className="text-lg font-black text-slate-800 mb-4">{editingUnit ? 'Cập nhật đơn vị' : 'Thêm đơn vị mới'}</h3>
        
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên đơn vị *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Ví dụ: Thùng, Hộp..." className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Ghi chú về đơn vị này" className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm resize-none"></textarea>
          </div>
          
          <div className="flex gap-2 mt-2">
            {editingUnit && (
              <button type="button" onClick={handleCancel} className="flex-1 border border-slate-200 bg-white text-slate-700 text-sm font-bold py-2 rounded-lg hover:bg-slate-50">Hủy</button>
            )}
            <button type="submit" className="flex-1 bg-red-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-red-700">Lưu</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AdminUnitsPage;
