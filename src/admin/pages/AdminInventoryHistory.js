import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../shared/context/auth-context';
import './AdminInventoryHistory.css';

function AdminInventoryHistory() {
  const auth = useContext(AuthContext);
  const [imports, setImports] = useState([]);
  const [exports, setExports] = useState([]);
  const [combinedHistory, setCombinedHistory] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'import', 'export'
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalImports: 0,
    totalExports: 0,
    totalImportAmount: 0,
    totalExportAmount: 0
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [filter, imports, exports]);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      // Lấy lịch sử nhập kho
      const importsRes = await fetch('/api/import', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      // Lấy lịch sử xuất kho
      const exportsRes = await fetch('/api/export', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      if (!importsRes.ok || !exportsRes.ok) {
        throw new Error('Bạn không có quyền xem lịch sử này. Chỉ Admin mới được phép.');
      }

      const importsData = await importsRes.json();
      const exportsData = await exportsRes.json();

      const importsArray = importsData.imports || [];
      const exportsArray = exportsData.exports || [];

      setImports(importsArray);
      setExports(exportsArray);

      // Tính thống kê
      const totalImportAmount = importsArray.reduce(
        (sum, imp) => sum + (imp.quantity * imp.importPrice), 
        0
      );
      const totalExportAmount = exportsArray.reduce(
        (sum, exp) => sum + exp.totalAmount, 
        0
      );

      setStats({
        totalImports: importsArray.length,
        totalExports: exportsArray.length,
        totalImportAmount,
        totalExportAmount
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let combined = [];

    if (filter === 'all' || filter === 'import') {
      const importItems = imports.map(imp => ({
        ...imp,
        id: imp.id || imp._id,
        type: 'import',
        date: imp.createdAt,
        amount: imp.quantity * imp.importPrice,
        user: imp.importedBy
      }));
      combined = [...combined, ...importItems];
    }

    if (filter === 'all' || filter === 'export') {
      const exportItems = exports.map(exp => ({
        ...exp,
        id: exp.id || exp._id,
        type: 'export',
        date: exp.createdAt,
        amount: exp.totalAmount,
        user: exp.exportedBy
      }));
      combined = [...combined, ...exportItems];
    }

    // Sắp xếp theo ngày (mới nhất trước)
    combined.sort((a, b) => new Date(b.date) - new Date(a.date));
    setCombinedHistory(combined);
  };

  const handleViewDetail = async (item) => {
    try {
      const itemId = item.id || item._id;
      if (!itemId) {
        alert('Không tìm thấy ID của phiếu');
        return;
      }

      const endpoint = item.type === 'import' 
        ? `/api/import/${itemId}`
        : `/api/export/${itemId}`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const detailData = data[item.type];
        setSelectedItem({
          ...detailData,
          id: detailData.id || detailData._id,
          type: item.type
        });
      }
    } catch (err) {
      alert('Không thể tải chi tiết: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-inventory-history">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-inventory-history">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Không có quyền truy cập</h2>
          <p>{error}</p>
          <button onClick={() => window.location.href = '/'} className="btn-home">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị chi tiết
  if (selectedItem) {
    return (
      <div className="admin-inventory-history">
        <div className="page-header">
          <h1>Chi tiết {selectedItem.type === 'import' ? 'Phiếu nhập kho' : 'Phiếu xuất kho'}</h1>
          <button onClick={() => setSelectedItem(null)} className="btn-back">
            ← Quay lại danh sách
          </button>
        </div>

        <div className="detail-wrapper">
          <div className="detail-card">
            <div className="detail-header-info">
              <span className={`type-badge-large ${selectedItem.type}`}>
                {selectedItem.type === 'import' ? '📥 NHẬP KHO' : '📤 XUẤT KHO'}
              </span>
              <span className="detail-code">#{selectedItem.id ? selectedItem.id.slice(-12) : 'N/A'}</span>
            </div>

            <div className="detail-info-grid">
              <div className="info-item">
                <span className="info-label">Ngày tạo</span>
                <span className="info-value">
                  {new Date(selectedItem.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Người tạo</span>
                <span className="info-value">
                  {selectedItem.type === 'import' 
                    ? selectedItem.importedBy?.name 
                    : selectedItem.exportedBy?.name}
                </span>
              </div>
              {selectedItem.note && (
                <div className="info-item full-width">
                  <span className="info-label">Ghi chú</span>
                  <span className="info-value">{selectedItem.note}</span>
                </div>
              )}
            </div>

            {selectedItem.type === 'import' ? (
              // Chi tiết nhập kho
              <div className="detail-content">
                <h3>Thông tin nhập kho</h3>
                <div className="import-detail-grid">
                  <div className="detail-row">
                    <span className="row-label">Sản phẩm:</span>
                    <span className="row-value">{selectedItem.product?.name || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="row-label">Số lượng:</span>
                    <span className="row-value">
                      {selectedItem.quantity} {selectedItem.product?.unit?.name}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="row-label">Giá nhập:</span>
                    <span className="row-value">{selectedItem.importPrice?.toLocaleString()}đ</span>
                  </div>
                  <div className="detail-row highlight">
                    <span className="row-label">Tổng tiền:</span>
                    <span className="row-value total">
                      {(selectedItem.quantity * selectedItem.importPrice).toLocaleString()}đ
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="row-label">Ngày sản xuất:</span>
                    <span className="row-value">
                      {selectedItem.manufactureDate 
                        ? new Date(selectedItem.manufactureDate).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="row-label">Hạn sử dụng:</span>
                    <span className="row-value">
                      {new Date(selectedItem.expiryDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // Chi tiết xuất kho
              <div className="detail-content">
                <h3>Danh sách sản phẩm xuất</h3>
                <table className="export-items-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn vị</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItem.items?.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td>{item.price?.toLocaleString()}đ</td>
                        <td>{item.totalPrice?.toLocaleString()}đ</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="5" className="text-right">
                        <strong>Tổng cộng:</strong>
                      </td>
                      <td className="total-cell">
                        <strong>{selectedItem.totalAmount?.toLocaleString()}đ</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị danh sách
  return (
    <div className="admin-inventory-history">
      <div className="page-header">
        <div className="header-left">
          <h1>🔐 Lịch sử xuất nhập kho</h1>
          <span className="admin-badge">ADMIN ONLY</span>
        </div>
        <button onClick={() => window.location.href = '/'} className="btn-home">
          Trang chủ
        </button>
      </div>

      {/* Thống kê */}
      <div className="stats-grid">
        <div className="stat-card import-card">
          <div className="stat-icon">📥</div>
          <div className="stat-content">
            <div className="stat-label">Phiếu nhập kho</div>
            <div className="stat-number">{stats.totalImports}</div>
            <div className="stat-amount">
              Chi: {stats.totalImportAmount.toLocaleString()}đ
            </div>
          </div>
        </div>
        
        <div className="stat-card export-card">
          <div className="stat-icon">📤</div>
          <div className="stat-content">
            <div className="stat-label">Phiếu xuất kho</div>
            <div className="stat-number">{stats.totalExports}</div>
            <div className="stat-amount">
              Thu: {stats.totalExportAmount.toLocaleString()}đ
            </div>
          </div>
        </div>
        
        <div className="stat-card profit-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Lợi nhuận (ước tính)</div>
            <div className={`stat-number ${stats.totalExportAmount - stats.totalImportAmount >= 0 ? 'positive' : 'negative'}`}>
              {(stats.totalExportAmount - stats.totalImportAmount).toLocaleString()}đ
            </div>
            <div className="stat-amount">
              Tỷ suất: {stats.totalImportAmount > 0 
                ? ((stats.totalExportAmount - stats.totalImportAmount) / stats.totalImportAmount * 100).toFixed(1)
                : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="filter-bar">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span className="filter-icon">📋</span>
            Tất cả ({imports.length + exports.length})
          </button>
          <button
            className={`filter-btn ${filter === 'import' ? 'active' : ''}`}
            onClick={() => setFilter('import')}
          >
            <span className="filter-icon">📥</span>
            Nhập kho ({imports.length})
          </button>
          <button
            className={`filter-btn ${filter === 'export' ? 'active' : ''}`}
            onClick={() => setFilter('export')}
          >
            <span className="filter-icon">📤</span>
            Xuất kho ({exports.length})
          </button>
        </div>
      </div>

      {/* Danh sách lịch sử */}
      <div className="history-container">
        {combinedHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Chưa có lịch sử</h3>
            <p>
              Chưa có {filter === 'import' ? 'phiếu nhập' : filter === 'export' ? 'phiếu xuất' : 'hoạt động'} nào
            </p>
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Loại</th>
                <th>Mã phiếu</th>
                <th>Ngày tạo</th>
                <th>Người tạo</th>
                <th>Số tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {combinedHistory.map((item, index) => (
                <tr key={`${item.type}-${item.id}`} className="history-row">
                  <td>{index + 1}</td>
                  <td>
                    <span className={`type-badge ${item.type}`}>
                      {item.type === 'import' ? '📥 Nhập' : '📤 Xuất'}
                    </span>
                  </td>
                  <td className="code-cell">#{item.id ? item.id.slice(-8) : 'N/A'}</td>
                  <td>{new Date(item.date).toLocaleString('vi-VN')}</td>
                  <td>{item.user?.name || 'N/A'}</td>
                  <td className={`amount-cell ${item.type}`}>
                    <span className="amount-sign">{item.type === 'import' ? '-' : '+'}</span>
                    {item.amount.toLocaleString()}đ
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewDetail(item)}
                      className="btn-view"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminInventoryHistory;
