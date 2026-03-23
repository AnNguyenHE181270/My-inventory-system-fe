import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { authRoutes } from '../../routes/auth.route';
import useFormFields from '../../shared/hooks/use-form-fields';
import AuthRouteLink from '../components/AuthRouteLink';
import ResetPasswordForm from '../components/ResetPasswordForm';

function ResetPassword() {
  const location = useLocation();
  const rememberedEmail = location.state?.email || '';
  const { form, changeHandler } = useFormFields({
    email: rememberedEmail,
    otp: '',
    newPassword: ''
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
      const response = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Khong doi duoc mat khau.');
      }

      setSuccessMessage(payload.message || 'Doi mat khau thanh cong.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <p className="eyebrow">Dat lai mat khau</p>
      <h1>Doi mat khau moi</h1>
      <p className="description">
        Nhap email, ma OTP va mat khau moi de hoan tat qua trinh dat lai mat khau.
      </p>

      <ResetPasswordForm
        form={form}
        isLoading={isLoading}
        onChange={changeHandler}
        onSubmit={submitHandler}
      />

      <div className="authMeta">
        <span>Muon quay lai?</span>
        <AuthRouteLink to={authRoutes.login}>Ve trang dang nhap</AuthRouteLink>
      </div>

      {successMessage && <p className="success">{successMessage}</p>}
      {error && <p className="error">{error}</p>}
    </>
  );
}

export default ResetPassword;
