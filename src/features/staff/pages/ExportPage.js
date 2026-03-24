import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../shared/context/auth-context';
import ExportHistory from '../components/export/ExportHistory';
import './ExportPage.css';

function ExportPage() {
  const auth = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    fetchProductsInStock();
  }, []);

  const fetchProductsInStock = async () => {
    try {
      setIsLoadingProducts(true);
      setError(null);
      
      console.log('Fetching products from API...');
      console.log('Token:', auth.token ? 'Present' : 'Missing');
      
      // Kiểm tra token trước
      if (!auth.token) {
        throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
      }
      
      // Lấy sản phẩm có trong kho (API mới cho Staff)
      const response = await fetch('/api/inventory/products-in-stock', {
        headers: { 
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        
        // Xử lý các lỗi cụ thể
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          throw new Error('Bạn không có quyền truy cập. Liên hệ quản trị viên.');
        } else if (response.status === 404) {
          throw new Error('API không tồn tại. Vui lòng kiểm tra backend.');
        } else if (response.status >= 500) {
          throw new Error('Lỗi server. Vui lòng thử lại sau.');
        }
        
        throw new Error(errorData.message || 'Không thể tải danh sách sản phẩm');
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      const productsData = data.products || [];
      console.log('Products count:', productsData.length);
      console.log('Products:', productsData);
      
      setProducts(productsData);
      
      // Tạo inventory map để tra cứu nhanh
      const invMap = productsData.map(p => ({
        product: { id: p.id || p._id, _id: p.id || p._id },
        totalQuantity: p.stock
      }));
      setInventory(invMap);
      
      if (productsData.length === 0) {
        console.warn('No products in stock!');
        setError('Không có sản phẩm nào trong kho. Liên hệ Manager để nhập hàng.');
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      setError(err.message || 'Đã xảy ra lỗi không xác định');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const getStock = (productId) => {
    // Nếu product đã có stock từ inventory
    const product = products.find(p => p.id === productId);
    if (product && product.stock !== undefined) {
      return product.stock;
    }
    
    // Fallback: tìm trong inventory
    const inv = inventory.find(i => i.product?.id === productId || i.product?._id === productId);
    return inv ? inv.totalQuantity : 0;
  };

  const handleSelectProduct = (product) => {
    const stock = getStock(product.id);
    if (stock <= 0) {
      alert('Sản phẩm hết hàng!');
      return;
    }
    setSelectedProduct(product);
    setQuantity(1);
    setSearchTerm('');
  };

  const handleAddToOrder = () => {
    if (!selectedProduct) {
      alert('Vui lòng chọn sản phẩm!');
      return;
    }

    const stock = getStock(selectedProduct.id);
    if (quantity > stock) {
      alert(`Chỉ còn ${stock} sản phẩm trong kho!`);
      return;
    }

    if (quantity <= 0) {
      alert('Số lượng phải lớn hơn 0!');
      return;
    }

    const existingItem = orderItems.find(item => item.product.id === selectedProduct.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > stock) {
        alert(`Chỉ còn ${stock} sản phẩm trong kho!`);
        return;
      }
      setOrderItems(orderItems.map(item =>
        item.product.id === selectedProduct.id
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        product: selectedProduct,
        quantity: quantity,
        price: selectedProduct.price
      }]);
    }

    setSelectedProduct(null);
    setQuantity(1);
  };

  const updateQuantity = (productId, newQuantity) => {
    const stock = getStock(productId);
    
    if (newQuantity > stock) {
      alert(`Chỉ còn ${stock} sản phẩm trong kho!`);
      return;
    }

    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setOrderItems(orderItems.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeItem = (productId) => {
    setOrderItems(orderItems.filter(item => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (orderItems.length === 0) {
      alert('Vui lòng chọn sản phẩm!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          items: orderItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
          })),
          note: ''
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Tạo đơn xuất thất bại');
      }

      alert('Tạo đơn xuất thành công!');
      setOrderItems([]);
      fetchProductsInStock(); // Refresh products and stock
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearOrder = () => {
    if (orderItems.length > 0 && window.confirm('Xóa tất cả sản phẩm?')) {
      setOrderItems([]);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (showHistory) {
    return <ExportHistory onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="export-page-single">
      <div className="page-header">
        <h1>Bán hàng - Xuất kho</h1>
        <div className="header-actions">
          <button className="header-btn" onClick={() => setShowHistory(true)}>
            Lịch sử
          </button>
          <button className="header-btn" onClick={() => window.location.href = '/'}>
            Trang chủ
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => fetchProductsInStock()} className="retry-btn">
            Thử lại
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoadingProducts ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-products">
          <div className="empty-icon">📦</div>
          <h3>Chưa có sản phẩm trong kho</h3>
          <p>Hiện tại chưa có sản phẩm nào có sẵn để bán.</p>
          <p className="hint">Liên hệ Manager để nhập hàng vào kho.</p>
          <button onClick={() => fetchProductsInStock()} className="refresh-btn">
            🔄 Làm mới
          </button>
        </div>
      ) : (
        <div className="export-content">
        {/* Search and Select Product */}
        <div className="product-search-section">
          <h2>Tìm và chọn sản phẩm</h2>
          
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {searchTerm && filteredProducts.length > 0 && (
            <div className="search-results">
              {filteredProducts.slice(0, 10).map(product => {
                const stock = getStock(product.id);
                return (
                  <div
                    key={product.id}
                    className={`search-result-item ${stock <= 0 ? 'out-of-stock' : ''}`}
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="result-info">
                      <div className="result-name">{product.name}</div>
                      <div className="result-details">
                        {product.price.toLocaleString()}đ | {product.unit?.name || 'N/A'} | Tồn: {stock}
                      </div>
                    </div>
                    {stock <= 0 && <span className="out-badge">Hết hàng</span>}
                  </div>
                );
              })}
            </div>
          )}

          {selectedProduct && (
            <div className="selected-product">
              <h3>Sản phẩm đã chọn:</h3>
              <div className="selected-product-card">
                <div className="selected-info">
                  <div className="selected-name">{selectedProduct.name}</div>
                  <div className="selected-details">
                    Giá: {selectedProduct.price.toLocaleString()}đ | 
                    Đơn vị: {selectedProduct.unit?.name || 'N/A'} | 
                    Tồn kho: {getStock(selectedProduct.id)}
                  </div>
                </div>
                
                <div className="quantity-input-section">
                  <label>Số lượng:</label>
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="qty-input-large"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max={getStock(selectedProduct.id)}
                    />
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity(Math.min(getStock(selectedProduct.id), quantity + 1))}
                    >
                      +
                    </button>
                  </div>
                  <div className="subtotal">
                    Thành tiền: {(selectedProduct.price * quantity).toLocaleString()}đ
                  </div>
                </div>

                <div className="add-actions">
                  <button className="btn-cancel" onClick={() => setSelectedProduct(null)}>
                    Hủy
                  </button>
                  <button className="btn-add" onClick={handleAddToOrder}>
                    Thêm vào đơn
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="order-section">
          <h2>Đơn hàng ({orderItems.length} sản phẩm)</h2>
          
          {orderItems.length === 0 ? (
            <div className="empty-order-message">
              <p>Chưa có sản phẩm nào trong đơn hàng</p>
              <p className="hint">Tìm kiếm và chọn sản phẩm ở trên để thêm vào đơn</p>
            </div>
          ) : (
            <>
              <div className="order-items-list">
                {orderItems.map((item, index) => (
                  <div key={item.product.id} className="order-item-card">
                    <div className="item-number">{index + 1}</div>
                    <div className="item-info">
                      <div className="item-name">{item.product.name}</div>
                      <div className="item-details">
                        {item.price.toLocaleString()}đ × {item.quantity} = {(item.price * item.quantity).toLocaleString()}đ
                      </div>
                    </div>
                    <div className="item-quantity-controls">
                      <button
                        className="qty-btn-small"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="qty-input-small"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                        min="1"
                      />
                      <button
                        className="qty-btn-small"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-btn-small"
                      onClick={() => removeItem(item.product.id)}
                      title="Xóa"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <div className="total-row">
                  <span>Tổng cộng:</span>
                  <span className="total-amount">{calculateTotal().toLocaleString()}đ</span>
                </div>
              </div>

              <div className="order-actions-bottom">
                <button
                  className="btn-clear"
                  onClick={clearOrder}
                >
                  Hủy đơn
                </button>
                <button
                  className="btn-checkout"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Thanh toán'}
                </button>
              </div>
            </>
          )}
        </div>
        </div>
      )}
    </div>
  );
}

export default ExportPage;
