import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../shared/context/auth-context';

function ExportList({ onSelectExport }) {
  const auth = useContext(AuthContext);
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExports();
  }, []);

  const fetchExports = async () => {
    try {
      const response = await fetch('/api/export', {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
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

  const handleCancelExport = async (exportId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn xuất này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/export/${exportId}/cancel`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Hủy đơn thất bại');
      }

      alert('Hủy đơn thành công!');
      fetchExports();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="export-list">
      <h2>Danh sách đơn xuất kho</h2>

      {exports.length === 0 ? (
        <p>Chưa có đơn xuất nào</p>
      ) : (
        <table className="export-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Ngày xuất</th>
              <th>Người xuất</th>
              <th>Số mặt hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {exports.map(exp => (
              <tr key={exp.id}>
                <td>{exp.id.slice(-8)}</td>
                <td>{new Date(exp.createdAt).toLocaleString('vi-VN')}</td>
                <td>{exp.exportedBy?.name || 'N/A'}</td>
                <td>{exp.items?.length || 0}</td>
                <td>{exp.totalAmount?.toLocaleString()}đ</td>
                <td>
                  <span className={`status ${exp.status}`}>
                    {exp.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => onSelectExport && onSelectExport(exp)}
                    className="view-btn"
                  >
                    Xem
                  </button>
                  {exp.status === 'completed' && (
                    <button
                      onClick={() => handleCancelExport(exp.id)}
                      className="cancel-btn"
                    >
                      Hủy
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ExportList;
