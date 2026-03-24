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
import { useContext, useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { AuthContext } from '../../../shared/context/auth-context';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

const formatCurrency = value => Number(value || 0).toLocaleString('vi-VN');

const formatDateLabel = value => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit'
  }).format(date);
};

function AdminOverviewPage() {
  const auth = useContext(AuthContext);
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadImports = async () => {
      if (!auth.token) return;

      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/import', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || 'Không tải được dữ liệu thống kê.');
        }
        setImports(payload.imports || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadImports();
  }, [auth.token]);

  const stats = useMemo(() => {
    const pending = imports.filter(item => item.status === 'pending').length;
    const approved = imports.filter(item => item.status === 'approved').length;
    const rejected = imports.filter(item => item.status === 'rejected').length;
    const cancelled = imports.filter(item => item.status === 'cancelled').length;
    const totalApprovedValue = imports
      .filter(item => item.status === 'approved')
      .reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);

    return { pending, approved, rejected, cancelled, totalApprovedValue };
  }, [imports]);

  const statusChartData = useMemo(
    () => ({
      labels: ['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã hủy'],
      datasets: [
        {
          data: [stats.pending, stats.approved, stats.rejected, stats.cancelled],
          backgroundColor: ['#f59e0b', '#22c55e', '#ef4444', '#6b7280'],
          borderColor: ['#181818', '#181818', '#181818', '#181818'],
          borderWidth: 4
        }
      ]
    }),
    [stats]
  );

  const valueByDayData = useMemo(() => {
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const totals = days.map(day => {
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      return imports.reduce((sum, item) => {
        const createdAt = new Date(item.createdAt);
        if (createdAt >= day && createdAt < nextDay) {
          return sum + Number(item.totalAmount || 0);
        }
        return sum;
      }, 0);
    });

    return {
      labels: days.map(day => formatDateLabel(day)),
      datasets: [
        {
          label: 'Giá trị phiếu',
          data: totals,
          backgroundColor: '#E50914',
          borderRadius: 10,
          maxBarThickness: 34
        }
      ]
    };
  }, [imports]);

  const createdByDayData = useMemo(() => {
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const counts = days.map(day => {
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      return imports.reduce((sum, item) => {
        const createdAt = new Date(item.createdAt);
        if (createdAt >= day && createdAt < nextDay) {
          return sum + 1;
        }
        return sum;
      }, 0);
    });

    return {
      labels: days.map(day => formatDateLabel(day)),
      datasets: [
        {
          label: 'Số phiếu tạo',
          data: counts,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.15)',
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#181818',
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.35,
          fill: true
        }
      ]
    };
  }, [imports]);

  return (
    <div className="space-y-6 text-white">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#111111_0%,#1c1c1c_40%,#2b0b0e_100%)] p-7 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-500">Tổng quan điều hành</div>
        <h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-white">Theo dõi nhập kho toàn hệ thống</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-300">
          Màn này tập trung cho admin quan sát tình hình phiếu nhập, giá trị đang chờ duyệt và nhịp tạo phiếu trong 7 ngày gần đây.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-4">
        <OverviewStatCard title="Chờ duyệt" value={stats.pending} tone="amber" icon="fa-clock" />
        <OverviewStatCard title="Đã duyệt" value={stats.approved} tone="emerald" icon="fa-circle-check" />
        <OverviewStatCard title="Từ chối" value={stats.rejected} tone="rose" icon="fa-ban" />
        <OverviewStatCard
          title="Giá trị đã duyệt"
          value={`${formatCurrency(stats.totalApprovedValue)} đ`}
          tone="red"
          icon="fa-sack-dollar"
        />
      </div>

      {loading ? (
        <div className="rounded-[24px] border border-white/10 bg-[#181818] px-6 py-12 text-center text-sm text-gray-500">
          Đang tải dữ liệu thống kê...
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-3">
          <ChartCard
            eyebrow="Trạng thái phiếu"
            title="Tỷ lệ xử lý phiếu"
            description="Biểu đồ tròn cho thấy tình hình phiếu chờ duyệt, đã duyệt và bị từ chối."
          >
            <div className="mx-auto max-w-[220px]">
              <Doughnut
                data={statusChartData}
                options={{
                  plugins: {
                    legend: {
                      labels: { color: '#d1d5db' }
                    }
                  },
                  cutout: '62%'
                }}
              />
            </div>
          </ChartCard>

          <ChartCard
            eyebrow="Giá trị theo ngày"
            title="Giá trị phiếu 7 ngày"
            description="Biểu đồ cột cho thấy tổng giá trị phiếu nhập được tạo mỗi ngày."
          >
            <div className="h-[260px]">
              <Bar
                data={valueByDayData}
                options={{
                  plugins: { legend: { display: false } },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { color: '#9ca3af' }
                    },
                    y: {
                      beginAtZero: true,
                      ticks: { color: '#9ca3af' },
                      grid: { color: 'rgba(255,255,255,0.08)' }
                    }
                  }
                }}
              />
            </div>
          </ChartCard>

          <ChartCard
            eyebrow="Nhịp tạo phiếu"
            title="Số phiếu tạo theo ngày"
            description="Biểu đồ line cho biết trong 7 ngày gần đây hệ thống tạo ra bao nhiêu phiếu nhập."
          >
            <div className="h-[260px]">
              <Line
                data={createdByDayData}
                options={{
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
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function OverviewStatCard({ title, value, tone, icon }) {
  const toneClass =
    tone === 'amber'
      ? 'bg-amber-500 text-white shadow-amber-900/30'
      : tone === 'emerald'
        ? 'bg-emerald-500 text-white shadow-emerald-900/30'
        : tone === 'rose'
          ? 'bg-rose-500 text-white shadow-rose-900/30'
          : 'bg-[#E50914] text-white shadow-red-950/30';

  return (
    <div className="rounded-[24px] border border-white/10 bg-[#181818] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">{title}</div>
          <div className="mt-3 text-3xl font-black text-white">{value}</div>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${toneClass}`}>
          <i className={`fa-solid ${icon} text-lg`}></i>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ eyebrow, title, description, children }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#181818] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-red-500">{eyebrow}</div>
      <h3 className="mt-2 text-xl font-black text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default AdminOverviewPage;
