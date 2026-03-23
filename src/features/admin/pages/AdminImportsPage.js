import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../../shared/context/auth-context';

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

function AdminImportsPage() {
  const auth = useContext(AuthContext);
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    const loadImports = async () => {
      if (!auth.token) return;

      setLoading(true);
      try {
        const response = await fetch('/api/import', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'Không tải được danh sách phiếu nhập.');
        setImports(payload.imports || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadImports();
  }, [auth.token]);

  const filteredImports = useMemo(
    () =>
      imports.filter(item => {
        const keyword = search.trim().toLowerCase();
        const matchSearch =
          !keyword ||
          item.importCode?.toLowerCase().includes(keyword) ||
          item.supplierName?.toLowerCase().includes(keyword) ||
          item.importedBy?.name?.toLowerCase().includes(keyword);
        const matchStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [imports, search, statusFilter]
  );

  const pendingCount = imports.filter(item => item.status === 'pending').length;

  const updateImportInState = nextImport => {
    setImports(prev => prev.map(item => (item._id === nextImport._id ? nextImport : item)));
  };

  const handleDecision = async (id, action) => {
    setActionLoadingId(id);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/import/${id}/${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({})
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Xử lý phiếu nhập thất bại.');

      updateImportInState(payload.import);
      setSuccess(payload.message || 'Cập nhật trạng thái phiếu nhập thành công.');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId('');
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <aside className="grid gap-4">
        <div className="overflow-hidden rounded-[28px] border border-red-100 bg-white p-5 shadow-sm">
          <div className="mb-2 text-lg font-black text-slate-900">Tổng quan duyệt</div>
          <div className="text-sm text-slate-500">Phiếu đang chờ admin xử lý</div>
          <div className="mt-1 text-3xl font-black text-red-600">{pendingCount}</div>
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-slate-600">
            Chỉ khi admin duyệt thành công thì tồn kho mới được cộng vào hệ thống.
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-red-100 bg-white p-5 shadow-sm">
          <div className="mb-4 text-lg font-black text-slate-900">Lọc theo trạng thái</div>
          <div className="grid gap-3">
            {statusOptions.map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="radio"
                  name="admin-status"
                  checked={statusFilter === value}
                  onChange={() => setStatusFilter(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      <section className="grid gap-4 overflow-hidden rounded-[32px] border border-red-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-500">Phiếu manager gửi lên</div>
            <h2 className="mt-1 text-[34px] font-black tracking-[-0.04em] text-slate-900">Duyệt phiếu nhập</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Admin duyệt để cộng tồn kho, từ chối nếu thông tin chưa hợp lệ.
            </p>
          </div>
          <div className="rounded-full bg-red-50 px-4 py-2.5 font-black text-red-700">
            {filteredImports.length} phiếu
          </div>
        </div>

        <div className="flex min-w-[280px] items-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-3 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-red-400">TK</span>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Tìm theo mã phiếu, nhà cung cấp, manager"
            className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-[28px] border border-red-100 bg-white">
          <div className="grid grid-cols-[1fr_1.2fr_1.3fr_1fr_1fr_180px] gap-3 bg-red-50 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-red-500">
            <span>Mã phiếu</span>
            <span>Nha cung cap</span>
            <span>Manager</span>
            <span>Số dòng</span>
            <span className="text-right">Tổng tiền</span>
            <span>Xu ly</span>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">Đang tải phiếu nhập...</div>
          ) : filteredImports.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">Không có phiếu nào khớp bộ lọc.</div>
          ) : (
            filteredImports.map(ticket => {
              const isPending = ticket.status === 'pending';
              const isActing = actionLoadingId === ticket._id;

              return (
                <div key={ticket._id} className="border-t border-red-50 px-5 py-4">
                  <div className="grid grid-cols-[1fr_1.2fr_1.3fr_1fr_1fr_180px] items-center gap-3 text-sm text-slate-700">
                    <div>
                      <div className="font-extrabold text-red-600">{ticket.importCode}</div>
                      <div className="mt-1 text-xs text-slate-400">{formatDateTime(ticket.createdAt)}</div>
                    </div>
                    <span>{ticket.supplierName || '--'}</span>
                    <span>{ticket.importedBy?.name || '--'}</span>
                    <span>{ticket.items?.length || 0} san pham</span>
                    <span className="text-right font-extrabold text-slate-900">{formatCurrency(ticket.totalAmount)}</span>
                    <div className="flex flex-wrap gap-2">
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={() => handleDecision(ticket._id, 'approve')}
                            className="rounded-2xl bg-red-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={() => handleDecision(ticket._id, 'reject')}
                            className="rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-extrabold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed"
                          >
                            Từ chối
                          </button>
                        </>
                      ) : (
                        <span className={`inline-block rounded-full px-3 py-2 text-xs font-black ${
                          ticket.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : ticket.status === 'rejected'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {ticket.status === 'approved'
                            ? 'Đã duyệt'
                            : ticket.status === 'rejected'
                              ? 'Từ chối'
                              : 'Đã hủy'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-red-50 bg-red-50/40 p-4 text-sm text-slate-600">
                    <div className="mb-2 font-bold text-slate-900">Chi tiet san pham</div>
                    <div className="grid gap-2">
                      {(ticket.items || []).map((item, index) => (
                        <div key={`${ticket._id}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3">
                          <div>
                            <span className="font-semibold text-slate-900">{item.product?.name || '--'}</span>
                            {item.product?.sku ? (
                              <span className="ml-2 text-red-600">SKU: {item.product.sku}</span>
                            ) : null}
                          </div>
                          <div className="text-slate-500">
                            {item.quantity} x {formatCurrency(item.importPrice)} ={' '}
                            <span className="font-bold text-slate-900">{formatCurrency(item.lineTotal)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminImportsPage;
