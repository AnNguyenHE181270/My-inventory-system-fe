import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../shared/context/auth-context';
import { authRoutes, getDashboardPathByRole } from '../../../app/router/routes.constants';
import useFormFields from '../../../shared/hooks/use-form-fields';
import VerifyEmailForm from '../components/VerifyEmailForm';

function VerifyEmail() {
  const auth = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const registeredEmail = location.state?.email || '';
  const { form, changeHandler, setFormData, resetForm } = useFormFields({ email: registeredEmail, otp: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (registeredEmail) setFormData({ email: registeredEmail });
  }, [registeredEmail, setFormData]);

  const submitHandler = async event => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Xác minh email thất bại.');
      setSuccess(payload.message || 'Xác minh email thành công.');
      auth.login(payload.userId, payload.token, payload.expiration, payload.role);
      if (['staff', 'admin', 'manager'].includes(payload.role)) {
        navigate(getDashboardPathByRole(payload.role), { replace: true });
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-red-600">Kích hoạt tài khoản</span>
        <h1 className="text-3xl font-black text-gray-900 mt-1 mb-2 tracking-tight">Xác minh email</h1>
        <p className="text-gray-500 text-sm leading-relaxed">Nhập mã xác thực được gửi tới hộp thư của bạn.</p>
      </div>

      <VerifyEmailForm form={form} isLoading={isLoading} onChange={changeHandler} onSubmit={submitHandler} />

      <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
        <span>Muốn quay lại đăng nhập?</span>
        <Link to={authRoutes.login} className="text-red-600 font-semibold hover:underline">Về trang đăng nhập</Link>
      </div>

      {success && (
        <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">{success}</div>
      )}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{error}</div>
      )}
    </>
  );
}

export default VerifyEmail;
