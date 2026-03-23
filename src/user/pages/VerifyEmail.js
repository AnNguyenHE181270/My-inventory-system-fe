import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';
import { authRoutes } from '../../routes/auth.route';
import useFormFields from '../../shared/hooks/use-form-fields';
import AuthRouteLink from '../components/AuthRouteLink';
import VerifyEmailForm from '../components/VerifyEmailForm';

function VerifyEmail() {
  const auth = useContext(AuthContext);
  const location = useLocation();
  const registeredEmail = location.state?.email || '';
  const { form, changeHandler, setFormData, resetForm } = useFormFields({
    email: registeredEmail,
    otp: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (registeredEmail) {
      setFormData({ email: registeredEmail });
    }
  }, [registeredEmail, setFormData]);

  const submitHandler = async event => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Xac minh email that bai.');
      }

      setSuccessMessage(payload.message || 'Xac minh email thanh cong.');
      auth.login(payload.userId, payload.token, payload.expiration, payload.role);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <p className="eyebrow">Kich hoat tai khoan</p>
      <h1>Xac minh email</h1>
      <p className="description">
        Nhap email va ma xac thuc duoc gui toi hop thu cua ban de kich hoat tai khoan.
      </p>

      <VerifyEmailForm
        form={form}
        isLoading={isLoading}
        onChange={changeHandler}
        onSubmit={submitHandler}
      />

      <div className="authMeta">
        <span>Muoc quay lai dang nhap?</span>
        <AuthRouteLink to={authRoutes.login}>Ve trang dang nhap</AuthRouteLink>
      </div>

      {successMessage && <p className="success">{successMessage}</p>}
      {error && <p className="error">{error}</p>}
    </>
  );
}

export default VerifyEmail;
