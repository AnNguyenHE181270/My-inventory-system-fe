import { useState } from 'react';

const products = [
  { id: 'SP001', name: 'Ống thép DN50 dài 6m', category: 'Ống thép', price: '190,000', stock: 15, status: 'available', unit: 'Cây' },
  { id: 'SP002', name: 'Van cầu inox DN25', category: 'Van khóa', price: '225,000', stock: 8, status: 'available', unit: 'Cái' },
  { id: 'SP003', name: 'Bơm nước ly tâm 1HP', category: 'Máy bơm', price: '2,450,000', stock: 0, status: 'out_of_stock', unit: 'Cái' },
  { id: 'SP004', name: 'Dây cáp điện 3x4mm', category: 'Điện', price: '350,000', stock: 5, status: 'available', unit: 'Cuộn' },
  { id: 'SP005', name: 'Tủ điện ngoài trời IP65', category: 'Điện', price: '3,200,000', stock: 3, status: 'low_stock', unit: 'Cái' },
  { id: 'SP006', name: 'Bulong M12x50 (hộp 50c)', category: 'Ốc vít', price: '120,000', stock: 20, status: 'available', unit: 'Hộp' },
  { id: 'SP007', name: 'Keo silicon chịu nhiệt', category: 'Hóa chất', price: '45,000', stock: 2, status: 'low_stock', unit: 'Tuýp' }
];

const statusBadge = {
  available: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  low_stock: 'bg-amber-100 text-amber-700 border border-amber-200',
  out_of_stock: 'bg-red-100 text-red-700 border border-red-200'
};

const statusLabel = {
  available: 'Còn hàng',
  low_stock: 'Sắp hết',
  out_of_stock: 'Hết hàng'
};

const statusIcon = {
  available: 'fa-check-circle',
  low_stock: 'fa-exclamation-triangle',
  out_of_stock: 'fa-times-circle'
};

function ProductsPage() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = [...new Set(products.map(product => product.category))];
  const filtered = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                       product.id.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Danh sách vật tư</h2>
          <p className="mt-0.5 text-xs text-gray-500">Quản lý kho vật tư xây dựng</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <i className="fa-solid fa-layer-group absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"></i>
            <select
              value={filterCategory}
              onChange={event => setFilterCategory(event.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
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
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"></i>
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Tìm vật tư..."
              className="w-64 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              {['Mã VT', 'Tên vật tư', 'Danh mục', 'ĐVT', 'Giá bán', 'Tồn kho', 'Trạng thái'].map(head => (
                <th key={head} className="px-6 py-3.5">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <i className="fa-solid fa-box-open mb-3 text-4xl text-gray-300"></i>
                  <p className="text-sm text-gray-400">Không tìm thấy vật tư</p>
                </td>
              </tr>
            ) : (
              filtered.map(product => (
                <tr key={product.id} className="transition hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-red-600">{product.id}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      <i className="fa-solid fa-tag text-[10px]"></i>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{product.unit}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{product.price} ₫</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${product.stock < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[product.status]}`}>
                      <i className={`fa-solid ${statusIcon[product.status]}`}></i>
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
