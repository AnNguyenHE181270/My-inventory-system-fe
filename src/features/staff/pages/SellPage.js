import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../../shared/context/auth-context';

const formatMoney = value => Number(value || 0).toLocaleString('vi-VN');
const DRAFT_KEY = 'staffSellDraft';

function SellPage() {
  const auth = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [note, setNote] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedDraft = localStorage.getItem(DRAFT_KEY);
    if (!storedDraft) return;

    try {
      const parsed = JSON.parse(storedDraft);
      setCartItems(parsed.cartItems || []);
      setCustomerName(parsed.customerName || '');
      setExtraDiscount(parsed.extraDiscount || 0);
      setPaidAmount(parsed.paidAmount || 0);
      setNote(parsed.note || '');
    } catch (draftError) {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    if (!auth.token) return;

    const loadProducts = async () => {
      setLoadingProducts(true);
      setError('');

      try {
        const response = await fetch('/api/inventory/products-in-stock', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'Không thể tải danh sách hàng trong kho.');
        setProducts(payload.products || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [auth.token]);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products;

    return products.filter(product =>
      [product.name, product.sku, product.barcode].some(value => value?.toLowerCase().includes(keyword))
    );
  }, [products, search]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty - item.discount, 0),
    [cartItems]
  );
  const total = Math.max(0, subtotal - Number(extraDiscount || 0));
  const change = Math.max(0, Number(paidAmount || 0) - total);

  const persistDraft = nextState => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(nextState));
  };

  const syncDraft = nextCart => {
    persistDraft({
      cartItems: nextCart,
      customerName,
      extraDiscount,
      paidAmount,
      note
    });
  };

  const addToCart = product => {
    setError('');
    setSuccess('');

    const nextCart = (() => {
      const existing = cartItems.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          setError(`Sản phẩm ${product.name} chỉ còn ${product.stock} trong kho.`);
          return cartItems;
        }

        return cartItems.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [
        ...cartItems,
        {
          id: product.id || product._id,
          code: product.sku || product.barcode || product._id,
          name: product.name,
          sku: product.sku || '',
          barcode: product.barcode || '',
          price: Number(product.price || 0),
          stock: Number(product.stock || 0),
          unit: product.unit || '',
          discount: 0,
          qty: 1
        }
      ];
    })();

    setCartItems(nextCart);
    syncDraft(nextCart);
    setSearch('');
  };

  const handleSearchSubmit = event => {
    event.preventDefault();
    const keyword = search.trim().toLowerCase();
    if (!keyword) return;

    const exactMatch = products.find(product =>
      [product.name, product.sku, product.barcode].some(value => value?.toLowerCase() === keyword)
    );

    if (exactMatch) {
      addToCart(exactMatch);
      return;
    }

    if (filteredProducts[0]) {
      addToCart(filteredProducts[0]);
      return;
    }

    setError('Không tìm thấy sản phẩm phù hợp để thêm vào giỏ hàng.');
  };

  const updateQty = (id, qty) => {
    const nextCart = cartItems.map(item => {
      if (item.id !== id) return item;
      const nextQty = Math.max(1, qty);
      if (nextQty > item.stock) {
        setError(`Sản phẩm ${item.name} chỉ còn ${item.stock} trong kho.`);
        return item;
      }
      return { ...item, qty: nextQty };
    });

    setCartItems(nextCart);
    syncDraft(nextCart);
  };

  const updateDiscount = (id, discount) => {
    const nextCart = cartItems.map(item =>
      item.id === id ? { ...item, discount: Math.max(0, discount) } : item
    );
    setCartItems(nextCart);
    syncDraft(nextCart);
  };

  const removeItem = id => {
    const nextCart = cartItems.filter(item => item.id !== id);
    setCartItems(nextCart);
    syncDraft(nextCart);
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomerName('');
    setExtraDiscount(0);
    setPaidAmount(0);
    setNote('');
    setError('');
    setSuccess('');
    localStorage.removeItem(DRAFT_KEY);
  };

  const saveDraft = () => {
    persistDraft({
      cartItems,
      customerName,
      extraDiscount,
      paidAmount,
      note
    });
    setSuccess('Đã lưu phiếu tạm trên trình duyệt.');
  };

  const refreshProducts = async () => {
    if (!auth.token) return;
    const response = await fetch('/api/inventory/products-in-stock', {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Không thể làm mới kho hàng.');
    setProducts(payload.products || []);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setError('Chưa có sản phẩm nào trong giỏ hàng.');
      return;
    }

    const normalizedPaidAmount = Number(paidAmount || 0) > 0 ? Number(paidAmount || 0) : total;

    if (normalizedPaidAmount < total) {
      setError('Tiền khách trả chưa đủ để thanh toán.');
      return;
    }

    setCheckoutLoading(true);
    setError('');
    setSuccess('');
    setPaidAmount(normalizedPaidAmount);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          customerName,
          note,
          discountTotal: Number(extraDiscount || 0),
          paidAmount: normalizedPaidAmount,
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.qty,
            price: item.price,
            discount: item.discount
          }))
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Thanh toán thất bại.');

      await refreshProducts();
      clearCart();
      setSuccess(payload.message || 'Đã thanh toán thành công.');
    } catch (checkoutError) {
      setError(checkoutError.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[#181818] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-500">Quầy bán hàng</p>
            <h2 className="mt-2 text-3xl font-black text-white">Bán hàng tại quầy.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              Tim theo ten, SKU hoac barcode de them hang vao gio roi thanh toan nhanh tai quay.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={clearCart}
              className="rounded-2xl border border-white/10 bg-[#202020] px-5 py-3 text-sm font-bold text-gray-200 transition hover:bg-[#2a2a2a]"
            >
              Làm mới
            </button>
            <button
              onClick={saveDraft}
              className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/15"
            >
              Lưu tạm
            </button>
          </div>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.65fr_0.95fr]">
        <section className="min-w-0 rounded-[28px] border border-white/10 bg-[#181818] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
          <form onSubmit={handleSearchSubmit} className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500"></i>
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Nhập tên sản phẩm, SKU hoặc barcode rồi Enter..."
              className="w-full rounded-2xl border border-white/10 bg-[#202020] py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </form>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loadingProducts ? (
              <div className="col-span-full rounded-[24px] border border-white/10 bg-[#202020] px-6 py-12 text-center text-sm text-gray-400">
                Đang tải sản phẩm trong kho...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full rounded-[24px] border border-dashed border-white/10 bg-[#202020] px-6 py-12 text-center text-sm text-gray-500">
                Không tìm thấy sản phẩm phù hợp.
              </div>
            ) : (
              filteredProducts.map(product => (
                <button
                  key={product.id || product._id}
                  onClick={() => addToCart(product)}
                  className="rounded-[24px] border border-white/10 bg-[#141414] p-4 text-left transition hover:-translate-y-0.5 hover:border-red-500/40 hover:bg-[#1b1b1b]"
                >
                  <div className="mb-4 flex h-16 items-center justify-center rounded-2xl bg-red-500/10">
                    <i className="fa-solid fa-box text-2xl text-red-500"></i>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-red-400">{product.sku || product.barcode || product.id}</div>
                  <div className="mt-2 min-h-[48px] text-sm font-bold leading-6 text-white">{product.name}</div>
                  <div className="mt-3 text-2xl font-black text-red-400">{formatMoney(product.price)}đ</div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>{product.unit || '--'}</span>
                    <span className="font-semibold text-gray-300">Kho: {product.stock}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#202020] px-5 py-4">
              <div>
                <div className="text-lg font-black text-white">Giỏ hàng</div>
                <div className="text-sm text-gray-500">{cartItems.length} dòng vật tư</div>
              </div>
              {cartItems.length > 0 && (
                <button onClick={clearCart} className="text-sm font-semibold text-red-400 hover:text-red-300">
                  Xóa tất cả
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-[#202020] text-left text-xs font-bold uppercase tracking-[0.16em] text-red-400">
                  <tr>
                    <th className="px-4 py-3">Mã VT</th>
                    <th className="px-4 py-3">Tên vật tư</th>
                    <th className="px-4 py-3">ĐVT</th>
                    <th className="px-4 py-3 text-center">Số lượng</th>
                    <th className="px-4 py-3 text-right">Đơn giá</th>
                    <th className="px-4 py-3 text-right">Giảm giá</th>
                    <th className="px-4 py-3 text-right">Thành tiền</th>
                    <th className="px-4 py-3 text-center">Xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {cartItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-14 text-center text-sm text-gray-500">
                        Chưa có vật tư. Nhập mã hoặc bấm vào sản phẩm bên trên để thêm vào giỏ.
                      </td>
                    </tr>
                  ) : (
                    cartItems.map(item => (
                      <tr key={item.id} className="hover:bg-white/[0.03]">
                        <td className="px-4 py-4 font-semibold text-red-400">{item.code}</td>
                        <td className="px-4 py-4 font-semibold text-white">{item.name}</td>
                        <td className="px-4 py-4 text-gray-400">{item.unit}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => updateQty(item.id, item.qty - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#202020] text-sm text-gray-300 transition hover:border-red-500/40 hover:text-white"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.stock}
                              value={item.qty}
                              onChange={event => updateQty(item.id, parseInt(event.target.value, 10) || 1)}
                              className="w-16 rounded-lg border border-white/10 bg-[#202020] px-2 py-1.5 text-center text-sm text-white outline-none focus:border-red-500"
                            />
                            <button
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#202020] text-sm text-gray-300 transition hover:border-red-500/40 hover:text-white"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-white">{formatMoney(item.price)}</td>
                        <td className="px-4 py-4 text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.discount}
                            onChange={event => updateDiscount(item.id, parseInt(event.target.value, 10) || 0)}
                            className="w-24 rounded-lg border border-white/10 bg-[#202020] px-2 py-1.5 text-right text-sm text-white outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-white">
                          {formatMoney(item.price * item.qty - item.discount)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/15"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="rounded-[28px] border border-white/10 bg-[#181818] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
          <div className="rounded-t-[28px] bg-gradient-to-r from-red-700 to-red-500 px-5 py-5 text-white">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-red-100">Hóa đơn bán hàng</div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <div className="text-sm text-red-100">Mã phiếu</div>
                <div className="text-3xl font-black">PX{Date.now().toString().slice(-6)}</div>
              </div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Thanh toán</span>
            </div>
          </div>

          <div className="space-y-5 px-5 py-5">
            <div className="relative">
              <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500"></i>
              <input
                value={customerName}
                onChange={event => {
                  setCustomerName(event.target.value);
                  syncDraft(cartItems);
                }}
                placeholder="Tên khách hàng / đơn vị nhận..."
                className="w-full rounded-2xl border border-white/10 bg-[#202020] py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="space-y-4 border-y border-white/10 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Tổng tiền hàng ({cartItems.length} dòng)</span>
                <span className="font-bold text-white">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Giảm giá đơn</span>
                <input
                  type="number"
                  min="0"
                  value={extraDiscount}
                  onChange={event => {
                    setExtraDiscount(parseInt(event.target.value, 10) || 0);
                    syncDraft(cartItems);
                  }}
                  className="w-28 rounded-xl border border-white/10 bg-[#202020] px-3 py-2 text-right font-semibold text-white outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4">
              <div className="text-sm text-red-300">Cần thu / thanh toán</div>
              <div className="mt-2 text-3xl font-black text-white">{formatMoney(total)}đ</div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Tiền khách trả</span>
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={event => {
                    setPaidAmount(parseInt(event.target.value, 10) || 0);
                    syncDraft(cartItems);
                  }}
                  className="w-28 rounded-xl border border-white/10 bg-[#202020] px-3 py-2 text-right font-semibold text-white outline-none focus:border-red-500"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Tiền thừa trả khách</span>
                <span className={`font-bold ${change > 0 ? 'text-emerald-300' : 'text-gray-500'}`}>{formatMoney(change)}</span>
              </div>
            </div>

            <div>
              <textarea
                value={note}
                onChange={event => {
                  setNote(event.target.value);
                  syncDraft(cartItems);
                }}
                rows="4"
                placeholder="Ghi chú đơn hàng..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                onClick={clearCart}
                className="rounded-2xl border border-white/10 bg-[#202020] px-3 py-3 text-sm font-bold text-gray-200 transition hover:bg-[#2a2a2a]"
              >
                Trở về
              </button>
              <button
                onClick={saveDraft}
                className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/15"
              >
                Lưu tạm
              </button>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="rounded-2xl bg-red-600 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {checkoutLoading ? 'Đang thanh toán...' : 'Thanh toán'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default SellPage;
