import { useState } from 'react';

const mockProducts = [
  { id: 'SP001', code: 'VT001', name: 'Ống thép DN50 dài 6m', price: 190000, stock: 20, unit: 'Cây' },
  { id: 'SP002', code: 'VT002', name: 'Van cầu inox DN25', price: 225000, stock: 15, unit: 'Cái' },
  { id: 'SP003', code: 'VT003', name: 'Bơm nước ly tâm 1HP', price: 2450000, stock: 8, unit: 'Cái' },
  { id: 'SP004', code: 'VT004', name: 'Dây cáp điện 3x4mm', price: 350000, stock: 12, unit: 'Cuộn' },
  { id: 'SP005', code: 'VT005', name: 'Tủ điện ngoài trời IP65', price: 3200000, stock: 5, unit: 'Cái' },
  { id: 'SP006', code: 'VT006', name: 'Bulong M12x50 (hộp 50c)', price: 120000, stock: 30, unit: 'Hộp' },
  { id: 'SP007', code: 'VT007', name: 'Keo silicon chịu nhiệt', price: 45000, stock: 7, unit: 'Tuýp' },
  { id: 'SP008', code: 'VT008', name: 'Máy khoan Bosch 13mm', price: 2800000, stock: 18, unit: 'Cái' },
];

const fmt = n => n.toLocaleString('vi-VN');

const inputCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100';

function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Tìm kiếm vật tư (tên, mã)..."
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
      />
    </div>
  );
}

function ProductGrid({ products, onAdd }) {
  return (
    <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-3">
      {products.map(p => (
        <button
          key={p.id}
          onClick={() => onAdd(p)}
          className="rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-red-400 hover:shadow-md hover:shadow-red-50"
        >
          <div className="mb-3 flex h-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-red-100">
            <i className="fa-solid fa-box text-2xl text-red-500"></i>
          </div>
          <p className="mb-0.5 text-[11px] font-semibold text-red-500">{p.code}</p>
          <p className="mb-1.5 text-xs font-semibold leading-5 text-slate-900">{p.name}</p>
          <p className="text-sm font-bold text-red-600">{fmt(p.price)}đ</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{p.unit}</span>
            <span className={`text-[11px] font-semibold ${p.stock < 5 ? 'text-red-500' : 'text-slate-400'}`}>
              Kho: {p.stock}
            </span>
          </div>
        </button>
      ))}
      {products.length === 0 && (
        <div className="col-span-full py-10 text-center text-sm text-slate-400">Không tìm thấy vật tư</div>
      )}
    </div>
  );
}

