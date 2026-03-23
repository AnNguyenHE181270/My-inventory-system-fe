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

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn phiếu nhập rác này dữ liệu sẽ sạch sẽ hơn?')) return;

    setActionLoadingId(id);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/import/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Xóa phiếu nhập thất bại.');

      setImports(prev => prev.filter(item => item._id !== id));
      setSuccess(payload.message || 'Đã dọn dẹp phiếu nhập rác.');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId('');
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <aside className="grid gap-4 sticky top-6 self-start">
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
              const isExpanded = expandedId === ticket._id;

              return (
                <div key={ticket._id} className="border-t border-red-50 px-5 py-4">
                  <div 
                    className="grid grid-cols-[1fr_1.2fr_1.3fr_1fr_1fr_180px] items-center gap-3 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors p-2 -mx-2 rounded-xl group"
                    onClick={() => setExpandedId(isExpanded ? null : ticket._id)}
                  >
                    <div>
                      <div className="font-extrabold text-red-600 flex items-center gap-2">
                        <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-[10px] text-slate-400 group-hover:text-red-500 transition-colors`}></i>
                        {ticket.importCode}
                      </div>
                      <div className="mt-1 text-xs text-slate-400 pl-4">{formatDateTime(ticket.createdAt)}</div>
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
                            onClick={(e) => { e.stopPropagation(); handleDecision(ticket._id, 'approve'); }}
                            className="rounded-2xl bg-red-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={(e) => { e.stopPropagation(); handleDecision(ticket._id, 'reject'); }}
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

                      {ticket.status !== 'approved' && (
                         <button
                           type="button"
                           disabled={isActing}
                           onClick={(e) => handleDelete(ticket._id, e)}
                           className="ml-2 rounded-full w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-rose-100 hover:text-rose-600 transition-colors disabled:opacity-50"
                           title="Dọn dẹp xóa dữ liệu"
                         >
                           <i className="fa-solid fa-trash text-sm"></i>
                         </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 rounded-2xl border border-red-50 bg-red-50/40 p-5 text-sm text-slate-600 animate-in fade-in slide-in-from-top-2 duration-300">
                      
                      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 bg-white p-4 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
                        <div>
                          <span className="block text-[11px] font-black tracking-wider text-slate-400 uppercase mb-1.5">Thông tin Nhà cung cấp</span>
                          <div className="font-bold text-slate-900">{ticket.supplierName || 'Không có tên'}</div>
                          {ticket.supplierPhone && <div className="text-sm mt-1 text-slate-500"><i className="fa-solid fa-phone text-slate-400 mr-2 w-3"></i> {ticket.supplierPhone}</div>}
                          {ticket.supplierEmail && <div className="text-sm mt-1 text-slate-500"><i className="fa-solid fa-envelope text-slate-400 mr-2 w-3"></i> {ticket.supplierEmail}</div>}
                        </div>
                        <div className="lg:col-span-2">
                          <span className="block text-[11px] font-black tracking-wider text-slate-400 uppercase mb-1.5">Ghi chú của Manager</span>
                          <div className={`text-sm ${ticket.note ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                            {ticket.note || 'Không có ghi chú tệp đính kèm nào...'}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3 font-bold text-slate-900 flex items-center justify-between">
                         Chi tiết sản phẩm nhập kho
                      </div>
                      <div className="grid gap-3">
                        {(ticket.items || []).map((item, index) => (
                          <div key={`${ticket._id}-${index}`} className="flex flex-col gap-3 rounded-xl bg-white px-5 py-4 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
                            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                              <div>
                                <span className="font-bold text-red-700 text-base">{item.product?.name || 'Sản phẩm không xác định'}</span>
                                {item.product?.sku ? (
                                  <span className="ml-2 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-slate-600 border border-slate-200">SKU: {item.product.sku}</span>
                                ) : null}
                              </div>
                              <div className="text-slate-500 text-right text-sm">
                                {item.quantity} x {formatCurrency(item.importPrice)} ={' '}
                                <span className="font-black text-red-600 text-base ml-1">{formatCurrency(item.lineTotal || (item.quantity * item.importPrice))}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                               <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                                 <span className="block text-slate-400 font-medium mb-1">Ngày SX</span>
                                 <span className="font-bold text-slate-700">{formatDateLabel(item.manufactureDate)}</span>
                               </div>
                               <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                                 <span className="block text-slate-400 font-medium mb-1">Hạn SD</span>
                                 <span className="font-bold text-slate-700">{formatDateLabel(item.expiryDate)}</span>
                               </div>
                               <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 sm:col-span-1 col-span-2">
                                 <span className="block text-slate-400 font-medium mb-1">Mã Lô</span>
                                 <span className="font-mono font-bold text-slate-800">{item.batchCode || '--'}</span>
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
        </div>
      </section>
    </div>
  );
}

export default AdminImportsPage;
