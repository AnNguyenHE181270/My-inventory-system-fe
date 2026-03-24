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

const formatDateLabel = value => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
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
  const [expandedId, setExpandedId] = useState(null);

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
      setSuccess(payload.message || 'Đã cập nhật trạng thái phiếu nhập.');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId('');
    }
  };

  return (
    <div className="space-y-6 text-white">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#111111_0%,#1c1c1c_40%,#2b0b0e_100%)] p-7 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-500">Duyệt phiếu nhập</div>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-white">Danh sách phiếu cho admin xử lý</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-300">
              Đây là màn danh sách để admin duyệt, từ chối và xem chi tiết từng phiếu nhập do manager gửi lên.
            </p>
          </div>
          <div className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300">
            {filteredImports.length} phiếu đang hiển thị
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#181818] p-5 shadow-[0_20px_45px_-22px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-[280px] items-center gap-2 rounded-2xl border border-white/10 bg-[#232323] px-4 py-3 xl:max-w-md xl:flex-1">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-red-400">TK</span>
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Tìm theo mã phiếu, nhà cung cấp, manager"
              className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === value
                    ? 'bg-[#E50914] text-white shadow-lg shadow-red-950/30'
                    : 'border border-white/10 bg-[#232323] text-gray-300 hover:border-white/20 hover:bg-[#2a2a2a]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {success && (
          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
            {error}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#181818] shadow-[0_20px_45px_-22px_rgba(0,0,0,0.85)]">
        <div className="grid grid-cols-[1fr_1.1fr_1.1fr_120px_140px_220px] gap-3 bg-[#202020] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
          <span>Mã phiếu</span>
          <span>Nhà cung cấp</span>
          <span>Manager</span>
          <span>Số dòng</span>
          <span className="text-right">Tổng tiền</span>
          <span>Xử lý</span>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">Đang tải phiếu nhập...</div>
        ) : filteredImports.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">Không có phiếu nào khớp bộ lọc.</div>
        ) : (
          filteredImports.map(ticket => {
            const isPending = ticket.status === 'pending';
            const isActing = actionLoadingId === ticket._id;
            const isExpanded = expandedId === ticket._id;

            return (
              <div key={ticket._id} className="border-t border-white/6 px-6 py-4">
                <div
                  className="grid cursor-pointer grid-cols-[1fr_1.1fr_1.1fr_120px_140px_220px] items-center gap-3 rounded-2xl p-3 text-sm text-gray-200 transition hover:bg-white/[0.03]"
                  onClick={() => setExpandedId(isExpanded ? null : ticket._id)}
                >
                  <div>
                    <div className="flex items-center gap-2 font-extrabold text-red-500">
                      <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-[10px] text-gray-500`}></i>
                      {ticket.importCode}
                    </div>
                    <div className="mt-1 pl-4 text-xs text-gray-500">{formatDateTime(ticket.createdAt)}</div>
                  </div>

                  <span className="text-gray-300">{ticket.supplierName || '--'}</span>
                  <span className="text-gray-300">{ticket.importedBy?.name || '--'}</span>
                  <span className="text-gray-300">{ticket.items?.length || 0} sản phẩm</span>
                  <span className="text-right font-extrabold text-white">{formatCurrency(ticket.totalAmount)}</span>

                  <div className="flex flex-wrap gap-2">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={event => {
                            event.stopPropagation();
                            handleDecision(ticket._id, 'approve');
                          }}
                          className="rounded-xl bg-[#E50914] px-3 py-2 text-xs font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={event => {
                            event.stopPropagation();
                            handleDecision(ticket._id, 'reject');
                          }}
                          className="rounded-xl border border-white/10 bg-[#242424] px-3 py-2 text-xs font-extrabold text-gray-200 transition hover:bg-[#303030] disabled:cursor-not-allowed"
                        >
                          Từ chối
                        </button>
                      </>
                    ) : (
                      <span
                        className={`inline-block rounded-full px-3 py-2 text-xs font-black ${
                          ticket.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : ticket.status === 'rejected'
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-white/10 text-gray-300'
                        }`}
                      >
                        {ticket.status === 'approved'
                          ? 'Đã duyệt'
                          : ticket.status === 'rejected'
                            ? 'Từ chối'
                            : 'Đã hủy'}
                      </span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 rounded-2xl border border-white/8 bg-[#111111] p-5 text-sm text-gray-300">
                    <div className="mb-4 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-white/8 bg-[#181818] p-4">
                        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">Nhà cung cấp</div>
                        <div className="font-bold text-white">{ticket.supplierName || 'Không có tên'}</div>
                        {ticket.supplierPhone && <div className="mt-2 text-sm text-gray-400">SDT: {ticket.supplierPhone}</div>}
                        {ticket.supplierEmail && <div className="mt-1 text-sm text-gray-400">Email: {ticket.supplierEmail}</div>}
                      </div>

                      <div className="rounded-2xl border border-white/8 bg-[#181818] p-4">
                        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">Ghi chú manager</div>
                        <div className={ticket.note ? 'text-gray-200' : 'italic text-gray-500'}>
                          {ticket.note || 'Không có ghi chú đính kèm.'}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 text-base font-bold text-white">Chi tiết sản phẩm nhập kho</div>
                    <div className="grid gap-3">
                      {(ticket.items || []).map((item, index) => (
                        <div key={`${ticket._id}-${index}`} className="rounded-2xl border border-white/8 bg-[#181818] px-5 py-4">
                          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/8 pb-3">
                            <div>
                              <span className="text-base font-bold text-white">{item.product?.name || 'Sản phẩm không xác định'}</span>
                              {item.product?.sku ? (
                                <span className="ml-2 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-mono font-bold text-gray-300">
                                  SKU: {item.product.sku}
                                </span>
                              ) : null}
                            </div>
                            <div className="text-right text-sm text-gray-400">
                              {item.quantity} x {formatCurrency(item.importPrice)} =
                              <span className="ml-1 text-base font-black text-red-500">
                                {formatCurrency(item.lineTotal || item.quantity * item.importPrice)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="rounded-lg border border-white/8 bg-[#111111] p-2.5">
                              <span className="mb-1 block text-gray-500">Ngày SX</span>
                              <span className="font-bold text-gray-200">{formatDateLabel(item.manufactureDate)}</span>
                            </div>
                            <div className="rounded-lg border border-white/8 bg-[#111111] p-2.5">
                              <span className="mb-1 block text-gray-500">Hạn SD</span>
                              <span className="font-bold text-gray-200">{formatDateLabel(item.expiryDate)}</span>
                            </div>
                            <div className="col-span-2 rounded-lg border border-white/8 bg-[#111111] p-2.5 sm:col-span-1">
                              <span className="mb-1 block text-gray-500">Mã lô</span>
                              <span className="font-mono font-bold text-gray-100">{item.batchCode || '--'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

export default AdminImportsPage;
