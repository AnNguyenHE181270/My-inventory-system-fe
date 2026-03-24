import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../shared/context/auth-context';

function AdminProductsPage() {
  const auth = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    unit: ''
  });

  useEffect(() => {
    loadInitData();
  }, [auth.token]);

  const loadInitData = async () => {
    setLoading(true);
    setError('');

    try {
      const [resProducts, resUnits] = await Promise.all([
        fetch('/api/product'),
        fetch('/api/unit', {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
      ]);

      const dataProducts = await resProducts.json();
      const dataUnits = await resUnits.json();

      if (!resProducts.ok) {
        throw new Error(dataProducts.message || 'Tải danh sách sản phẩm thất bại.');
      }

      if (!resUnits.ok) {
        throw new Error(dataUnits.message || 'Tải danh sách đơn vị thất bại.');
      }

      const nextUnits = dataUnits.units || [];
      setProducts(dataProducts.products || []);
      setUnits(nextUnits);
      setForm(prev => ({ ...prev, unit: nextUnits[0]?._id || '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = event => {
    setForm(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleEdit = product => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      price: product.price ?? '',
      description: product.description || '',
      image: product.image || '',
      unit: product.unit?._id || product.unit || ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      price: '',
      description: '',
      image: '',
      unit: units[0]?._id || ''
    });
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const isEdit = Boolean(editingProduct);
      const res = await fetch(isEdit ? `/api/product/${editingProduct._id}` : '/api/product', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          description: form.description,
          image: form.image,
          unit: form.unit
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lưu sản phẩm thất bại.');
      }

      if (isEdit) {
        setProducts(prev => prev.map(product => (product._id === editingProduct._id ? data.product : product)));
        setSuccess('Đã cập nhật sản phẩm thành công.');
      } else {
        setProducts(prev => [data.product, ...prev]);
        setSuccess('Đã tạo sản phẩm mới.');
      }

      handleCancel();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc muốn xóa mềm sản phẩm này không?')) {
      return;
    }

    try {
      const res = await fetch(`/api/product/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Xóa mềm sản phẩm thất bại.');
      }

      setProducts(prev => prev.filter(product => product._id !== id));
      setSuccess('Đã xóa mềm sản phẩm khỏi danh sách hiển thị.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#141414] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
        <div className="border-b border-white/10 bg-[#1c1c1c] px-6 py-5">
          <h2 className="text-2xl font-black text-white">Quản lý sản phẩm</h2>
          <p className="mt-1 text-sm text-gray-400">Theo dõi sản phẩm đang bán và thực hiện xóa mềm khi cần ẩn khỏi hệ thống.</p>
        </div>

        {error && <div className="border-b border-red-500/20 bg-red-500/10 px-6 py-4 text-sm text-red-300">{error}</div>}
        {success && <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-sm text-emerald-300">{success}</div>}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 bg-[#1a1a1a] text-gray-400">
              <tr>
                <th className="px-6 py-4 font-bold">Sản phẩm</th>
                <th className="px-6 py-4 font-bold">Đơn vị</th>
                <th className="px-6 py-4 font-bold">Giá bán</th>
                <th className="px-6 py-4 font-bold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                    Đang tải danh sách sản phẩm...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                    Chưa có sản phẩm nào để hiển thị.
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} className="transition hover:bg-white/[0.03]">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-white">{product.name}</div>
                      <div className="mt-1 text-xs text-gray-500">{product.description || 'Chưa có mô tả.'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-gray-200">{product.unit?.name || '--'}</span>
                    </td>
                    <td className="px-6 py-5 font-semibold text-red-300">{Number(product.price || 0).toLocaleString('vi-VN')} đ</td>
                    <td className="px-6 py-5">
                      <button onClick={() => handleEdit(product)} className="mr-4 text-sm font-semibold text-blue-300 transition hover:text-blue-200">
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="text-sm font-semibold text-red-300 transition hover:text-red-200">
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
        <h3 className="text-xl font-black text-white">{editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h3>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Tên sản phẩm *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Nhập tên sản phẩm" className="w-full rounded-2xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500" />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Đơn vị *</label>
            <select name="unit" value={form.unit} onChange={handleChange} required className="w-full rounded-2xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none">
              {units.length === 0 && <option value="">Hãy tạo đơn vị trước</option>}
              {units.map(unit => (
                <option key={unit._id} value={unit._id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Giá bán *</label>
            <input type="number" min="0" name="price" value={form.price} onChange={handleChange} required placeholder="0" className="w-full rounded-2xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500" />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Hình ảnh</label>
            <input name="image" value={form.image} onChange={handleChange} placeholder="Link hình ảnh nếu có" className="w-full rounded-2xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500" />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Mô tả</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Mô tả ngắn về sản phẩm" className="w-full resize-none rounded-2xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500" />
          </div>

          <div className="mt-2 flex gap-3">
            {editingProduct && (
              <button type="button" onClick={handleCancel} className="flex-1 rounded-2xl border border-white/10 bg-[#202020] py-3 text-sm font-bold text-gray-200 transition hover:bg-[#292929]">
                Hủy
              </button>
            )}
            <button type="submit" disabled={units.length === 0} className="flex-1 rounded-2xl bg-[#E50914] py-3 text-sm font-bold text-white transition hover:bg-[#b20710] disabled:cursor-not-allowed disabled:bg-[#6b1b1f]">
              {editingProduct ? 'Lưu cập nhật' : 'Tạo sản phẩm'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AdminProductsPage;