function CartTable({ items, onQtyChange, onDiscount, onRemove }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-red-50 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-red-500">
            {['', 'Mã VT', 'Tên vật tư', 'ĐVT', 'Số lượng', 'Đơn giá', 'Giảm giá', 'Thành tiền', ''].map((h, i) => (
              <th key={i} className={`px-3 py-2.5 ${['Số lượng','Đơn giá','Giảm giá','Thành tiền'].includes(h) ? 'text-center' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                Chưa có vật tư. Bấm vào sản phẩm bên trên để thêm vào đơn.
              </td>
            </tr>
          ) : items.map((item, idx) => {
            const total = item.qty * item.price - item.discount;
            return (
              <tr key={item.id} className={`border-t border-slate-100 transition ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'} hover:bg-red-50/40`}>
                <td className="px-3 py-3 text-xs text-slate-400">{idx + 1}</td>
                <td className="px-3 py-3 text-xs font-semibold text-red-500">{item.code}</td>
                <td className="px-3 py-3 font-semibold text-slate-900">{item.name}</td>
                <td className="px-3 py-3 text-center text-xs text-slate-500">{item.unit}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => onQtyChange(item.id, item.qty - 1)}
                      className="h-6 w-6 rounded border border-slate-200 bg-slate-50 text-sm hover:border-red-300 hover:bg-red-50">−</button>
                    <input type="number" min={1} value={item.qty}
                      onChange={e => onQtyChange(item.id, parseInt(e.target.value) || 1)}
                      className="w-12 rounded border border-slate-200 px-1 py-1 text-center text-sm outline-none focus:border-red-400" />
                    <button onClick={() => onQtyChange(item.id, item.qty + 1)}
                      className="h-6 w-6 rounded border border-slate-200 bg-slate-50 text-sm hover:border-red-300 hover:bg-red-50">+</button>
                  </div>
                </td>
                <td className="px-3 py-3 text-center text-slate-700">{fmt(item.price)}</td>
                <td className="px-3 py-3 text-center">
                  <input type="number" min={0} value={item.discount}
                    onChange={e => onDiscount(item.id, parseInt(e.target.value) || 0)}
                    className="w-20 rounded border border-slate-200 px-2 py-1 text-center text-sm outline-none focus:border-red-400" />
                </td>
                <td className="px-3 py-3 text-center font-bold text-slate-900">{fmt(total)}</td>
                <td className="px-3 py-3 text-center">
                  <button onClick={() => onRemove(item.id)} className="text-lg text-red-400 hover:text-red-600">×</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SummaryRow({ label, value, valueClass = 'text-slate-900' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function OrderPanel({ items, onClear, onSave, onComplete }) {
  const subtotal = items.reduce((s, i) => s + i.qty * i.price - i.discount, 0);
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [note, setNote] = useState('');
  const total = Math.max(0, subtotal - extraDiscount);
  const change = Math.max(0, paid - total);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-red-600 px-4 py-3">
        <div>
          <p className="text-[11px] text-red-200">Mã phiếu xuất</p>
          <p className="text-sm font-bold text-white">PX{Date.now().toString().slice(-6)}</p>
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">Phiếu tạm</span>
      </div>

      {/* Customer */}
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="relative">
          <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
          <input
            placeholder="Tìm khách hàng / đơn vị nhận..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 px-3 py-2 text-sm outline-none focus:border-red-400 focus:bg-white"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
        <SummaryRow label={`Tổng tiền hàng (${items.length} VT)`} value={fmt(subtotal)} />

        <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2.5">
          <span className="text-sm text-slate-500">Giảm giá đơn</span>
          <input type="number" min={0} value={extraDiscount}
            onChange={e => setExtraDiscount(parseInt(e.target.value) || 0)}
            className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm outline-none focus:border-red-400" />
        </div>

        <div className="flex items-center justify-between border-t-2 border-slate-100 pt-2.5">
          <span className="font-bold text-slate-900">Cần thu / thanh toán</span>
          <span className="text-xl font-black text-red-600">{fmt(total)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Tiền khách trả</span>
          <input type="number" min={0} value={paid}
            onChange={e => setPaid(parseInt(e.target.value) || 0)}
            className="w-28 rounded-lg border border-red-400 px-2 py-1.5 text-right text-sm font-semibold outline-none focus:ring-2 focus:ring-red-100" />
        </div>

        <SummaryRow
          label="Tiền thừa trả khách"
          value={fmt(change)}
          valueClass={change > 0 ? 'text-green-600' : 'text-slate-400'}
        />

        <div className="border-t border-slate-100 pt-2.5">
          <div className="relative">
            <i className="fa-solid fa-pen absolute left-3 top-3 text-xs text-gray-400"></i>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Ghi chú đơn hàng..."
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 pl-9 px-3 py-2 text-sm outline-none focus:border-red-400 focus:bg-white" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-slate-100 px-4 py-3">
        <button onClick={onClear}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          <i className="fa-solid fa-arrow-left text-xs"></i>
          <span>Trở về</span>
        </button>
        <button onClick={onSave}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100">
          <i className="fa-solid fa-floppy-disk text-xs"></i>
          <span>Lưu tạm</span>
        </button>
        <button onClick={onComplete}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white shadow-md shadow-red-200 hover:bg-red-700">
          <i className="fa-solid fa-check text-xs"></i>
          <span>Hoàn thành</span>
        </button>
      </div>
    </div>
  );
}

function SellPage() {
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState([]);

  const filtered = mockProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = p => {
    setCartItems(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1, discount: 0 }];
    });
  };

  const updateQty = (id, qty) => { if (qty < 1) return; setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i)); };
  const updateDiscount = (id, discount) => setCartItems(prev => prev.map(i => i.id === id ? { ...i, discount } : i));
  const removeItem = id => setCartItems(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCartItems([]);
  const handleSave = () => alert('Đã lưu phiếu tạm!');
  const handleComplete = () => {
    if (cartItems.length === 0) return alert('Chưa có vật tư trong đơn!');
    alert('Hoàn thành đơn hàng!');
    clearCart();
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Left */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
        <SearchBar value={search} onChange={setSearch} />

        <div className="max-h-[260px] flex-none overflow-y-auto pr-1">
          <ProductGrid products={filtered} onAdd={addToCart} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Giỏ hàng {cartItems.length > 0 && `(${cartItems.length} vật tư)`}
            </h3>
            {cartItems.length > 0 && (
              <button onClick={clearCart} className="text-xs text-red-500 hover:underline">Xóa tất cả</button>
            )}
          </div>
          <CartTable items={cartItems} onQtyChange={updateQty} onDiscount={updateDiscount} onRemove={removeItem} />
        </div>
      </div>

      {/* Right */}
      <div className="w-[300px] shrink-0">
        <OrderPanel items={cartItems} onClear={clearCart} onSave={handleSave} onComplete={handleComplete} />
      </div>
    </div>
  );
}

export default SellPage;
