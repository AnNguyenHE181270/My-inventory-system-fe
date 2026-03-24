import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../../shared/context/auth-context';

function ExportForm({ onSuccess }) {
  const auth = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([{ productId: '', quantity: 1 }]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Sử dụng API products-in-stock để chỉ lấy sản phẩm có trong kho
      const response = await fetch('/api/inventory/products-in-stock', {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const addItem = () => {
    setSelectedItems([...selectedItems, { productId: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    const newItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...selectedItems];
    newItems[index][field] = value;
    setSelectedItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validItems = selectedItems.filter(item => item.productId && item.quantity > 0);

    if (validItems.length === 0) {
      setError('Vui lòng chọn ít nhất một sản phẩm');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          items: validItems,
          note
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Tạo đơn xuất thất bại');
      }

      alert('Tạo đơn xuất thành công!');
      setSelectedItems([{ productId: '', quantity: 1 }]);
      setNote('');
      if (onSuccess) onSuccess(data.export);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (product && item.quantity > 0) {
        return total + (product.price * item.quantity);
      }
      return total;
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="export-form">
      <h2>Tạo đơn xuất kho (Bán hàng)</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="items-section">
        <h3>Danh sách sản phẩm</h3>
        {selectedItems.map((item, index) => {
          const product = products.find(p => p.id === item.productId);
          return (
            <div key={index} className="item-row">
              <select
                value={item.productId}
                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                required
              >
                <option value="">-- Chọn sản phẩm --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.price.toLocaleString()}đ ({p.unit?.name || ''}) - Tồn: {p.stock || 0}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                placeholder="Số lượng"
                required
              />

              {product && (
                <span className="item-total">
                  Thành tiền: {(product.price * item.quantity).toLocaleString()}đ
                </span>
              )}

              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={selectedItems.length === 1}
                className="remove-btn"
              >
                Xóa
              </button>
            </div>
          );
        })}

        <button type="button" onClick={addItem} className="add-item-btn">
          + Thêm sản phẩm
        </button>
      </div>

      <div className="total-section">
        <h3>Tổng tiền: {calculateTotal().toLocaleString()}đ</h3>
      </div>

      <div className="form-group">
        <label>Ghi chú</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú (không bắt buộc)"
          rows="3"
        />
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Đang xử lý...' : 'Tạo đơn xuất'}
      </button>
    </form>
  );
}

export default ExportForm;
