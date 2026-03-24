import { useContext, useEffect, useMemo, useState } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { dashboardRoutes } from '../../../app/router/routes.constants';
import { AuthContext } from '../../../shared/context/auth-context';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

const formatMoney = value => Number(value || 0).toLocaleString('vi-VN');

const statusBadge = {
  completed: 'bg-emerald-500/15 text-emerald-300',
  draft: 'bg-amber-500/15 text-amber-300',
  cancelled: 'bg-rose-500/15 text-rose-300'
};

const statusLabel = {
  completed: 'Hoàn thành',
  draft: 'Phiếu tạm',
  cancelled: 'Đã hủy'
};

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#d1d5db'
      }
    }
  }
};

function SalesDashboard() {
  const auth = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.token) return;

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
        if (!response.ok) throw new Error(payload.message || 'Không thể tải dữ liệu dashboard.');
        setOrders(payload.exports || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [auth.token]);

  const todayKey = useMemo(() => new Date().toDateString(), []);

  const {
    stats,
    doughnutData,
    barData,
    lineData,
    recentOrders
  } = useMemo(() => {
    const todayOrders = orders.filter(order => new Date(order.createdAt).toDateString() === todayKey);
    const completedOrders = orders.filter(order => order.status === 'completed');
    const todayRevenue = todayOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    const statusCounts = {
      completed: todayOrders.filter(order => order.status === 'completed').length,
      draft: todayOrders.filter(order => order.status === 'draft').length,
      cancelled: todayOrders.filter(order => order.status === 'cancelled').length
    };

    const weekdayFormatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' });
    const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' });

    const revenueBuckets = [];
    const orderBuckets = [];

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - index);

      const bucketKey = date.toDateString();
      const ordersOfDay = orders.filter(order => new Date(order.createdAt).toDateString() === bucketKey);
      const revenueOfDay = ordersOfDay
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

      revenueBuckets.push({
        label: weekdayFormatter.format(date),
        value: revenueOfDay
      });

      orderBuckets.push({
        label: dateFormatter.format(date),
        value: ordersOfDay.length
      });
    }

    return {
      stats: [
        {
          label: 'Đơn hàng hôm nay',
          value: loading ? '--' : todayOrders.length,
          icon: 'fa-shopping-cart',
          color: 'from-red-600 to-red-500'
        },
        {
          label: 'Doanh thu hôm nay',
          value: loading ? '--' : `${formatMoney(todayRevenue)} đ`,
          icon: 'fa-sack-dollar',
          color: 'from-emerald-600 to-emerald-500'
        },
        {
          label: 'Tổng đơn đã tạo',
          value: loading ? '--' : orders.length,
          icon: 'fa-receipt',
          color: 'from-amber-500 to-orange-500'
        },
        {
          label: 'Đơn hoàn thành',
          value: loading ? '--' : completedOrders.length,
          icon: 'fa-circle-check',
          color: 'from-blue-600 to-blue-500'
        }
      ],
      doughnutData: {
        labels: ['Hoàn thành', 'Phiếu tạm', 'Đã hủy'],
        datasets: [
          {
            data: [statusCounts.completed, statusCounts.draft, statusCounts.cancelled],
            backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
            borderColor: ['#181818', '#181818', '#181818'],
            borderWidth: 4
          }
        ]
      },
      barData: {
        labels: revenueBuckets.map(item => item.label),
        datasets: [
          {
            label: 'Doanh thu',
            data: revenueBuckets.map(item => item.value),
            backgroundColor: '#E50914',
            borderRadius: 10,
            maxBarThickness: 34
          }
        ]
      },
      lineData: {
        labels: orderBuckets.map(item => item.label),
        datasets: [
          {
            label: 'Số đơn tạo',
            data: orderBuckets.map(item => item.value),
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.18)',
            pointBackgroundColor: '#22c55e',
            pointBorderColor: '#181818',
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.35,
            fill: true
          }
        ]
      },
      recentOrders: orders.slice(0, 5)
    };
  }, [loading, orders, todayKey]);

  return (
    <div className="space-y-6 text-white">
      <section className="rounded-[28px] border border-white/10 bg-[#181818] p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-500">Tổng quan bán hàng</div>
            <h2 className="mt-2 text-3xl font-black">Doanh thu của riêng bạn.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              Dashboard này chỉ hiển thị đơn hàng và doanh thu của nhân viên đang đăng nhập.
            </p>
          </div>
          <Link
            to={dashboardRoutes.staffSell}
            className="rounded-2xl bg-[#E50914] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#b20710]"
          >
            Tạo đơn mới
          </Link>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

      <div className="grid gap-5 xl:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#181818] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">{stat.label}</p>
                <p className="mt-3 text-3xl font-black text-white">{stat.value}</p>
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-black/30`}>
                <i className={`fa-solid ${stat.icon} text-lg text-white`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-[#181818] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-red-500">Trạng thái đơn</div>
          <h3 className="mt-2 text-xl font-black">Tỷ lệ xử lý hôm nay</h3>
          <p className="mt-1 text-sm text-gray-400">Chỉ thống kê đơn của nhân viên đang đăng nhập trong ngày.</p>
          <div className="mx-auto mt-5 h-[220px] max-w-[220px]">
            <Doughnut
              data={doughnutData}
              options={{
                ...commonOptions,
                cutout: '62%'
              }}
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#181818] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-red-500">Doanh thu</div>
          <h3 className="mt-2 text-xl font-black">Doanh thu 7 ngày</h3>
          <p className="mt-1 text-sm text-gray-400">Chỉ tính từ đơn completed của nhân viên này.</p>
          <div className="mt-4 h-[260px]">
            <Bar
              data={barData}
              options={{
                ...commonOptions,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: '#9ca3af',
                      callback: value => formatMoney(value)
                    },
                    grid: { color: 'rgba(255,255,255,0.08)' }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#181818] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-red-500">Đơn hàng</div>
          <h3 className="mt-2 text-xl font-black">Số đơn tạo theo ngày</h3>
          <p className="mt-1 text-sm text-gray-400">Theo dõi số đơn mà nhân viên này tạo trong 7 ngày qua.</p>
          <div className="mt-4 h-[260px]">
            <Line
              data={lineData}
              options={{
                ...commonOptions,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af', precision: 0 },
                    grid: { color: 'rgba(255,255,255,0.08)' }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-[24px] border border-white/10 bg-[#181818] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-red-500">Đơn gần đây</div>
            <h3 className="mt-1 text-2xl font-black">Đơn của nhân viên này</h3>
          </div>
          <Link
            to={dashboardRoutes.staffOrders}
            className="rounded-2xl border border-white/10 bg-[#202020] px-4 py-2.5 text-sm font-bold text-gray-200 transition hover:border-red-500/40 hover:bg-[#E50914]"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 bg-[#202020] text-gray-400">
              <tr>
                <th className="px-6 py-4 font-bold">Mã đơn</th>
                <th className="px-6 py-4 font-bold">Khách hàng</th>
                <th className="px-6 py-4 font-bold">Thời gian</th>
                <th className="px-6 py-4 font-bold">Tổng tiền</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">Đang tải dashboard...</td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">Nhân viên này chưa có đơn hàng nào.</td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-white/[0.03]">
                    <td className="px-6 py-5 font-semibold text-red-400">{order.exportCode}</td>
                    <td className="px-6 py-5 text-white">{order.customerName || 'Khách lẻ'}</td>
                    <td className="px-6 py-5 text-gray-400">{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-5 font-semibold text-white">{formatMoney(order.totalAmount)} đ</td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge[order.status] || statusBadge.completed}`}>
                        {statusLabel[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default SalesDashboard;
