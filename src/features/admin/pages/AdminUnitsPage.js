import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../shared/context/auth-context';

function AdminUnitsPage() {
  const auth = useContext(AuthContext);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUnit, setEditingUnit] = useState(null);
  const [form, setForm] = useState({
    name: '',
    symbol: '',
    description: ''
  });

  useEffect(() => {
    loadUnits();
  }, [auth.token]);

  const loadUnits = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/unit', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Tải danh sách đơn vị thất bại.');
      }

      setUnits(data.units || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = event => {
    setForm(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleEdit = unit => {
    setEditingUnit(unit);
    setForm({
      name: unit.name || '',
      symbol: unit.symbol || '',
      description: unit.description || ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditingUnit(null);
    setForm({
      name: '',
      symbol: '',
      description: ''
    });
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const isEdit = Boolean(editingUnit);
      const res = await fetch(isEdit ? `/api/unit/${editingUnit._id}` : '/api/unit', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lưu đơn vị thất bại.');
      }

      if (isEdit) {
        setUnits(prev => prev.map(unit => (unit._id === editingUnit._id ? data.unit : unit)));
        setSuccess('Đã cập nhật đơn vị thành công.');
      } else {
        setUnits(prev => [data.unit, ...prev]);
        setSuccess('Đã tạo đơn vị mới.');
      }

      handleCancel();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc muốn xóa mềm đơn vị này không?')) {
      return;
    }

    try {
      const res = await fetch(`/api/unit/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Xóa mềm đơn vị thất bại.');
      }

      setUnits(prev => prev.filter(unit => unit._id !== id));
      setSuccess('Đã xóa mềm đơn vị khỏi danh sách hiển thị.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#141414] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
        <div className="border-b border-white/10 bg-[#1c1c1c] px-6 py-5">
          <h2 className="text-2xl font-black text-white">Quản lý đơn vị</h2>
          <p className="mt-1 text-sm text-gray-400">Danh sách đơn vị tính đang hoạt động và ký hiệu hiển thị đi kèm.</p>
        </div>

        {error && <div className="border-b border-red-500/20 bg-red-500/10 px-6 py-4 text-sm text-red-300">{error}</div>}
        {success && <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-sm text-emerald-300">{success}</div>}

        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-[#1a1a1a] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-bold">Tên đơn vị</th>
              <th className="px-6 py-4 font-bold">Ký hiệu</th>
              <th className="px-6 py-4 font-bold">Mô tả</th>
              <th className="px-6 py-4 font-bold">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                  Đang tải danh sách đơn vị...
                </td>
              </tr>
            ) : units.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                  Chưa có đơn vị nào để hiển thị.
                </td>
              </tr>
            ) : (
              units.map(unit => (
                <tr key={unit._id} className="transition hover:bg-white/[0.03]">
                  <td className="px-6 py-5 font-semibold text-white">{unit.name}</td>
                  <td className="px-6 py-5">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-gray-200">{unit.symbol || '--'}</span>
                  </td>
                  <td className="px-6 py-5 text-gray-400">{unit.description || '--'}</td>
                  <td className="px-6 py-5">
                    <button onClick={() => handleEdit(unit)} className="mr-4 text-sm font-semibold text-blue-300 transition hover:text-blue-200">
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(unit._id)} className="text-sm font-semibold text-red-300 transition hover:text-red-200">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="h-fit rounded-[28px] border border-white/10 bg-[#141414] p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
        <h3 className="text-xl font-black text-white">{editingUnit ? 'Cập nhật đơn vị' : 'Thêm đơn vị mới'}</h3>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Tên đơn vị *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Ví dụ: Thùng, Hộp, Cái" className="w-full rounded-2xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500" />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Ký hiệu *</label>
            <input name="symbol" value={form.symbol} onChange={handleChange} required placeholder="Ví dụ: thùng, hộp, cái" className="w-full rounded-2xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500" />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Mô tả</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Ghi chú thêm về đơn vị này" className="w-full resize-none rounded-2xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500" />
          </div>

          <div className="mt-2 flex gap-3">
            {editingUnit && (
              <button type="button" onClick={handleCancel} className="flex-1 rounded-2xl border border-white/10 bg-[#202020] py-3 text-sm font-bold text-gray-200 transition hover:bg-[#292929]">
                Hủy
              </button>
            )}
            <button type="submit" className="flex-1 rounded-2xl bg-[#E50914] py-3 text-sm font-bold text-white transition hover:bg-[#b20710]">
              {editingUnit ? 'Lưu cập nhật' : 'Tạo đơn vị'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AdminUnitsPage;
