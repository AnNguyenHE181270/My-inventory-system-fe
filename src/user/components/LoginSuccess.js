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

      <button type="button" className="logoutButton" onClick={onLogout}>
        Dang xuat
      </button>
    </section>
  );
}

export default LoginSuccess;
