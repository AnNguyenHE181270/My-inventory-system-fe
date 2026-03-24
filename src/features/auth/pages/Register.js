import { Link } from 'react-router-dom';
import { authRoutes } from '../../../app/router/routes.constants';

function Register() {
  return (
    <>
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30">
          <i className="fa-solid fa-user-shield text-2xl text-white"></i>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Tài khoản do admin tạo</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Hệ thống này không cho đăng ký công khai. Admin sẽ tạo tài khoản nội bộ cho nhân viên hoặc quản lý,
          sau đó bạn xác minh Gmail bằng OTP có hiệu lực trong 3 giờ.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
        <div className="font-semibold text-gray-900">Quy trình sử dụng</div>
        <div className="mt-3">1. Admin tạo tài khoản nội bộ trong màn quản lý người dùng.</div>
        <div>2. Hệ thống gửi OTP về email công ty của bạn.</div>
        <div>3. Bạn mở trang xác minh email và nhập OTP trong vòng 3 giờ.</div>
        <div>4. Sau khi xác minh xong, bạn đăng nhập và sử dụng hệ thống.</div>
      </div>

      <div className="mt-6 space-y-3 border-t border-gray-200 pt-6 text-sm text-gray-600">
        <div className="flex items-center justify-center gap-1.5">
          <i className="fa-solid fa-envelope-circle-check text-xs text-gray-400"></i>
          <span>Đã nhận OTP?</span>
          <Link to={authRoutes.verifyEmail} className="font-semibold text-red-600 transition hover:text-red-700 hover:underline">
            Xác minh email
          </Link>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <i className="fa-solid fa-right-to-bracket text-xs text-gray-400"></i>
          <span>Đã kích hoạt tài khoản?</span>
          <Link to={authRoutes.login} className="font-semibold text-red-600 transition hover:text-red-700 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </>
  );
}

export default Register;
