import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../../shared/context/auth-context';

const statusBadge = {
  available: 'border border-emerald-500/20 bg-emerald-500/15 text-emerald-300',
  low_stock: 'border border-amber-500/20 bg-amber-500/15 text-amber-300',
  out_of_stock: 'border border-rose-500/20 bg-rose-500/15 text-rose-300'
};

const statusLabel = {
  available: 'Còn hàng',
  low_stock: 'Sắp hết',
  out_of_stock: 'Hết hàng'
};

const formatMoney = value => Number(value || 0).toLocaleString('vi-VN');

function ProductsPage() {
  const auth = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/inventory/products-in-stock', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'Không thể tải danh sách vật tư.');
        setProducts(payload.products || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    if (auth.token) loadProducts();
  }, [auth.token]);

  const categories = useMemo(
    () => [...new Set(products.map(product => product.category).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products
      .map(product => ({
        ...product,
        status: product.stock <= 0 ? 'out_of_stock' : product.stock <= 5 ? 'low_stock' : 'available'
      }))
      .filter(product => {
        const matchSearch =
          !keyword ||
          product.name?.toLowerCase().includes(keyword) ||
          product.sku?.toLowerCase().includes(keyword) ||
          product.barcode?.toLowerCase().includes(keyword);
        const matchCategory = filterCategory === 'all' || product.category === filterCategory;
        return matchSearch && matchCategory;
      });
  }, [products, search, filterCategory]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#202020] px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-white">Danh sách vật tư</h2>
          <p className="mt-0.5 text-xs text-gray-500">Theo dõi vật tư còn bán được trong kho</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <i className="fa-solid fa-layer-group absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"></i>
            <select
              value={filterCategory}
              onChange={event => setFilterCategory(event.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-[#181818] py-2 pl-9 pr-8 text-sm font-medium text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"></i>
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Tìm vật tư..."
              className="w-64 rounded-lg border border-white/10 bg-[#181818] py-2 pl-9 pr-3 text-sm text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-[#202020] text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              {['SKU', 'Tên vật tư', 'Danh mục', 'ĐVT', 'Giá bán', 'Tồn kho', 'Trạng thái'].map(head => (
                <th key={head} className="px-6 py-3.5">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center text-sm text-gray-500">Đang tải vật tư...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center text-sm text-rose-300">{error}</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center text-sm text-gray-500">Không tìm thấy vật tư.</td>
              </tr>
            ) : (
              filtered.map(product => (
                <tr key={product._id} className="transition hover:bg-white/[0.03]">
                  <td className="px-6 py-4 font-semibold text-red-400">{product.sku}</td>
                  <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                  <td className="px-6 py-4 text-gray-300">{product.category || '--'}</td>
                  <td className="px-6 py-4 text-gray-400">{product.unit || '--'}</td>
                  <td className="px-6 py-4 font-semibold text-white">{formatMoney(product.price)} đ</td>
                  <td className="px-6 py-4 font-semibold text-white">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[product.status]}`}>
                      {statusLabel[product.status]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductsPage;
