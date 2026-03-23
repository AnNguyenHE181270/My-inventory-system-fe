import { Link } from 'react-router-dom';
import { dashboardRoutes } from '../../../app/router/routes.constants';

const stats = [
  { icon: 'fa-solid fa-shopping-cart', label: 'Đơn hàng hôm nay', value: '12', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
  { icon: 'fa-solid fa-dollar-sign', label: 'Doanh thu hôm nay', value: '8.5M', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { icon: 'fa-solid fa-user-plus', label: 'Khách hàng mới', value: '5', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600' },
  { icon: 'fa-solid fa-check-circle', label: 'Đơn hoàn thành', value: '9', color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50', text: 'text-violet-600' }
];

const orders = [
  { id: '#DH001', customer: 'Nguyen Van A', product: 'Laptop Dell XPS', amount: '25,000,000', status: 'completed', date: '10/01/2025' },
  { id: '#DH002', customer: 'Tran Thi B', product: 'iPhone 15 Pro', amount: '30,000,000', status: 'pending', date: '10/01/2025' },
  { id: '#DH003', customer: 'Le Van C', product: 'Samsung TV 55"', amount: '15,000,000', status: 'processing', date: '09/01/2025' },
  { id: '#DH004', customer: 'Pham Thi D', product: 'MacBook Air M2', amount: '28,000,000', status: 'completed', date: '09/01/2025' },
  { id: '#DH005', customer: 'Hoang Van E', product: 'iPad Pro 12.9"', amount: '22,000,000', status: 'cancelled', date: '08/01/2025' }
];

const badge = {
  completed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border border-red-200'
};

const badgeLabel = {
  completed: 'Hoàn thành',
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  cancelled: 'Đã hủy'
};

function SalesDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <i className={`${stat.icon} text-lg text-white`}></i>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.color}`}></div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Đơn hàng gần đây</h2>
            <p className="mt-0.5 text-xs text-gray-500">Danh sách đơn hàng mới nhất</p>
          </div>
          <Link 
            to={dashboardRoutes.staffOrders} 
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <span>Xem tất cả</span>
            <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Giá trị', 'Ngày', 'Trạng thái'].map(head => (
                  <th key={head} className="px-6 py-3.5">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.id} className="transition hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-red-600">{order.id}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-600">{order.product}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{order.amount} ₫</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{order.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge[order.status]}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                      {badgeLabel[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SalesDashboard;
