const monthlyData = [
  { month: 'Tháng 7', orders: 45, revenue: '112,500,000', customers: 32 },
  { month: 'Tháng 8', orders: 52, revenue: '130,000,000', customers: 38 },
  { month: 'Tháng 9', orders: 48, revenue: '120,000,000', customers: 35 },
  { month: 'Tháng 10', orders: 61, revenue: '152,500,000', customers: 45 },
  { month: 'Tháng 11', orders: 70, revenue: '175,000,000', customers: 52 },
  { month: 'Tháng 12', orders: 85, revenue: '212,500,000', customers: 63 }
];

const topProducts = [
  { name: 'Ống thép DN50', sold: 28, revenue: '840,000,000' },
  { name: 'Van cầu inox DN25', sold: 22, revenue: '616,000,000' },
  { name: 'Bơm nước ly tâm', sold: 18, revenue: '450,000,000' },
  { name: 'Dây cáp điện 3x4mm', sold: 15, revenue: '330,000,000' },
  { name: 'Tủ điện IP65', sold: 12, revenue: '180,000,000' }
];

const rankBadge = [
  'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white',
  'bg-gradient-to-br from-gray-300 to-gray-400 text-white',
  'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
];

function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          { label: 'Tổng doanh thu', value: '1,102,500,000', icon: 'fa-solid fa-sack-dollar', color: 'from-emerald-500 to-emerald-600' },
          { label: 'Tổng đơn hàng', value: '361', icon: 'fa-solid fa-file-invoice', color: 'from-blue-500 to-blue-600' },
          { label: 'Giá trị TB / đơn', value: '3,053,000', icon: 'fa-solid fa-chart-line', color: 'from-violet-500 to-violet-600' }
        ].map(stat => (
          <div key={stat.label} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value} ₫</p>
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <i className={`${stat.icon} text-xl text-white`}></i>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.color}`}></div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-calendar-days text-red-600"></i>
              <h2 className="text-lg font-bold text-gray-900">Doanh thu theo tháng</h2>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">Thống kê 6 tháng gần đây</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  {['Tháng', 'Đơn hàng', 'Doanh thu', 'Khách hàng'].map(head => (
                    <th key={head} className="px-6 py-3.5">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthlyData.map(row => (
                  <tr key={row.month} className="transition hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{row.month}</td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className="inline-flex items-center gap-1.5">
                        <i className="fa-solid fa-receipt text-xs text-gray-400"></i>
                        {row.orders}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{row.revenue} ₫</td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className="inline-flex items-center gap-1.5">
                        <i className="fa-solid fa-users text-xs text-gray-400"></i>
                        {row.customers}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-trophy text-red-600"></i>
              <h2 className="text-lg font-bold text-gray-900">Top vật tư bán chạy</h2>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">Xếp hạng theo doanh thu</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  {['#', 'Vật tư', 'Đã bán', 'Doanh thu'].map(head => (
                    <th key={head} className="px-6 py-3.5">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.map((product, index) => (
                  <tr key={product.name} className="transition hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${rankBadge[index] || 'bg-gray-100 text-gray-600'} text-xs font-bold shadow-sm`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className="inline-flex items-center gap-1.5">
                        <i className="fa-solid fa-box text-xs text-gray-400"></i>
                        {product.sold}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{product.revenue} ₫</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
