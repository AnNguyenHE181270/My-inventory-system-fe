import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authRoutes } from '../../../app/router/routes.constants';
import useFormFields from '../../../shared/hooks/use-form-fields';
import RegisterForm from '../components/RegisterForm';

function Register() {
  const navigate = useNavigate();
  const { form, changeHandler, resetForm } = useFormFields({ name: '', email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async event => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Đăng ký thất bại.');
      resetForm();
      navigate(authRoutes.verifyEmail, { state: { email: payload.email || form.email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30">
          <i className="fa-solid fa-user-plus text-2xl text-white"></i>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Tạo tài khoản mới</h1>
        <p className="mt-2 text-sm text-gray-500">Điền thông tin để đăng ký</p>
      </div>

      <RegisterForm form={form} isLoading={isLoading} onChange={changeHandler} onSubmit={submitHandler} />

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <i className="fa-solid fa-circle-exclamation mt-0.5 text-red-600"></i>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-gray-200 pt-6 text-sm text-gray-600">
        <i className="fa-solid fa-right-to-bracket text-xs text-gray-400"></i>
        <span>Đã có tài khoản?</span>
        <Link to={authRoutes.login} className="font-semibold text-red-600 transition hover:text-red-700 hover:underline">
          Đăng nhập
        </Link>
      </div>
    </>
  );
}

export default Register;
