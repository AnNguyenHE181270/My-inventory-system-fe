import { useState } from 'react';

const initialOrders = [
  { id: '#DH001', customer: 'Nguyen Van A', phone: '0901234567', product: 'Ống thép DN50', amount: '25,000,000', status: 'completed', date: '10/01/2025' },
  { id: '#DH002', customer: 'Tran Thi B', phone: '0912345678', product: 'Van cầu inox', amount: '30,000,000', status: 'pending', date: '10/01/2025' },
  { id: '#DH003', customer: 'Le Van C', phone: '0923456789', product: 'Bơm nước ly tâm', amount: '15,000,000', status: 'processing', date: '09/01/2025' },
  { id: '#DH004', customer: 'Pham Thi D', phone: '0934567890', product: 'Dây cáp điện', amount: '28,000,000', status: 'completed', date: '09/01/2025' },
  { id: '#DH005', customer: 'Hoang Van E', phone: '0945678901', product: 'Tủ điện IP65', amount: '22,000,000', status: 'cancelled', date: '08/01/2025' },
  { id: '#DH006', customer: 'Vu Thi F', phone: '0956789012', product: 'Bulong M12', amount: '6,500,000', status: 'completed', date: '08/01/2025' },
  { id: '#DH007', customer: 'Đặng Văn G', phone: '0967890123', product: 'Keo silicon', amount: '8,000,000', status: 'pending', date: '07/01/2025' }
];

const statusBadge = {
  completed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border border-red-200'
};

const statusLabel = {
  completed: 'Hoàn thành',
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  cancelled: 'Đã hủy'
};

const statusIcon = {
  completed: 'fa-check-circle',
  pending: 'fa-clock',
  processing: 'fa-spinner',
  cancelled: 'fa-times-circle'
};

function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = orders.filter(order => {
    const matchSearch =
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id, newStatus) => {
    setOrders(prev => prev.map(order => (order.id === id ? { ...order, status: newStatus } : order)));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Quản lý đơn hàng</h2>
          <p className="mt-0.5 text-xs text-gray-500">Danh sách tất cả đơn hàng</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <i className="fa-solid fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"></i>
            <select
              value={filterStatus}
              onChange={event => setFilterStatus(event.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"></i>
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Tìm theo tên, mã đơn..."
              className="w-64 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              {['Mã đơn', 'Khách hàng', 'Số điện thoại', 'Sản phẩm', 'Giá trị', 'Ngày tạo', 'Trạng thái', 'Thao tác'].map(head => (
                <th key={head} className="px-6 py-3.5">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-16 text-center">
                  <i className="fa-solid fa-inbox mb-3 text-4xl text-gray-300"></i>
                  <p className="text-sm text-gray-400">Không tìm thấy đơn hàng</p>
                </td>
              </tr>
            ) : (
              filtered.map(order => (
                <tr key={order.id} className="transition hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-red-600">{order.id}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-500">{order.phone}</td>
                  <td className="px-6 py-4 text-gray-600">{order.product}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{order.amount} ₫</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{order.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[order.status]}`}>
                      <i className={`fa-solid ${statusIcon[order.status]}`}></i>
                      {statusLabel[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(order.id, 'processing')}
                          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          <i className="fa-solid fa-play text-[10px]"></i>
                          Xử lý
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button
                          onClick={() => updateStatus(order.id, 'completed')}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                        >
                          <i className="fa-solid fa-check text-[10px]"></i>
                          Hoàn thành
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <button
                          onClick={() => updateStatus(order.id, 'cancelled')}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          <i className="fa-solid fa-times text-[10px]"></i>
                          Hủy
                        </button>
                      )}
                    </div>
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

export default OrdersPage;
