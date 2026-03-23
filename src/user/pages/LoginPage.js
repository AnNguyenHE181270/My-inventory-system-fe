import { useContext, useState } from 'react';
import { AuthContext } from '../../shared/context/auth-context';
import { authRoutes } from '../../routes/auth.route';
import useFormFields from '../../shared/hooks/use-form-fields';
import AuthRouteLink from '../components/AuthRouteLink';
import LoginForm from '../components/LoginForm';
import LoginHeader from '../components/LoginHeader';

function LoginPage() {
  const auth = useContext(AuthContext);
  const { form, changeHandler } = useFormFields({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async event => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Dang nhap that bai.');
      }

      auth.login(payload.userId, payload.token, payload.expiration, payload.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoginHeader />
      <LoginForm
        form={form}
        isLoading={isLoading}
        onChange={changeHandler}
        onSubmit={submitHandler}
      />
      <div className="authMeta">
        <span>Quen mat khau?</span>
        <AuthRouteLink to={authRoutes.forgotPassword}>Lay lai mat khau</AuthRouteLink>
      </div>
      <div className="authMeta">
        <span>Chua co tai khoan?</span>
        <AuthRouteLink to={authRoutes.register}>Dang ky ngay</AuthRouteLink>
      </div>
      <div className="authMeta">
        <span>Da nhan ma xac thuc?</span>
        <AuthRouteLink to={authRoutes.verifyEmail}>Xac minh email</AuthRouteLink>
      </div>
      {error && <p className="error">{error}</p>}
    </>
  );
}

export default LoginPage;
