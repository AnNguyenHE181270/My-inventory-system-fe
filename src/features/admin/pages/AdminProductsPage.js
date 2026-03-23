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
    name: '', sku: '', barcode: '', price: '', costPrice: '', 
    description: '', category: '', brand: '', unit: '', isActive: true 
  });

  useEffect(() => {
    loadInitData();
  }, [auth.token]);

  const loadInitData = async () => {
    setLoading(true);
    try {
      const [resProducts, resUnits] = await Promise.all([
        fetch('/api/product'),
        fetch('/api/unit', { headers: { Authorization: `Bearer ${auth.token}` } })
      ]);
      const dataP = await resProducts.json();
      const dataU = await resUnits.json();
      
      if (!resProducts.ok) throw new Error(dataP.message || 'Lỗi tải sản phẩm');
      setProducts(dataP.products || []);
      setUnits(dataU.units || []);
      
      if (dataU.units && dataU.units.length > 0) {
        setForm(f => ({ ...f, unit: dataU.units[0]._id }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleEdit = (prod) => {
    setEditingProduct(prod);
    setForm({
      name: prod.name,
      sku: prod.sku,
      barcode: prod.barcode || '',
      price: prod.price,
      costPrice: prod.costPrice || '',
      description: prod.description || '',
      category: prod.category || '',
      brand: prod.brand || '',
      unit: prod.unit?._id || prod.unit || '',
      isActive: prod.isActive ?? true
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setForm({ 
      name: '', sku: '', barcode: '', price: '', costPrice: '', 
      description: '', category: '', brand: '', 
      unit: units.length > 0 ? units[0]._id : '', 
      isActive: true 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const isEdit = !!editingProduct;
      const url = isEdit ? `/api/product/${editingProduct._id}` : '/api/product';
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
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? data.product : p));
        setSuccess('Cập nhật sản phẩm thành công.');
      } else {
        setProducts(prev => [data.product, ...prev]);
        setSuccess('Tạo sản phẩm thành công.');
      }
      handleCancel();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Chắc chắn xóa sản phẩm này? Vui lòng cân nhắc việc "Ngưng bán" thay vì xóa.')) return;
    try {
      const res = await fetch(`/api/product/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xóa thất bại');
      
      setProducts(prev => prev.filter(p => p._id !== id));
      setSuccess('Đã xóa sản phẩm.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1.3fr]">
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm border border-red-100">
        <div className="border-b border-red-100 bg-red-50 px-5 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-800">Quản lý sản phẩm</h2>
            <p className="text-sm text-slate-500">Tìm kiếm và cập nhật kho sản phẩm</p>
          </div>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 border-b border-red-100">{error}</div>}
        {success && <div className="p-4 bg-emerald-50 text-emerald-600 border-b border-emerald-100">{success}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-bold whitespace-nowrap">Sản phẩm</th>
                <th className="px-5 py-3 font-bold">Thuộc tính</th>
                <th className="px-5 py-3 font-bold">Trạng thái</th>
                <th className="px-5 py-3 font-bold w-[120px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400">Đang tải...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400">Chưa có sản phẩm nào.</td></tr>
              ) : (
                products.map(prod => (
                  <tr key={prod._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-bold text-red-700">{prod.name}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        SKU: <span className="font-mono text-slate-700">{prod.sku}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-slate-600">
                        Danh mục: <span className="font-semibold text-slate-900">{prod.category || '--'}</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        Giá: <span className="font-semibold text-slate-900">{prod.price.toLocaleString('vi-VN')} ₫</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {prod.isActive ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Đang bán</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">Ngưng bán</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleEdit(prod)} className="text-blue-600 hover:text-blue-800 font-medium text-xs mr-3">Sửa</button>
                      <button onClick={() => handleDelete(prod._id)} className="text-red-600 hover:text-red-800 font-medium text-xs">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-red-100 p-5 h-fit">
        <h3 className="text-lg font-black text-slate-800 mb-4">{editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h3>
        
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên sản phẩm *</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:border-red-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SKU *</label>
              <input name="sku" value={form.sku} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:border-red-400 uppercase" placeholder="Mã sp" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Barcode</label>
              <input name="barcode" value={form.barcode} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:border-red-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giá bán *</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:border-red-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giá vốn</label>
              <input type="number" name="costPrice" value={form.costPrice} onChange={handleChange} min="0" className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:border-red-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Đơn vị *</label>
              <select name="unit" value={form.unit} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:border-red-400">
                {units.length === 0 && <option value="">Hãy tạo Đơn vị trước</option>}
                {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Danh mục</label>
              <input name="category" value={form.category} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:border-red-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="2" className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm resize-none focus:border-red-400"></textarea>
          </div>
          
          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 text-red-600 rounded" />
            <span className="text-sm font-semibold text-slate-700">Đang hoạt động (cho phép bán)</span>
          </label>

          <div className="flex gap-2 mt-2">
            {editingProduct && (
              <button type="button" onClick={handleCancel} className="flex-1 border border-slate-200 bg-white text-slate-700 text-sm font-bold py-2.5 rounded-lg hover:bg-slate-50">Hủy</button>
            )}
            <button type="submit" disabled={units.length === 0} className="flex-1 bg-red-600 text-white text-sm font-bold py-2.5 rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed">Lưu sản phẩm</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AdminProductsPage;
