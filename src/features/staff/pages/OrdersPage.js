import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../../shared/context/auth-context';

const statusBadge = {
  completed: 'border border-emerald-500/20 bg-emerald-500/15 text-emerald-300',
  draft: 'border border-amber-500/20 bg-amber-500/15 text-amber-300',
  cancelled: 'border border-rose-500/20 bg-rose-500/15 text-rose-300'
};

const statusLabel = {
  completed: 'Hoàn thành',
  draft: 'Phiếu tạm',
  cancelled: 'Đã hủy'
};

const formatMoney = value => Number(value || 0).toLocaleString('vi-VN');

function OrdersPage() {
  const auth = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/export', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'Không thể tải danh sách đơn hàng.');
        setOrders(payload.exports || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    if (auth.token) loadOrders();
  }, [auth.token]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return orders.filter(order => {
      const matchSearch =
        !keyword ||
        order.exportCode?.toLowerCase().includes(keyword) ||
        order.customerName?.toLowerCase().includes(keyword);
      const matchStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, search, filterStatus]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#202020] px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-white">Quản lý đơn hàng</h2>
          <p className="mt-0.5 text-xs text-gray-500">Danh sach don ban hang da tao</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <i className="fa-solid fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"></i>
            <select
              value={filterStatus}
              onChange={event => setFilterStatus(event.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-[#181818] py-2 pl-9 pr-8 text-sm font-medium text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Hoàn thành</option>
              <option value="draft">Phiếu tạm</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"></i>
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Tìm theo khách hoặc mã đơn..."
              className="w-64 rounded-lg border border-white/10 bg-[#181818] py-2 pl-9 pr-3 text-sm text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-[#202020] text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              {['Mã đơn', 'Khách hàng', 'Số dòng', 'Giá trị', 'Ngày tạo', 'Trạng thái'].map(head => (
                <th key={head} className="px-6 py-3.5">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center text-sm text-gray-500">Đang tải đơn hàng...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center text-sm text-rose-300">{error}</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center text-sm text-gray-500">Chưa có đơn hàng nào.</td>
              </tr>
            ) : (
              filtered.map(order => (
                <tr key={order._id} className="transition hover:bg-white/[0.03]">
                  <td className="px-6 py-4 font-semibold text-red-400">{order.exportCode}</td>
                  <td className="px-6 py-4 font-medium text-white">{order.customerName || 'Khách lẻ'}</td>
                  <td className="px-6 py-4 text-gray-300">{order.items?.length || 0} dòng</td>
                  <td className="px-6 py-4 font-semibold text-white">{formatMoney(order.totalAmount)} đ</td>
                  <td className="px-6 py-4 text-gray-400">{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[order.status] || statusBadge.completed}`}>
                      {statusLabel[order.status] || order.status}
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

export default OrdersPage;
