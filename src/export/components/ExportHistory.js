import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../shared/context/auth-context';

function ExportHistory({ onBack }) {
  const auth = useContext(AuthContext);
  const [exports, setExports] = useState([]);
  const [selectedExport, setSelectedExport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyExports();
  }, []);

  const fetchMyExports = async () => {
    try {
      setLoading(true);
      // Dùng API mới: /api/export/user/me
      const response = await fetch('/api/export/user/me', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exports');
      }

      const data = await response.json();
      setExports(data.exports || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (exportId) => {
    try {
      const response = await fetch(`/api/export/${exportId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch export detail');
      }

      const data = await response.json();
      setSelectedExport(data.export);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="history-loading">
        <p>Đang tải lịch sử...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-error">
        <p>Lỗi: {error}</p>
        <button onClick={onBack} className="btn-back">Quay lại</button>
      </div>
    );
  }

  // Hiển thị chi tiết đơn hàng
  if (selectedExport) {
    return (
      <div className="export-detail-view">
        <div className="detail-header">
          <h2>Chi tiết đơn hàng</h2>
          <button onClick={() => setSelectedExport(null)} className="btn-close">
            ← Quay lại danh sách
          </button>
        </div>

        <div className="detail-card">
          <div className="detail-info-section">
            <div className="info-row">
              <span className="info-label">Mã đơn:</span>
              <span className="info-value">{selectedExport.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Ngày tạo:</span>
              <span className="info-value">
                {new Date(selectedExport.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Trạng thái:</span>
              <span className={`status-badge ${selectedExport.status}`}>
                {selectedExport.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
              </span>
            </div>
            {selectedExport.note && (
              <div className="info-row">
                <span className="info-label">Ghi chú:</span>
                <span className="info-value">{selectedExport.note}</span>
              </div>
            )}
          </div>

          <div className="detail-items-section">
            <h3>Danh sách sản phẩm</h3>
            <table className="detail-items-table">
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
                {selectedExport.items?.map((item, index) => (
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
                  <td>
                    <strong>{selectedExport.totalAmount?.toLocaleString()}đ</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị danh sách đơn hàng
  return (
    <div className="export-history-view">
      <div className="history-header">
        <h2>Lịch sử đơn hàng của tôi</h2>
        <button onClick={onBack} className="btn-back">
          ← Quay lại bán hàng
        </button>
      </div>

      {exports.length === 0 ? (
        <div className="empty-history">
          <p>Bạn chưa có đơn hàng nào</p>
          <button onClick={onBack} className="btn-primary">
            Bắt đầu bán hàng
          </button>
        </div>
      ) : (
        <div className="history-content">
          <div className="history-stats">
            <div className="stat-card">
              <div className="stat-number">{exports.length}</div>
              <div className="stat-label">Tổng đơn hàng</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {exports.filter(e => e.status === 'completed').length}
              </div>
              <div className="stat-label">Hoàn thành</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {exports
                  .filter(e => e.status === 'completed')
                  .reduce((sum, e) => sum + e.totalAmount, 0)
                  .toLocaleString()}đ
              </div>
              <div className="stat-label">Tổng doanh thu</div>
            </div>
          </div>

          <div className="history-list">
            <table className="history-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã đơn</th>
                  <th>Ngày tạo</th>
                  <th>Số mặt hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {exports.map((exp, index) => (
                  <tr key={exp.id}>
                    <td>{index + 1}</td>
                    <td className="order-code">{exp.id.slice(-8)}</td>
                    <td>{new Date(exp.createdAt).toLocaleString('vi-VN')}</td>
                    <td>{exp.items?.length || 0}</td>
                    <td className="amount">{exp.totalAmount?.toLocaleString()}đ</td>
                    <td>
                      <span className={`status-badge ${exp.status}`}>
                        {exp.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewDetail(exp.id)}
                        className="btn-view"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportHistory;
