import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authRoutes } from '../../routes/auth.route';
import useFormFields from '../../shared/hooks/use-form-fields';
import AuthRouteLink from '../components/AuthRouteLink';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

function ForgotPassword() {
  const navigate = useNavigate();
  const { form, changeHandler } = useFormFields({
    email: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async event => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Khong gui duoc ma OTP.');
      }

      setSuccessMessage(payload.message || 'Da gui ma OTP.');
      navigate(authRoutes.resetPassword, {
        state: {
          email: payload.email || form.email
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <p className="eyebrow">Quen mat khau</p>
      <h1>Lay lai mat khau</h1>
      <p className="description">
        Nhap email de nhan ma OTP va tiep tuc dat lai mat khau.
      </p>

      <ForgotPasswordForm
        form={form}
        isLoading={isLoading}
        onChange={changeHandler}
        onSubmit={submitHandler}
      />

      <div className="authMeta">
        <span>Da nho mat khau?</span>
        <AuthRouteLink to={authRoutes.login}>Ve trang dang nhap</AuthRouteLink>
      </div>

      {successMessage && <p className="success">{successMessage}</p>}
      {error && <p className="error">{error}</p>}
    </>
  );
}

export default ForgotPassword;
