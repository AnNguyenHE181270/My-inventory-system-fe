import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../shared/context/auth-context';
import { authRoutes, getDashboardPathByRole } from '../../../app/router/routes.constants';
import useFormFields from '../../../shared/hooks/use-form-fields';
import LoginForm from '../components/LoginForm';
import LoginHeader from '../components/LoginHeader';

const getStoredUserRole = () => {
  try {
    const raw = localStorage.getItem('userData');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.userRole || null;
  } catch (error) {
    return null;
  }
};

function LoginPage() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { form, changeHandler } = useFormFields({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedRole = getStoredUserRole();
    const activeRole = auth.role || storedRole;
    if ((auth.isLoggedIn || storedRole) && ['staff', 'admin', 'manager'].includes(activeRole)) {
      navigate(getDashboardPathByRole(activeRole), { replace: true });
    }
  }, [auth.isLoggedIn, auth.role, navigate]);

  const submitHandler = async event => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Đăng nhập thất bại.');
      auth.login(payload.userId, payload.token, payload.expiration, payload.role);
      if (['staff', 'admin', 'manager'].includes(payload.role)) {
        navigate(getDashboardPathByRole(payload.role), { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoginHeader />
      <LoginForm form={form} isLoading={isLoading} onChange={changeHandler} onSubmit={submitHandler} />

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <i className="fa-solid fa-circle-exclamation mt-0.5 text-red-600"></i>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="mt-6 space-y-3 border-t border-gray-200 pt-6">
        {[
          { text: 'Quên mật khẩu?', linkText: 'Lấy lại mật khẩu', to: authRoutes.forgotPassword, icon: 'fa-key' },
          { text: 'Chưa có tài khoản?', linkText: 'Đăng ký ngay', to: authRoutes.register, icon: 'fa-user-plus' },
          { text: 'Đã nhận mã xác thực?', linkText: 'Xác minh email', to: authRoutes.verifyEmail, icon: 'fa-envelope-circle-check' },
        ].map(item => (
          <div key={item.to} className="flex items-center justify-center gap-1.5 text-sm text-gray-600">
            <i className={`fa-solid ${item.icon} text-xs text-gray-400`}></i>
            <span>{item.text}</span>
            <Link to={item.to} className="font-semibold text-red-600 transition hover:text-red-700 hover:underline">
              {item.linkText}
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

export default LoginPage;
