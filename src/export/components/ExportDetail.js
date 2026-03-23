import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../shared/context/auth-context';

function ExportDetail({ exportId, onClose }) {
  const auth = useContext(AuthContext);
  const [exportData, setExportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (exportId) {
      fetchExportDetail();
    }
  }, [exportId]);

  const fetchExportDetail = async () => {
    try {
      const response = await fetch(`/api/export/${exportId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch export detail');
      }

      const data = await response.json();
      setExportData(data.export);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!exportData) return null;

  return (
    <div className="export-detail">
      <div className="detail-header">
        <h2>Chi tiết đơn xuất kho</h2>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      <div className="detail-info">
        <div className="info-row">
          <strong>Mã đơn:</strong> {exportData.id}
        </div>
        <div className="info-row">
          <strong>Ngày xuất:</strong> {new Date(exportData.createdAt).toLocaleString('vi-VN')}
        </div>
        <div className="info-row">
          <strong>Người xuất:</strong> {exportData.exportedBy?.name || 'N/A'}
        </div>
        <div className="info-row">
          <strong>Trạng thái:</strong>{' '}
          <span className={`status ${exportData.status}`}>
            {exportData.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
          </span>
        </div>
        {exportData.note && (
          <div className="info-row">
            <strong>Ghi chú:</strong> {exportData.note}
          </div>
        )}
      </div>

      <div className="items-detail">
        <h3>Danh sách sản phẩm</h3>
        <table className="items-table">
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn vị</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {exportData.items?.map((item, index) => (
              <tr key={index}>
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
              <td colSpan="4" style={{ textAlign: 'right' }}>
                <strong>Tổng cộng:</strong>
              </td>
              <td>
                <strong>{exportData.totalAmount?.toLocaleString()}đ</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="detail-actions">
        <button onClick={onClose} className="back-btn">
          Quay lại
        </button>
      </div>
    </div>
  );
}

export default ExportDetail;
