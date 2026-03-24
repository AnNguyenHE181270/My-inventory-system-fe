import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js';
import { Link } from 'react-router-dom';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { AuthContext } from '../../../shared/context/auth-context';
import { dashboardRoutes } from '../../../app/router/routes.constants';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

const createEmptyItem = productId => ({
  product: productId || '',
  quantity: 1,
  importPrice: '',
  manufactureDate: '',
  expiryDate: '',
  batchCode: `LÔ-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
});

function SearchableProductSelect({ products, value, onChange, disabled, className }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const prod = products.find(p => p._id === value);
    if (prod) setSearch(prod.name);
    else setSearch('');
  }, [value, products]);

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.trim().toLowerCase()) || p.sku?.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="relative">
      <input
        type="text"
        disabled={disabled}
        className={className}
        placeholder="Nhập tên hoặc mã SKU để tìm..."
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
           setOpen(true);
           setSearch('');
        }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {open && (
        <div className="absolute z-10 mt-1 max-h-[300px] w-full overflow-y-auto overflow-x-hidden rounded-xl border border-white/10 bg-[#181818] p-2 shadow-2xl shadow-black/50 ring-1 ring-white/10">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-sm font-medium text-gray-500">Không có kết quả phù hợp</div>
          ) : (
            filtered.map(p => (
              <div
                key={p._id}
                className="mb-1 cursor-pointer rounded-lg border border-transparent p-3 text-sm transition-colors hover:border-red-500/20 hover:bg-white/[0.04]"
                onClick={() => {
                  setSearch(p.name);
                  setOpen(false);
                  onChange({ target: { name: 'product', value: p._id } });
                }}
              >
                <div className="font-bold text-white">{p.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                  <span className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-gray-300">{p.sku}</span>
                  {p.barcode && <span>Bar: {p.barcode}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const createInitialForm = products => ({
  importCode: `PN-${Date.now().toString().slice(-8)}`,
  supplierName: '',
  supplierPhone: '',
  supplierEmail: '',
  note: '',
  items: [createEmptyItem(products?.[0]?._id || '')]
});

const statusOptions = [
  ['all', 'Tất cả'],
  ['pending', 'Chờ duyệt'],
  ['approved', 'Đã duyệt'],
  ['rejected', 'Từ chối'],
  ['cancelled', 'Đã hủy']
];

const formatCurrency = value => Number(value || 0).toLocaleString('vi-VN');

const formatDateTime = value => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatDateLabel = value => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit'
  }).format(date);
};

const mapImportToForm = importRecord => ({
  importCode: importRecord.importCode || `PN-${Date.now().toString().slice(-8)}`,
  supplierName: importRecord.supplierName || '',
  supplierPhone: importRecord.supplierPhone || '',
  supplierEmail: importRecord.supplierEmail || '',
  note: importRecord.note || '',
  items:
    importRecord.items?.map(item => ({
      product: item.product?._id || item.product || '',
      quantity: item.quantity || 1,
      importPrice: item.importPrice || '',
      manufactureDate: item.manufactureDate ? new Date(item.manufactureDate).toISOString().slice(0, 10) : '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 10) : '',
      batchCode: item.batchCode || ''
    })) || []
});

function ManagerImportsPage({ mode = 'list' }) {
  const auth = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [imports, setImports] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingImports, setLoadingImports] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [editingImportId, setEditingImportId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState(createInitialForm([]));

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await fetch('/api/product');
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'Không tải được danh sách sản phẩm.');
        const nextProducts = payload.products || [];
        setProducts(nextProducts);
        setForm(prev => ({
          ...prev,
          items: prev.items.length
            ? prev.items.map((item, index) =>
                index === 0 && !item.product ? { ...item, product: nextProducts[0]?._id || '' } : item
              )
            : [createEmptyItem(nextProducts[0]?._id || '')]
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const loadImports = async () => {
      if (!auth.token) return;

      setLoadingImports(true);
      try {
        const response = await fetch('/api/import', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'Không tải được phiếu nhập.');
        setImports(payload.imports || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingImports(false);
      }
    };

    loadImports();
  }, [auth.token]);

  const ownImports = useMemo(
    () => imports.filter(item => item.importedBy?._id === auth.userId),
    [imports, auth.userId]
  );

  const filteredImports = useMemo(
    () =>
      ownImports.filter(item => {
        const keyword = search.trim().toLowerCase();
        const matchSearch =
          !keyword ||
          item.importCode?.toLowerCase().includes(keyword) ||
          item.supplierName?.toLowerCase().includes(keyword);
        const matchStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [ownImports, search, statusFilter]
  );

  const pendingCount = ownImports.filter(item => item.status === 'pending').length;
  const approvedCount = ownImports.filter(item => item.status === 'approved').length;
  const totalAmount = useMemo(
    () => form.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.importPrice || 0), 0),
    [form.items]
  );
  const latestImports = filteredImports.slice(0, 6);
  const isOverviewMode = mode === 'overview';
  const isCreateMode = mode === 'create';
  const reviewCount = ownImports.filter(item => item.status === 'rejected' || item.status === 'cancelled').length;

  const statusChartData = useMemo(
    () => ({
      labels: ['Chờ duyệt', 'Đã duyệt', 'Hủy / Không duyệt'],
      datasets: [
        {
          data: [pendingCount, approvedCount, reviewCount],
          backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
          borderColor: ['#ffffff', '#ffffff', '#ffffff'],
          borderWidth: 4,
          hoverOffset: 8
        }
      ]
    }),
    [approvedCount, pendingCount, reviewCount]
  );

  const statusChartOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    cutout: '62%'
  };

  const importsByDayData = useMemo(() => {
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

      return ownImports.reduce((sum, item) => {
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
          label: 'Giá trị nhập',
          data: totals,
          backgroundColor: '#dc2626',
          borderRadius: 10,
          maxBarThickness: 38
        }
      ]
    };
  }, [ownImports]);

  const importsByDayOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => formatCurrency(value)
        }
      }
    }
  };

  const createdOrdersByDayData = useMemo(() => {
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

      return ownImports.reduce((sum, item) => {
        const createdAt = item.createdAt ? new Date(item.createdAt) : null;
        if (createdAt && createdAt >= day && createdAt < nextDay) {
          return sum + 1;
        }
        return sum;
      }, 0);
    });

    return {
      labels: days.map(day => formatDateLabel(day)),
      datasets: [
        {
          label: 'Số đơn đã tạo',
          data: counts,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(34, 197, 94, 0.14)',
          pointBackgroundColor: '#16a34a',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: true
        }
      ]
    };
  }, [ownImports]);

  const createdOrdersByDayOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const changeMetaHandler = event => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const changeItemHandler = (index, event) => {
    const { name, value } = event.target;
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [name]: name === 'quantity' ? Math.max(1, Number(value || 1)) : value }
          : item
      )
    }));
  };

  const addItemHandler = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, createEmptyItem(products[0]?._id || '')]
    }));
  };

  const removeItemHandler = index => {
    setForm(prev => ({
      ...prev,
      items:
        prev.items.length === 1
          ? [createEmptyItem(products[0]?._id || '')]
          : prev.items.filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const resetForm = () => {
    setEditingImportId('');
    setForm(createInitialForm(products));
  };

  const updateImportInState = nextImport => {
    setImports(prev => prev.map(item => (item._id === nextImport._id ? nextImport : item)));
  };

  const submitHandler = async event => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const normalizedItems = form.items
        .filter(item => item.product)
        .map(item => ({
          product: item.product,
          quantity: Number(item.quantity),
          importPrice: Number(item.importPrice),
          manufactureDate: item.manufactureDate || undefined,
          expiryDate: item.expiryDate || undefined,
          batchCode: item.batchCode || ''
        }));

      if (normalizedItems.length === 0) {
        throw new Error('Cần có ít nhất 1 sản phẩm trong phiếu nhập.');
      }

      const isEditing = Boolean(editingImportId);
      const response = await fetch(isEditing ? `/api/import/${editingImportId}` : '/api/import', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          importCode: form.importCode,
          supplierName: form.supplierName,
          supplierPhone: form.supplierPhone,
          supplierEmail: form.supplierEmail,
          note: form.note,
          items: normalizedItems
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Lưu phiếu nhập thất bại.');

      if (isEditing) {
        updateImportInState(payload.import);
      } else {
        setImports(prev => [payload.import, ...prev]);
      }

      setSuccess(payload.message || (isEditing ? 'Cập nhật phiếu nhập thành công.' : 'Đã tạo phiếu nhập và gửi admin duyệt.'));
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const editImportHandler = importRecord => {
    setEditingImportId(importRecord._id);
    setForm(mapImportToForm(importRecord));
    setError('');
    setSuccess('');
  };

  const cancelImportHandler = async id => {
    setActionLoadingId(id);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/import/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({})
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Hủy phiếu nhập thất bại.');

      updateImportInState(payload.import);
      if (editingImportId === id) resetForm();
      setSuccess(payload.message || 'Hủy phiếu nhập thành công.');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId('');
    }
  };

  return (
    <div className={`grid gap-5 ${isCreateMode ? 'xl:grid-cols-[minmax(420px,520px)_1fr]' : ''}`}>
        {isOverviewMode && (
          <section className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard title="Chờ admin duyệt" value={pendingCount} tone="rose" />
              <MetricCard title="Đã duyệt" value={approvedCount} tone="emerald" />
              <MetricCard title="Tổng giá trị pending" value={formatCurrency(
                ownImports
                .filter(item => item.status === 'pending')
                  .reduce((sum, item) => sum + Number(item.totalAmount || 0), 0)
              )} tone="rose" />
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-red-600">Trạng thái phiếu</div>
                  <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-white">Tỷ lệ duyệt phiếu</h3>
                  <p className="mt-1 text-sm text-gray-400">
                  Biểu đồ tròn giữa số phiếu đã duyệt, chờ duyệt và hủy hoặc không duyệt.
                  </p>
                <div className="mx-auto mt-4 max-w-[240px]">
                  <Doughnut data={statusChartData} options={statusChartOptions} />
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-red-600">Nhập theo ngày</div>
                <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-white">Giá trị nhập 7 ngày gần đây</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Biểu đồ cột giúp xem nhanh giá trị các đơn nhập được tạo qua từng ngày.
                </p>
                <div className="mt-4 h-[280px]">
                  <Bar data={importsByDayData} options={importsByDayOptions} />
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-red-600">Đơn tạo qua ngày</div>
                <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-white">Số đơn đã tạo theo ngày</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Biểu đồ thứ 3 cho biết mỗi ngày manager đã tạo bao nhiêu phiếu nhập.
                </p>
                <div className="mt-4 h-[280px]">
                  <Line data={createdOrdersByDayData} options={createdOrdersByDayOptions} />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#202020] px-5 py-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-red-600">Tổng quan</div>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white">Các đơn nhập gần đây</h2>
                </div>
                <div className="flex gap-2">
                  <Link to={dashboardRoutes.managerCreateImport} className="rounded-lg bg-[#14b84a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#11a340]">
                    Tạo đơn nhập
                  </Link>
                  <Link to={dashboardRoutes.managerImports} className="rounded-lg border border-white/10 bg-[#242424] px-4 py-2.5 text-sm font-bold text-gray-200 hover:bg-[#303030]">
                    Xem tất cả
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1.1fr_1fr_0.8fr_0.9fr] gap-3 border-b border-white/10 bg-[#202020] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-red-400">
                <span>Mã phiếu</span>
                <span>Thời gian</span>
                <span>Trạng thái</span>
                <span>Số dòng</span>
                <span className="text-right">Tổng tiền</span>
              </div>

              {loadingImports ? (
                <div className="px-5 py-10 text-center text-sm text-gray-500">Đang tải phiếu nhập...</div>
              ) : latestImports.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-gray-500">Chưa có đơn nhập nào.</div>
              ) : (
                latestImports.map(ticket => (
                  <div key={ticket._id} className="grid grid-cols-[1fr_1.1fr_1fr_0.8fr_0.9fr] gap-3 border-b border-white/6 px-5 py-4 text-sm text-gray-300 hover:bg-white/[0.03]">
                    <div className="font-bold text-red-700">{ticket.importCode}</div>
                    <div>{formatDateTime(ticket.createdAt)}</div>
                    <div><StatusBadge status={ticket.status} /></div>
                    <div>{ticket.items?.length || 0} dòng</div>
                    <div className="text-right font-bold text-white">{formatCurrency(ticket.totalAmount)}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {isCreateMode && (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
          <div className="border-b border-white/10 bg-[#202020] px-5 py-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-red-600">
              {editingImportId ? 'Cập nhật phiếu' : 'Tạo phiếu nhập'}
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white">
              {editingImportId ? 'Chỉnh sửa phiếu chờ duyệt' : 'Lập yêu cầu nhập hàng'}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Manager tạo phiếu và gửi admin duyệt. Chỉ phiếu pending mới được sửa hoặc hủy.
            </p>
          </div>

          <form onSubmit={submitHandler} className="grid gap-5 px-5 py-5">
            <div className="grid gap-4">
              <Field label="Mã phiếu nhập">
                <input name="importCode" value={form.importCode} onChange={changeMetaHandler} className={inputClassName} />
              </Field>

              <Field label="Nhà cung cấp">
                <input
                  name="supplierName"
                  value={form.supplierName}
                  onChange={changeMetaHandler}
                  className={inputClassName}
                  placeholder="Nhập tên nhà cung cấp"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Số điện thoại NCC">
                  <input
                    name="supplierPhone"
                    value={form.supplierPhone}
                    onChange={changeMetaHandler}
                    className={inputClassName}
                    placeholder="0909..."
                  />
                </Field>
                <Field label="Email NCC">
                  <input
                    name="supplierEmail"
                    value={form.supplierEmail}
                    onChange={changeMetaHandler}
                    className={inputClassName}
                    placeholder="supplier@email.com"
                  />
                </Field>
              </div>
            </div>

            <div className="rounded-xl border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 bg-[#202020] px-4 py-3">
                <div className="text-sm font-black text-white">Danh sách sản phẩm</div>
                <button
                  type="button"
                  onClick={addItemHandler}
                  disabled={loadingProducts || products.length === 0}
                  className="rounded-lg bg-[#14b84a] px-3 py-2 text-xs font-bold text-white hover:bg-[#11a340] disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  + Thêm dòng
                </button>
              </div>

              <div className="grid gap-3 px-4 py-4">
                {loadingProducts && <p className="text-sm text-gray-500">Đang tải danh sách sản phẩm...</p>}

                {!loadingProducts && products.length === 0 && (
                  <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                    Chưa có sản phẩm nào trong hệ thống.
                  </p>
                )}

                {form.items.map((item, index) => {
                  const selectedProduct = products.find(product => product._id === item.product);
                  const lineTotal = Number(item.quantity || 0) * Number(item.importPrice || 0);

                  return (
                    <div key={`${item.product || 'empty'}-${index}`} className="rounded-xl border border-white/10 bg-[#141414] p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-bold text-white">Dòng sản phẩm {index + 1}</div>
                          <div className="text-xs text-gray-500">Nhập chi tiết cho từng mặt hàng</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItemHandler(index)}
                          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/15"
                        >
                          Xóa dòng
                        </button>
                      </div>

                      <div className="grid gap-4">
                        <Field label="Sản phẩm">
                          <SearchableProductSelect
                            products={products}
                            value={item.product}
                            disabled={loadingProducts || products.length === 0}
                            onChange={event => changeItemHandler(index, event)}
                            className={inputClassName}
                          />
                        </Field>

                        {selectedProduct && (
                          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-gray-300">
                            <span className="font-semibold text-white">{selectedProduct.name}</span>
                            {selectedProduct.sku ? <span className="ml-2 text-red-300">SKU: {selectedProduct.sku}</span> : null}
                            {selectedProduct.barcode ? <span className="ml-2 text-gray-400">Barcode: {selectedProduct.barcode}</span> : null}
                          </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Số lượng">
                            <input
                              name="quantity"
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={event => changeItemHandler(index, event)}
                              className={inputClassName}
                            />
                          </Field>
                          <Field label="Giá nhập">
                            <input
                              name="importPrice"
                              type="number"
                              min="1"
                              value={item.importPrice}
                              onChange={event => changeItemHandler(index, event)}
                              className={inputClassName}
                            />
                          </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Ngày sản xuất">
                            <input
                              name="manufactureDate"
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              value={item.manufactureDate}
                              onChange={event => changeItemHandler(index, event)}
                              className={inputClassName}
                            />
                          </Field>
                          <Field label="Hạn sử dụng">
                            <input
                              name="expiryDate"
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              value={item.expiryDate}
                              onChange={event => changeItemHandler(index, event)}
                              className={inputClassName}
                            />
                          </Field>
                        </div>

                        <Field label="Mã lô (Tự sinh hoặc nhập tay)">
                          <input
                            name="batchCode"
                            value={item.batchCode}
                            onChange={event => changeItemHandler(index, event)}
                            className={`${inputClassName} font-mono`}
                            placeholder="VD: LÔ-240301-A"
                          />
                        </Field>

                        <div className="rounded-lg bg-[#202020] px-4 py-3 text-sm">
                          <span className="text-gray-400">Thành tiền dòng này:</span>
                          <span className="ml-2 font-black text-white">{formatCurrency(lineTotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Field label="Ghi chú">
              <textarea
                name="note"
                value={form.note}
                onChange={changeMetaHandler}
                rows="4"
                className={`${inputClassName} resize-none`}
                placeholder="Ghi chú cho phiếu nhập"
              />
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#202020] px-4 py-4">
              <div>
                <div className="text-sm text-gray-400">Tổng giá trị</div>
                <div className="text-2xl font-black text-white">{formatCurrency(totalAmount)}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-white/10 bg-[#242424] px-4 py-2.5 text-sm font-bold text-gray-200 hover:bg-[#303030]"
                >
                  Làm mới
                </button>
                <button
                  type="submit"
                  disabled={submitting || !auth.token}
                  className={`rounded-lg px-4 py-2.5 text-sm font-bold text-white ${
                    submitting || !auth.token ? 'cursor-not-allowed bg-red-300' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {submitting ? 'Đang lưu...' : editingImportId ? 'Cập nhật phiếu' : 'Gửi admin duyệt'}
                </button>
              </div>
            </div>

            {success && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {success}
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}
          </form>
        </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
          <div className="border-b border-white/10 bg-[#202020] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-red-600">Phiếu của tôi</div>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white">
                  {isCreateMode ? 'Danh sách để theo dõi' : 'Xem các đơn nhập'}
                </h2>
              </div>
              <div className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300">
                {filteredImports.length} phiếu
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div className="group flex min-w-[320px] max-w-md flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#202020] px-4 py-2.5 shadow-sm transition-all focus-within:border-red-400 focus-within:bg-[#242424] hover:border-red-400/40">
              <i className="fa-solid fa-magnifying-glass text-gray-500 transition-colors group-focus-within:text-red-500"></i>
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Tìm kiếm phiếu nhập, nhà cung cấp..."
                className="w-full border-0 bg-transparent text-sm font-medium text-white outline-none placeholder:text-gray-500"
              />
              {search && (
                 <i className="fa-solid fa-circle-xmark cursor-pointer text-slate-300 transition-colors hover:text-red-500" onClick={() => setSearch('')}></i>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
              className="rounded-lg border border-white/10 bg-[#242424] px-4 py-2.5 text-sm font-bold text-gray-200 hover:bg-[#303030]"
            >
              Bỏ lọc
            </button>
          </div>

          <div className="grid grid-cols-[1fr_1.1fr_1.05fr_0.75fr_0.9fr_150px] gap-3 border-b border-white/10 bg-[#202020] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-red-400">
            <span>Mã phiếu</span>
            <span>Thời gian</span>
            <span>Trạng thái</span>
            <span>Số dòng</span>
            <span className="text-right">Tổng tiền</span>
            <span>Thao tác</span>
          </div>

          {loadingImports ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500">Đang tải phiếu nhập...</div>
          ) : filteredImports.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500">Chưa có phiếu nhập nào khớp bộ lọc.</div>
          ) : (
            (isCreateMode ? filteredImports.slice(0, 6) : filteredImports).map(ticket => {
              const isPending = ticket.status === 'pending';
              const isActing = actionLoadingId === ticket._id;

              return (
                <div key={ticket._id} className="grid grid-cols-[1fr_1.1fr_1.05fr_0.75fr_0.9fr_150px] items-center gap-3 border-b border-white/6 px-5 py-4 text-sm text-gray-300 hover:bg-white/[0.03]">
                  <div>
                    <div className="font-bold text-red-700">{ticket.importCode}</div>
                    <div className="mt-1 text-xs text-gray-500">{ticket.supplierName || '--'}</div>
                  </div>
                  <span>{formatDateTime(ticket.createdAt)}</span>
                  <span>
                    <StatusBadge status={ticket.status} />
                  </span>
                  <span>{ticket.items?.length || 0} dòng</span>
                  <span className="text-right font-bold text-white">{formatCurrency(ticket.totalAmount)}</span>
                  <div className="flex flex-wrap gap-2">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => editImportHandler(ticket)}
                          className="rounded-lg border border-white/10 bg-[#242424] px-3 py-2 text-xs font-bold text-gray-200 hover:bg-[#303030]"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => cancelImportHandler(ticket._id)}
                          className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-gray-500">Da khoa</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>
    </div>
  );
}

function MetricCard({ title, value, tone = 'rose' }) {
  const toneClass =
    tone === 'rose'
      ? 'bg-rose-500/15 text-rose-300'
      : tone === 'emerald'
        ? 'bg-emerald-500/15 text-emerald-300'
        : 'bg-red-500/15 text-red-300';

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">{title}</div>
      <div className={`mt-3 inline-flex rounded-lg px-3 py-2 text-2xl font-black ${toneClass}`}>{value}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-bold text-white">{label}</span>
      {children}
    </label>
  );
}

function StatusBadge({ status }) {
  const style =
    status === 'pending'
      ? 'border border-amber-500/20 bg-amber-500/15 text-amber-300'
      : status === 'approved'
        ? 'border border-emerald-500/20 bg-emerald-500/15 text-emerald-300'
        : status === 'rejected'
          ? 'border border-rose-500/20 bg-rose-500/15 text-rose-300'
          : 'border border-white/10 bg-white/5 text-gray-300';

  const label =
    status === 'pending'
      ? 'Chờ duyệt'
      : status === 'approved'
        ? 'Đã duyệt'
        : status === 'rejected'
          ? 'Từ chối'
          : 'Đã hủy';

  return <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${style}`}>{label}</span>;
}

const inputClassName =
  'w-full rounded-lg border border-white/10 bg-[#202020] px-3 py-2.5 text-sm text-white shadow-sm outline-none transition placeholder:text-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20';

function StatCard({ title, value, icon, color, bg, text }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#181818] p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)] transition hover:border-red-500/20 hover:bg-[#1d1d1d]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          <i className={`fa-solid ${icon} text-xl text-white`}></i>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${color}`}></div>
    </div>
  );
}

export default ManagerImportsPage;
