function AuthLayout({ children }) {
  return (
    <section className="authShell">
      <aside className="authShowcase">
        <img
          className="authBannerImage"
          src="https://pbs.twimg.com/media/Fn6adGJXoBg8t-_.jpg"
          alt="Banner quang cao"
        />

        <div className="authShowcaseContent">
          <p className="showcaseBadge">He thong quan ly nhan su</p>
          <h2>Quan ly de dang. Van hanh gon. Dang nhap nhanh.</h2>
          <p className="showcaseText">
            Mot khong gian don gian de tao tai khoan, dang nhap va xac minh email
            nhanh chong.
          </p>
          <div className="showcaseFooter">
            <div className="showcaseSupport">Ho tro dang ky 1800 6162</div>
            <div className="showcaseSlogan">
              GET YOUR <span>YOU</span> ON
            </div>
          </div>
        </div>
      </aside>

      <div className="authPanel">
        <div className="authPanelInner">{children}</div>
      </div>
    </section>
  );
}

export default AuthLayout;
