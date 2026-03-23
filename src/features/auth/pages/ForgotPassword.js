import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authRoutes } from '../../../app/router/routes.constants';
import useFormFields from '../../../shared/hooks/use-form-fields';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

function ForgotPassword() {
  const navigate = useNavigate();
  const { form, changeHandler } = useFormFields({ email: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async event => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Không gửi được mã OTP.');
      navigate(authRoutes.resetPassword, { state: { email: payload.email || form.email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-red-600">Quên mật khẩu</span>
        <h1 className="text-3xl font-black text-gray-900 mt-1 mb-2 tracking-tight">Lấy lại mật khẩu</h1>
        <p className="text-gray-500 text-sm leading-relaxed">Nhập email để nhận mã OTP đặt lại mật khẩu.</p>
      </div>

      <ForgotPasswordForm form={form} isLoading={isLoading} onChange={changeHandler} onSubmit={submitHandler} />

      <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
        <span>Đã nhớ mật khẩu?</span>
        <Link to={authRoutes.login} className="text-red-600 font-semibold hover:underline">Về trang đăng nhập</Link>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{error}</div>
      )}
    </>
  );
}

export default ForgotPassword;
