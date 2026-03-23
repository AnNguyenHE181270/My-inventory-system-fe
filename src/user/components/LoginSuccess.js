import { Link } from 'react-router-dom';
import { dashboardRoutes } from '../../routes/dashboard.route';

function LoginSuccess({ userId, token, onLogout }) {
  return (
    <section className="authPanelInner">
      <p className="eyebrow">Dang nhap thanh cong</p>
      <h1>Dang nhap thanh cong</h1>
      <p className="description">
        Ban da vao he thong thanh cong. Thong tin phien dang nhap hien tai duoc hien ben duoi.
      </p>

      <div className="result">
        <p>
          <strong>User ID:</strong> {userId}
        </p>
        <p>
          <strong>Token:</strong> {token}
        </p>
      </div>

      <div style={{ marginTop: '20px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Link to={dashboardRoutes.export} style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: '600'
        }}>
          Quản lý xuất kho
        </Link>
        
        <Link to={dashboardRoutes.adminInventoryHistory} style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: '600'
        }}>
          🔐 Lịch sử xuất nhập kho (Admin)
        </Link>
      </div>

      <button type="button" className="logoutButton" onClick={onLogout}>
        Dang xuat
      </button>
    </section>
  );
}

export default LoginSuccess;
