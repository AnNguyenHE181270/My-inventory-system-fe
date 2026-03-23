function LoginSuccess({ userId, token, onLogout }) {
  return (
    <div>
      <p className="eyebrow">Đăng nhập thành công</p>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">Đăng nhập thành công</h1>
      <p className="description">
        Bạn đã vào hệ thống thành công. Thông tin phiên đăng nhập hiện tại được hiển thị bên dưới.
      </p>
      <div className="result">
        <p><strong>User ID:</strong> {userId}</p>
        <p><strong>Token:</strong> {token}</p>
      </div>
      <button type="button" className="logoutButton" onClick={onLogout}>
        Đăng xuất
      </button>
    </div>
  );
}

export default LoginSuccess;
