import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../../shared/context/auth-context';

const formatMoney = value => Number(value || 0).toLocaleString('vi-VN');

function ReportsPage() {
  const auth = useContext(AuthContext);
  const [exportsData, setExportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/export', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'Không thể tải dữ liệu báo cáo.');
        setExportsData(payload.exports || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    if (auth.token) loadReports();
  }, [auth.token]);

  const { totalRevenue, totalOrders, avgOrder, monthlyRows, topProducts } = useMemo(() => {
    const completed = exportsData.filter(item => item.status === 'completed');
    const revenue = completed.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const avg = completed.length ? Math.round(revenue / completed.length) : 0;

    const monthMap = new Map();
    const productMap = new Map();

    completed.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = Number.isNaN(date.getTime())
        ? 'Khác'
        : new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(date);

      const monthRecord = monthMap.get(monthKey) || { month: monthKey, orders: 0, revenue: 0, customers: new Set() };
      monthRecord.orders += 1;
      monthRecord.revenue += Number(order.totalAmount || 0);
      if (order.customerName) monthRecord.customers.add(order.customerName);
      monthMap.set(monthKey, monthRecord);

      (order.items || []).forEach(item => {
        const key = item.productNameSnapshot || item.skuSnapshot || 'Sản phẩm';
        const current = productMap.get(key) || { name: key, sold: 0, revenue: 0 };
        current.sold += Number(item.quantity || 0);
        current.revenue += Number(item.lineTotal || 0);
        productMap.set(key, current);
      });
    });

    return {
      totalRevenue: revenue,
      totalOrders: completed.length,
      avgOrder: avg,
      monthlyRows: Array.from(monthMap.values()).slice(-6).map(item => ({
        month: item.month,
        orders: item.orders,
        revenue: item.revenue,
        customers: item.customers.size
      })),
      topProducts: Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    };
  }, [exportsData]);

  const statCards = [
    { label: 'Tổng doanh thu', value: `${formatMoney(totalRevenue)} đ`, icon: 'fa-sack-dollar', color: 'from-emerald-500 to-emerald-600' },
    { label: 'Tổng đơn hàng', value: totalOrders, icon: 'fa-file-invoice', color: 'from-blue-500 to-blue-600' },
    { label: 'Giá trị TB / đơn', value: `${formatMoney(avgOrder)} đ`, icon: 'fa-chart-line', color: 'from-violet-500 to-violet-600' }
  ];

  return (
    <div className="space-y-6">
      {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-3">
        {statCards.map(stat => (
          <div key={stat.label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#181818] p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-white">{loading ? '--' : stat.value}</p>
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <i className={`fa-solid ${stat.icon} text-xl text-white`}></i>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.color}`}></div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
          <div className="border-b border-white/10 bg-[#202020] px-6 py-4">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-calendar-days text-red-500"></i>
              <h2 className="text-lg font-bold text-white">Doanh thu theo tháng</h2>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">Thống kê từ đơn bán hàng đã hoàn thành</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#202020] text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {['Tháng', 'Đơn hàng', 'Doanh thu', 'Khách hàng'].map(head => (
                    <th key={head} className="px-6 py-3.5">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {loading ? (
                  <tr><td colSpan="4" className="px-6 py-16 text-center text-sm text-gray-500">Đang tải báo cáo...</td></tr>
                ) : monthlyRows.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-16 text-center text-sm text-gray-500">Chưa có dữ liệu doanh thu.</td></tr>
                ) : (
                  monthlyRows.map(row => (
                    <tr key={row.month} className="transition hover:bg-white/[0.03]">
                      <td className="px-6 py-4 font-semibold text-white">{row.month}</td>
                      <td className="px-6 py-4 text-gray-300">{row.orders}</td>
                      <td className="px-6 py-4 font-semibold text-white">{formatMoney(row.revenue)} đ</td>
                      <td className="px-6 py-4 text-gray-300">{row.customers}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
          <div className="border-b border-white/10 bg-[#202020] px-6 py-4">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-trophy text-red-500"></i>
              <h2 className="text-lg font-bold text-white">Top vật tư bán chạy</h2>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">Xếp hạng theo doanh thu đơn bán</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#202020] text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {['#', 'Vật tư', 'Đã bán', 'Doanh thu'].map(head => (
                    <th key={head} className="px-6 py-3.5">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {loading ? (
                  <tr><td colSpan="4" className="px-6 py-16 text-center text-sm text-gray-500">Đang tải báo cáo...</td></tr>
                ) : topProducts.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-16 text-center text-sm text-gray-500">Chưa có dữ liệu vật tư bán chạy.</td></tr>
                ) : (
                  topProducts.map((product, index) => (
                    <tr key={product.name} className="transition hover:bg-white/[0.03]">
                      <td className="px-6 py-4 text-gray-300">#{index + 1}</td>
                      <td className="px-6 py-4 font-semibold text-white">{product.name}</td>
                      <td className="px-6 py-4 text-gray-300">{product.sold}</td>
                      <td className="px-6 py-4 font-semibold text-white">{formatMoney(product.revenue)} đ</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
