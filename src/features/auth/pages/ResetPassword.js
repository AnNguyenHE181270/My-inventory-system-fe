import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authRoutes } from '../../../app/router/routes.constants';
import useFormFields from '../../../shared/hooks/use-form-fields';
import ResetPasswordForm from '../components/ResetPasswordForm';

function ResetPassword() {
  const location = useLocation();
  const rememberedEmail = location.state?.email || '';
  const { form, changeHandler } = useFormFields({ email: rememberedEmail, otp: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async event => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Không đổi được mật khẩu.');
      setSuccess(payload.message || 'Đổi mật khẩu thành công.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-red-600">Đặt lại mật khẩu</span>
        <h1 className="text-3xl font-black text-gray-900 mt-1 mb-2 tracking-tight">Đổi mật khẩu mới</h1>
        <p className="text-gray-500 text-sm leading-relaxed">Nhập mã OTP và mật khẩu mới của bạn.</p>
      </div>

      <ResetPasswordForm form={form} isLoading={isLoading} onChange={changeHandler} onSubmit={submitHandler} />

      <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
        <span>Muốn quay lại?</span>
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

export default ResetPassword;
